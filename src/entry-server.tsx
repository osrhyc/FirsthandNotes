// 预渲染入口：在 Node 里把某个路径渲染成 HTML 字符串。
// 只被 scripts/prerender.mjs 调用，不进客户端包。
import { createCache, extractStyle, StyleProvider } from '@ant-design/cssinjs';
import { renderToString } from 'react-dom/server';
import { App } from './react/App';
import { metaOf } from './react/seo';
import './react/styles.css';

export { allPaths } from './react/routes';
export { metaOf, SITE_URL } from './react/seo';

export function render(path: string) {
	// AntD 6 是 CSS-in-JS：样式在渲染时才生成，必须从 cache 里提出来塞进 <head>，
	// 否则静态 HTML 到达浏览器时是裸的，会闪一下。
	const cache = createCache();
	const html = renderToString(
		<StyleProvider cache={cache}>
			<App initialPath={path} />
		</StyleProvider>,
	);
	return { html, style: extractStyle(cache), meta: metaOf(path) };
}
