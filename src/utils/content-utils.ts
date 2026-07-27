import { type CollectionEntry, getCollection } from "astro:content";
import { getCategoryUrl } from "@utils/url-utils.ts";

export type PostEntry = CollectionEntry<"posts"> & {
	slug: string;
};

export const SERIES = [
	{ slug: "quant", name: "量化学堂", description: "从市场规则到研究与回测的系统学习路径。" },
	{ slug: "people", name: "名人堂", description: "人物、机构和决策背后的行业脉络。" },
	{ slug: "industry-stories", name: "江湖八卦", description: "区分事实、传闻与推断的行业故事。" },
	{ slug: "timelines", name: "大事记", description: "沿时间线理解行业和市场的关键转折。" },
] as const;

let sortedPostsPromise: Promise<PostEntry[]> | undefined;

async function getRawSortedPosts(): Promise<PostEntry[]> {
	sortedPostsPromise ??= getCollection("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	}).then((posts) =>
		posts
			.map((post) => ({
				...post,
				slug: post.id.replace(/\.(md|mdx)$/i, ""),
			}))
			.sort(
				(a, b) =>
					b.data.published.getTime() - a.data.published.getTime() ||
					a.data.title.localeCompare(b.data.title, "zh-CN"),
			),
	);

	return sortedPostsPromise;
}

export async function getSortedPosts() {
	const sorted = await getRawSortedPosts();

	for (let i = 1; i < sorted.length; i++) {
		sorted[i].data.nextSlug = sorted[i - 1].slug;
		sorted[i].data.nextTitle = sorted[i - 1].data.title;
	}
	for (let i = 0; i < sorted.length - 1; i++) {
		sorted[i].data.prevSlug = sorted[i + 1].slug;
		sorted[i].data.prevTitle = sorted[i + 1].data.title;
	}

	return sorted;
}

export async function getTechnicalPosts() {
	const now = Date.now();
	return (await getSortedPosts()).filter(
		(post) =>
			post.data.category !== "名词手册" &&
			post.data.published.getTime() <= now,
	);
}

export function getSeriesBySlug(slug: string) {
	return SERIES.find((series) => series.slug === slug);
}

export function getSeriesByCategory(category: string | null | undefined) {
	return SERIES.find((series) => series.name === category);
}

export type PostForList = {
	slug: string;
	data: CollectionEntry<"posts">["data"];
};

export async function getSortedPostsList(): Promise<PostForList[]> {
	const sorted = await getRawSortedPosts();
	return sorted.map((post) => ({ slug: post.slug, data: post.data }));
}

export type Tag = {
	name: string;
	count: number;
};

export async function getTagList(): Promise<Tag[]> {
	const counts = new Map<string, number>();
	for (const post of await getRawSortedPosts()) {
		for (const tag of post.data.tags) {
			counts.set(tag, (counts.get(tag) || 0) + 1);
		}
	}
	return [...counts.entries()]
		.sort(([a], [b]) => a.toLowerCase().localeCompare(b.toLowerCase()))
		.map(([name, count]) => ({ name, count }));
}

export type Category = {
	name: string;
	count: number;
	url: string;
};

export async function getCategoryList(): Promise<Category[]> {
	const counts = new Map<string, number>();
	for (const post of await getRawSortedPosts()) {
		const category = post.data.category || "";
		if (category) counts.set(category, (counts.get(category) || 0) + 1);
	}
	return [...counts.entries()]
		.sort(([a], [b]) => a.toLowerCase().localeCompare(b.toLowerCase()))
		.map(([name, count]) => ({
			name,
			count,
			url: getCategoryUrl(name),
		}));
}
