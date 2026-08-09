---
title: '每日简报｜2026-08-09'
description: '周日简报：关注 Agent 安全与观测、科学开源模型、AI 成本、自建站规范、Shopify 库存架构、京东秒送、开学季二手与平台电商合规。'
pubDate: '2026-08-09'
category: '每日简报'
level: 'AI · 开发 · 创业 · 金融'
tags: ['每日简报', 'Agent', 'AI安全', 'Cloudflare', '自建站', 'Shopify', '京东秒送', '抖音电商', '开学季', '二手交易', '文旅消费', '就业数据']
sourceCount: 25
status: 'published'
---

今天是周日，官方大发布不多，所以本期采用“近 24 小时热点雷达 + 过去 48 小时仍会影响下周动作的事项”。技术主线不是单纯模型发布，而是 **Agent 进入浏览器、观测、安全、成本和网站可读性**：这决定了下一批可做工具会围绕可控交付，而不是再包一层聊天框。商机主线继续向非 AI 倾斜：即时零售服务商、开学季二手/宿舍小件、文旅服务、平台电商规则和自建站 SEO/合规，都比泛 AI 内容更接近现金流。市场侧，7 月美国就业数据和本周 CPI 发布窗口会影响利率预期，但这里仅做风险观察，不构成投资建议。

## 速览

- OpenAI 8 月 7 日披露 Astra 不能排除达到 Critical cyber capability，Agent 权限、隔离、日志和审批要按更高风险等级设计。
- Cloudflare Workers Changelog 8 月 4 日上线 Agent traces，Kitesurf 又把浏览器自动化变轻；Agent 产品正在从“执行任务”走向“可审计执行任务”。
- DOE Genesis Open Models 首轮 foundation-stage data 8 月 14 日截止，post-training data and environments 8 月 25 日截止，垂直 AI 的壁垒会转向数据、评测和工作流环境。
- Product Hunt 昨日榜单集中在 self-driving software、solo founder Agent OS、网页自动化、Agent 浏览器和 AI 翻译平台，赚钱方向偏“自动化交付 + 审批 + 垂直工作流”。
- Hacker News 今日热榜出现 Website Specification 和 Shopify 库存架构等话题，非 AI 技术热点偏网站标准、自建站可读性和电商底层工程。
- Website Specification 在 8 月 8 日新增/更新 AVIF、DNS sale signal、Agent readiness 等条目，自建站越来越需要“让人和 Agent 都读得懂”。
- 京东秒送开放平台要求商家自送轨迹 8 月 25 日前完成对接，9 月起常态化核查；本地零售服务商机会和履约合规绑定在一起。
- 国家发改委 2026 年以旧换新政策继续支持数码、家电、智能家居和二手规范交易，开学季二手数码/宿舍小件是低库存验证窗口。
- 抖音电商学习中心 8 月 8 日出现精选联盟推广费/服务费结算规则更新，平台卖货要把佣金、结算、虚假宣传和发货履约一起算。
- BLS 日程显示 7 月 CPI 将于美国东部时间 8 月 12 日 08:30 发布；上周就业数据偏弱，市场对利率路径的敏感度会上升。

## 重点详读

## 1. Astra 安全信号继续发酵：Agent 产品先补权限和隔离，不要先追“全自动”

