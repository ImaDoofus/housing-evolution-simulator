<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	import { evolution } from '$lib/stores/evolution';
	let canvas: HTMLCanvasElement;
	let chart: Chart;

	onMount(() => {
		const ctx = canvas.getContext('2d');
		const data = {
			labels: $evolution.fitnessHistory.map((_, i) => i),
			datasets: [
				{
					label: 'Fitness',
					data: $evolution.fitnessHistory,
					fill: false,
					borderColor: 'rgb(75, 192, 192)',
					tension: 0.5
				},
				{
					label: 'Best Fitness',
					data: $evolution.bestFitnessHistory,
					fill: false,
					borderColor: 'rgb(255, 99, 132)',
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
							beginAtZero: true
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
			chart.data.labels = $evolution.fitnessHistory.map((_, i) => i);
			chart.data.datasets[0].data = $evolution.fitnessHistory;
			chart.update();
		}
	}
</script>

<div class="w-full h-full">
	<canvas bind:this={canvas} />
</div>
