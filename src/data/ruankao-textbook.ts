import type { TextbookLesson } from "./ruankao-textbook-types";
const files = import.meta.glob<TextbookLesson>("./ruankao-textbook/units/*.json", { eager: true, import: "default" });
export const TEXTBOOK_LESSONS: TextbookLesson[] = Object.values(files).sort((a, b) => a.id.localeCompare(b.id));
