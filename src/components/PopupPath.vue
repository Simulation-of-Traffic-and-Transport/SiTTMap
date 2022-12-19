<template>
	<div class="font-bold mb-2">{{ path.id }}</div>
	<div>{{ path.from }} &ndash; {{ path.to }}</div>
	<div>Length: {{ Math.round(path.length_m) }}m</div>
	<table class="w-full">
		<tr>
			<th>Agent</th>
			<th class="text-center pr-1">Day</th>
			<th class="text-right pr-1">Start</th>
			<th class="text-right pr-1">End</th>
		</tr>
		<tr v-for="agent in agents" :key="agent.id">
			<td class="font-bold">{{ agent.id }}</td>
			<td class="text-center pr-1">{{ agent.day }}</td>
			<td class="text-right pr-1">{{ Math.round(agent.start * 100) / 100 }}</td>
			<td class="text-right pr-1">{{ Math.round(agent.end * 100) / 100 }}</td>
		</tr>
	</table>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
	path: {
		type: Object,
		required: true,
	},
});

const agents = computed(() => {
	const agents = [];

	for (const key of Object.keys(props.path?.agents || {})) {
		const data = props.path.agents[key];
		data.id = key;
		agents.push(data);
	}

	return agents;
});
</script>
