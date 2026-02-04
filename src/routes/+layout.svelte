<script lang="ts">
	import { AppBar } from '@skeletonlabs/skeleton-svelte';
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
		X
	} from 'lucide-svelte';
	import '../app.css';

	let { children } = $props();
	let searchQuery = $state('');
	let isSidebarOpen = $state(false);

	function toggleSidebar() {
		isSidebarOpen = !isSidebarOpen;
	}
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" />
	<title>Ghostman | Pro API Client</title>
</svelte:head>

<div class="flex h-screen overflow-hidden bg-surface-50-950 font-sans text-surface-900-100">
	<!-- Sidebar Overlay (Mobile) -->
	{#if isSidebarOpen}
		<button 
			onclick={() => (isSidebarOpen = false)}
			class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
			aria-label="Close Sidebar"
		></button>
	{/if}

	<!-- Sidebar -->
	<aside class="
		fixed inset-y-0 left-0 z-50 w-64 transform bg-surface-100-900 border-r border-surface-200-800 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
		{isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
		flex flex-col
	">
		<!-- Sidebar Header -->
		<div class="flex items-center justify-between p-4 border-b border-surface-200-800 bg-surface-50-950/50">
			<div class="flex items-center gap-3">
				<div class="bg-primary-500/10 p-1.5 rounded-lg">
					<Zap class="text-primary-500 fill-current" size={18} />
				</div>
				<div class="flex flex-col">
					<span class="text-sm font-bold tracking-tight uppercase">Ghostman</span>
					<span class="text-[9px] font-bold text-surface-500 uppercase tracking-widest leading-none">Desktop</span>
				</div>
			</div>
			<button onclick={() => (isSidebarOpen = false)} class="p-1 hover:bg-surface-200-800 rounded-md lg:hidden">
				<X size={18} />
			</button>
		</div>

		<!-- Search Bar -->
		<div class="px-3 py-4">
			<div class="relative group">
				<Search class="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={14} />
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search collections..."
					class="w-full pl-9 pr-3 py-1.5 bg-surface-200-800/40 border border-surface-300-700/30 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary-500/50 transition-all placeholder:opacity-50"
				/>
			</div>
		</div>

		<!-- Navigation -->
		<nav class="flex-1 overflow-y-auto px-2 py-2 space-y-0.5 custom-scrollbar">
			<div class="flex items-center justify-between px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-surface-500">
				<span>Collections</span>
				<button class="p-0.5 hover:bg-surface-200-800 rounded text-primary-500 transition-colors" title="New Collection">
					<Plus size={14} />
				</button>
			</div>
			
			<button class="flex items-center w-full gap-2 px-2 py-2 rounded-lg hover:bg-surface-200-800 text-surface-700-300 transition-colors group">
				<Folder size={14} class="text-surface-400 group-hover:text-primary-500" />
				<span class="text-xs font-semibold">Example API</span>
				<ChevronDown size={12} class="ml-auto opacity-30" />
			</button>

			<div class="mt-6 flex items-center justify-between px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-surface-500">
				<span>History</span>
				<History size={12} />
			</div>
			<div class="py-8 px-4 text-center">
				<p class="text-[10px] text-surface-500 font-medium opacity-60">No recent history</p>
			</div>
		</nav>

		<!-- Sidebar Footer -->
		<div class="p-3 border-t border-surface-200-800 space-y-1">
			<button class="flex items-center w-full gap-2 px-2 py-2 rounded-lg hover:bg-surface-200-800 text-[11px] font-semibold transition-colors group">
				<Activity size={14} class="text-surface-400 group-hover:text-success-500" />
				<span class="opacity-70 group-hover:opacity-100">Diagnostics</span>
			</button>
			<button class="flex items-center w-full gap-2 px-2 py-2 rounded-lg hover:bg-surface-200-800 text-[11px] font-semibold transition-colors group">
				<Settings size={14} class="text-surface-400 group-hover:text-primary-500" />
				<span class="opacity-70 group-hover:opacity-100">Settings</span>
			</button>
		</div>
	</aside>

	<!-- Main Content Area -->
	<div class="flex-1 flex flex-col overflow-hidden bg-surface-50-950">
		<header class="z-10 bg-surface-50-950 border-b border-surface-200-800">
			<AppBar>
				<AppBar.Toolbar>
					<AppBar.Lead>
						<div class="flex items-center gap-4 px-4">
							<button onclick={toggleSidebar} class="p-2 hover:bg-surface-200-800 rounded-lg lg:hidden" aria-label="Toggle Menu">
								<Menu size={20} />
							</button>
							<div class="flex flex-col">
								<span class="text-[9px] font-bold uppercase tracking-widest text-primary-500 leading-none mb-1">Active Space</span>
								<button class="text-xs font-bold flex items-center gap-1.5 hover:text-primary-500 transition-colors">
									Production <ChevronDown size={10} class="opacity-40" />
								</button>
							</div>
						</div>
					</AppBar.Lead>
					<AppBar.Trail>
						<div class="px-4">
							<!-- Place for user account or other global actions if needed -->
						</div>
					</AppBar.Trail>
				</AppBar.Toolbar>
			</AppBar>
		</header>
		
		<main class="flex-1 overflow-hidden">
			<div class="h-full">
				{@render children()}
			</div>
		</main>
	</div>
</div>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 6px;
		height: 6px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: rgba(var(--color-surface-500), 0.1);
		border-radius: 10px;
		transition: all 0.3s;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: rgba(var(--color-primary-500), 0.3);
	}
</style>
