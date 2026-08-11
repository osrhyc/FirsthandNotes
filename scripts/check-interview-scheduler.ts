import assert from "node:assert/strict";
import {
	applySelfScore,
	buildCatalog,
	buildSessionCandidates,
	completeCurrentItem,
	createEmptyLearningState,
	createLearningRun,
	ensureDailyLedger,
	getCoreCompletion,
	getDailyMetrics,
	getLearningClock,
	INTERVIEW_DEBT_CAP_MINUTES,
	normalizeLearningState,
	resolveSessionBudgets,
} from "@utils/interview-scheduler";
import {
	KNOWLEDGE_POINTS,
	OUTPUT_TASKS,
	PRACTICE_TASKS,
} from "@/data/interview-task-pool";

const catalog = buildCatalog(KNOWLEDGE_POINTS, PRACTICE_TASKS, OUTPUT_TASKS);

assert.equal(KNOWLEDGE_POINTS.length, 96);
assert.equal(PRACTICE_TASKS.length, 28);
assert.equal(OUTPUT_TASKS.length, 28);
assert.equal(catalog.length, 152);
assert.equal(new Set(catalog.map((item) => item.id)).size, catalog.length);
assert.ok(catalog.every((item) => item.sourceUrl.startsWith("https://")));

for (let day = 1; day <= 28; day += 1) {
	const knowledge = KNOWLEDGE_POINTS.filter((item) => item.day === day);
	assert.equal(
		knowledge.length,
		day === 1 ? 15 : 3,
		`Day ${day} 的知识点数量不符合内容计划`,
	);
	assert.ok(
		knowledge.some((item) => item.priority === "B"),
		`Day ${day} 至少应有 1 个可预扫描的 B 级知识点`,
	);
	assert.equal(PRACTICE_TASKS.filter((item) => item.day === day).length, 1);
	assert.equal(OUTPUT_TASKS.filter((item) => item.day === day).length, 1);
}

assert.deepEqual(resolveSessionBudgets(10), [10]);
assert.deepEqual(resolveSessionBudgets(60), [30, 30]);
assert.deepEqual(resolveSessionBudgets("unlimited"), [25]);

const beforeStart = getLearningClock(new Date(2026, 7, 11, 3, 59));
assert.equal(beforeStart.learningDate, "2026-08-10");
assert.equal(beforeStart.phase, "before");

const dayOne = getLearningClock(new Date(2026, 7, 11, 4, 0));
assert.equal(dayOne.learningDate, "2026-08-11");
assert.equal(dayOne.planDay, 1);

const afterMidnight = getLearningClock(new Date(2026, 7, 12, 0, 40));
assert.equal(afterMidnight.learningDate, "2026-08-11");
assert.equal(afterMidnight.planDay, 1);

const dayTwo = getLearningClock(new Date(2026, 7, 12, 4, 0));
assert.equal(dayTwo.learningDate, "2026-08-12");
assert.equal(dayTwo.planDay, 2);

const lastActiveMoment = getLearningClock(new Date(2026, 8, 8, 3, 59));
assert.equal(lastActiveMoment.planDay, 28);
assert.equal(lastActiveMoment.phase, "active");

const afterPlan = getLearningClock(new Date(2026, 8, 8, 4, 0));
assert.equal(afterPlan.planDay, 28);
assert.equal(afterPlan.phase, "after");

const freshState = ensureDailyLedger(
	createEmptyLearningState(),
	dayOne,
	catalog,
);
const candidates = buildSessionCandidates(freshState, dayOne, catalog);
assert.ok(candidates.length >= 7);
assert.equal(
	buildSessionCandidates(
		ensureDailyLedger(createEmptyLearningState(), beforeStart, catalog),
		beforeStart,
		catalog,
	).length,
	0,
);
assert.ok(
	candidates
		.filter((item) => item.day > dayOne.planDay)
		.every(
			(item) =>
				item.importance === "B" &&
				item.activity === "scan" &&
				item.day <= dayOne.planDay + 2,
		),
	"未来 S/A 核心课程不得提前进入 Session",
);

