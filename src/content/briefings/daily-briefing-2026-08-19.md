---
title: '每日简报｜2026-08-19'
description: '今天关注 Vercel KMS、Instagram 私信机器人、平台化 GitHub 部署、Agent 工具热点、Cloudflare Tunnel/R2、国内平台规则、家装零售与美股风险信号。'
pubDate: '2026-08-19'
category: '每日简报'
level: 'AI · 开发 · 创业 · 金融'
tags: ['每日简报', 'Vercel', 'Cloudflare', 'GitHub Trending', 'Product Hunt', '抖音电商', '天猫', '京东秒送', 'Home Depot', '美股']
sourceCount: 17
status: 'published'
---

今天的主线不是单点模型发布，而是“可变现的基础设施”和“可转化的渠道入口”继续被产品化。技术侧，Vercel 把密钥签名、用户 GitHub 仓库部署、Instagram 私信机器人、Agent harness 和新模型网关放到同一天附近更新，说明开发平台正在围绕“多租户 SaaS、Agent、私域触点、安全托管”做组合拳。非 AI 侧，Cloudflare 的 Tunnel/R2 更新、抖音/天猫/京东秒送规则变化、Home Depot 财报和美股波动，都在提示：小团队不只要追模型，也要追渠道规则、履约效率、成本压力和真实消费结构。今天最值得记录的是：钱和注意力一边流向 Agent 基础设施，另一边也在流向低客单、快履约、强信任的传统服务与内容电商。

## 速览

- Vercel 推出 KMS beta，允许 Functions 签发 JWT 或消息签名，私钥不再放进代码或环境变量。
- Vercel for Platforms 现在可用短期 GitHub token 从用户自己的仓库创建部署，降低多租户建站平台接入门槛。
- Vercel Chat SDK 新增 Instagram adapter，可做 Instagram DM 机器人，但受 Meta 专业账号和 24 小时会话窗口限制。
- Vercel AI SDK harness 接入 Cline，同时 AI Gateway 上线 GLM 5.3；Agent 运行时统一接口正在成为平台竞争点。
- Cloudflare 让 Tunnel origin 设置可在 Dashboard 配置，并推出 R2 美国 jurisdiction、邮件安全后量子混合密钥交换等基础设施更新。
- GitHub Trending 今天集中在短视频自动化、Agent 记忆、上下文数据库、AI 安全技能、免费 API 目录和开源剪辑工具。
- Product Hunt 热点偏向 Mac 工具、决策日志、短视频剪辑、漏斗分析、Slack AI 同事和 developer-led growth。
- 国内平台侧，抖音电商学习中心继续密集强调 AI 作图/成片、搜索运营、违规避坑；天猫与京东秒送近期规则更新需要商家/服务商排查。
- Home Depot 财报显示小项目和维修类需求比大额家装更坚挺，3 小时配送也在强化本地履约预期。
- 美股周二回调，AI 芯片股承压、长端利率和油价维持高位；这更像成本与估值风险提醒，不构成投资建议。

## 重点详读

## 1. Vercel KMS：JWT 签名进入托管密钥时代

