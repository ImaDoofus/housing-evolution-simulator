<script>
	import EvolutionConfig from '../components/evolution/config/EvolutionConfig.svelte';
	import EvolutionGraphics from '../components/evolution/graphics/EvolutionGraphics.svelte';
	import EvolutionInformation from '../components/evolution/information/EvolutionInformation.svelte';
</script>

<div class="flex flex-col items-center bg-gray-900 w-full h-screen">
	<!-- <h1 class="text-4xl text-center text-white pt-2">Housing Evolution Simulator</h1> -->
	<div class="flex flex-row justify-around w-full p-4 space-x-2 h-screen">
		<div class="w-1/4 bg-sky-300 rounded-lg overflow-y-auto">
			<EvolutionConfig />
		</div>
		<div class="w-1/2 bg-purple-200 rounded-lg">
			<EvolutionGraphics />
		</div>
		<div class="w-1/4 bg-orange-100 rounded-lg">
			<EvolutionInformation />
		</div>
	</div>
</div>

<style>
	/* scrollbars */
	::-webkit-scrollbar {
		width: 0.5rem;
		height: 0.5rem;
	}

	::-webkit-scrollbar-track {
		background: #f1f1f1;
	}

	::-webkit-scrollbar-thumb {
		background: #888;
	}

	::-webkit-scrollbar-thumb:hover {
		background: #555;
	}
</style>
