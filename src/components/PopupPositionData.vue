<template>
	<div class="font-bold mb-2"><FontAwesomeIcon icon="fa-solid fa-dolly" size="lg" /> {{ data.label }}</div>
	<div v-if="data.type === 'edge'">Path: {{ data.id }}</div>
	<div v-if="data.overnight"><FontAwesomeIcon icon="fa-solid fa-bed" title="Overnight" /> Overnight Stay</div>
	<table class="w-full mt-2">
		<tbody>
			<tr class="text-slate-400">
				<th>Agent</th>
				<th class="text-right pl-2">{{ data.type === "node" ? "Arrival" : "Start" }}</th>
				<th class="text-right pl-1">{{ data.type === "node" ? "Departure" : "End" }}</th>
			</tr>
			<tr v-for="uid in data.uids" :key="uid">
				<td class="italic" :class="{ 'text-red-500 line-through': cancelledAgents.has(uid) }">{{ uid }}</td>
				<td class="text-right pl-2"><DateTime :date-time="data.agents[uid].start" /></td>
				<td class="text-right pl-1"><DateTime :date-time="data.agents[uid].end" /></td>
			</tr>
		</tbody>
	</table>
</template>

<script setup>
import { inject } from "vue";
import DateTime from "@/components/DateTime.vue";

defineProps({
	data: {
		type: Object,
		required: true,
	},
});

const cancelledAgents = inject("cancelledAgents");
</script>
