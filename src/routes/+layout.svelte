<script lang="ts">
	import { 
		Search, 
		Plus, 
		History, 
		Folder, 
		Settings, 
		Zap, 
		Box, 
		ChevronDown,
		Activity,
		Menu,
		X,
		LayoutGrid,
		MoreHorizontal
	} from 'lucide-svelte';
	import '../app.css';

	let { children } = $props();
	let searchQuery = $state('');
	let isSidebarOpen = $state(true); // Default open for desktop

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
		'GET': 'text-get',
		'POST': 'text-post',
		'PUT': 'text-put',
		'PATCH': 'text-patch',
		'DELETE': 'text-delete',
		'default': 'text-surface-500'
	};
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" />
	<title>Ghostman | Pro API Client</title>
</svelte:head>

<div class="flex h-screen overflow-hidden bg-base-dark font-sans text-surface-200">
	<!-- Sidebar Overlay (Mobile) -->
	{#if !isSidebarOpen}
		<div class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden pointer-events-none opacity-0"></div>
	{/if}

	<!-- Sidebar -->
	<aside class="
		fixed inset-y-0 left-0 z-50 w-64 transform bg-base-sidebar border-r border-base-border transition-all duration-300 ease-in-out lg:relative lg:translate-x-0
		{!isSidebarOpen ? '-translate-x-full lg:w-0 lg:opacity-0' : 'translate-x-0'}
		flex flex-col
	">
		<!-- Sidebar Header -->
		<div class="flex items-center justify-between p-4 border-b border-base-border">
			<div class="flex items-center gap-2.5">
				<div class="bg-primary-500/20 p-1.5 rounded-md">
					<Zap class="text-primary-500 fill-current" size={16} />
				</div>
				<div class="flex flex-col">
					<span class="text-xs font-bold tracking-tight uppercase text-white">Ghostman</span>
					<span class="text-[8px] font-bold text-surface-500 uppercase tracking-widest leading-none">Pro API Client</span>
				</div>
			</div>
			<button onclick={toggleSidebar} class="p-1 hover:bg-base-hover rounded-md text-surface-400">
				<X size={16} />
			</button>
		</div>

		<!-- Search & New -->
		<div class="px-3 py-4 space-y-3">
			<div class="flex items-center gap-2">
				<div class="relative flex-1 group">
					<Search class="absolute left-2.5 top-1/2 -translate-y-1/2 text-surface-500 group-focus-within:text-primary-500 transition-colors" size={12} />
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Search collections..."
						class="w-full pl-8 pr-3 py-1.5 bg-base-charcoal border border-base-border rounded-md text-[11px] focus:border-primary-500/50 transition-all placeholder:text-surface-600"
					/>
				</div>
				<button class="p-1.5 bg-blue-600/10 text-blue-500 hover:bg-blue-600/20 rounded-md transition-colors" title="New Collection">
					<Plus size={14} strokeWidth={3} />
				</button>
			</div>
		</div>

		<!-- Navigation Content -->
		<nav class="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
			<div class="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-surface-500 mb-1">
				Collections
			</div>
			
			{#if collections.length > 0}
				{#each collections as collection}
					<div class="group">
						<div class="flex items-center w-full gap-2 px-2 py-1.5 rounded-md hover:bg-base-hover text-surface-300 transition-colors cursor-pointer">
							<ChevronDown size={12} class="text-surface-600" />
							<Folder size={14} class="text-surface-500 group-hover:text-blue-400" />
							<span class="text-[11px] font-medium truncate flex-1">{collection.name}</span>
							<button class="ml-auto opacity-0 group-hover:opacity-100 p-0.5 hover:text-white transition-opacity">
								<MoreHorizontal size={12} />
							</button>
						</div>
						
						<div class="ml-4 mt-0.5 space-y-0.5 border-l border-base-border pl-1">
							{#each collection.items as request}
								<button class="flex items-center w-full gap-2 px-2 py-1.5 rounded-md hover:bg-base-hover text-surface-400 hover:text-surface-200 transition-colors text-left group/req">
									<span class="text-[8px] font-bold w-7 text-center {methodColors[request.method]}">{request.method}</span>
									<span class="text-[11px] truncate">{request.name}</span>
								</button>
							{/each}
						</div>
					</div>
				{/each}
			{:else}
				<div class="py-12 px-6 text-center space-y-3 opacity-40">
					<div class="w-12 h-12 bg-base-charcoal rounded-full flex items-center justify-center mx-auto border border-base-border">
						<Folder size={20} class="text-surface-500" />
					</div>
					<div>
						<p class="text-[11px] font-bold text-surface-300 uppercase tracking-wider">No Collections</p>
						<p class="text-[10px] mt-1 italic">Create a new collection to get started</p>
					</div>
				</div>
			{/if}

			<div class="mt-6 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-surface-500 mb-1">
				Recent History
			</div>
			<div class="py-4 px-4 text-center opacity-40">
				<History size={20} class="mx-auto mb-2" />
				<p class="text-[10px] font-medium">No recent activity</p>
			</div>
		</nav>

		<!-- Sidebar Footer -->
		<div class="p-3 border-t border-base-border space-y-0.5">
			<button class="flex items-center w-full gap-2 px-2 py-2 rounded-md hover:bg-base-hover text-surface-400 hover:text-white transition-colors">
				<Activity size={14} />
				<span class="text-[11px] font-medium">Diagnostics</span>
			</button>
			<button class="flex items-center w-full gap-2 px-2 py-2 rounded-md hover:bg-base-hover text-surface-400 hover:text-white transition-colors">
				<Settings size={14} />
				<span class="text-[11px] font-medium">Settings</span>
			</button>
		</div>
	</aside>

	<!-- Main Content Area -->
	<div class="flex-1 flex flex-col overflow-hidden">
		<header class="h-10 border-b border-base-border bg-base-sidebar flex items-center justify-between px-3 shrink-0">
			<div class="flex items-center gap-3">
				{#if !isSidebarOpen}
					<button onclick={toggleSidebar} class="p-1.5 hover:bg-base-hover rounded-md text-surface-400" aria-label="Open Sidebar">
						<Menu size={16} />
					</button>
				{/if}
				<div class="h-4 w-px bg-base-border mx-1"></div>
				<div class="flex items-center gap-2 hover:bg-base-hover px-2 py-1 rounded-md cursor-pointer transition-colors group">
					<LayoutGrid size={14} class="text-primary-500" />
					<span class="text-[11px] font-bold text-surface-300 group-hover:text-white transition-colors">My Workspace</span>
					<ChevronDown size={10} class="text-surface-600" />
				</div>
			</div>
			
			<div class="flex items-center gap-4">
				<div class="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 text-green-500 rounded-md border border-green-500/20">
					<div class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
					<span class="text-[10px] font-bold uppercase tracking-wider">Online</span>
				</div>
				<div class="w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white border border-white/10 cursor-pointer">
					JS
				</div>
			</div>
		</header>
		
		<main class="flex-1 overflow-hidden bg-base-dark">
			{@render children()}
		</main>
	</div>
</div>
