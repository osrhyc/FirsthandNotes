import type { Plugin } from 'vite';

/** 把每篇 md 拆成 ?meta（frontmatter，进主包）与 ?body（正文，按需 chunk）两个入口。 */
export function contentSplit(): Plugin;
