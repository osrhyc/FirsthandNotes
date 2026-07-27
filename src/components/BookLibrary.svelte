<script lang="ts">
import Icon from "@iconify/svelte";
import { onMount } from "svelte";
import { url } from "../utils/url-utils";

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
let categoryMenu: HTMLDivElement;

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

function firstChapterUrl(book: Book) {
	const chapter = book.chapters[0];
	return chapter ? chapter.url : url("/books/");
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
	isCategoryMenuOpen = false;
}

onMount(() => {
	function handlePointerDown(event: PointerEvent) {
		if (
			isCategoryMenuOpen &&
			categoryMenu &&
			!categoryMenu.contains(event.target as Node)
		) {
			isCategoryMenuOpen = false;
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === "Escape") isCategoryMenuOpen = false;
	}

	document.addEventListener("pointerdown", handlePointerDown);
	document.addEventListener("keydown", handleKeyDown);

	return () => {
		document.removeEventListener("pointerdown", handlePointerDown);
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

				<div class="relative" bind:this={categoryMenu}>
					<button
						type="button"
						aria-haspopup="listbox"
						aria-expanded={isCategoryMenuOpen}
						aria-controls="book-category-menu"
						on:click={() => (isCategoryMenuOpen = !isCategoryMenuOpen)}
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
							icon="material-symbols:expand-more-rounded"
							width="22"
							class={`shrink-0 text-50 transition-transform ${
								isCategoryMenuOpen ? "rotate-180" : ""
							}`}
						/>
					</button>

					{#if isCategoryMenuOpen}
						<div
							id="book-category-menu"
							role="listbox"
							aria-label="按分类筛选书籍"
							class="absolute right-0 top-[calc(100%+0.5rem)] z-40 w-full min-w-56 overflow-hidden rounded-lg border border-black/10 bg-[var(--card-bg)] p-2 shadow-xl dark:border-white/10"
						>
							<div class="px-2 pb-2 pt-1 text-xs font-semibold text-30">选择分类</div>
							<div class="max-h-72 overflow-y-auto">
								{#each categories as category}
									<button
										type="button"
										role="option"
										aria-selected={selectedCategory === category}
										on:click={() => selectCategory(category)}
										class={`flex min-h-10 w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition ${
											selectedCategory === category
												? "bg-[var(--btn-regular-bg)] font-semibold text-[var(--primary)]"
												: "text-75 hover:bg-[var(--btn-plain-bg-hover)]"
										}`}
									>
										<span class="min-w-0 flex-1 truncate">{category}</span>
										<span class="shrink-0 text-xs text-30">{categoryCount(category)}</span>
										{#if selectedCategory === category}
											<Icon
												icon="material-symbols:check-rounded"
												width="19"
												class="shrink-0 text-[var(--primary)]"
											/>
										{:else}
											<span class="w-[19px] shrink-0"></span>
										{/if}
									</button>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</header>

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
												href={firstChapterUrl(book)}
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
										href={firstChapterUrl(book)}
										aria-label={`开始阅读《${book.title}》`}
										class="btn-regular flex h-10 shrink-0 items-center gap-1.5 rounded-lg px-3.5 text-sm font-medium active:scale-95"
									>
										<span>开始阅读</span>
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
