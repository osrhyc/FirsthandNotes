# Read-Book Agent — 真读原书的逐章精读

This is the shared reading workflow for Codex, Cursor, and Claude Code. Use it when the user asks for "真读原书", chapter notes, or book notes based on a provided PDF/EPUB.

Core goal: extract publishable chapter notes from the real book text into `src/content/books/`. Notes must come from extracted text or page images only. Do not write from reviews, summaries, search snippets, or model memory.

**There is only one mode: 精读 (full close reading).** Every book is read completely, chapter by chapter. There is no fast-reading / targeted / skim mode. If the user asks a question about a book, answer it from the chapter notes — produce the notes first if they do not exist yet.

## 1. Startup Checklist

Before reading, confirm or infer:

- Source file path exists and points to a user-provided PDF/EPUB.
- Whether the book is copyrighted or public-domain.
- Book title, author, slug, category, and target module:
  - `bookModule: 'quant'` for 量化书屋.
  - `bookModule: 'library'` for 书房.
- Slug collision: check `ls src/content/books/ | grep <slug>`. If the book already exists (e.g. replacing an older version with a true-read version), delete the old `<slug>--*.md` files first and keep the old `seq` so the shelf position is stable.
- Whether to create/update glossary entries in `src/content/glossary/`.
- Whether the extracted text is readable enough to proceed.

If any required text is missing, garbled, scanned without readable text, or incomplete, report it instead of improvising.

## 2. 精读原则 (Non-Negotiable)

These three rules override any convenience consideration:

1. **One note per real chapter, minimum.** Every chapter in the book's real table of contents gets its own note file. A book with 18 chapters produces at least 18 chapter notes (plus 导读 and 总结).
2. **Never merge chapters.** Do not combine "第1~2章" into one note, however short or thematically similar the chapters are. Short chapters get short notes — that is fine and expected. Chapter count is driven by the book, not by effort budget.
3. **Rich chapters may be expanded.** When a chapter is unusually dense (long text, many cases, a central argument), expand it — either write a longer note, or split it into 上/下 across two files. Expansion is always allowed; merging never is.

Corollary: the number of reading units equals the number of real chapters. Do not compress a long book into 8-20 units. A 30-chapter book gets 30+ chapter agents, run in batches if necessary.

### Note length targets

| Chapter type | `## 详读` target |
| --- | --- |
| Short chapter (original < 6,000 字) | 800~1,200 字 |
| Normal chapter | 1,200~2,000 字 |
| Dense chapter (original > 25,000 字, or case-heavy) | 2,000~3,000 字, or split into 上/下 |

Never pad a thin chapter to hit a word count, and never truncate a rich chapter to stay under one.

## 3. Extraction Paths

### A. Text-Based PDF/EPUB

Run:

```bash
python3 scripts/extract-book.py <PDF/EPUB 文件路径> [--slug <slug>] [--level N]
```

Review `book-workspace/<slug>/meta.json` and the chapter table. **The chapter boundaries must match the real table of contents exactly, one file per real chapter.** If TOC pages are mostly `0`, chapters are too large (a "chapter" file spanning several real chapters means the level is too coarse), or boundaries are wrong, retry with `--level`; use heading-regex fallback only when TOC is unusable.

Verifying the split is part of the job: compare the chapter list in `meta.json` against the book's printed 目录 before dispatching any reading agent. A wrong split silently produces merged notes, which this workflow forbids.

### B. Scanned Or Image-Based Book

If total extracted characters are near zero:

1. Inspect 2-3 pages first to confirm layout: horizontal/vertical text, footnotes, annotations, and page order.
2. Build a page-to-chapter mapping table: page number, starting chapter, and first visible text column/line. Delegate this to one dedicated mapping sub-agent (it reads every content page once) so the main session stays small; chapter agents then receive exact page ranges.
3. Read chapter page images directly; do not OCR blindly if layout is complex.
4. If the user provides a public-domain reference text, store it in `book-workspace/<slug>/reference.md` as a checking base.
5. For ancient/public-domain texts, preserve uncertainty: mark missing, damaged, doubtful, or reference-filled text as `存疑` / `据参照本补`. Do not silently repair text.

## 4. Parallel Chapter Reading

**One sub-agent per real chapter.** Never give one agent two chapters. If the book has many chapters, run them in batches (e.g. 10-12 concurrent at a time) rather than merging them into fewer units.

For a dense chapter being split into 上/下, dispatch two agents with explicit, non-overlapping content ranges (by section heading or offset range), and tell each which half it owns and what the other half covers.

