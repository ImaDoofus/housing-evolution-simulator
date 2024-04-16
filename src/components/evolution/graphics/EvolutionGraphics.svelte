<script>
	import Controls from './Controls.svelte';
	import MinecraftCanvas from './threejs/MinecraftCanvas.svelte';
	import { currentMC, targetMC } from '$lib/stores/minecraft';
	import { onMount } from 'svelte';

	import { BoxGeometry, EdgesGeometry, LineSegments, LineBasicMaterial } from 'three';
	onMount(() => {
		// @ts-ignore
		$targetMC.camera = $currentMC.camera;
		// @ts-ignore
		// $targetMC.controls = $currentMC.controls;

		const boxMesh = new LineSegments(
			new EdgesGeometry(new BoxGeometry(256, 256, 256)),
			new LineBasicMaterial({ color: 0xffffff, linewidth: 2 })
		);
		boxMesh.position.set(128, 128, 128);
		// @ts-ignore
		$currentMC.scene.add(boxMesh);
		// @ts-ignore
		$targetMC.scene.add(boxMesh.clone());
	});
</script>

<!-- make big as possible -->
<div class="relative h-full">
	<div class="flex flex-col h-full">
		<div class="flex flex-col items-center relative h-full">
			<h3 class="text-2xl absolute left-2 top-1 text-white">Current Terrain</h3>
			<MinecraftCanvas bind:minecraft={$currentMC} />
		</div>
		<div class="flex flex-col items-center relative h-full">
			<h3 class="text-2xl absolute left-2 top-1 text-white">Target Terrain</h3>
			<MinecraftCanvas bind:minecraft={$targetMC} />
		</div>
	</div>
	<div class="flex flex-row justify-center absolute bottom-0 w-full">
		<Controls />
	</div>
</div>
