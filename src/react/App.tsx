import {
	BookOutlined,
	CloseOutlined,
	CoffeeOutlined,
	CrownOutlined,
	DesktopOutlined,
	HistoryOutlined,
	LeftOutlined,
	MenuFoldOutlined,
	MenuUnfoldOutlined,
	MoonOutlined,
	ReadOutlined,
	RightOutlined,
	StockOutlined,
	SunOutlined,
	TagsOutlined,
	TrophyOutlined,
} from '@ant-design/icons';
import { Button, ConfigProvider, Dropdown, Empty, Input, Layout, Menu, theme } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Book } from './books';
import { bookGroupsByModule, books } from './books';
import type { Article } from './content';
import { articles } from './content';
import type { Term } from './glossary';
import { decorateTerms, termGroupsByModule, terms } from './glossary';
import { Logo } from './Logo';

const { Sider, Content, Header } = Layout;

// ===== 栏目结构：一级模块 → 二级栏目，文章通过 frontmatter 的 category 归属 =====
const MODULES = [
	{
		key: 'quant',
		label: '量化交易',
		icon: <StockOutlined />,
		children: [
			{ key: 'quant-school', label: '量化学堂', icon: <ReadOutlined /> },
			{ key: 'quant-books', label: '量化书屋', icon: <BookOutlined /> },
			{ key: 'quant-legends', label: '名人堂', icon: <TrophyOutlined /> },
			{ key: 'quant-events', label: '大事记', icon: <HistoryOutlined /> },
			{ key: 'quant-gossip', label: '江湖八卦', icon: <CoffeeOutlined /> },
			{ key: 'quant-glossary', label: '名词手册', icon: <TagsOutlined /> },
		],
	},
	{
		key: 'library',
		label: '书房',
		icon: <BookOutlined />,
		children: [
			{ key: 'library-books', label: '书架', icon: <ReadOutlined /> },
			{ key: 'library-glossary', label: '名词手册', icon: <TagsOutlined /> },
		],
	},
	{
		key: 'poker',
		label: '德州扑克',
		icon: <CrownOutlined />,
		children: [
			{ key: 'poker-school', label: '扑克学堂', icon: <ReadOutlined /> },
			{ key: 'poker-glossary', label: '名词手册', icon: <TagsOutlined /> },
		],
	},
];

// 书架栏目 → 书籍模块 的映射（frontmatter 的 bookModule 字段）
const BOOKSHELF_SECTIONS: Record<string, string> = {
	'quant-books': 'quant',
	'library-books': 'library',
};

function shelfSectionOfBook(book: Book) {
	return (
		Object.keys(BOOKSHELF_SECTIONS).find((key) => BOOKSHELF_SECTIONS[key] === book.module) ??
		'quant-books'
	);
}

const SECTIONS = MODULES.flatMap((module) => module.children);
const DEFAULT_SECTION = 'quant-school';

function isGlossarySection(key: string) {
	return key.endsWith('-glossary');
}

function moduleOf(sectionKey: string) {
	return sectionKey.split('-')[0];
}

// 支持 frontmatter 里写简称或全称：category: '学堂' / '量化学堂' 均可
const CATEGORY_ALIASES: Record<string, string> = {
	学堂: 'quant-school',
	量化学堂: 'quant-school',
	名人堂: 'quant-legends',
	大事记: 'quant-events',
	八卦: 'quant-gossip',
	江湖八卦: 'quant-gossip',
	扑克学堂: 'poker-school',
	德州扑克: 'poker-school',
};

function sectionOf(article: Article) {
	return CATEGORY_ALIASES[article.category] ?? DEFAULT_SECTION;
}

// 每个栏目内按发布时间正序编号：最早的一篇是第 ① 篇
const sectionArticles = new Map<string, Article[]>(
	SECTIONS.filter((section) => !isGlossarySection(section.key)).map((section) => [
		section.key,
		articles
			.filter((article) => sectionOf(article) === section.key)
			.sort((a, b) => a.pubDate.localeCompare(b.pubDate)),
	]),
);

