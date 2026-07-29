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

function getShanghaiDateKey(date = new Date()) {
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone: "Asia/Shanghai",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).formatToParts(date);
	const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
	return `${values.year}-${values.month}-${values.day}`;
}

function getContentDateKey(date: Date) {
	return date.toISOString().slice(0, 10);
}

export function isPublishedContentDate(date: Date, today = getShanghaiDateKey()) {
	return getContentDateKey(date) <= today;
}

function applyAdjacentPosts(posts: PostEntry[]) {
	for (const post of posts) {
		post.data.prevSlug = "";
		post.data.prevTitle = "";
		post.data.nextSlug = "";
		post.data.nextTitle = "";
	}
	for (let i = 1; i < posts.length; i++) {
		posts[i].data.nextSlug = posts[i - 1].slug;
		posts[i].data.nextTitle = posts[i - 1].data.title;
	}
	for (let i = 0; i < posts.length - 1; i++) {
		posts[i].data.prevSlug = posts[i + 1].slug;
		posts[i].data.prevTitle = posts[i + 1].data.title;
	}

	return posts;
}

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
	const sorted = (await getRawSortedPosts()).map((post) => ({
		...post,
		data: { ...post.data },
	}));
	return applyAdjacentPosts(sorted);
}

export async function getPublishedPosts() {
	const today = getShanghaiDateKey();
	const sorted = (await getRawSortedPosts())
		.filter((post) => isPublishedContentDate(post.data.published, today))
		.map((post) => ({
			...post,
			data: { ...post.data },
		}));

	return applyAdjacentPosts(sorted);
}

export async function getTechnicalPosts() {
	return (await getPublishedPosts()).filter(
		(post) => post.data.category !== "名词手册",
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
	const sorted = await getPublishedPosts();
	return sorted.map((post) => ({ slug: post.slug, data: post.data }));
}

export type Tag = {
	name: string;
	count: number;
};

export async function getTagList(): Promise<Tag[]> {
	const counts = new Map<string, number>();
	for (const post of await getTechnicalPosts()) {
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
	for (const post of await getTechnicalPosts()) {
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
