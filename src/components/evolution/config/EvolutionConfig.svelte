<script>
	// @ts-nocheck

	import { onMount } from 'svelte';
	import { rawImageInput, terrainImage } from '$lib/stores/imageInput';
	import { evolution } from '$lib/stores/evolution';
	import Terrain from '$lib/evolution/Terrain';
	import { currentMC, targetMC } from '$lib/stores/minecraft';
	import '$lib/nbt/nbt';
	import parseSchematic from '$lib/nbt/nbt';

	let fileUpload;

	onMount(() => {
		fileUpload.onchange = (e) => {
			const file = e.target.files[0];
			const reader = new FileReader();
			if (file.type.split('/')[0] === 'image') {
				reader.readAsDataURL(file);
				reader.onload = () => {
					rawImageInput.set(reader.result);

					const img = new Image();
					img.src = reader.result;
					img.onload = () => {
						terrainSize = Math.min(Math.max(img.width, img.height), 256);
					};
				};
			} else if (file.name.split('.')[1] === 'schematic') {
				reader.readAsArrayBuffer(file);
				reader.onload = async () => {
					// try {
					const { width, height, length, blocks } = await parseSchematic(reader.result);
					console.log(width, height, length, blocks);
					const terrain = Terrain.fromBlockArray($targetMC.world, blocks, width, height, length);
					console.log(terrain);
					$evolution.targetTerrain = terrain;
					$evolution.terrainSize = terrain.size;
					resetTerrainAndUpdate();
					console.log($evolution);
					// } catch (e) {
					// 	console.error(e);
					// }
				};
			}
		};
		rawImageInput.set(`images/terrain_examples/example1.png`);

		$evolution.onMount();
	});

	rawImageInput.subscribe((value) => {
		processImageInput();
	});

	function processImageInput() {
		if (!$rawImageInput) return;
		const img = new Image();
		img.src = $rawImageInput;
		img.onload = () => {
			const terrain = Terrain.fromImage(img, $evolution.terrainSize, $targetMC.world);
			$evolution.targetTerrain = terrain;
			resetTerrainAndUpdate();
			// terrainImage.set(terrain.toCanvas().toDataURL('image/jpeg', 0.5));
		};
	}

	let terrainSize = 64;
	let terrainFrequency = 100;
	let octaves = 2;
	let lacunarity = 0.5;

	let x = 0;
	let y = 0;
	let z = 0;

	let previewingRawImage = false;

	$: {
		if (terrainSize) {
			$evolution.terrainSize = terrainSize;
		}
	}

	function resetTerrainAndUpdate() {
		$evolution.currentTerrain = new Terrain($evolution.terrainSize, $currentMC.world);
		$currentMC.world.updateAllChunks();
		$targetMC.world.updateAllChunks();
	}

	function generateTerrain2D() {
		$evolution.targetTerrain = Terrain.generate2D(
			$targetMC.world,
			$evolution.terrainSize,
			terrainFrequency,
			octaves
		);
		resetTerrainAndUpdate();
	}
	function generateTerrain3D() {
		$evolution.targetTerrain = Terrain.generate3D(
			$targetMC.world,
			$evolution.terrainSize,
			terrainFrequency,
			octaves,
			lacunarity
		);
		resetTerrainAndUpdate();
	}

	function generateHousingTest() {
		$evolution.targetTerrain = Terrain.generateHousingTest($targetMC.world);
		resetTerrainAndUpdate();
	}
</script>

