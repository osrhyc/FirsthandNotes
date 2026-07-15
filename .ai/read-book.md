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

## 2. 阅读单元 (Non-Negotiable)

A **阅读单元 (reading unit)** is what one sub-agent reads and what becomes one note file. Choosing units correctly is the single highest-leverage decision in this workflow — get it wrong and every downstream note inherits the error.

### 2.1 The unit ladder

A book's structure has up to four layers. They are **not** interchangeable:

| Layer | Example | Role |
| --- | --- | --- |
| 部 / 篇 / Part | 「第一部分　处理复杂性」 | **Grouping only. Never a unit.** It has no content of its own — recurse into its chapters. |
| 章 / 讲 / Chapter | 「第3章　周期的规律」 | **The default unit.** |
| 节 | 「1.1 系统」 | Used only to subdivide a chapter that is too thick. |
| 前置/后置 | 序、前言、导论、绪论、附录、后记 | Own unit if substantive. Skip 目录/版权/封面/作者简介/推荐语. |

### 2.2 Three hard rules

1. **Every real chapter is covered.** No chapter may be skipped.
2. **A unit never spans two chapters.** Combining 「第1~2章」 into one note is a defect. Short chapters get short notes — that is fine and expected. When a thick chapter is split by 节, the section groups still live entirely inside that one chapter.
3. **Splitting finer is always allowed; merging never is.**

### 2.3 Unit size drives the split (adaptive)

Target **5,000–15,000 汉字 of source per unit**. This is the rule that decides 章 vs 节:

| Chapter size | Unit |
| --- | --- |
| ≤ 15,000 字 | The whole chapter — one unit. |
| > 15,000 字, **has** usable 节 | Group its 节 into runs of ~10,000 字 → 「第2章（一）」「第2章（二）」… A tail run under ~5,000 字 merges into the previous run. |
| > 15,000 字, **no** usable 节 | One unit, flagged `oversized-no-subsections` → dispatch **two agents** with explicit non-overlapping content ranges, producing 「第X章（上）」「第X章（下）」. |

Why: a 18,500-字 chapter compressed into one 1,500-字 note keeps 8% of the source. That is a summary, not 真读. Units in the 5k–15k band land at a 15–40% ratio, which is.

`scripts/extract-book.py --plan` computes all of this and prints the proposed units with 字数 — see §3.

### 2.4 Note length targets

Driven by the **unit's** source size, not the chapter's:

| Unit source size | `## 详读` target |
| --- | --- |
| < 6,000 字 | 800~1,200 字 |
| 6,000~12,000 字 | 1,200~2,000 字 |
| > 12,000 字 (or case-heavy) | 2,000~3,000 字 |

Never pad a thin unit to hit a word count, and never truncate a rich one to stay under one.

## 3. Extraction Paths

### A. Text-Based PDF/EPUB

**Always plan before extracting.** Step 1 prints the TOC tree with 汉字 counts and the proposed units (§2.3), and writes nothing:

```bash
python3 scripts/extract-book.py <PDF/EPUB 文件路径> --slug <slug> --plan
```

Read the proposed unit list against the book's printed 目录 and check:

- Every real chapter appears. Nothing is skipped, nothing spans two chapters.
- No 部/篇 became a unit (it should have been recursed into).
- Front matter (赞誉/推荐序/目录) did not leak into 第1章 — a suspiciously fat first unit is the tell.
- `⚠超长` units: these need two agents each (上/下).
- `·薄` units: fine if the chapter really is short; suspicious if the book isn't.

Then extract for real (drop `--plan`). Escape hatches when the auto-plan is wrong:

- `--level N` — force a TOC level (use when the tree is clean but the heuristic misjudged).
- `--spec plan.json` — edit the generated `book-workspace/<slug>/plan.json` by hand and re-run. This is the last word; the script has no opinion the spec can't override.

Known failure modes the script handles, and what they look like:

| Symptom | Cause | Handling |
| --- | --- | --- |
| `⚠️ TOC 页码大多为 0` | EPUB TOC anchors unresolved | Auto-falls back to heading regex + longest-increasing chapter-number chain (drops 目录/前言 false hits) |
| A 部 swallowed a whole chapter | 部 and 章 headings share a page | Heading scan matches 章 only, never 部 |
| A unit titled with a full sentence | Prose like 「第3章对数据驱动型模型进行了…」 matched as a heading | Heading must be ≤40 chars with a separator after the chapter number |

Verifying the split is part of the job. A wrong split silently produces bad units, and every note inherits the error.

### B. Scanned Or Image-Based Book

If total extracted characters are near zero:

1. Inspect 2-3 pages first to confirm layout: horizontal/vertical text, footnotes, annotations, and page order.
2. Build a page-to-chapter mapping table: page number, starting chapter, and first visible text column/line. Delegate this to one dedicated mapping sub-agent (it reads every content page once) so the main session stays small; chapter agents then receive exact page ranges.
3. Read chapter page images directly; do not OCR blindly if layout is complex.
4. If the user provides a public-domain reference text, store it in `book-workspace/<slug>/reference.md` as a checking base.
5. For ancient/public-domain texts, preserve uncertainty: mark missing, damaged, doubtful, or reference-filled text as `存疑` / `据参照本补`. Do not silently repair text.

## 4. Parallel Chapter Reading

**One sub-agent per 阅读单元** (§2). Never give one agent two units, and never give one agent two chapters. If the book yields many units, run them in batches (e.g. 10-12 concurrent at a time) rather than merging.

For an `oversized-no-subsections` unit, dispatch **two** agents with explicit, non-overlapping content ranges, and tell each which half it owns and what the other half covers → 「第X章（上）」「第X章（下）」.

For a `section-group` unit, tell the agent which 小节 it owns (the plan's `含小节：` line) and that the rest of the chapter is covered by sibling units — so it writes about its own sections only and doesn't summarize the whole chapter.

Each chapter prompt must include:

- The absolute material path.
- An instruction to read the full file/page range, using offset chunks if needed.
- The unit's source 字数 and the matching note length target (see §2.4).
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

### Titling units

The `title` is what the reader sees in the sidebar and as the article heading. It has two cases, and they are not the same:

| Unit | Title | Why |
| --- | --- | --- |
| A whole chapter | **The author's own chapter title, verbatim.** 「第1章　是非对错的底层逻辑」 | Faithfulness. If the author titled all five chapters monotonously, that is the author's choice — do not "improve" it. Rewriting a real chapter's title misrepresents the book. |
| A split unit | 「第N章（上/中/下）　<subtitle>」 | The chapter title alone is ambiguous across siblings, so a subtitle is required. |

Rules for the subtitle of a split unit:

- **It must be derived from the 小节 the unit actually covers** (the plan's `含小节：` line) — never invented, never a theme you wish were there.
- It must say something. 「（一）（二）（三）」 alone is a defect: it distinguishes the files but tells the reader nothing about what is inside.
- Prefer 上/下 for two parts, 上/中/下 for three, （一）…（四） for four or more.
- Keep it short enough to survive a narrow sidebar (roughly ≤ 20 全角字符 after the chapter number).

For 上/下 splits of an `oversized-no-subsections` chapter, derive the subtitle from the actual content each half covers, after the agents report back.

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

- **Chapter coverage is complete**: every real chapter is covered by at least one unit. Count against the book's 目录.
- **No unit spans two chapters.** A title like `第1~2章` is a defect — go back and split it.
- **No 部/篇 became a unit.**
- **Unit sizes are in band**: no unit over ~15,000 字 of source went to a single agent (§2.3).
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
