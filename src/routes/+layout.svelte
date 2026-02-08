<script lang="ts">
	import { Search, Plus, History, Folder, Settings, Zap, Box, ChevronDown, Activity, Menu, X, LayoutGrid, MoreHorizontal } from 'lucide-svelte';
	import '../app.css';

	let { children } = $props();
	let searchQuery = $state('');
	let isSidebarOpen = $state(true); // Default
	let zoomLevel = $state(1);

	// Handle initial mobile state and load settings
	$effect(() => {
		if (window.innerWidth < 1024) isSidebarOpen = false;

		const savedZoom = localStorage.getItem('zoomLevel');
		if (savedZoom) zoomLevel = parseFloat(savedZoom);
	});

	// Persist zoom setting
	$effect(() => {
		localStorage.setItem('zoomLevel', zoomLevel.toString());
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.ctrlKey || e.metaKey) {
			if (e.key === '=' || e.key === '+') {
				e.preventDefault();
				zoomLevel = Math.min(zoomLevel + 0.1, 2);
			} else if (e.key === '-') {
				e.preventDefault();
				zoomLevel = Math.max(zoomLevel - 0.1, 0.5);
			} else if (e.key === '0') {
				e.preventDefault();
				zoomLevel = 1;
			}
		}
	}

	let sidebarWidth = $state(256);
	let isResizing = $state(false);

	function startResizing(e: MouseEvent) {
		e.preventDefault();
		isResizing = true;
	}

	function stopResizing() {
		isResizing = false;
	}

	function handleMousemove(e: MouseEvent) {
		if (isResizing) {
			const newWidth = e.clientX / zoomLevel;
			if (newWidth > 160 && newWidth < 500) {
				sidebarWidth = newWidth;
			}
		}
	}

	$effect(() => {
		const savedWidth = localStorage.getItem('sidebarWidth');
		if (savedWidth) sidebarWidth = parseInt(savedWidth);
	});

	$effect(() => {
		if (!isResizing) {
			localStorage.setItem('sidebarWidth', sidebarWidth.toString());
		}
	});

	// Types
	interface RequestItem {
		id: string;
		name: string;
		method: string;
	}

	interface Collection {
		id: string;
		name: string;
		items: RequestItem[];
	}

	// Mock data for collections
	let collections = $state<Collection[]>([]);

	function toggleSidebar() {
		isSidebarOpen = !isSidebarOpen;
	}

	const methodColors: Record<string, string> = {
		GET: 'text-get',
		POST: 'text-post',
		PUT: 'text-put',
		PATCH: 'text-patch',
		DELETE: 'text-delete',
		default: 'text-surface-500'
	};
</script>

<svelte:window onkeydown={handleKeydown} onmousemove={handleMousemove} onmouseup={stopResizing} />

<svelte:head>
	<link rel="icon" href="/favicon.svg" />
	<title>Ghostman | Pro API Client</title>
</svelte:head>

