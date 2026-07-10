# Write Article

Use the shared workflow in `.ai/writing-agent.md`.

Start by researching the topic with available web tools. Build a source pool, filter for quality, define the angle, then draft the article in Chinese unless the user asks otherwise.

If the user wants a publishable post, save it under `src/content/blog/` with the required frontmatter.

After writing, build the project, run the local dev server with `npm run dev -- --port 4321`, and provide the preview URL. Do not publish, push, deploy, or send article changes to GitHub until the user explicitly approves after local review.

User request:

$ARGUMENTS