Each chapter prompt must include:

- The absolute material path.
- An instruction to read the full file/page range, using offset chunks if needed.
- The note length target for this chapter's type (see §2).
- A fidelity rule: source-traceable, report missing text, and no background-knowledge filling.
- The copyright quote policy.

Sub-agents return body text only. The main session writes files.

## 5. Quote And Copyright Policy

- Copyrighted books: paraphrase first. Direct quotes are limited to at most 2 per chapter, each no more than 25 Chinese characters, with approximate page numbers.
- Public-domain books: original text may be included in full when useful, with simplified Chinese and punctuation if the project format needs it.
- Raw book files, extracted text, page images, and `book-workspace/` content must never be committed or published.

## 6. Chapter Note Template

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

## 延伸案例（编者补）

编者补，非原书内容。……

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
- `延伸案例（编者补）` must start with `编者补，非原书内容` and must not be mixed into TL;DR, the main detailed reading, or the original-book case index.
- A thin chapter may legitimately have an empty 案例档案 or no 延伸案例 — say so rather than inventing filler.

## 7. Assembly And Frontmatter

The main session creates:

- Chapter 1: 导读, including book positioning, one-minute author intro, whole-book map, who should read it, how to read it, and version/source notes.
- One file per real chapter, in original order.
- Final chapter: 总结与行动清单, including review cards, whole-book case index, tools or takeaway sentences, the book's limits, and checklist items.

`chapter` is a **running sequence number** used for ordering and for the "第 X / N 章" display — not a mapping from the original chapter number. Assign it in reading order:

```
chapter: 1              导读
chapter: 2 … N+1        原书第 1 … N 章，一章一篇，顺序不变
                        （若某章拆成上/下，占用两个连续号，标题标注（上）（下））
chapter: 末位            总结与行动清单
```

The original chapter number belongs in `title` (e.g. `'第7章　投资人心理和情绪钟摆'`), which is what the reader actually sees.

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

`seq` controls bookshelf order. Convention: quant books use the historical 0-99 range; 书房 books start from 100. Check existing values with:

```bash
grep -h "seq:" src/content/books/*.md | sort -n
```

## 8. Glossary Generation

When useful, create 3-8 glossary entries per book in `src/content/glossary/`.

- Use `module: 'quant'` for quant books.
- Use `module: 'library'` for general library books.
- Do not duplicate existing terms; update existing files instead.
- Terms must be beginner-friendly and self-contained.
- The `term` (and `aliases`) must match how the word is actually written in the notes, otherwise the clickable term-links will not fire. Add common variants as aliases.

## 9. Quality Gate Before Writing Files

Before writing final Markdown, check:

- **Chapter coverage is complete**: every real chapter has at least one note. Count them against the book's 目录.
- **No note covers more than one real chapter.** A title like `第1~2章` is a defect — go back and split it.
- TL;DR has 3-5 sentences.
- `## 详读` has real `###` sections and hits the length target for that chapter's type.
- The note follows the original chapter order.
- Key numbers, names, cases, and examples are preserved.
- Missing or doubtful source text remains marked.
- Quotes obey the quote limit and have approximate page numbers.
- No unsupported background knowledge has entered the main note.
- `chapter` numbers are sequential with no gaps or duplicates.
- Original-book cases and editor-added examples are clearly separated.

## 10. Verification

After writing:

1. Run `npx tsc --noEmit && npm run build`.
2. Start or refresh the local preview via the `vite-dev` entry in `.claude/launch.json` (auto-port enabled — do not assume 4321; another session may hold it. The dev server reads `PORT` via vite.config.ts).
3. Check that the book appears on the correct shelf, **the chapter list matches the book's real 目录 one-to-one**, and navigation works.
4. Spot-check at least 2 chapters by grepping key sentences, case names, or numbers back to extracted text.
5. Run `git status` and confirm `book-workspace/`, source books, extracted text, PDFs, EPUBs, and page images are not tracked.

## 11. Publishing

Show the local result first. Commit, push, publish, or deploy only after the user explicitly approves.

## Red Lines

- Never download copyrighted books from the internet, GitHub collections, or mirror sites.
- Do not use book reviews, blurbs, SEO summaries, or memory as substitutes for the original text.
- Do not publish or commit raw source material.
- Do not hide extraction failures, scanned-page limits, missing chapters, garbled text, or uncertain readings.
- **Never merge two real chapters into one note, and never skip a chapter.** Reading effort is not a reason to compress a book.
