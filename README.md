# 一手笔记 · Firsthand Notes

> 记录值得长期保存的知识

基于 [Astro](https://astro.build/) 的个人博客，托管在 GitHub Pages：<https://blog.dizhuig.com/>

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
pubDate: '2026-07-09'
category: '学习' # 可选：学习 / 阅读 / 人物 / 行业 / 时间线
tags: ['标签']
---
```

推送到 `main` 分支后，GitHub Actions（`.github/workflows/deploy.yml`）会自动构建并发布到 GitHub Pages。

## 项目结构

```
src/
├── assets/          # 图片等资源
├── components/      # Header / Footer / Logo 等组件
├── content/blog/    # 文章（Markdown / MDX）
├── layouts/         # 文章页布局
├── pages/           # 首页、文章列表、关于、RSS
└── styles/          # 全局样式（品牌配色）
```
