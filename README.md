# 一手笔记 · Firsthand Notes

> 记录值得长期保存的知识

基于 Astro + Fuwari 的静态知识库，托管在 GitHub Pages：<https://blog.liuchengyong.cn/>

## 本地开发

需要 Node.js `>=18.20.8`。

```bash
npm install
npm run dev -- --port 4321
npm run build    # 构建到 ./dist/
npm run preview  # 本地预览构建结果
```

## 写文章

在 `src/content/posts/` 下新建 Markdown 文件：

```yaml
---
title: '文章标题'
description: '一句话摘要'
pubDate: '2026-07-10'
tags: ['标签'] # 可选
---
```

Astro 直接读取四个 Content Collection，构建过程不复制 Markdown，也不生成中间内容缓存。

推送到 `main` 分支后，GitHub Actions（`.github/workflows/deploy.yml`）会自动运行 `npm run build` 并发布 `dist/` 到 GitHub Pages。

## 内容工作流

- 产品与架构基线：`docs/product-design.md`
- 研究型写作：`.ai/writing-agent.md`
- 原书逐章精读：`.ai/read-book.md`
- 每日简报：`.ai/daily-briefing.md`

每日简报由 ChatGPT 定时任务在每天 10:00（Asia/Shanghai）触发，不使用 n8n。Codex、Claude Code 和 Cursor 的工具入口都应引用 `.ai/` 中的共享规则，避免维护多份不同规范。

前端面试是纯静态学习应用：28 天课程与任务池随站点构建，浏览器按本地时间 04:00 切换学习日，并通过 `localStorage` 保存 Session、掌握度与复习计划。它不使用后端、AI 或定时任务。

## 品牌资源

- Logo：`public/assets/brand/logo.png`
- 品牌展示：`public/assets/brand/brand-guide.png`
- Slogan：记录值得长期保存的知识
- 主色：藏青 `#111d2d`、金色 `#d99a20`、暖白 `#f5f4f1`

## 项目结构

```
src/
├── content/posts/       # 普通文章与名词手册
├── content/books/       # 书籍元数据
├── content/book-notes/  # 逐章精读笔记
├── content/briefings/   # 每日简报
├── data/                # 前端面试等静态结构化数据
├── content.config.ts    # 四个 Astro Content Collection
├── config.ts            # Fuwari 站点配置
└── styles/              # Fuwari 样式
```

界面基于 [Fuwari](https://github.com/saicaca/fuwari) 迁移，遵循其 MIT 许可证。
