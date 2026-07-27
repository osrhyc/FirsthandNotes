---
title: '每日简报｜2026-07-27'
description: '提醒 GitHub Models 与 Copilot Gemini 模型迁移，并补充前端、AI 安全和产品机会。'
pubDate: '2026-07-27'
category: '每日简报'
level: 'AI · 开发 · 商业科技'
tags: ['每日简报', 'GitHub', 'Copilot', 'AI安全', '前端性能']
---

> 同步自 ChatGPT Project「每日晨读」历史归档。

过去 24 小时高价值官方发布不多，今天重点提醒两项本周到期的 GitHub 迁移，并补充几项近期但值得立即落地的前端、AI 安全和产品机会。

## 1. GitHub Models 将在 7 月 30 日彻底停止服务

GitHub Models 的模型目录、Playground、推理 API 和 BYOK 接口将在 **7 月 30 日全部关闭**，包括仍在使用服务的老用户。GitHub 建议迁移至 Microsoft Foundry，或使用 GitHub Copilot 完成 GitHub 内的 AI 工作流。[GitHub 官方公告](https://github.blog/changelog/2026-07-01-github-models-is-being-fully-retired-on-july-30-2026/)

**为什么重要：** 如果项目使用 `models.inference.ai.azure.com`、GitHub Models SDK 或相关环境变量，三天后可能直接请求失败。

**建议：** 今天检查代码、CI 和服务器配置：

迁移时不要只替换 URL；还要对照新供应商的模型名、认证方式、流式格式、限流和工具调用字段。

## 2. Copilot 将于 7 月 31 日下线两款 Gemini 模型

GitHub Copilot 将在 **7 月 31 日**停止支持：

- Gemini 2.5 Pro，建议迁移至 Gemini 3.1 Pro。
- Gemini 3 Flash，建议迁移至 Gemini 3.5 Flash。

此次变化覆盖 Copilot Chat、代码补全、内联编辑、Ask 和 Agent 模式。企业管理员可能还需要在模型策略中手动启用替代模型。[GitHub 官方迁移说明](https://github.blog/changelog/2026-07-02-upcoming-deprecation-of-gemini-2-5-pro-and-gemini-3-flash/)

**实际影响：** 保存过模型名的 Agent 配置、团队开发规范和自动化脚本可能失效，不能只依赖界面自动切换。

**建议：** 迁移前分别跑一次现有真实任务，比较新旧模型的代码修改范围、测试通过率和中文指令遵循，避免上线当天才发现输出风格变化。

## 3. Vercel 开放生产模型排行榜数据

Vercel 已将 AI Gateway 排行榜数据通过 API 和 CSV 开放，数据按日聚合，覆盖模型请求量、Token、消费金额、图片和视频生成量，并允许商业使用，但需要遵守 CC BY 4.0 署名要求。[Vercel 官方说明](https://vercel.com/changelog/open-data-and-shareable-charts-for-ai-gateway-leaderboards)

**为什么重要：** 这类数据反映真实生产调用，而不只是社交媒体热度或 Benchmark。

**产品机会：** 这个模式可以直接借鉴到你的 ExtensionHacker：

> 官方公开数据 -> 每日采集 -> 增长率计算 -> 异常变化识别 -> AI 生成商业解读

**建议：** 先做一个“AI 模型采用趋势”小栏目，跟踪 7 日增速、新模型首周采用率、请求量与消费金额背离。它也可以作为 Chrome 插件情报产品的数据处理原型。

## 4. CodeQL 开始检查“用户输入污染系统提示词”

CodeQL 2.26.0 新增 JavaScript/TypeScript 查询 `js/system-prompt-injection`，可检测不可信的用户输入直接流入 System Prompt 的情况，覆盖部分 OpenAI、Anthropic 和 Google GenAI SDK。[GitHub CodeQL 更新](https://github.blog/changelog/2026-07-10-codeql-2-26-0-adds-kotlin-2-4-0-support-and-ai-prompt-injection-detection/)

**为什么重要：** Prompt Injection 正从“AI 使用技巧”变成可以通过静态分析发现的正式代码安全问题。

**建议：**

- System Prompt 保持静态，不拼接用户输入。
- 用户材料放在单独的数据字段或明确标签中。
- 工具权限由服务端策略决定，不能由 Prompt 文本决定。
- 在 AI 项目 CI 中加入 CodeQL，并重点检查系统指令、工具参数和外部 URL 之间的数据流。

## 5. Copilot Vision 已向所有订阅档位开放

GitHub Copilot 现在支持直接附加 JPEG、PNG、GIF、WebP 和 PDF，让模型结合图片或文档理解代码；功能覆盖 VS Code、github.com 和 Copilot CLI，所有 Copilot 档位均可使用。[GitHub 官方公告](https://github.blog/changelog/2026-07-01-copilot-vision-is-generally-available/)

**为什么重要：** 前端需求不必先把设计图完全翻译成文字，可以直接交付截图、原型和错误页面。

**对你的实际价值：**

- 上传小程序卡死页面截图并关联组件代码。
- 用设计稿检查 React/uni-app 页面还原。
- 上传报错截图，让 Agent 定位相关日志和代码。
- 将 PDF 需求与仓库实现一起审查。

**建议：** 截图旁仍要补充设备、系统版本、操作步骤、预期与实际结果；视觉输入不能代替可复现条件。

## 6. Chrome 151 增加 SPA 软导航性能指标

Chrome 151 Beta 为 Performance API 增加 `soft-navigation` 和 `interaction-contentful-paint` 时间线条目，用于衡量 SPA 在点击后切换路由、渲染新内容的真实体验。[Chrome 151 Beta 说明](https://developer.chrome.com/blog/chrome-151-beta)

**为什么重要：** React、Vue 等 SPA 过去主要依赖首次加载指标，用户点击后页面卡顿或内容迟迟不出现，很难被传统 LCP 准确捕捉。

**建议：** 在你的 Web 管理系统中开始区分：

> 首次页面加载耗时、路由切换耗时、用户点击到主要内容显示耗时

先做渐进式采集并保留浏览器版本，暂时不要将实验性指标直接设成硬性告警。

## 7. Chrome 测试无需验证码的邮箱验证协议

Chrome 正在进行 Email Verification Protocol Origin Trial：用户从浏览器自动填充中选择邮箱后，浏览器可与邮箱提供商完成签名验证，网站无需再发送验证码或验证链接。不支持时仍可回退至传统邮件验证。[Chrome 官方介绍](https://developer.chrome.com/blog/email-verification-protocol-origin-trial)

**为什么重要：** 注册时离开页面查看邮箱，是 SaaS 和工具产品常见的转化流失点。浏览器级验证可能减少步骤，同时降低一次性邮箱和输错地址问题。

**产品影响：** 目前仍是实验功能，不能作为唯一登录或找回方式，但值得在独立产品中预留渐进增强结构。

**建议：** 邮箱注册逻辑继续保留验证码兜底；如果参与试验，分别统计传统验证与浏览器验证的成功率、耗时和注册完成率。

**今日优先行动：** 先全局搜索是否使用 GitHub Models；然后检查 Copilot 配置中是否固定了即将下线的 Gemini 型号。这两项都有明确截止日期，比测试新工具更紧急。
