## Development

This project uses Astro + Fuwari for a static article and reading-note site.

```
npm run dev -- --port 4321
```

Build static output with:

```
npm run build
```

The GitHub Pages workflow publishes `dist/`.

## Documentation

Markdown source data is split across four Astro Content Collections:

- `src/content/posts/`: regular articles and glossary posts.
- `src/content/books/`: one metadata file per book.
- `src/content/book-notes/`: chapter notes linked to books with `reference("books")`.
- `src/content/briefings/`: daily briefings.

Use `astro.config.mjs`, `src/config.ts`, `src/content.config.ts`, `src/styles/`, `src/components/`, and `src/layouts/` for site/theme changes.

The current product and architecture baseline is documented in `docs/product-design.md`. When an older proposal conflicts with that file or the current code, follow the current baseline and implementation.

## Brand

- Chinese name: `一手笔记`
- English name: `Firsthand Notes`
- Slogan: `记录值得长期保存的知识`
- Primary logo: `public/assets/brand/logo.png`
- Brand reference: `public/assets/brand/brand-guide.png`
- Core palette: deep navy `#111d2d`, gold `#d99a20`, and warm white `#f5f4f1`

Keep the logo proportions and colors intact. Do not replace the mark with a generic book or home icon, and keep new UI consistent with the restrained navy-and-gold reading theme.

## Research-First Writing Agent

For article-writing tasks, follow the shared workflow in `.ai/writing-agent.md`.

This applies when the user asks for book-related research, content breakdowns, skill-learning documents, people or industry stories, rumors, major events, or other source-dependent writing. True reading from a provided PDF/EPUB uses `.ai/read-book.md` instead.

Core requirements:

- Research before drafting when web/current/source-backed information matters.
- Filter sources by quality and clearly separate facts, opinions, rumors, and inference.
- Cite source-backed claims with Markdown links.
- Save publishable posts under `src/content/posts/` with frontmatter when asked to create an article in this repo.
- After every writing change, build the project, run the local dev server with `npm run dev -- --port 4321`, and give the user the preview URL.
- Do not publish, push, deploy, or send article changes to GitHub until the user has reviewed locally and explicitly approves publishing.

## Daily Briefing Agent

For the scheduled 每日简报, follow `.ai/daily-briefing.md`.

- The scheduler is a ChatGPT task running daily at 10:00 Asia/Shanghai. Do not introduce n8n.
- Research dynamically across AI, development, entrepreneurship, marketing, business, finance, stocks, and funds.
- Keep facts, market interpretation, rumors, and editorial inference distinct, with source links.
- The daily briefing automation has publication permission only for its own briefing output. Other content still requires local review and explicit approval.

## Glossary Workflow (名词手册)

When the user asks what a term means (e.g. "换手率是什么"), after answering in chat, also save the explanation to `src/content/posts/glossary-<pinyin-slug>.md` with this frontmatter:

```yaml
---
title: '换手率'
description: '术语的一句话定义'
pubDate: 'YYYY-MM-DD'
category: '名词手册'
tags: ['quant']
term: '换手率'
aliases: ['turnover rate']
module: 'quant'
glossaryCategory: '入门通识'
---
```

The body is a concise Markdown explanation (definition first, then examples / tables / practical notes). Terms are part of the `posts` Collection and receive normal static pages and Pagefind indexing.

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
- Output chapters to `src/content/book-notes/<slug>--NN.md` using the existing schema (book/bookTitle/author/note/bookCategory/bookModule/seq/chapter/title/updated). `book` must reference an existing `src/content/books/<slug>.md` entry. `chapter` is a running sequence number: 1 = 导读, then one per real chapter, last = 总结.
- Publishing still requires explicit user approval.