function termsOfModule(moduleKey: string) {
	return terms.filter((term) => term.module === moduleKey);
}

// 默认词条取分类顺序里的第一个，与名词手册列表的首项保持一致
function firstTermOfModule(moduleKey: string) {
	return termGroupsByModule.get(moduleKey)?.[0]?.items[0];
}

function circledNumber(index: number) {
	return index < 20 ? String.fromCodePoint(0x2460 + index) : `${index + 1}.`;
}

// 分组（frontmatter 的 level/group 字段）：已知难度按固定顺序，其余按出现顺序
const LEVEL_ORDER = ['入门', '进阶', '专家'];

function groupArticles(list: Article[]) {
	const flat = list.filter((article) => !article.level);
	const map = new Map<string, Article[]>();
	for (const article of list) {
		if (!article.level) continue;
		const items = map.get(article.level) ?? [];
		items.push(article);
		map.set(article.level, items);
	}
	const names = [...map.keys()].sort((a, b) => {
		const ia = LEVEL_ORDER.indexOf(a);
		const ib = LEVEL_ORDER.indexOf(b);
		if (ia !== -1 && ib !== -1) return ia - ib;
		if (ia !== -1) return -1;
		if (ib !== -1) return 1;
		return 0;
	});
	return { flat, groups: names.map((name) => ({ name, items: map.get(name) ?? [] })) };
}

type Route = { sectionKey: string; itemId?: string; chapter?: number };

