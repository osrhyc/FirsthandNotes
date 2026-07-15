import { marked } from 'marked';
import { useEffect, useState } from 'react';

// 正文按需加载。每篇 md 的 ?body 是独立 chunk，主包里只有 ?meta 索引。
//
// hydration 的坑：服务端渲染时正文是有的，客户端如果要 await 才拿到，首帧就是空的，
// React 会认定不匹配、把预渲染好的整页擦掉重画——比不拆包还糟。所以预渲染时会把
// 当前这一页自己的正文内联进 HTML（见 scripts/prerender.mjs 注入的 #__seed），
// 客户端在模块加载时同步读进缓存，首帧就能命中，和服务端渲染的结果逐字一致。
// 其余 629 篇仍然按需下载。

const loaders = {
	...import.meta.glob('../content/blog/*.md', { query: '?body', import: 'default' }),
	...import.meta.glob('../content/books/*.md', { query: '?body', import: 'default' }),
	...import.meta.glob('../content/glossary/*.md', { query: '?body', import: 'default' }),
} as Record<string, () => Promise<string>>;

// key 形如 blog/foo、books/cycles--12、glossary/bar，与 ?meta 索引里记的 src 一致
export function keyOf(path: string) {
	return path.replace(/^.*\/content\//, '').replace(/\.md$/, '');
}

const byKey = new Map<string, () => Promise<string>>();
for (const [path, load] of Object.entries(loaders)) byKey.set(keyOf(path), load);

const html = new Map<string, string>();
const inflight = new Map<string, Promise<void>>();

function render(md: string) {
	return marked.parse(md, { async: false }) as string;
}

/** 同步取正文；没有就返回 undefined（调用方负责触发加载） */
export function bodyHtml(key: string): string | undefined {
	return html.get(key);
}

/**
 * 预渲染专用：把正文读进缓存，并把原始 md 交回去内联成种子。
 * 种子存 md 而不是渲染后的 html——md 更小，而且和 #root 里那份重复的部分
 * 高度相似，gzip/brotli 能把这段重复压掉大半。
 */
export async function preloadBody(key: string): Promise<string | undefined> {
	const load = byKey.get(key);
	if (!load) return undefined;
	const md = await load();
	html.set(key, render(md));
	return md;
}

/** 把某篇正文读进缓存。预渲染在 render 之前调用它，浏览器在缓存未命中时调用。 */
export function loadBody(key: string): Promise<void> {
	if (html.has(key)) return Promise.resolve();
	let p = inflight.get(key);
	if (p) return p;
	const load = byKey.get(key);
	if (!load) return Promise.resolve();
	p = load().then((md) => {
		html.set(key, render(md));
		inflight.delete(key);
	});
	inflight.set(key, p);
	return p;
}

// 预渲染注入的种子：首帧要靠它，必须同步读，不能等 effect。
if (typeof document !== 'undefined') {
	const el = document.getElementById('__seed');
	if (el?.textContent) {
		try {
			const seed = JSON.parse(el.textContent) as Record<string, string>;
			for (const [key, md] of Object.entries(seed)) html.set(key, render(md));
		} catch {
			// 种子坏了不致命：下面的 useBody 会异步补，只是这一页会闪一下
		}
	}
}

/** 订阅某篇正文。缓存命中就同步返回（hydration 首帧走这条路）。 */
export function useBody(key: string | undefined): string {
	const [, bump] = useState(0);
	useEffect(() => {
		if (!key || html.has(key)) return;
		let alive = true;
		loadBody(key).then(() => {
			if (alive) bump((n) => n + 1);
		});
		return () => {
			alive = false;
		};
	}, [key]);
	return (key && html.get(key)) || '';
}

/** 订阅一组正文（术语浮窗会同时开好几个） */
export function useBodies(keys: string[]): number {
	const [version, bump] = useState(0);
	const joined = keys.join(',');
	useEffect(() => {
		const missing = joined.split(',').filter((k) => k && !html.has(k));
		if (!missing.length) return;
		let alive = true;
		Promise.all(missing.map(loadBody)).then(() => {
			if (alive) bump((n) => n + 1);
		});
		return () => {
			alive = false;
		};
	}, [joined]);
	return version;
}
