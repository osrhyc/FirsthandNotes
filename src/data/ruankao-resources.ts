export const VERIFIED_ON = "2026-10-13";

export type StudyResource = {
	id: string;
	title: string;
	kind: "主线资料" | "免费补充" | "官方入口";
	detail: string;
	usage: string;
	url: string;
	isbn?: string;
};

export const STUDY_RESOURCES: StudyResource[] = [
	{
		id: "syllabus",
		title: "系统架构设计师考试大纲",
		kind: "主线资料",
		detail:
			"全国计算机专业技术资格考试办公室编，2022 年审定，清华大学出版社 2022 年 11 月出版。出版社页面所示 2026 年再印不等于新版；2027 年若发布修订公告，再更新学习范围。",
		usage:
			"第 1 天用 20 分钟标记已会、陌生、需练习的知识域；每周复盘用 10 分钟核对覆盖范围。购书时核对书名与 ISBN。",
		url: "https://www.tup.com.cn/booksCenter/book_09190401.html",
		isbn: "9787302620037",
	},
	{
		id: "textbook",
		title: "系统架构设计师教程（第 2 版）",
		kind: "主线资料",
		detail:
			"叶宏、鲍亮、宋胜利、蔺一帅编著，清华大学出版社 2022 年 11 月出版，依据 2022 年审定大纲编写。全书 20 章；页面所示 2026 年印刷仍是第 2 版，不是 2027 年新版。",
		usage:
			"每天用 40 分钟阅读当日对应小节，再做练习和实践。先过第 2、5、6 章的计算机、软件工程和数据库基础，再深入第 7、8 章架构专题；第 20 章配合后续论文训练。",
		url: "https://www.tup.tsinghua.edu.cn/bookscenter/book_09190101.html",
		isbn: "9787302619925",
	},
	{
		id: "past-papers",
		title: "系统架构设计师 2018 至 2022 年试题分析与解答",
		kind: "主线资料",
		detail:
			"计算机技术与软件专业技术资格考试研究部编，清华大学出版社 2024 年 10 月出版。收录 2018—2022 年试题及解析；可训练知识与表达，不能代表 2027 年机考时间、题量或新增考点。",
		usage:
			"基础期每天用 25—35 分钟做与当日主题相关的题，先作答再读解析。错题记录错误原因与教材位置；后期按最新考试规则练习计时作答。",
		url: "https://www.tup.com.cn/booksCenter/book_10321101.html",
		isbn: "9787302674269",
	},
	{
		id: "textbook-sample",
		title: "出版社公开教程样章",
		kind: "免费补充",
		detail:
			"清华大学出版社公开提供的《系统架构设计师教程（第 2 版）》样章 PDF，共 23 页。样章用于了解书籍与内容组织，不是完整教材。",
		usage:
			"教材到手前，第 1 天用 15—20 分钟浏览前言、目录与样章，写出本轮学习最陌生的 3 个主题；不要把寻找全书下载当作学习任务。",
		url: "https://www.tup.tsinghua.edu.cn/upload/books/yz/091901-01.pdf",
	},
	{
		id: "textbook-contents",
		title: "出版社公开教材目录",
		kind: "免费补充",
		detail:
			"清华大学出版社提供第 2 版完整目录，可核对章节名称与小节位置。目录只是学习导航，不替代正文、练习和新版考试通知。",
		usage:
			"每周开始前花 5 分钟定位计划对应小节；每天只选能在 40—50 分钟内学完并复述的一组知识点，不按整章页数机械推进。",
		url: "https://www.tup.com.cn/booksCenter/bookcatalog?id=09190101",
	},
	{
		id: "sei-quality",
		title: "CMU SEI：质量属性与架构推理",
		kind: "免费补充",
		detail:
			"卡内基梅隆大学软件工程研究所的质量属性研究资料，讨论如何通过场景理解性能、可修改性、可用性与安全等要求。用于辅助理解，不是软考指定教材。",
		usage:
			"学习第 8 章时，替换当天 20 分钟扩展阅读：读一个场景例子，再为自己的项目写一个可测量的质量要求，并说出实现它的代价。",
		url: "https://insights.sei.cmu.edu/library/reasoning-about-software-quality-attributes/",
	},
	{
		id: "postgres-transactions",
		title: "PostgreSQL 官方文档：事务入门",
		kind: "免费补充",
		detail:
			"PostgreSQL 官方教程用转账例子解释事务、提交、回滚与保存点。产品文档有助于理解数据库概念，具体实现不能直接代替一般数据库理论。",
		usage:
			"数据库学习日用 20 分钟读转账案例，画出一次中途失败的执行过程，再用 5 分钟说明哪些操作应放进同一个事务；余下时间回到教材与题目。",
		url: "https://www.postgresql.org/docs/current/tutorial-transactions.html",
	},
	{
		id: "mdn-http",
		title: "MDN：HTTP 概述",
		kind: "免费补充",
		detail:
			"MDN 中文文档介绍 HTTP 请求与响应、客户端、服务器和代理。适合把开发经验连接到网络知识；TCP/IP、子网与网络规划仍需按教材学习。",
		usage:
			"网络学习日用 20 分钟阅读，再花 10 分钟画出浏览器、代理、应用服务之间的一次请求流程，标记缓存、认证和负载均衡可以出现的位置。",
		url: "https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Guides/Overview",
	},
	{
		id: "owasp-top10",
		title: "OWASP Top 10:2025",
		kind: "免费补充",
		detail:
			"OWASP 官方发布的 2025 版 Web 应用安全风险资料，包含访问控制、配置、注入、认证等问题。它是现实安全案例补充，其版本与排名不是软考考试大纲。",
		usage:
			"安全学习日一次选 1 类风险，花 15 分钟读说明，10 分钟写出一个项目场景和相应防护措施，再关联教材中的安全目标与技术。",
		url: "https://top10.owasp.org/2025/",
	},
	{
		id: "azure-patterns",
		title: "Microsoft Learn：云设计模式",
		kind: "免费补充",
		detail:
			"微软官方架构资料按问题、解决方案和注意事项介绍云设计模式。可用于理解缓存、熔断、重试等设计取舍；无需为了备考掌握全部 Azure 产品。",
		usage:
			"系统设计学习日选 1 个模式读 20 分钟，再用 10 分钟写出问题、方案、收益、代价与适用条件五项卡片，供案例分析和论文复用。",
		url: "https://learn.microsoft.com/zh-cn/azure/architecture/patterns/",
	},
	{
		id: "exam-home",
		title: "中国计算机技术职业资格网：考试公告与报名入口",
		kind: "官方入口",
		detail:
			"全国计算机技术与软件专业技术资格（水平）考试官网。报名由官网进入，并结合报考地人事考试或软考机构通知核对属地要求、时间和材料；2027 年安排以正式公告为准。",
		usage:
			"每月复盘时花 5—10 分钟检查年度安排；2027 年报考通知公布后，把报名、缴费、准考证和考试批次加入自己的日历。",
		url: "https://www.ruankao.org.cn/",
	},
	{
		id: "official-mock",
		title: "官方机考模拟练习说明",
		kind: "官方入口",
		detail:
			"工信部教育与考试中心 2026 年 9 月 23 日通知：模拟平台用于熟悉机考环境，不代表正式题型、题量和分值；该次仅向当次报名成功的考生开放。2027 年开放安排需另查。",
		usage:
			"本人所报批次开放后，用一次学习时段熟悉登录、答题、切换科目与论文输入操作；平时照常用合法资料训练，不把平台当作长期题库。",
		url: "https://www.miiteec.org.cn/news_details?code=17900922GJ1X1C00",
	},
];