[Vercel 发布 KMS beta](https://vercel.com/changelog/sign-jwts-from-your-functions-without-managing-private-keys)，让 Vercel Functions 可以用托管非对称密钥签发 JWT 或任意消息签名，私钥不需要写进代码、环境变量或 CI secrets。背景是大量小 SaaS、插件、API 网关、Webhook 系统都会自己维护签名密钥，但密钥轮换、环境隔离、泄露排查经常被低估。Vercel 的方案把 OIDC、JWKS、issuer、key grant、TTL、claims 约束放到平台层，适合做登录 token、Webhook 签名、第三方集成凭证和多环境授权。

为什么重要：这类能力不是炫技，而是直接降低独立开发者做“可信 API”的门槛。以前一个小工具想提供 API access，往往会把 JWT secret、RSA private key 或 webhook secret 放到环境变量里，后续换人、换项目、换部署环境时容易出事故。实际影响是，做 B2B 小工具、Chrome 插件后台、自动化平台、客户门户时，可以把“凭证签发”和“业务逻辑”分开，减少安全债务。建议今天记录一个模板：Vercel Functions + KMS issuer + 短 TTL JWT + webhook verifier，可作为未来 SaaS starter 的安全模块。风险边界是它仍是 beta，Vercel 说明行为可能变化，并且需要较新 CLI；核心认证链路不要未经压测就直接迁移生产。

## 2. Vercel for Platforms：用户 GitHub 仓库部署更像“建站平台组件”

[Vercel for Platforms 新增从用户 GitHub 仓库部署](https://vercel.com/changelog/vercel-for-platforms-can-now-deploy-from-your-users-github-repositories)的能力：平台方可以传入短期、只读、限定仓库的 `gitAccessToken` 和 `gitSource`，由 Vercel 拉取源码并创建部署，不再强制要求用户安装 Vercel GitHub App。背景是多租户建站、模板市场、客户项目托管、AI 生成网站、文档站和营销页平台，都卡在“如何安全拿到用户代码并持续部署”这一步。

为什么重要：这是自建站、独立站、模板 SaaS 的基础设施信号。过去一个小团队想做“输入 GitHub 仓库，一键部署成客户页面”的产品，需要自己处理 OAuth、repo 权限、build pipeline、日志、回滚和隔离。现在可以把一部分复杂度交给 Vercel，产品重点转向模板质量、行业工作流、SEO、表单、支付、客户转化。实际影响是，适合验证面向小商家、设计师、课程老师、出海卖家的“半自动建站 + 托管”服务。建议低成本验证：先做 3 个垂直模板，如本地服务落地页、独立开发者产品页、1688 货源展示页，再用 GitHub 仓库作为高级用户入口。风险边界是 token 必须短期、最小权限，且平台方仍要处理用户授权、源码隐私、构建失败责任和滥用内容审核。

## 3. Instagram 私信机器人：内容流量正在变成可编程私域入口

[Vercel Chat SDK 新增 Instagram adapter](https://vercel.com/changelog/chat-sdk-adds-instagram-adapter)，支持基于 Instagram Direct Messages 构建机器人，能力覆盖收发私信、媒体、快捷回复、链接按钮、输入状态、reaction 和 story replies。它接入的是 Meta Instagram Messaging API，要求专业 Business 或 Creator 账号，并受 Meta 的 24 小时会话窗口约束：通常只能在用户最后一次互动后的一天内回复。

为什么重要：这不是单纯“又一个聊天机器人”。Instagram、抖音、小红书、视频号这类内容平台的商业价值，越来越落在评论、私信、表单、客服、导购、报价和预约上。对独立开发者而言，机会不是做一个通用聊天壳，而是做垂直场景：创作者私信筛选、跨境 DTC 售前问答、课程咨询、摄影/健身/婚礼服务预约、品牌 KOL 合作线索收集。实际影响是，你可以把“内容种草”后的一次私信，变成结构化线索、CRM 记录、自动报价或邮件订阅。建议把它当作海外版“私信自动化”研究样本，同时对照小红书/抖音国内生态做内容选题。风险边界是账号类型、用户授权、隐私合规、Meta 平台政策和 24 小时限制；不要做骚扰式群发或虚假承诺。

## 4. Cline harness + GLM 5.3：Agent 工具正在从单体 IDE 走向可替换运行时

[Vercel AI SDK harness 接入 Cline](https://vercel.com/changelog/cline-harness-adapter)，把 Cline 放进统一 harness 接口；同日附近，[GLM 5.3 也进入 Vercel AI Gateway](https://vercel.com/changelog/glm-5-3-now-available-on-ai-gateway)，提供长上下文、函数调用、结构化输出、流式响应等能力。Vercel 和 Z.ai 对 GLM 5.3 的软件工程、多步 Agent 和漏洞发现能力有较强表述，这些属于厂商说法，需要用自己的任务集复测。

为什么重要：Coding Agent 的下一阶段竞争不只是谁的模型更强，而是谁能把模型、沙箱、文件系统、shell、权限、日志、成本和回滚统一起来。harness 的意义在于让 Claude Code、Codex、Cline、OpenCode 等运行时有机会被同一套评测和调度系统管理。实际影响是，小团队可以考虑做“Agent 任务基准 + 成本记录 + 失败案例库”，而不是只凭体感选工具。建议今天建立一个本地 benchmark：选 5 个真实任务，如修 bug、写测试、迁移组件、分析日志、生成落地页，让不同 Agent 在相同仓库跑，记录耗时、token、可用提交和人工修复量。风险边界是沙箱权限和命令执行边界要清晰，长上下文模型的高输出能力也会放大误改代码、泄露密钥和成本失控问题。

## 5. Cloudflare Tunnel/R2：基础设施的“可操作性”和“数据辖区”越来越重要

[Cloudflare changelog](https://developers.cloudflare.com/changelog/)显示，Cloudflare Tunnel 的 origin application settings 现在可在 Dashboard 里配置，覆盖 Host header、TLS、连接超时、keep-alive、HTTP/2 到源站等选项；R2 新增 `us` jurisdiction，可保证 bucket 数据在美国存储和处理；Email Security 也开始支持后量子混合密钥交换。背景是中小团队越来越多把后台、内网工具、客户门户、对象存储和邮件安全放在 Cloudflare 体系内，但配置过去分散在本地文件、Zero Trust 控制台和命令行里。

为什么重要：这类更新不一定带来新产品故事，却会影响真实运维成本。Dashboard 化意味着非专职 SRE 也能排查 Tunnel 到源站的 TLS/SNI/Host 头问题；R2 jurisdiction 则对出海、美国客户、合规采购和企业销售有意义。实际影响是，做自建站、SaaS、多区域文件服务、客户资料上传时，可以把“数据存放地”和“访问路径”写进交付文档，增加客户信任。建议本周检查现有 Cloudflare Tunnel 配置是否仍依赖散落的本地 YAML，并给对象存储新增“默认区域/合规说明/备份策略”记录。风险边界是 bucket 创建后 jurisdiction 不能随意改，迁移要重新设计；后量子邮件安全也依赖对端支持，不要把它包装成单方面已解决所有邮件加密问题。

## 6. GitHub/X 技术热点：Agent 记忆、上下文库和内容自动化在升温

今天 [GitHub Trending](https://github.com/trending?since=daily) 的信号很集中：`MoneyPrinterTurbo` 继续代表短视频自动化；`ai-memory`、`OpenViking`、`Anthropic-Cybersecurity-Skills`、`munder-difflin` 指向 Agent 记忆、上下文数据库、多 Agent harness 和安全技能库；`public-apis`、`OpenCut` 则分别代表免费 API 原料库和开源创作工具。Hacker News 首页也同时出现了 AI 团队使用模式、Cursor Origin、向量搜索、内存价格、工资与通胀等讨论，说明技术圈注意力正在从“模型演示”转向“工作流、成本和可复制生产”。

为什么重要：这对个人开发者是很强的选题雷达。Agent 生态的痛点已经不只是 prompt，而是长期记忆、上下文压缩、技能沉淀、跨工具迁移、可审计执行和成本记录。短视频自动化和开源剪辑工具则说明内容生产仍是流量入口，但纯自动生成内容会被平台和用户快速识别。实际影响是，可做的方向包括：面向 Codex/Claude Code/Cursor 的项目记忆文件整理器、Agent 安全技能清单、GitHub 热榜到内容选题的日报、免费 API 组合小工具。建议今天不要追星数本身，而是拆仓库 README、issue、release，看用户真正抱怨什么。风险边界是 GitHub Trending 容易受短期传播影响，X/社区热度只能当线索，不能当市场规模证明。

## 7. Product Hunt：小工具、漏斗分析和开发者增长值得看

[Product Hunt](https://www.producthunt.com/) 今天的热门产品里，值得留意的不是单个产品排名，而是类别结构：Mac 设备管理工具、决策日志、短视频剪辑自动化、Slack 内 AI 同事、轻量漏斗分析、面向开发者的增长工具都在前列。这个组合说明海外小团队仍愿意为“减少琐碎操作、看清转化、把内容变成线索、让团队协作更顺”付费。相比泛 AI 助手，Tiny Funnel 这类“能看懂的漏斗分析”和 Gauge 这类 developer-led growth 更接近可验证商业问题。

为什么重要：这些产品给自建站和独立开发提供了非 AI 赚钱方向。很多独立开发者失败不是模型不够强，而是不会定义渠道、事件、转化和复购。实际影响是，面向小团队的“一个页面 + 一个漏斗 + 一个行动建议”的工具可能比复杂 BI 更容易卖；面向创作者的 clip 工作流也可以从“自动剪一切”转向“剪出可发布片段并保留人工把关”。建议把 Product Hunt 当作需求目录：记录每个产品的目标用户、定价入口、onboarding、首屏承诺和评论里的反对意见。风险边界是 PH 热度偏早期用户和英语市场，不能直接外推到国内；很多产品上榜靠社区动员，收入要用创始人复盘、定价页、用户评论交叉验证。

## 8. 国内平台：规则、工具和履约比“野路子”更值得长期追踪

国内平台今天没有一个压倒性的单点新闻，但规则和运营资料仍值得追踪。[抖音电商学习中心](https://school.jinritemai.com/doudian/web/home?from=buyin_bench&should_full_screen=1)近期持续出现 AI 成片、AI 主图、搜索运营、新商扶持、发货超时、缺货无货、虚假宣传和品牌混淆等内容；[天猫规则中心](https://www.tmall.com/wow/seller/act/guize)近期围绕入驻资质、招商、延迟发货、类目资质等发布更新；[京东秒送开放平台公告](https://opendj.jd.com/api/notice.htm)则持续提示服务商入驻、API 下线迁移、低活跃应用清理和配送轨迹等事项。

为什么重要：平台小生意真正的门槛不是“知道一个品”，而是账号、资质、素材、履约、售后、规则和现金流。抖音、小红书、淘宝/天猫、京东秒送、闲鱼、拼多多的机会都不是长期静态的，平台一改规则，低质量搬运、虚假宣传、延迟履约和侵权素材就可能立刻变成封禁风险。实际影响是，适合个人做的是合规的信息差服务：规则监控、商品素材合规检查、发货承诺检查、客服话术质检、达人合作线索整理、产业带货源对比。建议今天建立一个“平台规则变更表”，字段包括平台、类目、截止日期、影响角色、处罚风险、可做服务。风险边界是不要碰刷单、盗版、虚假宣传、规避审核和售假；这些看似来钱快，长期会伤账号和资金安全。

## 9. Home Depot：传统消费里，小维修比大装修更坚挺

[AP 报道 Home Depot 二季度](https://apnews.com/article/home-depot-mortgage-housing-7f323affb3ccd902ce1152f0d0c6c9a2)显示，公司收入高于市场预期，同店销售小幅增长，但交易量下降、客单价上升，大型项目仍承压；公司也强调消费者更倾向小项目，并把小件商品 3 小时配送扩展到全国范围。背景是美国住房交易低迷、房贷利率偏高，大额翻新和搬家链条受压，但维修、维护、局部升级、工具耗材和即时履约需求仍在。

为什么重要：这给非 AI 商机一个很清晰的方向：当宏观压力上升时，用户不一定停止消费，而是从“大额升级”切到“小额修补、延寿、替换、局部改善”。实际影响是，国内也可以类比看家居维修、家电清洗、局部翻新、五金耗材、收纳改造、宠物/母婴刚需、汽车小保养、本地同城到家。个人或小团队能做的不是开大卖场，而是内容获客 + 标准化报价 + 本地履约撮合 + 售后评价沉淀。建议用小红书/抖音搜“自己修、局部改造、出租屋改造、旧房维护”，再到 1688/淘宝/本地服务平台看供给和价格带。风险边界是传统服务利润受履约能力、售后纠纷和人工成本影响大，不要只看内容热度，要先用 10 单小样本验证交付。

## 10. 市场风险：AI 热度仍在，但利率、油价和估值开始施压

[AP 市场报道](https://apnews.com/article/stock-markets-oil-war-iran-trump-a805333e767251279e68e0686b28a8c9)显示，美股周二继续回落，S&P 500、Nasdaq、Dow 均下跌，AI 相关芯片股如 Micron、Nvidia、Broadcom 承压；同时长端美债收益率维持高位，油价较前期明显上行。另一个 [AP 市场快照](https://apnews.com/article/wall-street-stocks-dow-nasdaq-63300d6f51d4d27ce881cc6c11719171)也提到 AI 权重股对指数拖累明显。背景是 AI 资本开支、数据中心融资成本、地缘冲突带来的能源价格、以及通胀预期共同影响市场风险偏好。

为什么重要：这不是让你做买卖决策，而是提醒内容和产品判断要加入成本维度。AI 应用若依赖高 token、高 GPU、高带宽、高存储，未来毛利可能被模型价格、推理成本和基础设施费用吞掉。实际影响是，独立开发者要更关注：缓存、模型路由、任务分级、低成本模型、异步处理、限额计费、企业客户愿付费场景。建议在每个 AI 产品想法里加入一列“单位经济模型”：一次任务成本、用户可接受价格、失败重试成本、免费额度上限。风险边界是短期市场涨跌噪音很大，本文只做风险识别和研究线索，不构成任何股票、基金或行业配置建议。

## 非 AI 热点与传统商机

- 家居维修与局部改造：Home Depot 的信号说明，在高利率和房产交易低迷时，小维修、小工具、小配送、局部翻新反而更稳。国内可看出租屋改造、旧房维护、厨房卫浴小件、五金耗材、家电清洗，关键是用内容获客和标准化报价降低信任成本。
- 平台规则服务：抖音、天猫、京东秒送近期的规则与开放平台通知说明，商家需要持续理解类目资质、发货承诺、API 迁移、低活跃应用清理和素材合规。可做轻服务：规则日报、类目准入清单、违规风险自查表、店铺履约提醒。
- 本地即时履约：Home Depot 3 小时配送、京东秒送配送轨迹要求、国内即时零售竞争都指向“快且可追踪”。个人机会不是自建物流，而是为小商家做商品库整理、配送承诺页、客服通知模板、售后追踪表。

## 赚钱与市场方向

- Agent 基础设施会从“好玩工具”变成“可审计生产系统”：可以做 Agent memory 文件整理器、任务日志面板、失败案例库、成本追踪插件，目标用户是重度使用 Codex/Claude Code/Cursor 的开发者。
- 小商家合规运营是非 AI 稳定需求：平台商家不缺课程，缺“我的店今天会不会踩规则”的具体提醒。低成本验证可以先做一个 Notion/飞书规则库 + 人工周报，收费从月度服务开始。
- 内容到私域的自动化仍有钱，但要避开垃圾自动化：Instagram DM adapter、短视频剪辑工具和国内私信/评论运营说明，市场需要的是线索筛选、客服分流、预约报价，不是批量骚扰。
- 自建站服务可以从“建页面”升级为“建站 + 漏斗 + 转化记录”：Product Hunt 上轻量漏斗分析的热度提醒，小商家和独立产品更愿意为可读的转化路径付费，而不是复杂仪表盘。

## 国内平台/自建站小生意观察

- 抖音/小红书种草到私域：现象是平台持续强化搜索、素材、AI 成片和违规治理；需求是商家要低成本出内容并把咨询转成订单。供给可以来自 1688/本地服务/自有数字产品，流量靠关键词内容和评论区问题，收费方式可做代运营、素材包、线索表或成交分成。低成本验证是选一个细分类目连续发 20 条内容，记录咨询词和转化问题。风险是虚假宣传、素材侵权、发货纠纷和账号限流。
- 京东秒送/即时零售服务商：现象是开放平台有 API 下线、服务商入驻、配送轨迹和低活跃应用治理；需求是商家和 ISV 需要按期迁移和减少履约异常。供给是技术服务、接口排查、通知模板和数据看板，流量来源可来自服务商社群、商家论坛、站内公告解读。利润假设是一次迁移服务费或月度运维费。风险是平台权限、保证金、接口变更和服务边界不清。
- 自建站垂直模板：现象是 Vercel for Platforms 降低从用户 GitHub 仓库部署的门槛，Product Hunt 继续验证小工具和漏斗需求。需求是独立开发者、小品牌、本地服务商希望快速上线可信页面。供给是 Next.js/Astro 模板、表单、支付、FAQ、SEO 文案、统计脚本。流量可以靠“行业 + 落地页模板”“城市 + 服务页”搜索词。收费方式可做模板一次性收费、托管月费、优化服务费。风险是客户不会维护、内容同质化、SEO 起量慢和售后占用时间。

## 创业/产品机会

- Agent 工作流审计面板：读取 Codex/Claude Code/Cursor 的任务日志、diff、测试结果和成本记录，输出“哪个 Agent 适合哪类任务”的个人基准库。
- 平台规则监控小站：聚合抖音、天猫、京东秒送、拼多多、小红书等公开规则，按类目和角色生成提醒、截止日期、影响解释和自查清单。
- 小商家即时履约工具：为本地生活、五金维修、家居清洁、同城配送商家提供报价单、预约表、配送状态通知和售后回访模板。
- Instagram/小红书私信线索 CRM：合规收集用户咨询、自动打标签、生成报价建议和跟进提醒，重点服务创作者、跨境卖家和预约型服务商。

## 营销/内容选题

- 《为什么 AI 产品不能只看模型，要先算一次任务成本》：结合 AI 芯片股波动、推理成本和 Agent 重试，写给独立开发者。
- 《抖音/天猫/京东秒送规则更新，普通小商家最容易踩哪几类坑》：做成表格型内容，重点讲合规和履约，不讲违规技巧。
- 《Home Depot 财报给小生意的启发：大装修降温，小维修反而有机会》：类比国内家居、本地服务和同城履约。
- 《GitHub Trending 今天为什么全是 Agent 记忆和短视频自动化》：拆仓库热度背后的真实需求和伪机会。

## 金融与市场观察

本节仅做市场信息、风险识别和研究线索，不构成投资建议。美股周二的回调和 AI 芯片股承压，提示 AI 主题不是只受技术进展影响，也受利率、能源、资本开支和估值预期影响。长端利率维持高位时，数据中心、云厂商、硬件供应链和高估值软件公司都可能面临融资成本与盈利兑现压力。对个人最有用的动作不是追涨跌，而是把“成本、现金流、真实付费、毛利率”写进每个产品和内容选题的判断框架。

## 今日行动清单

- 记录 Vercel KMS 的使用前提，做一个 JWT/Webhook 签名模板清单，但暂不迁移生产核心认证。
- 建一个 Agent 工具对比表，选 5 个真实仓库任务测试 Codex、Claude Code、Cline 等工具的成功率和返工成本。
- 新建“平台规则变更表”，先录入抖音电商、天猫、京东秒送三类公开公告源。
- 选 1 个非 AI 小生意方向做 10 单验证设计：家居小维修、同城配送服务、平台合规服务或自建站模板。
- 给未来 AI 产品想法新增“单位经济模型”字段：单次任务成本、重试成本、免费额度、可接受售价。
- 复盘 GitHub Trending 的 Agent memory/skills 仓库，提炼 3 个可做成插件或文章的痛点。

## 来源索引

### AI、Agent 与开发平台

- [Vercel Changelog](https://vercel.com/changelog)
- [Vercel KMS: Sign JWTs from your Functions without managing private keys](https://vercel.com/changelog/sign-jwts-from-your-functions-without-managing-private-keys)
- [Vercel for Platforms: Deploy from users' GitHub repositories](https://vercel.com/changelog/vercel-for-platforms-can-now-deploy-from-your-users-github-repositories)
- [Vercel Chat SDK adds Instagram adapter](https://vercel.com/changelog/chat-sdk-adds-instagram-adapter)
- [Vercel AI SDK harness: Cline adapter](https://vercel.com/changelog/cline-harness-adapter)
- [Vercel AI Gateway: GLM 5.3](https://vercel.com/changelog/glm-5-3-now-available-on-ai-gateway)

### 基础设施与安全

- [Cloudflare Changelog](https://developers.cloudflare.com/changelog/)

### GitHub、社区与产品热点

- [GitHub Trending Daily](https://github.com/trending?since=daily)
- [Hacker News](https://news.ycombinator.com/)
- [Product Hunt](https://www.producthunt.com/)

### 国内平台与小生意

- [抖音电商学习中心](https://school.jinritemai.com/doudian/web/home?from=buyin_bench&should_full_screen=1)
- [天猫规则中心](https://www.tmall.com/wow/seller/act/guize)
- [京东秒送开放平台公告](https://opendj.jd.com/api/notice.htm)
- [小红书电商](https://ec.xiaohongshu.com/ecommerce/home)

### 金融与传统消费

- [AP: Wall Street pulls further from all-time high](https://apnews.com/article/stock-markets-oil-war-iran-trump-a805333e767251279e68e0686b28a8c9)
- [AP: Stock market today snapshot](https://apnews.com/article/wall-street-stocks-dow-nasdaq-63300d6f51d4d27ce881cc6c11719171)
- [AP: Home Depot Q2 and home-improvement demand](https://apnews.com/article/home-depot-mortgage-housing-7f323affb3ccd902ce1152f0d0c6c9a2)
- [University of Chicago BFI Working Papers](https://bfi.uchicago.edu/working-papers/)
