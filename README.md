# 一手笔记 · Firsthand Notes

> 记录值得长期保存的知识

基于 Astro + Fuwari 的静态知识库，托管在 GitHub Pages：<https://blog.dizhuig.com/>

## 本地开发

需要 Node.js `>=18.20.8`。

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

构建时会先运行 `scripts/sync-fuwari-content.mjs`，把 `src/content/blog/`、`src/content/books/`、`src/content/glossary/` 同步到忽略的 `.generated/posts/` 缓存，然后由 Astro 输出静态站点。缓存放在 `src/content/` 外，避免开发服务器同时扫描原稿和生成副本。

推送到 `main` 分支后，GitHub Actions（`.github/workflows/deploy.yml`）会自动运行 `npm run build` 并发布 `dist/` 到 GitHub Pages。

## 内容工作流

- 产品与架构基线：`docs/product-design.md`
- 研究型写作：`.ai/writing-agent.md`
- 原书逐章精读：`.ai/read-book.md`
- 每日简报：`.ai/daily-briefing.md`

每日简报由 ChatGPT 定时任务在每天 10:00（Asia/Shanghai）触发，不使用 n8n。Codex、Claude Code 和 Cursor 的工具入口都应引用 `.ai/` 中的共享规则，避免维护多份不同规范。

## 品牌资源

- Logo：`public/assets/brand/logo.png`
- 品牌展示：`public/assets/brand/brand-guide.png`
- Slogan：记录值得长期保存的知识
- 主色：藏青 `#111d2d`、金色 `#d99a20`、暖白 `#f5f4f1`

## 项目结构

```
src/
├── content/blog/      # 文章源数据
├── content/books/     # 读书笔记源数据
├── content/glossary/  # 名词手册源数据
├── content.config.ts  # Astro 内容集合
├── config.ts          # Fuwari 站点配置
└── styles/            # Fuwari 样式

.generated/            # 构建期生成的文章与模块索引（不提交）
```

界面基于 [Fuwari](https://github.com/saicaca/fuwari) 迁移，遵循其 MIT 许可证。
