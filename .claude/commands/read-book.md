# /read-book — 真读原书的逐章速读

Use the shared workflow in `.ai/read-book.md`.

Usage:

```text
/read-book <PDF/EPUB 文件路径> [分类] [--slug xxx]
```

Read the source book first, extract real chapter text or page-image evidence, then produce publishable chapter notes under `src/content/books/`. Do not use reviews, summaries, search snippets, or model memory as substitutes for the book.

After writing, run `npx tsc --noEmit && npm run build`, refresh the local preview with `npm run dev -- --port 4321`, and show the preview URL. Do not commit, push, publish, or deploy until the user explicitly approves.

User request:

$ARGUMENTS
