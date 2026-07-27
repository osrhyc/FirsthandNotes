import { getCollection } from "astro:content";
import { getBriefingUrl } from "@utils/url-utils";

export interface BriefingRecord {
	id: string;
	title: string;
	date: string;
	description: string;
	url: string;
	tags: string[];
}

export const BRIEFING_TOPICS = [
	{ slug: "ai", name: "AI", tags: ["AI", "Agent", "Codex"] },
	{ slug: "technology", name: "技术", tags: ["开发工具", "前端开发", "商业科技"] },
	{ slug: "business", name: "创业与营销", tags: ["创业增长", "营销"] },
	{ slug: "finance", name: "金融市场", tags: ["金融", "基金", "股市"] },
] as const;

let briefingsPromise: Promise<BriefingRecord[]> | undefined;

export async function getBriefings(): Promise<BriefingRecord[]> {
	briefingsPromise ??= getCollection("briefings", ({ data }) =>
		import.meta.env.PROD ? data.draft !== true : true,
	).then((entries) =>
		entries
			.map((entry) => {
				const date = entry.data.published.toISOString().slice(0, 10);
				return {
					id: entry.id,
					title: entry.data.title,
					date,
					description: entry.data.description,
					url: getBriefingUrl(date),
					tags: entry.data.tags,
				};
			})
			.sort((a, b) => b.date.localeCompare(a.date)),
	);

	return briefingsPromise;
}
