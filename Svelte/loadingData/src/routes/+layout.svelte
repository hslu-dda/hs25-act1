<script>
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { writable } from 'svelte/store';
	import { setContext } from 'svelte';

	let { children, data } = $props();

	// Create a reactive store for the data
	const dataStore = writable(data?.data || []);
	const filterStore = writable('');

	// Make stores available to all child components
	setContext('dataStore', dataStore);
	setContext('filterStore', filterStore);

	// Update store when layout data changes
	$effect(() => {
		if (data?.data) {
			dataStore.set(data.data);
			console.log('Data updated in store:', data.data.length, 'items');
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}
