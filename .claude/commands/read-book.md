# /read-book — 真读原书的逐章精读

Use the shared workflow in `.ai/read-book.md`. Read it first and follow it exactly.

Usage:

```text
/read-book <PDF/EPUB 文件路径> [分类] [--slug xxx]
```

Read the source book first, extract real chapter text or page-image evidence, then produce publishable chapter notes under `src/content/books/`. Do not use reviews, summaries, search snippets, or model memory as substitutes for the book.

Non-negotiable:

- **精读 is the only mode.** The whole book gets read, chapter by chapter — there is no fast-reading/targeted/skim mode.
- **One note per real chapter, minimum. Never merge chapters.** A note titled `第1~2章` is a defect: split it. Short chapters get short notes; dense chapters may be expanded or split into 上/下.
- Verify the extracted chapter split matches the printed 目录 one-to-one **before** dispatching any reading agent — a wrong `--level` silently produces merged notes.
- One sub-agent per real chapter; batch them if the book is long, rather than merging units.

After writing, run `npx tsc --noEmit && npm run build`, refresh the local preview via the `vite-dev` entry in `.claude/launch.json` (auto-port — do not assume 4321), and show the preview URL. Do not commit, push, publish, or deploy until the user explicitly approves.

User request:

$ARGUMENTS
