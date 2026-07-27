import type {
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "一手笔记",
	subtitle: "记录值得长期保存的知识",
	lang: "zh_CN", // Language code, e.g. 'en', 'zh_CN', 'ja', etc.
	themeColor: {
		hue: 78, // Brand gold
		fixed: true, // Keep the brand palette consistent
	},
	banner: {
		enable: false,
		src: "assets/images/demo-banner.png", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
		position: "center", // Equivalent to object-position, only supports 'top', 'center', 'bottom'. 'center' by default
		credit: {
			enable: false, // Display the credit text of the banner image
			text: "", // Credit text to be displayed
			url: "", // (Optional) URL link to the original artwork or artist's page
		},
	},
	toc: {
		enable: true, // Display the table of contents on the right side of the post
		depth: 2, // Maximum heading depth to show in the table, from 1 to 3
	},
	favicon: [{ src: "/assets/brand/logo.png" }],
};

export const navBarConfig: NavBarConfig = {
	links: [
		{
			name: "首页",
			url: "/",
		},
		{
			name: "技术",
			url: "/blog/",
		},
		{
			name: "阅读",
			url: "/books/",
		},
		{
			name: "晨读",
			url: "/briefings/",
		},
		LinkPreset.Archive,
		LinkPreset.About,
		{
			name: "搜索",
			url: "/search/",
		},
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "/assets/brand/logo.png",
	name: "一手笔记",
	bio: "记录值得长期保存的知识。",
	links: [],
};

export const licenseConfig: LicenseConfig = {
	enable: false,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	// Note: Some styles (such as background color) are being overridden, see the astro.config.mjs file.
	// Please select a dark theme, as this blog theme currently only supports dark background color
	theme: "github-dark",
};
