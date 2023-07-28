<script>
	// @ts-nocheck

	import { onDestroy, onMount } from 'svelte';
	import { Minecraft } from 'three-js-minecraft';

	let canvas;
	let minecraft;

	onMount(() => {
		minecraft = new Minecraft(canvas);

		minecraft.world.addBlock(10, 10, 1);

		minecraft.resize();
	});

	onDestroy(() => {
		if (minecraft) minecraft.dispose();
	});
</script>

<!-- <svelte:window on:resize={resize} /> -->
<canvas bind:this={canvas} class="w-full h-full" />
