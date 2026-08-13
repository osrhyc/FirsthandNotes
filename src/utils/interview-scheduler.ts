import { INTERVIEW_ANSWER_DETAILS } from "@/data/interview-answer-details";
import {
	INTERVIEW_COHORT,
	INTERVIEW_PHASE_MIX,
	INTERVIEW_PLAN,
} from "@/data/interview-plan";
import type { KnowledgePoint, PracticeTask } from "@/data/interview-task-pool";

export const INTERVIEW_STORAGE_KEY = "firsthand.interview-learning.v1";
export const INTERVIEW_STATE_VERSION = 1;
export const INTERVIEW_DEBT_CAP_MINUTES = 45;

export type DateKey = string;
export type TimeChoice = 10 | 20 | 30 | 60 | "unlimited";
export type ActivityKind =
	| "review"
	| "scan"
	| "topic"
	| "interview"
	| "code"
	| "project"
	| "algorithm"
	| "system-design"
	| "mock";
export type SelfScore = 0 | 1 | 2 | 3 | 4 | 5;

export interface LearningClock {
	learningDate: DateKey;
	rawDay: number;
	planDay: number;
	phase: "before" | "active" | "after";
}

export interface CatalogItem {
	id: string;
	day: number;
	kind:
		| Exclude<ActivityKind, "review" | "scan" | "topic" | "interview">
		| "knowledge";
	title: string;
	domain: string;
	topic: string;
	priority: "S" | "A" | "B";
	difficulty: string;
	estimatedMinutes: number;
	prompt: string;
	answer: string;
	rubric: string[];
	followUps: string[];
	pitfalls: string[];
	sourceUrl: string;
	core: boolean;
}

export interface ItemProgress {
	attempts: number;
	mastery: number;
	lastScore: SelfScore | null;
	lastLearningDate: DateKey | null;
	passedLearningDate: DateKey | null;
	repetitions: number;
	intervalDays: number;
	ease: number;
	nextReview: DateKey | null;
}

export interface StudyEvent {
	itemId: string;
	activity: ActivityKind;
	score: SelfScore;
	minutes: number;
	sessionId: string;
	completedAt: string;
}

export interface DailyLedger {
	learningDate: DateKey;
	planDay: number;
	sessionOrdinal: number;
	events: StudyEvent[];
	studiedMinutes: number;
	visibleDebtIds: string[];
}

export interface ScheduledItem {
	itemId: string;
	activity: ActivityKind;
	priority: 0 | 1 | 2 | 3 | 4 | 5 | 6;
	estimatedMinutes: number;
	reason: string;
}

export interface LearningSession {
	id: string;
	targetMinutes: number;
	estimatedMinutes: number;
	items: ScheduledItem[];
}

export interface LearningRun {
	id: string;
	choice: TimeChoice;
	learningDate: DateKey;
	sessions: LearningSession[];
	sessionIndex: number;
	itemIndex: number;
	startedAt: string;
}

export interface SessionSummary {
	id: string;
	learningDate: DateKey;
	choice: TimeChoice;
	completedItems: number;
	minutes: number;
	completedAt: string;
}

export interface LearningState {
	schemaVersion: 1;
	contentVersion: string;
	progress: Record<string, ItemProgress>;
	days: Record<string, DailyLedger>;
	activeRun?: LearningRun;
	recentSessions: SessionSummary[];
}

export interface SessionCandidate extends ScheduledItem {
	candidateId: string;
	day: number;
	domain: string;
	topic: string;
	importance: "S" | "A" | "B";
	mastery: number;
	overdueDays: number;
	tieBreaker: number;
}

export interface DailyTarget {
	activity: ActivityKind;
	label: string;
	target: number;
}

export interface DailyMetric extends DailyTarget {
	completed: number;
}

export interface CoreCompletion {
	complete: boolean;
	reviewsComplete: boolean;
	topicComplete: boolean;
	outputComplete: boolean;
	practiceComplete: boolean;
}

