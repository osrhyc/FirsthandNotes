// 同步 AlphaForge 书籍精读 → src/content/books/（每章一个文件，保留章节结构）
const fs = require('fs');
const path = require('path');

const SRC = '/Users/chengyongliu/WorkSpace/code/AlphaForge/frontend/src/books';
const REG = '/Users/chengyongliu/WorkSpace/code/AlphaForge/frontend/src/pages/Books.tsx';
const OUT = '/Users/chengyongliu/WorkSpace/osrhyc/FirsthandNotes/src/content/books';

const text = fs.readFileSync(REG, 'utf8');
const books = [];
for (const match of text.matchAll(/\{[^{}]*\}/g)) {
	const block = match[0];
	if (!/id:\s*"/.test(block)) continue;
	const get = (k) => (block.match(new RegExp(k + ':\\s*"([^"]*)"')) || [])[1];
	const book = {
		id: get('id'),
		title: get('title'),
		author: get('author'),
		note: get('note'),
		category: get('category'),
	};
	if (book.id && book.title && book.category) books.push(book);
}

const esc = (s) => (s || '').replace(/'/g, '’');
// 站内相对链接转纯文本
const cleanBody = (t) => t.replace(/\[([^\]]+)\]\((\/[^)]*)\)/g, '$1');

fs.mkdirSync(OUT, { recursive: true });
// 清掉旧章节，避免残留已下架的书
for (const f of fs.readdirSync(OUT).filter((f) => f.endsWith('.md'))) {
	fs.unlinkSync(path.join(OUT, f));
}

let bookCount = 0;
let chapterCount = 0;
books.forEach((b, seq) => {
	const dir = path.join(SRC, b.id);
	if (!fs.existsSync(dir)) {
		console.log('MISSING DIR:', b.id);
		return;
	}
	const files = fs
		.readdirSync(dir)
		.filter((f) => f.endsWith('.md'))
		.sort();
	files.forEach((f, idx) => {
		const raw = fs.readFileSync(path.join(dir, f), 'utf8').trim();
		const lines = raw.split('\n');
		let chapterTitle = `第 ${idx + 1} 章`;
		let start = 0;
		if (lines[0]?.startsWith('# ')) {
			chapterTitle = lines[0].slice(2).trim();
			start = 1;
		}
		const body = cleanBody(lines.slice(start).join('\n').trim());
		const fm = [
			'---',
			`book: '${esc(b.id)}'`,
			`bookTitle: '${esc(b.title)}'`,
			`author: '${esc(b.author)}'`,
			`note: '${esc(b.note)}'`,
			`bookCategory: '${esc(b.category)}'`,
			`seq: '${seq}'`,
			`chapter: '${idx + 1}'`,
			`title: '${esc(chapterTitle)}'`,
			'---',
			'',
			'',
		].join('\n');
		fs.writeFileSync(
			path.join(OUT, `${b.id}--${String(idx + 1).padStart(2, '0')}.md`),
			fm + body + '\n',
		);
		chapterCount++;
	});
	bookCount++;
	console.log(`[${b.category}]`, b.title, `(${files.length} 章)`);
});
console.log(`done: ${bookCount} 本书, ${chapterCount} 章`);
