<script>
	import { evolution } from '$lib/stores/evolution';
	import CommandsTable from './CommandsTable.svelte';
	import FitnessChart from './FitnessChart.svelte';
	import LikenessChart from './LikenessChart.svelte';
	import valid_set_blocks from '$lib/nbt/valid_set_blocks.json';

	const filename = 'commands.txt';

	// download commands
	const download = (filename, text) => {
		const element = document.createElement('a');
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
		element.setAttribute('download', filename);

		element.style.display = 'none';
		document.body.appendChild(element);

		element.click();

		document.body.removeChild(element);
	};

	function downloadCommands() {
		let commands = '';
		$evolution.commandsExecuted.forEach((command) => {
			let { id, meta } = valid_set_blocks.find((block) => block.cid === command.block);

			commands +=
				'set,' +
				command.x1 +
				',' +
				command.y1 +
				',' +
				command.z1 +
				',' +
				command.x2 +
				',' +
				command.y2 +
				',' +
				command.z2 +
				',' +
				id +
				',' +
				meta +
				'\n';
		});
		download(filename, commands);
	}
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
				{($evolution.likenessToTarget * 100).toFixed(4)}%
			</div>
		</div>

		<div class="flex flex-col items-center justify-around">
			<button class="btn btn-primary w-full" on:click={downloadCommands}>Download Commands</button>
			<input type="text" placeholder={filename} class="input w-full max-w-xs" />
		</div>
	</div>
	<FitnessChart />
	<LikenessChart />
</div>
