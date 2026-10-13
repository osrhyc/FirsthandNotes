// 依据清华大学出版社公开目录整理，仅记录目录，不代表已阅读教材正文。
export const CATALOG_URL: string = "https://www.tup.com.cn/booksCenter/bookcatalog?id=09190101";

export type TextbookChapter = {
	number: number;
	title: string;
	sections: { id: string; title: string }[];
};

export const TEXTBOOK_CHAPTERS: TextbookChapter[] = [
	{
		number: 1,
		title: "绪论",
		sections: [
			{ id: "1.1", title: "系统架构概述" },
			{ id: "1.2", title: "系统架构设计师概述" },
			{ id: "1.3", title: "如何成为一名好的系统架构设计师" },
		],
	},
	{
		number: 2,
		title: "计算机系统基础知识",
		sections: [
			{ id: "2.1", title: "计算机系统概述" },
			{ id: "2.2", title: "计算机硬件" },
			{ id: "2.3", title: "计算机软件" },
			{ id: "2.4", title: "嵌入式系统及软件" },
			{ id: "2.5", title: "计算机网络" },
			{ id: "2.6", title: "计算机语言" },
			{ id: "2.7", title: "多媒体" },
			{ id: "2.8", title: "系统工程" },
			{ id: "2.9", title: "系统性能" },
		],
	},
	{
		number: 3,
		title: "信息系统基础知识",
		sections: [
			{ id: "3.1", title: "信息系统概述" },
			{ id: "3.2", title: "业务处理系统（TPS）" },
			{ id: "3.3", title: "管理信息系统（MIS）" },
			{ id: "3.4", title: "决策支持系统（DSS）" },
			{ id: "3.5", title: "专家系统（ES）" },
			{ id: "3.6", title: "办公自动化系统（OAS）" },
			{ id: "3.7", title: "企业资源规划（ERP）" },
			{ id: "3.8", title: "典型信息系统架构模型" },
		],
	},
	{
		number: 4,
		title: "信息安全技术基础知识",
		sections: [
			{ id: "4.1", title: "信息安全基础知识" },
			{ id: "4.2", title: "信息系统安全的作用与意义" },
			{ id: "4.3", title: "信息安全系统的组成框架" },
			{ id: "4.4", title: "信息加解密技术" },
			{ id: "4.5", title: "密钥管理技术" },
			{ id: "4.6", title: "访问控制及数字签名技术" },
			{ id: "4.7", title: "信息安全的抗攻击技术" },
			{ id: "4.8", title: "信息安全的保障体系与评估方法" },
		],
	},
	{
		number: 5,
		title: "软件工程基础知识",
		sections: [
			{ id: "5.1", title: "软件工程" },
			{ id: "5.2", title: "需求工程" },
			{ id: "5.3", title: "系统分析与设计" },
			{ id: "5.4", title: "软件测试" },
			{ id: "5.5", title: "净室软件工程" },
			{ id: "5.6", title: "基于构件的软件工程" },
			{ id: "5.7", title: "软件项目管理" },
		],
	},
	{
		number: 6,
		title: "数据库设计基础知识",
		sections: [
			{ id: "6.1", title: "数据库基本概念" },
			{ id: "6.2", title: "关系数据库" },
			{ id: "6.3", title: "数据库设计" },
			{ id: "6.4", title: "应用程序与数据库的交互" },
			{ id: "6.5", title: "NoSQL数据库" },
		],
	},
	{
		number: 7,
		title: "系统架构设计基础知识",
		sections: [
			{ id: "7.1", title: "软件架构概念" },
			{ id: "7.2", title: "基于架构的软件开发方法" },
			{ id: "7.3", title: "软件架构风格" },
			{ id: "7.4", title: "软件架构复用" },
			{ id: "7.5", title: "特定领域软件体系结构" },
		],
	},
	{
		number: 8,
		title: "系统质量属性与架构评估",
		sections: [
			{ id: "8.1", title: "软件系统质量属性" },
			{ id: "8.2", title: "系统架构评估" },
			{ id: "8.3", title: "ATAM方法架构评估实践" },
		],
	},
	{
		number: 9,
		title: "软件可靠性基础知识",
		sections: [
			{ id: "9.1", title: "软件可靠性基本概念" },
			{ id: "9.2", title: "软件可靠性建模" },
			{ id: "9.3", title: "软件可靠性管理" },
			{ id: "9.4", title: "软件可靠性设计" },
			{ id: "9.5", title: "软件可靠性测试" },
			{ id: "9.6", title: "软件可靠性评价" },
		],
	},
	{
		number: 10,
		title: "软件架构的演化和维护",
		sections: [
			{ id: "10.1", title: "软件架构演化和定义的关系" },
			{ id: "10.2", title: "面向对象软件架构演化过程" },
			{ id: "10.3", title: "软件架构演化方式的分类" },
			{ id: "10.4", title: "软件架构演化原则" },
			{ id: "10.5", title: "软件架构演化评估方法" },
			{ id: "10.6", title: "大型网站系统架构演化实例" },
			{ id: "10.7", title: "软件架构维护" },
		],
	},
	{
		number: 11,
		title: "未来信息综合技术",
		sections: [
			{ id: "11.1", title: "信息物理系统技术概述" },
			{ id: "11.2", title: "人工智能技术概述" },
			{ id: "11.3", title: "机器人技术概述" },
			{ id: "11.4", title: "边缘计算概述" },
			{ id: "11.5", title: "数字孪生体技术概述" },
			{ id: "11.6", title: "云计算和大数据技术概述" },
		],
	},
	{
		number: 12,
		title: "信息系统架构设计理论与实践",
		sections: [
			{ id: "12.1", title: "信息系统架构基本概念及发展" },
			{ id: "12.2", title: "信息系统架构" },
			{ id: "12.3", title: "信息系统架构设计方法" },
			{ id: "12.4", title: "信息系统架构案例分析" },
		],
	},
	{
		number: 13,
		title: "层次式架构设计理论与实践",
		sections: [
			{ id: "13.1", title: "层次式体系结构概述" },
			{ id: "13.2", title: "表现层框架设计" },
			{ id: "13.3", title: "中间层架构设计" },
			{ id: "13.4", title: "数据访问层设计" },
			{ id: "13.5", title: "数据架构规划与设计" },
			{ id: "13.6", title: "物联网层次架构设计" },
			{ id: "13.7", title: "层次式架构案例分析" },
		],
	},
	{
		number: 14,
		title: "云原生架构设计理论与实践",
		sections: [
			{ id: "14.1", title: "云原生架构产生背景" },
			{ id: "14.2", title: "云原生架构内涵" },
			{ id: "14.3", title: "云原生架构相关技术" },
			{ id: "14.4", title: "云原生架构案例分析" },
		],
	},
	{
		number: 15,
		title: "面向服务架构设计理论与实践",
		sections: [
			{ id: "15.1", title: "SOA的相关概念" },
			{ id: "15.2", title: "SOA的发展历史" },
			{ id: "15.3", title: "SOA的参考架构" },
			{ id: "15.4", title: "SOA主要协议和规范" },
			{ id: "15.5", title: "SOA设计的标准要求" },
			{ id: "15.6", title: "SOA的作用" },
			{ id: "15.7", title: "SOA的设计原则" },
			{ id: "15.8", title: "SOA的设计模式" },
			{ id: "15.9", title: "构建SOA架构时应该注意的问题" },
			{ id: "15.10", title: "SOA实施的过程" },
		],
	},
	{
		number: 16,
		title: "嵌入式系统架构设计理论与实践",
		sections: [
			{ id: "16.1", title: "嵌入式系统概述" },
			{ id: "16.2", title: "嵌入式系统软件架构原理与特征" },
			{ id: "16.3", title: "嵌入式系统软件架构设计方法" },
			{ id: "16.4", title: "嵌入式系统软件架构案例分析" },
		],
	},
	{
		number: 17,
		title: "通信系统架构设计理论与实践",
		sections: [
			{ id: "17.1", title: "通信系统概述" },
			{ id: "17.2", title: "通信系统网络架构" },
			{ id: "17.3", title: "网络构建关键技术" },
			{ id: "17.4", title: "网络构建和设计方法" },
			{ id: "17.5", title: "通信网络构建案例分析" },
		],
	},
	{
		number: 18,
		title: "安全架构设计理论与实践",
		sections: [
			{ id: "18.1", title: "安全架构概述" },
			{ id: "18.2", title: "安全模型" },
			{ id: "18.3", title: "系统安全体系架构规划框架" },
			{ id: "18.4", title: "信息安全整体架构设计（WPDRRC模型）" },
			{ id: "18.5", title: "网络安全体系架构设计" },
			{ id: "18.6", title: "数据库系统的安全设计" },
			{ id: "18.7", title: "系统架构的脆弱性分析" },
			{ id: "18.8", title: "安全架构设计案例分析" },
		],
	},
	{
		number: 19,
		title: "大数据架构设计理论与实践",
		sections: [
			{ id: "19.1", title: "传统数据处理系统存在的问题" },
			{ id: "19.2", title: "大数据处理系统架构分析" },
			{ id: "19.3", title: "Lambda架构" },
			{ id: "19.4", title: "Kappa架构" },
			{ id: "19.5", title: "Lambda架构与Kappa架构的对比和设计选择" },
			{ id: "19.6", title: "大数据架构设计案例分析" },
		],
	},
	{
		number: 20,
		title: "系统架构设计师论文写作要点",
		sections: [
			{ id: "20.1", title: "写作注意事项" },
			{ id: "20.2", title: "如何解答试题" },
			{ id: "20.3", title: "论文写作方法" },
			{ id: "20.4", title: "常见问题及解决办法" },
		],
	},
];
