// 同步 AlphaForge 的人物、大事记、八卦、名词到博客内容目录
const fs = require('fs');
const path = require('path');

const SRC = '/Users/chengyongliu/WorkSpace/code/AlphaForge/frontend/src';
const BLOG = '/Users/chengyongliu/WorkSpace/osrhyc/FirsthandNotes/src/content/blog';
const GLOSSARY = '/Users/chengyongliu/WorkSpace/osrhyc/FirsthandNotes/src/content/glossary';

const esc = (s) => (s || '').replace(/'/g, '’');

// 站内相对链接（/people、/docs 等）转成纯文本；保留 http 外链
function cleanBody(text) {
	return text.replace(/\[([^\]]+)\]\((\/[^)]*)\)/g, '$1');
}

function parseArticle(file) {
	const raw = fs.readFileSync(file, 'utf8').trim();
	const lines = raw.split('\n');
	let title = path.basename(file, '.md');
	let start = 0;
	if (lines[0]?.startsWith('# ')) {
		title = lines[0].slice(2).trim();
		start = 1;
	}
	const body = cleanBody(lines.slice(start).join('\n').trim());
	// 描述取首个引用块第一行
	const quote = body.split('\n').find((l) => l.startsWith('> '));
	let description = (quote || '').replace(/^> /, '').replace(/\*\*/g, '').replace(/\[|\]/g, '');
	if (description.length > 75) description = description.slice(0, 72) + '…';
	return { title, body, description };
}

// ===== 1) 人物 → 名人堂；2) 编年史 → 大事记 / 江湖八卦 =====
const PLANS = [
	{ dir: 'people/international', category: '名人堂', group: '国际先驱', prefix: 'person-intl' },
	{ dir: 'people/china', category: '名人堂', group: '中国量化', prefix: 'person-cn' },
	{ dir: 'people/legends', category: '名人堂', group: '江湖传奇', prefix: 'person-legend' },
	{ dir: 'chronicle/timeline', category: '大事记', group: '时间线', prefix: 'event-timeline' },
	{ dir: 'chronicle/crashes', category: '大事记', group: '崩盘与事故', prefix: 'event-crash' },
	{ dir: 'chronicle/feuds', category: '江湖八卦', group: '恩怨纷争', prefix: 'gossip-feud' },
	{ dir: 'chronicle/gossip', category: '江湖八卦', group: '圈内轶闻', prefix: 'gossip-tale' },
];

const counters = {};
for (const plan of PLANS) {
	const dir = path.join(SRC, plan.dir);
	const files = fs
		.readdirSync(dir)
		.filter((f) => f.endsWith('.md'))
		.sort();
	for (const f of files) {
		const { title, body, description } = parseArticle(path.join(dir, f));
		counters[plan.category] = (counters[plan.category] ?? 0) + 1;
		const day = counters[plan.category];
		const base = new Date('2026-04-01T00:00:00Z');
		const dateStr = new Date(base.getTime() + (day - 1) * 86400000).toISOString().slice(0, 10);
		const slug = `${plan.prefix}-${path.basename(f, '.md')}`;
		const fm = [
			'---',
			`title: '${esc(title)}'`,
			`description: '${esc(description)}'`,
			`pubDate: '${dateStr}'`,
			`category: '${plan.category}'`,
			`level: '${plan.group}'`,
			`tags: ['${plan.category}']`,
			'---',
			'',
			'',
		].join('\n');
		fs.writeFileSync(path.join(BLOG, `${slug}.md`), fm + body + '\n');
		console.log(`[${plan.category}/${plan.group}]`, title);
	}
}

// ===== 3) 名词速查手册 → 名词手册词条 =====
// 已有词条（含别名）不重复导入
const existing = new Set();
for (const f of fs.readdirSync(GLOSSARY).filter((f) => f.endsWith('.md'))) {
	const raw = fs.readFileSync(path.join(GLOSSARY, f), 'utf8');
	const term = raw.match(/term:\s*'([^']+)'/)?.[1];
	if (term) existing.add(term);
	const aliases = raw.match(/aliases:\s*\[([^\]]*)\]/)?.[1] ?? '';
	for (const a of aliases.split(',')) {
		const v = a.trim().replace(/^['"]|['"]$/g, '');
		if (v) existing.add(v);
	}
}

const glossaryRaw = fs.readFileSync(path.join(SRC, 'docs/07-glossary.md'), 'utf8');
const entries = [];
let current = null;
for (const line of glossaryRaw.split('\n')) {
	const h3 = line.match(/^### (.+)$/);
	if (h3) {
		if (current) entries.push(current);
		current = { heading: h3[1].trim(), lines: [] };
		continue;
	}
	if (/^## /.test(line)) {
		if (current) entries.push(current);
		current = null;
		continue;
	}
	if (current) current.lines.push(line);
}
if (current) entries.push(current);

let added = 0;
let skipped = 0;
let index = 0;
for (const entry of entries) {
	index++;
	// 解析 "IC（信息系数，Information Coefficient）" → term + aliases
	const m = entry.heading.match(/^(.+?)[（(](.+?)[)）]\s*$/);
	const term = (m ? m[1] : entry.heading).trim();
	let aliases = m ? m[2].split(/[，,、]/).map((s) => s.trim()).filter(Boolean) : [];
	// 纯小写英文单词别名容易误伤正文（如 period），丢弃
	aliases = aliases.filter((a) => !/^[a-z]+$/.test(a));
	if (existing.has(term)) {
		skipped++;
		console.log('[名词-跳过重复]', term);
		continue;
	}
	existing.add(term);
	let body = cleanBody(entry.lines.join('\n').trim());
	body = body.replace(/[（(]?详见[^。）)]*[）)]?。?/g, '').trim();
	if (!body) {
		skipped++;
		continue;
	}
	const ascii = term.toLowerCase().replace(/[^a-z0-9]+/g, '');
	const slug = `dict-${String(index).padStart(2, '0')}${ascii ? '-' + ascii : ''}`;
	const fm = [
		'---',
		`term: '${esc(term)}'`,
		`aliases: [${aliases.map((a) => `'${esc(a)}'`).join(', ')}]`,
		"module: 'quant'",
		"pubDate: '2026-07-10'",
		'---',
		'',
		'',
	].join('\n');
	fs.writeFileSync(path.join(GLOSSARY, `${slug}.md`), fm + body + '\n');
	added++;
	console.log('[名词]', term, aliases.length ? `(别名: ${aliases.join('/')})` : '');
}
console.log(`\ndone. 名词新增 ${added}，跳过 ${skipped}`);
