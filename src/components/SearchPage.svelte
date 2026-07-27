<script lang="ts">
import Icon from "@iconify/svelte";
import { onMount } from "svelte";

export interface SearchRecord {
	title: string;
	description: string;
	url: string;
	type: string;
	keywords: string;
}

export let records: SearchRecord[] = [];

let query = "";
let results: SearchRecord[] = [];
let loading = false;
let pagefindReady = false;
let requestId = 0;

function fallbackSearch(value: string) {
	const needle = value.trim().toLocaleLowerCase();
	if (!needle) return [];
	return records
		.filter((record) =>
			`${record.title} ${record.description} ${record.keywords}`
				.toLocaleLowerCase()
				.includes(needle),
		)
		.slice(0, 40);
}

async function runSearch(value: string) {
	const currentRequest = ++requestId;
	const keyword = value.trim();
	if (!keyword) {
		results = [];
		return;
	}

	loading = true;
	if (pagefindReady && window.pagefind) {
		try {
			const response = await window.pagefind.search(keyword);
			const entries = await Promise.all(
				response.results.slice(0, 40).map((result) => result.data()),
			);
			if (currentRequest === requestId) {
				results = entries.map((entry) => ({
					title: entry.meta.title || "未命名内容",
					description: entry.excerpt.replace(/<[^>]+>/g, ""),
					url: entry.url,
					type: "全文",
					keywords: "",
				}));
			}
		} catch {
			if (currentRequest === requestId) results = fallbackSearch(keyword);
		}
	} else if (currentRequest === requestId) {
		results = fallbackSearch(keyword);
	}
	if (currentRequest === requestId) loading = false;
}

onMount(() => {
	pagefindReady = Boolean(window.pagefind?.search);
	const ready = () => {
		pagefindReady = true;
		if (query) runSearch(query);
	};
	document.addEventListener("pagefindready", ready);
	return () => document.removeEventListener("pagefindready", ready);
});

$: runSearch(query);
</script>

<section class="card-base overflow-hidden">
	<header class="border-b border-[var(--line-divider)] px-6 py-7 md:px-8">
		<p class="text-sm font-semibold text-[var(--primary)]">SEARCH</p>
		<h1 class="mt-1 text-2xl font-bold text-90 md:text-3xl">全站搜索</h1>
		<label class="mt-5 flex h-12 items-center gap-3 rounded-lg bg-[var(--btn-plain-bg-hover)] px-4">
			<Icon icon="material-symbols:search-rounded" width="24" class="shrink-0 text-30" />
			<input
				bind:value={query}
				autofocus
				placeholder="搜索文章、书籍、章节与晨读"
				class="h-full min-w-0 flex-1 bg-transparent text-base text-75 outline-none placeholder:text-30"
			/>
			{#if loading}
				<Icon icon="material-symbols:progress-activity" width="20" class="animate-spin text-30" />
			{/if}
		</label>
	</header>

	{#if query.trim()}
		<div class="flex items-center justify-between px-6 py-4 text-sm text-50 md:px-8">
			<span>“{query.trim()}”</span>
			<span>{results.length} 条结果</span>
		</div>
		<div class="divide-y divide-[var(--line-divider)] border-t border-[var(--line-divider)]">
			{#each results as result}
				<a href={result.url} class="group block px-6 py-5 transition hover:bg-[var(--btn-plain-bg-hover)] md:px-8">
					<div class="flex items-center gap-3">
						<span class="rounded-md bg-[var(--btn-regular-bg)] px-2 py-1 text-xs font-medium text-[var(--primary)]">{result.type}</span>
						<h2 class="min-w-0 flex-1 truncate font-semibold text-75 transition group-hover:text-[var(--primary)]">{result.title}</h2>
						<Icon icon="material-symbols:chevron-right-rounded" width="22" class="shrink-0 text-30" />
					</div>
					{#if result.description}
						<p class="mt-2 line-clamp-2 text-sm leading-6 text-50">{result.description}</p>
					{/if}
				</a>
			{:else}
				<p class="px-6 py-10 text-center text-sm text-50">没有找到匹配内容</p>
			{/each}
		</div>
	{:else}
		<p class="px-6 py-12 text-center text-sm text-50">输入关键词开始检索</p>
	{/if}
</section>