function toDateKey(year: number, month: number, day: number): DateKey {
	return `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
}

function dateKeyToOrdinal(value: DateKey): number {
	const [year, month, day] = value.split("-").map(Number);
	return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

export function addDateKey(value: DateKey, days: number): DateKey {
	const ordinal = dateKeyToOrdinal(value) + days;
	const date = new Date(ordinal * 86_400_000);
	return toDateKey(
		date.getUTCFullYear(),
		date.getUTCMonth() + 1,
		date.getUTCDate(),
	);
}

export function diffDateKeys(from: DateKey, to: DateKey): number {
	return dateKeyToOrdinal(to) - dateKeyToOrdinal(from);
}

export function getLearningClock(now = new Date()): LearningClock {
	let learningDate = toDateKey(
		now.getFullYear(),
		now.getMonth() + 1,
		now.getDate(),
	);
	if (now.getHours() < INTERVIEW_COHORT.cutoffHour) {
		learningDate = addDateKey(learningDate, -1);
	}

	const rawDay = diffDateKeys(INTERVIEW_COHORT.startDate, learningDate) + 1;
	return {
		learningDate,
		rawDay,
		planDay: Math.min(INTERVIEW_COHORT.totalDays, Math.max(1, rawDay)),
		phase:
			rawDay < 1
				? "before"
				: rawDay > INTERVIEW_COHORT.totalDays
					? "after"
					: "active",
	};
}

export function buildCatalog(
	knowledgePoints: KnowledgePoint[],
	practiceTasks: PracticeTask[],
	outputTasks: PracticeTask[],
): CatalogItem[] {
	const coreIds = new Set(
		Array.from(
			{ length: INTERVIEW_COHORT.totalDays },
			(_, index) => index + 1,
		).flatMap((day) =>
			knowledgePoints
				.filter((item) => item.day === day)
				.slice(0, 2)
				.map((item) => item.id),
		),
	);
	const knowledge: CatalogItem[] = knowledgePoints.map((item) => ({
		id: item.id,
		day: item.day,
		kind: "knowledge",
		title: item.topic,
		domain: item.domain,
		topic: item.topic,
		priority: item.priority,
		difficulty: item.difficulty,
		estimatedMinutes: item.estimatedMinutes,
		prompt: item.prompt,
		answer: INTERVIEW_ANSWER_DETAILS[item.id] ?? item.answer,
		rubric: item.rubric,
		followUps: item.followUps,
		pitfalls: item.pitfalls,
		sourceUrl: item.sourceUrl,
		core: coreIds.has(item.id),
	}));
	const convertTask = (item: PracticeTask): CatalogItem => ({
		id: item.id,
		day: item.day,
		kind: item.kind,
		title: item.title,
		domain:
			item.kind === "project" || item.kind === "mock"
				? "项目与表达"
				: "工程实践",
		topic: item.title,
		priority: item.priority,
		difficulty: item.priority === "S" ? "高级" : "进阶",
		estimatedMinutes: item.estimatedMinutes,
		prompt: item.prompt,
		answer: INTERVIEW_ANSWER_DETAILS[item.id] ?? item.solution,
		rubric: item.rubric,
		followUps: [],
		pitfalls: [],
		sourceUrl: item.sourceUrl,
		core: true,
	});

	return [
		...knowledge,
		...practiceTasks.map(convertTask),
		...outputTasks.map(convertTask),
	];
}

export function createEmptyLearningState(): LearningState {
	return {
		schemaVersion: INTERVIEW_STATE_VERSION,
		contentVersion: "2026-08-13",
		progress: {},
		days: {},
		recentSessions: [],
	};
}

function defaultProgress(): ItemProgress {
	return {
		attempts: 0,
		mastery: 0,
		lastScore: null,
		lastLearningDate: null,
		passedLearningDate: null,
		repetitions: 0,
		intervalDays: 0,
		ease: 2.5,
		nextReview: null,
	};
}

const ACTIVITY_KINDS = new Set<ActivityKind>([
	"review",
	"scan",
	"topic",
	"interview",
	"code",
	"project",
	"algorithm",
	"system-design",
	"mock",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
	return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isActivityKind(value: unknown): value is ActivityKind {
	return typeof value === "string" && ACTIVITY_KINDS.has(value as ActivityKind);
}

function isTimeChoice(value: unknown): value is TimeChoice {
	return (
		value === 10 ||
		value === 20 ||
		value === 30 ||
		value === 60 ||
		value === "unlimited"
	);
}

export function normalizeLearningState(
	value: unknown,
	catalog: CatalogItem[],
): LearningState {
	if (!isRecord(value)) return createEmptyLearningState();
	const input = value as Partial<LearningState>;
	if (input.schemaVersion !== INTERVIEW_STATE_VERSION) {
		return createEmptyLearningState();
	}

	const validIds = new Set(catalog.map((item) => item.id));
	const progress = Object.fromEntries(
		Object.entries(isRecord(input.progress) ? input.progress : {}).flatMap(
			([id, item]) => {
				if (!validIds.has(id) || !isRecord(item)) return [];
				const fallback = defaultProgress();
				const lastScore = Number.isInteger(item.lastScore)
					? Math.min(5, Math.max(0, Number(item.lastScore)))
					: null;
				return [
					[
						id,
						{
							attempts: Number.isFinite(item.attempts)
								? Math.max(0, Math.floor(Number(item.attempts)))
								: fallback.attempts,
							mastery: Number.isFinite(item.mastery)
								? Math.min(100, Math.max(0, Math.round(Number(item.mastery))))
								: fallback.mastery,
							lastScore: lastScore as SelfScore | null,
							lastLearningDate:
								typeof item.lastLearningDate === "string"
									? item.lastLearningDate
									: null,
							passedLearningDate:
								typeof item.passedLearningDate === "string"
									? item.passedLearningDate
									: null,
							repetitions: Number.isFinite(item.repetitions)
								? Math.max(0, Math.floor(Number(item.repetitions)))
								: fallback.repetitions,
							intervalDays: Number.isFinite(item.intervalDays)
								? Math.max(0, Math.floor(Number(item.intervalDays)))
								: fallback.intervalDays,
							ease: Number.isFinite(item.ease)
								? Math.max(1.3, Number(item.ease))
								: fallback.ease,
							nextReview:
								typeof item.nextReview === "string" ? item.nextReview : null,
						} satisfies ItemProgress,
					],
				];
			},
		),
	) as Record<string, ItemProgress>;
	const days: Record<string, DailyLedger> = {};
	for (const [date, item] of Object.entries(
		isRecord(input.days) ? input.days : {},
	)) {
		if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !isRecord(item)) continue;
		const events: StudyEvent[] = Array.isArray(item.events)
			? item.events.flatMap((event) => {
					if (
						!isRecord(event) ||
						typeof event.itemId !== "string" ||
						!validIds.has(event.itemId) ||
						!isActivityKind(event.activity) ||
						!Number.isInteger(event.score) ||
						Number(event.score) < 0 ||
						Number(event.score) > 5
					) {
						return [];
					}
					return [
						{
							itemId: event.itemId,
							activity: event.activity,
							score: Number(event.score) as SelfScore,
							minutes: Number.isFinite(event.minutes)
								? Math.max(0, Number(event.minutes))
								: 0,
							sessionId:
								typeof event.sessionId === "string" ? event.sessionId : date,
							completedAt:
								typeof event.completedAt === "string"
									? event.completedAt
									: date,
						},
					];
				})
			: [];
		days[date] = {
			learningDate: date,
			planDay: Number.isFinite(item.planDay)
				? Math.min(28, Math.max(1, Math.floor(Number(item.planDay))))
				: 1,
			sessionOrdinal: Number.isFinite(item.sessionOrdinal)
				? Math.max(0, Math.floor(Number(item.sessionOrdinal)))
				: 0,
			events,
			studiedMinutes: events.reduce((total, event) => total + event.minutes, 0),
			visibleDebtIds: Array.isArray(item.visibleDebtIds)
				? item.visibleDebtIds.filter(
						(id): id is string => typeof id === "string" && validIds.has(id),
					)
				: [],
		};
	}

	let activeRun: LearningRun | undefined;
	const rawRun = input.activeRun;
	if (
		isRecord(rawRun) &&
		typeof rawRun.id === "string" &&
		typeof rawRun.learningDate === "string" &&
		days[rawRun.learningDate] &&
		isTimeChoice(rawRun.choice) &&
		Array.isArray(rawRun.sessions) &&
		rawRun.sessions.length > 0 &&
		Number.isInteger(rawRun.sessionIndex) &&
		Number.isInteger(rawRun.itemIndex)
	) {
		const sessions = rawRun.sessions as LearningSession[];
		const sessionsValid = sessions.every(
			(session) =>
				isRecord(session) &&
				typeof session.id === "string" &&
				Number.isFinite(session.targetMinutes) &&
				Number.isFinite(session.estimatedMinutes) &&
				Array.isArray(session.items) &&
				session.items.length > 0 &&
				session.items.every(
					(item) =>
						isRecord(item) &&
						typeof item.itemId === "string" &&
						validIds.has(item.itemId) &&
						isActivityKind(item.activity) &&
						Number.isFinite(item.estimatedMinutes),
				),
		);
		const sessionIndex = Number(rawRun.sessionIndex);
		const itemIndex = Number(rawRun.itemIndex);
		if (
			sessionsValid &&
			sessionIndex >= 0 &&
			sessionIndex < sessions.length &&
			itemIndex >= 0 &&
			itemIndex < sessions[sessionIndex].items.length
		) {
			activeRun = rawRun as unknown as LearningRun;
		}
	}
	const recentSessions: SessionSummary[] = Array.isArray(input.recentSessions)
		? input.recentSessions.flatMap((item) => {
				if (
					!isRecord(item) ||
					typeof item.id !== "string" ||
					typeof item.learningDate !== "string" ||
					!isTimeChoice(item.choice)
				) {
					return [];
				}
				return [
					{
						id: item.id,
						learningDate: item.learningDate,
						choice: item.choice,
						completedItems: Number.isFinite(item.completedItems)
							? Math.max(0, Math.floor(Number(item.completedItems)))
							: 0,
						minutes: Number.isFinite(item.minutes)
							? Math.max(0, Number(item.minutes))
							: 0,
						completedAt:
							typeof item.completedAt === "string"
								? item.completedAt
								: item.learningDate,
					},
				];
			})
		: [];

	return {
		schemaVersion: INTERVIEW_STATE_VERSION,
		contentVersion: "2026-08-13",
		progress,
		days,
		activeRun,
		recentSessions: recentSessions.slice(0, 30),
	};
}

function itemWasDoneToday(
	ledger: DailyLedger,
	itemId: string,
	activity?: ActivityKind,
) {
	return ledger.events.some(
		(event) =>
			event.itemId === itemId && (!activity || event.activity === activity),
	);
}

function getVisibleDebtIds(
	state: LearningState,
	clock: LearningClock,
	catalog: CatalogItem[],
): string[] {
	let minutes = 0;
	return catalog
		.filter((item) => {
			const isPast =
				clock.phase === "after"
					? item.day <= INTERVIEW_COHORT.totalDays
					: item.day < clock.planDay;
			if (!isPast || !item.core) return false;
			const progress = state.progress[item.id];
			if (progress?.passedLearningDate) return false;
			if (item.priority === "S") return true;
			return item.priority === "A" && clock.rawDay - item.day <= 3;
		})
		.sort((a, b) => {
			const importance = { S: 0, A: 1, B: 2 } as const;
			return importance[a.priority] - importance[b.priority] || a.day - b.day;
		})
		.filter((item) => {
			if (minutes + item.estimatedMinutes > INTERVIEW_DEBT_CAP_MINUTES) {
				return false;
			}
			minutes += item.estimatedMinutes;
			return true;
		})
		.map((item) => item.id);
}

export function ensureDailyLedger(
	state: LearningState,
	clock: LearningClock,
	catalog: CatalogItem[],
): LearningState {
	if (state.days[clock.learningDate]) return state;
	return {
		...state,
		days: {
			...state.days,
			[clock.learningDate]: {
				learningDate: clock.learningDate,
				planDay: clock.planDay,
				sessionOrdinal: 0,
				events: [],
				studiedMinutes: 0,
				visibleDebtIds: getVisibleDebtIds(state, clock, catalog),
			},
		},
	};
}

function fnv1a(value: string): number {
	let hash = 0x811c9dc5;
	for (let index = 0; index < value.length; index += 1) {
		hash ^= value.charCodeAt(index);
		hash = Math.imul(hash, 0x01000193);
	}
	return hash >>> 0;
}

function candidate(
	item: CatalogItem,
	activity: ActivityKind,
	priority: SessionCandidate["priority"],
	reason: string,
	progress: ItemProgress,
	clock: LearningClock,
	ordinal: number,
): SessionCandidate {
	return {
		candidateId: `${item.id}:${activity}`,
		itemId: item.id,
		activity,
		priority,
		estimatedMinutes:
			activity === "scan"
				? 1
				: activity === "review" || activity === "interview"
					? Math.min(3, item.estimatedMinutes)
					: item.estimatedMinutes,
		reason,
		day: item.day,
		domain: item.domain,
		topic: item.topic,
		importance: item.priority,
		mastery: progress.mastery,
		overdueDays: progress.nextReview
			? Math.max(0, diffDateKeys(progress.nextReview, clock.learningDate))
			: 0,
		tieBreaker: fnv1a(
			`${clock.learningDate}:${ordinal}:${item.id}:${activity}`,
		),
	};
}

function compareCandidates(a: SessionCandidate, b: SessionCandidate) {
	const importance = { S: 0, A: 1, B: 2 } as const;
	return (
		a.priority - b.priority ||
		importance[a.importance] - importance[b.importance] ||
		b.overdueDays - a.overdueDays ||
		a.mastery - b.mastery ||
		a.tieBreaker - b.tieBreaker ||
		a.candidateId.localeCompare(b.candidateId)
	);
}

export function buildSessionCandidates(
	state: LearningState,
	clock: LearningClock,
	catalog: CatalogItem[],
): SessionCandidate[] {
	const ledger = state.days[clock.learningDate];
	if (!ledger || clock.phase === "before") return [];
	const candidates: SessionCandidate[] = [];

	for (const item of catalog) {
		const progress = state.progress[item.id] ?? defaultProgress();
		const doneAny = itemWasDoneToday(ledger, item.id);
		const doneFor = (activity: ActivityKind) =>
			itemWasDoneToday(ledger, item.id, activity);
		const isDue =
			progress.attempts > 0 &&
			progress.nextReview !== null &&
			progress.nextReview <= clock.learningDate;

		if (isDue && !doneAny) {
			candidates.push(
				candidate(
					item,
					"review",
					0,
					progress.nextReview === clock.learningDate
						? "今天到期复习，先处理以防遗忘"
						: `已经逾期 ${Math.max(
								1,
								diffDateKeys(
									progress.nextReview ?? clock.learningDate,
									clock.learningDate,
								),
							)} 天`,
					progress,
					clock,
					ledger.sessionOrdinal,
				),
			);
			continue;
		}

		const isVisibleDebt = ledger.visibleDebtIds.includes(item.id);
		const isWeakS =
			item.priority === "S" && progress.attempts > 0 && progress.mastery < 70;
		if ((isVisibleDebt || isWeakS) && !doneAny) {
			candidates.push(
				candidate(
					item,
					item.kind === "knowledge" ? "review" : item.kind,
					1,
					isVisibleDebt && progress.attempts === 0
						? `滚动顺延的 ${item.priority} 级未完成任务`
						: progress.attempts > 0
							? `S 级薄弱点，当前掌握度 ${progress.mastery}%`
							: "过去未完成的核心训练",
					progress,
					clock,
					ledger.sessionOrdinal,
				),
			);
			continue;
		}

		if (
			clock.phase === "active" &&
			item.kind === "knowledge" &&
			item.core &&
			item.day === clock.planDay &&
			!doneFor("topic")
		) {
			candidates.push(
				candidate(
					item,
					"topic",
					2,
					"今天的 S/A 级重点专题",
					progress,
					clock,
					ledger.sessionOrdinal,
				),
			);
			continue;
		}

		if (item.kind === "knowledge") {
			const isToday = clock.phase === "active" && item.day === clock.planDay;
			const isFuturePreview =
				clock.phase === "active" &&
				item.priority === "B" &&
				item.day > clock.planDay &&
				item.day <= clock.planDay + 2 &&
				progress.attempts === 0;
			const isReturnedB =
				item.priority === "B" &&
				item.day < clock.planDay &&
				progress.attempts === 0;
			const isAfterPlanB =
				clock.phase === "after" &&
				item.priority === "B" &&
				progress.attempts === 0;

			if (
				(isToday || isFuturePreview || isReturnedB || isAfterPlanB) &&
				!doneFor("scan")
			) {
				candidates.push(
					candidate(
						item,
						"scan",
						isToday ? 3 : 6,
						isFuturePreview
							? "明后天 B 级知识预扫描，不提前推进核心专题"
							: isReturnedB || isAfterPlanB
								? "未完成的 B 级知识已回到扫描池"
								: "扩大今日知识覆盖",
						progress,
						clock,
						ledger.sessionOrdinal,
					),
				);
			}
			if (isToday && !doneFor("interview")) {
				candidates.push(
					candidate(
						item,
						"interview",
						3,
						"训练口头表达与追问",
						progress,
						clock,
						ledger.sessionOrdinal,
					),
				);
			}
			continue;
		}

		if (clock.phase !== "active" || item.day !== clock.planDay || doneAny) {
			continue;
		}
		const activity = item.kind;
		if (activity === "code" || activity === "algorithm") {
			const codeDone = ledger.events.some((event) =>
				["code", "algorithm"].includes(event.activity),
			);
			candidates.push(
				candidate(
					item,
					activity,
					codeDone ? 6 : 4,
					codeDone ? "今天的额外手写加练" : "今天至少完成一道手写代码",
					progress,
					clock,
					ledger.sessionOrdinal,
				),
			);
		} else if (
			activity === "project" ||
			activity === "system-design" ||
			activity === "mock"
		) {
			const outputDone = ledger.events.some((event) =>
				["project", "system-design", "mock"].includes(event.activity),
			);
			candidates.push(
				candidate(
					item,
					activity,
					outputDone ? 6 : 5,
					outputDone ? "继续强化项目表达" : "今天至少完成一次输出训练",
					progress,
					clock,
					ledger.sessionOrdinal,
				),
			);
		} else {
			candidates.push(
				candidate(
					item,
					activity,
					6,
					"算法或系统设计加练",
					progress,
					clock,
					ledger.sessionOrdinal,
				),
			);
		}
	}

	return candidates.sort(compareCandidates);
}

export function resolveSessionBudgets(choice: TimeChoice): number[] {
	if (choice === 60) return [30, 30];
	if (choice === "unlimited") return [25];
	return [choice];
}

function getPhaseMix(planDay: number) {
	return (
		INTERVIEW_PHASE_MIX.find(
			(phase) => planDay >= phase.startDay && planDay <= phase.endDay,
		) ?? INTERVIEW_PHASE_MIX[3]
	);
}

function packSession(
	candidates: SessionCandidate[],
	targetMinutes: number,
	previousActivity: ActivityKind | undefined,
	reservations: ActivityKind[][],
): SessionCandidate[] {
	const available = candidates.slice(0, 64);
	const selected: SessionCandidate[] = [];
	const usedItems = new Set<string>();
	let usedMinutes = 0;
	let lastActivity = previousActivity;

	const add = (item: SessionCandidate) => {
		selected.push(item);
		usedItems.add(item.itemId);
		usedMinutes += item.estimatedMinutes;
		lastActivity = item.activity;
	};
	const fits = (item: SessionCandidate) =>
		!usedItems.has(item.itemId) &&
		usedMinutes + item.estimatedMinutes <= targetMinutes;

	for (const urgent of available.filter((item) => item.priority <= 1)) {
		if (fits(urgent)) add(urgent);
	}

	for (const reservation of reservations) {
		const reserved = available.find(
			(item) => reservation.includes(item.activity) && fits(item),
		);
		if (reserved) add(reserved);
	}

	while (true) {
		const fitting = available.filter(fits);
		if (fitting.length === 0) break;
		const next =
			fitting.find(
				(item) =>
					item.activity !== lastActivity &&
					!selected.some((selectedItem) => selectedItem.topic === item.topic),
			) ??
			fitting.find((item) => item.activity !== lastActivity) ??
			fitting[0];
		add(next);
	}

	return selected;
}

export function createLearningRun(
	state: LearningState,
	clock: LearningClock,
	catalog: CatalogItem[],
	choice: TimeChoice,
	now = new Date(),
): { state: LearningState; run: LearningRun | undefined } {
	if (state.activeRun) return { state, run: state.activeRun };
	const withLedger = ensureDailyLedger(state, clock, catalog);
	const ledger = withLedger.days[clock.learningDate];
	let candidates = buildSessionCandidates(withLedger, clock, catalog);
	const budgets = resolveSessionBudgets(choice);
	const sessions: LearningSession[] = [];
	let previousActivity: ActivityKind | undefined;
	const phaseMix = getPhaseMix(clock.planDay);
	const outputActivities: ActivityKind[] = [
		"interview",
		"project",
		"system-design",
		"mock",
	];

	for (let index = 0; index < budgets.length; index += 1) {
		const targetMinutes = budgets[index];
		const reservations: ActivityKind[][] =
			choice === 60
				? index === 0
					? [["topic"], ["code", "algorithm"]]
					: [outputActivities]
				: targetMinutes >= 25
					? phaseMix.output >= phaseMix.newKnowledge
						? [outputActivities, ["topic"]]
						: [["topic"], ["code", "algorithm"]]
					: [];
		const packed = packSession(
			candidates,
			targetMinutes,
			previousActivity,
			reservations,
		);
		if (packed.length === 0) continue;
		const id = `${clock.learningDate}-${ledger.sessionOrdinal + 1}-${index + 1}`;
		sessions.push({
			id,
			targetMinutes,
			estimatedMinutes: packed.reduce(
				(total, item) => total + item.estimatedMinutes,
				0,
			),
			items: packed.map(
				({ itemId, activity, priority, estimatedMinutes, reason }) => ({
					itemId,
					activity,
					priority,
					estimatedMinutes,
					reason,
				}),
			),
		});
		previousActivity = packed.at(-1)?.activity;
		const usedIds = new Set(packed.map((item) => item.itemId));
		candidates = candidates.filter((item) => !usedIds.has(item.itemId));
	}

	if (sessions.length === 0) return { state: withLedger, run: undefined };
	const run: LearningRun = {
		id: `${clock.learningDate}-${ledger.sessionOrdinal + 1}-${now.getTime()}`,
		choice,
		learningDate: clock.learningDate,
		sessions,
		sessionIndex: 0,
		itemIndex: 0,
		startedAt: now.toISOString(),
	};
	const nextState: LearningState = {
		...withLedger,
		activeRun: run,
		days: {
			...withLedger.days,
			[clock.learningDate]: {
				...ledger,
				sessionOrdinal: ledger.sessionOrdinal + 1,
			},
		},
	};
	return { state: nextState, run };
}

export function getCurrentScheduledItem(state: LearningState) {
	const run = state.activeRun;
	if (!run) return undefined;
	return run.sessions[run.sessionIndex]?.items[run.itemIndex];
}

export function applySelfScore(
	progress: ItemProgress | undefined,
	score: SelfScore,
	learningDate: DateKey,
): ItemProgress {
	const previous = progress ?? defaultProgress();
	const masteryTargets = [10, 25, 45, 65, 82, 95] as const;
	let mastery =
		previous.attempts === 0
			? masteryTargets[score]
			: Math.round(previous.mastery * 0.6 + masteryTargets[score] * 0.4);
	const sameLearningDay = previous.lastLearningDate === learningDate;
	const ease = sameLearningDay
		? previous.ease
		: Math.max(
				1.3,
				previous.ease + 0.1 - (5 - score) * (0.08 + (5 - score) * 0.02),
			);
	let repetitions: number;
	let intervalDays: number;
	if (score < 3) {
		repetitions = 0;
		intervalDays = 1;
		mastery = Math.min(59, mastery);
	} else if (sameLearningDay) {
		repetitions = Math.max(1, previous.repetitions);
		intervalDays = Math.max(1, previous.intervalDays);
	} else {
		repetitions = previous.repetitions + 1;
		intervalDays =
			repetitions === 1
				? 1
				: repetitions === 2
					? 3
					: Math.min(60, Math.max(4, Math.round(previous.intervalDays * ease)));
	}

	return {
		attempts: previous.attempts + 1,
		mastery,
		lastScore: score,
		lastLearningDate: learningDate,
		passedLearningDate: score >= 3 ? learningDate : previous.passedLearningDate,
		repetitions,
		intervalDays,
		ease,
		nextReview: addDateKey(learningDate, intervalDays),
	};
}

export function completeCurrentItem(
	state: LearningState,
	score: SelfScore,
	now = new Date(),
): { state: LearningState; runCompleted: boolean; sessionCompleted: boolean } {
	const run = state.activeRun;
	const scheduled = getCurrentScheduledItem(state);
	if (!run || !scheduled) {
		return { state, runCompleted: false, sessionCompleted: false };
	}

	const session = run.sessions[run.sessionIndex];
	const ledger = state.days[run.learningDate];
	if (!session || !ledger) {
		return {
			state: abandonActiveRun(state),
			runCompleted: false,
			sessionCompleted: false,
		};
	}
	const event: StudyEvent = {
		itemId: scheduled.itemId,
		activity: scheduled.activity,
		score,
		minutes: scheduled.estimatedMinutes,
		sessionId: session.id,
		completedAt: now.toISOString(),
	};
	const nextProgress = applySelfScore(
		state.progress[scheduled.itemId],
		score,
		run.learningDate,
	);
	const lastItem = run.itemIndex >= session.items.length - 1;
	const lastSession = run.sessionIndex >= run.sessions.length - 1;
	const runCompleted = lastItem && lastSession;
	const sessionCompleted = lastItem;
	const nextRun: LearningRun | undefined = runCompleted
		? undefined
		: {
				...run,
				sessionIndex: lastItem ? run.sessionIndex + 1 : run.sessionIndex,
				itemIndex: lastItem ? 0 : run.itemIndex + 1,
			};
	const completedEvents = [...ledger.events, event];
	const nextState: LearningState = {
		...state,
		progress: {
			...state.progress,
			[scheduled.itemId]: nextProgress,
		},
		days: {
			...state.days,
			[run.learningDate]: {
				...ledger,
				events: completedEvents,
				studiedMinutes: completedEvents.reduce(
					(total, item) => total + item.minutes,
					0,
				),
			},
		},
		activeRun: nextRun,
		recentSessions: sessionCompleted
			? [
					{
						id: session.id,
						learningDate: run.learningDate,
						choice: run.choice,
						completedItems: session.items.length,
						minutes: session.estimatedMinutes,
						completedAt: now.toISOString(),
					},
					...state.recentSessions,
				].slice(0, 30)
			: state.recentSessions,
	};
	return { state: nextState, runCompleted, sessionCompleted };
}

export function abandonActiveRun(state: LearningState): LearningState {
	return { ...state, activeRun: undefined };
}

export function getDailyMetrics(
	state: LearningState,
	clock: LearningClock,
	catalog: CatalogItem[],
): DailyMetric[] {
	const ledger = state.days[clock.learningDate];
	const events = ledger?.events ?? [];
	const candidates = buildSessionCandidates(state, clock, catalog);
	const date = new Date(`${clock.learningDate}T00:00:00Z`);
	const weekday = date.getUTCDay();
	const targets: DailyTarget[] =
		weekday === 0
			? [
					{ activity: "review", label: "到期 / 顺延复习", target: 20 },
					{ activity: "scan", label: "快速扫描", target: 100 },
					{ activity: "topic", label: "薄弱专题", target: 1 },
					{ activity: "interview", label: "面试训练", target: 15 },
					{ activity: "code", label: "代码实践", target: 1 },
					{ activity: "project", label: "模拟 / 项目输出", target: 1 },
				]
			: [
					{ activity: "review", label: "到期 / 顺延复习", target: 15 },
					{
						activity: "scan",
						label: "快速扫描",
						target: weekday === 6 ? 15 : 20,
					},
					{ activity: "topic", label: "重点专题", target: 2 },
					{
						activity: "interview",
						label: "面试训练",
						target: weekday === 6 ? 10 : 15,
					},
					{
						activity: "code",
						label: "代码实践",
						target: weekday === 6 ? 2 : 1,
					},
					{ activity: "project", label: "项目输出", target: 1 },
				];

	const matchesActivity = (target: ActivityKind, actual: ActivityKind) => {
		if (target === "code") return ["code", "algorithm"].includes(actual);
		if (target === "project") {
			return ["project", "system-design", "mock"].includes(actual);
		}
		return target === actual;
	};

	return targets.map((target) => {
		const completed = events.filter((event) =>
			matchesActivity(target.activity, event.activity),
		).length;
		const available = candidates.filter((item) =>
			matchesActivity(target.activity, item.activity),
		).length;
		const potential =
			target.activity === "scan"
				? catalog.filter((item) => {
						if (item.kind !== "knowledge") return false;
						const progress = state.progress[item.id];
						const alreadyScanned = events.some(
							(event) => event.itemId === item.id && event.activity === "scan",
						);
						if (alreadyScanned) return false;
						const isToday =
							clock.phase === "active" && item.day === clock.planDay;
						const isFutureB =
							clock.phase === "active" &&
							item.priority === "B" &&
							item.day > clock.planDay &&
							item.day <= clock.planDay + 2 &&
							(progress?.attempts ?? 0) === 0;
						const isReturnedB =
							item.priority === "B" &&
							item.day < clock.planDay &&
							(progress?.attempts ?? 0) === 0;
						const isAfterPlanB =
							clock.phase === "after" &&
							item.priority === "B" &&
							(progress?.attempts ?? 0) === 0;
						return isToday || isFutureB || isReturnedB || isAfterPlanB;
					}).length
				: target.activity === "interview"
					? catalog.filter(
							(item) =>
								item.kind === "knowledge" &&
								clock.phase === "active" &&
								item.day === clock.planDay &&
								!events.some(
									(event) =>
										event.itemId === item.id && event.activity === "interview",
								),
						).length
					: available;
		return {
			...target,
			target: Math.min(target.target, completed + potential),
			completed,
		};
	});
}

export function getCoreCompletion(
	state: LearningState,
	clock: LearningClock,
	catalog: CatalogItem[],
): CoreCompletion {
	const ledger = state.days[clock.learningDate];
	const events = ledger?.events ?? [];
	if (clock.phase === "before") {
		return {
			complete: false,
			reviewsComplete: false,
			topicComplete: false,
			outputComplete: false,
			practiceComplete: false,
		};
	}
	const dueSIds = catalog
		.filter((item) => {
			const progress = state.progress[item.id];
			return (
				item.priority === "S" &&
				((progress?.nextReview ?? "9999-12-31") <= clock.learningDate ||
					(progress?.lastLearningDate === clock.learningDate &&
						(progress.lastScore ?? 5) < 3))
			);
		})
		.map((item) => item.id);
	const requiredReviewIds = new Set([
		...dueSIds,
		...(ledger?.visibleDebtIds ?? []).filter(
			(id) => catalog.find((item) => item.id === id)?.priority === "S",
		),
	]);
	const passedIds = new Set(
		events.filter((event) => event.score >= 3).map((event) => event.itemId),
	);
	const reviewsComplete = [...requiredReviewIds].every((id) =>
		passedIds.has(id),
	);
	if (clock.phase === "after") {
		return {
			complete: reviewsComplete,
			reviewsComplete,
			topicComplete: true,
			outputComplete: true,
			practiceComplete: true,
		};
	}
	const weekday = new Date(`${clock.learningDate}T00:00:00Z`).getUTCDay();
	const topicTarget = Math.min(
		weekday === 0 ? 1 : 2,
		catalog.filter(
			(item) =>
				item.kind === "knowledge" && item.core && item.day === clock.planDay,
		).length,
	);
	const passedTopicIds = new Set(
		events
			.filter((event) => event.activity === "topic" && event.score >= 3)
			.map((event) => event.itemId),
	);
	const topicComplete = passedTopicIds.size >= topicTarget;
	const outputComplete = events.some(
		(event) =>
			["interview", "project", "system-design", "mock"].includes(
				event.activity,
			) && event.score >= 3,
	);
	const practiceComplete = events.some(
		(event) =>
			["code", "algorithm"].includes(event.activity) && event.score >= 3,
	);
	return {
		complete:
			reviewsComplete && topicComplete && outputComplete && practiceComplete,
		reviewsComplete,
		topicComplete,
		outputComplete,
		practiceComplete,
	};
}

export function getCoverage(state: LearningState, catalog: CatalogItem[]) {
	const attempted = catalog.filter(
		(item) => (state.progress[item.id]?.attempts ?? 0) > 0,
	).length;
	return {
		attempted,
		total: catalog.length,
		percent: catalog.length
			? Math.round((attempted / catalog.length) * 100)
			: 0,
	};
}

export function getWeakItems(state: LearningState, catalog: CatalogItem[]) {
	return catalog
		.filter((item) => {
			const progress = state.progress[item.id];
			return progress && progress.attempts > 0 && progress.mastery < 70;
		})
		.sort(
			(a, b) =>
				(state.progress[a.id]?.mastery ?? 0) -
				(state.progress[b.id]?.mastery ?? 0),
		)
		.slice(0, 8);
}

export function getCurrentPlan(clock: LearningClock) {
	return (
		INTERVIEW_PLAN.find((item) => item.day === clock.planDay) ??
		INTERVIEW_PLAN[0]
	);
}
