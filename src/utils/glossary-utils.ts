import { getCollection } from "astro:content";
import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";
import { getPostUrlBySlug } from "@utils/url-utils";

export interface GlossaryTermRecord {
	term: string;
	aliases: string[];
	category: string;
	description: string;
	content: string;
	contentHtml: string;
	url: string;
}

let glossaryTermsPromise: Promise<GlossaryTermRecord[]> | undefined;
const markdown = new MarkdownIt({
	html: false,
	linkify: true,
	typographer: true,
});

function stripMarkdown(value: string) {
	return value
		.replace(/```[\s\S]*?```/g, " ")
		.replace(/`([^`]+)`/g, "$1")
		.replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
		.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
		.replace(/\[\[([^\]]+)\]\]/g, "$1")
		.replace(/^#{1,6}\s+/gm, "")
		.replace(/[*_~>|-]/g, "")
		.replace(/\s+/g, " ")
		.trim();
}

function firstParagraph(body: string) {
	const paragraph =
		body
			.split(/\n{2,}/)
			.map((part) => stripMarkdown(part))
			.find((part) => part && !part.startsWith("title:")) || "";

	return paragraph.length > 140 ? `${paragraph.slice(0, 140)}...` : paragraph;
}

function fullBodyText(body: string) {
	return body
		.split(/\n{2,}/)
		.map((part) => stripMarkdown(part))
		.filter(Boolean)
		.join("\n\n");
}

function bodyHtml(body: string) {
	return sanitizeHtml(markdown.render(body), {
		allowedTags: [
			"p",
			"br",
			"strong",
			"em",
			"code",
			"pre",
			"blockquote",
			"ul",
			"ol",
			"li",
			"table",
			"thead",
			"tbody",
			"tr",
			"th",
			"td",
			"a",
			"h2",
			"h3",
			"h4",
			"hr",
		],
		allowedAttributes: {
			a: ["href", "title", "target", "rel"],
		},
		allowedSchemes: ["http", "https", "mailto"],
		transformTags: {
			a: sanitizeHtml.simpleTransform("a", {
				target: "_blank",
				rel: "noopener noreferrer",
			}),
		},
	});
}

export async function getGlossaryTerms(): Promise<GlossaryTermRecord[]> {
	glossaryTermsPromise ??= getCollection("posts", ({ data }) =>
		data.category === "名词手册" && data.term ? true : false,
	).then((entries) =>
		entries
			.map((entry) => ({
				term: entry.data.term || entry.data.title,
				aliases: entry.data.aliases || [],
				category: entry.data.glossaryCategory || entry.data.module || "名词手册",
				description:
					entry.data.description && entry.data.description !== entry.data.glossaryCategory
						? entry.data.description
						: firstParagraph(entry.body || ""),
				content: fullBodyText(entry.body || ""),
				contentHtml: bodyHtml(entry.body || ""),
				url: getPostUrlBySlug(entry.id),
			}))
			.filter((entry) => entry.term && (entry.content || entry.description))
			.sort((a, b) => b.term.length - a.term.length || a.term.localeCompare(b.term, "zh-CN")),
	);

	return glossaryTermsPromise;
}
