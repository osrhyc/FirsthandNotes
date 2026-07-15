// 把每个路由渲染成 dist/<路径>/index.html。
// 跑法：npm run build（vite build && vite build --ssr && node scripts/prerender.mjs）
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DOMParser, Node, NodeFilter, parseHTML } from 'linkedom';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

// glossary.ts 的 decorateTerms 用 DOMParser 做术语高亮，Node 里没有这个 API。
// 补一个 spec 兼容的实现，让 SSR 和浏览器走同一条代码路径 —— 否则两边产出的
// HTML 不一致，hydration 会整片重画。
const { document } = parseHTML('<!doctype html><html><body></body></html>');
globalThis.DOMParser = DOMParser;
globalThis.document = document;
globalThis.Node = Node;
globalThis.NodeFilter = NodeFilter;

const { render, allPaths } = await import(join(dist, 'server/entry-server.js'));

const template = await readFile(join(dist, 'index.html'), 'utf8');
const paths = allPaths();

let done = 0;
const failures = [];

for (const path of paths) {
	try {
		const { html, style, meta } = render(path);
		const page = template
			.replace(
				'<title>一手笔记 · Firsthand Notes</title>',
				`<title>${esc(meta.title)}</title>`,
			)
			.replace(
				'<meta name="description" content="记录值得长期保存的知识" />',
				[
					`<meta name="description" content="${esc(meta.description)}" />`,
					`<link rel="canonical" href="${esc(meta.canonical)}" />`,
					`<meta property="og:title" content="${esc(meta.title)}" />`,
					`<meta property="og:description" content="${esc(meta.description)}" />`,
					`<meta property="og:url" content="${esc(meta.canonical)}" />`,
					`<meta property="og:type" content="article" />`,
				].join('\n\t\t'),
			)
			.replace('</head>', `\t${style}\n\t</head>`)
			.replace('<div id="root"></div>', `<div id="root">${html}</div>`);

		const outDir = path === '/' ? dist : join(dist, path);
		await mkdir(outDir, { recursive: true });
		await writeFile(join(outDir, 'index.html'), page);
		done += 1;
	} catch (err) {
		failures.push(`${path}: ${err.message}`);
	}
}

console.log(`预渲染 ${done}/${paths.length} 个页面 → dist/`);
if (failures.length) {
	console.error(`\n${failures.length} 个失败：`);
	for (const f of failures.slice(0, 10)) console.error(`  ${f}`);
	process.exit(1);
}

// sitemap 只收 canonical 地址，避免把 / 和 /section/x 这种同页别名重复提交
const { SITE_URL, metaOf } = await import(join(dist, 'server/entry-server.js')).then((m) => m);
const canonical = [...new Set(paths.map((p) => metaOf(p).canonical))].sort();
await writeFile(
	join(dist, 'sitemap.xml'),
	`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${canonical
		.map((url) => `\t<url><loc>${esc(url)}</loc></url>`)
		.join('\n')}\n</urlset>\n`,
);
await writeFile(
	join(dist, 'robots.txt'),
	`User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
);
console.log(`sitemap.xml：${canonical.length} 条 canonical（${paths.length - canonical.length} 条同页别名已去重）`);

function esc(s) {
	return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
