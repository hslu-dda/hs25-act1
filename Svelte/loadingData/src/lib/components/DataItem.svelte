<script>
	let { item } = $props();
	//console.log('Data in DataItem component:', item);
</script>

<div class="border-t-1 border-gray-900 bg-white p-2 transition-shadow hover:shadow-lg">
	<p class=" text-gray-900">
		{item.location}
	</p>
	<p class=" text-gray-600">
		{item['Indicator English'] || item['Indicator_Eng']}
	</p>
	<div class="flex items-center justify-between">
		<div class="flex items-center space-x-2">
			<span class="text-sm text-gray-500">{item['Focus Group'] || item['Focus_Group']}</span>
			<span class="text-sm text-gray-500">{item['Concept']}</span>
		</div>
	</div>

	<div class="flex items-center justify-between">
		<div class="flex items-center space-x-2">
			<span class="flex-1 text-sm text-gray-500">M:{item['M']}</span>
			<span class="flex-1 text-sm text-gray-500">T:{item['T'] || item['Total']}</span>
			<span class="flex-1 text-sm text-gray-500">Y:{item['y']}</span>
		</div>
	</div>
</div>
