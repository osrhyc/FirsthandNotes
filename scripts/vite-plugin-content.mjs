// 把每篇 md 拆成两个入口：
//   ?meta —— 只有 frontmatter 与字数，几百字节，eager 进主包当索引
//   ?body —— 只有正文，动态 import，各自成 chunk
//
// 起因：三个 eager glob 把 630 篇 md（5.2MB，其中书稿 4.5MB）整包塞进首屏，
// 并且在模块加载时就 marked.parse 了一遍——下载和解析两头都付钱。拆开之后
// 首屏只需要索引，正文各自按需下载。
import { readFile } from 'node:fs/promises';

const REQ = /^(.*\.md)\?(meta|body)$/;

// 与 src/react/content.ts 的实现保持一致：两边解析出的 frontmatter 必须一样，
// 否则索引和正文会对不上。
function parseFrontmatter(raw) {
	const match = raw.match(/^---\n([\s\S]*?)\n---\n?/);
	if (!match) return { data: {}, content: raw };

	const data = {};
	for (const line of match[1].split('\n')) {
		const i = line.indexOf(':');
		if (i === -1) continue;
		const key = line.slice(0, i).trim();
		const value = line.slice(i + 1).trim();
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

function countChineseWords(text) {
	const chinese = text.match(/[一-鿿]/g)?.length ?? 0;
	const latin = text.match(/[A-Za-z0-9_]+/g)?.length ?? 0;
	return chinese + latin;
}

export function contentSplit() {
	return {
		name: 'content-split',
		enforce: 'pre',

		async resolveId(source, importer) {
			const m = source.match(REQ);
			if (!m) return null;
			const resolved = await this.resolve(m[1], importer, { skipSelf: true });
			return resolved ? `${resolved.id}?${m[2]}` : null;
		},

		async load(id) {
			const m = id.match(REQ);
			if (!m) return null;
			const [, file, kind] = m;
			this.addWatchFile(file); // dev 下改 md 要能热更
			const { data, content } = parseFrontmatter(await readFile(file, 'utf8'));

			if (kind === 'body') {
				return `export default ${JSON.stringify(content)};`;
			}
			// 字数按去掉代码块与 markdown 记号后的正文算，和原先 content.ts 一致
			const text = content.replace(/```[\s\S]*?```/g, '').replace(/[#>*_`[\]()!-]/g, '');
			const meta = { data, wordCount: countChineseWords(text) };
			return `export default ${JSON.stringify(meta)};`;
		},
	};
}
