import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contentDir = path.join(root, 'src/content');
const docsDir = path.join(contentDir, 'docs');

const esc = (value) => String(value ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function emptyDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  ensureDir(dir);
}

function readMarkdown(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return { data: {}, body: raw };
  return { data: parseFrontmatter(match[1]), body: raw.slice(match[0].length) };
}

function parseFrontmatter(source) {
  const data = {};
  const lines = source.split('\n');
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    data[key] = normalizeValue(rawValue);
  }
  return data;
}

function normalizeValue(value) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function frontmatter({ title, description, order }) {
  return [
    '---',
    `title: "${esc(title)}"`,
    description ? `description: "${esc(description)}"` : undefined,
    'editUrl: false',
    'sidebar:',
    `  order: ${order}`,
    '---',
    '',
  ]
    .filter(Boolean)
    .join('\n');
}

function listMarkdown(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.md') && !file.startsWith('.'))
    .sort();
}

function writeDoc(target, meta, body) {
  ensureDir(path.dirname(target));
  fs.writeFileSync(target, `${frontmatter(meta)}${body.trim()}\n`);
}

function syncBlog() {
  const source = path.join(contentDir, 'blog');
  const files = listMarkdown(source);
  let quantOrder = 10;
  let storyOrder = 10;
  let dailyOrder = 10;

  for (const file of files) {
    const fullPath = path.join(source, file);
    const { data, body } = readMarkdown(fullPath);
    const slug = file.replace(/\.md$/, '');
    const category = data.category || '';
    const title = data.title || slug;
    const description = data.description || [category, data.level].filter(Boolean).join(' · ');

    if (slug.startsWith('daily-briefing')) {
      writeDoc(path.join(docsDir, 'daily', file), { title, description, order: dailyOrder }, body);
      dailyOrder += 10;
      continue;
    }

    if (category.includes('量化') || slug.startsWith('quant-')) {
      writeDoc(path.join(docsDir, 'quant', file), { title, description, order: quantOrder }, body);
      quantOrder += 10;
      continue;
    }

    writeDoc(path.join(docsDir, 'stories', file), { title, description, order: storyOrder }, body);
    storyOrder += 10;
  }
}

function syncBooks() {
  const source = path.join(contentDir, 'books');
  const files = listMarkdown(source);
  for (const file of files) {
    const { data, body } = readMarkdown(path.join(source, file));
    const seq = Number(data.seq || data.chapter || 999);
    const title = data.title || data.note || file.replace(/\.md$/, '');
    const bookTitle = data.bookTitle || data.book || '读书笔记';
    writeDoc(
      path.join(docsDir, 'books', file),
      {
        title: `${bookTitle}｜${title}`,
        description: data.note || data.author || bookTitle,
        order: Number.isFinite(seq) ? seq : 999,
      },
      body
    );
  }
}

function syncGlossary() {
  const source = path.join(contentDir, 'glossary');
  const files = listMarkdown(source);
  let order = 10;
  for (const file of files) {
    const { data, body } = readMarkdown(path.join(source, file));
    const term = data.term || file.replace(/\.md$/, '');
    writeDoc(
      path.join(docsDir, 'glossary', file),
      {
        title: term,
        description: data.category || data.module || '名词解释',
        order,
      },
      body
    );
    order += 10;
  }
}

function writeHome() {
  writeDoc(
    path.join(docsDir, 'index.md'),
    {
      title: '一手笔记',
      description: '长期阅读、量化学习、每日简报和名词手册。',
      order: 0,
    },
    [
      '这里是一个面向沉浸阅读的个人知识库，使用 Astro Starlight 生成静态页面。',
      '',
      '## 内容入口',
      '',
      '- **每日简报**：每天整理 AI、开发、创业、营销、金融与市场信息。',
      '- **量化学堂**：中国股票基金量化入门与进阶学习文档。',
      '- **人物与事件**：行业人物、事件脉络、故事与资料拆解。',
      '- **读书笔记**：真读精读后的章节笔记。',
      '- **名词手册**：量化、投资与阅读中反复出现的核心术语。',
    ].join('\n')
  );
}

emptyDir(docsDir);
writeHome();
syncBlog();
syncBooks();
syncGlossary();

console.log('Synced Starlight docs content.');
