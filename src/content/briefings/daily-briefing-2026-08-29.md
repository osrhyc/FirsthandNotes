---
title: '每日简报｜2026-08-29'
description: '今天关注 Cloudflare Workers AI 与工程降本、Google Drive 数据分级、Kiro Agent 安全、Shopify Bot Auth 与跨境履约、抖音/天猫平台治理、绿色消费和订阅涨价带来的小生意机会。'
pubDate: '2026-08-29'
category: '每日简报'
level: 'AI · 开发 · 创业 · 金融'
tags: ['每日简报', 'Cloudflare', 'Workers AI', 'Google Workspace', 'Agent安全', 'Shopify', '抖音电商', '天猫', '绿色消费', '以旧换新', '跨境电商', 'BYD', '订阅经济', '流动性']
sourceCount: 16
status: 'published'
---

今天的主线是：AI 能力继续进入基础设施，但真正能变成钱的地方在“权限、数据分级、履约、成本和合规”。Cloudflare 把新 coding 模型、远程接入客户端修复和 Durable Objects 并发能力推到开发者面前，同时一篇 DNS 缓存优化文章提醒我们，工程降本本身就是护城河。非 AI 侧更适合做小生意：Shopify 的爬虫认证、美国邮政包裹要求、抖音第三方交易治理、天猫发货规则、绿色消费试点和 Apple TV 涨价，都在显示商家和消费者都在重新计算“可信、可控、可负担”。今天最值得低成本验证的是：平台规则雷达、独立站爬虫/履约检查、商家补贴资料服务、订阅替代清单、以及 Agent 工具权限审计。

## 速览

