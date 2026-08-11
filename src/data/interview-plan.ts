export const INTERVIEW_COHORT = {
	startDate: "2026-08-11",
	endDate: "2026-09-07",
	cutoffHour: 4,
	totalDays: 28,
} as const;

export const INTERVIEW_PHASE_MIX = [
	{ startDay: 1, endDay: 7, newKnowledge: 60, review: 20, output: 20 },
	{ startDay: 8, endDay: 14, newKnowledge: 45, review: 25, output: 30 },
	{ startDay: 15, endDay: 21, newKnowledge: 35, review: 30, output: 35 },
	{ startDay: 22, endDay: 28, newKnowledge: 15, review: 35, output: 50 },
] as const;

export const INTERVIEW_WEEKS = [
	{
		week: 1,
		title: "基础恢复",
		subtitle: "JS / TS、框架与浏览器",
		goal: "恢复高级前端基本盘，并从第一周开始真实投递。",
	},
	{
		week: 2,
		title: "项目深挖",
		subtitle: "性能、稳定性与前端架构",
		goal: "把真实经验整理成能讲 20～30 分钟、数据闭环完整的项目案例。",
	},
	{
		week: 3,
		title: "全栈能力",
		subtitle: "Node、数据库、Redis 与系统设计",
		goal: "证明自己能够独立负责一个系统，而不只是完成页面开发。",
	},
	{
		week: 4,
		title: "冲刺实战",
		subtitle: "算法、AI 工程与模拟面试",
		goal: "补齐高频短板，通过完整模拟面试形成最终复盘清单。",
	},
] as const;

export interface InterviewPlanItem {
	day: number;
	week: number;
	title: string;
	focus: string;
	description: string;
	tracks: string[];
	difficulty: "基础" | "进阶" | "高级" | "综合";
}

