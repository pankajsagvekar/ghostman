<script lang="ts">
	import { invoke } from '@tauri-apps/api/core';

	let name = $state('');
	let greetMsg = $state('');

	async function greet(event: Event) {
		event.preventDefault();
		greetMsg = await invoke('greet', { name });
	}
</script>

<main class="mx-auto flex max-w-2xl flex-col items-center justify-center space-y-8">
	<div class="space-y-4 text-center">
		<h1 class="h1">Welcome to Ghostman</h1>
		<p class="opacity-60">Build desktop apps with Tauri, SvelteKit, and Skeleton UI.</p>
	</div>

	<div class="flex justify-center gap-4 py-4">
		<a href="https://vite.dev" target="_blank" class="transition-transform hover:scale-110">
			<img src="https://vitejs.dev/logo.svg" class="h-16 w-16" alt="Vite Logo" />
		</a>
		<a href="https://tauri.app" target="_blank" class="transition-transform hover:scale-110">
			<img src="https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/tauri-icon.png" class="h-16 w-16" alt="Tauri Logo" />
		</a>
		<a href="https://svelte.dev" target="_blank" class="transition-transform hover:scale-110">
			<img src="https://svelte.dev/svelte-logo.svg" class="h-16 w-auto" alt="SvelteKit Logo" />
		</a>
	</div>

	<section class="card bg-surface-100-900 border-surface-200-800 w-full space-y-4 border p-6 shadow-xl">
		<p class="text-center font-semibold capitalize">test tauri API</p>

		<form class="flex flex-col gap-3 sm:flex-row" onsubmit={greet}>
			<input id="greet-input" class="input flex-1" type="text" placeholder="Enter a name..." bind:value={name} />
			<button class="btn preset-filled-primary-500 font-bold" type="submit"> Greet </button>
		</form>

		{#if greetMsg}
			<div class="rounded-container-token bg-primary-500/10 border-primary-500/20 animate-pulse border p-4 text-center">
				<p class="text-primary-500 font-bold capitalize">{greetMsg}</p>
			</div>
		{/if}
	</section>

	<footer class="py-8 text-sm capitalize opacity-40">Ghostman is coming...</footer>
</main>
