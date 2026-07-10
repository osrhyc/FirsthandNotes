import { marked } from 'marked';

export type Article = {
	id: string;
	title: string;
	description: string;
	pubDate: string;
	category: string;
	level: string;
	tags: string[];
	html: string;
	readingMinutes: number;
	wordCount: number;
};

const modules = import.meta.glob('../content/blog/*.md', {
	query: '?raw',
	import: 'default',
	eager: true,
}) as Record<string, string>;

marked.use({
	gfm: true,
	breaks: false,
});

function getId(path: string) {
	return path.split('/').pop()?.replace(/\.md$/, '') ?? path;
}

export function parseFrontmatter(raw: string) {
	const match = raw.match(/^---\n([\s\S]*?)\n---\n?/);
	if (!match) return { data: {} as Record<string, unknown>, content: raw };

	const data: Record<string, unknown> = {};
	for (const line of match[1].split('\n')) {
		const separatorIndex = line.indexOf(':');
		if (separatorIndex === -1) continue;
		const key = line.slice(0, separatorIndex).trim();
		const value = line.slice(separatorIndex + 1).trim();

		if (value.startsWith('[') && value.endsWith(']')) {
			data[key] = value
				.slice(1, -1)
				.split(',')
				.map((item) => item.trim().replace(/^['"]|['"]$/g, ''))
				.filter(Boolean);
		} else {
			data[key] = value.replace(/^['"]|['"]$/g, '');
		}
	}

	return { data, content: raw.slice(match[0].length) };
}

function toDateString(value: unknown) {
	if (value instanceof Date) return value.toISOString().slice(0, 10);
	if (typeof value === 'string') return value.slice(0, 10);
	return new Date().toISOString().slice(0, 10);
}

export function countChineseWords(text: string) {
	const chinese = text.match(/[\u4e00-\u9fff]/g)?.length ?? 0;
	const latin = text.match(/[A-Za-z0-9_]+/g)?.length ?? 0;
	return chinese + latin;
}

export const articles: Article[] = Object.entries(modules)
	.map(([path, raw]) => {
		const parsed = parseFrontmatter(raw);
		const data = parsed.data;
		const text = parsed.content.replace(/```[\s\S]*?```/g, '').replace(/[#>*_`[\]()!-]/g, '');
		const wordCount = countChineseWords(text);

		return {
			id: getId(path),
			title: String(data.title ?? getId(path)),
			description: String(data.description ?? ''),
			pubDate: toDateString(data.pubDate),
			category: String(data.category ?? '量化学堂'),
			level: String(data.level ?? data.group ?? ''),
			tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
			html: marked.parse(parsed.content, { async: false }) as string,
			readingMinutes: Math.max(1, Math.ceil(wordCount / 450)),
			wordCount,
		};
	})
	.sort((a, b) => b.pubDate.localeCompare(a.pubDate));
