<script lang="ts">
import Icon from "@iconify/svelte";
import { onMount } from "svelte";
import {
	KNOWLEDGE_POINTS,
	OUTPUT_TASKS,
	PRACTICE_TASKS,
} from "@/data/interview-task-pool";
import {
	INTERVIEW_COHORT,
	INTERVIEW_PLAN,
	INTERVIEW_WEEKS,
} from "@/data/interview-plan";
import {
	INTERVIEW_STORAGE_KEY,
	abandonActiveRun,
	buildCatalog,
	buildSessionCandidates,
	completeCurrentItem,
	createEmptyLearningState,
	createLearningRun,
	ensureDailyLedger,
	getCoreCompletion,
	getCoverage,
	getCurrentPlan,
	getCurrentScheduledItem,
	getDailyMetrics,
	getLearningClock,
	getWeakItems,
	normalizeLearningState,
	type ActivityKind,
	type DailyMetric,
	type LearningState,
	type SelfScore,
	type TimeChoice,
} from "@utils/interview-scheduler";

const catalog = buildCatalog(KNOWLEDGE_POINTS, PRACTICE_TASKS, OUTPUT_TASKS);
const itemById = new Map(catalog.map((item) => [item.id, item]));

const activityLabels: Record<ActivityKind, string> = {
	review: "到期复习",
	scan: "快速扫描",
	topic: "重点专题",
	interview: "面试训练",
	code: "手写代码",
	project: "项目表达",
	algorithm: "算法",
	"system-design": "系统设计",
	mock: "模拟面试",
};

const scoreOptions: Array<{
	score: SelfScore;
	label: string;
	detail: string;
}> = [
	{ score: 0, label: "不会", detail: "无法作答" },
	{ score: 2, label: "有印象", detail: "需要明显提示" },
	{ score: 4, label: "能讲清", detail: "机制与取舍正确" },
	{ score: 5, label: "能扛追问", detail: "能处理边界和反例" },
];

const timeChoices: Array<{ value: TimeChoice; label: string; hint: string }> = [
	{ value: 10, label: "10 分钟", hint: "复习 + 扫描" },
	{ value: 20, label: "20 分钟", hint: "短题组合" },
	{ value: 30, label: "30 分钟", hint: "含重点专题" },
	{ value: 60, label: "60 分钟", hint: "拆成两组" },
	{ value: "unlimited", label: "不限", hint: "每组约 25 分钟" },
];

let ready = false;
let storageAvailable = true;
let state: LearningState = createEmptyLearningState();
let clock = getLearningClock();
let showAnswer = false;
let message = "";
let confirmation: "abandon" | "reset" | null = null;
let importInput: HTMLInputElement;

$: plan = getCurrentPlan(clock);
$: ledger = state.days[clock.learningDate];
$: metrics = getDailyMetrics(state, clock, catalog);
$: coverage = getCoverage(state, catalog);
$: weakItems = getWeakItems(state, catalog);
$: coreCompletion = getCoreCompletion(state, clock, catalog);
$: currentScheduled = getCurrentScheduledItem(state);
$: currentItem = currentScheduled
	? itemById.get(currentScheduled.itemId)
	: undefined;
$: currentSession = state.activeRun
	? state.activeRun.sessions[state.activeRun.sessionIndex]
	: undefined;
$: runItemCount = state.activeRun
	? state.activeRun.sessions.reduce(
			(total, session) => total + session.items.length,
			0,
		)
	: 0;
$: completedRunItems = state.activeRun
	? state.activeRun.sessions
			.slice(0, state.activeRun.sessionIndex)
			.reduce((total, session) => total + session.items.length, 0) +
		state.activeRun.itemIndex
	: 0;
$: recommendedCandidate =
	ready && !state.activeRun
		? buildSessionCandidates(state, clock, catalog)[0]
		: undefined;
$: recommendedItem = recommendedCandidate
	? itemById.get(recommendedCandidate.itemId)
	: undefined;
$: recommendedTimeChoice = recommendedCandidate
	? recommendedCandidate.estimatedMinutes <= 10
		? 10
		: recommendedCandidate.estimatedMinutes <= 20
			? 20
			: recommendedCandidate.estimatedMinutes <= 30
				? 30
				: 60
	: 20;