export const INTERVIEW_PLAN: InterviewPlanItem[] = [
	{
		day: 1,
		week: 1,
		title: "JavaScript 执行模型与 Event Loop",
		focus: "JS / TS",
		description:
			"从调用栈、任务队列到浏览器与 Node 的事件循环差异，建立可推演的执行模型。",
		tracks: ["JavaScript", "Event Loop"],
		difficulty: "进阶",
	},
	{
		day: 2,
		week: 1,
		title: "异步、闭包、this 与原型链",
		focus: "JS / TS",
		description:
			"串起 Promise、async/await、作用域、闭包、this 和原型继承的高频追问。",
		tracks: ["JavaScript", "异步"],
		difficulty: "进阶",
	},
	{
		day: 3,
		week: 1,
		title: "TypeScript 类型体操的工程边界",
		focus: "JS / TS",
		description:
			"掌握泛型、条件类型、infer、映射类型与常用 Utility Types 的实现和取舍。",
		tracks: ["TypeScript", "类型系统"],
		difficulty: "高级",
	},
	{
		day: 4,
		week: 1,
		title: "从输入 URL 到页面可交互",
		focus: "浏览器",
		description:
			"完整讲清网络、解析、渲染与合成链路，并能定位链路上的性能瓶颈。",
		tracks: ["浏览器", "网络"],
		difficulty: "进阶",
	},
	{
		day: 5,
		week: 1,
		title: "Vue 响应式与组件更新",
		focus: "框架",
		description:
			"理解 Vue 2/3 响应式差异、依赖追踪、调度、Virtual DOM 与 diff。",
		tracks: ["Vue", "响应式"],
		difficulty: "高级",
	},
	{
		day: 6,
		week: 1,
		title: "React Fiber、Hooks 与并发渲染",
		focus: "框架",
		description:
			"围绕 Fiber、Reconciliation、Hooks、Effect 和性能优化理解 React 的设计。",
		tracks: ["React", "Hooks"],
		difficulty: "高级",
	},
	{
		day: 7,
		week: 1,
		title: "第一周基础盘模拟面试",
		focus: "模拟面试",
		description:
			"混合 JS、TS、Vue、React 与浏览器题，暴露基础薄弱点并形成补漏清单。",
		tracks: ["综合", "模拟面试"],
		difficulty: "综合",
	},
	{
		day: 8,
		week: 2,
		title: "项目故事：从背景到结果",
		focus: "项目深挖",
		description: "用问题、约束、选型、实施、数据与复盘讲透一个核心项目。",
		tracks: ["项目", "表达"],
		difficulty: "高级",
	},
	{
		day: 9,
		week: 2,
		title: "性能问题的发现与证据链",
		focus: "性能与稳定性",
		description:
			"从用户反馈、RUM、Performance API 到火焰图，建立可验证的定位路径。",
		tracks: ["性能", "监控"],
		difficulty: "高级",
	},
	{
		day: 10,
		week: 2,
		title: "Core Web Vitals 与交互性能",
		focus: "性能与稳定性",
		description: "围绕 LCP、INP、CLS、Long Task 与关键渲染路径设计优化方案。",
		tracks: ["Web Vitals", "性能"],
		difficulty: "高级",
	},
	{
		day: 11,
		week: 2,
		title: "内存、GC 与复杂页面卡顿",
		focus: "性能与稳定性",
		description:
			"排查内存泄漏、大列表、频繁渲染与主线程阻塞，量化优化前后差异。",
		tracks: ["内存", "性能"],
		difficulty: "高级",
	},
	{
		day: 12,
		week: 2,
		title: "线上事故、止损与复盘",
		focus: "性能与稳定性",
		description: "练习影响评估、快速止损、根因定位、监控补洞和防复发机制。",
		tracks: ["稳定性", "事故复盘"],
		difficulty: "高级",
	},
	{
		day: 13,
		week: 2,
		title: "前端架构、状态与发布治理",
		focus: "前端架构",
		description:
			"讨论模块拆分、状态边界、并发、灰度、回滚、可观测性与演进成本。",
		tracks: ["架构", "工程化"],
		difficulty: "高级",
	},
	{
		day: 14,
		week: 2,
		title: "项目深挖与 Leader 追问",
		focus: "模拟面试",
		description: "覆盖技术决策、任务拆分、评审、质量控制、成员培养和冲突处理。",
		tracks: ["项目", "管理"],
		difficulty: "综合",
	},
	{
		day: 15,
		week: 3,
		title: "Node.js 事件循环与并发模型",
		focus: "Node",
		description:
			"理解 libuv、事件循环阶段、微任务、线程池、进程与 Worker Threads。",
		tracks: ["Node.js", "并发"],
		difficulty: "高级",
	},
	{
		day: 16,
		week: 3,
		title: "Stream、Buffer 与服务端可靠性",
		focus: "Node",
		description: "掌握背压、流式处理、异常边界、优雅退出和服务端资源治理。",
		tracks: ["Node.js", "Stream"],
		difficulty: "进阶",
	},
	{
		day: 17,
		week: 3,
		title: "NestJS 依赖注入与请求链路",
		focus: "Node",
		description:
			"串起 Module、Provider、DI、Guard、Interceptor、Middleware 与异常过滤器。",
		tracks: ["NestJS", "服务端"],
		difficulty: "进阶",
	},
	{
		day: 18,
		week: 3,
		title: "索引、B+ Tree 与慢查询",
		focus: "数据库",
		description: "从索引结构、联合索引、回表和 Explain 推导 SQL 性能问题。",
		tracks: ["MySQL", "PostgreSQL"],
		difficulty: "高级",
	},
	{
		day: 19,
		week: 3,
		title: "事务、MVCC、隔离级别与锁",
		focus: "数据库",
		description: "通过并发读写场景解释一致性、隔离异常、锁竞争和工程取舍。",
		tracks: ["事务", "MVCC"],
		difficulty: "高级",
	},
	{
		day: 20,
		week: 3,
		title: "Redis 缓存与分布式锁",
		focus: "缓存",
		description: "处理穿透、击穿、雪崩、淘汰、过期、一致性与分布式锁失效。",
		tracks: ["Redis", "缓存"],
		difficulty: "高级",
	},
	{
		day: 21,
		week: 3,
		title: "全栈系统设计模拟面试",
		focus: "系统设计",
		description:
			"从客户端到数据库设计一套可扩展系统，覆盖缓存、幂等、限流、降级和监控。",
		tracks: ["系统设计", "全栈"],
		difficulty: "综合",
	},
	{
		day: 22,
		week: 4,
		title: "数组、哈希、双指针与滑动窗口",
		focus: "算法",
		description: "集中训练前端面试最常见的数据结构和线性扫描题型。",
		tracks: ["算法", "数组"],
		difficulty: "进阶",
	},
	{
		day: 23,
		week: 4,
		title: "链表、栈、队列与二叉树",
		focus: "算法",
		description: "掌握核心模板、边界条件和面试现场的复杂度表达。",
		tracks: ["算法", "数据结构"],
		difficulty: "进阶",
	},
	{
		day: 24,
		week: 4,
		title: "二分、DFS/BFS 与简单 DP",
		focus: "算法",
		description: "训练高频 Medium 题的识别、推导、编码和测试用例设计。",
		tracks: ["算法", "搜索"],
		difficulty: "进阶",
	},
	{
		day: 25,
		week: 4,
		title: "前端向系统设计实战",
		focus: "系统设计",
		description: "设计埋点、消息通知或大文件上传系统，明确客户端与服务端边界。",
		tracks: ["系统设计", "前端架构"],
		difficulty: "高级",
	},
	{
		day: 26,
		week: 4,
		title: "LLM 应用、RAG、Tool Calling 与 MCP",
		focus: "AI 工程",
		description:
			"理解 LLM 接入业务的关键组件、上下文管理、评估和 Prompt Injection 风险。",
		tracks: ["AI", "Agent"],
		difficulty: "进阶",
	},
	{
		day: 27,
		week: 4,
		title: "AI Coding 工作流与项目加分项",
		focus: "AI 工程",
		description:
			"把需求、Spec、任务拆解、生成、Review、测试与提交串成可信的工程闭环。",
		tracks: ["AI Coding", "工程效率"],
		difficulty: "高级",
	},
	{
		day: 28,
		week: 4,
		title: "高级前端全真模拟与最终复盘",
		focus: "模拟面试",
		description:
			"完成技术、项目、系统设计与 Leader 能力的完整模拟，形成后续迭代清单。",
		tracks: ["综合", "模拟面试"],
		difficulty: "综合",
	},
];

export function getInterviewPlanDate(day: number) {
	const start = new Date(`${INTERVIEW_COHORT.startDate}T00:00:00Z`);
	start.setUTCDate(start.getUTCDate() + day - 1);
	return start.toISOString().slice(0, 10);
}
