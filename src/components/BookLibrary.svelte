<script lang="ts">
import Icon from "@iconify/svelte";
import { onMount } from "svelte";
import { getBookUrl } from "../utils/url-utils";

interface Chapter {
	number: number;
	title: string;
	url: string;
	updatedAt: string;
}

interface Book {
	slug: string;
	title: string;
	author: string;
	description: string;
	category: string;
	sequence: number;
	updatedAt: string;
	chapters: Chapter[];
}

export let books: Book[] = [];

let query = "";
let selectedCategory = "全部";
let isCategoryMenuOpen = false;
let previousBodyOverflow = "";

$: categories = [
	"全部",
	...Array.from(new Set(books.map((book) => book.category))).sort((a, b) =>
		a.localeCompare(b, "zh-CN"),
	),
];

$: normalizedQuery = query.trim().toLocaleLowerCase();
$: filteredBooks = books.filter((book) => {
	const matchesCategory =
		selectedCategory === "全部" || book.category === selectedCategory;
	const haystack =
		`${book.title} ${book.author} ${book.description}`.toLocaleLowerCase();
	return matchesCategory && (!normalizedQuery || haystack.includes(normalizedQuery));
});
$: visibleCategoryGroups = categories
	.filter((category) => category !== "全部")
	.map((category) => ({
		category,
		books: filteredBooks.filter((book) => book.category === category),
	}))
	.filter((group) => group.books.length > 0);
$: recentChapters = books
	.flatMap((book) =>
		book.chapters.map((chapter) => ({
			book,
			chapter,
		})),
	)
	.sort(
		(a, b) =>
			b.chapter.updatedAt.localeCompare(a.chapter.updatedAt) ||
			a.book.sequence - b.book.sequence ||
			b.chapter.number - a.chapter.number,
	)
	.slice(0, 6);

function bookUrl(book: Book) {
	return getBookUrl(book.slug);
}

function formatDate(value: string) {
	return new Intl.DateTimeFormat("zh-CN", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(new Date(`${value}T00:00:00`));
}

function categoryCount(category: string) {
	return category === "全部"
		? books.length
		: books.filter((book) => book.category === category).length;
}

function selectCategory(category: string) {
	selectedCategory = category;
	setCategoryMenuOpen(false);
}

function setCategoryMenuOpen(open: boolean) {
	isCategoryMenuOpen = open;
	if (typeof document === "undefined") return;
	if (open) {
		previousBodyOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
	} else {
		document.body.style.overflow = previousBodyOverflow;
	}
}

function portal(node: HTMLElement) {
	document.body.appendChild(node);
	return {
		destroy() {
			node.remove();
		},
	};
}

onMount(() => {
	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === "Escape") setCategoryMenuOpen(false);
	}

	document.addEventListener("keydown", handleKeyDown);

	return () => {
		document.body.style.overflow = previousBodyOverflow;
		document.removeEventListener("keydown", handleKeyDown);
	};
});
</script>