$: todayPool = catalog.filter((item) => item.day === clock.planDay);
$: metricTargetTotal = metrics.reduce(
	(total, metric) => total + metric.target,
	0,
);
$: corePercent = metricTargetTotal
	? Math.round(
			(metrics.reduce(
				(total, metric) => total + Math.min(metric.completed, metric.target),
				0,
			) /
				metricTargetTotal) *
				100,
		)
	: coreCompletion.complete
		? 100
		: 0;
$: remainingMinutes = estimateRemainingMinutes(metrics);
$: domainProgress = Array.from(new Set(catalog.map((item) => item.domain))).map(
	(domain) => {
		const items = catalog.filter((item) => item.domain === domain);
		const attempted = items.filter(
			(item) => (state.progress[item.id]?.attempts ?? 0) > 0,
		);
		return {
			domain,
			attempted: attempted.length,
			total: items.length,
			mastery: attempted.length
				? Math.round(
						attempted.reduce(
							(total, item) => total + (state.progress[item.id]?.mastery ?? 0),
							0,
						) / attempted.length,
					)
				: 0,
		};
	},
);

function estimateRemainingMinutes(currentMetrics: DailyMetric[]) {
	const minutesPerActivity: Record<ActivityKind, number> = {
		review: 1,
		scan: 1,
		topic: 8,
		interview: 2,
		code: 15,
		project: 12,
		algorithm: 12,
		"system-design": 18,
		mock: 25,
	};
	return currentMetrics.reduce(
		(total, metric) =>
			total +
			Math.max(0, metric.target - metric.completed) *
				minutesPerActivity[metric.activity],
		0,
	);
}

function saveState(nextState = state) {
	state = nextState;
	try {
		localStorage.setItem(INTERVIEW_STORAGE_KEY, JSON.stringify(nextState));
		storageAvailable = true;
	} catch {
		storageAvailable = false;
	}
}

function refreshClock() {
	const nextClock = getLearningClock();
	if (nextClock.learningDate !== clock.learningDate) {
		clock = nextClock;
		saveState(ensureDailyLedger(state, clock, catalog));
	}
}

function startLearning(choice: TimeChoice) {
	message = "";
	if (clock.phase === "before") {
		message = `学习计划将在 ${INTERVIEW_COHORT.startDate} 04:00 按本地时间开始。`;
		return;
	}
	const result = createLearningRun(state, clock, catalog, choice);
	saveState(result.state);
	showAnswer = false;
	if (!result.run) message = "当前没有可装入这段时间的任务，可以稍后再试。";
}

function scoreCurrent(score: SelfScore) {
	if (!showAnswer) return;
	const completedLearningDate = state.activeRun?.learningDate;
	const result = completeCurrentItem(state, score);
	saveState(result.state);
	showAnswer = false;
	if (result.runCompleted) {
		message =
			completedLearningDate !== clock.learningDate
				? "跨日 Session 已完成，进度已记入开始学习时所属的学习日。"
				: getCoreCompletion(result.state, clock, catalog).complete
					? "本轮完成。今日核心目标已经达成，还可以继续加练。"
					: "本轮完成。系统会根据新掌握度重新安排下一组。";
	} else if (result.sessionCompleted) {
		message = "这一组完成，下一组已准备好。";
	}
}

function abandonRun() {
	confirmation = "abandon";
}

function exportProgress() {
	const blob = new Blob([JSON.stringify(state, null, 2)], {
		type: "application/json",
	});
	const link = document.createElement("a");
	link.href = URL.createObjectURL(blob);
	link.download = `firsthand-interview-progress-${clock.learningDate}.json`;
	link.click();
	URL.revokeObjectURL(link.href);
}

async function importProgress(event: Event) {
	const input = event.currentTarget as HTMLInputElement;
	const file = input.files?.[0];
	if (!file) return;
	try {
		const parsed = JSON.parse(await file.text());
		const imported = ensureDailyLedger(
			normalizeLearningState(parsed, catalog),
			clock,
			catalog,
		);
		saveState(imported);
		message = "进度已导入。";
	} catch {
		message = "无法读取这份进度文件，请确认它来自本学习站。";
	}
	input.value = "";
}

