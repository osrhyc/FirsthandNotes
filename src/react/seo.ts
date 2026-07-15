// 每个路由的 <title> / <meta description> / canonical。
// 纯函数，预渲染脚本在 Node 里调。
import { books } from './books';
import { articles } from './content';
import { terms } from './glossary';
import type { Route } from './routes';
import { BOOKSHELF_SECTIONS, isGlossarySection, parseRoute, SECTIONS } from './routes';

export const SITE_NAME = '一手笔记';
export const SITE_URL = 'https://blog.dizhuig.com';
const SITE_TAGLINE = '记录值得长期保存的知识';

export type PageMeta = { title: string; description: string; canonical: string };

/** 从渲染好的 HTML 里扒纯文本，用来当 meta description。 */
function textOf(html: string, max = 150) {
	const text = html
		.replace(/<pre[\s\S]*?<\/pre>/g, ' ')
		.replace(/<[^>]+>/g, ' ')
		.replace(/&[a-z]+;|&#\d+;/gi, ' ')
		.replace(/\s+/g, ' ')
		.trim();
	if (text.length <= max) return text;
	return `${text.slice(0, max).replace(/[，、。；：,;:]+$/, '')}…`;
}

/**
 * 路由 → 页面元数据。
 *
 * 注意 canonical 用的是 routeToPath 的结果而不是传进来的路径：/、
 * /section/quant-school、/article/quant-l1-01-what-is-quant 三个 URL 渲染的是
 * 同一个页面，必须共同指向那一个规范地址，否则算重复内容。
 */
export function metaOf(path: string): PageMeta {
	const route = parseRoute(path);
	const { sectionKey, itemId, chapter } = route;

	const fallback: PageMeta = {
		title: `${SITE_NAME} · Firsthand Notes`,
		description: SITE_TAGLINE,
		canonical: `${SITE_URL}/`,
	};
	if (!itemId) {
		const section = SECTIONS.find((s) => s.key === sectionKey);
		if (!section) return fallback;
		return {
			title: `${section.label} · ${SITE_NAME}`,
			description: `${SITE_NAME}${section.label}：${SITE_TAGLINE}`,
			canonical: `${SITE_URL}/section/${sectionKey}`,
		};
	}

	if (BOOKSHELF_SECTIONS[sectionKey]) {
		const book = books.find((b) => b.id === itemId);
		const ch = book?.chapters[chapter ?? 0];
		if (!book || !ch) return fallback;
		return {
			title: `${ch.title} · ${book.title} · ${SITE_NAME}`,
			description: textOf(ch.html) || `《${book.title}》（${book.author}）逐章精读笔记。`,
			canonical: `${SITE_URL}/book/${book.id}/${(chapter ?? 0) + 1}`,
		};
	}

	if (isGlossarySection(sectionKey)) {
		const term = terms.find((t) => t.id === itemId);
		if (!term) return fallback;
		const alias = term.aliases.length ? `（又称${term.aliases.join('、')}）` : '';
		return {
			title: `${term.term} 是什么 · ${SITE_NAME}名词手册`,
			description: textOf(term.html) || `${term.term}${alias}的解释。`,
			canonical: `${SITE_URL}/term/${term.id}`,
		};
	}

	const article = articles.find((a) => a.id === itemId);
	if (!article) return fallback;
	return {
		title: `${article.title} · ${SITE_NAME}`,
		description: article.description || textOf(article.html),
		canonical: `${SITE_URL}/article/${article.id}`,
	};
}
