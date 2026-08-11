import { defineCollection, reference, z } from "astro:content";
import { glob } from "astro/loaders";

const articleFields = {
	title: z.string(),
	description: z.string().optional().default(""),
	pubDate: z.coerce.date(),
	updated: z.coerce.date().optional(),
	image: z.string().optional().default(""),
	tags: z.array(z.string()).optional().default([]),
	category: z.string().optional().nullable().default(""),
	level: z.string().optional().default(""),
	draft: z.boolean().optional().default(false),
};

function withRenderableFields<
	T extends {
		pubDate: Date;
		title: string;
		description: string;
		updated?: Date;
		image: string;
		tags: string[];
		category?: string | null;
		draft: boolean;
	},
>(data: T) {
	return {
		...data,
		published: data.pubDate,
		prevTitle: "",
		prevSlug: "",
		nextTitle: "",
		nextSlug: "",
	};
}

const postsCollection = defineCollection({
	loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/posts" }),
	schema: z
		.object({
			...articleFields,
			term: z.string().optional(),
			aliases: z.array(z.string()).optional(),
			module: z.string().optional(),
			glossaryCategory: z.string().optional(),
		})
		.transform(withRenderableFields),
});

const booksCollection = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/books" }),
	schema: z.object({
		title: z.string(),
		author: z.string(),
		description: z.string().optional().default(""),
		category: z.string(),
		sequence: z.coerce.number(),
		updated: z.coerce.date(),
		cover: z.string().optional().default(""),
		status: z
			.enum(["planned", "reading", "finished", "paused"])
			.optional()
			.default("finished"),
	}),
});

const bookNotesCollection = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/book-notes" }),
	schema: z
		.object({
			book: reference("books"),
			bookTitle: z.string(),
			author: z.string(),
			note: z.string().optional().default(""),
			bookCategory: z.string(),
			bookModule: z.enum(["quant", "library"]).optional(),
			seq: z.coerce.number(),
			chapter: z.coerce.number(),
			title: z.string(),
			updated: z.coerce.date(),
			draft: z.boolean().optional().default(false),
		})
		.transform((data) => ({
			...data,
			published: data.updated,
			description: data.note,
			image: "",
			tags: [data.bookTitle, data.author],
			category: data.bookCategory,
			prevTitle: "",
			prevSlug: "",
			nextTitle: "",
			nextSlug: "",
		})),
});

const briefingsCollection = defineCollection({
	loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/briefings" }),
	schema: z
		.object({
			...articleFields,
			sourceCount: z.coerce.number().optional(),
			status: z
				.enum(["generated", "reviewed", "published"])
				.optional()
				.default("published"),
		})
		.transform(withRenderableFields),
});

export const collections = {
	posts: postsCollection,
	books: booksCollection,
	bookNotes: bookNotesCollection,
	briefings: briefingsCollection,
};
