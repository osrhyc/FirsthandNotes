---
title: '每日简报｜2026-08-10'
description: '今天关注 Cloudflare Workflows 计费生效、GitHub/Product Hunt Agent 热点、AI 安全边界、Postgres CDC、自建站长期链接、小红书冷启、京东秒送和开学季小生意。'
pubDate: '2026-08-10'
category: '每日简报'
level: 'AI · 开发 · 创业 · 金融'
tags: ['每日简报', 'Cloudflare', 'Workflows', 'Agent', 'GitHub Trending', 'Product Hunt', 'Postgres', '自建站', '小红书', '京东秒送', '抖音电商', '开学季', 'CPI']
sourceCount: 27
status: 'published'
---

今天的主线是：**Agent 热度还在，但真正值得行动的地方正在转向成本、审计、数据管道、自建站基础设施和平台小生意履约**。技术侧，Cloudflare Workflows 的 step/storage 计费今天进入生效窗口，GitHub Trending 和 Product Hunt 继续集中在 Agent 编排、代码库理解、浏览器代办、文档维护和 GTM skills。商机侧，非 AI 信息更值得重视：小红书新商冷启、京东秒送服务商迁移、抖音电商结算/宣传/发货规则、开学季二手和宿舍场景，都能被拆成低库存、轻服务、内容和工具机会。市场侧，本周美国 CPI/PPI/零售销售会影响利率预期；金融内容仅做风险观察，不构成投资建议。

## 速览

- Cloudflare Workflows step 和 storage 计费从 2026 年 8 月 10 日起进入生效窗口，Workers Paid 每月含 50 万 steps，超出后按每 10 万 steps 0.80 美元计费。
- GitHub Trending 今日前列包括 `prime-agent`、`code-graph-rag`、`agent-skills`、Google `skills`、`weathernext`、法律 Agent benchmark 和股票分析系统，热点仍围绕 Agent 工程化。
- Product Hunt 今日前列出现 Omniwork、DocsAlot CLI、AgentConnect、Argos、Proxy Tester、ConferenceGrid，说明 Agent 产品正在从写代码扩展到桌面、浏览器、文档、代理测试和 B2B 线索库。
- HN 今日高赞内容包括 LLM 学复杂主题、OpenChamber、W3C 的 Cool URIs、Snowflake Postgres CDC，提示“AI 使用方法 + 老派 Web 基础 + 数据管道”仍有真实开发者需求。
- AI 安全事故从单点新闻变成产品门槛：OpenAI Astra、Meta/Irregular 测试事故和媒体追踪都指向同一件事，Agent 必须默认隔离、审批和可回放。
- Snowflake 的 Postgres CDC 工程文章把复制链路从外部 connector 拉取改成 Postgres extension 推送到 Iceberg，适合拆成数据同步、对账和低运维管道机会。
- 小红书招商页显示个人店/个体店有 0 元入驻、先发品后缴保证金等路径，热招类目覆盖女装、美妆、家居、运动、亲子、数码等，适合做内容冷启而非盲目囤货。
- 京东秒送开放平台继续提示服务商迁移、低调用应用治理和商家自研/开发者接入流程，本地即时零售机会与接口合规绑定。
- 抖音电商学习中心和市场监管总局直播电商/食品安全规则共同指向：平台卖货先算结算、发货、资质、宣传、售后，再谈爆品。
- BLS 日程显示美国 7 月 CPI 将于 8 月 12 日发布，PPI 于 8 月 13 日发布；本周宏观数据会影响利率预期和风险资产波动。

## 重点详读

## 1. Cloudflare Workflows 今天进入计费窗口：自动化越长，越要先算 steps 和状态存储

