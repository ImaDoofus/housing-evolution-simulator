<script>
	import { evolution } from '$lib/stores/evolution';
	import Icon from '@iconify/svelte';
	const size = 69;
</script>

<button>
	<Icon icon="mdi:arrow-left" width={size} height={size} />
</button>
<label class="swap swap-rotate">
	<input type="checkbox" bind:checked={$evolution.isRunning} />
	<Icon class="swap-on" icon="mdi:pause" width={size} height={size} />
	<Icon class="swap-off" icon="mdi:play" width={size} height={size} />
</label>
<button>
	<Icon icon="mdi:arrow-right" width={size} height={size} />
</button>
