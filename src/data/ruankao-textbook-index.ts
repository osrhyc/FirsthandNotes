import units from "./ruankao-textbook-index.json";
export { default as TEXTBOOK_COVERAGE } from "./ruankao-textbook-coverage.json";
import type { TextbookUnitIndex } from "./ruankao-textbook-types";
export const TEXTBOOK_UNIT_INDEX = units as TextbookUnitIndex[];
export const textbookUnitUrl = (id: string): string => `/ruankao/textbook/${id}/`;
export const unitsForSection = (id: string): TextbookUnitIndex[] => TEXTBOOK_UNIT_INDEX.filter(unit => unit.sectionIds.includes(id) || unit.blocks.some(block => block.id === id));
