// 预渲染入口：在 Node 里把某个路径渲染成 HTML 字符串。
// 只被 scripts/prerender.mjs 调用，不进客户端包。
import { createCache, extractStyle, StyleProvider } from '@ant-design/cssinjs';
import { renderToString } from 'react-dom/server';
import { App } from './react/App';
import { preloadBody } from './react/bodies';
import { bodyKeysOf, parseRoute } from './react/routes';
import { metaOf } from './react/seo';
import './react/styles.css';

export { allPaths } from './react/routes';
export { metaOf, SITE_URL } from './react/seo';

export async function render(path: string) {
	// 正文改成按需加载后，renderToString 是同步的、等不了 Promise，所以必须先把
	// 这一页要用到的正文读进缓存。metaOf 也要读它来生成 description，故须在其之前。
	// 返回的 seed 由 prerender 内联进 HTML，供客户端 hydration 首帧同步命中。
	const seed: Record<string, string> = {};
	for (const key of bodyKeysOf(parseRoute(path))) {
		const md = await preloadBody(key);
		if (md !== undefined) seed[key] = md;
	}

	// AntD 6 是 CSS-in-JS：样式在渲染时才生成，必须从 cache 里提出来塞进 <head>，
	// 否则静态 HTML 到达浏览器时是裸的，会闪一下。
	const cache = createCache();
	const html = renderToString(
		<StyleProvider cache={cache}>
			<App initialPath={path} />
		</StyleProvider>,
	);
	return { html, style: extractStyle(cache), meta: metaOf(path), seed };
}
