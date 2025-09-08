<script>
	import DataItem from './DataItem.svelte';
	let { data, title = 'Data List' } = $props();

	console.log('Data in DataList component:', data);
	console.log('Data length:', data?.length);

	// If you want to log each item, do it here
	$effect(() => {
		data?.forEach((item, index) => {
			//	console.log(`Item ${index}:`, item);
		});
	});
</script>

<div class="mx-auto max-w-7xl p-6">
	<div class="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
		{#each data as item, index}
			<DataItem {item} />
		{/each}
	</div>
</div>
