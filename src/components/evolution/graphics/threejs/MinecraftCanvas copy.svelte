<script lang="ts">
	// @ts-nocheck

	import { onDestroy, onMount } from 'svelte';
	import { Minecraft } from 'three-js-minecraft';

	export let minecraft: Minecraft;

	let canvas;

	onMount(() => {
		minecraft = new Minecraft(canvas);

		minecraft.resize();
	});

	onDestroy(() => {
		if (minecraft) minecraft.dispose();
	});
</script>

<!-- <svelte:window on:resize={resize} /> -->
<canvas bind:this={canvas} class="w-full h-full" />
