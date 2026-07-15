import { marked } from 'marked';
import { parseFrontmatter } from './content';

export type Term = {
	id: string;
	term: string;
	aliases: string[];
	module: string; // 归属一级模块：quant / poker
	category: string; // 二级分类，决定名词手册里的分组
	html: string;
};

// 分类顺序：平台自有概念按学习路径排，出自某本书的词单独成组、排在其后，
// 组间顺序与书架一致。未列出的分类排在最后。
const CATEGORY_ORDER = [
	'入门通识',
	'市场制度与数据',
	'因子研究',
	'回测与评价',
	'经典异象',
	'研究陷阱',
	'《周期》',
	'《底层逻辑》',
	'《系统思考》',
	'《一网打尽》',
];

const modules = import.meta.glob('../content/glossary/*.md', {
	query: '?raw',
	import: 'default',
	eager: true,
}) as Record<string, string>;

function getId(path: string) {
	return path.split('/').pop()?.replace(/\.md$/, '') ?? path;
}

export const terms: Term[] = Object.entries(modules)
	.map(([path, raw]) => {
		const { data, content } = parseFrontmatter(raw);
		return {
			id: getId(path),
			term: String(data.term ?? getId(path)),
			aliases: Array.isArray(data.aliases) ? data.aliases.map(String) : [],
			module: String(data.module ?? 'quant'),
			category: String(data.category ?? '未分类'),
			html: marked.parse(content, { async: false }) as string,
		};
	})
	.sort((a, b) => a.term.localeCompare(b.term, 'zh-CN'));

// 名词手册分组：按模块 → 分类聚合，组内保持词条的拼音顺序
export const termGroupsByModule = new Map<string, { name: string; items: Term[] }[]>();
for (const term of terms) {
	let groups = termGroupsByModule.get(term.module);
	if (!groups) {
		groups = [];
		termGroupsByModule.set(term.module, groups);
	}
	let group = groups.find((g) => g.name === term.category);
	if (!group) {
		group = { name: term.category, items: [] };
		groups.push(group);
	}
	group.items.push(term);
}
for (const groups of termGroupsByModule.values()) {
	const rank = (name: string) => {
		const i = CATEGORY_ORDER.indexOf(name);
		return i === -1 ? CATEGORY_ORDER.length : i;
	};
	groups.sort((a, b) => rank(a.name) - rank(b.name) || a.name.localeCompare(b.name, 'zh-CN'));
}

function escapeRegExp(text: string) {
	return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 把正文 HTML 里出现的术语（含别名）包成可点击的 .term-link 按钮
export function decorateTerms(html: string, list: Term[]): string {
	if (!list.length) return html;

	const nameToId = new Map<string, string>();
	for (const term of list) {
		nameToId.set(term.term, term.id);
		for (const alias of term.aliases) {
			if (!nameToId.has(alias)) nameToId.set(alias, term.id);
		}
	}
	// 长词优先，避免「前复权」被「复权」截胡
	const names = [...nameToId.keys()].sort((a, b) => b.length - a.length);
	const pattern = new RegExp(names.map(escapeRegExp).join('|'), 'g');

	const doc = new DOMParser().parseFromString(`<div id="__root">${html}</div>`, 'text/html');
	const root = doc.getElementById('__root');
	if (!root) return html;

	const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
	const textNodes: Text[] = [];
	let node: Node | null;
	while ((node = walker.nextNode())) {
		const parent = (node as Text).parentElement;
		if (!parent) continue;
		// 代码、链接、标题里的术语不做点击处理
		if (parent.closest('code, pre, a, h1, h2, h3, .term-link')) continue;
		textNodes.push(node as Text);
	}

	// 每个术语全文只标注第一次出现，避免高频词满屏红链
	const usedIds = new Set<string>();

	for (const textNode of textNodes) {
		const text = textNode.nodeValue ?? '';
		pattern.lastIndex = 0;
		if (!pattern.test(text)) continue;
		pattern.lastIndex = 0;

		const fragment = doc.createDocumentFragment();
		let cursor = 0;
		let changed = false;
		let match: RegExpExecArray | null;
		while ((match = pattern.exec(text))) {
			const id = nameToId.get(match[0]) ?? '';
			if (!id || usedIds.has(id)) continue; // 已标注过：保持纯文本
			usedIds.add(id);
			changed = true;
			fragment.appendChild(doc.createTextNode(text.slice(cursor, match.index)));
			const button = doc.createElement('button');
			button.type = 'button';
			button.className = 'term-link';
			button.dataset.term = id;
			button.textContent = match[0];
			fragment.appendChild(button);
			cursor = match.index + match[0].length;
		}
		if (!changed) continue;
		fragment.appendChild(doc.createTextNode(text.slice(cursor)));
		textNode.parentNode?.replaceChild(fragment, textNode);
	}

	return root.innerHTML;
}
