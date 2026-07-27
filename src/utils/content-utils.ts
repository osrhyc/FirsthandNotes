import { type CollectionEntry, getCollection } from "astro:content";
import { getCategoryUrl } from "@utils/url-utils.ts";
import postSummary from "../../.generated/post-summary.json";

// // Retrieve posts and sort them by publication date
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
			.sort((a, b) => {
				const dateA = new Date(a.data.published);
				const dateB = new Date(b.data.published);
				return dateA > dateB ? -1 : 1;
			}),
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
	const sortedFullPosts = await getRawSortedPosts();

	// delete post.body
	const sortedPostsList = sortedFullPosts.map((post) => ({
		slug: post.slug,
		data: post.data,
	}));

	return sortedPostsList;
}
export type Tag = {
	name: string;
	count: number;
};

export async function getTagList(): Promise<Tag[]> {
	const keys = Object.keys(postSummary.tags).sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	return keys.map((key) => ({
		name: key,
		count: postSummary.tags[key as keyof typeof postSummary.tags],
	}));
}

export type Category = {
	name: string;
	count: number;
	url: string;
};

export async function getCategoryList(): Promise<Category[]> {
	const lst = Object.keys(postSummary.categories).sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	const ret: Category[] = [];
	for (const c of lst) {
		ret.push({
			name: c,
			count:
				postSummary.categories[
					c as keyof typeof postSummary.categories
				],
			url: getCategoryUrl(c),
		});
	}
	return ret;
}
