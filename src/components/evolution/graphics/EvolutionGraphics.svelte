<script>
	import Controls from './Controls.svelte';
	import MinecraftCanvascopy from './threejs/MinecraftCanvas copy.svelte';
	import { currentMC, targetMC } from '$lib/stores/minecraft';
	import { onMount } from 'svelte';

	onMount(() => {
		// @ts-ignore
		$currentMC.camera = $targetMC.camera;
		// @ts-ignore
		$currentMC.controls = $targetMC.controls;
	});
</script>

<!-- make big as possible -->
<div class="relative h-full">
	<div class="flex flex-col h-full">
		<div class="flex flex-col items-center relative h-full">
			<h3 class="text-2xl absolute left-2 top-1 text-white">Current Terrain</h3>
			<MinecraftCanvascopy bind:minecraft={$currentMC} />
		</div>
		<div class="flex flex-col items-center relative h-full">
			<h3 class="text-2xl absolute left-2 top-1 text-white">Target Terrain</h3>
			<MinecraftCanvascopy bind:minecraft={$targetMC} />
		</div>
	</div>
	<div class="flex flex-row justify-center absolute bottom-0 w-full">
		<Controls />
	</div>
</div>
