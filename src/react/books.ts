import { marked } from 'marked';
import { countChineseWords, parseFrontmatter } from './content';

export type BookChapter = {
	order: number;
	title: string;
	html: string;
	wordCount: number;
	readingMinutes: number;
};

export type Book = {
	id: string;
	title: string;
	author: string;
	note: string;
	category: string;
	seq: number;
	chapters: BookChapter[];
};

const modules = import.meta.glob('../content/books/*.md', {
	query: '?raw',
	import: 'default',
	eager: true,
}) as Record<string, string>;

const map = new Map<string, Book>();

for (const raw of Object.values(modules)) {
	const { data, content } = parseFrontmatter(raw);
	const id = String(data.book ?? '');
	if (!id) continue;
	if (!map.has(id)) {
		map.set(id, {
			id,
			title: String(data.bookTitle ?? id),
			author: String(data.author ?? ''),
			note: String(data.note ?? ''),
			category: String(data.bookCategory ?? '未分类'),
			seq: Number(data.seq ?? 999),
			chapters: [],
		});
	}
	const text = content.replace(/```[\s\S]*?```/g, '').replace(/[#>*_`[\]()!-]/g, '');
	const wordCount = countChineseWords(text);
	map.get(id)?.chapters.push({
		order: Number(data.chapter ?? 0),
		title: String(data.title ?? ''),
		html: marked.parse(content, { async: false }) as string,
		wordCount,
		readingMinutes: Math.max(1, Math.ceil(wordCount / 450)),
	});
}

export const books: Book[] = [...map.values()].sort((a, b) => a.seq - b.seq);
for (const book of books) {
	book.chapters.sort((a, b) => a.order - b.order);
}

// 书架分组：按分类聚合，保持书目注册表的原始顺序
export const bookGroups: { name: string; items: Book[] }[] = [];
for (const book of books) {
	let group = bookGroups.find((g) => g.name === book.category);
	if (!group) {
		group = { name: book.category, items: [] };
		bookGroups.push(group);
	}
	group.items.push(book);
}
