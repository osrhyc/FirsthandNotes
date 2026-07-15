import React from 'react';
import ReactDOM from 'react-dom/client';
import 'antd/dist/reset.css';
import { App } from './react/App';
import './react/styles.css';

const root = document.getElementById('root')!;
const tree = (
	<React.StrictMode>
		<App />
	</React.StrictMode>
);

// 预渲染过的页面要 hydrate（复用已有 DOM）；createRoot 会把静态 HTML 整个
// 扔掉重画，那样预渲染就白做了。dev 下 root 是空的，走 createRoot。
if (root.hasChildNodes()) {
	ReactDOM.hydrateRoot(root, tree);
} else {
	ReactDOM.createRoot(root).render(tree);
}
