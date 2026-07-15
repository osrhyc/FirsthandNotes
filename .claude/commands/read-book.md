# /read-book — 真读原书的逐章精读

Use the shared workflow in `.ai/read-book.md`. Read it first and follow it exactly.

Usage:

```text
/read-book <PDF/EPUB 文件路径> [分类] [--slug xxx]
```

Read the source book first, extract real chapter text or page-image evidence, then produce publishable chapter notes under `src/content/books/`. Do not use reviews, summaries, search snippets, or model memory as substitutes for the book.

Non-negotiable:

- **精读 is the only mode.** The whole book gets read, chapter by chapter — there is no fast-reading/targeted/skim mode.
- **阅读单元 = 一篇笔记**（见工作流 §2）：默认一章一篇；厚章有节就按节分组（不跨章）、无节就派两个 agent 出（上）（下）；部/篇 永不做单元。单元目标 5k~15k 字。`第1~2章` 这种标题即缺陷。
- **先 `--plan` 再落盘**：核对 TOC 树与单元建议是否与印刷目录一致，再去掉 --plan；切错会静默污染每一篇笔记。
- One sub-agent per real chapter; batch them if the book is long, rather than merging units.

After writing, run `npx tsc --noEmit && npm run build`, refresh the local preview via the `vite-dev` entry in `.claude/launch.json` (auto-port — do not assume 4321), and show the preview URL. Do not commit, push, publish, or deploy until the user explicitly approves.

User request:

$ARGUMENTS
