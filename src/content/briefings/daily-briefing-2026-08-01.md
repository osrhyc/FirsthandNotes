---
title: '每日简报｜2026-08-01'
description: '回填 8 月 1 日简报：周末前的主线是 AI 成本治理、欧盟 AI 透明度倒计时、PMI 回落、平台规则和服务消费机会。'
pubDate: '2026-08-01'
category: '每日简报'
level: 'AI · 开发 · 创业 · 金融'
tags: ['每日简报', 'AI合规', 'GitHub Copilot', 'Vercel', 'Cloudflare', 'PMI', '电商', '家政服务', '自建站', '金融市场']
sourceCount: 22
status: 'published'
---

今天是 8 月第一个周末，本期为回填简报，重点放在 7 月 31 日前后已经确认、但 8 月 1 日仍直接影响行动的消息。技术侧不是新模型刷屏，而是 AI 使用开始进入“权限、预算、日志、合规、模型退休”的运营阶段；这类消息不热闹，却最容易让项目突然失效或账单失控。非 AI 侧更值得盯：7 月 PMI 回落、网上服务与农村电商继续增长、家政政策强调标准和保险，说明钱并不只在 AI 壳里，也在服务履约、平台规则、供应链和本地生活里。对个人/小团队来说，今天更适合做轻库存验证、成本表、规则清单和内容获客页面，而不是追大而全产品。

## 速览

- 欧盟 AI Act Article 50 透明度义务将在 8 月 2 日适用，AI 聊天、深度伪造和公共利益 AI 文本要提前补标识。
- GitHub Copilot Billing Preview app 将在 8 月 3 日退休，团队应把用量、预算和成本中心迁回 GitHub billing settings。
- GitHub Enterprise teams model policy targeting 进入 public preview，模型权限开始按团队和角色细分。
- Vercel AI Gateway 新增日志页，能看 cost、token、duration、provider、region 和 fallback path，AI 成本归因更容易。
- Cloudflare MCP server portals 支持静态 OAuth client credentials，可连接 Slack、GitHub 等不支持 DCR 的上游 MCP。
- 国家统计局称 7 月制造业 PMI 为 49.2%，非制造业商务活动指数为 49.0%，小商家要降低库存假设。
- 商务部上半年电商数据里，网上服务、旅游餐饮、农产品、智能眼镜和智能外骨骼增速比泛卖货更有信号。
- 家政服务政策强调品牌、保险、长期护理、信用、合同和明码标价，本地服务的机会在标准化和信任。
- 抖音电商近期围绕商品卡免佣、创作者等级、禁止商品/信息和履约规则密集公示，平台小生意先读规则。
- BEA 6 月 PCE 同比 3.7%、核心 PCE 同比 3.3%，海外通胀仍会影响利率、美元和风险偏好，本节不构成投资建议。

## 重点详读

## 1. 欧盟 AI 透明度明天适用：跨境 AI 工具要先补“告知和标记”