- [Cloudflare 8 月 28 日把 Z.ai GLM-5.3 放上 Workers AI](https://developers.cloudflare.com/changelog/)，定位是长时间、工具驱动的 agentic coding 模型，模型路由和代码 Agent 成本表需要重新评估。
- [Cloudflare 同日把 Durable Objects 可并发使用的 Dynamic Workers 数量从 4 个提高到 10 个](https://developers.cloudflare.com/changelog/)，对多租户插件、沙箱执行和小型 Agent 平台是实用扩容。
- [Google Workspace 8 月 28 日开放 Gemini-based Drive 数据分类 beta](https://workspaceupdates.googleblog.com/2026/08/gemini-based-data-classification-in-Google-Drive-is-now-available-in-open-beta.html)，企业会先为 DLP、标签、审计和 Agent 权限边界付费。
- [The Hacker News 报道 Amazon Kiro 的 prompt injection 数据外泄问题](https://thehackernews.com/2026/08/amazon-kiro-prompt-injection-can.html)，报道称 Amazon 已在 0.8.140 修复；这再次说明 Agent IDE 不能默认信任仓库内容。
- [Cloudflare 工程博客称通过优化 1.1.1.1 DNS 缓存节省约 100TB 内存](https://blog.cloudflare.com/dns-cache-memory-optimization-1111/)，系统工程仍然是成本优势，不是只有模型能力值得关注。
- [Shopify changelog 显示 8 月 29 日上线 Web Bot Auth](https://changelog.shopify.com/)，店铺可以用 HTTP signatures 给自有爬虫和自动化工具做身份认证，减少误拦截。
- [新浪财经转载消息称抖音电商继续严打诱导第三方交易](https://finance.sina.com.cn/roll/2026-08-28/doc-inipwnxr5835862.shtml)，平台内成交、售后和资金保护是国内小生意底线。
- [发改委 2026 年以旧换新政策](https://www.ndrc.gov.cn/xxgk/zcfb/tz/202512/t20251230_1402851_ext.html)和[商务部绿色消费试点 8 月 30 日申报节点](https://www.mofcom.gov.cn/gztz/art/2026/art_41311872544b4631b0146b03a56230c0.html)继续指向家电、智能产品、回收和本地服务机会。
- [MacRumors 报道 Apple TV 月费在美国涨至 14.99 美元](https://www.macrumors.com/2026/08/28/apple-tv-price-increase/)，订阅涨价会让“替代清单、家庭预算、内容聚合、取消订阅提醒”更有搜索需求。
- [AP 报道 8 月 28 日美债短端收益率上行、美国股市小跌](https://apnews.com/article/stocks-markets-oil-ai-nvidia-0a655f1c042b059279343443d5802907)，利率压力会继续拷问 AI 和小生意的 ROI。

## 重点详读

## 1. Cloudflare 上线 GLM-5.3：Agent coding 继续变成“可路由的云能力”

发生了什么：[Cloudflare changelog](https://developers.cloudflare.com/changelog/)显示，8 月 28 日 `@cf/zai-org/glm-5.3` 登陆 Workers AI，定位为面向长时间、工具驱动开发流程的 coding 模型；同页还列出模型价格、OpenAI-compatible endpoint、Workers AI binding 和 AI Gateway 调用方式。

为什么重要：coding agent 的竞争正在从“单个 IDE 插件”扩展到“模型路由 + 沙箱 + 权限 + 成本观测”。实际影响是，小团队可以把模型选择做成配置，而不是绑定单一供应商；对复杂重构、测试生成、依赖升级、日志分析这种任务，可以按成本、上下文、工具调用稳定性分层。建议今天建一张模型路由表：任务类型、输入长度、是否要工具、是否要隐私隔离、可接受失败率、单次成本。风险边界是 benchmark 多为厂商说法或模型页呈现，真实项目要用自己的仓库、测试集和错误率复测。

## 2. Google Drive 用 Gemini 做数据分类：企业 Agent 的前置生意是“先把文件分清”

发生了什么：[Google Workspace Updates 8 月 28 日公告](https://workspaceupdates.googleblog.com/2026/08/gemini-based-data-classification-in-Google-Drive-is-now-available-in-open-beta.html)，Gemini-based data classification in Google Drive 进入 open beta，可按管理员定义的说明给 Drive 文件应用数据分类标签，用于 DLP、保留规则和审计；公告还强调管理员可控制标签、说明和评估范围，用户可在权限允许时复核 Gemini 标签，审计日志会记录标签动作。

为什么重要：这比“AI 帮我整理文件”更关键。企业真正担心的是 Agent 读到合同、客户名单、财务表、源码和人事资料后自动执行。实际影响是，任何企业知识库、RAG、客服 Agent、文档助手都要先回答：哪些文件能读，哪些只可检索标题，哪些完全隔离。建议做一个轻量服务包：Drive/飞书/企业微信文档盘点、敏感词标签、权限矩阵、DLP 检查和 Agent 可访问清单。风险边界是数据分类不能完全交给模型，必须保留人工复核、日志和回滚机制。

## 3. Kiro prompt injection 披露：Agent IDE 的风险从“生成错代码”升级为“仓库内容影响工具权限”

发生了什么：[The Hacker News 8 月 27 日报道](https://thehackernews.com/2026/08/amazon-kiro-prompt-injection-can.html)，安全研究者披露 Amazon Kiro IDE 中与 Kiro Powers 相关的 prompt injection 风险：攻击者控制的仓库内容在特定打开方式和用户交互后，可能影响 Agent 并导致敏感本地信息外传；报道称 Amazon 表示已在 Kiro IDE 0.8.140 修复。该报道是二手安全报道，细节仍应以厂商公告和研究者原始报告为准。

为什么重要：Agent IDE 的危险不只在 shell 命令，而在“仓库文件、配置、MCP、hooks、上下文说明”之间的信任边界。实际影响是，接外包项目、开源仓库、客户代码、模板项目时，不能让 Agent 自动读写敏感配置、令牌、IDE 设置和 MCP 配置。建议建立开发者本地安全清单：升级 Kiro/Cursor/Claude Code/Codex 等工具；新仓库先用只读模式；禁止自动执行 hooks；把 `.env`、密钥、SSH、浏览器 cookie、MCP 配置列入敏感路径。风险边界是不要传播利用步骤，重点是权限隔离、升级和最小授权。

## 4. Cloudflare 1.1.1.1 节省 100TB 内存：工程降本是独立开发者最容易忽视的复利

发生了什么：[Cloudflare 工程博客](https://blog.cloudflare.com/dns-cache-memory-optimization-1111/)披露，Big Pineapple 平台承载 1.1.1.1、Gateway DNS、DNS Firewall 等服务，任意时刻保存超过 2500 亿条 DNS 缓存记录；团队通过五轮 Rust 数据结构和内存布局优化，将单条缓存 footprint 从 953 bytes 降到 420 bytes，释放约 100TB 内存，并提升插入吞吐和查询延迟。

为什么重要：这不是单纯的“大厂炫技”。它提醒小团队，成本优化要从高频路径和数据结构开始，而不是最后再压云账单。实际影响是，自建站、爬虫、搜索、日志、向量库、订单同步、内容站都可能有类似浪费：重复字段、过度 JSON、未压缩索引、无 TTL、日志无限增长。建议今天检查一个项目的成本热点：数据库表大小、缓存 key/value、图片尺寸、日志保留、向量元数据、API 重试。风险边界是不要为了早期 MVP 过早优化；只有当成本、延迟或容量已经影响利润时再深挖。

## 5. Cloudflare One 客户端热修：远程办公和 Zero Trust 的小故障也能变成交付机会

发生了什么：[Cloudflare changelog](https://developers.cloudflare.com/changelog/)显示，8 月 28 日 macOS、Windows、Linux 版 Cloudflare One Client 发布 GA hotfix，解决跨平台少量 DNS 查询失败问题；Windows 版还修复了切换安装版本后可能因 invalid registration 无法连接或切换组织的问题。

为什么重要：Zero Trust、VPN、SASE、远程办公客户端平时不显眼，但一出问题就是“员工连不上、内网打不开、客服爆炸”。实际影响是，很多中小企业没有专职网络工程师，只能靠 IT 外包或开发者临时排查。建议把它做成运维小服务：客户端版本清单、DNS 解析检查、组织切换验证、员工自助排障文档、升级回滚策略。风险边界是不能代管客户全局安全策略；只做排查、文档和变更记录，权限要最小化。

## 6. Shopify Web Bot Auth：独立站开始需要给“好机器人”和“坏流量”分身份

发生了什么：[Shopify changelog](https://changelog.shopify.com/)显示，8 月 29 日 Shopify 上线 Web Bot Auth，店铺可用 HTTP signatures 认证自动化工具，例如爬虫和脚本，确保自有工具访问店铺时不被拦截。8 月 28 日同页还显示 checkout 后 Thank You / Customer Account 页面 announcement bar extension、Storefront API buyer authentication 对 vaulted cards 和 store credit 的支持，以及 Canada Post duties-pre-paid labels to the US。

为什么重要：AI 搜索、价格监控、SEO 抓取、库存同步、联盟营销和客服自动化会让电商站面对更多自动流量。实际影响是，独立站必须区分搜索引擎、AI crawler、监控脚本、恶意爬虫、价格采集器和自家自动化，不然要么被薅流量，要么误伤转化和监控。建议做一个 Shopify “Bot 与履约检查包”：robots/AI 爬虫策略、Web Bot Auth、支付/账户认证、美国预付关税标签、checkout 后触达和转化追踪。风险边界是不要做绕过反爬或批量抓取竞品教程；正确方向是给自有工具做身份、给客户站做合规访问。

## 7. 抖音第三方交易治理 + 天猫发货规则：国内平台小生意的红线继续收紧

发生了什么：[新浪财经转载焦作日报消息](https://finance.sina.com.cn/roll/2026-08-28/doc-inipwnxr5835862.shtml)称，抖音电商 8 月 27 日公布诱导至第三方交易典型违规案例，并对诱导消费者脱离平台交易、提货卡虚假发货、刷单、传销等风险进行治理；[天猫规则首页](https://www.tmall.com/wow/seller/act/guize)最新公告区继续展示延迟发货、招商资质、保质期等规则，页面也说明延迟发货违约金框架。

为什么重要：平台生意已经不是“找到爆品就上链接”这么简单，规则、发货、售后、资质和资金安全正在决定能不能长期做。实际影响是，抖音、小红书、淘宝/天猫、京东商家都会为“少封店、少赔付、少冻结佣金、少售后纠纷”付费。建议做平台合规体检：商品页、直播话术、客服回复、发货承诺、类目资质、退款说明、售后证据。风险边界是不能提供刷单、虚假发货、假资质、诱导站外交易、规避平台处罚等操作。

## 8. 以旧换新和绿色消费试点：传统小生意机会在资料、回收和本地履约

发生了什么：[国家发展改革委、财政部 2026 年“两新”政策通知](https://www.ndrc.gov.cn/xxgk/zcfb/tz/202512/t20251230_1402851_ext.html)明确汽车报废/置换、6 类家电、4 类数码和智能产品等补贴方向，并要求完善主体名单、价格备案、资金审核兑付等细则；[商务部绿色消费试点通知](https://www.mofcom.gov.cn/gztz/art/2026/art_41311872544b4631b0146b03a56230c0.html)要求省级商务主管部门在 2026 年 8 月 30 日前报送推荐材料，试点周期两年。

为什么重要：这类政策的直接受益者不是个人开发者，但会带出大量低技术门槛、强本地履约的服务需求。实际影响是，家电卖场、回收商、维修商、县域门店、养老机构、园区、商圈和地方服务商，都需要做补贴资料、价格备案、旧机回收、客户登记、核销凭证和售后追踪。建议做“以旧换新资料包/核销表/回收流程页”：先服务 3 个本地商家，按单或按月收费。风险边界是严禁骗补套补、先涨后补、虚假回收和伪造材料。

## 9. Apple TV 再涨价：订阅疲劳会制造“替代、整理、降本”需求

发生了什么：[MacRumors 8 月 28 日报道](https://www.macrumors.com/2026/08/28/apple-tv-price-increase/)，Apple TV 在美国月费从 12.99 美元涨到 14.99 美元，年费从 99 美元涨到 119 美元，Apple One Individual 也同步上调；TechCrunch 等媒体也把这放进流媒体订阅普遍涨价的大背景里。

为什么重要：这不是娱乐新闻，而是消费者订阅预算的信号。实际影响是，用户会更频繁搜索“要不要续订”“哪些内容值得看”“怎么取消”“家庭订阅怎么分配”“替代方案有哪些”。建议做小工具或内容站：订阅费用计算器、家庭影音预算表、流媒体内容到期提醒、按兴趣推荐最少订阅组合。风险边界是不要做账号共享、盗版资源或规避付费教程；可做的是合法比价、提醒和预算管理。

## 10. BYD 出海、美国利率与国内资金面：小生意要同时看外需、账期和估值压力

发生了什么：[WSJ 报道](https://www.wsj.com/business/earnings/byds-overseas-push-drives-quarterly-profit-growth-b34b859e)，BYD 二季度利润在收入略降背景下反弹，海外扩张被视为重要驱动；[AP 8 月 28 日市场报道](https://apnews.com/article/stocks-markets-oil-ai-nvidia-0a655f1c042b059279343443d5802907)称，美债两年期收益率因加息预期升至 4.35%，S&P 500 下跌 0.2%，Marvell 虽业绩超预期但股价下跌，说明 AI 股票预期很满；[新华财经货币市场日报](https://m.cnfin.com/yw-lb/zixun/20260828/4462194_1.html)显示 8 月 28 日公开市场全口径净回笼，但本周全口径净投放。

为什么重要：外需、利率和流动性共同决定小团队能不能收钱。实际影响是，跨境汽配、充电配件、车载用品、维修工具、海外内容站仍有需求，但融资成本和客户 ROI 要求会更高。建议把项目报价改成短周期、低垫资、可量化交付：例如“7 天出一版 SKU 成本表”“14 天交付独立站爬虫认证与履约检查”“30 天验证 3 个海外关键词”。风险边界是本节只做市场观察，不构成投资建议。

## 非 AI 热点与传统商机

1. **以旧换新资料与核销服务**：汽车、家电、数码、智能家居、回收商和本地门店都需要补贴流程资料。机会是表单、价格备案、回收凭证、客户登记和售后提醒；风险是骗补、虚假回收和资料造假。

2. **独立站跨境履约检查**：Shopify 的 duties-pre-paid labels、buyer authentication、Web Bot Auth 指向一个事实：出海商家要同时管支付、关税、爬虫、checkout 后触达和追踪。机会是一次性检查包；风险是税务、海关和隐私边界。

3. **平台商家合规体检**：抖音第三方交易治理和天猫发货规则说明，小商家需要把成交链路留在平台内，把发货承诺写清楚。机会是话术审查、商品页合规、售后模板、发货 SLA 表；风险是不能教违规导流。

4. **订阅降本内容站**：Apple TV 涨价强化订阅疲劳。机会是合法替代清单、取消订阅流程、家庭预算模板、内容到期提醒；风险是盗版、账号共享和侵权素材。

## 赚钱与市场方向

1. **Agent IDE 权限审计包**：给使用 Kiro/Cursor/Claude Code/Codex 的开发者或小团队做工具版本、MCP 配置、hooks、敏感路径、仓库打开流程检查，按团队 499-2999 元验证。

2. **Shopify Bot 与跨境履约检查包**：围绕 Web Bot Auth、AI crawler、robots、checkout 后触达、美国包裹预付关税、转化追踪做一次性诊断，适合 Shopify agency 和独立站卖家。

3. **平台规则雷达订阅**：人工汇总抖音、天猫、京东、小红书最新规则，按类目生成行动清单。先用微信群/飞书表格收 99-299 元/月，不急着做 SaaS。

4. **绿色消费/以旧换新本地服务**：给家电卖场、维修回收、县域门店做补贴说明页、登记表、核销台账和售后回访，按单或按月收费，AI 只用于文案和表格辅助。

5. **订阅预算小工具/内容站**：面向家庭和个人做“本月订阅账单 + 合法替代 + 取消提醒”，通过 SEO、联盟佣金或模板销售验证。

## 国内平台/自建站小生意观察

1. **抖音电商合规成交链路**
   现象：平台继续治理诱导第三方交易和相关诈骗风险。
   需求：商家想承接流量，但怕封店、冻结佣金、售后无法处理。
   供给/渠道：商品详情页、直播话术、客服 IM、平台内优惠、售后规则。
   流量来源：抖音规则解读、商家社群、直播运营群、短视频案例。
   利润假设或收费方式：单店诊断 399-999 元，月度话术维护 199-699 元。
   低成本验证：抽 20 条客服回复和 10 个商品页，标注导流、夸大承诺、售后不清项。
   合规/售后/平台风险：不能做刷单、虚假发货、传销、站外诱导交易和规避处罚。

2. **天猫/淘宝发货与资质日历**
   现象：延迟发货、招商资质、保质期等规则持续占据公告区。
   需求：商家在活动、预售、定制、跨仓发货时怕超时赔付和投诉。
   供给/渠道：官方规则、库存表、物流揽收、供应商时效、客服记录。
   流量来源：淘宝/天猫运营群、商家服务市场、规则 SEO、代运营客户。
   利润假设或收费方式：活动前检查 599 元起，月度风控日历 199-599 元。
   低成本验证：给一家店做 14 天发货异常表，观察超时率和退款争议是否下降。
   合规/售后/平台风险：不能伪造物流、虚报库存、伪造资质。

3. **Shopify 自有工具认证与转化追踪**
   现象：Web Bot Auth 让店铺可以认证自有爬虫和脚本，checkout 后扩展也继续加强。
   需求：商家需要避免监控/SEO/价格脚本被误拦，同时减少恶意爬虫和无效流量。
   供给/渠道：Shopify changelog、robots 策略、HTTP signatures、Analytics、Pixels、checkout extensions。
   流量来源：Shopify Community、跨境卖家群、SEO/AI search 讨论、agency 客户。
   利润假设或收费方式：诊断 500-2000 元，持续监控 200-800 元/月。
   低成本验证：选 3 个店检查爬虫访问、checkout 追踪、关税标签和 Thank You 页面触达。
   合规/售后/平台风险：不做恶意爬取、绕过封禁、偷竞品数据；税务和关税只做资料提示。

4. **闲鱼/1688 以旧换新周边**
   现象：补贴政策带动旧机回收、家电维修、配件、安装和二手流转。
   需求：消费者想少花钱换新，商家想处理旧货和售后。
   供给/渠道：1688 配件、维修服务、本地回收、闲鱼二手、社区团购。
   流量来源：小红书经验帖、抖音同城、闲鱼搜索、微信群、本地生活平台。
   利润假设或收费方式：维修/安装/回收差价 30-300 元，资料服务按单 10-50 元。
   低成本验证：选一个品类，如空调清洗、热水器安装、旧手机回收，做 20 单记录毛利和售后。
   合规/售后/平台风险：不能虚假回收、骗补、卖三无配件或隐瞒二手瑕疵。

## 创业/产品机会

1. **Agent 权限体检 CLI**：扫描工作区里的 MCP 配置、hooks、敏感路径、`.env` 暴露和自动执行风险，输出可读报告。

2. **Shopify Bot Auth 配置助手**：帮助商家登记自有爬虫、监控脚本、AI search 工具和 SEO crawler，并生成访问策略文档。

3. **平台规则雷达**：抓取并人工审核抖音、天猫、京东、小红书公告，按类目推送“今天要改什么”。

4. **以旧换新核销台账模板**：面向家电、数码、回收和维修商，做客户登记、旧品凭证、补贴材料和售后回访模板。

5. **订阅账单降本工具**：输入当前订阅，输出合法替代、取消步骤、续费提醒和家庭预算表。

## 营销/内容选题

1. **文章**：《Agent IDE 安全清单：为什么不要让工具默认信任仓库内容》。

2. **短视频**：《Shopify Web Bot Auth 是什么？自有爬虫、AI 搜索和恶意流量怎么分》。

3. **小红书图文**：《以旧换新小生意：家电回收、安装、维修怎么合法做资料和售后》。

4. **案例拆解**：《Cloudflare 省下 100TB 内存，对普通开发者有什么启发》。

5. **SEO 内容**：《Apple TV 涨价后，如何整理家庭流媒体订阅预算》。

## 金融与市场观察

美股 8 月 28 日的信号是“AI 预算仍强，但估值容错率下降”：AP 报道显示短端美债收益率因加息预期明显上行，Marvell 虽业绩超预期但股价下跌，说明市场不再只奖励 AI 叙事。国内货币市场方面，新华财经报道 8 月 28 日公开市场全口径净回笼、但本周仍为净投放，提示月末资金面仍需观察。对个人和小团队，最有用的动作是减少垫资、缩短交付、提高预付款比例，并把产品承诺写成可验证 ROI。

本节只做市场信号和经营风险观察，不构成投资建议。

## 今日行动清单

1. 检查所有 Agent IDE 和 CLI 的版本、MCP 配置、hooks、敏感文件权限，新增仓库先只读打开。
2. 给一个 Shopify 或自建站做 Bot/AI crawler 访问策略表：自有工具、搜索引擎、AI 搜索、恶意爬虫分别处理。
3. 抽查一个抖音/天猫店铺的商品页、客服话术、发货承诺和售后说明，删掉违规导流和模糊承诺。
4. 选一个以旧换新相关品类，做一张补贴资料、旧品回收、安装售后流程表，找 3 个本地商家问价。
5. 审一遍自己的订阅支出，写成一篇“取消/替代/预算”内容，测试搜索和收藏反馈。
6. 从一个项目里挑一条高频路径，检查缓存、日志、图片、向量元数据或数据库表是否有明显成本浪费。

## 来源索引

- AI / Agent / 开发平台：[Cloudflare changelog](https://developers.cloudflare.com/changelog/)、[Google Drive Gemini 数据分类 beta](https://workspaceupdates.googleblog.com/2026/08/gemini-based-data-classification-in-Google-Drive-is-now-available-in-open-beta.html)、[The Hacker News: Kiro prompt injection 报道](https://thehackernews.com/2026/08/amazon-kiro-prompt-injection-can.html)、[Cloudflare 1.1.1.1 DNS cache 优化](https://blog.cloudflare.com/dns-cache-memory-optimization-1111/)
- 独立站 / Shopify / 自建站：[Shopify changelog](https://changelog.shopify.com/)、[Shopify Data and Analytics 社区](https://community.shopify.com/c/data-analytics/293)、[Shopify Accounting & Taxes 社区](https://community.shopify.com/c/accounting-taxes/223)
- 国内平台与政策：[抖音第三方交易治理报道](https://finance.sina.com.cn/roll/2026-08-28/doc-inipwnxr5835862.shtml)、[天猫规则首页](https://www.tmall.com/wow/seller/act/guize)、[2026 年设备更新和消费品以旧换新政策](https://www.ndrc.gov.cn/xxgk/zcfb/tz/202512/t20251230_1402851_ext.html)、[商务部绿色消费试点通知](https://www.mofcom.gov.cn/gztz/art/2026/art_41311872544b4631b0146b03a56230c0.html)
- 传统商业与消费：[MacRumors: Apple TV 涨价](https://www.macrumors.com/2026/08/28/apple-tv-price-increase/)、[WSJ: BYD overseas push](https://www.wsj.com/business/earnings/byds-overseas-push-drives-quarterly-profit-growth-b34b859e)、[Hacker News 热点镜像](https://www.thrml.ink/)
- 金融与市场：[AP 8 月 28 日市场报道](https://apnews.com/article/stocks-markets-oil-ai-nvidia-0a655f1c042b059279343443d5802907)、[新华财经货币市场日报 8 月 28 日](https://m.cnfin.com/yw-lb/zixun/20260828/4462194_1.html)