function resetProgress() {
	confirmation = "reset";
}

function confirmAction() {
	if (confirmation === "abandon") {
		saveState(abandonActiveRun(state));
		showAnswer = false;
		message = "当前 Session 已结束，稍后可以按新的可用时间重新组合。";
	} else if (confirmation === "reset") {
		const reset = ensureDailyLedger(createEmptyLearningState(), clock, catalog);
		saveState(reset);
		showAnswer = false;
		message = "本地学习进度已清空。";
	}
	confirmation = null;
}

function formatMinutes(value: number) {
	if (value < 60) return `${value} 分钟`;
	const hours = Math.floor(value / 60);
	const minutes = value % 60;
	return minutes ? `${hours} 小时 ${minutes} 分` : `${hours} 小时`;
}

function formatSessionChoice(choice: TimeChoice) {
	return choice === "unlimited" ? "不限时" : `${choice} 分钟`;
}

onMount(() => {
	clock = getLearningClock();
	try {
		const raw = localStorage.getItem(INTERVIEW_STORAGE_KEY);
		const parsed = raw ? JSON.parse(raw) : undefined;
		state = ensureDailyLedger(
			normalizeLearningState(parsed, catalog),
			clock,
			catalog,
		);
		localStorage.setItem(INTERVIEW_STORAGE_KEY, JSON.stringify(state));
	} catch {
		storageAvailable = false;
		state = ensureDailyLedger(createEmptyLearningState(), clock, catalog);
	}
	ready = true;

	const handleStorage = (event: StorageEvent) => {
		if (event.key !== INTERVIEW_STORAGE_KEY || !event.newValue) return;
		try {
			state = ensureDailyLedger(
				normalizeLearningState(JSON.parse(event.newValue), catalog),
				clock,
				catalog,
			);
			showAnswer = false;
		} catch {
			// Keep the last valid in-memory state.
		}
	};
	const handleVisibility = () => {
		if (!document.hidden) refreshClock();
	};
	const interval = window.setInterval(refreshClock, 60_000);
	window.addEventListener("storage", handleStorage);
	window.addEventListener("focus", refreshClock);
	document.addEventListener("visibilitychange", handleVisibility);

	return () => {
		window.clearInterval(interval);
		window.removeEventListener("storage", handleStorage);
		window.removeEventListener("focus", refreshClock);
		document.removeEventListener("visibilitychange", handleVisibility);
	};
});
</script>

