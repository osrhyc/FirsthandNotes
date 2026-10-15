import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { TEXTBOOK_UNIT_INDEX, TEXTBOOK_COVERAGE } from "../src/data/ruankao-textbook-index";
import type { TextbookLesson } from "../src/data/ruankao-textbook-types";
import { STUDY_WEEKS } from "../src/data/ruankao-plan";
import { FOUNDATION_LESSONS } from "../src/data/ruankao-foundations";
import { TEXTBOOK_CHAPTERS } from "../src/data/ruankao-chapters";
import {
	TOTAL_DAYS,
	TASK_MINUTES,
	addDays,
	emptyRecord,
	isComplete,
	nextStudyDay,
	parseProgress,
	reviewDate,
	type DayRecord,
	type StudyProgress,
} from "../src/utils/ruankao-progress";

function completeRecord(): DayRecord {
	return {
		tasks: [true, true, true, true, true],
		note: "我能解释数据库事务的原子性，并用转账说明回滚的作用。",
		mastery: "okay",
		reviewOn: "2026-10-16",
	};
}

function validProgress(): StudyProgress {
	return {
		version: 1,
		startDate: "2026-10-13",
		records: { "1": completeRecord(), "2": emptyRecord() },
	};
}

// A backup must survive the actual JSON export/import boundary without losing data.
const source = validProgress();
const restored = parseProgress(JSON.parse(JSON.stringify(source)));
assert.deepEqual(restored, source);
assert.notEqual(restored, source);
assert.notEqual(restored.records, source.records);
assert.notEqual(restored.records[1].tasks, source.records[1].tasks);
restored.records[1].tasks[0] = false;
assert.equal(source.records[1].tasks[0], true);
assert.equal(
	parseProgress({ ...validProgress(), startDate: "2028-02-29" }).startDate,
	"2028-02-29",
);

for (const invalid of [null, undefined, "{}", 1, true, [], {}]) {
	assert.throws(() => parseProgress(invalid));
}
for (const version of [undefined, 0, 2, "1", null]) {
	assert.throws(() => parseProgress({ ...validProgress(), version }));
}
for (const date of [
	"",
	"2027-02-29",
	"2026-04-31",
	"2026-13-01",
	"2026-00-01",
	"2026-10-00",
	"2026-1-01",
	"2026-10-13T00:00:00Z",
	"not-a-date",
	null,
]) {
	assert.throws(() => parseProgress({ ...validProgress(), startDate: date }));
	if (date !== "") {
		assert.throws(() =>
			parseProgress({
				...validProgress(),
				records: { "1": { ...completeRecord(), reviewOn: date } },
			}),
		);
	}
}

for (const tasks of [
	[],
	[true, true, true, true],
	[true, true, true, true, true, true],
	[true, true, true, true, 1],
	[true, true, true, true, "true"],
	[true, true, true, true, null],
	"true,true,true,true,true",
]) {
	assert.throws(() =>
		parseProgress({
			...validProgress(),
			records: { "1": { ...completeRecord(), tasks } },
		}),
	);
}
for (const invalidRecord of [
	null,
	"done",
	{ ...completeRecord(), note: 123 },
	{ ...completeRecord(), note: "字".repeat(20_001) },
	{ ...completeRecord(), mastery: "excellent" },
]) {
	assert.throws(() =>
		parseProgress({ ...validProgress(), records: { "1": invalidRecord } }),
	);
}

// Test untrusted JSON keys rather than an object literal's special __proto__ syntax.
for (const key of [
	"__proto__",
	"constructor",
	"prototype",
	"toString",
	"0",
	"197",
	"-1",
	"01",
	"1.0",
	"1e0",
	"Infinity",
	"NaN",
]) {
	const imported = JSON.parse(
		JSON.stringify({ ...validProgress(), records: { [key]: completeRecord() } }),
	);
	assert.throws(() => parseProgress(imported), `无效学习日 ${key} 应被拒绝`);
}
assert.equal(Object.hasOwn(Object.prototype, "tasks"), false);

// Completion depends on both the five tasks and the learner's self-assessment.
assert.equal(isComplete(), false);
assert.equal(isComplete(emptyRecord()), false);
assert.equal(isComplete(completeRecord()), true);
assert.equal(isComplete({ ...completeRecord(), mastery: "" }), false);
assert.equal(
	isComplete({ ...completeRecord(), tasks: [true, true, true, true, false] }),
	false,
);
assert.equal(
	nextStudyDay({ version: 1, startDate: "2026-10-13", records: {} }),
	1,
);
assert.equal(nextStudyDay(validProgress()), 2);
assert.equal(
	nextStudyDay({
		...validProgress(),
		records: {
			"1": completeRecord(),
			"2": { ...completeRecord(), mastery: "" },
			"3": completeRecord(),
		},
	}),
	2,
	"未来一天已经完成，也不能跳过尚未自评的学习日",
);
const allDone: StudyProgress = {
	version: 1,
	startDate: "2026-10-13",
	records: Object.fromEntries(
		Array.from({ length: TOTAL_DAYS }, (_, index) => [
			String(index + 1),
			completeRecord(),
		]),
	),
};
assert.equal(nextStudyDay(allDone), TOTAL_DAYS);
assert.equal(Object.values(allDone.records).filter(isComplete).length, TOTAL_DAYS);

// Reviews use calendar days across month ends, year ends and leap years.
assert.equal(reviewDate("", "2026-10-13"), "");
assert.equal(reviewDate("weak", "2026-10-13"), "2026-10-14");
assert.equal(reviewDate("okay", "2026-10-13"), "2026-10-16");
assert.equal(reviewDate("good", "2026-10-13"), "2026-10-20");
assert.equal(reviewDate("weak", "2027-02-28"), "2027-03-01");
assert.equal(reviewDate("weak", "2028-02-28"), "2028-02-29");
assert.equal(reviewDate("weak", "2028-02-29"), "2028-03-01");
assert.equal(reviewDate("okay", "2026-12-30"), "2027-01-02");
assert.equal(reviewDate("good", "2027-04-27"), "2027-05-04");
assert.equal(addDays("2027-03-01", -1), "2027-02-28");

