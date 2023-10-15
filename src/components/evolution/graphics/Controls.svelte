<script>
	// @ts-nocheck

	import { evolution } from '$lib/stores/evolution';
	import { currentMC } from '$lib/stores/minecraft';
	import Icon from '@iconify/svelte';
	const size = 69;
</script>

<!-- <button>
	<Icon icon="mdi:arrow-left" width={size} height={size} />
</button> -->
<label class="swap swap-rotate">
	<input type="checkbox" bind:checked={$evolution.isRunning} />
	<Icon class="swap-on" icon="mdi:pause" width={size} height={size} />
	<Icon class="swap-off" icon="mdi:play" width={size} height={size} />
</label>
<button on:click={() => $evolution.nextGeneration()}>
	<Icon icon="mdi:arrow-right" width={size} height={size} />
</button>
<!-- button to execute command -->
<button
	on:click={() => {
		$evolution.executeCommand();
		$evolution.resetPopulation();
	}}
>
	<!--  -->
	<Icon icon="iconoir:git-command" width={size} height={size} />
</button>
<button
	on:click={() => {
		$currentMC.world.updateAllChunks();
	}}
>
	<Icon icon="mdi:refresh" width={size} height={size} />
</button>
