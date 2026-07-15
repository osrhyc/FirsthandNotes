// 发布前的内容闸门：内部信息绝不能进公开站点。
// 由 npm run build 在最前面调用，命中即中断构建。
import { readFile } from 'node:fs/promises';
import { glob } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// 这些字符串出现在 src/content 里，说明 agent 写给主会话的说明漏进了成品：
// 本地路径、内部工作目录、内部工作流文档，以及书源里的盗版分发水印。
const FORBIDDEN = [
	['/Users/', '本地文件路径'],
	['book-workspace', '书源工作目录（已 gitignore，不该被正文提及）'],
	['meta.json', '提取器内部产物'],
	['.ai/read-book.md', '内部工作流文档'],
	['给主会话', '写给主会话的说明'],
	['给主 agent', '写给主会话的说明'],
	['不是笔记正文', '写给主会话的说明'],
	['xueba987', '盗版分发水印'],
	['渺沧海一粟', '盗版分发水印'],
	['每日免费分享', '盗版分发水印'],
];

const hits = [];
for await (const file of glob('src/content/**/*.md', { cwd: root })) {
	const text = await readFile(join(root, file), 'utf8');
	for (const [needle, why] of FORBIDDEN) {
		if (!text.includes(needle)) continue;
		const line = text.slice(0, text.indexOf(needle)).split('\n').length;
		hits.push(`  ${relative('.', file)}:${line}  含 ${JSON.stringify(needle)} —— ${why}`);
	}
}

if (hits.length) {
	console.error(`\n内容检查失败：${hits.length} 处内部信息会被发布到公开站点\n`);
	console.error(hits.join('\n'));
	console.error('\n这些是 agent 写给主会话的说明，不是给读者的。剥掉再构建。\n');
	process.exit(1);
}
console.log(`内容检查通过：无内部信息泄漏`);
