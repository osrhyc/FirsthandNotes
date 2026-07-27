import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const contentDir = path.join(root, "src/content");
const generatedDir = path.join(root, ".generated");
const postsDir = path.join(generatedDir, "posts");
const specDir = path.join(contentDir, "spec");

const DEFAULT_DATE = "2026-07-10";
const postSummary = {
	categories: {},
	tags: {},
};
const bookMap = new Map();

function ensureDir(dir) {
	fs.mkdirSync(dir, { recursive: true });
}

function emptyDir(dir) {
	fs.rmSync(dir, { recursive: true, force: true });
	ensureDir(dir);
}

function listMarkdown(dir) {
	if (!fs.existsSync(dir)) return [];
	return fs
		.readdirSync(dir)
		.filter((file) => file.endsWith(".md") && !file.startsWith("."))
		.sort();
}

function readMarkdown(file) {
	const raw = fs.readFileSync(file, "utf8");
	const match = raw.match(/^---\n([\s\S]*?)\n---\n?/);
	if (!match) return { data: {}, body: raw };
	return {
		data: parseFrontmatter(match[1]),
		body: raw.slice(match[0].length),
	};
}

function parseFrontmatter(source) {
	const data = {};
	for (const line of source.split("\n")) {
		const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
		if (!match) continue;
		const [, key, rawValue] = match;
		data[key] = normalizeValue(rawValue);
	}
	return data;
}

function normalizeValue(value) {
	const trimmed = value.trim();
	if (!trimmed) return "";
	if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
		return trimmed
			.slice(1, -1)
			.split(",")
			.map((item) => item.trim().replace(/^['"]|['"]$/g, ""))
			.filter(Boolean);
	}
	if (
		(trimmed.startsWith("'") && trimmed.endsWith("'")) ||
		(trimmed.startsWith('"') && trimmed.endsWith('"'))
	) {
		return trimmed.slice(1, -1);
	}
	return trimmed;
}

function escapeString(value) {
	return String(value ?? "")
		.replace(/\\/g, "\\\\")
		.replace(/"/g, '\\"');
}

function validDate(value) {
	const text = String(value || "").slice(0, 10);
	return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : DEFAULT_DATE;
}

function tagList(tags) {
	if (!Array.isArray(tags)) return "[]";
	return `[${tags.map((tag) => `"${escapeString(tag)}"`).join(", ")}]`;
}

function writePost(file, meta, body) {
	const target = path.join(postsDir, file);
	ensureDir(path.dirname(target));
	const frontmatter = [
		"---",
		`title: "${escapeString(meta.title)}"`,
		`published: ${validDate(meta.published)}`,
		`description: "${escapeString(meta.description)}"`,
		`tags: ${tagList(meta.tags)}`,
		`category: "${escapeString(meta.category)}"`,
		"draft: false",
		"---",
		"",
	].join("\n");
	fs.writeFileSync(target, `${frontmatter}${body.trim()}\n`);

	if (meta.category) {
		postSummary.categories[meta.category] =
			(postSummary.categories[meta.category] || 0) + 1;
	}
	for (const tag of meta.tags || []) {
		if (!tag) continue;
		postSummary.tags[tag] = (postSummary.tags[tag] || 0) + 1;
	}
}

function syncBlog() {
	const source = path.join(contentDir, "blog");
	for (const file of listMarkdown(source)) {
		const { data, body } = readMarkdown(path.join(source, file));
		const slug = file.replace(/\.md$/, "");
		writePost(file, {
			title: data.title || slug,
			published: data.pubDate || DEFAULT_DATE,
			description: data.description || data.level || data.category || "",
			tags: Array.isArray(data.tags) ? data.tags : [],
			category: data.category || categoryFromSlug(slug),
		}, body);
	}
}

function syncBooks() {
	const source = path.join(contentDir, "books");
	for (const file of listMarkdown(source)) {
		const { data, body } = readMarkdown(path.join(source, file));
		const title = data.title || data.note || file.replace(/\.md$/, "");
		const bookTitle = data.bookTitle || data.book || "读书笔记";
		const bookSlug = data.book || file.replace(/--.*$/, "").replace(/\.md$/, "");
		const postSlug = `book-${file.replace(/\.md$/, "")}`;
		const chapterNumber = Number.parseInt(data.chapter, 10) || 0;
		const sequence = Number.parseInt(data.seq, 10) || Number.MAX_SAFE_INTEGER;

		if (!bookMap.has(bookSlug)) {
			bookMap.set(bookSlug, {
				slug: bookSlug,
				title: bookTitle,
				author: data.author || "佚名",
				description: data.note || "",
				category: data.bookCategory || "读书笔记",
				sequence,
				chapters: [],
			});
		}

		bookMap.get(bookSlug).chapters.push({
			number: chapterNumber,
			title,
			postSlug,
		});

		writePost(`book-${file}`, {
			title: `${bookTitle}｜${title}`,
			published: DEFAULT_DATE,
			description: data.note || data.author || bookTitle,
			tags: [bookTitle, data.author].filter(Boolean),
			category: data.bookCategory || "读书笔记",
		}, body);
	}
}

function syncGlossary() {
	const source = path.join(contentDir, "glossary");
	for (const file of listMarkdown(source)) {
		const { data, body } = readMarkdown(path.join(source, file));
		const term = data.term || file.replace(/\.md$/, "");
		writePost(`glossary-${file}`, {
			title: term,
			published: data.pubDate || DEFAULT_DATE,
			description: data.category || data.module || "名词解释",
			tags: [data.module, data.category].filter(Boolean),
			category: "名词手册",
		}, body);
	}
}

function categoryFromSlug(slug) {
	if (slug.startsWith("daily-briefing")) return "每日简报";
	if (slug.startsWith("quant-")) return "量化学堂";
	if (slug.startsWith("person-")) return "人物";
	if (slug.startsWith("event-")) return "事件";
	if (slug.startsWith("gossip-")) return "故事";
	return "笔记";
}

function writeAbout() {
	ensureDir(specDir);
	fs.writeFileSync(
		path.join(specDir, "about.md"),
		[
			'<img src="/assets/brand/logo.png" alt="一手笔记 Logo" width="180">',
			"",
			"# 一手笔记",
			"",
			"**Firsthand Notes**",
			"",
			"> 记录值得长期保存的知识。",
			"",
			"一手笔记用于保存完整阅读、量化学习、每日简报、人物事件和名词解释。我们关心的不是信息经过多少次转述，而是它是否来自可靠来源，是否经得起长期回看。",
			"",
			"Logo 由书本、笔尖和书签组成：书本承载阅读与学习，笔尖代表记录与思考，金色书签标记值得沉淀的内容。",
			"",
			"![一手笔记品牌规范](/assets/brand/brand-guide.png)",
		].join("\n")
	);
}

emptyDir(postsDir);
writeAbout();
syncBlog();
syncBooks();
syncGlossary();
fs.writeFileSync(
	path.join(generatedDir, "post-summary.json"),
	`${JSON.stringify(postSummary, null, 2)}\n`,
);
const books = [...bookMap.values()]
	.map((book) => ({
		...book,
		chapters: book.chapters.sort(
			(a, b) => a.number - b.number || a.title.localeCompare(b.title),
		),
	}))
	.sort(
		(a, b) =>
			a.sequence - b.sequence ||
			a.title.localeCompare(b.title, "zh-CN"),
	);
fs.writeFileSync(
	path.join(generatedDir, "books.json"),
	`${JSON.stringify(books, null, 2)}\n`,
);

console.log("Synced Fuwari posts content.");
