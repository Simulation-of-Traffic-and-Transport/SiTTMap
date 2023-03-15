<template>
	<div class="font-bold mb-2"><FontAwesomeIcon icon="fa-solid fa-map-pin" size="lg" /> {{ hub.id }}</div>
	<div>
		<FontAwesomeIcon v-if="hub.overnight" icon="fa-solid fa-bed" size="lg" title="Overnight" />
	</div>
	<table v-if="hub.uids?.length" class="w-full mt-2">
		<tr class="text-slate-400">
			<th>Agent</th>
			<th class="text-right pl-2">Arrival</th>
			<th class="text-right pl-1">Departure</th>
		</tr>
		<tr v-for="uid in hub.uids" :key="uid">
			<td class="italic">{{ uid }}</td>
			<td class="text-right pl-2"><DateTime :date-time="hub.agents[uid].start" /></td>
			<td class="text-right pl-1"><DateTime :date-time="hub.agents[uid].end" /></td>
		</tr>
	</table>
</template>

<script setup>
import DateTime from "@/components/DateTime.vue";

defineProps({
	hub: {
		type: Object,
		required: true,
	},
});
</script>
