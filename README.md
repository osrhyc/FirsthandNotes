# 一手笔记 · Firsthand Notes

> 记录值得长期保存的知识

基于 React + Ant Design + Vite 的静态文章管理后台，托管在 GitHub Pages：<https://blog.dizhuig.com/>

## 本地开发

```bash
npm install
npm run dev      # http://localhost:4321/
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

React 应用会在构建时读取 `src/content/blog/*.md`，解析 frontmatter 并渲染到文章管理后台。

推送到 `main` 分支后，GitHub Actions（`.github/workflows/deploy.yml`）会自动运行 `npm run build` 并发布 `dist/` 到 GitHub Pages。

## 项目结构

```
src/
├── content/blog/    # 文章（Markdown）
├── react/           # React + Ant Design 管理后台
├── main.tsx         # React 入口
└── vite-env.d.ts    # Vite 类型声明
```
