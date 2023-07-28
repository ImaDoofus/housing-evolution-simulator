<script>
	import Controls from './Controls.svelte';
	import MinecraftCanvascopy from './threejs/MinecraftCanvas copy.svelte';
	import MinecraftCanvas from './threejs/MinecraftCanvas.svelte';
</script>

<div class="grid grid-cols-1 gap-2 m-2">
	<div class="flex flex-col items-center relative h-96">
		<h3 class="text-2xl absolute left-2 top-1 text-white">Current Terrain</h3>
		<MinecraftCanvascopy />
	</div>
	<div class="flex flex-col items-center relative h-96">
		<h3 class="text-2xl absolute left-2 top-1 text-white">Target Terrain</h3>
		<MinecraftCanvas />
	</div>
</div>
<div class="flex flex-row justify-center">
	<Controls />
</div>