const initialMetrics = getDailyMetrics(freshState, dayOne, catalog);
assert.ok(initialMetrics.every((metric) => metric.target < 100));

const fixedNow = new Date(2026, 7, 11, 9, 0);
const firstRun = createLearningRun(freshState, dayOne, catalog, 60, fixedNow);
const repeatedRun = createLearningRun(
	freshState,
	dayOne,
	catalog,
	60,
	fixedNow,
);
assert.ok(firstRun.run);
assert.deepEqual(firstRun.run?.sessions, repeatedRun.run?.sessions);
assert.equal(firstRun.run?.sessions.length, 2);

const allScheduledIds = new Set<string>();
for (const session of firstRun.run?.sessions ?? []) {
	assert.ok(session.estimatedMinutes <= session.targetMinutes);
	assert.ok(session.estimatedMinutes > 0);
	assert.equal(
		new Set(session.items.map((item) => item.itemId)).size,
		session.items.length,
		"同一 Session 不应重复同一题",
	);
	for (const item of session.items) {
		assert.ok(
			!allScheduledIds.has(item.itemId),
			"同一轮的两个 Session 不应重复同一题",
		);
		allScheduledIds.add(item.itemId);
	}
}

let completedState = firstRun.state;
while (completedState.activeRun) {
	completedState = completeCurrentItem(completedState, 4, fixedNow).state;
}
assert.equal(completedState.recentSessions.length, 2);
assert.deepEqual(
	getDailyMetrics(completedState, dayOne, catalog).map(
		(metric) => metric.target,
	),
	initialMetrics.map((metric) => metric.target),
	"完成题目后不应动态抬高今日目标",
);

const failed = applySelfScore(undefined, 0, "2026-08-11");
assert.equal(failed.nextReview, "2026-08-12");
assert.ok(failed.mastery < 70);

const firstSameDayPass = applySelfScore(undefined, 4, "2026-08-11");
const secondSameDayPass = applySelfScore(firstSameDayPass, 5, "2026-08-11");
assert.equal(secondSameDayPass.repetitions, firstSameDayPass.repetitions);
assert.equal(secondSameDayPass.intervalDays, firstSameDayPass.intervalDays);

const missedDayOne = ensureDailyLedger(
	createEmptyLearningState(),
	dayTwo,
	catalog,
);
assert.equal(
	getCoreCompletion(missedDayOne, dayTwo, catalog).reviewsComplete,
	false,
);

const dayTwentyEight = getLearningClock(new Date(2026, 8, 7, 12, 0));
const debtState = ensureDailyLedger(
	createEmptyLearningState(),
	dayTwentyEight,
	catalog,
);
const debtLedger = debtState.days[dayTwentyEight.learningDate];
const debtMinutes = debtLedger.visibleDebtIds.reduce(
	(total, id) =>
		total + (catalog.find((item) => item.id === id)?.estimatedMinutes ?? 0),
	0,
);
assert.ok(debtMinutes <= INTERVIEW_DEBT_CAP_MINUTES);
const debtCandidates = buildSessionCandidates(
	debtState,
	dayTwentyEight,
	catalog,
);
assert.ok(
	debtLedger.visibleDebtIds.every((id) =>
		debtCandidates.some((item) => item.itemId === id && item.priority === 1),
	),
);
assert.ok(
	debtCandidates
		.filter(
			(item) => item.day < dayTwentyEight.planDay && item.importance !== "B",
		)
		.every((item) => debtLedger.visibleDebtIds.includes(item.itemId)),
	"45 分钟上限外的历史 S/A 任务不应绕过债务队列进入普通候选",
);

const invalidImport = normalizeLearningState(
	{
		...createEmptyLearningState(),
		activeRun: { id: "broken", sessions: [] },
	},
	catalog,
);
assert.equal(invalidImport.activeRun, undefined);

console.log("Interview scheduler checks passed.");
