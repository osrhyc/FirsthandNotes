import { type CollectionEntry, getCollection } from "astro:content";
import { getCategoryUrl } from "@utils/url-utils.ts";

export type PostEntry = CollectionEntry<"posts"> & {
	slug: string;
};

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
