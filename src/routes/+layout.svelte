<script lang="ts">
	import { AppBar } from '@skeletonlabs/skeleton-svelte';
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="flex min-h-screen flex-col">
	<header class="sticky top-0 z-10">
		<AppBar>
			<AppBar.Toolbar>
				<AppBar.Lead>
					<span class="text-xl font-bold tracking-widest uppercase">Ghostman</span>
				</AppBar.Lead>
			</AppBar.Toolbar>
		</AppBar>
	</header>
	<main class="container mx-auto flex-1 p-4 md:p-8">
		{@render children()}
	</main>
</div>
