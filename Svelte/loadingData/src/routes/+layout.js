export async function load({ fetch }) {
	const res = await fetch('/data/combined-data.json');
	const json = await res.json();

	console.log('Loaded data:', json); // This will log in the server/browser console
	console.log('Is array:', Array.isArray(json));

	return {
		data: json
	};
}
