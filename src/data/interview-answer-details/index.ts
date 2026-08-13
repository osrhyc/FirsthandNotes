import { WEEK_1_ANSWER_DETAILS } from "./week-1";
import { WEEK_2_ANSWER_DETAILS } from "./week-2";
import { WEEK_3_ANSWER_DETAILS } from "./week-3";
import { WEEK_4_ANSWER_DETAILS } from "./week-4";

export const INTERVIEW_ANSWER_DETAILS: Record<string, string> = {
	...WEEK_1_ANSWER_DETAILS,
	...WEEK_2_ANSWER_DETAILS,
	...WEEK_3_ANSWER_DETAILS,
	...WEEK_4_ANSWER_DETAILS,
};
