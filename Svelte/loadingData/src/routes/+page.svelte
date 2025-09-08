<script>
	import DataList from '$lib/components/DataList.svelte';
	import DataFilter from '$lib/components/DataFilter.svelte';
	import { getContext } from 'svelte';

	let { data } = $props();

	// Get stores from context
	const dataStore = getContext('dataStore');
	const filterStore = getContext('filterStore');

	// Reactive filtered data based on store values
	const filteredData = $derived(() => {
		return $dataStore.filter((item) => {
			if (!$filterStore) return true;

			// Filter across multiple fields - adjust based on your data structure
			const searchText = $filterStore.toLowerCase();
			return Object.values(item).some((value) => String(value).toLowerCase().includes(searchText));
		});
	});

	console.log('Data in page component:', data);
	console.log('data.data is array:', Array.isArray(data.data));
	console.log('data.data length:', data.data?.length);
</script>

{#if $dataStore && Array.isArray($dataStore) && $dataStore.length > 0}
	<div class="min-h-screen bg-red-50">
		<header class="bg-blue-50 shadow-sm">
			<h1 class="text-red text-1xl border-2 py-2 text-center text-3xl font-bold text-red-400">
				Survey Data
			</h1>
			<!-- Add filter component to header -->
			<div class="px-4 py-3">
				<DataFilter />
			</div>
		</header>
		<main>
			<!-- First section -->
			<div class="mb-8 grid grid-cols-3">
				<div class="col-span-2">
					<div class="sticky top-6">
						<div
							class="aspect-square w-64 rounded-lg border border-gray-200 bg-white p-4 shadow-lg"
						>
							<h3 class="mb-2 text-lg font-semibold">Summary 1</h3>
							<p class="text-gray-600">
								Summary for the filtered results.
								{#if $filterStore}
									<br /><span class="text-sm text-blue-600">Filtered by: "{$filterStore}"</span>
								{/if}
							</p>
							<div class="mt-4 text-sm text-gray-500">
								Showing {filteredData().length} of {$dataStore.length} items
							</div>
						</div>
					</div>
				</div>
				<div class="col-span-1">
					<DataList data={filteredData()} title="Survey Results ({filteredData().length} items)" />
				</div>
			</div>

			<!-- Second section -->
			<div class="grid grid-cols-3">
				<div class="col-span-2">
					<div class="sticky top-6">
						<div
							class="aspect-square w-64 rounded-lg border border-gray-200 bg-white p-4 shadow-lg"
						>
							<h3 class="mb-2 text-lg font-semibold">Summary 2</h3>
							<p class="text-gray-600">Top 5 filtered results.</p>
						</div>
					</div>
				</div>
				<div class="col-span-1">
					<DataList data={filteredData().slice(0, 5)} title="First 5 Results" />
				</div>
			</div>
		</main>
	</div>
{:else}
	<div class="flex min-h-screen items-center justify-center bg-gray-50">
		<div class="text-center">
			<p class="text-gray-500">Loading data...</p>
			<p class="mt-2 text-sm">Debug: {JSON.stringify(data)}</p>
		</div>
	</div>
{/if}
