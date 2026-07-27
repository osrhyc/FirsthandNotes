# 一手笔记 · Firsthand Notes

> 记录值得长期保存的知识

基于 Astro + Starlight 的静态知识库，托管在 GitHub Pages：<https://blog.dizhuig.com/>

## 本地开发

```bash
npm install
npm run dev -- --port 4321
npm run build    # 构建到 ./dist/
npm run preview  # 本地预览构建结果
```

## 写文章

在 `src/content/blog/` 下新建 Markdown 文件：

```yaml
---
title: '文章标题'
description: '一句话摘要'
pubDate: '2026-07-10'
tags: ['标签'] # 可选
---
```

构建时会先运行 `scripts/sync-starlight-content.mjs`，把 `src/content/blog/`、`src/content/books/`、`src/content/glossary/` 同步为 Starlight 的 `src/content/docs/` 页面，然后由 Astro 输出静态站点。

推送到 `main` 分支后，GitHub Actions（`.github/workflows/deploy.yml`）会自动运行 `npm run build` 并发布 `dist/` 到 GitHub Pages。

## 项目结构

```
src/
├── content/blog/      # 文章源数据
├── content/books/     # 读书笔记源数据
├── content/glossary/  # 名词手册源数据
├── content/docs/      # Starlight 生成页面
├── content.config.ts  # Starlight 内容集合
└── styles/            # Starlight 样式覆盖
```
