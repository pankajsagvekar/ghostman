import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit()
	],
	clearScreen: false,
	server: {
		port: 1420,
		strictPort: true,
		host: process.env.TAURI_DEV_HOST || false,
		hmr: process.env.TAURI_DEV_HOST
			? {
					protocol: 'ws',
					host: process.env.TAURI_DEV_HOST,
					port: 1422
				}
			: undefined,
		watch: {
			// 3. tell vite to ignore watching `src-tauri`
			ignored: ['**/src-tauri/**']
		}
	}
});
