# /read-book — 真读原书的逐章速读 agent

用法：`/read-book <PDF/EPUB 文件路径> [分类] [--slug xxx]`

目标：从**真实书稿文本**逐章提取双层笔记（TL;DR + 详读），落盘到 `src/content/books/`，自动进入书屋。禁止用书评、简介或模型记忆代替原文。

## 流程

### ① 提取章节文本
```bash
python3 scripts/extract-book.py <文件路径> [--slug <slug>]
```
- 输出 `book-workspace/<slug>/chapters/*.txt` + `meta.json`（已 gitignore，原文绝不入库）
- 审阅打印的章节表：切章是否与原书目录一致；平均每页字符过少说明是扫描版，先停下告知用户需要 OCR
- 章节数 > 20 时按部/篇把相邻小章合并成一个笔记单元，目标 8~20 篇；切章错乱时用 `--level` 调整或与用户确认

### ② 并行逐章精读（子 agent）
每个笔记单元派一个 general-purpose agent，prompt 必须包含：
- 该单元对应的 txt 文件绝对路径，要求 **Read 真实文本后才能写作**（超长文件分片读完）
- 忠实性红线：每条论点必须来自该文本；文本缺失/乱码如实上报，禁止用背景知识补内容；书里没写的不许出现
- 双层格式：开头 `> TL;DR：` 3~5 句本章结论；然后 `## 详读` 按原章逻辑展开论证脉络 + 关键案例 + 要点清单，1200~2000 中文字
- 版权护栏：转述为主，直接引用每章 ≤2 处、每处 ≤25 字、标注页码（页码在 meta.json 的 start_page/end_page 范围内）
- 返回值：该章笔记的完整 Markdown 正文 + 章标题（不写文件，由主会话统一落盘）

### ③ 组装落盘
- 主会话根据全部章节笔记撰写：第 1 篇「导读」（作者与全书地图、精读安排）+ 最后一篇「总结与行动清单」
- 逐篇写入 `src/content/books/<slug>--NN.md`，frontmatter 沿用书屋 schema：
  ```yaml
  book / bookTitle / author / note / bookCategory / seq / chapter / title
  ```
- `seq` = 现有书目最大 seq + 1（`grep -h "seq:" src/content/books/*.md | sort -u` 查看）；`bookCategory` 用书屋现有分类，用户未指定时按书的内容判断
- 標題冒号用全角「：」；frontmatter 值单引号包裹

### ④ 验证
1. `npx tsc --noEmit && npm run build`
2. 本地预览：书架出现新书、章节目录完整、逐章翻页正常
3. **抽查 2 章**：随机抽笔记与 `book-workspace` 原文比对，确认无编造、引用不超限
4. `git status` 确认无 book-workspace/ 或书源文件被追踪

### ⑤ 发布
展示成品给用户，**明确确认后**才 commit + push（遵循 AGENTS.md 发布规范）。

## 红线汇总
- 不从网络下载书籍文件（盗版）；书源文件由用户提供
- 原书文本（book-workspace/、PDF/EPUB 本体）永不提交到 git
- 笔记是提炼式转述，不是压缩复制；引用限额见上
- 扫描版/乱码/缺章如实告知用户，不硬写