<div class="flex h-screen overflow-hidden bg-base-dark font-sans text-surface-200" style:zoom={zoomLevel}>
	<!-- Sidebar Overlay (Mobile) -->
	{#if isSidebarOpen}
		<button onclick={toggleSidebar} class="pointer-events-auto fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-all duration-300 lg:hidden" aria-label="Close Sidebar"></button>
	{/if}

	<aside
		class="
		fixed inset-y-0 left-0 z-50 transform border-r border-base-border bg-base-sidebar transition-all duration-300 ease-in-out lg:relative lg:translate-x-0
		{!isSidebarOpen ? '-translate-x-full lg:w-0' : 'translate-x-0'}
		flex flex-col overflow-hidden shadow-2xl lg:shadow-none
	"
		style:width={isSidebarOpen ? `${sidebarWidth}px` : '0'}
		style:opacity={isSidebarOpen ? '1' : '0'}
		style:max-width="85vw"
	>
		<!-- Resize Handle -->
		<div
			role="separator"
			aria-orientation="vertical"
			onmousedown={startResizing}
			class="absolute top-0 -right-1 z-10 h-full w-2 cursor-col-resize transition-colors hover:bg-primary-500/50"
			class:bg-primary-500={isResizing}
		></div>
		<!-- Sidebar Header -->
		<div class="flex items-center justify-between border-b border-base-border p-4">
			<div class="flex items-center gap-2.5">
				<div class="rounded-md bg-primary-500/20 p-1.5">
					<Zap class="fill-current text-primary-500" size={16} />
				</div>
				<div class="flex flex-col">
					<span class="text-xs font-bold tracking-tight text-white uppercase">Ghostman</span>
					<span class="text-[8px] leading-none font-bold tracking-widest text-surface-500 uppercase">Pro API Client</span>
				</div>
			</div>
			<button onclick={toggleSidebar} class="rounded-md p-1 text-surface-400 hover:bg-base-hover">
				<X size={16} />
			</button>
		</div>

		<!-- Search & New -->
		<div class="space-y-3 px-3 py-4">
			<div class="flex items-center gap-2">
				<div class="group relative flex-1">
					<Search class="absolute top-1/2 left-2.5 -translate-y-1/2 text-surface-500 transition-colors group-focus-within:text-primary-500" size={12} />
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Search collections..."
						class="w-full rounded-md border border-base-border bg-base-charcoal py-1.5 pr-3 pl-8 text-[11px] transition-all placeholder:text-surface-600 focus:border-primary-500/50"
					/>
				</div>
				<button class="rounded-md bg-blue-600/10 p-1.5 text-blue-500 transition-colors hover:bg-blue-600/20" title="New Collection">
					<Plus size={14} strokeWidth={3} />
				</button>
			</div>
		</div>

		<!-- Navigation Content -->
		<nav class="custom-scrollbar flex-1 space-y-1 overflow-y-auto px-2">
			<div class="mb-1 px-2 py-1 text-[9px] font-bold tracking-wider text-surface-500 uppercase">Collections</div>

			{#if collections.length > 0}
				{#each collections as collection}
					<div class="group">
						<div class="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-surface-300 transition-colors hover:bg-base-hover">
							<ChevronDown size={12} class="text-surface-600" />
							<Folder size={14} class="text-surface-500 group-hover:text-blue-400" />
							<span class="flex-1 truncate text-[11px] font-medium">{collection.name}</span>
							<button class="ml-auto p-0.5 opacity-0 transition-opacity group-hover:opacity-100 hover:text-white">
								<MoreHorizontal size={12} />
							</button>
						</div>

						<div class="mt-0.5 ml-4 space-y-0.5 border-l border-base-border pl-1">
							{#each collection.items as request}
								<button class="group/req flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-surface-400 transition-colors hover:bg-base-hover hover:text-surface-200">
									<span class="w-7 text-center text-[8px] font-bold {methodColors[request.method]}">{request.method}</span>
									<span class="truncate text-[11px]">{request.name}</span>
								</button>
							{/each}
						</div>
					</div>
				{/each}
			{:else}
				<div class="space-y-3 px-6 py-12 text-center opacity-40">
					<div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-base-border bg-base-charcoal">
						<Folder size={20} class="text-surface-500" />
					</div>
					<div>
						<p class="text-[11px] font-bold tracking-wider text-surface-300 uppercase">No Collections</p>
						<p class="mt-1 text-[10px] italic">Create a new collection to get started</p>
					</div>
				</div>
			{/if}

			<div class="mt-6 mb-1 px-2 py-1 text-[9px] font-bold tracking-wider text-surface-500 uppercase">Recent History</div>
			<div class="px-4 py-4 text-center opacity-40">
				<History size={20} class="mx-auto mb-2" />
				<p class="text-[10px] font-medium">No recent activity</p>
			</div>
		</nav>

		<!-- Sidebar Footer -->
		<div class="space-y-0.5 border-t border-base-border p-3">
			<button class="flex w-full items-center gap-2 rounded-md px-2 py-2 text-surface-400 transition-colors hover:bg-base-hover hover:text-white">
				<Activity size={14} />
				<span class="text-[11px] font-medium">Diagnostics</span>
			</button>
			<button class="flex w-full items-center gap-2 rounded-md px-2 py-2 text-surface-400 transition-colors hover:bg-base-hover hover:text-white">
				<Settings size={14} />
				<span class="text-[11px] font-medium">Settings</span>
			</button>
		</div>
	</aside>

	<!-- Main Content Area -->
	<div class="flex flex-1 flex-col overflow-hidden">
		<header class="flex h-10 shrink-0 items-center justify-between border-b border-base-border bg-base-sidebar px-3">
			<div class="flex items-center gap-3">
				{#if !isSidebarOpen}
					<button onclick={toggleSidebar} class="rounded-md p-1.5 text-surface-400 hover:bg-base-hover" aria-label="Open Sidebar">
						<Menu size={16} />
					</button>
				{/if}
				<div class="mx-1 h-4 w-px bg-base-border"></div>
				<div class="group flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-base-hover">
					<LayoutGrid size={14} class="text-primary-500" />
					<span class="text-[11px] font-bold text-surface-300 transition-colors group-hover:text-white">My Workspace</span>
					<ChevronDown size={10} class="text-surface-600" />
				</div>
			</div>
		</header>

		<main class="flex-1 overflow-hidden bg-base-dark">
			{@render children()}
		</main>
	</div>
</div>
