## Development

This project now uses React + Ant Design + Vite for a static article management interface.

```
npm run dev -- --port 4321
```

Build static output with:

```
npm run build
```

The GitHub Pages workflow publishes `dist/`.

## Documentation

Use the React code under `src/react/` for UI changes. Markdown articles live under `src/content/blog/` and are loaded by `src/react/content.ts`.

## Research-First Writing Agent

For article-writing tasks, follow the shared workflow in `.ai/writing-agent.md`.

This applies when the user asks for book notes, content breakdowns, skill-learning documents, people or industry stories, rumors, major events, or other source-dependent writing.

Core requirements:

- Research before drafting when web/current/source-backed information matters.
- Filter sources by quality and clearly separate facts, opinions, rumors, and inference.
- Cite source-backed claims with Markdown links.
- Save publishable posts under `src/content/blog/` with frontmatter when asked to create an article in this repo.
- After every writing change, build the project, run the local dev server with `npm run dev -- --port 4321`, and give the user the preview URL.
- Do not publish, push, deploy, or send article changes to GitHub until the user has reviewed locally and explicitly approves publishing.

## Glossary Workflow (名词手册)

When the user asks what a term means (e.g. "换手率是什么"), after answering in chat, also save the explanation to `src/content/glossary/<pinyin-slug>.md` with this frontmatter:

```yaml
---
term: '换手率'            # 术语本名
aliases: ['turnover rate'] # 别名/相关说法（正文中出现也会变成可点击）
module: 'quant'            # 归属一级模块：quant / poker
pubDate: 'YYYY-MM-DD'
---
```

The body is a concise Markdown explanation (definition first, then examples / tables / practical notes). Terms are automatically:

- listed in that module's 名词手册 second-level menu, and
- turned into clickable `.term-link` elements wherever they appear in article bodies (a side card shows the explanation).

Keep explanations self-contained and beginner-friendly. Do not duplicate an existing term file — update it instead.

## Reading Agent (真读精读)

For "真读原书" book notes, follow the shared workflow in `.ai/read-book.md`.
Claude Code can also use `.claude/commands/read-book.md` as the `/read-book` command, and Cursor can use `.cursor/rules/read-book.mdc`.

Key rules:

- Book files (PDF/EPUB) are provided by the user. NEVER download books from the internet or GitHub collections — those are pirated copies.
- 先 `python3 scripts/extract-book.py <file> --slug S --plan` 看 TOC 树与单元建议，核对印刷目录后再去掉 --plan 落盘；`--spec plan.json` 可手工精确控制。原文进 `book-workspace/<slug>/`（已 gitignore，绝不入库/发布）。
- **精读 is the only mode** — every book is read completely, chapter by chapter. There is no fast-reading/targeted/skim mode.
- **阅读单元 = 一篇笔记**：默认一章一个单元；章 >1.5万字且有节 → 按节分组成若干单元（不跨章）；无节可用 → 派两个 agent 出（上）（下）。部/篇 只是分组，永不做单元。目标 5k~15k 字/单元。
- **绝不合并章**：`第1~2章` 这种标题即缺陷。短章写短笔记；细化永远允许，合并永远不行。
- 一个阅读单元一个子 agent；书长就分批跑，绝不合并单元。
- Notes must be derived from the extracted chapter text only — no reviews, no summaries from memory. If text is missing/garbled (scanned PDF), report instead of improvising.
- Note format: per real chapter, `> TL;DR：` (3~5 句) + `## 详读` (短章 800~1200 字 / 常规 1200~2000 字 / 厚章 2000~3000 字，论证脉络+案例+要点) + 案例档案 + 延伸案例（编者补）+ 怎么用 + 要点清单.
- Copyright guardrails: paraphrase-first; direct quotes ≤2 per chapter, ≤25 chars each, with page numbers.
- Output chapters to `src/content/books/<slug>--NN.md` using the existing schema (book/bookTitle/author/note/bookCategory/bookModule/seq/chapter/title). `chapter` is a running sequence number: 1 = 导读, then one per real chapter, last = 总结.
- Publishing still requires explicit user approval.
