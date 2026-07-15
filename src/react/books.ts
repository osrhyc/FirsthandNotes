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
	module: string; // 归属一级模块：quant（量化书屋）/ library（书房）
	seq: number;
	deepRead: boolean; // 真读原书、一章一篇（note 以「真读」开头，见 .ai/read-book.md）
	chapters: BookChapter[];
};

// 真读书的 note 统一以此开头，卡片上由徽章表达，正文里去掉以免重复
const DEEP_READ_PREFIX = '真读逐章精读：';

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
		const note = String(data.note ?? '');
		const deepRead = note.startsWith(DEEP_READ_PREFIX);
		map.set(id, {
			id,
			title: String(data.bookTitle ?? id),
			author: String(data.author ?? ''),
			note: deepRead ? note.slice(DEEP_READ_PREFIX.length) : note,
			category: String(data.bookCategory ?? '未分类'),
			module: String(data.bookModule ?? 'quant'),
			seq: Number(data.seq ?? 999),
			deepRead,
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

// 书架分组：按模块 → 分类聚合，保持 seq 顺序
export const bookGroupsByModule = new Map<string, { name: string; items: Book[] }[]>();
for (const book of books) {
	let groups = bookGroupsByModule.get(book.module);
	if (!groups) {
		groups = [];
		bookGroupsByModule.set(book.module, groups);
	}
	let group = groups.find((g) => g.name === book.category);
	if (!group) {
		group = { name: book.category, items: [] };
		groups.push(group);
	}
	group.items.push(book);
}