**发生了什么：** 欧盟委员会 7 月 20 日发布 Article 50 透明度义务指南，明确相关义务从 2026 年 8 月 2 日开始适用。[欧盟委员会指南](https://digital-strategy.ec.europa.eu/en/news/commission-publishes-guidelines-transparency-obligations-providers-and-deployers-certain-ai-systems) 官方 Quick Facts 说明，用户与 AI 系统交互时要被告知；AI 生成或修改内容需要机器可读标记；部署者还要对情绪识别、生物识别分类、深度伪造以及未经人工编辑的公共利益文本作出说明。[Quick Facts](https://digital-strategy.ec.europa.eu/en/factpages/quick-facts-transparency-rules-ai-systems)

**背景：** 这条虽然不是 8 月 1 日当天新发布，但明天就生效，优先级高于普通产品新闻。它影响的不只是欧洲大平台，面向欧盟用户的 AI 客服、AI 内容站、营销素材生成器、外呼工具、自动生成视频和跨境 SaaS 都可能需要处理。

**为什么重要：** 对你这类独立开发/自建站场景，合规经常不是律师问题，而是产品设计问题：用户界面是否说清楚“这是 AI”，生成内容是否带标签，是否保存人工审核和生成日志。现在能把这件事做成组件、模板和检查清单，本身就是商机。

**实际影响：** 自建站应检查 AI 聊天窗口、自动生成文章、图片/视频生成、邮件营销、客服回复和隐私政策。给客户做站或插件时，也可以把“AI 透明度默认组件”变成交付卖点。

**建议/行动：** 今天先做一个最小 checklist：AI 身份告知、AI 内容标签、deepfake 声明、人工审核标记、日志留存、隐私政策。风险边界是：本文不是法律意见；具体适用范围要结合用户地区、用途和角色判断。

## 2. GitHub Copilot 从“可用”进入“可管”：预算、模型权限和团队治理变成刚需

**发生了什么：** GitHub 7 月 7 日公告，Copilot Billing Preview app 会在 2026 年 8 月 3 日退休；Copilot 花费查看、user-level budgets、cost centers、usage reports 和 billing API 都转到 GitHub billing settings。[GitHub Copilot billing](https://github.blog/changelog/2026-07-07-copilot-billing-preview-app-will-be-retired-on-august-3/) 7 月 31 日，GitHub 又宣布 Enterprise teams model policy targeting 进入 public preview，大多数企业客户会在 8 月 3 日获得 preview opt-in，可按 enterprise teams 授权模型。[GitHub model policy](https://github.blog/changelog/2026-07-31-enterprise-teams-model-policy-targeting-in-public-preview/)

**背景：** AI 编程工具早期只拼能力，现在开始拼治理。企业要知道谁能用哪些模型、哪个团队能试贵模型、用量池怎么分配；个人也要知道 Codex、Claude Code、Cursor、Copilot 每月到底烧掉多少钱。

**为什么重要：** 对重度 Coding Agent 用户，成本治理会直接影响工作流选择。以后不是所有任务都应该丢给最贵模型，代码搜索、样式调整、文档整理、测试补全可以拆到不同模型或工具。

**实际影响：** 如果你管理 GitHub 组织，要检查旧 Billing Preview app 书签和报表是否还在用。团队模型策略也意味着“按角色发模型权限”会成为企业 AI 管理内容的长期选题。

**建议/行动：** 做一张 AI 工具成本表，列出工具、模型、月费、额外 credit、报表入口、预算阈值和导出方式。风险边界是：GitHub preview 功能分批开放，具体入口以账户后台为准。

## 3. Vercel/Cloudflare 的更新说明：Agent 应用开始补运营基础设施

**发生了什么：** Vercel 7 月 31 日给 AI Gateway 新增 dedicated Logs page，可查看每次请求的 cost、token counts、duration、model、provider、region 和路由方式，还可按 provider、model、modality、credentials、status 过滤并导出 CSV/JSON。[Vercel AI Gateway logs](https://vercel.com/changelog/ai-gateway-logs) Vercel 的 AI Gateway 产品页也强调统一 API、fallback、budget、spend monitoring 和项目维度可观测性。[Vercel AI Gateway](https://vercel.com/ai-gateway)

**背景：** Cloudflare 同日更新 MCP server portals，支持静态 OAuth client credentials，用于连接 Slack、GitHub 等没有 Dynamic Client Registration 的上游 MCP；Wrangler 4.116.0 也新增 `wrangler check startup`，能报告 Worker bundle size 和本地 CPU startup profile。[Cloudflare changelog](https://developers.cloudflare.com/changelog/)

**为什么重要：** 这说明 Agent 应用正在从 demo 进入运营：要能控成本、看日志、接 SaaS、查冷启动。独立开发者真正能卖的不是“我也接了模型”，而是“这个 Agent 不乱花钱、能追踪、能接工具、上线后可维护”。

**实际影响：** 可以围绕 AI Gateway 日志做成本周报，围绕 MCP OAuth 做连接器配置服务，围绕 Worker startup 做边缘函数瘦身和依赖审计。对自建站和 B2B 工具，这些都是实际交付价值。

**建议/行动：** 今天给所有 AI 项目补 `request_id / model / provider / cost / user / feature` 记录。风险边界是：平台能力本身不保证商业成功，仍要验证客户是否愿意为稳定、省钱和可审计付费。

## 4. Anthropic 8 月 5 日模型退休：旧模型名会变成本周运行时风险

**发生了什么：** Anthropic 的 model deprecations 文档显示，`claude-opus-4-1-20250805` 已在 2026 年 6 月 5 日弃用，计划 2026 年 8 月 5 日退休，推荐迁移到 `claude-opus-4-8`；文档还说明，过退休日期的模型请求会失败。[Anthropic model deprecations](https://platform.claude.com/docs/en/docs/about-claude/model-deprecations)

**背景：** 模型退休是 AI 项目最常见的“静默风险”。很多 demo、脚本、MCP server、自动化任务和教程会写死模型名，平时看不出问题，一到截止日就报错或进入 fallback。

**为什么重要：** 你会频繁使用 Codex、Claude Code、Cursor 和各种 API/CLI，模型名散落在代码、环境变量、文档和第三方配置里。趁周末做一次搜索，成本很低，收益很确定。

**实际影响：** 检查 `.env`、serverless function、自动化任务、MCP server、测试 fixture、教程 Markdown 中的 `claude-opus-4-1`、`claude-opus-4`、`claude-sonnet-4`。迁移后要复测输出格式、成本、速度和上下文长度。

**建议/行动：** 本周把所有 AI 模型名集中到一个配置文件，并给每个模型写 `owner / 用途 / 退休日期 / fallback`。风险边界是：如果只通过官方 App 使用，一般由产品兜底；自写 API 必须自己负责。

## 5. 7 月 PMI 回落：小生意不要把“便宜供给”误判为“真实需求”

**发生了什么：** 国家统计局 7 月 31 日解读 2026 年 7 月 PMI：制造业 PMI 为 49.2%，非制造业商务活动指数为 49.0%，综合 PMI 产出指数为 49.3%，分别比上月下降 1.1、1.2、1.3 个百分点。[国家统计局 PMI 解读](https://www.stats.gov.cn/sj/zxfbhjd/202607/t20260731_1964252.html)

**背景：** 细分项更有价值：高技术制造业 PMI 为 53.3%，装备制造业为 51.4%，但消费品行业和高耗能行业分别为 47.8% 和 47.0%；通用设备、计算机通信电子设备行业产需相对活跃，非金属矿物、黑色金属、汽车等偏弱。

**为什么重要：** 对 1688、闲鱼、小红书、抖音、淘宝小店来说，宏观回落会带来便宜货源、尾货和低价竞争，但需求不一定同步增长。真正需要验证的是用户是否还愿意买、是否低退货、是否容易讲清楚价值。

**实际影响：** 高库存、强售后、季节性和价格战品类要谨慎；更适合小批量测试智能硬件配件、办公降本工具、设备维护、数码周边、本地服务和内容型产品。

**建议/行动：** 做一个选品评分表：刚需、复购、低售后、低库存、内容可种草、供应稳定、合规风险。风险边界是：PMI 是宏观指标，不代表所有类目都差，结构性机会仍在。

## 6. 上半年电商数据：网上服务、农产品和智能硬件比泛卖货更值得拆

**发生了什么：** 商务部电子商务司 7 月 24 日介绍上半年电商发展：1-6 月全国网上商品零售额增长 4.8%，网上服务零售额增长 6.0%；旅游和餐饮网上销售额分别增长 27.2% 和 13.9%；农产品网零额增长 12.2%；智能外骨骼和智能眼镜网零额分别增长 458.4% 和 151.7%。[商务部电商](https://www.mofcom.gov.cn/xwfb/sjfzrfb/art/2026/art_ed8dde0be8a04a50b6ef49bb219bfdda.html)

**背景：** 这比“某达人晒爆单截图”可靠。它说明：平台电商不是没机会，但增量不在泛泛铺货；服务化、体验化、产业带、农产品上行和智能硬件周边更像真实需求。

**为什么重要：** 个人/小团队不一定要压货做整机。智能眼镜增长可以拆成配件、收纳、教程、评测、二手价格、维修、场景方案；农产品增长可以拆成溯源页面、礼盒设计、产地故事、打包 SOP 和直播资料库。

**实际影响：** 小红书适合测内容，抖音适合测商品卡和短视频，1688 适合找低 MOQ 供给，闲鱼适合测二手/配件/租赁，自建站适合沉淀 SEO 和导购页。

**建议/行动：** 选三个类目做“三角验证”：内容热度、平台供给、低成本履约。风险边界是：食品、医疗、儿童、保健、进口品类资质要求高，不能只看毛利。

## 7. 家政政策：本地生活的机会在“信任、保险、合同、标准”

**发生了什么：** 商务部等 9 部门发布促进家政服务业高质量发展的政策措施，提出培育品牌企业、创新保险产品、引导家政企业参与长期护理服务、加强灵活就业社保、举办家政服务促消费活动、完善信用信息共享、合同示范文本、标准研制和价格监管。[商务部家政政策](https://www.mofcom.gov.cn/zwgk/zcfb/art/2026/art_4f7753bfa9db4f51ba867282ebd3ad2c.html)

**背景：** 家政是传统行业，但它的痛点非常现代：获客难、报价不透明、服务质量不可控、隐私和安全风险高、复购靠信任、纠纷处理成本高。政策越强调标准和信用，越说明“工具 + 内容 + 运营”有价值。

**为什么重要：** 对你关注的小钱机会，本地服务比纯倒货更接近现金流。你不一定亲自做家政，可以做获客页、报价器、合同模板、评价表、排班工具、客服自动化、培训资料和商家私域。

**实际影响：** 适合从一个城市、一个细分服务切入，比如收纳、保洁、陪诊、养老照护、育儿嫂、家电清洗。先做内容和表单验证，后续再决定做服务商撮合、SaaS 或代运营。

**建议/行动：** 今天做一页“服务标准 + 价格范围 + 风险说明 + 预约表单”。风险边界是：入户、老人儿童、医疗照护场景必须明确资质、保险和责任，不能只做流量中介。

## 8. 抖音/京东规则：平台红利旁边永远有封禁和履约风险

**发生了什么：** 抖音电商学习中心近期围绕商品卡免佣、创作者等级、禁止商品/信息、欺诈发货和中小商家运营持续更新内容；学习中心也把“商品卡免佣”“新商流量支持”“违规避坑”“千川投放”等放在商家高频学习入口。[抖音电商学习中心](https://school.jinritemai.com/doudian/web/home?from=xiaodian_help) 京东开放平台的宙斯迁移公告页显示，原宙斯开发者中心需要迁移到新开放平台入口。[京东开放平台](https://jos.jd.com/platformdetail?itemId=2291&listId=0)

**背景：** 平台小生意赚钱，通常不是因为你懂某个“野路子”，而是你比别人更早理解规则、活动、流量入口和履约要求。抖音商品卡和京东 API 迁移都属于规则变化带来的服务机会。

**为什么重要：** 对商家来说，规则错误会直接变成扣分、限流、保证金、售后和货款风险。对个人开发者来说，可以做规则雷达、合规选品表、迁移清单、客服 SOP 和商家小工具。

**实际影响：** 抖音可关注商品卡标题/主图/价格/任务完成，京东可关注商家 ERP、订单、库存、售后 API 迁移。不要做刷单、虚假发货、侵权素材和无资质商品。

**建议/行动：** 做一个“平台规则变化数据库”，字段包括平台、类目、发布时间、生效时间、影响对象、行动项、违规风险。风险边界是：官方规则页面可能动态更新，必须定期复查。

## 9. Product Hunt / HN / GitHub 热点：工具信任、AI 代码质检、录屏和自建站增长仍在升温

**发生了什么：** Product Hunt 的榜单和周榜显示，开发者与增长类产品持续集中在 AI agent、AI 代码质检、语音编码、广告自动化、开源 SEO、实时结构化搜索、自建站优化等方向。[Product Hunt](https://www.producthunt.com/) GitHub Trending 和 Hacker News 继续可作为技术热点雷达，但不能替代一手公告。[GitHub Trending](https://github.com/trending) [Hacker News](https://news.ycombinator.com/)

**背景：** 这些热点不等于收入证明，但能告诉你开发者和独立产品正在围绕什么焦虑付费：代码质量、工具信任、被 AI/搜索发现、广告转化、演示素材、自动化工作流、团队协作。

**为什么重要：** 对你来说，热点的用法不是追每个新产品，而是把它变成选题和验证清单。比如“AI 写代码会漂移”可以转成 PR 检查工具；“开源 SEO”可以转成中文自建站工具链；“录屏 demo editor”可以转成课程作者和 SaaS 官网素材需求。

**实际影响：** 可做低成本实验：一个 GitHub Action 检查 AI 代码改动范围，一个自建站 SEO checklist，一个商品页录屏模板，一个 Product Hunt 中文拆解栏目。

**建议/行动：** 每天只选 3 个热点归档到表格，记录用户是谁、付费理由、是否已有竞品、能否 3 天做 demo。风险边界是：社区热度有噪音，必须继续查价格、留存和真实客户。

## 10. 金融与市场：PCE 没有低到让风险消失，PMI 回落要求现金流优先

**发生了什么：** BEA 7 月 30 日发布 6 月个人收入与支出：个人收入环比增长 0.2%，PCE 环比增长 0.3%，实际 PCE 环比增长 0.4%；PCE 价格指数环比下降 0.1%，核心 PCE 环比增长 0.1%；同比看 PCE 为 3.7%，核心 PCE 为 3.3%。[BEA](https://www.bea.gov/news/2026/personal-income-and-outlays-june-2026)

**背景：** 这组数据叠加中国 7 月 PMI 回落，说明宏观环境不是单边乐观。海外通胀仍高于 2% 目标区间，国内需求和生产经营活动回落，汇率、利率、广告成本和用户消费意愿都会影响小生意。

**为什么重要：** 如果做自建站、跨境、AI SaaS、进口品、广告投放或库存生意，都要同时看成本和转化。最危险的是只看“某品类增长”就压货，忽略退款、库存、广告和现金周转。

**实际影响：** 本周更适合轻资产验证：先内容、先表单、先预售、先手工服务，避免大额库存和长期固定成本。基金/股市学习上，重点记录通胀、PMI、汇率、行业景气和估值，不做单点判断。

**建议/行动：** 给每个项目加一列现金消耗：库存、广告、API、订阅、人工、物流、退款。风险边界：本节只做信息解读和研究线索，不构成投资建议。

## 非 AI 热点与传统商机

- **服务消费与家政标准化：** 家政政策把保险、信用、合同、价格监管放到台前，适合做本地服务报价页、合同模板、评价系统和商家私域，不适合无资质撮合高风险服务。
- **农村电商和农产品上行：** 商务部数据显示农产品网零额增长 12.2%，机会在溯源内容、包装、礼盒、直播资料和物流 SOP；风险是食品资质、产地真实性和冷链损耗。
- **智能硬件周边：** 智能眼镜网零额增速高，但个人更适合做配件、教程、导购、维修和二手价格库，不建议盲目囤整机。
- **平台规则服务：** 抖音、京东规则和接口变化给商家带来真实焦虑，合规清单、迁移检查、客服 SOP 和活动报名提醒可做成内容或服务。

## 赚钱与市场方向

- **AI 合规检查器：** 面向跨境 AI 网站，检查聊天入口、AI 内容标签、隐私政策、日志留存，先做免费 checklist 引流，再卖模板或咨询。
- **Agent 成本账本：** 结合 GitHub/Vercel/Anthropic/OpenAI 用量导出，按项目和模型做月报，适合个人和小团队。
- **家政/本地服务落地页包：** 一个城市一个细分服务，页面包含报价、流程、案例、风险说明和预约表单，收费可按建站或线索。
- **平台规则周报：** 做抖音/京东/淘宝/拼多多规则索引，给商家每周发行动清单；风险是必须只做合规，不碰违规玩法。

## 国内平台/自建站小生意观察

- **闲鱼二手/维修：** 现象是需求谨慎时二手和维修更有吸引力；需求来自省钱、短期使用和替代新品；供给来自个人闲置、尾货、企业旧设备；流量来自闲鱼搜索、小红书避坑帖、同城；利润来自检测、差价、打包和质保；验证从低客诉小件开始；风险是成色纠纷、假货、侵权和售后扯皮。
- **小红书本地服务种草：** 现象是家政、收纳、陪诊、维修、亲子体验可以用真实案例获客；需求是信任和省心；供给来自本地服务商；流量来自长尾笔记和同城推荐；收费是线索费、代运营或套餐；验证发 10 篇本地长尾内容；风险是资质、隐私、安全和退款。
- **抖音商品卡轻运营：** 现象是平台继续教育商家做商品卡和短视频；需求是降低直播依赖；供给来自抖店商家和 1688；流量来自商城搜索、商品卡和短视频；利润来自代运营、素材包、佣金分成；验证 20 个商品标题/主图；风险是虚假宣传、发货异常、类目错放。
- **自建站目录/比较页：** 现象是 Product Hunt 周榜里开源 SEO、结构化搜索、站点优化仍热；需求是被搜索和 AI 引用；供给是公开资料和人工筛选；流量来自 SEO、社媒和 GitHub；收费是 affiliate、赞助、模板或订阅；验证先做 20 个页面；风险是周期长和数据维护成本。

## 创业/产品机会

- **AI Disclosure Kit：** 给 Astro/Next.js/Shopify/WordPress 提供 AI 标签组件、政策文本、机器可读标记和审计日志模板。
- **Model Retirement Scanner：** 扫描仓库和环境变量里的旧模型名，输出迁移建议和截止日期。
- **平台规则雷达：** 聚合抖音/京东/淘宝/拼多多规则，按生效日期和类目生成商家行动清单。
- **本地服务报价器：** 为家政、保洁、维修、陪诊做报价、合同、预约和评价闭环。

## 营销/内容选题

- 《8 月 2 日 EU AI Act 透明度生效：独立开发者要补哪 6 件事》
- 《Copilot 账单 App 退休后，AI 编程工具成本怎么记账》
- 《7 月 PMI 回落后，1688 选品为什么不能只看进货价》
- 《家政服务不是传统老生意：标准、保险和私域才是现金流》
- 《Product Hunt 周榜拆解：AI 代码质检、开源 SEO 和广告自动化为什么热》

## 金融与市场观察

本节只做学习和风险识别，不构成投资建议。美国 6 月 PCE 同比 3.7%、核心 PCE 同比 3.3%，说明通胀没有回到低压状态；中国 7 月 PMI 回落说明内需、生产和非制造业活动仍要谨慎观察。对个人项目，本周的关键词是现金流：少库存、短验证、低固定成本、先看真实咨询和复购。对基金/股市学习，记录宏观数据和行业景气即可，不用把它翻译成具体买卖动作。

## 今日行动清单

1. 给所有 AI 产品和内容站补 AI 透明度 checklist，8 月 2 日前至少完成页面文案和标签。
2. 搜索仓库里的 Claude 旧模型名，8 月 5 日前完成迁移。
3. 把 Copilot、Vercel AI Gateway、OpenAI/Anthropic 的用量入口整理到同一张成本表。
4. 用 PMI 和电商数据筛 3 个非 AI 方向：家政、本地服务、智能硬件配件、农产品内容任选。
5. 建一个平台规则数据库，先收录抖音商品卡、创作者等级、京东开放平台迁移。
6. 所有小生意验证先做内容/表单/预售，不先囤货。

## 来源索引

**AI 与开发工具**

- [欧盟委员会：Article 50 透明度指南](https://digital-strategy.ec.europa.eu/en/news/commission-publishes-guidelines-transparency-obligations-providers-and-deployers-certain-ai-systems)
- [欧盟 AI 透明度 Quick Facts](https://digital-strategy.ec.europa.eu/en/factpages/quick-facts-transparency-rules-ai-systems)
- [GitHub：Copilot Billing Preview app 8 月 3 日退休](https://github.blog/changelog/2026-07-07-copilot-billing-preview-app-will-be-retired-on-august-3/)
- [GitHub：Enterprise teams model policy targeting](https://github.blog/changelog/2026-07-31-enterprise-teams-model-policy-targeting-in-public-preview/)
- [Anthropic model deprecations](https://platform.claude.com/docs/en/docs/about-claude/model-deprecations)
- [Vercel AI Gateway logs](https://vercel.com/changelog/ai-gateway-logs)
- [Vercel AI Gateway](https://vercel.com/ai-gateway)
- [Cloudflare changelog](https://developers.cloudflare.com/changelog/)

**非 AI 商机与平台**

- [国家统计局：7 月 PMI 解读](https://www.stats.gov.cn/sj/zxfbhjd/202607/t20260731_1964252.html)
- [商务部：2026 年 1-6 月电商发展](https://www.mofcom.gov.cn/xwfb/sjfzrfb/art/2026/art_ed8dde0be8a04a50b6ef49bb219bfdda.html)
- [商务部：2026 年 1-6 月批发和零售业发展](https://www.mofcom.gov.cn/xwfb/sjfzrfb/art/2026/art_9a8a0d91a06941d99238d825cfe51153.html)
- [商务部等 9 部门：促进家政服务业高质量发展](https://www.mofcom.gov.cn/zwgk/zcfb/art/2026/art_4f7753bfa9db4f51ba867282ebd3ad2c.html)
- [抖音电商学习中心](https://school.jinritemai.com/doudian/web/home?from=xiaodian_help)
- [京东开放平台公告页](https://jos.jd.com/platformdetail?itemId=2291&listId=0)

**热点与金融**

- [Product Hunt](https://www.producthunt.com/)
- [GitHub Trending](https://github.com/trending)
- [Hacker News](https://news.ycombinator.com/)
- [BEA：Personal Income and Outlays, June 2026](https://www.bea.gov/news/2026/personal-income-and-outlays-june-2026)
- [BEA release schedule](https://www.bea.gov/news/schedule)
