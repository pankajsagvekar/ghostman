<script lang="ts">
	import { Send, Clock, Settings2, Copy, Check, RotateCcw, Activity, Box, Plus, MoreVertical, FileCode, Save, Trash2, ChevronDown, ShieldCheck } from 'lucide-svelte';

	// Request State
	let method = $state('GET');
	let url = $state('https://jsonplaceholder.typicode.com/todos/1');
	let env = $state('Production');

	// Complex state for tables
	let params = $state([
		{
			id: crypto.randomUUID(),
			key: '',
			value: '',
			description: '',
			enabled: true
		}
	]);
	let headers = $state([
		{
			id: crypto.randomUUID(),
			key: 'Content-Type',
			value: 'application/json',
			description: '',
			enabled: true
		},
		{
			id: crypto.randomUUID(),
			key: '',
			value: '',
			description: '',
			enabled: true
		}
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
		GET: 'text-get',
		POST: 'text-post',
		PUT: 'text-put',
		PATCH: 'text-patch',
		DELETE: 'text-delete',
		default: 'text-surface-500'
	};

	function addRow(type: 'params' | 'headers') {
		const newRow = { id: crypto.randomUUID(), key: '', value: '', description: '', enabled: true };
		if (type === 'params') params = [...params, newRow];
		else headers = [...headers, newRow];
	}

	function removeRow(type: 'params' | 'headers', id: string) {
		if (type === 'params') {
			if (params.length > 1) params = params.filter((p) => p.id !== id);
		} else {
			if (headers.length > 1) headers = headers.filter((h) => h.id !== id);
		}
	}

	function copyResponse() {
		if (responseData) {
			navigator.clipboard.writeText(JSON.stringify(responseData, null, 2));
			copied = true;
			setTimeout(() => (copied = false), 2000);
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

<div class="flex h-full flex-col bg-base-dark">
	<!-- Top Request Bar -->
	<div class="border-b border-base-border bg-base-charcoal p-3">
		<div class="flex max-w-full gap-2">
			<div class="flex flex-1 items-center overflow-hidden rounded-md border border-base-border bg-base-dark transition-all focus-within:border-primary-500/50">
				<select bind:value={method} class="cursor-pointer border-none bg-transparent px-3 py-2 text-[11px] font-bold outline-none {methodColors[method]}">
					{#each methods as m}
						<option value={m} class="bg-base-sidebar text-white">{m}</option>
					{/each}
				</select>
				<div class="mx-1 h-4 w-px"></div>
				<input type="text" bind:value={url} placeholder="Enter request URL" class="flex-1 border-none bg-transparent px-3 py-2 text-[11px] text-surface-200 outline-none" />
				<div class="mx-1 h-4 w-px bg-base-border"></div>
				<select bind:value={env} class="cursor-pointer border-none bg-transparent px-3 py-2 text-[10px] font-bold text-surface-500 transition-colors outline-none hover:text-white">
					{#each environments as e}
						<option value={e} class="bg-base-sidebar text-white">{e}</option>
					{/each}
				</select>
			</div>

			<button
				onclick={sendRequest}
				disabled={isLoading}
				class="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-[11px] font-bold text-white transition-all hover:bg-blue-500 disabled:opacity-50"
			>
				{#if isLoading}
					<RotateCcw size={14} class="animate-spin" />
					<span>Sending...</span>
				{:else}
					<Send size={14} />
					<span>Send</span>
				{/if}
			</button>

			<button class="flex items-center gap-2 rounded-md border border-base-border bg-base-hover px-3 py-2 text-[11px] font-bold text-surface-300 transition-all hover:text-white">
				<Save size={14} />
				<span>Save</span>
			</button>
		</div>
	</div>

	<!-- Request Builder Tabs -->
	<div class="flex min-h-0 flex-1 flex-col bg-base-dark">
		<div class="flex items-center gap-6 border-b border-base-border bg-base-charcoal/30 px-4 pt-2">
			{#each ['Params', 'Authorization', 'Headers', 'Body', 'Tests'] as tab}
				<button
					onclick={() => (activeTab = tab.toLowerCase())}
					class="relative pb-2 text-[10px] font-bold tracking-wider uppercase transition-all {activeTab === tab.toLowerCase() ? 'text-blue-500' : 'text-surface-500 hover:text-surface-300'}"
				>
					{tab}
					{#if activeTab === tab.toLowerCase()}
						<div class="absolute right-0 bottom-0 left-0 h-0.5 bg-blue-500"></div>
					{/if}
				</button>
			{/each}
		</div>

		<div class="custom-scrollbar flex-1 overflow-auto p-4">
			{#if activeTab === 'params' || activeTab === 'headers'}
				<div class="mb-10 border-collapse overflow-hidden rounded-lg border border-base-border">
					<table class="w-full text-left text-[11px]">
						<thead class="border-b border-base-border bg-base-charcoal/50 font-bold tracking-tighter text-surface-500 uppercase">
							<tr>
								<th class="w-8 border-r border-base-border p-2 text-center"></th>
								<th class="border-r border-base-border p-2">Key</th>
								<th class="border-r border-base-border p-2">Value</th>
								<th class="border-r border-base-border p-2">Description</th>
								<th class="w-10 p-2"></th>
							</tr>
						</thead>
						<tbody class="divide-y divide-base-border">
							{#each activeTab === 'params' ? params : headers as row}
								<tr class="group transition-colors hover:bg-base-hover/50">
									<td class="border-r border-base-border p-1 text-center">
										<input type="checkbox" bind:checked={row.enabled} class="accent-blue-500 opacity-40 transition-opacity group-hover:opacity-100" />
									</td>
									<td class="border-r border-base-border p-0">
										<input
											type="text"
											bind:value={row.key}
											class="w-full border-none bg-transparent p-2 text-surface-200 outline-none placeholder:text-surface-700 focus:bg-base-charcoal/50"
											placeholder="Key"
										/>
									</td>
									<td class="border-r border-base-border p-0">
										<input
											type="text"
											bind:value={row.value}
											class="w-full border-none bg-transparent p-2 text-surface-200 outline-none placeholder:text-surface-700 focus:bg-base-charcoal/50"
											placeholder="Value"
										/>
									</td>
									<td class="border-r border-base-border p-0">
										<input
											type="text"
											bind:value={row.description}
											class="w-full border-none bg-transparent p-2 text-surface-200 outline-none placeholder:text-surface-700 focus:bg-base-charcoal/50"
											placeholder="Description"
										/>
									</td>
									<td class="p-1 text-center">
										<button
											onclick={() => removeRow(activeTab === 'params' ? 'params' : 'headers', row.id)}
											class="p-1 text-surface-600 opacity-0 transition-all group-hover:opacity-100 hover:text-red-500"
										>
											<Trash2 size={12} />
										</button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
					<button
						onclick={() => addRow(activeTab === 'params' ? 'params' : 'headers')}
						class="flex w-full items-center justify-center gap-1 bg-base-charcoal/20 py-2 text-[10px] font-bold text-surface-500 transition-colors hover:bg-base-charcoal/40"
					>
						<Plus size={12} />
						Add Row
					</button>
				</div>
			{:else if activeTab === 'authorization'}
				<div class="max-w-md space-y-4">
					<div class="flex items-center gap-4">
						<span class="w-24 text-[10px] font-bold tracking-widest text-surface-500 uppercase">Auth Type</span>
						<select class="w-full rounded border border-base-border bg-base-charcoal px-2 py-1.5 text-[11px] font-semibold text-surface-200 outline-none focus:border-blue-500/50">
							<option>No Auth</option>
							<option>Bearer Token</option>
							<option>API Key</option>
							<option>Basic Auth</option>
						</select>
					</div>
					<div class="flex items-start gap-4 rounded-lg border border-dashed border-base-border bg-base-charcoal/20 p-4">
						<ShieldCheck size={20} class="mt-1 shrink-0 text-surface-600" />
						<div>
							<h3 class="text-[11px] font-bold text-surface-300">This request does not use authentication.</h3>
							<p class="mt-1 text-[10px] leading-relaxed text-surface-500">Choose an auth type from the list to add credentials to this request.</p>
						</div>
					</div>
				</div>
			{:else if activeTab === 'body'}
				<div class="flex h-full flex-col space-y-3">
					<div class="flex items-center gap-4 text-[10px] font-bold tracking-wider text-surface-500 uppercase">
						{#each ['none', 'json', 'formdata', 'raw'] as type}
							<label class="flex cursor-pointer items-center gap-1.5 transition-colors hover:text-surface-300">
								<input type="radio" value={type} bind:group={bodyType} class="accent-blue-500" />
								{type}
							</label>
						{/each}
					</div>
					{#if bodyType !== 'none'}
						<div class="group relative min-h-[200px] flex-1 overflow-hidden rounded-lg border border-base-border bg-base-sidebar">
							<textarea
								bind:value={requestBody}
								placeholder="&#123; &#10;  &quot;key&quot;: &quot;value&quot; &#10;&#125;"
								class="custom-scrollbar h-full w-full resize-none border-none bg-transparent p-4 font-mono text-[12px] leading-relaxed text-blue-400/90 outline-none"
							></textarea>
							<div class="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
								<span class="rounded bg-blue-500 px-2 py-0.5 text-[9px] font-bold tracking-tighter text-white uppercase">JSON</span>
							</div>
						</div>
					{/if}
				</div>
			{:else if activeTab === 'tests'}
				<div class="flex h-48 flex-col items-center justify-center space-y-3 text-center opacity-30">
					<FileCode size={32} />
					<div>
						<p class="text-[11px] font-bold tracking-widest uppercase">Test Scripts</p>
						<p class="mt-1 text-[10px]">Write JavaScript to validate your responses.</p>
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- Response Area -->
	<div class="flex h-[40%] min-h-0 flex-col border-t border-base-border bg-base-charcoal">
		<div class="flex shrink-0 items-center justify-between border-b border-base-border bg-base-sidebar/40 px-4 py-2">
			<div class="flex items-center gap-6">
				<span class="text-[10px] font-bold tracking-widest text-surface-500 uppercase">Response</span>

				{#if responseStatus !== null}
					<div class="flex items-center gap-3">
						<div class="rounded border px-2 py-0.5 text-[10px] font-bold {getStatusColor(responseStatus)}">
							{responseStatus}
							{responseStatus === 200 ? 'OK' : ''}
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
						onclick={() => (activeResponseTab = rTab.toLowerCase())}
						class="rounded-md px-2 py-1 text-[9px] font-bold uppercase transition-all {activeResponseTab === rTab.toLowerCase()
							? 'border border-blue-500/20 bg-blue-500/10 text-blue-500'
							: 'text-surface-500 hover:text-white'}"
					>
						{rTab}
					</button>
				{/each}
				<div class="mx-2 h-3 w-px bg-base-border"></div>
				<button onclick={copyResponse} class="rounded p-1.5 text-surface-500 transition-colors hover:bg-base-hover hover:text-white">
					{#if copied}
						<Check size={14} class="text-green-500" />
					{:else}
						<Copy size={14} />
					{/if}
				</button>
			</div>
		</div>

		<div class="custom-scrollbar flex-1 overflow-auto bg-base-dark p-0">
			{#if responseData}
				<div class="p-4 font-mono text-[11px] leading-relaxed">
					<pre class="text-blue-200/80">
						{JSON.stringify(responseData, null, 2)}
					</pre>
				</div>
			{:else if isLoading}
				<div class="flex h-full flex-col items-center justify-center space-y-3 opacity-50">
					<RotateCcw size={24} class="animate-spin text-blue-500" />
					<p class="text-[10px] font-bold tracking-widest uppercase">Awaiting response...</p>
				</div>
			{:else}
				<div class="flex h-full flex-col items-center justify-center space-y-4 opacity-20">
					<div class="rounded-full border border-base-border bg-base-charcoal p-4">
						<Send size={40} strokeWidth={1} />
					</div>
					<p class="text-center text-[11px] font-bold tracking-widest uppercase">
						Hit Send to get a response <br /> <span class="text-[9px] font-medium lowercase opacity-60">Results will appear here</span>
					</p>
				</div>
			{/if}
		</div>
	</div>
</div>