**发生了什么：** OpenAI 8 月 7 日发布安全说明，称对即将到来的 Astra 模型做内部评估后，发现其在 agentic coding 和 cybersecurity 上进步明显，已经“不能排除”达到 Preparedness Framework 下的 Critical cybersecurity capability。[OpenAI](https://openai.com/index/responding-next-frontier-critical-cyber-capabilities/) 同时说明 Astra 是 upcoming model，并未参与此前 Hugging Face 事件；公司已经暂停不符合强化安全控制要求的内部活动，并加强隔离测试环境、网络/工具访问限制、模型权重保护、监控和检测。背景是模型从“帮人写安全代码”走向“可能自主发现、组合和执行更复杂攻击路径”。为什么重要：个人开发者做 Codex、Claude Code、浏览器 Agent 或自动化脚本时，最大风险不是模型回答错，而是它拿到真实凭据、生产权限和网络写入能力后出错。建议今天把常用 Agent 任务分成只读研究、代码修改、联网写入、部署/支付四级，每级对应不同 token、环境变量和人工审批。风险边界：这是 OpenAI 对未来模型的内部评估，不等于当前所有 AI 工具都具备 Critical 能力；但它足以作为下周安全基线。

## 2. Cloudflare Agent traces：Agent 赚钱前要先能解释每一步为什么花钱、为什么失败

**发生了什么：** Cloudflare Workers Changelog 8 月 4 日新增 Agent traces，支持用 Agents SDK 构建的应用展示每个 agent turn、模型调用、工具运行、approval、token usage 和 Workers runtime operations。[Cloudflare Changelog](https://developers.cloudflare.com/changelog/product/workers/) 还说明消息和工具 payload 默认不记录，只有确认安全时才开启。结合 Cloudflare 8 月 6 日发布的 Kitesurf，一个运行在 Workers V8 isolates 上的 agent-first browser，[Cloudflare](https://blog.cloudflare.com/kitesurf/) 正在把 Agent 执行、浏览器任务和观测放到同一条线上。为什么重要：如果你做网页监控、平台公告抓取、商品比价、SEO 审核、线索自动录入，客户不会只问“能不能跑”，还会问“错在哪里、花了多少钱、有没有泄露数据”。实际影响是，Agent 工具的付费点可以从单次执行转向日志、回放、异常归因、审批流和成本报表。建议用一个小工具先验证：抓取 10 个平台公告页面，记录页面加载、截图、抽取、模型总结、人工确认和失败重试。风险边界：Kitesurf 不适合视频、WebGL、真实 TLS 指纹挑战和长会话；复杂平台仍应优先用官方 API。

## 3. DOE Genesis Open Models：垂直 AI 的机会不在“又一个模型”，而在任务、数据和评测

**发生了什么：** DOE Genesis Open Models 页面显示，美国能源部与行业伙伴启动面向科学研究的 open-weight foundation models 计划，首个模型是 Genesis-Science-1。[Genesis Open Models](https://genesisopenmodels.anl.gov/) 当前贡献入口开放，foundation-stage data 第一轮 8 月 14 日截止，post-training data and environments 8 月 25 日截止；征集范围包括科学文本、代码、文档、结构化集合、专家示例、工作流环境、RL 任务、held-out evaluations、rubrics、tests 和 verifiers。背景是很多行业 AI 产品败在“没有可验证任务”，不是败在 UI。为什么重要：这给个人/小团队一个很清楚的产品模板：不要一开始就训练模型，先做垂直任务库、输入样例、输出评分、人工复核和错误案例。比如电商规则、财税问答、投放诊断、合同条款、供应链报价，都可以先做 benchmark + workflow。建议本周选一个熟悉领域，整理 50 个真实任务和评分标准。风险边界：DOE 项目面向科研生态，参与有数据权利和机构门槛；对个人更重要的是方法论，不是直接参与。

## 4. Product Hunt 热点：Solo founder 工具正在从“帮你写代码”转向“帮你交付运营工作”

**发生了什么：** Product Hunt 昨日 Top Products 包括 Coldtea.ai “Make your software self-driving”、Soloop “Approval-first Agent OS for solo founders”、Rindler “Automate the web work your team does by hand”、Nitro 4.0 “translation platform built for AI agents”、BrowserOS neo “browser for Claude, Cowork & Codex”。[Product Hunt](https://www.producthunt.com/) 同页的 Trending categories 仍有 Vibe Coding Tools、AI Dictation Apps、AI notetakers、Code Review Tools、No-code Platforms、Figma Plugins 和 Static site generators。背景是开发者和创业者不缺模型入口，缺的是把网页、文档、审批、翻译、设计、客服、工单串起来的交付系统。为什么重要：这类产品更接近付费场景，因为它替代的是重复运营工作，而不是娱乐性聊天。建议不要只看榜单名字，要拆它们的收费对象：solo founder、运营团队、翻译供应商、网页自动化重度用户、设计站点用户。可低成本验证的方向是“审批优先的网页自动化模板库”：比如每次操作前截图、生成改动摘要、人工确认再提交。风险边界：Product Hunt 是热度信号，不是收入证明；榜单高不代表留存高，必须找定价页、用户评论和替代方案验证。

## 5. Website Specification：自建站机会从“会搭页面”升级为“会做可审计的网站标准包”

**发生了什么：** 今日 HN 热榜出现 `_for-sale DNS records` 讨论，指向 Website Specification。该站自称是面向人和 Agent 的网站技术规范，覆盖 title、security.txt、WCAG contrast、SEO、Agent Readiness、Performance、Privacy、Resilience 等 168 个主题；页面显示 8 月 8 日新增“域名可在 DNS 中声明出售”、更新 AVIF、DS automation best current practice 等内容。[Website Specification](https://specification.website/) 背景是自建站、目录站、工具站、Affiliate 站越来越多，但大多数站点缺 robots、sitemap、结构化数据、图片格式、可访问性、隐私页、错误页、security.txt 和 Agent-readable 文档。为什么重要：这不是普通教程，而是可以产品化成服务的 checklist。实际影响是，你可以给独立开发者、小商家、跨境站做“自建站体检报告”，按 SEO、转化、性能、安全、Agent 可读性分级收费。低成本验证：拿自己站点和 5 个朋友站点跑一遍，输出 20 项缺陷清单和修复报价。风险边界：规范不是 Google 排名保证；不能把 checklist 包装成“必然涨流量”，只能说降低技术债和提高可读性。

## 6. Shopify 库存架构复盘：传统电商系统仍有很多“高价值但不性感”的工具机会

**发生了什么：** Shopify Engineering 文章复盘了如何把库存 reservation 从 Redis 迁移到 MySQL，并在高峰流量下扩展。[Shopify Engineering](https://shopify.engineering/scaling-inventory-reservations) 他们用 MySQL 8 的 `SKIP LOCKED`、一件库存一行的 bounded pool、复合主键、`READ COMMITTED`、一致锁顺序、`UNION ALL` 批处理和连接持有时间追踪，解决 oversell/undersell、死锁、连接耗尽和观测盲区。文章称黑五 2025 峰值达到每分钟 510 万美元销售额，迁移后高流量 flash sales 中 writer CPU 低于 50%、reader CPU 低于 16%，这是 Shopify 场景下的案例数据。为什么重要：传统电商、仓配、库存、订单、价格、促销、会员这些系统不是热点词，但客户愿意为“不超卖、不漏单、不对账失败”付费。建议从小商家视角做“库存一致性体检”：多平台 SKU 映射、库存扣减日志、订单取消回补、异常对账。风险边界：Shopify 架构不能照搬到小店；小团队先做报表和告警，不要直接碰交易核心。

## 7. 京东秒送 8 月 25 日轨迹回传节点：本地即时零售机会和平台接口合规绑定

**发生了什么：** 京东秒送开放平台通知显示，平台要求商家自配履约下的物流轨迹信息统一回传，服务商需在 8 月 25 日前完成对接改造，9 月起常态化核查；未按标准接入可能被警告、限期整改、限制接口权限直至终止合作。[京东秒送公告](https://opendj.jd.com/api/notice.htm) 另一条说明显示，京东秒送开放平台面向商家和第三方开发者开放 O2O 到家服务集成，涉及商品、门店、价格、库存、订单、促销、财务、售后、会员等系统对接。[平台简介](https://opendj.jd.com/staticnew/widgets/introduce/introductionPlatform.html) 背景是即时零售竞争已经从“有没有流量”进入“履约数据透明、平台规则可核查”。为什么重要：个人开发者不一定能做完整 ERP，但可以做轨迹回传检测、门店地址校验、订单异常提醒、接口迁移清单、商家培训文档。低成本验证：找 3 个本地便利店/药店/水果店，问他们是否同时做京东、美团、抖音团购和私域配送，痛点通常在库存、地址、骑手、售后。风险边界：不要提供伪造轨迹、规避核查等服务；平台接口和保证金要求要按官方规则执行。

## 8. 开学季 + 以旧换新：闲鱼/小红书/1688 的低库存小钱机会在“场景包”而不是爆款神话

**发生了什么：** 国家发改委、财政部 2026 年以旧换新通知明确，继续支持汽车、家电、数码和智能产品购新，个人购买手机、平板、智能手表手环、智能眼镜等 4 类产品，按销售价格 15% 补贴，每件不超过 500 元；同时鼓励“互联网 + 二手”模式发展、规范二手商品交易。[国家发改委](https://zfxxgk.ndrc.gov.cn/web/iteminfo.jsp?id=20582) 背景是 8 月下旬到 9 月初是开学季，需求集中在二手手机/平板/耳机、宿舍收纳、台灯、小风扇、床帘、键盘鼠标、证件照、课程资料整理等。为什么重要：个人做小钱不要赌全国爆款，而要围绕“学生/家长在一个时间窗口必须解决的问题”做低库存组合。渠道上，1688 找供给，小红书做场景笔记，闲鱼做二手/同城周转，淘宝/拼多多做比价，私域做复购。利润假设要保守：实物件先按 10%-25% 毛利、售后/退货/运费吃掉一半来算；虚拟资料要注意版权。风险边界：不做盗版资料、不虚假宣传补贴资格、不卖三无电器；二手数码要写清成色、电池、保修和退换规则。

## 9. 抖音/天猫/食品合规：平台卖货的门槛不在开店，而在结算、履约和宣传边界

**发生了什么：** 抖音电商学习中心首页 8 月 8 日新规速递出现“精选联盟推广费/服务费结算规则”，8 月 7 日出现“商家货款结算日期细则”和“创作者虚假宣传处置细则”。同页还把新商成长、商品运营、流量运营、达人合作、服务履约、搜索运营等课程放在核心入口，并展示大量学习人数。[抖音电商学习中心](https://school.jinritemai.com/doudian/web/home?from=douyinofficial_table) 天猫规则首页则继续展示招商资质、延迟发货、美妆/家装/保健食品等规则更新。[天猫规则](https://www.tmall.com/wow/seller/act/guize) 市场监管总局此前也部署网络食品安全合规提质行动，重点治理直播带货乱象、入网食品资质和虚假宣传。[市场监管总局](https://www.samr.gov.cn/xw/zj/art/2026/art_cf5c13b637cd4fe6b2322f6d2cf3b777.html) 为什么重要：很多“野路子”只讲起号和爆单，不讲结算周期、佣金、样品、退货、罚款、资质和广告法。建议把平台卖货拆成合规清单：类目资质、发货时效、售后模板、达人佣金、结算周期、宣传禁词、保质期、素材版权。风险边界：不要做刷单、虚假宣传、盗图、侵权搬运、伪造资质；短期 GMV 不等于可持续利润。

## 10. 服务消费与就业数据：下周看 CPI，不要把“市场上涨”误读成基本面变好

**发生了什么：** 商务部 7 月 24 日称，2026 年上半年社会消费商品和服务零售总额同比增长 2.7%，其中服务零售额增长 5.3%，高于商品零售额 4.2 个百分点；重点平台智能眼镜、心电监护仪、运动相机、有机食品等也出现增长。[商务部](https://www.mofcom.gov.cn/syxwfb/art/2026/art_35fce5e4db6e465599b8a200bd4bb844.html) 文旅部暑期文旅消费季从 7 月初持续至 8 月底，推出超 3 万场文旅消费活动和超 4.5 亿元消费券/补贴。[文化和旅游部](https://www.mct.gov.cn/wlbphone/wlbydd/xxfb/gzxx/202607/t20260709_966479.html) 海外市场方面，BLS 日程显示 7 月就业报告于 8 月 7 日发布，AP 报道称美国 7 月非农就业减少 2.3 万人、失业率降至 4.1% 主要受劳动力退出影响；BLS CPI 日程显示 7 月 CPI 将在 8 月 12 日 08:30 ET 发布。[BLS 就业日程](https://www.bls.gov/schedule/news_release/empsit.htm)、[AP](https://apnews.com/article/9c2d147c14bc428458be5a1e83e54957)、[BLS CPI 日程](https://www.bls.gov/schedule/news_release/cpi.htm) 这意味着本周市场会在“就业转弱”和“通胀是否粘性”之间重新定价。对个人行动，服务消费更适合做本地路线页、预约页、暑期亲子/避暑/研学内容；金融上只记录宏观变量，不做买卖建议。

## 非 AI 热点与传统商机

- **即时零售接口服务：** 京东秒送 8 月 25 日轨迹回传节点说明，本地零售商家需要“懂平台接口 + 懂履约”的轻服务，适合做迁移检查表、异常订单提醒、门店地址校验和员工培训。
- **开学季二手与宿舍场景：** 发改委政策支持数码购新和二手规范交易，闲鱼/小红书/1688 可以围绕宿舍收纳、二手平板、台灯、小风扇、证件照、课程资料整理做场景包。
- **暑期文旅尾段：** 文旅消费季持续到 8 月底，最后三周适合做本地避暑、亲子、夜游、博物馆、研学、赛事旅行路线页和小红书/公众号内容，不适合再做重资产投入。
- **食品和保健品合规：** 市监总局、天猫、抖音都在强调资质、宣传、发货和保质期；小团队若做食品带货，优先做合规清单和供应商审核，不要做夸大功效话术。

## 赚钱与市场方向

- **Agent 交付基础设施：** 预算可见、执行回放、审批、浏览器截图、失败重试、权限隔离，会比“一个更聪明的聊天机器人”更容易让团队付费。
- **自建站体检服务：** Website Specification 可变成 SEO/性能/安全/可访问性/Agent readiness 报告，按站点收费，适合服务独立开发者、外贸站、小商家。
- **本地商家数字化小单：** 京东秒送、美团/大众点评、抖音团购、私域配送之间的信息不同步，是小型工具和咨询服务入口。
- **二手/回收信息差：** 以旧换新和开学季叠加，适合做本地二手数码检测、成色说明、价格监控和交易撮合，但必须避开翻新欺诈和售后纠纷。
- **服务消费内容站：** 暑期文旅和本地生活能做低成本 SEO 页面：路线、价格、预约、避坑、交通、亲子适配、雨天替代方案，变现靠广告、联盟、商家线索。

## 国内平台/自建站小生意观察

- **闲鱼 + 小红书 + 1688 开学季组合：** 现象是学生/家长集中采购宿舍小件和二手数码；需求是低价、能快速到手、少踩坑。供给来自 1688 小件、闲鱼二手、本地回收；流量靠小红书场景笔记和闲鱼标题关键词。收费方式是实物差价、代找/代验服务费、清单资料包。低成本验证是先做 20 个 SKU 表和 10 篇场景笔记。风险是售后、真假、盗版资料、电器安全和平台封禁。
- **抖音电商中小商家冷启：** 现象是平台学习中心把新商成长、达人合作、搜索运营、体验分、发货规则放在显眼位置；需求是“能开单但不违规”。供给可以是选品清单、商品标题优化、素材规范、达人佣金表、结算周期表。流量来自短视频/直播/搜索；收费可以是诊断报告、模板包或代运营小单。风险是虚假宣传、刷单、侵权素材和退货率。
- **自建站标准化交付：** 现象是 Website Specification 把 SEO、性能、安全、隐私、Agent readiness 做成 checklist；需求是小站长不知道自己站点缺什么。供给是审计脚本、报告模板、修复包。流量来自 GitHub、HN、独立开发社区、SEO 关键词。收费可以按一次审计、月度监控或修复工时。风险是不要承诺排名和收入，只承诺可验证技术项。
- **京东秒送/本地 O2O 服务商：** 现象是轨迹回传、取餐地址、服务商入驻和接口迁移都有明确节点；需求是商家不懂接口和平台规则。供给是对接检查、沙箱测试、履约异常报表、员工 SOP。流量来自本地商家拜访、行业群、服务市场。收费可以按店铺/接口/培训收费。风险是保证金、接口权限、数据安全和平台政策变化。

## 创业/产品机会

- **Agent 执行审计台：** 聚合模型调用、工具调用、浏览器截图、token cost、审批记录和错误回放，先支持 Cloudflare Workers / Playwright / OpenAI / Anthropic 常见栈。
- **自建站 Agent-ready 检测器：** 基于 Website Specification 做中文报告，输出 robots、sitemap、llms.txt、security.txt、结构化数据、图片格式、可访问性和隐私项。
- **开学季二手数码价格雷达：** 抓取闲鱼/淘宝/京东/拼多多/补贴政策公开页，做成参考价、成色模板、验机清单和售后风险提示。
- **即时零售履约合规助手：** 针对京东秒送、美团、抖音本地生活，做接口节点、门店地址、轨迹回传、超时发货、售后异常的检查和提醒。

## 营销/内容选题

- **文章：**《不要再做 AI 聊天壳了：Agent 产品真正要卖的是审批、日志和成本控制》。
- **短视频：**《开学季小钱机会：闲鱼二手平板 + 1688 宿舍小件，怎么低库存验证》。
- **案例拆解：**《Shopify 为什么把库存 reservation 从 Redis 迁到 MySQL：小商家能学什么》。
- **SEO 内容：**《自建站上线前 30 项检查：SEO、性能、安全、隐私、Agent readiness》。
- **社媒帖：**《京东秒送 8 月 25 日轨迹回传节点：本地零售服务商要检查什么》。

## 金融与市场观察

本节仅做宏观和市场风险观察，不构成投资建议。美国 7 月就业数据弱于预期后，市场会更关注本周 8 月 12 日的 CPI：如果通胀仍粘性，利率预期可能反复；如果通胀同步走弱，风险资产可能继续交易宽松预期。国内消费线索看，服务消费增速强于商品消费，暑期文旅、运动户外、健康监测、智能硬件和有机食品有结构性需求，但这更适合作为内容/产品选题，不应直接等同于投资机会。个人行动上，记录“就业、CPI、服务消费、平台规则”四类数据即可，避免用单日市场涨跌做决策。

## 今日行动清单

- 把自己的 Agent/Codex/Claude Code 工作流按只读、代码改动、联网写入、部署支付四级重整权限。
- 给 Firsthand Notes 或任意自建站跑一遍 Website Specification checklist，记录可做成工具的检查项。
- 建一个 AI 成本表：模型、输入/输出 token、浏览器任务、缓存、失败重试、人工审批时间都要有列。
- 梳理京东秒送 8 月 25 日轨迹回传节点，判断是否能做一篇本地商家服务商迁移指南。
- 做一张开学季 SKU/服务验证表：二手数码、宿舍小件、证件照、资料整理、同城配送，逐项写供给、毛利、售后风险。
- 8 月 12 日前记录 CPI 预期和就业数据，不做交易建议，只做利率路径和内容选题观察。

## 来源索引

### AI / Agent / 开发工具

- [OpenAI: Responding to the next frontier of critical cyber capabilities](https://openai.com/index/responding-next-frontier-critical-cyber-capabilities/)
- [Cloudflare Workers Changelog: Agent traces](https://developers.cloudflare.com/changelog/product/workers/)
- [Cloudflare: Kitesurf](https://blog.cloudflare.com/kitesurf/)
- [DOE Genesis Open Models](https://genesisopenmodels.anl.gov/)
- [Databricks: Managing AI Coding Costs at Scale](https://www.databricks.com/blog/managing-ai-coding-costs-scale)
- [Claude Code 产品页](https://claude.com/product/claude-code)
- [Product Hunt](https://www.producthunt.com/)
- [Hacker News](https://news.ycombinator.com/)

### 自建站 / 工程 / 开源热点

- [Website Specification](https://specification.website/)
- [Shopify Engineering: Scaling inventory reservations](https://shopify.engineering/scaling-inventory-reservations)
- [GitHub Trending](https://github.com/trending?since=daily)

### 国内平台 / 传统商机

- [京东秒送开放平台公告](https://opendj.jd.com/api/notice.htm)
- [京东秒送开放平台简介](https://opendj.jd.com/staticnew/widgets/introduce/introductionPlatform.html)
- [国家发改委：2026 年设备更新和消费品以旧换新政策](https://zfxxgk.ndrc.gov.cn/web/iteminfo.jsp?id=20582)
- [抖音电商学习中心](https://school.jinritemai.com/doudian/web/home?from=douyinofficial_table)
- [天猫规则](https://www.tmall.com/wow/seller/act/guize)
- [市场监管总局：网络食品安全合规提质系列行动](https://www.samr.gov.cn/xw/zj/art/2026/art_cf5c13b637cd4fe6b2322f6d2cf3b777.html)
- [商务部：2026 年上半年消费市场情况](https://www.mofcom.gov.cn/syxwfb/art/2026/art_35fce5e4db6e465599b8a200bd4bb844.html)
- [文化和旅游部：全国暑期文化和旅游消费季](https://www.mct.gov.cn/wlbphone/wlbydd/xxfb/gzxx/202607/t20260709_966479.html)

### 金融 / 宏观

- [BLS Employment Situation release schedule](https://www.bls.gov/schedule/news_release/empsit.htm)
- [AP: US job market stalled in July](https://apnews.com/article/9c2d147c14bc428458be5a1e83e54957)
- [BLS CPI release schedule](https://www.bls.gov/schedule/news_release/cpi.htm)
