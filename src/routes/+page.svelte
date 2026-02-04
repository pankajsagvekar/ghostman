<script lang="ts">
	import { 
		Send, 
		Clock, 
		Settings2,
		Copy,
		Check,
		RotateCcw,
		Activity,
		Box,
		Plus,
		MoreVertical,
		FileCode
	} from 'lucide-svelte';

	// Request State
	let method = $state('GET');
	let url = $state('https://jsonplaceholder.typicode.com/todos/1');
	let requestBody = $state('');
	let responseData = $state<any>(null);
	let responseStatus = $state<number | null>(null);
	let responseTime = $state<number | null>(null);
	let responseSize = $state<string | null>(null);
	let isLoading = $state(false);
	let activeTab = $state('params'); // params, headers, body
	let copied = $state(false);

	const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
	
	const methodColors: Record<string, string> = {
		'GET': 'text-get',
		'POST': 'text-post',
		'PUT': 'text-put',
		'PATCH': 'text-patch',
		'DELETE': 'text-delete',
		'default': 'text-surface-500'
	};

	function copyResponse() {
		if (responseData) {
			navigator.clipboard.writeText(JSON.stringify(responseData, null, 2));
			copied = true;
			setTimeout(() => copied = false, 2000);
		}
	}

	const getStatusText = (status: number) => {
		const texts: Record<number, string> = {
			200: 'OK',
			201: 'Created',
			204: 'No Content',
			400: 'Bad Request',
			401: 'Unauthorized',
			403: 'Forbidden',
			404: 'Not Found',
			500: 'Internal Server Error'
		};
		return texts[status] || '';
	};

	async function sendRequest() {
		isLoading = true;
		responseData = null;
		responseStatus = null;
		responseTime = null;
		responseSize = null;

		const startTime = performance.now();
		try {
			const options: RequestInit = {
				method,
				headers: {
					'Content-Type': 'application/json'
				}
			};

			if (['POST', 'PUT', 'PATCH'].includes(method) && requestBody) {
				options.body = requestBody;
			}

			const response = await fetch(url, options);
			responseStatus = response.status;
			const endTime = performance.now();
			responseTime = Math.round(endTime - startTime);

			const contentType = response.headers.get('content-type');
			const blob = await response.clone().blob();
			responseSize = (blob.size / 1024).toFixed(2) + ' KB';

			if (contentType && contentType.includes('application/json')) {
				responseData = await response.json();
			} else {
				responseData = await response.text();
			}
		} catch (error: any) {
			responseData = { error: error.message };
			responseStatus = 0;
			responseTime = Math.round(performance.now() - startTime);
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="flex flex-col h-full bg-surface-50-950">
	<!-- Request Section (Anchored) -->
	<section class="bg-surface-100-900 border-b border-surface-200-800">
		<div class="p-4 space-y-4">
			<div class="flex flex-col sm:flex-row gap-2">
				<div class="flex flex-1 items-center bg-surface-200-800/40 border border-surface-300-700/50 rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-primary-500/30 transition-all">
					<select 
						bind:value={method} 
						class="select bg-transparent border-none focus:ring-0 w-20 sm:w-24 px-2 sm:px-3 py-2 text-[11px] sm:text-xs font-bold cursor-pointer {methodColors[method] || methodColors.default}"
					>
						{#each methods as m}
							<option value={m} class="text-surface-900-100 font-bold bg-surface-100-900">{m}</option>
						{/each}
					</select>
					<div class="h-4 w-px bg-surface-300-700/50"></div>
					<input
						type="text"
						bind:value={url}
						placeholder="https://api.example.com/v1/resource"
						class="input bg-transparent border-none focus:ring-0 flex-1 px-3 py-2 text-[11px] sm:text-xs font-medium"
					/>
				</div>

				<button 
					onclick={sendRequest} 
					disabled={isLoading} 
					class="btn bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 sm:py-2 rounded-md font-bold text-xs transition-colors disabled:opacity-50"
				>
					{#if isLoading}
						<RotateCcw class="animate-spin mr-2" size={14} />
						Sending...
					{:else}
						Send
					{/if}
				</button>
			</div>

			<!-- Tabs -->
			<div class="border-b border-surface-200-800 overflow-x-auto custom-scrollbar">
				<div class="flex gap-4 min-w-max">
					{#each ['params', 'auth', 'headers', 'body', 'scripts'] as tab}
						<button 
							onclick={() => (activeTab = tab)} 
							class="pb-2 text-[11px] font-bold uppercase tracking-wider transition-all relative {activeTab === tab ? 'text-primary-500' : 'text-surface-500 hover:text-surface-700'}"
						>
							{tab}
							{#if activeTab === tab}
								<div class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"></div>
							{/if}
						</button>
					{/each}
				</div>
			</div>

			<div class="min-h-[140px] bg-surface-200-800/20 rounded-md border border-surface-300-700/30 p-3 sm:p-4 mb-1">
				{#if activeTab === 'params'}
					<div class="flex items-center gap-2 opacity-40 italic text-xs">
						<Plus size={14} />
						<span>New parameter...</span>
					</div>
				{:else if activeTab === 'auth'}
					<div class="flex flex-col h-full space-y-4">
						<div class="flex items-center gap-3">
							<span class="text-[10px] font-bold uppercase tracking-widest text-surface-500">Type</span>
							<select class="select bg-surface-200-800 border-surface-300-700/50 rounded px-2 py-1 text-[11px] font-semibold focus:ring-1 focus:ring-primary-500/50 outline-none w-48">
								<option>No Auth</option>
								<option>API Key</option>
								<option>Bearer Token</option>
								<option>Basic Auth</option>
							</select>
						</div>
						<div class="p-3 border border-dashed border-surface-300-700/50 rounded-md bg-surface-50-950/20">
							<p class="text-[11px] text-surface-500 leading-relaxed italic opacity-60">This request does not use any authorization. Select a type and configure it to enable authorization.</p>
						</div>
					</div>
				{:else if activeTab === 'headers'}
					<div class="space-y-2">
						<div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs font-mono opacity-80">
							<span class="w-full sm:w-32 text-primary-500">Content-Type</span>
							<span>application/json</span>
						</div>
					</div>
				{:else if activeTab === 'body'}
					<textarea
						bind:value={requestBody}
						placeholder="&#123; &#125;"
						class="textarea bg-transparent border-none focus:ring-0 w-full font-mono text-xs p-0 resize-none min-h-[120px]"
					></textarea>
				{:else if activeTab === 'scripts'}
					<div class="flex flex-col h-full opacity-40 italic text-xs space-y-2">
						<div class="flex items-center gap-2">
							<FileCode size={14} />
							<span>Post-request Scripts</span>
						</div>
						<p class="text-[10px] non-italic opacity-60">Scripts defined here will execute after the request completes.</p>
					</div>
				{/if}
			</div>
		</div>
	</section>

	<!-- Response Section (Anchored & Filling) -->
	<section class="flex-1 bg-surface-100-900 flex flex-col min-h-0">
		<div class="px-3 sm:px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-200-800 bg-surface-50-950/30">
			<div class="flex items-center gap-3 sm:gap-4">
				<span class="text-[11px] font-bold uppercase tracking-wider text-surface-500">Response</span>
				
				{#if responseStatus !== null}
					<div class="flex items-center gap-2 sm:gap-3 border-l border-surface-200-800 pl-3 sm:pl-4">
						<div class="status-badge-pro"
							style:background-color={responseStatus >= 200 && responseStatus < 300 ? 'rgba(74, 222, 128, 0.15)' : 'rgba(248, 113, 113, 0.15)'}
							style:color={responseStatus >= 200 && responseStatus < 300 ? '#4ade80' : '#f87171'}
							style:border-color={responseStatus >= 200 && responseStatus < 300 ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)'}
						>
							{responseStatus} <span class="hidden xs:inline">{getStatusText(responseStatus)}</span>
						</div>
						
						<div class="flex items-center gap-2 sm:gap-3 text-[10px] font-semibold text-surface-500">
							<span class="flex items-center gap-1">
								<Clock size={10} />
								{responseTime} ms
							</span>
							<span class="flex items-center gap-1">
								<Box size={10} />
								{responseSize}
							</span>
						</div>
					</div>
				{/if}
			</div>

			<div class="flex items-center justify-end gap-2">
				{#if responseData}
					<button onclick={copyResponse} class="p-1.5 hover:bg-surface-200-800 rounded text-surface-400 hover:text-primary-500 transition-colors">
						{#if copied}
							<Check size={14} class="text-success-500" />
						{:else}
							<Copy size={14} />
						{/if}
					</button>
				{/if}
			</div>
		</div>

		<div class="flex-1 overflow-auto custom-scrollbar bg-surface-100-900">
			{#if responseData}
				<div class="p-4">
					<pre class="font-mono text-[10px] sm:text-xs leading-relaxed text-surface-700-300">
						{typeof responseData === 'object' ? JSON.stringify(responseData, null, 2) : responseData}
					</pre>
				</div>
			{:else if isLoading}
				<div class="flex flex-col items-center justify-center h-full space-y-3">
					<RotateCcw class="animate-spin text-primary-500" size={24} />
					<p class="text-[10px] font-bold uppercase tracking-widest text-surface-500">Executing request...</p>
				</div>
			{:else}
				<div class="flex flex-col items-center justify-center h-full opacity-30 space-y-2">
					<FileCode size={44} strokeWidth={1} />
					<p class="text-[10px] sm:text-xs font-bold uppercase tracking-wider">No response recorded</p>
				</div>
			{/if}
		</div>
	</section>
</div>


