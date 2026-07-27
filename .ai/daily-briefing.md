# Daily Briefing Agent

This is the shared workflow for the Firsthand Notes daily briefing. The scheduled run is owned by a ChatGPT task. Do not add n8n or another scheduler.

## Schedule And Scope

- Run every day at 10:00 in `Asia/Shanghai`.
- Cover material published in the previous 24 hours, plus older developments that became materially important during that window.
- Dynamically balance AI, software development, entrepreneurship, marketing, business, finance, China/global stock markets, and funds.
- Prefer significance over equal category quotas. A quiet category does not need filler.
- Review recent briefing files before research to avoid repeating unchanged stories.

## Research Workflow

1. Read the latest seven daily briefings in `src/content/briefings/`.
2. Search broadly in Chinese and English.
3. Build a candidate pool larger than the final issue.
4. Prefer primary sources: official announcements, filings, regulators, exchanges, company engineering blogs, research papers, public datasets, and direct interviews.
5. Use reputable reporting for context and independent verification.
6. Remove copied reports, SEO pages, unattributed summaries, and stories with no practical consequence.
7. Cross-check consequential or disputed claims with at least two independent sources when possible.
8. Separate facts, source opinions, market interpretation, rumors, and editorial inference.

Sources are dynamic. Do not use a fixed publisher whitelist as a substitute for judging the original evidence, relevance, date, conflicts of interest, and corroboration.

## Issue Composition

Aim for 8-12 substantial items when the news supports it. Fewer strong items are better than padded coverage. Group related updates into one item instead of repeating the same event.

Each item must state:

- what happened, with the event or publication date;
- why it matters;
- who is affected;
- a concrete implication or action worth considering;
- one or more inline Markdown source links;
- a confidence label when the evidence is incomplete.

Use clear categories, but allow new categories when an important event does not fit the normal set. Place the most consequential items first.

Do not turn market movement into investment advice. Distinguish observed prices or flows from explanations offered by analysts. For rumors and leaks, name the originating source and label the claim `未经证实`.

## Output

Write one file:

```text
src/content/briefings/YYYY-MM-DD.md
```

Use:

```yaml
---
title: '每日简报｜YYYY-MM-DD'
description: '概括当天最值得关注的几项变化'
pubDate: 'YYYY-MM-DD'
tags: ['每日简报']
---
```

Recommended body:

```markdown
## 今日重点

> 用 3-5 句话给出全局判断，不复述目录。

## 分类名称

### 事件标题

**发生了什么：**

**为什么重要：**

**可以关注：**

## 今日观察

明确标记这是基于上述事实的编辑判断。

## 来源说明

说明时间窗口、筛选和不确定性，不重复罗列正文已有链接。
```

## Validation And Publishing

Before publishing:

1. Check that the date and filename agree and that no briefing for the date already exists.
2. Open every cited URL and verify that it supports the nearby claim.
3. Check names, numbers, currencies, dates, market sessions, and time zones.
4. Run `npm run check` and `npm run build`.
5. Commit only the new or corrected briefing and related generated source changes that belong in Git.
6. Push only as part of the explicitly authorized daily briefing automation.

If research, citation checks, content checks, build, commit, or push fails, do not silently publish a partial issue. Preserve the draft locally and report the exact failure.
