<script>
	import { evolution } from '$lib/stores/evolution';
	import CommandsTable from './CommandsTable.svelte';
	import FitnessChart from './FitnessChart.svelte';
	import LikenessChart from './LikenessChart.svelte';
</script>

<h1 class="text-3xl text-center p-2">Information</h1>

<div class="flex flex-col justify-center items-center">
	<div class="stats">
		<div class="stat">
			<div class="stat-title">Commands Executed</div>
			<div class="stat-value">{$evolution.commandsExecuted.length}</div>
		</div>
		<div class="stat">
			<div class="stat-title">Generation</div>
			<div class="stat-value">{$evolution.generation}</div>
		</div>
		<div class="stat">
			<div class="stat-title">Average Fitness</div>
			<div class="stat-value">{$evolution.averageFitness.toFixed()}</div>
		</div>
	</div>
	<div class="divider m-1" />
	<!-- <CommandsTable /> -->
	<div class="divider m-1" />
	<div class="flex justify-around w-full">
		<div class="flex flex-col items-center">
			<span class="text-xl text-center p-2">Terrain Likeness</span>
			<div
				class="radial-progress"
				style="--value:{$evolution.likenessToTarget * 100}; --size:8rem;"
			>
				{($evolution.likenessToTarget * 100).toFixed(2)}%
			</div>
		</div>

		<button class="btn btn-primary">Copy Commands</button>
	</div>
	<FitnessChart />
	<LikenessChart />
</div>
