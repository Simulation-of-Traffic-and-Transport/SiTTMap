<template>
	<div class="font-bold mb-2"><FontAwesomeIcon icon="fa-solid fa-road" size="lg" /> {{ path.id }}</div>
	<div>{{ path.from }} &ndash; {{ path.to }}</div>
	<div>Length: {{ Math.round(path.length_m) }}m</div>
	<table v-if="path.uids?.length" class="w-full mt-2">
		<tr class="text-slate-400">
			<th>Agent</th>
			<th class="text-right pl-2">Start</th>
			<th class="text-right pl-1">End</th>
		</tr>
		<tr v-for="uid in path.uids" :key="uid">
			<td class="italic">{{ uid }}</td>
			<td class="text-right pl-2"><DateTime :date-time="path.agents[uid].start" /></td>
			<td class="text-right pl-1"><DateTime :date-time="path.agents[uid].end" /></td>
		</tr>
	</table>
</template>

<script setup>
import DateTime from "@/components/DateTime.vue";

defineProps({
	path: {
		type: Object,
		required: true,
	},
});
</script>
