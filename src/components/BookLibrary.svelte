<script lang="ts">
import Icon from "@iconify/svelte";
import { getPostUrlBySlug } from "../utils/url-utils";

interface Chapter {
	number: number;
	title: string;
	postSlug: string;
}

interface Book {
	slug: string;
	title: string;
	author: string;
	description: string;
	category: string;
	sequence: number;
	chapters: Chapter[];
}

export let books: Book[] = [];

let query = "";
let selectedCategory = "全部";

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

function firstChapterUrl(book: Book) {
	const firstChapter = book.chapters[0];
	return firstChapter ? getPostUrlBySlug(firstChapter.postSlug) : "/books/";
}
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

				<label class="relative block">
					<span class="sr-only">按分类筛选</span>
					<select
						bind:value={selectedCategory}
						class="h-11 w-full appearance-none rounded-xl border border-black/10 bg-[var(--page-bg)] px-4 pr-10 text-sm text-75 outline-none transition focus:border-[var(--primary)] dark:border-white/10"
					>
						{#each categories as category}
							<option value={category}>{category}</option>
						{/each}
					</select>
					<Icon
						icon="material-symbols:expand-more-rounded"
						width="22"
						class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-50"
					/>
				</label>
			</div>
		</div>
	</header>

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
		<div class="grid gap-4 md:grid-cols-2">
			{#each filteredBooks as book}
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
								{book.title}
							</h2>
							<p class="mt-1 truncate text-sm text-50">{book.author}</p>
						</div>
					</div>

					<p class="mt-4 line-clamp-2 text-sm leading-6 text-50">
						{book.description || "逐章精读笔记"}
					</p>

					<div class="mt-auto flex items-end justify-between gap-3 pt-5">
						<div class="min-w-0">
							<div class="truncate text-xs font-medium text-[var(--primary)]">
								{book.category}
							</div>
							<div class="mt-1 text-xs text-30">{book.chapters.length} 篇笔记</div>
						</div>
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
	{:else}
		<div class="card-base flex min-h-56 flex-col items-center justify-center px-6 text-center">
			<Icon icon="material-symbols:menu-book-outline-rounded" width="36" class="text-30" />
			<p class="mt-3 font-medium text-75">没有找到匹配的书籍</p>
			<p class="mt-1 text-sm text-50">换一个关键词或清除分类筛选。</p>
		</div>
	{/if}
</section>
