<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	import { evolution } from '$lib/stores/evolution';
	let canvas: HTMLCanvasElement;
	let chart: Chart;

	onMount(() => {
		const ctx = canvas.getContext('2d');
		const data = {
			labels: $evolution.likenessHistory.map((_, i) => i),
			datasets: [
				{
					label: 'Likeness',
					data: $evolution.likenessHistory,
					fill: false,
					borderColor: 'rgb(79, 10, 107)',
					tension: 0.5
				}
			]
		};
		if (ctx) {
			// no animations no points
			chart = new Chart(ctx, {
				type: 'line',
				data: data,
				options: {
					animation: false,
					scales: {
						y: {
							min: 0.99,
							max: 1
						}
					},
					elements: {
						point: {
							radius: 0
						}
					}
				}
			});
		}
	});

	onDestroy(() => {
		if (chart) chart.destroy();
	});

	$: {
		if (chart) {
			chart.data.labels = $evolution.likenessHistory.map((_, i) => i);
			chart.data.datasets[0].data = $evolution.likenessHistory;
			chart.update();
		}
	}
</script>

<div class="w-full h-full">
	<canvas bind:this={canvas} />
</div>
