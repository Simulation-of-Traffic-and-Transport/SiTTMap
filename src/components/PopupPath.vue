<template>
	<div class="font-bold mb-2">{{ path.id }}</div>
	<div>{{ path.from }} &ndash; {{ path.to }}</div>
	<div>Length: {{ Math.round(path.length_m) }}m</div>
	<table class="w-full mt-2">
		<tr class="text-slate-400">
			<th>Agent</th>
			<th class="text-center pr-1">Day</th>
			<th class="text-right pr-1">Start</th>
			<th class="text-right">End</th>
		</tr>
		<tr v-for="agent in path.agents" :key="agent.id">
			<td class="italic">{{ agent.id }}</td>
			<td class="text-center pr-1">{{ agent.day }}</td>
			<td class="text-right pr-1">{{ Math.round(agent.start * 100) / 100 }}</td>
			<td class="text-right">{{ Math.round(agent.end * 100) / 100 }}</td>
		</tr>
	</table>
</template>

<script setup>
defineProps({
	path: {
		type: Object,
		required: true,
	},
});
</script>