// Structural checks ensure every reachable learning day has usable course content.
assert.equal(TOTAL_DAYS, 196);
assert.equal(TASK_MINUTES.reduce((total, minutes) => total + minutes, 0), 120);
assert.equal(STUDY_WEEKS.length, 28);
assert.deepEqual(
	STUDY_WEEKS.map((week) => week.week),
	Array.from({ length: 28 }, (_, index) => index + 1),
);
assert.equal(STUDY_WEEKS.flatMap((week) => week.days).length, TOTAL_DAYS);
for (const week of STUDY_WEEKS) {
	assert.equal(week.days.length, 7, `第 ${week.week} 周必须有 7 个学习日`);
	for (const field of ["phase", "title", "goal", "material"] as const) {
		assert.ok(week[field].trim().length >= 4, `第 ${week.week} 周缺少 ${field}`);
	}
	for (const [index, day] of week.days.entries()) {
		const label = `Day ${(week.week - 1) * 7 + index + 1}`;
    if (day.taskMinutes) {
      assert.equal(day.taskMinutes.length, 5);
      assert.ok(day.taskMinutes.every(value => Number.isInteger(value) && value >= 0));
      assert.equal(day.taskMinutes.reduce((total, value) => total + value, 0), 120, `${label} 计时安排必须为120分钟`);
    }
		assert.ok(day.title.trim().length >= 4, `${label} 缺少明确主题`);
		assert.ok(day.points.length >= 2, `${label} 缺少知识要点`);
		assert.ok(
			day.points.every((point) => point.trim().length >= 6),
			`${label} 含有空白或过短的知识要点`,
		);
		assert.ok(day.output.trim().length >= 10, `${label} 缺少可检查的产出`);
		assert.ok(day.question.trim().length >= 10, `${label} 缺少自测问题`);
		assert.ok(day.answer.trim().length >= 20, `${label} 缺少参考解析`);
	}
}

assert.equal(FOUNDATION_LESSONS.length, 7);
for (const lesson of FOUNDATION_LESSONS) {
  assert.ok(lesson.explanation.length >= 4);
  assert.ok(lesson.questions.length >= 2);
  assert.ok(lesson.practice.length > 20 && lesson.practiceAnswer.length > 20);
  for (const question of lesson.questions) {
    assert.equal(question.options.length, 4);
    assert.ok(Number.isInteger(question.correct) && question.correct >= 0 && question.correct < question.options.length);
    assert.equal(new Set(question.options).size, 4);
    assert.ok(question.explanation.length > 20);
  }
}
assert.equal(TEXTBOOK_CHAPTERS.length, 20);
assert.equal(TEXTBOOK_CHAPTERS.flatMap(chapter => chapter.sections).length, 119);
for (const chapter of TEXTBOOK_CHAPTERS) {
  chapter.sections.forEach((section, index) => assert.equal(section.id, `${chapter.number}.${index + 1}`));
}
// Verify public lesson links and quiz references independently of the private reading workspace.
const lessonDir = "src/data/ruankao-textbook/units";
const textbookLessons = readdirSync(lessonDir).filter(name => name.endsWith(".json")).map(name => JSON.parse(readFileSync(`${lessonDir}/${name}`, "utf8")) as TextbookLesson);
assert.equal(textbookLessons.length, TEXTBOOK_UNIT_INDEX.length);
assert.equal(TEXTBOOK_COVERAGE.completedUnits, textbookLessons.length);
assert.ok(TEXTBOOK_COVERAGE.completedUnits <= TEXTBOOK_COVERAGE.totalUnits);
assert.equal(TEXTBOOK_COVERAGE.sections.length, 119);
for (const lesson of textbookLessons) {
  const entry = TEXTBOOK_UNIT_INDEX.find(item => item.id === lesson.id);
  assert.ok(entry, `${lesson.id} 缺少目录入口`);
  assert.equal(entry.questionCount, lesson.questions.length);
  assert.deepEqual(entry.blocks, lesson.blocks.map(({ id, title }) => ({ id, title })));
  assert.deepEqual(lesson.readPages, Array.from({ length: lesson.pdfEnd - lesson.pdfStart + 1 }, (_, i) => lesson.pdfStart + i));
  assert.equal(lesson.printedStart, lesson.pdfStart - 15);
  assert.equal(lesson.printedEnd, lesson.pdfEnd - 15);
  const sectionIds = new Set(lesson.blocks.map(block => block.id));
  for (const question of lesson.questions) {
    assert.equal(question.options.length, 4);
    assert.equal(new Set(question.options).size, 4);
    assert.ok(Number.isInteger(question.correct) && question.correct >= 0 && question.correct < 4);
    assert.ok(question.sourceSections.every(id => sectionIds.has(id)), `${lesson.id} 题目引用不存在的小节`);
  }
}
for (const section of TEXTBOOK_COVERAGE.sections) {
  assert.ok(TEXTBOOK_CHAPTERS.some(chapter => chapter.sections.some(item => item.id === section.id)));
  assert.equal(section.completed, textbookLessons.filter(lesson => lesson.sectionIds.includes(section.id)).length);
  assert.ok(section.completed <= section.total);
}
console.log(`软考检查通过：备份、学习推进、日期边界、196天课程、7课练习、教材目录及${textbookLessons.length}个PDF精读单元。结构校验不代替知识审校。`);
