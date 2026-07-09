---
title: '写作指南：如何在本站发布文章'
description: '新建一篇文章需要的 frontmatter 字段说明与 Markdown 排版示例。'
pubDate: '2026-07-08'
category: '学习'
tags: ['指南', 'Markdown']
---

在 `src/content/blog/` 目录下新建一个 `.md` 或 `.mdx` 文件即可发布文章。

## Frontmatter 字段

```yaml
---
title: '文章标题'            # 必填
description: '一句话摘要'     # 必填
pubDate: '2026-07-08'        # 必填，发布日期
updatedDate: '2026-07-09'    # 可选，更新日期
category: '学习'             # 可选：学习 / 阅读 / 人物 / 行业 / 时间线
tags: ['标签1', '标签2']     # 可选
heroImage: '../../assets/xxx.jpg' # 可选，头图
---
```

## 排版示例

### 引用

> 好记性不如烂笔头。

### 列表

1. 第一步：读
2. 第二步：想
3. 第三步：写

### 代码

行内代码：`npm run dev`。代码块：

```js
console.log('一手笔记');
```

### 表格

| 栏目 | 内容 |
| ---- | ---------------- |
| 学习 | 方法论与实践复盘 |
| 阅读 | 读书笔记与摘录   |

写完后 `git push`，GitHub Actions 会自动构建并发布。