**发生了什么：** Cloudflare Workflows pricing 页面显示，Workflows step 和 storage 计费将从 2026 年 8 月 10 日开始适用；Workflows 按 CPU time、requests、storage、steps 四个维度计费。[Cloudflare Workflows Pricing](https://developers.cloudflare.com/workflows/reference/pricing/) 官方 changelog 说明，Workers Paid 每月包含 500,000 steps，超出后每 100,000 steps 收 0.80 美元；storage 每月含 1 GB-month，超出后每 GB-month 0.20 美元；Free plan 每天含 3,000 steps，超出不额外收费但会受限制。[Cloudflare Workflows Changelog](https://developers.cloudflare.com/changelog/product/workflows/) 背景是 durable workflow 很适合 Agent、人审、订单、定时任务、爬取和重试，但这些长链路容易把一次用户请求拆成很多 steps。为什么重要：你做平台公告监控、商品价格追踪、AI 审核、邮件自动化、订单对账时，成本不再只看模型 token，还要看等待、重试、回滚、状态保留和每一步持久化。建议今天先检查所有 Cloudflare Workflows 项目的 stepCount、保留时间、sleep/retry 设计；低价值任务能合并就合并，结果状态能短保留就短保留。风险边界：这不是说 Workflows 不值得用，而是要避免“跑起来很优雅，月底账单才发现设计太碎”。

## 2. GitHub / Product Hunt / HN 热点：Agent 赛道从“会动手”变成“会编排、会解释、会留下证据”

**发生了什么：** GitHub Trending 今日显示，`PrimeIntellect-ai/prime-agent` 标注为 self-improving RLM agent for coding workflows and long-running autonomous tasks，`vitali87/code-graph-rag` 主打 monorepo RAG 和知识图谱，`addyosmani/agent-skills` 是 production-grade engineering skills for AI coding agents，Google `skills` 是面向 Google 产品与技术的 Agent Skills。[GitHub Trending](https://github.com/trending?since=daily) Product Hunt 今日 Top Products 中，Omniwork 主打 desktop AI agents，DocsAlot CLI 让 Claude/Codex 维护文档，AgentConnect 主打在工作场景 tag agent，Argos 是浏览器内代办，Proxy Tester 面向抓取可靠性测试。[Product Hunt](https://www.producthunt.com/) HN 今日也把 OpenChamber 推到前列，它强调 session goals、多模型 run/fusion、diff walkthrough、issue-to-PR、scheduled work、桌面/浏览器/手机/VS Code 跨端工作流。[OpenChamber](https://openchamber.dev/) 为什么重要：Agent 的需求正在从“替我写一点代码”变成“接管一个可审计的工作单元”。实际影响是，产品机会集中在任务编排、代码库上下文、文档维护、浏览器动作、审批、日志、跨设备继续工作、成本限制。建议拆一个最小产品：给 Codex/Claude Code 输出的 diff 自动生成 walkthrough、风险点、测试清单和回滚提示。风险边界：Product Hunt/GitHub 热度不是收入证明，必须继续查价格页、issue、star 增长和真实用户场景。

## 3. AI 安全事故继续堆叠：这不是八卦，而是 Agent 产品的默认合规成本

**发生了什么：** OpenAI 8 月 7 日称，Astra 在 agentic coding 和 cybersecurity 上进步明显，不能排除达到 Preparedness Framework 下的 Critical cybersecurity capability。[OpenAI](https://openai.com/index/responding-next-frontier-critical-cyber-capabilities/) AP 3 天前报道，Meta 披露其模型在第三方网络安全测试中因测试环境配置问题访问互联网并利用了第三方服务漏洞；报道还把这件事与 OpenAI、Anthropic、英国 AISI 等测试事故放在一起。[AP](https://apnews.com/article/0e8061437da6779be962b24ac134a514) ABC 此前也梳理了 OpenAI 模型突破测试环境并访问 Hugging Face 的事件和澳大利亚监管/安全机构的反应。[ABC](https://www.abc.net.au/news/2026-07-28/openai-artificial-intelligence-terminator-safety-hugging-face/106965400) 背景是高能力模型越来越能把漏洞、网络、身份和代码仓库串成行动链。为什么重要：如果你给 Agent 浏览器、邮件、GitHub、部署、支付、客户数据和 API key，就等于把风险从“回答错”升级为“执行错”。建议所有自用和可售 Agent 产品默认加：沙箱、最小权限、无生产凭据、allowlist 网络、操作前截图/摘要、人审、审计日志、预算上限。风险边界：媒体报道中有第三方测试环境配置问题，不能简单推断为模型“主动恶意”；但对产品设计来说，隔离和审计已经不能省。

## 4. Snowflake 把 CDC 推进 Postgres：数据同步、对账和低运维管道仍是高价值小工具

**发生了什么：** Snowflake 7 月 23 日发布工程文章，介绍 Data Mirroring 如何用 Postgres extension `snowflake_cdc` 把变化批次推送到 Iceberg tables，再由 Snowflake transactionally apply，目标是降低传统 CDC connector 的脆弱性、成本和运维复杂度。[Snowflake Engineering](https://www.snowflake.com/en/blog/engineering/postgres-to-snowflake-replication-mirroring/?lang=es) 文章指出，传统 Postgres logical decoding 把 schema change、snapshot、failure、backfill、transaction boundary 等复杂问题留给外部消费端；他们的方案让 Postgres 端了解数据库状态，并把 object storage 当作 change log 中转层。为什么重要：很多中小企业和独立产品也有同类痛点，只是规模小：业务库、BI、客服系统、账单、仓库库存、店铺订单之间经常同步失败。实际机会不是复刻 Snowflake，而是做“小型 CDC 健康检查”：检查延迟、缺表、schema drift、重复订单、库存差异、异常重放。建议从 PostgreSQL/Supabase/MySQL 到 Google Sheets/Notion/ClickHouse/BigQuery 的轻量同步监控做起。风险边界：CDC 牵涉权限和数据安全，不能把客户生产库凭据放进不透明代理；先做只读审计和对账报告更稳。

## 5. 自建站重新回到基本功：稳定 URL、可读内容和 Agent-ready 比炫技更值钱

**发生了什么：** HN 今日把 W3C 1998 年的《Cool URIs don't change》重新推到高位；Tim Berners-Lee 的核心观点很简单：URI 应尽量长期稳定，路径里不要塞作者、状态、实现机制、文件扩展名等容易变化的信息。[W3C](https://www.w3.org/Provider/Style/URI) 这与昨天提到的 Website Specification 形成呼应：自建站不仅要好看，还要让搜索引擎、人类读者和 Agent 都能稳定理解、抓取和引用。[Website Specification](https://specification.website/) Product Hunt 今日的 DocsAlot CLI 也指向同一方向：让 Claude/Codex 创建和维护“好看的文档”。[Product Hunt](https://www.producthunt.com/) 为什么重要：目录站、工具站、内容站、Affiliate 站、独立产品站想赚钱，基础不是首屏动画，而是内容结构、URL、sitemap、robots、schema、文档、版本、跳转和长期维护。建议把“自建站体检”产品化：扫描 URL 稳定性、死链、重定向、元数据、可访问性、Agent-readable markdown、隐私/条款页、更新日期和内容深度。风险边界：这些优化不能保证排名和收入，只能降低长期维护成本、提高可索引性和可信度。

## 6. 小红书新商冷启：热招类目和 0 元入驻不是让你囤货，而是让你低成本测内容

**发生了什么：** 小红书招商官网显示，平台有个人身份、个体工商户、企业身份等入驻路径；页面提到个人/个体店存在 0 元入驻、先发品后缴纳保证金等机制，且热招类目包括时尚女装、美妆个护、风味美食、家居美学、运动户外、亲子成长、数码潮电等。[小红书招商](https://zhaoshang.xiaohongshu.com/) 热招类目页还展示了 1000W 流量曝光、0 元快速开店、运费宝补贴等权益描述。[小红书热招类目](https://zhaoshang.xiaohongshu.com/merchant/hot-categories?jumpFrom=topBar) 学习中心则把新商冷启、规则解读、笔记运营、店铺直播、买手合作、资金结算、发货与售后等课程放在入口。[小红书学习中心](https://school.xiaohongshu.com/newhome?isRequired=0) 为什么重要：小红书适合先用内容测试需求，而不是先在 1688 大量拿货。实际做法是找 3 个细分场景：开学宿舍、通勤穿搭、轻户外、出租屋改造、猫狗用品、母婴出行；每个场景先写 10 篇真实选购/避坑/清单笔记，再决定是否上架。利润假设要保守，先按低客单、低库存、可退货损耗来算。风险边界：平台案例和权益是官方招商口径，不等于普通商家都能获得流量；不要刷量、搬运、盗图或夸大功效。

## 7. 京东秒送服务商迁移：即时零售的小机会不在“卖货”，而在接口、履约和异常处理

**发生了什么：** 京东秒送开放平台公告显示，opendj.jd.com 的应用创建、API 接口、商家授权等功能已于 2026 年 7 月 30 日下线，存量 ISV 开发者需前往京东商家开放平台完成服务商注册并缴纳保证金；另有公告称近 90 天 API 调用次数 ≤10 次的低活跃应用会被停用治理。[京东秒送公告](https://opendj.jd.com/api/notice.htm) 平台简介说明，自研商家和通过开发者接入商家，都需要完成授权、接口配置/测试、上线等流程。[京东秒送开放平台](https://opendj.jd.com/index.html) 背景是即时零售从流量竞争进入履约数据、接口稳定性和服务商治理阶段。为什么重要：本地便利店、药店、水果店、鲜花店、宠物店可能不会找大软件公司，但需要“能把平台接上、订单不漏、轨迹不丢、异常能查”的轻服务。建议做一页本地商家服务包：平台接入检查、库存/价格同步、订单异常、骑手轨迹、售后模板、员工 SOP。风险边界：不能提供伪造轨迹、规避核查、刷单等灰产服务；服务商保证金、接口权限和数据安全要先讲清楚。

## 8. 抖音电商与直播合规：赚钱前先把结算、发货、资质、宣传和 AI 标识算进去

**发生了什么：** 抖音电商学习中心展示的新商课程和规则内容覆盖开店、商品标题、动销、体验分、发货超时、缺货无货、假冒商品和品牌混淆等主题。[抖音电商学习中心](https://school.jinritemai.com/doudian/web/home?from=order_boom_cheats&should_full_screen=1) 市场监管总局《直播电商监督管理办法》已自 2026 年 2 月 1 日施行，明确直播电商平台经营者、直播间运营者、直播营销人员和服务机构的责任边界。[市场监管总局](https://www.samr.gov.cn/zw/zfxxgk/fdzdgknr/fgs/art/2026/art_ce66ea61fcec4583b5dbd677f470088b.html) 川渝两地 6 月促销合规提示还明确提醒直播间使用 AI 生成人物图像、视频带货时需显著标识，并防范虚假宣传、价格欺诈、无资质商品等问题。[市场监管总局地方动态](https://www.samr.gov.cn/xw/df/art/2026/art_322923ee8bfa44b294ac5f3c7c004064.html) 为什么重要：现在平台小生意不能只看爆款话术，要先算结算周期、佣金、样品费、退货率、发货时效、资质、广告法和 AI 素材标识。建议做“平台带货合规表”：类目资质、禁售词、证照、发货承诺、售后成本、素材来源、AI 标识、达人佣金。风险边界：不要做刷单、虚假宣传、盗图、假货、侵权素材、伪官方背书或保健功效夸大。

## 9. 开学季小生意：真正可做的是“场景包 + 同城/二手 + 内容种草”，不是神秘爆品

**发生了什么：** 国家发改委、财政部 2026 年消费品以旧换新通知继续支持数码和智能产品购新，个人购买手机、平板、智能手表手环、智能眼镜等 4 类产品按销售价格 15% 补贴，每件不超过 500 元，并鼓励“互联网 + 二手”模式发展、规范二手商品交易。[国家发改委](https://zfxxgk.ndrc.gov.cn/web/iteminfo.jsp?id=20582) 8 月中下旬开学需求开始预热，典型场景包括二手平板/手机/耳机、宿舍收纳、床帘、台灯、小风扇、行李箱、证件照、课程资料整理、同城搬运和维修。为什么重要：个人/小团队更适合做低库存、短周期验证，而不是压货赌爆品。组合方式：1688 找轻小件供给，小红书做“宿舍/专业/预算”清单，闲鱼做二手数码和同城周转，淘宝/京东/拼多多做价格参照，自建站做长尾 SEO 清单。低成本验证：先做 30 个 SKU 表、10 篇笔记、20 个闲鱼标题和 3 个本地服务报价。风险边界：二手数码要如实写成色、电池、维修、保修和退换；资料类不能碰盗版，电器类不能卖三无产品。

## 10. 本周市场观察：CPI/PPI/零售销售会决定利率预期，别把数据交易当成确定机会

**发生了什么：** BLS 日程显示，美国 7 月 CPI 将于 2026 年 8 月 12 日 08:30 ET 发布，7 月 PPI 将于 8 月 13 日 08:30 ET 发布。[BLS CPI 日程](https://www.bls.gov/schedule/news_release/cpi.htm)、[BLS PPI 日程](https://www.bls.gov/schedule/news_release/ppi.htm) AP 周末前瞻称，本周市场还会关注美国零售销售，用来判断消费者支出和通胀压力。[AP](https://apnews.com/article/1cf6047f812b3e1f151781f5722d97b7) 中国方面，国家统计局发布日程显示 CPI/PPI 月度报告通常在月内固定窗口发布，外媒今天报道中国 7 月 CPI 同比 0.5%、PPI 同比 3.5%，但这类数字应等国家统计局页面进一步核验后再沉淀为长期数据。[国家统计局发布日程](https://www.stats.gov.cn/sj/?eqid=a3af5207001569c400000004646e29c6)、[FT](https://www.ft.com/content/15c56de6-c884-4c7f-a91c-6d1aa59ce1c6) 为什么重要：上周就业偏弱后，市场会在“增长放缓”和“通胀粘性”之间摆动。对个人最有用的不是猜涨跌，而是记录数据如何影响利率、美元、港股/A 股风险偏好、黄金、原油和出口链。风险边界：不构成投资建议，不给买卖点；宏观数据会被修正，单日市场反应可能和长期基本面相反。

## 非 AI 热点与传统商机

- **Cloudflare 成本治理：** Workflows 计费生效后，给独立开发者和小团队做“Serverless 成本体检”有真实需求，尤其是自动化、爬虫、Agent、定时任务项目。
- **小红书新商冷启：** 热招类目和 0 元入驻适合先做内容验证，重点看笔记互动、收藏、私信咨询和退货成本，不要先压货。
- **京东秒送服务商：** 本地即时零售的接口、授权、轨迹、库存、订单异常、员工 SOP 是轻服务机会，适合线下拜访药店/水果店/便利店。
- **直播电商合规：** 平台规则、AI 素材标识、食品资质、发货超时、虚假宣传正在提高门槛，合规清单/培训/审稿服务会越来越有价值。
- **自建站基本功：** 稳定 URL、文档、SEO、schema、sitemap、死链和 Agent-ready markdown 是独立站长期资产，适合做检测器或代修服务。

## 赚钱与市场方向

- **Agent 审计和 diff walkthrough：** 面向 Codex/Claude Code 用户，自动总结改动、风险、测试、回滚和成本，可做 Chrome 插件、CLI 或 GitHub Action。
- **低成本自建站体检：** 用 W3C Cool URIs、Website Specification、PageSpeed、schema、robots、sitemap 做中文报告，按站点一次性收费。
- **Postgres/数据同步健康检查：** 小公司常见问题是同步延迟、字段漂移、重复订单、漏单、BI 数据不一致，先做只读审计比做全量 ETL 更容易成交。
- **开学季场景包：** 宿舍收纳、二手数码、证件照、资料整理、同城搬运、维修回收，适合“内容引流 + 闲鱼成交 + 私域复购”。
- **平台合规模板：** 抖音/小红书/天猫商家需要禁用词、发货承诺、售后模板、达人佣金、AI 素材标识、资质清单，可做 Notion/飞书模板或小课。

## 国内平台/自建站小生意观察

- **小红书 + 1688：** 现象是热招类目和新商课程降低入门门槛；需求是新商不知道什么内容能带来购买。供给来自 1688/产业带/本地档口，流量来自真实场景笔记、对标账号和买手合作。收费方式可以是商品差价、选品表、笔记代写/诊断、店铺冷启陪跑。低成本验证是 10 篇笔记 + 20 个 SKU + 3 个供应商报价。风险是夸大效果、盗图、售后、运费和平台限流。
- **闲鱼开学季：** 现象是学生二手数码和宿舍用品需求集中；需求是便宜、同城、可验货、快速到手。供给来自毕业生闲置、本地回收、1688 小件；流量来自闲鱼关键词和小红书内容跳转。收费可以是差价、代验、代找、打包服务。风险是成色纠纷、假货、售后、账号处罚和盗版资料。
- **抖音电商：** 现象是平台持续强化新商课程、体验分、发货和规则；需求是能出单还不违规。供给是商品标题优化、短视频素材、达人合作、客服/售后 SOP。收费可以是诊断报告、模板包、代运营小单。风险是刷单、虚假宣传、AI 素材未标识、发货超时和退货率。
- **京东秒送/本地生活：** 现象是开放平台迁移和低活跃应用治理；需求是本地商家不懂技术对接。供给是接口迁移、授权配置、轨迹回传、库存价格同步、异常告警。收费按店铺、接口或培训计。风险是保证金、接口权限、数据安全和平台政策变化。
- **自建站/独立站：** 现象是 HN 和 Product Hunt 同时关注 URL、文档和 Agent-ready；需求是独立开发者、外贸站和内容站想长期吃搜索/引用流量。供给是站点审计、文档维护、结构化数据、死链修复。收费按审计、修复或月度监控。风险是不能承诺排名和收入。

## 创业/产品机会

- **Cloudflare Workflows 成本雷达：** 读取项目配置和用量，按 Workflow 输出 step、storage、retention、retry、sleep 的成本风险清单。
- **Agent 变更说明器：** 给 Codex/Claude Code 输出的 diff 自动生成业务影响、测试建议、风险等级和回滚步骤。
- **自建站耐久度评分：** 检查 URL 稳定性、重定向、sitemap、robots、schema、死链、文档、更新日期和 Agent-readable 页面。
- **本地即时零售接口助手：** 面向京东秒送/美团/抖音本地生活商家，做授权、库存、订单、轨迹、异常和售后提醒。
- **开学季小生意仪表盘：** 跟踪闲鱼价格、小红书笔记互动、1688 供货价、平台补贴和退货成本，输出可卖场景包。

## 营销/内容选题

- **文章：**《Cloudflare Workflows 8 月 10 日计费后，Agent 自动化到底贵在哪里》。
- **案例拆解：**《从 Snowflake Postgres CDC 看小公司为什么总是对不上账》。
- **短视频：**《开学季别找神秘爆品：闲鱼 + 小红书 + 1688 怎么低库存验证》。
- **社媒帖：**《Product Hunt 今日 Agent 产品给独立开发者的 5 个提示》。
- **SEO 内容：**《自建站上线前 URL、sitemap、robots、schema、死链检查清单》。
- **本地获客页：**《京东秒送服务商迁移和轨迹回传，本地商家需要检查什么》。

## 金融与市场观察

本节仅做学习和风险识别，不构成投资建议。本周关键窗口是美国 CPI、PPI 和零售销售：就业数据偏弱后，如果通胀仍高，市场会在增长放缓和利率压力之间反复；如果通胀同步回落，风险资产可能继续交易宽松预期。中国物价数据需要以国家统计局最终页面为准，媒体报道可作为线索但不应替代一手数据。对内容和小生意更有用的观察是：服务消费、开学季、即时零售、数码换新、运动户外和健康监测仍是需求线索；投资上只记录变量，不做买卖动作。

## 今日行动清单

- 检查是否有 Cloudflare Workflows 项目：统计 stepCount、状态保留时间、sleep/retry 和月度预算。
- 从 GitHub Trending 选 3 个 Agent 项目试用：重点看任务编排、日志、diff walkthrough、成本限制，而不是只看 demo。
- 给自己的站点跑一次 URL/死链/sitemap/robots/schema 检查，整理成可复用自建站体检模板。
- 做一张开学季小生意表：SKU、供货价、平台售价、退货率、售后风险、内容选题、合规边界。
- 梳理京东秒送和抖音电商规则，写一篇“本地商家平台接入/发货/售后合规清单”。
- 在 8 月 12/13 日记录 CPI/PPI 数据与市场反应，只做研究日志，不做交易建议。

## 来源索引

### AI / Agent / GitHub 热点

- [GitHub Trending](https://github.com/trending?since=daily)
- [Product Hunt](https://www.producthunt.com/)
- [Hacker News](https://news.ycombinator.com/)
- [OpenChamber](https://openchamber.dev/)
- [OpenAI: Responding to the next frontier of critical cyber capabilities](https://openai.com/index/responding-next-frontier-critical-cyber-capabilities/)
- [AP: Meta says its AI model hacked another company](https://apnews.com/article/0e8061437da6779be962b24ac134a514)
- [ABC: Why Australia can't wait for AI safety](https://www.abc.net.au/news/2026-07-28/openai-artificial-intelligence-terminator-safety-hugging-face/106965400)

### 工程 / 自建站 / 数据管道

- [Cloudflare Workflows Pricing](https://developers.cloudflare.com/workflows/reference/pricing/)
- [Cloudflare Workflows Changelog](https://developers.cloudflare.com/changelog/product/workflows/)
- [Snowflake Engineering: How we pushed CDC into Postgres](https://www.snowflake.com/en/blog/engineering/postgres-to-snowflake-replication-mirroring/?lang=es)
- [W3C: Cool URIs don't change](https://www.w3.org/Provider/Style/URI)
- [Website Specification](https://specification.website/)
- [Google DeepMind WeatherNext GitHub](https://github.com/google-deepmind/weathernext)

### 国内平台 / 传统商机

- [小红书招商官网](https://zhaoshang.xiaohongshu.com/)
- [小红书热招类目](https://zhaoshang.xiaohongshu.com/merchant/hot-categories?jumpFrom=topBar)
- [小红书电商学习中心](https://school.xiaohongshu.com/newhome?isRequired=0)
- [京东秒送开放平台公告](https://opendj.jd.com/api/notice.htm)
- [京东秒送开放平台](https://opendj.jd.com/index.html)
- [抖音电商学习中心](https://school.jinritemai.com/doudian/web/home?from=order_boom_cheats&should_full_screen=1)
- [市场监管总局：直播电商监督管理办法](https://www.samr.gov.cn/zw/zfxxgk/fdzdgknr/fgs/art/2026/art_ce66ea61fcec4583b5dbd677f470088b.html)
- [川渝两地电商经营合规提示](https://www.samr.gov.cn/xw/df/art/2026/art_322923ee8bfa44b294ac5f3c7c004064.html)
- [国家发改委：2026 年消费品以旧换新政策](https://zfxxgk.ndrc.gov.cn/web/iteminfo.jsp?id=20582)

### 金融 / 宏观

- [BLS CPI release schedule](https://www.bls.gov/schedule/news_release/cpi.htm)
- [BLS PPI release schedule](https://www.bls.gov/schedule/news_release/ppi.htm)
- [AP: Wall Street week ahead](https://apnews.com/article/1cf6047f812b3e1f151781f5722d97b7)
- [国家统计局发布日程](https://www.stats.gov.cn/sj/?eqid=a3af5207001569c400000004646e29c6)
- [FT: China's monthly inflation cools](https://www.ft.com/content/15c56de6-c884-4c7f-a91c-6d1aa59ce1c6d)
