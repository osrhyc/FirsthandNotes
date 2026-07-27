import { getCollection } from "astro:content";
import { getBriefingUrl } from "@utils/url-utils";

export interface BriefingRecord {
	id: string;
	title: string;
	date: string;
	description: string;
	url: string;
}

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
				};
			})
			.sort((a, b) => b.date.localeCompare(a.date)),
	);

	return briefingsPromise;
}
