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
		FileCode,
		Save,
		Trash2,
		ChevronDown,
		ShieldCheck
	} from 'lucide-svelte';

	// Request State
	let method = $state('GET');
	let url = $state('https://jsonplaceholder.typicode.com/todos/1');
	let env = $state('Production');
	
	// Complex state for tables
	let params = $state([
		{ id: crypto.randomUUID(), key: '', value: '', description: '', enabled: true }
	]);
	let headers = $state([
		{ id: crypto.randomUUID(), key: 'Content-Type', value: 'application/json', description: '', enabled: true },
		{ id: crypto.randomUUID(), key: '', value: '', description: '', enabled: true }
	]);
	
	let bodyType = $state('json'); // none, json, formdata, raw
	let requestBody = $state('');
	
	let responseData = $state<any>(null);
	let responseStatus = $state<number | null>(null);
	let responseTime = $state<number | null>(null);
	let responseSize = $state<string | null>(null);
	let isLoading = $state(false);
	let activeTab = $state('params'); 
	let activeResponseTab = $state('body');
	let copied = $state(false);

	const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
	const environments = ['Production', 'Staging', 'Local Dev', 'QA'];
	
	const methodColors: Record<string, string> = {
		'GET': 'text-get',
		'POST': 'text-post',
		'PUT': 'text-put',
		'PATCH': 'text-patch',
		'DELETE': 'text-delete',
		'default': 'text-surface-500'
	};

	function addRow(type: 'params' | 'headers') {
		const newRow = { id: crypto.randomUUID(), key: '', value: '', description: '', enabled: true };
		if (type === 'params') params = [...params, newRow];
		else headers = [...headers, newRow];
	}

	function removeRow(type: 'params' | 'headers', id: string) {
		if (type === 'params') {
			if (params.length > 1) params = params.filter(p => p.id !== id);
		} else {
			if (headers.length > 1) headers = headers.filter(h => h.id !== id);
		}
	}

	function copyResponse() {
		if (responseData) {
			navigator.clipboard.writeText(JSON.stringify(responseData, null, 2));
			copied = true;
			setTimeout(() => copied = false, 2000);
		}
	}

	async function sendRequest() {
		isLoading = true;
		responseData = null;
		responseStatus = null;
		responseTime = null;
		responseSize = null;

		const startTime = performance.now();
		try {
			// Basic mock fetch for demonstration
			const options: RequestInit = {
				method,
				headers: {
					'Content-Type': 'application/json'
				}
			};

			if (['POST', 'PUT', 'PATCH'].includes(method) && requestBody) {
				options.body = requestBody;
			}

			const response = await fetch(url.startsWith('http') ? url : `https://${url}`, options);
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

	const getStatusColor = (status: number) => {
		if (status >= 200 && status < 300) return 'text-get bg-get/10 border-get/20';
		if (status >= 400) return 'text-delete bg-delete/10 border-delete/20';
		return 'text-put bg-put/10 border-put/20';
	};
</script>

<div class="flex flex-col h-full bg-base-dark">
	<!-- Top Request Bar -->
	<div class="p-3 border-b border-base-border bg-base-charcoal">
		<div class="flex gap-2 max-w-full">
			<div class="flex flex-1 items-center bg-base-dark border border-base-border rounded-md overflow-hidden focus-within:border-primary-500/50 transition-all">
				<select 
					bind:value={method} 
					class="bg-transparent border-none text-[11px] font-bold px-3 py-2 cursor-pointer outline-none {methodColors[method]}"
				>
					{#each methods as m}
						<option value={m} class="bg-base-sidebar text-white">{m}</option>
					{/each}
				</select>
				<div class="h-4 w-px bg-base-border mx-1"></div>
				<input
					type="text"
					bind:value={url}
					placeholder="Enter request URL"
					class="flex-1 bg-transparent border-none text-[11px] px-3 py-2 text-surface-200 outline-none"
				/>
				<div class="h-4 w-px bg-base-border mx-1"></div>
				<select 
					bind:value={env} 
					class="bg-transparent border-none text-[10px] font-bold px-3 py-2 text-surface-500 hover:text-white cursor-pointer outline-none transition-colors"
				>
					{#each environments as e}
						<option value={e} class="bg-base-sidebar text-white">{e}</option>
					{/each}
				</select>
			</div>

			<button 
				onclick={sendRequest}
				disabled={isLoading}
				class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-[11px] font-bold flex items-center gap-2 transition-all disabled:opacity-50"
			>
				{#if isLoading}
					<RotateCcw size={14} class="animate-spin" />
					<span>Sending...</span>
				{:else}
					<Send size={14} />
					<span>Send</span>
				{/if}
			</button>
			
			<button class="px-3 py-2 bg-base-hover text-surface-300 hover:text-white rounded-md text-[11px] font-bold flex items-center gap-2 transition-all border border-base-border">
				<Save size={14} />
				<span>Save</span>
			</button>
		</div>
	</div>

	<!-- Request Builder Tabs -->
	<div class="flex-1 flex flex-col min-h-0 bg-base-dark">
		<div class="px-4 pt-2 border-b border-base-border flex items-center gap-6 bg-base-charcoal/30">
			{#each ['Params', 'Authorization', 'Headers', 'Body', 'Tests'] as tab}
				<button 
					onclick={() => activeTab = tab.toLowerCase()}
					class="pb-2 text-[10px] font-bold uppercase tracking-wider transition-all relative {activeTab === tab.toLowerCase() ? 'text-blue-500' : 'text-surface-500 hover:text-surface-300'}"
				>
					{tab}
					{#if activeTab === tab.toLowerCase()}
						<div class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
					{/if}
				</button>
			{/each}
		</div>

		<div class="flex-1 overflow-auto p-4 custom-scrollbar">
			{#if activeTab === 'params' || activeTab === 'headers'}
				<div class="border border-base-border rounded-lg overflow-hidden border-collapse mb-10">
					<table class="w-full text-left text-[11px]">
						<thead class="bg-base-charcoal/50 text-surface-500 border-b border-base-border font-bold uppercase tracking-tighter">
							<tr>
								<th class="p-2 w-8 text-center border-r border-base-border"></th>
								<th class="p-2 border-r border-base-border">Key</th>
								<th class="p-2 border-r border-base-border">Value</th>
								<th class="p-2 border-r border-base-border">Description</th>
								<th class="p-2 w-10"></th>
							</tr>
						</thead>
						<tbody class="divide-y divide-base-border">
							{#each (activeTab === 'params' ? params : headers) as row}
								<tr class="hover:bg-base-hover/50 group transition-colors">
									<td class="p-1 border-r border-base-border text-center">
										<input type="checkbox" bind:checked={row.enabled} class="accent-blue-500 opacity-40 group-hover:opacity-100 transition-opacity" />
									</td>
									<td class="p-0 border-r border-base-border">
										<input type="text" bind:value={row.key} class="w-full bg-transparent border-none p-2 text-surface-200 focus:bg-base-charcoal/50 outline-none placeholder:text-surface-700" placeholder="Key" />
									</td>
									<td class="p-0 border-r border-base-border">
										<input type="text" bind:value={row.value} class="w-full bg-transparent border-none p-2 text-surface-200 focus:bg-base-charcoal/50 outline-none placeholder:text-surface-700" placeholder="Value" />
									</td>
									<td class="p-0 border-r border-base-border">
										<input type="text" bind:value={row.description} class="w-full bg-transparent border-none p-2 text-surface-200 focus:bg-base-charcoal/50 outline-none placeholder:text-surface-700" placeholder="Description" />
									</td>
									<td class="p-1 text-center">
										<button onclick={() => removeRow(activeTab === 'params' ? 'params' : 'headers', row.id)} class="text-surface-600 hover:text-red-500 opacity-0 group-hover:opacity-100 p-1 transition-all">
											<Trash2 size={12} />
										</button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
					<button onclick={() => addRow(activeTab === 'params' ? 'params' : 'headers')} class="w-full py-2 bg-base-charcoal/20 hover:bg-base-charcoal/40 text-[10px] font-bold text-surface-500 transition-colors flex items-center justify-center gap-1">
						<Plus size={12} />
						Add Row
					</button>
				</div>
			{:else if activeTab === 'authorization'}
				<div class="max-w-md space-y-4">
					<div class="flex items-center gap-4">
						<span class="text-[10px] font-bold uppercase tracking-widest text-surface-500 w-24">Auth Type</span>
						<select class="bg-base-charcoal border border-base-border rounded px-2 py-1.5 text-[11px] font-semibold text-surface-200 focus:border-blue-500/50 outline-none w-full">
							<option>No Auth</option>
							<option>Bearer Token</option>
							<option>API Key</option>
							<option>Basic Auth</option>
						</select>
					</div>
					<div class="p-4 border border-dashed border-base-border rounded-lg bg-base-charcoal/20 flex items-start gap-4">
						<ShieldCheck size={20} class="text-surface-600 shrink-0 mt-1" />
						<div>
							<h3 class="text-[11px] font-bold text-surface-300">This request does not use authentication.</h3>
							<p class="text-[10px] text-surface-500 mt-1 leading-relaxed">Choose an auth type from the list to add credentials to this request.</p>
						</div>
					</div>
				</div>
			{:else if activeTab === 'body'}
				<div class="flex flex-col h-full space-y-3">
					<div class="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-surface-500">
						{#each ['none', 'json', 'formdata', 'raw'] as type}
							<label class="flex items-center gap-1.5 cursor-pointer hover:text-surface-300 transition-colors">
								<input type="radio" value={type} bind:group={bodyType} class="accent-blue-500" />
								{type}
							</label>
						{/each}
					</div>
					{#if bodyType !== 'none'}
						<div class="flex-1 min-h-[200px] bg-base-sidebar border border-base-border rounded-lg overflow-hidden relative group">
							<textarea 
								bind:value={requestBody}
								placeholder="&#123; &#10;  &quot;key&quot;: &quot;value&quot; &#10;&#125;"
								class="w-full h-full bg-transparent border-none p-4 text-[12px] font-mono text-blue-400/90 outline-none resize-none leading-relaxed custom-scrollbar"
							></textarea>
							<div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
								<span class="text-[9px] font-bold bg-blue-500 text-white px-2 py-0.5 rounded uppercase tracking-tighter">JSON</span>
							</div>
						</div>
					{/if}
				</div>
			{:else if activeTab === 'tests'}
				<div class="flex flex-col items-center justify-center h-48 opacity-30 text-center space-y-3">
					<FileCode size={32} />
					<div>
						<p class="text-[11px] font-bold uppercase tracking-widest">Test Scripts</p>
						<p class="text-[10px] mt-1">Write JavaScript to validate your responses.</p>
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- Response Area -->
	<div class="h-[40%] bg-base-charcoal border-t border-base-border flex flex-col min-h-0">
		<div class="px-4 py-2 border-b border-base-border flex items-center justify-between shrink-0 bg-base-sidebar/40">
			<div class="flex items-center gap-6">
				<span class="text-[10px] font-bold uppercase tracking-widest text-surface-500">Response</span>
				
				{#if responseStatus !== null}
					<div class="flex items-center gap-3">
						<div class="px-2 py-0.5 rounded text-[10px] font-bold border {getStatusColor(responseStatus)}">
							{responseStatus} {responseStatus === 200 ? 'OK' : ''}
						</div>
						<div class="flex items-center gap-3 text-[10px] font-bold text-surface-500">
							<span class="flex items-center gap-1.5"><Clock size={11} /> {responseTime}ms</span>
							<span class="flex items-center gap-1.5"><Box size={11} /> {responseSize}</span>
						</div>
					</div>
				{/if}
			</div>

			<div class="flex items-center gap-2">
				{#each ['Body', 'Headers', 'Cookies', 'Console'] as rTab}
					<button 
						onclick={() => activeResponseTab = rTab.toLowerCase()}
						class="px-2 py-1 text-[9px] font-bold uppercase transition-all rounded-md {activeResponseTab === rTab.toLowerCase() ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'text-surface-500 hover:text-white'}"
					>
						{rTab}
					</button>
				{/each}
				<div class="w-px h-3 bg-base-border mx-2"></div>
				<button onclick={copyResponse} class="p-1.5 hover:bg-base-hover rounded text-surface-500 hover:text-white transition-colors">
					{#if copied}
						<Check size={14} class="text-green-500" />
					{:else}
						<Copy size={14} />
					{/if}
				</button>
			</div>
		</div>

		<div class="flex-1 overflow-auto bg-base-dark custom-scrollbar p-0">
			{#if responseData}
				<div class="p-4 font-mono text-[11px] leading-relaxed">
					<pre class="text-blue-200/80">
						{JSON.stringify(responseData, null, 2)}
					</pre>
				</div>
			{:else if isLoading}
				<div class="h-full flex flex-col items-center justify-center space-y-3 opacity-50">
					<RotateCcw size={24} class="animate-spin text-blue-500" />
					<p class="text-[10px] font-bold uppercase tracking-widest">Awaiting response...</p>
				</div>
			{:else}
				<div class="h-full flex flex-col items-center justify-center opacity-20 space-y-4">
					<div class="bg-base-charcoal p-4 rounded-full border border-base-border">
						<Send size={40} strokeWidth={1} />
					</div>
					<p class="text-[11px] font-bold uppercase tracking-widest text-center">Hit Send to get a response <br/> <span class="text-[9px] lowercase opacity-60 font-medium">Results will appear here</span></p>
				</div>
			{/if}
		</div>
	</div>
</div>