<section class="space-y-4">
	<header class="card-base px-6 py-6 md:px-8 md:py-7">
		<div class="flex flex-col gap-5">
			<div class="flex flex-col gap-2">
				<div class="flex items-center gap-3">
					<div
						class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--btn-regular-bg)] text-[var(--primary)]"
					>
						<Icon icon="material-symbols:library-books-outline-rounded" width="25" />
					</div>
					<div>
						<h1 class="text-2xl font-bold text-90 md:text-3xl">书籍</h1>
						<p class="mt-1 text-sm text-50">
							{books.length} 本精读书目，{books.reduce((sum, book) => sum + book.chapters.length, 0)} 篇逐章笔记
						</p>
					</div>
				</div>
				<p class="max-w-2xl text-sm leading-6 text-50">
					按书进入完整阅读脉络，从导读开始，逐章理解作者的论证、案例和可实践方法。
				</p>
			</div>

			<div class="grid gap-3 md:grid-cols-[1fr_13rem]">
				<label class="relative block">
					<span class="sr-only">搜索书名或作者</span>
					<Icon
						icon="material-symbols:search-rounded"
						width="21"
						class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-30"
					/>
					<input
						bind:value={query}
						type="search"
						placeholder="搜索书名、作者或主题"
						class="h-11 w-full rounded-xl border border-black/10 bg-[var(--page-bg)] pl-11 pr-4 text-sm text-75 outline-none transition focus:border-[var(--primary)] dark:border-white/10"
					/>
				</label>

				<div>
					<button
						type="button"
						aria-haspopup="dialog"
						aria-expanded={isCategoryMenuOpen}
						aria-controls="book-category-dialog"
						on:click={() => setCategoryMenuOpen(!isCategoryMenuOpen)}
						class={`flex h-11 w-full items-center gap-3 rounded-xl border bg-[var(--page-bg)] px-4 text-left text-sm outline-none transition ${
							isCategoryMenuOpen
								? "border-[var(--primary)] text-90"
								: "border-black/10 text-75 hover:border-black/20 dark:border-white/10 dark:hover:border-white/20"
						}`}
					>
						<Icon
							icon="material-symbols:filter-list-rounded"
							width="20"
							class="shrink-0 text-[var(--primary)]"
						/>
						<span class="min-w-0 flex-1 truncate">{selectedCategory}</span>
						<Icon
							icon="material-symbols:unfold-more-rounded"
							width="22"
							class="shrink-0 text-50"
						/>
					</button>
				</div>
			</div>
		</header>

		{#if isCategoryMenuOpen}
			<div use:portal class="fixed inset-0 z-[100] flex items-center justify-center p-4">
				<button
					type="button"
					aria-label="关闭分类选择"
					class="absolute inset-0 h-full w-full bg-black/45 backdrop-blur-[2px]"
					on:click={() => setCategoryMenuOpen(false)}
				></button>
				<div
					id="book-category-dialog"
					role="dialog"
					aria-modal="true"
					aria-labelledby="book-category-title"
					class="relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-black/10 bg-[var(--card-bg)] shadow-2xl dark:border-white/10"
				>
					<header class="flex items-center justify-between gap-4 border-b border-[var(--line-divider)] px-5 py-4">
						<div>
							<h2 id="book-category-title" class="text-lg font-bold text-90">选择书籍分类</h2>
							<p class="mt-1 text-xs text-50">共 {books.length} 本精读书目</p>
						</div>
						<button
							type="button"
							aria-label="关闭"
							on:click={() => setCategoryMenuOpen(false)}
							class="btn-plain flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
						>
							<Icon icon="material-symbols:close-rounded" width="22" />
						</button>
					</header>
					<div class="grid max-h-[min(28rem,70vh)] grid-cols-1 gap-2 overflow-y-auto p-4 sm:grid-cols-2">
						{#each categories as category}
							<button
								type="button"
								aria-pressed={selectedCategory === category}
								on:click={() => selectCategory(category)}
								class={`flex min-h-12 items-center gap-3 rounded-lg border px-3.5 py-2.5 text-left text-sm transition ${
									selectedCategory === category
										? "border-[var(--primary)] bg-[var(--btn-regular-bg)] font-semibold text-[var(--primary)]"
										: "border-black/10 text-75 hover:border-black/20 hover:bg-[var(--btn-plain-bg-hover)] dark:border-white/10 dark:hover:border-white/20"
								}`}
							>
								<span class="min-w-0 flex-1">{category}</span>
								<span class="shrink-0 text-xs text-30">{categoryCount(category)}</span>
								{#if selectedCategory === category}
									<Icon icon="material-symbols:check-circle-rounded" width="20" class="shrink-0 text-[var(--primary)]" />
								{:else}
									<span class="w-5 shrink-0"></span>
								{/if}
							</button>
						{/each}
					</div>
				</div>
			</div>
		{/if}

	<section>
		<div class="mb-3 flex items-end justify-between gap-4 px-1">
			<div>
				<h2 class="text-lg font-bold text-90">最近更新</h2>
				<p class="mt-1 text-sm text-50">最近补充和修订的章节</p>
			</div>
		</div>
		<div class="grid gap-3 sm:grid-cols-2">
			{#each recentChapters as item}
				<a
					href={item.chapter.url}
					class="card-base group flex min-h-32 items-start gap-4 p-5 transition hover:-translate-y-0.5"
				>
					<div
						class="flex h-12 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--btn-regular-bg)] text-lg font-bold text-[var(--primary)]"
						aria-hidden="true"
					>
						{item.book.title.slice(0, 1)}
					</div>
					<div class="min-w-0 flex-1">
						<div class="flex items-start justify-between gap-3">
							<h3 class="line-clamp-2 font-bold leading-6 text-90 transition group-hover:text-[var(--primary)]">
								{item.chapter.title}
							</h3>
							<span class="shrink-0 text-xs text-30">{formatDate(item.chapter.updatedAt)}</span>
						</div>
						<p class="mt-2 line-clamp-1 text-sm text-50">
							《{item.book.title}》 · {item.book.author}
						</p>
					</div>
				</a>
			{/each}
		</div>
	</section>

	<div class="flex items-end justify-between gap-4 px-1 pt-3">
		<div>
			<h2 class="text-lg font-bold text-90">全部书籍</h2>
			<p class="mt-1 text-sm text-50">按分类或关键词查找</p>
		</div>
	</div>

	<div class="flex items-center justify-between px-1 text-sm text-50">
		<span>找到 {filteredBooks.length} 本</span>
		{#if query || selectedCategory !== "全部"}
			<button
				type="button"
				on:click={() => {
					query = "";
					selectedCategory = "全部";
				}}
				class="rounded-lg px-3 py-1.5 font-medium text-[var(--primary)] transition hover:bg-[var(--btn-plain-bg-hover)]"
			>
				清除筛选
			</button>
		{/if}
	</div>

	{#if filteredBooks.length > 0}
		<div class="space-y-7">
			{#each visibleCategoryGroups as group}
				<section aria-labelledby={`book-category-${group.category}`}>
					<header class="mb-3 flex items-center gap-3 px-1">
						<span class="h-5 w-1 rounded-full bg-[var(--primary)]"></span>
						<h3
							id={`book-category-${group.category}`}
							class="text-base font-bold text-90"
						>
							{group.category}
						</h3>
						<span class="text-xs text-30">{group.books.length} 本</span>
					</header>

					<div class="grid gap-4 md:grid-cols-2">
						{#each group.books as book}
							<article class="card-base group flex min-h-52 flex-col p-5 md:p-6">
								<div class="flex items-start gap-4">
									<div
										class="flex h-14 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--btn-regular-bg)] text-xl font-bold text-[var(--primary)]"
										aria-hidden="true"
									>
										{book.title.slice(0, 1)}
									</div>
									<div class="min-w-0 flex-1">
										<h2 class="line-clamp-2 text-lg font-bold leading-7 text-90">
											<a
												href={bookUrl(book)}
												class="transition hover:text-[var(--primary)]"
											>
												{book.title}
											</a>
										</h2>
										<p class="mt-1 truncate text-sm text-50">{book.author}</p>
									</div>
								</div>

								<p class="mt-4 line-clamp-2 text-sm leading-6 text-50">
									{book.description || "逐章精读笔记"}
								</p>

								<div class="mt-auto flex items-end justify-between gap-3 pt-5">
									<div class="text-xs text-30">{book.chapters.length} 篇笔记</div>
									<a
										href={bookUrl(book)}
										aria-label={`查看《${book.title}》`}
										class="btn-regular flex h-10 shrink-0 items-center gap-1.5 rounded-lg px-3.5 text-sm font-medium active:scale-95"
									>
										<span>查看详情</span>
										<Icon icon="material-symbols:arrow-forward-rounded" width="19" />
									</a>
								</div>
							</article>
						{/each}
					</div>
				</section>
			{/each}
		</div>
	{:else}
		<div class="card-base flex min-h-56 flex-col items-center justify-center px-6 text-center">
			<Icon icon="material-symbols:menu-book-outline-rounded" width="36" class="text-30" />
			<p class="mt-3 font-medium text-75">没有找到匹配的书籍</p>
			<p class="mt-1 text-sm text-50">换一个关键词或清除分类筛选。</p>
		</div>
	{/if}
</section>
