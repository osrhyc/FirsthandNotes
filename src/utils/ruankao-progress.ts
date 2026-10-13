export const STORAGE_KEY = "firsthand-notes:ruankao:v1";
export const TOTAL_DAYS = 196;
export const TASK_MINUTES = [15, 40, 30, 25, 10] as const;
export type Mastery = "" | "weak" | "okay" | "good";
export interface DayRecord {
  tasks: boolean[];
  note: string;
  mastery: Mastery;
  reviewOn: string;
}
export interface StudyProgress {
  version: 1;
  startDate: string;
  records: Record<string, DayRecord>;
}
export function localDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function addDays(value: string, days: number): string {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12);
  date.setDate(date.getDate() + days);
  return localDate(date);
}
export function emptyRecord(): DayRecord {
  return { tasks: [false, false, false, false, false], note: "", mastery: "", reviewOn: "" };
}
export function initialProgress(): StudyProgress {
  return { version: 1, startDate: localDate(), records: {} };
}
export function isComplete(record?: DayRecord): boolean {
  return !!record && record.tasks.every(Boolean) && record.mastery !== "";
}
export function nextStudyDay(progress: StudyProgress): number {
  for (let day = 1; day <= TOTAL_DAYS; day++) {
    if (!isComplete(progress.records[day])) return day;
  }
  return TOTAL_DAYS;
}
export function reviewDate(mastery: Mastery, today = localDate()): string {
  return mastery ? addDays(today, { weak: 1, okay: 3, good: 7 }[mastery]) : "";
}
function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  return localDate(new Date(y, m - 1, d, 12)) === value;
}
/** Validate every field before a backup can replace existing learning records. */
export function parseProgress(value: unknown): StudyProgress {
  if (!value || typeof value !== "object") throw new Error("不是有效的学习记录文件。");
  const data = value as Partial<StudyProgress>;
  if (data.version !== 1 || !validDate(data.startDate) || !data.records || typeof data.records !== "object" || Array.isArray(data.records)) {
    throw new Error("学习记录版本或日期不正确。");
  }
  const records: Record<string, DayRecord> = {};
  for (const [key, record] of Object.entries(data.records)) {
    const day = Number(key);
    if (!Number.isInteger(day) || day < 1 || day > TOTAL_DAYS || String(day) !== key || !record || typeof record !== "object") {
      throw new Error("记录包含无效的学习日。");
    }
    if (!Array.isArray(record.tasks) || record.tasks.length !== 5 || !record.tasks.every((v) => typeof v === "boolean") ||
      typeof record.note !== "string" || record.note.length > 20000 ||
      !["", "weak", "okay", "good"].includes(record.mastery) ||
      !(record.reviewOn === "" || validDate(record.reviewOn))) {
      throw new Error(`第 ${day} 天的记录格式不正确。`);
    }
    records[key] = { tasks: [...record.tasks], note: record.note, mastery: record.mastery, reviewOn: record.reviewOn };
  }
  return { version: 1, startDate: data.startDate, records };
}
