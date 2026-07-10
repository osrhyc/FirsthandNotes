import { marked } from 'marked';
import { parseFrontmatter } from './content';

export type Term = {
	id: string;
	term: string;
	aliases: string[];
	module: string; // 归属一级模块：quant / poker
	html: string;
};

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
			html: marked.parse(content, { async: false }) as string,
		};
	})
	.sort((a, b) => a.term.localeCompare(b.term, 'zh-CN'));

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
