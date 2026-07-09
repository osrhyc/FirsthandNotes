// 全站共享的常量与工具函数

export const SITE_TITLE = '一手笔记';
export const SITE_TITLE_EN = 'Firsthand Notes';
export const SITE_DESCRIPTION = '记录值得长期保存的知识';
export const GITHUB_URL = 'https://github.com/osrhyc/FirsthandNotes';

// 内容分类（对应品牌设计中的五个栏目）
export const CATEGORIES = ['学习', '阅读', '人物', '行业', '时间线'] as const;

// 站点部署在子路径（GitHub Pages 项目页）下，内部链接统一经过此函数补上 base 前缀
export function withBase(path: string): string {
	const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
	return path === '/' ? `${base}/` : `${base}${path}`;
}
