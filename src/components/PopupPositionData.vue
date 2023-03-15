<template>
	<div class="font-bold mb-2"><FontAwesomeIcon icon="fa-solid fa-dolly" size="lg" /> {{ data.id }}</div>
	<div v-if="data.type == 'hub'"><FontAwesomeIcon icon="fa-solid fa-bed" title="Overnight" /> Overnight Stay</div>
	<table class="w-full mt-2">
		<tr class="text-slate-400">
			<th class="pr-2">Agent</th>
			<th class="text-right pr-1">{{ data.type == "hub" ? "Arrival" : "Start" }}</th>
			<th class="text-right">{{ data.type == "hub" ? "Departure" : "End" }}</th>
		</tr>
		<tr v-for="agent in data.agents" :key="agent.id">
			<td class="pr-2">{{ agent.agent }}</td>
			<td class="text-right pr-1"><DateTime :date-time="agent.start" /></td>
			<td class="text-right"><DateTime :date-time="agent.end" /></td>
		</tr>
	</table>
</template>

<script setup>
import DateTime from "@/components/DateTime.vue";

defineProps({
	data: {
		type: Object,
		required: true,
	},
});
</script>