function getInitialState(): Route {
	const hash = window.location.hash;

	if (hash.startsWith('#/term/')) {
		const slug = hash.replace('#/term/', '');
		const term = terms.find((item) => item.id === slug);
		if (term) return { sectionKey: `${term.module}-glossary`, itemId: term.id };
	}

	if (hash.startsWith('#/book/')) {
		const [id, ch] = hash.replace('#/book/', '').split('/');
		const book = books.find((item) => item.id === id);
		if (book) {
			const chapter = Math.min(
				Math.max(Number.parseInt(ch ?? '1', 10) - 1 || 0, 0),
				book.chapters.length - 1,
			);
			return { sectionKey: shelfSectionOfBook(book), itemId: id, chapter };
		}
	}

	if (hash.startsWith('#/article/')) {
		const slug = hash.replace('#/article/', '');
		const article = articles.find((item) => item.id === slug);
		if (article) return { sectionKey: sectionOf(article), itemId: article.id };
	}

	const sectionSlug = hash.replace(/^#\/section\//, '');
	if (SECTIONS.some((section) => section.key === sectionSlug)) {
		const first = BOOKSHELF_SECTIONS[sectionSlug] // 书架栏目默认进总览
			? undefined
			: isGlossarySection(sectionSlug)
				? firstTermOfModule(moduleOf(sectionSlug))?.id
				: sectionArticles.get(sectionSlug)?.[0]?.id;
		return { sectionKey: sectionSlug, itemId: first };
	}
	return { sectionKey: DEFAULT_SECTION, itemId: sectionArticles.get(DEFAULT_SECTION)?.[0]?.id };
}

type ThemeMode = 'system' | 'light' | 'dark';

function getStoredMode(): ThemeMode {
	const saved = localStorage.getItem('theme-mode');
	return saved === 'light' || saved === 'dark' ? saved : 'system';
}

export function App() {
	const [route, setRoute] = useState<Route>(getInitialState);
	const { sectionKey, itemId } = route;
	// 名词浮窗：可同时打开多个，各自有位置和层级
	const [termWindows, setTermWindows] = useState<
		{ id: string; pos: { x: number; y: number }; z: number }[]
	>([]);
	const zCounter = useRef(1);
	const [navVisible, setNavVisible] = useState(true);
	const [query, setQuery] = useState('');
	const [mode, setMode] = useState<ThemeMode>(getStoredMode);
	const [systemDark, setSystemDark] = useState(
		() => window.matchMedia('(prefers-color-scheme: dark)').matches,
	);

	useEffect(() => {
		const media = window.matchMedia('(prefers-color-scheme: dark)');
		const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
		media.addEventListener('change', onChange);
		return () => media.removeEventListener('change', onChange);
	}, []);

	const isDark = mode === 'dark' || (mode === 'system' && systemDark);

	useEffect(() => {
		document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
		localStorage.setItem('theme-mode', mode);
	}, [mode, isDark]);

	// 整页不滚动，切换文章/章节时重置正文卡片内部滚动
	useEffect(() => {
		document.querySelector('.article-card')?.scrollTo(0, 0);
	}, [itemId, route.chapter]);

	const glossaryMode = isGlossarySection(sectionKey);
	const shelfModule = BOOKSHELF_SECTIONS[sectionKey];
	const bookshelfSection = Boolean(shelfModule);
	const moduleKey = moduleOf(sectionKey);
	const moduleTerms = useMemo(() => termsOfModule(moduleKey), [moduleKey]);
	const sectionLabel = SECTIONS.find((section) => section.key === sectionKey)?.label ?? '';

	// ===== 文章栏目数据 =====
	const currentArticles = sectionArticles.get(sectionKey) ?? [];
	const filteredArticles = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return currentArticles;
		return currentArticles.filter((article) => {
			const haystack =
				`${article.title} ${article.description} ${article.tags.join(' ')}`.toLowerCase();
			return haystack.includes(q);
		});
	}, [query, currentArticles]);
	const grouped = useMemo(() => groupArticles(filteredArticles), [filteredArticles]);
	const selectedArticle = currentArticles.find((article) => article.id === itemId);

	// ===== 书屋数据 =====
	const currentBook = bookshelfSection ? books.find((book) => book.id === itemId) : undefined;
	const chapterIndex = currentBook
		? Math.min(route.chapter ?? 0, currentBook.chapters.length - 1)
		: 0;
	const currentChapter = currentBook?.chapters[chapterIndex];
	const filteredBookGroups = useMemo(() => {
		const groups = bookGroupsByModule.get(shelfModule ?? '') ?? [];
		const q = query.trim().toLowerCase();
		if (!q) return groups;
		return groups
			.map((group) => ({
				name: group.name,
				items: group.items.filter((book) =>
					`${book.title} ${book.author} ${book.note} ${book.category}`.toLowerCase().includes(q),
				),
			}))
			.filter((group) => group.items.length > 0);
	}, [query, shelfModule]);
	const filteredChapters = useMemo(() => {
		if (!currentBook) return [];
		const q = query.trim().toLowerCase();
		if (!q) return currentBook.chapters;
		return currentBook.chapters.filter((chapter) => chapter.title.toLowerCase().includes(q));
	}, [query, currentBook]);

	// ===== 名词手册数据 =====
	const filteredTerms = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return moduleTerms;
		return moduleTerms.filter((term) =>
			`${term.term} ${term.aliases.join(' ')}`.toLowerCase().includes(q),
		);
	}, [query, moduleTerms]);
	// 分组保持 termGroupsByModule 的分类顺序，只留下命中搜索的词条
	const groupedTerms = useMemo(() => {
		const hit = new Set(filteredTerms.map((term) => term.id));
		return (termGroupsByModule.get(moduleKey) ?? [])
			.map((group) => ({ name: group.name, items: group.items.filter((t) => hit.has(t.id)) }))
			.filter((group) => group.items.length > 0);
	}, [filteredTerms, moduleKey]);
	const selectedTerm = glossaryMode
		? (moduleTerms.find((term) => term.id === itemId) ?? firstTermOfModule(moduleKey))
		: undefined;

	const decoratedArticleHtml = useMemo(
		() => (selectedArticle ? decorateTerms(selectedArticle.html, moduleTerms) : ''),
		[selectedArticle, moduleTerms],
	);
	const decoratedChapterHtml = useMemo(
		() => (currentChapter ? decorateTerms(currentChapter.html, moduleTerms) : ''),
		[currentChapter, moduleTerms],
	);
	// 每个浮窗的正文（拖动只改位置，不重新解析 HTML）
	const windowIds = termWindows.map((window) => window.id).join(',');
	const windowHtml = useMemo(() => {
		const map = new Map<string, string>();
		for (const id of windowIds.split(',').filter(Boolean)) {
			const term = moduleTerms.find((item) => item.id === id);
			if (term) {
				map.set(
					id,
					decorateTerms(
						term.html,
						moduleTerms.filter((item) => item.id !== term.id),
					),
				);
			}
		}
		return map;
	}, [windowIds, moduleTerms]);
	const decoratedTermHtml = useMemo(
		() =>
			selectedTerm
				? decorateTerms(
						selectedTerm.html,
						moduleTerms.filter((term) => term.id !== selectedTerm.id),
					)
				: '',
		[selectedTerm, moduleTerms],
	);

	function openSection(key: string) {
		const first = BOOKSHELF_SECTIONS[key] // 书架栏目默认进总览
			? undefined
			: isGlossarySection(key)
				? firstTermOfModule(moduleOf(key))?.id
				: sectionArticles.get(key)?.[0]?.id;
		setRoute({ sectionKey: key, itemId: first });
		setTermWindows([]);
		setQuery('');
		const hashPrefix = isGlossarySection(key) ? '#/term/' : '#/article/';
		window.history.replaceState(null, '', first ? `${hashPrefix}${first}` : `#/section/${key}`);
	}

	function backToShelf() {
		const shelfKey = BOOKSHELF_SECTIONS[sectionKey] ? sectionKey : 'quant-books';
		setRoute({ sectionKey: shelfKey, itemId: undefined });
		setQuery('');
		window.history.replaceState(null, '', `#/section/${shelfKey}`);
	}

	function openBook(id: string, chapter = 0) {
		const book = books.find((item) => item.id === id);
		if (!book) return;
		setRoute({ sectionKey: shelfSectionOfBook(book), itemId: id, chapter });
		setQuery('');
		window.history.replaceState(null, '', `#/book/${id}/${chapter + 1}`);
	}

	function openChapter(index: number) {
		if (!currentBook) return;
		const chapter = Math.min(Math.max(index, 0), currentBook.chapters.length - 1);
		setRoute({ sectionKey, itemId: currentBook.id, chapter });
		window.history.replaceState(null, '', `#/book/${currentBook.id}/${chapter + 1}`);
	}

	function openArticle(id: string) {
		setRoute({ sectionKey, itemId: id });
		window.history.replaceState(null, '', `#/article/${id}`);
	}

	function openTerm(id: string) {
		setRoute({ sectionKey, itemId: id });
		window.history.replaceState(null, '', `#/term/${id}`);
	}

	// 打开名词浮窗：已打开则置顶，否则新窗口向左层叠排开
	function openTermWindow(id: string) {
		zCounter.current += 1;
		const z = zCounter.current;
		setTermWindows((wins) => {
			if (wins.some((win) => win.id === id)) {
				return wins.map((win) => (win.id === id ? { ...win, z } : win));
			}
			const offset = (wins.length % 6) * 40;
			const x = Math.max(8, window.innerWidth - 440 - 32 - offset);
			return [...wins, { id, pos: { x, y: 84 }, z }];
		});
	}

	function closeTermWindow(id: string) {
		setTermWindows((wins) => wins.filter((win) => win.id !== id));
	}

	function raiseTermWindow(id: string) {
		zCounter.current += 1;
		const z = zCounter.current;
		setTermWindows((wins) => wins.map((win) => (win.id === id ? { ...win, z } : win)));
	}

	// 按住浮窗标题栏拖动
	function startDrag(event: React.PointerEvent<HTMLDivElement>, id: string) {
		if ((event.target as HTMLElement).closest('button')) return; // 关闭按钮不触发拖动
		const el = event.currentTarget.parentElement;
		if (!el) return;
		event.preventDefault();
		const rect = el.getBoundingClientRect();
		const dx = event.clientX - rect.left;
		const dy = event.clientY - rect.top;
		function onMove(ev: PointerEvent) {
			const pos = {
				x: Math.min(Math.max(8, ev.clientX - dx), window.innerWidth - 120),
				y: Math.min(Math.max(8, ev.clientY - dy), window.innerHeight - 60),
			};
			setTermWindows((wins) => wins.map((win) => (win.id === id ? { ...win, pos } : win)));
		}
		function onUp() {
			window.removeEventListener('pointermove', onMove);
			window.removeEventListener('pointerup', onUp);
		}
		window.addEventListener('pointermove', onMove);
		window.addEventListener('pointerup', onUp);
	}

	function handleBodyClick(event: React.MouseEvent<HTMLElement>) {
		const target = (event.target as HTMLElement).closest('.term-link') as HTMLElement | null;
		if (!target?.dataset.term) return;
		if (glossaryMode) {
			openTerm(target.dataset.term);
		} else {
			openTermWindow(target.dataset.term);
		}
	}

	// 编号在同组（或平铺区）内独立计数，且不受搜索过滤影响
	function articleNumber(article: Article) {
		const peers = currentArticles.filter((item) => item.level === article.level);
		return circledNumber(peers.indexOf(article));
	}

	function renderArticleItem(article: Article) {
		return (
			<li key={article.id}>
				<button
					type="button"
					className={article.id === selectedArticle?.id ? 'course-item active' : 'course-item'}
					title={article.title}
					onClick={() => openArticle(article.id)}
				>
					{articleNumber(article)} {article.title}
				</button>
			</li>
		);
	}

	// 书架卡片
	function renderBookCard(book: Book) {
		return (
			<button type="button" className="book-card" key={book.id} onClick={() => openBook(book.id)}>
				<span className="book-card-head">
					<span className="book-name">{book.title}</span>
					{book.deepRead ? (
						<span
							className="book-badge"
							title={`真读原书：从原书提取真实章节文本，一章一篇，共 ${book.chapters.length} 篇`}
						>
							真读逐章
						</span>
					) : null}
				</span>
				<span className="book-author">{book.author}</span>
				<span className="book-note">{book.note}</span>
			</button>
		);
	}

	function renderTermItem(term: Term) {
		return (
			<li key={term.id}>
				<button
					type="button"
					className={term.id === selectedTerm?.id ? 'course-item active' : 'course-item'}
					title={term.term}
					onClick={() => openTerm(term.id)}
				>
					{term.term}
				</button>
			</li>
		);
	}

	const menuItems = MODULES.map((module) => ({
		key: module.key,
		icon: module.icon,
		label: module.label,
		children: module.children.map((section) => ({
			key: section.key,
			icon: section.icon,
			label: section.label,
		})),
	}));

	const themeMenuItems = [
		{ key: 'system', icon: <DesktopOutlined />, label: '跟随系统' },
		{ key: 'light', icon: <SunOutlined />, label: '浅色主题' },
		{ key: 'dark', icon: <MoonOutlined />, label: '暗黑主题' },
	];
	const themeIcon =
		mode === 'system' ? <DesktopOutlined /> : isDark ? <MoonOutlined /> : <SunOutlined />;

	const showNav = navVisible && !(bookshelfSection && !currentBook);
	const searchPlaceholder = currentBook
		? '在本书章节中搜索'
		: `在${sectionLabel || '当前栏目'}中搜索`;

	return (
		<ConfigProvider
			theme={{
				algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
				token: {
					colorPrimary: isDark ? '#6b8afd' : '#2f54eb',
					borderRadius: 8,
					fontFamily:
						'PingFang SC, Hiragino Sans GB, Helvetica Neue, Helvetica, Microsoft YaHei, sans-serif',
				},
			}}
		>
			<Layout className="app-shell" hasSider>
				<Sider className="app-sider" width={232} theme="light" breakpoint="lg" collapsedWidth={0}>
					<div className="brand">
						<Logo size={38} />
						<div className="brand-text">
							<strong>一手笔记</strong>
							<span>Firsthand Notes</span>
						</div>
					</div>
					<p className="slogan">记录值得长期保存的知识</p>
					<Menu
						mode="inline"
						items={menuItems}
						defaultOpenKeys={MODULES.map((module) => module.key)}
						selectedKeys={[sectionKey]}
						onClick={({ key }) => openSection(String(key))}
					/>
				</Sider>
				<Layout className="app-main">
					<Header className="app-topbar">
						<Button
							type="text"
							icon={navVisible ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
							aria-label={navVisible ? '隐藏列表' : '显示列表'}
							onClick={() => setNavVisible((value) => !value)}
						/>
						<Input.Search
							className="topbar-search"
							placeholder={searchPlaceholder}
							allowClear
							value={query}
							onChange={(event) => setQuery(event.target.value)}
						/>
						<Dropdown
							menu={{
								items: themeMenuItems,
								selectable: true,
								selectedKeys: [mode],
								onClick: ({ key }) => setMode(key as ThemeMode),
							}}
							placement="bottomRight"
						>
							<Button type="text" icon={themeIcon} aria-label="切换主题" />
						</Dropdown>
					</Header>
					<Content className="app-content">
						{!showNav ? null : (
							<nav className="course-nav">
								{bookshelfSection && currentBook ? (
									<>
										{filteredChapters.length > 0 ? (
											<ul>
												{filteredChapters.map((chapter) => (
													<li key={chapter.order}>
														<button
															type="button"
															className={
																chapter.order - 1 === chapterIndex
																	? 'course-item active'
																	: 'course-item'
															}
															title={chapter.title}
															onClick={() => openChapter(chapter.order - 1)}
														>
															{circledNumber(chapter.order - 1)} {chapter.title}
														</button>
													</li>
												))}
											</ul>
										) : (
											<Empty description="没有匹配的章节" image={Empty.PRESENTED_IMAGE_SIMPLE} />
										)}
									</>
								) : glossaryMode ? (
									groupedTerms.length > 0 ? (
										<>
											{groupedTerms.map((group) => (
												<div className="course-group" key={group.name}>
													<p className="course-group-title">{group.name}</p>
													<ul>{group.items.map(renderTermItem)}</ul>
												</div>
											))}
										</>
									) : (
										<Empty
											description={query ? '没有匹配的名词' : '还没有收录名词'}
											image={Empty.PRESENTED_IMAGE_SIMPLE}
										/>
									)
								) : filteredArticles.length > 0 ? (
									<>
										{grouped.flat.length > 0 && <ul>{grouped.flat.map(renderArticleItem)}</ul>}
										{grouped.groups.map((group) => (
											<div className="course-group" key={group.name}>
												<p className="course-group-title">{group.name}</p>
												<ul>{group.items.map(renderArticleItem)}</ul>
											</div>
										))}
									</>
								) : (
									<Empty
										description={query ? '没有匹配的文章' : '本栏目暂无文章'}
										image={Empty.PRESENTED_IMAGE_SIMPLE}
									/>
								)}
							</nav>
						)}
						{bookshelfSection && !currentBook ? (
							<div className="bookshelf">
								{filteredBookGroups.length === 0 ? (
									<div className="article-card">
										<Empty description={query ? '没有匹配的书' : '书架还是空的'} />
									</div>
								) : (
									filteredBookGroups.map((group) => (
										<section className="shelf-group" key={group.name}>
											<h2 className="shelf-group-title">
												{group.name}
												<span className="shelf-count">{group.items.length} 本</span>
											</h2>
											<div className="shelf-grid">{group.items.map(renderBookCard)}</div>
										</section>
									))
								)}
							</div>
						) : bookshelfSection && currentBook && currentChapter ? (
							<article className="article-card">
								<Button
									className="back-shelf"
									type="link"
									icon={<LeftOutlined />}
									onClick={backToShelf}
								>
									返回书架
								</Button>
								<p className="eyebrow">
									《{currentBook.title}》 · {currentBook.author}
								</p>
								<h1 className="article-title">{currentChapter.title}</h1>
								<p className="article-meta">
									第 {chapterIndex + 1} / {currentBook.chapters.length} 章 ·{' '}
									{currentChapter.wordCount} 字 · 约 {currentChapter.readingMinutes} 分钟
								</p>
								<div
									className="article-body"
									onClick={handleBodyClick}
									dangerouslySetInnerHTML={{ __html: decoratedChapterHtml }}
								/>
								<div className="chapter-pager">
									<Button
										icon={<LeftOutlined />}
										disabled={chapterIndex === 0}
										onClick={() => openChapter(chapterIndex - 1)}
									>
										上一章
									</Button>
									<span className="chapter-progress">
										{chapterIndex + 1} / {currentBook.chapters.length}
									</span>
									<Button
										disabled={chapterIndex >= currentBook.chapters.length - 1}
										onClick={() => openChapter(chapterIndex + 1)}
									>
										下一章 <RightOutlined />
									</Button>
								</div>
							</article>
						) : glossaryMode ? (
							selectedTerm ? (
								<article className="article-card">
									<h1 className="article-title">{selectedTerm.term}</h1>
									{selectedTerm.aliases.length > 0 && (
										<p className="article-meta">相关说法：{selectedTerm.aliases.join(' / ')}</p>
									)}
									<div
										className="article-body"
										onClick={handleBodyClick}
										dangerouslySetInnerHTML={{ __html: decoratedTermHtml }}
									/>
								</article>
							) : (
								<div className="article-card">
									<Empty description="看文章遇到不懂的名词来问我，我会讲给你听并自动收录到这里" />
								</div>
							)
						) : selectedArticle ? (
							<article className="article-card">
								<h1 className="article-title">{selectedArticle.title}</h1>
								<p className="article-meta">
									{selectedArticle.pubDate} · {selectedArticle.wordCount} 字 · 约{' '}
									{selectedArticle.readingMinutes} 分钟
								</p>
								{/* Markdown 在构建时经 marked 编译为静态 HTML，术语已包成 .term-link */}
								<div
									className="article-body"
									onClick={handleBodyClick}
									dangerouslySetInnerHTML={{ __html: decoratedArticleHtml }}
								/>
							</article>
						) : (
							<div className="article-card">
								<Empty description={`「${sectionLabel}」的第一篇正在路上`} />
							</div>
						)}
					</Content>
					{!glossaryMode &&
						termWindows.map((win) => {
							const term = moduleTerms.find((item) => item.id === win.id);
							if (!term) return null;
							return (
								<div
									key={win.id}
									className="term-popup"
									style={{ left: win.pos.x, top: win.pos.y, right: 'auto', zIndex: 1000 + win.z }}
									role="dialog"
									aria-label={term.term}
									onPointerDownCapture={() => raiseTermWindow(win.id)}
								>
									<div
										className="term-popup-head"
										onPointerDown={(event) => startDrag(event, win.id)}
									>
										<strong>{term.term}</strong>
										<Button
											type="text"
											size="small"
											icon={<CloseOutlined />}
											aria-label="关闭"
											onClick={() => closeTermWindow(win.id)}
										/>
									</div>
									<div
										className="article-body term-popup-body"
										onClick={handleBodyClick}
										dangerouslySetInnerHTML={{ __html: windowHtml.get(win.id) ?? '' }}
									/>
								</div>
							);
						})}
				</Layout>
			</Layout>
		</ConfigProvider>
	);
}
