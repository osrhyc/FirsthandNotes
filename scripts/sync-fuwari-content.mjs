import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const contentDir = path.join(root, "src/content");
const postsDir = path.join(contentDir, "posts");
const specDir = path.join(contentDir, "spec");

const DEFAULT_DATE = "2026-07-10";

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
			"这里是一手笔记。",
			"",
			"它用于保存长期阅读、量化学习、每日简报、人物事件和名词解释。",
			"",
			"内容源数据保存在 `src/content/blog/`、`src/content/books/`、`src/content/glossary/`，构建时同步为 Fuwari 的文章集合。",
		].join("\n")
	);
}

emptyDir(postsDir);
writeAbout();
syncBlog();
syncBooks();
syncGlossary();

console.log("Synced Fuwari posts content.");