export const EXAM_FACTS: {
	title: string;
	detail: string;
	url: string;
	source: string;
}[] = [
	{
		title: "2027 年安排尚待官方确认",
		detail:
			"截至 2026 年 10 月 13 日，本次查证尚未找到 2027 年官方考务安排。先按优先参加上半年的目标准备；是否开考、日期、批次和报名时间均以 2027 年正式公告为准。链接为目前可核实的 2026 年年度计划，不是 2027 年通知。",
		url: "https://www.mohrss.gov.cn/xxgk2020/fdzdgknr/qt/gztz/202602/t20260203_566621.html",
		source: "人力资源社会保障部：2026 年度专业技术人员职业资格考试工作计划",
	},
	{
		title: "2026 年上下半年开考可作规划参考",
		detail:
			"2026 年系统架构设计师上下半年均有安排，全国考试窗口分别为 5 月 23—26 日和 10 月 24—27 日，具体批次以准考证为准。这是往年安排，不能据此确认 2027 年同样开考两次。",
		url: "https://rsj.gz.gov.cn/ywzt/rcgz/rsks/bmtz/content/post_10736860.html",
		source: "广州市人力资源和社会保障局：2026 年 3 月 23 日报考热点问答",
	},
	{
		title: "高级资格考三科，采用机考",
		detail:
			"按 2026 年已公布规则，高级资格设置综合知识、案例分析、论文三个科目，均采用计算机化考试。备考应同时训练知识判断、书面分析与论文输入；2027 年如调整，按新通知执行。",
		url: "https://gxt.xinjiang.gov.cn/gxt/tzgg/202608/a0d2251d1efa496ba604940711c78872.shtml",
		source: "新疆维吾尔自治区工业和信息化厅：2026 年 8 月 19 日考试报名事项通知",
	},
	{
		title: "综合与案例连考 240 分钟，论文 120 分钟",
		detail:
			"按 2026 年规则，综合知识与案例分析连考，总计 240 分钟；综合知识用时最短 120 分钟、最长 150 分钟，节余时间可用于案例分析，因此案例可用 90—120 分钟。论文另考 120 分钟。平日可拆分练习，考前需安排完整连考模拟。",
		url: "https://gxj.nanjing.gov.cn/njsjjhxxhwyh/202609/t20260924_5916907.html",
		source: "南京市工业和信息化局：2026 年 9 月 24 日考试安排通告",
	},
	{
		title: "全国合格标准为各科 45 / 75 分",
		detail:
			"现行全国合格标准为各科满分的 60%；综合知识、案例分析、论文每科满分 75 分，每科 45 分合格。部分地区另有单独划线政策；本计划按全国标准准备，并保留练习分数余量。",
		url: "https://gxt.hunan.gov.cn/gxt/rkb/jsjtzgg/202312/t20231211_32475108.html",
		source: "湖南省工业和信息化厅：2026 年 6 月 29 日成绩查询通知",
	},
	{
		title: "必须在同一次考试通过全部科目",
		detail:
			"须在一次考试中通过全部应试科目才能取得证书，不能把不同批次的单科合格成绩拼合。因此计划从前期就安排案例与论文，不能只准备综合知识。",
		url: "https://rsj.gz.gov.cn/ywzt/rcgz/rsks/bmtz/content/post_10736860.html",
		source: "广州市人力资源和社会保障局：2026 年 3 月 23 日报考热点问答，第十三问",
	},
	{
		title: "无需先过中级，报名须核对属地要求",
		detail:
			"遵守法律、恪守职业道德并具有一定计算机技术应用能力的人员，可根据本人情况报考相应级别，不受学历、资历、年龄限制，也不以先通过中级为前提。具体报考地的属地要求、审核材料与缴费流程需另行核对。",
		url: "https://rsj.gz.gov.cn/ywzt/rcgz/rsks/bmtz/content/post_10736860.html",
		source: "广州市人力资源和社会保障局：2026 年 3 月 23 日报考热点问答，第四、五问",
	},
	{
		title: "题量与选做规则以正式答题界面为准",
		detail:
			"官方明确模拟平台用于熟悉机考环境，不代表正式考试题型、题量与分值。本计划不将历年回忆题的题量或选做规则保证为 2027 年规则；考前结合当次考试说明确认。",
		url: "https://www.miiteec.org.cn/news_details?code=17900922GJ1X1C00",
		source: "工业和信息化部教育与考试中心：2026 年 9 月 23 日模拟练习通告",
	},
];
