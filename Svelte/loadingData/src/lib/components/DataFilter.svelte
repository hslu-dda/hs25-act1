<script>
	import { getContext } from 'svelte';

	// Get the filter store from context
	const filterStore = getContext('filterStore');
	const dataStore = getContext('dataStore');

	export let placeholder = 'Filter survey data...';
	export let className = '';

	// Clear filter function
	function clearFilter() {
		filterStore.set('');
	}
</script>

<div class="relative flex items-center {className}">
	<input
		type="text"
		bind:value={$filterStore}
		{placeholder}
		class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pr-20 shadow-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
	/>

	{#if $filterStore}
		<button
			on:click={clearFilter}
			class="absolute right-2 rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-600 transition-colors hover:bg-gray-200"
			title="Clear filter"
		>
			Clear
		</button>
	{/if}
</div>

{#if $filterStore}
	<div class="mt-2 text-sm text-gray-600">
		Filtering {$dataStore.length} items by "{$filterStore}"
	</div>
{/if}