<h2 class="text-3xl text-center p-2">Config</h2>
<div class="flex flex-col bg-sky-200 p-4 rounded-b-lg">
	<div class="bg-sky-100 rounded-lg shadow-lg p-2">
		<div class="form-controll w-full">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label">
				<span class="label-text">Upload .schematic or an image heightmap</span>
			</label>
			<input
				type="file"
				accept="image/*,.schematic"
				bind:this={fileUpload}
				class="file-input file-input-bordered file-input-secondary file-input-sm w-full"
			/>
		</div>
		<div class="divider m-2">OR</div>
		<h2 class="text-center">Try Example Image</h2>
		<div class="grid grid-cols-4 w-full gap-2">
			{#each [1, 2, 3, 4, 5, 6, 7, 8] as i}
				<button
					class="rounded-lg shadow-lg hover:border-2"
					on:click={() => rawImageInput.set(`images/terrain_examples/example${i}.png`)}
				>
					<img
						src={`images/terrain_examples/example${i}.png`}
						alt={`example${i}`}
						class="w-full h-full rounded-lg"
					/>
				</button>
			{/each}
		</div>
		<div class="divider m-2">OR</div>
		<div class="flex justify-around">
			<button class="btn btn-secondary" on:click={generateTerrain2D}>Generate 2D Terrain</button>
			<button class="btn btn-secondary" on:click={generateTerrain3D}>Generate 3D Terrain</button>
			<button class="btn btn-secondary" on:click={generateHousingTest}>Housing Test</button>
		</div>
		<label class="label">
			<span class="label-text mr-2">Frequency</span>
			<input
				type="range"
				min="1"
				max="100"
				step="1"
				bind:value={terrainFrequency}
				class="range mr-1"
			/>
			<input
				type="number"
				bind:value={terrainFrequency}
				class="input input-bordered input-sm w-12"
			/>
		</label>
		<label class="label">
			<span class="label-text mr-2">Octaves</span>
			<input type="range" min="1" max="8" step="1" bind:value={octaves} class="range mr-1" />
			<input type="number" bind:value={octaves} class="input input-bordered input-sm w-12" />
		</label>
		<label class="label">
			<span class="label-text mr-2">Lacunarity</span>
			<input type="range" min="0" max="2" step="0.01" bind:value={lacunarity} class="range mr-1" />
			<input type="number" bind:value={lacunarity} class="input input-bordered input-sm w-12" />
		</label>
	</div>

	<div class="mt-2">
		<!-- {#if $rawImageInput && $terrainImage} -->
		<div class="flex flex-col items-center justify-center rounded-lg shadow-lg">
			<div class="join w-full flex">
				<button
					class="btn join-item rounded-b-none w-1/2"
					class:btn-active={previewingRawImage}
					on:click={() => (previewingRawImage = true)}
				>
					Uploaded Image
				</button>
				<button
					class="btn join-item rounded-b-none w-1/2"
					class:btn-active={!previewingRawImage}
					on:click={() => (previewingRawImage = false)}
				>
					Terrain Preview
				</button>
			</div>
			{#if previewingRawImage}
				<img src={$rawImageInput} alt="raw" class="w-full rounded-b-lg" />
			{:else}
				<img src={$terrainImage} alt="terrain" class="w-full rounded-b-lg" />
			{/if}
		</div>
		<!-- {/if} -->
	</div>

	<div class="divider m-1" />

	<label class="label">
		<span class="label-text mr-2">Terrain Size</span>
		<!-- <input type="range" min="16" max="256" step="16" bind:value={terrainSize} class="range mr-1" /> -->
		<!-- selector input -->
		<select bind:value={terrainSize} class="select select-bordered select-sm">
			{#each [8, 16, 32, 64, 128, 256] as size}
				<option value={size}>{size}</option>
			{/each}
		</select></label
	>
	<!-- put it in the lib folder -->
	<!-- x y z coordinates input -->
	<label class="label">
		<span class="label-text mr-2">NW Plot Coordinates</span>
		<div>
			<input type="number" bind:value={x} class="input input-bordered input-xs w-12" />
			<input type="number" bind:value={y} class="input input-bordered input-xs w-12" />
			<input type="number" bind:value={z} class="input input-bordered input-xs w-12" />
		</div>
	</label>

	<div class="tracking-wide text-xl">
		<label class="label">
			<span class="label-text mr-2">Population</span>
			<input
				type="range"
				min="10"
				max="500"
				step="10"
				bind:value={$evolution.populationSize}
				class="range mr-1"
			/>
			<input
				type="number"
				bind:value={$evolution.populationSize}
				class="input input-bordered input-sm w-14"
			/>
		</label>

		<label class="label">
			<span class="label-text mr-2">Generations</span>
			<input
				type="range"
				min="1"
				max="1000"
				step="1"
				bind:value={$evolution.generations}
				class="range mr-1"
			/>
			<input
				type="number"
				bind:value={$evolution.generations}
				class="input input-bordered input-sm w-14"
			/>
		</label>

		<label class="label">
			<span class="label-text mr-2">Survivor Rate</span>
			<input
				type="range"
				min="0.01"
				max="1"
				step="0.01"
				bind:value={$evolution.survivorRate}
				class="range mr-1"
			/>
			<input
				type="number"
				bind:value={$evolution.survivorRate}
				class="input input-bordered input-sm w-14"
			/>
		</label>

		<label class="label">
			<span class="label-text mr-2">Mutation Rate</span>
			<input
				type="range"
				min="0"
				max="1"
				step="0.01"
				bind:value={$evolution.mutationRate}
				class="range mr-1"
			/>
			<input
				type="number"
				bind:value={$evolution.mutationRate}
				class="input input-bordered input-sm w-14"
			/>
		</label>

		<label class="label">
			<span class="label-text mr-2">Mutation Amount</span>
			<input
				type="range"
				min="1"
				max="10"
				step="1"
				bind:value={$evolution.mutationAmount}
				class="range mr-1"
			/>
			<input
				type="number"
				bind:value={$evolution.mutationAmount}
				class="input input-bordered input-sm w-14"
			/>
		</label>

		<div class="divider m-1" />

		<h3 class="text-center">
			Stop Points <span class="text-xs">(whichever comes first)</span>
		</h3>
		<label class="label">
			<span class="label-text mr-2">Likeness %</span>
			<input
				type="range"
				min="99"
				max="100"
				step="0.01"
				bind:value={$evolution.stopPointLikeness}
				class="range mr-1"
			/>
			<input
				type="number"
				bind:value={$evolution.stopPointLikeness}
				class="input input-bordered input-sm w-16"
			/>
		</label>
		<label class="label">
			<span class="label-text mr-2">Generation Time (mins in-game)</span>
			<input
				type="range"
				min="0.5"
				max="10"
				step="0.5"
				bind:value={$evolution.stopPointGenTimeMins}
				class="range mr-1"
			/>
			<input
				type="number"
				bind:value={$evolution.stopPointGenTimeMins}
				class="input input-bordered input-sm w-14"
			/>
		</label>

		<div class="divider m-1" />

		<button
			class="btn btn-primary w-full mt-2
		"
			on:click={$evolution.start()}>Simulate</button
		>
	</div>
</div>

<style>
	input[type='number']::-webkit-inner-spin-button,
	input[type='number']::-webkit-outer-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	img {
		image-rendering: pixelated;
	}
</style>
