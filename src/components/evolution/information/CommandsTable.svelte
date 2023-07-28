<script lang="ts">
	import { evolution } from '$lib/stores/evolution';
</script>

<div class="overflow-scroll h-96">
	<table class="table table-xs table-zebra">
		<tr class="bg-gray-900 text-white">
			<th>ID</th>
			<th>Command</th>
			<th>Fitness</th>
		</tr>
		{#each $evolution.population as command}
			<tr class="bg-gray-200 hover:bg-gray-300">
				<td>{command.id}</td>
				<td>{command.toString()}</td>
				<td>{command.fitness}</td>
			</tr>
		{/each}
	</table>
</div>
