# Read-Book Agent — 真读原书的逐章速读

This is the shared reading workflow for Codex, Cursor, and Claude Code. Use it when the user asks for "真读原书", "真读速读", chapter notes, or book notes based on a provided PDF/EPUB.

Core goal: extract publishable chapter notes from the real book text into `src/content/books/`. Notes must come from extracted text or page images only. Do not write from reviews, summaries, search snippets, or model memory.

## 1. Startup Checklist

Before reading, confirm or infer:

- Source file path exists and points to a user-provided PDF/EPUB.
- Whether the book is copyrighted or public-domain.
- Book title, author, slug, category, and target module:
  - `bookModule: 'quant'` for 量化书屋.
  - `bookModule: 'library'` for 书房.
- Whether to create/update glossary entries in `src/content/glossary/`.
- Whether the extracted text is readable enough to proceed.

If any required text is missing, garbled, scanned without readable text, or incomplete, report it instead of improvising.

## 2. Extraction Paths

### A. Text-Based PDF/EPUB

Run:

```bash
python3 scripts/extract-book.py <PDF/EPUB 文件路径> [--slug <slug>] [--level N]
```

Review `book-workspace/<slug>/meta.json` and the chapter table. The chapter boundaries must match the real table of contents. If TOC pages are mostly `0`, chapters are too large, or boundaries are wrong, retry with `--level`; use heading-regex fallback only when TOC is unusable.

### B. Scanned Or Image-Based Book

If total extracted characters are near zero:

1. Inspect 2-3 pages first to confirm layout: horizontal/vertical text, footnotes, annotations, and page order.
2. Build a page-to-chapter mapping table: page number, starting chapter, and first visible text column/line.
3. Read chapter page images directly; do not OCR blindly if layout is complex.
4. If the user provides a public-domain reference text, store it in `book-workspace/<slug>/reference.md` as a checking base.
5. For ancient/public-domain texts, preserve uncertainty: mark missing, damaged, doubtful, or reference-filled text as `存疑` / `据参照本补`. Do not silently repair text.

## 3. Parallel Chapter Reading

Use one sub-agent per chapter or merged unit when available. If there are more than 20 chapters, merge by part/section into 8-20 reading units. If a single chapter exceeds 30,000 Chinese characters, either split it or allow up to about 2,600 Chinese characters in the note.

Each chapter prompt must include:

- The absolute material path.
- An instruction to read the full file/page range, using offset chunks if needed.
- A fidelity rule: source-traceable, report missing text, and no background-knowledge filling.
- The copyright quote policy.

Sub-agents return body text only. The main session writes files.

## 4. Quote And Copyright Policy

- Copyrighted books: paraphrase first. Direct quotes are limited to at most 2 per chapter, each no more than 25 Chinese characters, with approximate page numbers.
- Public-domain books: original text may be included in full when useful, with simplified Chinese and punctuation if the project format needs it.
- Raw book files, extracted text, page images, and `book-workspace/` content must never be committed or published.

## 5. Chapter Note Template

Use this structure for each real chapter:

```markdown
CHAPTER_TITLE: 第X章　主标题

> TL;DR：3~5 句短句直给。

## 原文

公版书可放全文；版权书省略本节。

## 详读

### 小节标题

按原章顺序解释论证脉络、案例、数字、人名、关键转折和作者结论。

## 案例档案

| 案例 | 一句话经过 | 在书中的作用（佐证哪个论点） |
| --- | --- | --- |

## 怎么用

1~3 条，必须由本章内容直接推出。

## 要点清单

- 4~8 条，每条一句。
```

Rules:

- `## 详读` must use `###` sections. Avoid bold-only paragraph walls.
- Keep important numbers, case names, people, companies, and events.
- Mark commentator views as `某注认为...`.
- `## 案例档案` only includes real people, companies, and events. Fictional thought experiments are omitted or marked as `设例`.
- If adding examples outside the book, put them under a separate `延伸案例（编者补）` block and start with `编者补，非原书内容`。
- Extended examples must not be mixed into TL;DR, the main detailed reading, or the original-book case index.

## 6. Assembly And Frontmatter

The main session creates:

- Chapter 1: 导读, including book positioning, one-minute author intro, whole-book map, who should read it, how to read it, and version/source notes.
- Real chapters: original chapter N maps to `chapter: N + 1`.
- Final chapter: 总结与行动清单, including review cards, whole-book case index, tools or takeaway sentences, the book's limits, and checklist items.

Use single-quoted frontmatter:

```yaml
---
book: 'slug'
bookTitle: '书名'
author: '作者'
note: '真读逐章精读：一句话定位'
bookCategory: '分类'
bookModule: 'quant'
seq: 100
chapter: 1
title: '导读'
---
```

`seq` controls bookshelf order. Check existing values with:

```bash
grep -h "seq:" src/content/books/*.md | sort -n
```

## 7. Glossary Generation

When useful, create 3-8 glossary entries per book in `src/content/glossary/`.

- Use `module: 'quant'` for quant books.
- Use `module: 'library'` for general library books.
- Do not duplicate existing terms; update existing files instead.
- Terms must be beginner-friendly and self-contained.

## 8. Quality Gate Before Writing Files

Before writing final Markdown, check:

- TL;DR has 3-5 sentences.
- `## 详读` has real `###` sections.
- The note follows the original chapter order.
- Key numbers, names, cases, and examples are preserved.
- Missing or doubtful source text remains marked.
- Quotes obey the quote limit and have approximate page numbers.
- No unsupported background knowledge has entered the main note.
- Chapter mapping is correct.
- Original-book cases and editor-added examples are clearly separated.

## 9. Verification

After writing:

1. Run `npx tsc --noEmit && npm run build`.
2. Start or refresh the local preview with `npm run dev -- --port 4321`.
3. Check that the book appears on the correct shelf, chapters are complete, and navigation works.
4. Spot-check at least 2 chapters by grepping key sentences, case names, or numbers back to extracted text.
5. Run `git status` and confirm `book-workspace/`, source books, extracted text, PDFs, EPUBs, and page images are not tracked.

## 10. Publishing

Show the local result first. Commit, push, publish, or deploy only after the user explicitly approves.

## Red Lines

- Never download copyrighted books from the internet, GitHub collections, or mirror sites.
- Do not use book reviews, blurbs, SEO summaries, or memory as substitutes for the original text.
- Do not publish or commit raw source material.
- Do not hide extraction failures, scanned-page limits, missing chapters, garbled text, or uncertain readings.