{#if !ready}
	<section class="card-base px-6 py-12 text-center md:px-8">
		<Icon
			icon="material-symbols:progress-activity"
			width="30"
			class="mx-auto animate-spin text-[var(--primary)]"
		/>
		<p class="mt-3 text-sm text-50">正在读取这台浏览器的学习进度…</p>
	</section>
{:else if state.activeRun && currentScheduled && currentItem && currentSession}
	<section class="space-y-4">
		<header class="card-base px-6 py-5 md:px-8">
			<div class="flex flex-wrap items-start justify-between gap-4">
				<div>
					<div class="flex flex-wrap items-center gap-2 text-xs text-50">
						<span class="rounded-md bg-[var(--btn-regular-bg)] px-2 py-1 font-semibold text-[var(--primary)]">
							Session {state.activeRun.sessionIndex + 1}/{state.activeRun.sessions.length}
						</span>
						<span>{formatSessionChoice(state.activeRun.choice)}</span>
						<span>本组约 {currentSession.estimatedMinutes} 分钟</span>
					</div>
					<h1 class="mt-2 text-xl font-bold text-90 md:text-2xl">闭卷作答，再看参考答案</h1>
				</div>
				<button type="button" class="btn-plain rounded-lg px-3 py-2 text-sm" on:click={abandonRun}>
					结束本轮
				</button>
			</div>
			<div class="mt-4 h-2 overflow-hidden rounded-full bg-[var(--btn-plain-bg-hover)]">
				<div
					class="h-full rounded-full bg-[var(--primary)] transition-all"
					style={`width: ${runItemCount ? Math.round((completedRunItems / runItemCount) * 100) : 0}%`}
				></div>
			</div>
			<div class="mt-2 flex items-center justify-between text-xs text-30">
				<span>第 {completedRunItems + 1} / {runItemCount} 项</span>
				<span>{activityLabels[currentScheduled.activity]}</span>
			</div>
		</header>

		<article class="card-base overflow-hidden">
			<header class="border-b border-[var(--line-divider)] px-6 py-5 md:px-8">
				<div class="flex flex-wrap items-center gap-2 text-xs">
					<span class="rounded-md bg-[var(--btn-regular-bg)] px-2 py-1 font-semibold text-[var(--primary)]">
						{activityLabels[currentScheduled.activity]}
					</span>
					<span class="text-50">{currentItem.domain}</span>
					<span class="text-30">{currentItem.priority} 级 · 约 {currentScheduled.estimatedMinutes} 分钟</span>
				</div>
				<h2 class="mt-3 text-xl font-bold leading-8 text-90 md:text-2xl">{currentItem.title}</h2>
				<p class="mt-2 text-sm leading-6 text-50">{currentScheduled.reason}</p>
			</header>

			<div class="px-6 py-6 md:px-8 md:py-7">
				<p class="whitespace-pre-line text-base font-medium leading-8 text-75">{currentItem.prompt}</p>

				{#if !showAnswer}
					<div class="mt-8 rounded-xl border border-dashed border-[var(--line-divider)] px-5 py-6 text-center">
						<p class="text-sm text-50">先口述、写下思路或完成代码，再展开答案。</p>
						<button
							type="button"
							class="btn-regular mx-auto mt-4 h-11 rounded-lg px-5 text-sm font-semibold"
							on:click={() => (showAnswer = true)}
						>
							查看参考答案与评分点
						</button>
					</div>
				{:else}
					<div class="mt-7 space-y-6 border-t border-[var(--line-divider)] pt-6">
						<section>
							<h3 class="text-sm font-bold text-[var(--primary)]">参考答案</h3>
							<p class="mt-3 whitespace-pre-line text-sm leading-7 text-75">{currentItem.answer}</p>
						</section>
						<section>
							<h3 class="text-sm font-bold text-90">评分点</h3>
							<ul class="mt-3 space-y-2">
								{#each currentItem.rubric as point}
									<li class="flex items-start gap-2 text-sm leading-6 text-75">
										<Icon icon="material-symbols:check-circle-outline-rounded" width="18" class="mt-1 shrink-0 text-[var(--primary)]" />
										<span>{point}</span>
									</li>
								{/each}
							</ul>
						</section>
						{#if currentItem.followUps.length}
							<section>
								<h3 class="text-sm font-bold text-90">继续追问</h3>
								<ul class="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-75">
									{#each currentItem.followUps as followUp}<li>{followUp}</li>{/each}
								</ul>
							</section>
						{/if}
						{#if currentItem.pitfalls.length}
							<section>
								<h3 class="text-sm font-bold text-90">常见误区</h3>
								<ul class="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-50">
									{#each currentItem.pitfalls as pitfall}<li>{pitfall}</li>{/each}
								</ul>
							</section>
						{/if}
						<a
							href={currentItem.sourceUrl}
							target="_blank"
							rel="noreferrer"
							class="inline-flex items-center gap-1 text-xs font-medium text-[var(--primary)]"
						>
							查看官方参考
							<Icon icon="material-symbols:open-in-new-rounded" width="16" />
						</a>
					</div>
				{/if}
			</div>

			<footer class="border-t border-[var(--line-divider)] bg-[var(--btn-plain-bg-hover)] px-6 py-5 md:px-8">
				<p class="text-sm font-semibold text-75">按闭卷表现自评</p>
				<div class="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
					{#each scoreOptions as option}
						<button
							type="button"
							disabled={!showAnswer}
							on:click={() => scoreCurrent(option.score)}
							class="rounded-lg border border-[var(--line-divider)] bg-[var(--card-bg)] px-3 py-3 text-left transition hover:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-40"
						>
							<strong class="block text-sm text-75">{option.label}</strong>
							<span class="mt-1 block text-xs text-30">{option.detail}</span>
						</button>
					{/each}
				</div>
			</footer>
		</article>
	</section>
{:else}
	<div class="space-y-4">
		<header class="card-base overflow-hidden px-6 py-7 md:px-8 md:py-8">
			<div class="flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
				<div class="flex min-w-0 items-start gap-4">
					<div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--btn-regular-bg)] text-[var(--primary)]">
						<Icon icon="material-symbols:code-blocks-outline-rounded" width="27" />
					</div>
					<div class="min-w-0">
						<p class="text-sm font-semibold text-[var(--primary)]">
							{clock.phase === "after" ? "28 天完成 · 持续复习" : "高级前端 / 前端负责人"}
						</p>
						<h1 class="mt-1 text-2xl font-bold text-90 md:text-3xl">Day {clock.planDay} / 28</h1>
						<p class="mt-2 max-w-2xl text-sm leading-6 text-50">{plan.title}：{plan.description}</p>
					</div>
				</div>
				<div class="grid grid-cols-3 gap-2 lg:w-[25rem]">
					<div class="rounded-xl bg-[var(--btn-plain-bg-hover)] px-3 py-3 text-center">
						<strong class="block text-lg text-90">{coverage.attempted}/{coverage.total}</strong>
						<span class="mt-1 block text-xs text-50">训练覆盖</span>
					</div>
					<div class="rounded-xl bg-[var(--btn-plain-bg-hover)] px-3 py-3 text-center">
						<strong class="block text-lg text-90">{corePercent}%</strong>
						<span class="mt-1 block text-xs text-50">今日进度</span>
					</div>
					<div class="rounded-xl bg-[var(--btn-plain-bg-hover)] px-3 py-3 text-center">
						<strong class="block text-lg text-90">{formatMinutes(ledger?.studiedMinutes ?? 0)}</strong>
						<span class="mt-1 block text-xs text-50">今天已学</span>
					</div>
				</div>
			</div>
			<div class="mt-6 grid gap-4 md:grid-cols-2">
				<div>
					<div class="flex items-center justify-between text-xs text-50">
						<span>整体训练覆盖</span><span>{coverage.percent}%</span>
					</div>
					<div class="mt-2 h-2 overflow-hidden rounded-full bg-[var(--btn-plain-bg-hover)]">
						<div class="h-full rounded-full bg-[var(--primary)]" style={`width: ${coverage.percent}%`}></div>
					</div>
				</div>
				<div>
					<div class="flex items-center justify-between text-xs text-50">
						<span>今日核心</span><span>{corePercent}%</span>
					</div>
					<div class="mt-2 h-2 overflow-hidden rounded-full bg-[var(--btn-plain-bg-hover)]">
						<div class="h-full rounded-full bg-[var(--primary)]" style={`width: ${corePercent}%`}></div>
					</div>
				</div>
			</div>
		</header>

		{#if coreCompletion.complete}
			<section class="card-base border border-[var(--primary)]/30 px-6 py-5 md:px-8">
				<div class="flex items-start gap-3">
					<Icon icon="material-symbols:check-circle-rounded" width="26" class="shrink-0 text-[var(--primary)]" />
					<div>
						<h2 class="font-bold text-90">今日核心训练完成</h2>
						<p class="mt-1 text-sm leading-6 text-50">可以继续加练薄弱点、扫描题、算法或系统设计，不会被“今日完成”拦住。</p>
					</div>
				</div>
			</section>
		{/if}

		<section class="card-base px-6 py-6 md:px-8">
			<div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
				<div>
					<p class="text-sm font-semibold text-[var(--primary)]">现在有多少时间？</p>
					<h2 class="mt-1 text-xl font-bold text-90">选择时长，系统组合下一组</h2>
					<p class="mt-2 text-sm leading-6 text-50">时间只决定这一轮学多少，不限制现在能学什么。</p>
				</div>
				<div class="grid grid-cols-2 gap-2 sm:grid-cols-5 lg:w-[34rem]">
					{#each timeChoices as choice}
						<button
							type="button"
							disabled={clock.phase === "before"}
							on:click={() => startLearning(choice.value)}
							class="btn-regular min-h-14 rounded-lg px-3 py-2 text-center disabled:cursor-not-allowed disabled:opacity-40"
						>
							<span>
								<strong class="block text-sm">{choice.label}</strong>
								<small class="mt-1 block text-[10px] opacity-60">{choice.hint}</small>
							</span>
						</button>
					{/each}
				</div>
			</div>
		</section>

		{#if recommendedCandidate && recommendedItem}
			<section class="card-base overflow-hidden">
				<header class="border-b border-[var(--line-divider)] px-6 py-4 md:px-8">
					<p class="text-sm font-semibold text-[var(--primary)]">系统推荐下一步</p>
				</header>
				<div class="flex flex-col gap-5 px-6 py-5 md:px-8 lg:flex-row lg:items-center lg:justify-between">
					<div class="min-w-0">
						<div class="flex flex-wrap items-center gap-2 text-xs text-50">
							<span>🔥 当前最值得学习</span>
							<span>{activityLabels[recommendedCandidate.activity]}</span>
							<span>约 {recommendedCandidate.estimatedMinutes} 分钟</span>
						</div>
						<h2 class="mt-2 text-xl font-bold text-90">{recommendedItem.title}</h2>
						<p class="mt-2 text-sm leading-6 text-50">原因：{recommendedCandidate.reason}</p>
					</div>
					<button type="button" on:click={() => startLearning(recommendedTimeChoice)} class="btn-regular h-11 shrink-0 rounded-lg px-5 text-sm font-semibold">
						开始推荐 Session
					</button>
				</div>
			</section>
		{/if}

		<section class="card-base overflow-hidden">
			<header class="flex flex-col gap-2 border-b border-[var(--line-divider)] px-6 py-5 md:flex-row md:items-end md:justify-between md:px-8">
				<div>
					<p class="text-sm font-semibold text-[var(--primary)]">今日内容已生成</p>
					<h2 class="mt-1 text-lg font-bold text-90">Day {clock.planDay} · {todayPool.length} 项已装入任务池</h2>
				</div>
				<p class="text-xs leading-5 text-30">先展示题目，答案会在 Session 中闭卷作答后解锁。</p>
			</header>
			<ol class="grid gap-px bg-[var(--line-divider)] md:grid-cols-2">
				{#each todayPool.slice(0, 8) as item, index}
					<li class="bg-[var(--card-bg)] px-6 py-5 md:px-8">
						<div class="flex flex-wrap items-center gap-2 text-xs text-30">
							<span class="rounded-md bg-[var(--btn-regular-bg)] px-2 py-1 font-semibold text-[var(--primary)]">{item.priority} 级</span>
							<span>{item.domain}</span>
							<span>约 {item.estimatedMinutes} 分钟</span>
						</div>
						<h3 class="mt-3 font-bold text-90">{index + 1}. {item.title}</h3>
						<p class="mt-2 line-clamp-3 text-sm leading-6 text-50">{item.prompt}</p>
					</li>
				{/each}
			</ol>
			<footer class="flex flex-col gap-3 border-t border-[var(--line-divider)] px-6 py-4 sm:flex-row sm:items-center sm:justify-between md:px-8">
				<p class="text-sm text-50">
					{todayPool.length > 8 ? `这里先展示 8 项，其余 ${todayPool.length - 8} 项会按优先级进入后续 Session。` : "全部内容已展示。"}
				</p>
				<button
					type="button"
					disabled={clock.phase === "before"}
					on:click={() => startLearning(20)}
					class="btn-regular h-10 shrink-0 rounded-lg px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
				>
					开始第一组
				</button>
			</footer>
		</section>

		{#if message}
			<p class="card-base px-5 py-4 text-sm text-75">{message}</p>
		{/if}

		<div class="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,.85fr)]">
			<section class="card-base overflow-hidden">
				<header class="flex items-end justify-between gap-4 border-b border-[var(--line-divider)] px-6 py-5 md:px-8">
					<div>
						<p class="text-sm font-semibold text-[var(--primary)]">今日进度</p>
					<h2 class="mt-1 text-lg font-bold text-90">必做任务池 · 按可用题量动态封顶</h2>
					</div>
					<span class="text-sm text-50">预计剩余 {formatMinutes(remainingMinutes)}</span>
				</header>
				<div class="divide-y divide-[var(--line-divider)]">
					{#each metrics as metric}
						<div class="grid gap-3 px-6 py-4 md:grid-cols-[7rem_minmax(0,1fr)_4rem] md:items-center md:px-8">
							<div class="text-sm font-medium text-75">{metric.label}</div>
							<div class="h-2 overflow-hidden rounded-full bg-[var(--btn-plain-bg-hover)]">
								<div
									class="h-full rounded-full bg-[var(--primary)]"
									style={`width: ${metric.target === 0 ? 100 : Math.min(100, Math.round((metric.completed / metric.target) * 100))}%`}
								></div>
							</div>
							<div class="text-right text-sm font-semibold text-50">{metric.completed} / {metric.target}</div>
						</div>
					{/each}
				</div>
			</section>

			<section class="card-base overflow-hidden">
				<header class="border-b border-[var(--line-divider)] px-6 py-5">
					<p class="text-sm font-semibold text-[var(--primary)]">薄弱点</p>
					<h2 class="mt-1 text-lg font-bold text-90">优先重新出现</h2>
				</header>
				{#if weakItems.length}
					<ol class="divide-y divide-[var(--line-divider)]">
						{#each weakItems.slice(0, 5) as item}
							<li class="flex items-center gap-3 px-6 py-3.5">
								<span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--btn-regular-bg)] text-xs font-bold text-[var(--primary)]">
									{state.progress[item.id]?.mastery ?? 0}
								</span>
								<div class="min-w-0 flex-1">
									<p class="truncate text-sm font-semibold text-75">{item.title}</p>
									<p class="mt-1 text-xs text-30">{item.domain} · {item.priority} 级</p>
								</div>
							</li>
						{/each}
					</ol>
				{:else}
					<div class="px-6 py-10 text-center">
						<Icon icon="material-symbols:insights-rounded" width="30" class="mx-auto text-[var(--primary)]" />
						<p class="mt-3 text-sm text-50">完成几组 Session 后，这里会显示掌握度低于 70 的知识点。</p>
					</div>
				{/if}
			</section>
		</div>

		<section class="card-base overflow-hidden">
			<header class="border-b border-[var(--line-divider)] px-6 py-5 md:px-8">
				<p class="text-sm font-semibold text-[var(--primary)]">28 天计划</p>
				<h2 class="mt-1 text-lg font-bold text-90">核心专题按节奏推进，加练不会提前透支 S 级课程</h2>
			</header>
			<div class="grid gap-px bg-[var(--line-divider)] lg:grid-cols-2">
				{#each INTERVIEW_WEEKS as week}
					<section class="bg-[var(--card-bg)] px-5 py-5 md:px-6">
						<p class="text-xs font-semibold text-[var(--primary)]">WEEK {week.week}</p>
						<h3 class="mt-1 font-bold text-90">{week.title} · {week.subtitle}</h3>
						<p class="mt-2 text-sm leading-6 text-50">{week.goal}</p>
						<ol class="mt-4 grid grid-cols-7 gap-1.5" aria-label={`第 ${week.week} 周训练安排`}>
							{#each INTERVIEW_PLAN.filter((item) => item.week === week.week) as item}
								<li>
									<span
										title={`Day ${item.day}：${item.title}`}
										class={`flex aspect-square items-center justify-center rounded-lg border text-xs font-semibold ${
											item.day === clock.planDay
												? "border-[var(--primary)] bg-[var(--primary)] text-white"
												: item.day < clock.planDay
													? "border-[var(--primary)]/30 bg-[var(--btn-regular-bg)] text-[var(--primary)]"
													: "border-[var(--line-divider)] text-30"
										}`}
									>
										{item.day.toString().padStart(2, "0")}
									</span>
								</li>
							{/each}
						</ol>
					</section>
				{/each}
			</div>
		</section>

		<div class="grid gap-4 lg:grid-cols-2">
			<section class="card-base overflow-hidden">
				<header class="border-b border-[var(--line-divider)] px-6 py-5">
					<p class="text-sm font-semibold text-[var(--primary)]">知识地图</p>
					<h2 class="mt-1 text-lg font-bold text-90">按领域查看覆盖与平均掌握度</h2>
				</header>
				<div class="max-h-80 divide-y divide-[var(--line-divider)] overflow-y-auto">
					{#each domainProgress as domain}
						<div class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-6 py-3.5">
							<div class="min-w-0">
								<p class="truncate text-sm font-medium text-75">{domain.domain}</p>
								<p class="mt-1 text-xs text-30">覆盖 {domain.attempted}/{domain.total}</p>
							</div>
							<span class="text-sm font-semibold text-[var(--primary)]">{domain.mastery}%</span>
						</div>
					{/each}
				</div>
			</section>

			<section class="card-base overflow-hidden">
				<header class="border-b border-[var(--line-divider)] px-6 py-5">
					<p class="text-sm font-semibold text-[var(--primary)]">学习记录</p>
					<h2 class="mt-1 text-lg font-bold text-90">最近完成的 Session</h2>
				</header>
				{#if state.recentSessions.length}
					<ol class="divide-y divide-[var(--line-divider)]">
						{#each state.recentSessions.slice(0, 6) as session}
							<li class="flex items-center justify-between gap-4 px-6 py-3.5 text-sm">
								<div>
									<p class="font-medium text-75">{session.completedItems} 项 · {session.minutes} 分钟</p>
									<p class="mt-1 text-xs text-30">{session.learningDate}</p>
								</div>
								<span class="text-xs text-50">{formatSessionChoice(session.choice)}</span>
							</li>
						{/each}
					</ol>
				{:else}
					<p class="px-6 py-10 text-center text-sm text-50">完成第一组后，这里会保留最近记录。</p>
				{/if}
			</section>
		</div>

		<footer class="card-base px-6 py-5 md:px-8">
			<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<p class="text-sm font-medium text-75">进度只保存在当前浏览器</p>
					<p class="mt-1 text-xs leading-5 text-30">
						学习日按本地时间 04:00 切换。{storageAvailable ? "可导出备份或迁移到其他设备。" : "当前无法写入本地存储，本次进度只在内存中保留。"}
					</p>
				</div>
				<div class="flex flex-wrap gap-2">
					<button type="button" class="btn-plain rounded-lg px-3 py-2 text-sm" on:click={exportProgress}>导出进度</button>
					<button type="button" class="btn-plain rounded-lg px-3 py-2 text-sm" on:click={() => importInput.click()}>导入进度</button>
					<button type="button" class="btn-plain rounded-lg px-3 py-2 text-sm text-red-500" on:click={resetProgress}>重置</button>
					<input bind:this={importInput} type="file" accept="application/json" class="sr-only" on:change={importProgress} />
				</div>
			</div>
		</footer>
	</div>
{/if}

{#if confirmation}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 backdrop-blur-sm">
		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="interview-confirmation-title"
			class="card-base w-full max-w-md border border-[var(--line-divider)] px-6 py-6 shadow-2xl"
		>
			<p class="text-sm font-semibold text-[var(--primary)]">请确认</p>
			<h2 id="interview-confirmation-title" class="mt-2 text-xl font-bold text-90">
				{confirmation === "reset" ? "清空全部面试学习进度？" : "结束当前 Session？"}
			</h2>
			<p class="mt-3 text-sm leading-6 text-50">
				{confirmation === "reset"
					? "这台浏览器中的掌握度、复习计划和学习记录都会被清空，且无法撤销。"
					: "已经完成的题目会保留，尚未作答的题目会回到任务池。"}
			</p>
			<div class="mt-6 flex justify-end gap-2">
				<button type="button" class="btn-plain rounded-lg px-4 py-2 text-sm" on:click={() => (confirmation = null)}>
					取消
				</button>
				<button type="button" class="btn-regular rounded-lg px-4 py-2 text-sm font-semibold" on:click={confirmAction}>
					{confirmation === "reset" ? "确认清空" : "结束 Session"}
				</button>
			</div>
		</div>
	</div>
{/if}
