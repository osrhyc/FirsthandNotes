// 路由：全部是纯函数，不碰 window / document。
// 这样预渲染脚本能在 Node 里直接调 parseRoute + allPaths。
import type { Book } from './books';
import { books } from './books';
import type { Article } from './content';
import { articles } from './content';
import { termGroupsByModule, terms } from './glossary';

// 栏目结构：一级模块 → 二级栏目。这里只放 key 和 label，
// 图标由 App.tsx 按 key 补上（routes.ts 要能在 Node 里跑，不能带 JSX）。
export const MODULES = [
	{
		key: 'quant',
		label: '量化交易',
		children: [
			{ key: 'quant-school', label: '量化学堂' },
			{ key: 'quant-books', label: '量化书屋' },
			{ key: 'quant-legends', label: '名人堂' },
			{ key: 'quant-events', label: '大事记' },
			{ key: 'quant-gossip', label: '江湖八卦' },
			{ key: 'quant-glossary', label: '名词手册' },
		],
	},
	{
		key: 'library',
		label: '书房',
		children: [
			{ key: 'library-books', label: '书架' },
			{ key: 'library-glossary', label: '名词手册' },
		],
	},
	{
		key: 'poker',
		label: '德州扑克',
		children: [
			{ key: 'poker-school', label: '扑克学堂' },
			{ key: 'poker-glossary', label: '名词手册' },
		],
	},
];

export const SECTIONS = MODULES.flatMap((module) => module.children);
export const SECTION_KEYS = SECTIONS.map((section) => section.key);
export const DEFAULT_SECTION = 'quant-school';

// 书架栏目 → 书籍模块 的映射（frontmatter 的 bookModule 字段）
export const BOOKSHELF_SECTIONS: Record<string, string> = {
	'quant-books': 'quant',
	'library-books': 'library',
};

export function isGlossarySection(key: string) {
	return key.endsWith('-glossary');
}

export function moduleOf(sectionKey: string) {
	return sectionKey.split('-')[0];
}

export function shelfSectionOfBook(book: Book) {
	return (
		Object.keys(BOOKSHELF_SECTIONS).find((key) => BOOKSHELF_SECTIONS[key] === book.module) ??
		'quant-books'
	);
}

// 支持 frontmatter 里写简称或全称：category: '学堂' / '量化学堂' 均可
const CATEGORY_ALIASES: Record<string, string> = {
	学堂: 'quant-school',
	量化学堂: 'quant-school',
	名人堂: 'quant-legends',
	大事记: 'quant-events',
	八卦: 'quant-gossip',
	江湖八卦: 'quant-gossip',
	扑克学堂: 'poker-school',
	德州扑克: 'poker-school',
};

export function sectionOf(article: Article) {
	return CATEGORY_ALIASES[article.category] ?? DEFAULT_SECTION;
}

// 每个栏目内按发布时间正序编号：最早的一篇是第 ① 篇
export const sectionArticles = new Map<string, Article[]>(
	SECTION_KEYS.filter((key) => !isGlossarySection(key)).map((key) => [
		key,
		articles.filter((article) => sectionOf(article) === key).sort((a, b) => a.pubDate.localeCompare(b.pubDate)),
	]),
);

export function termsOfModule(moduleKey: string) {
	return terms.filter((term) => term.module === moduleKey);
}

// 默认词条取分类顺序里的第一个，与名词手册列表的首项保持一致
export function firstTermOfModule(moduleKey: string) {
	return termGroupsByModule.get(moduleKey)?.[0]?.items[0];
}

export type Route = { sectionKey: string; itemId?: string; chapter?: number };

// 栏目的默认落地项：书架进总览，名词手册进首个词条，其余进首篇文章
function firstItemOfSection(key: string) {
	if (BOOKSHELF_SECTIONS[key]) return undefined;
	if (isGlossarySection(key)) return firstTermOfModule(moduleOf(key))?.id;
	return sectionArticles.get(key)?.[0]?.id;
}

/** 纯函数：URL 路径 → 路由状态。认不出来就落到默认栏目。 */
export function parseRoute(pathname: string): Route {
	const path = pathname.replace(/^\/+|\/+$/g, '');
	const [head, ...rest] = path.split('/');

	if (head === 'term' && rest[0]) {
		const term = terms.find((item) => item.id === rest[0]);
		if (term) return { sectionKey: `${term.module}-glossary`, itemId: term.id };
	}

	if (head === 'book' && rest[0]) {
		const book = books.find((item) => item.id === rest[0]);
		if (book) {
			const chapter = Math.min(
				Math.max(Number.parseInt(rest[1] ?? '1', 10) - 1 || 0, 0),
				book.chapters.length - 1,
			);
			return { sectionKey: shelfSectionOfBook(book), itemId: book.id, chapter };
		}
	}

	if (head === 'article' && rest[0]) {
		const article = articles.find((item) => item.id === rest[0]);
		if (article) return { sectionKey: sectionOf(article), itemId: article.id };
	}

	if (head === 'section' && rest[0] && SECTION_KEYS.includes(rest[0])) {
		return { sectionKey: rest[0], itemId: firstItemOfSection(rest[0]) };
	}

	return { sectionKey: DEFAULT_SECTION, itemId: firstItemOfSection(DEFAULT_SECTION) };
}

/** parseRoute 的反函数：路由状态 → URL 路径。 */
export function routeToPath(route: Route): string {
	const { sectionKey, itemId, chapter } = route;
	if (!itemId) return `/section/${sectionKey}`;
	if (BOOKSHELF_SECTIONS[sectionKey]) return `/book/${itemId}/${(chapter ?? 0) + 1}`;
	if (isGlossarySection(sectionKey)) return `/term/${itemId}`;
	return `/article/${itemId}`;
}

/** 预渲染要生成的全部路径。 */
export function allPaths(): string[] {
	const paths = ['/'];
	for (const key of SECTION_KEYS) paths.push(`/section/${key}`);
	for (const article of articles) paths.push(`/article/${article.id}`);
	for (const term of terms) paths.push(`/term/${term.id}`);
	for (const book of books) {
		for (let i = 1; i <= book.chapters.length; i += 1) paths.push(`/book/${book.id}/${i}`);
	}
	return paths;
}
