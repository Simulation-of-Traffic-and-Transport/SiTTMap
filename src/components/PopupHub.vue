<template>
	<div class="font-bold mb-2">{{ hub.id }}</div>
	<div>
		<FontAwesomeIcon v-if="hub.overnight" icon="fa-solid fa-bed" size="lg" title="Overnight" />
	</div>
	<table class="w-full mt-2">
		<tr class="text-slate-400">
			<th>Arrival</th>
			<th class="text-center pr-1">Day</th>
			<th class="text-right pr-1">Hour</th>
			<th>From</th>
		</tr>
		<tr v-for="id in arrivals" :key="id">
			<td>{{ id }}</td>
			<td class="text-center pr-1">{{ hub.agents[id].arrive.day }}</td>
			<td class="text-right pr-1">{{ Math.round(hub.agents[id].arrive.hour * 100) / 100 }}</td>
			<td class="whitespace-nowrap">{{ hub.agents[id].arrive.path }}</td>
		</tr>
		<tr class="text-slate-400">
			<th class="pt-2">Departure</th>
			<th class="text-center pr-1 pt-2">Day</th>
			<th class="text-right pr-1 pt-2">Hour</th>
			<th class="pt-2">To</th>
		</tr>
		<tr v-for="id in departures" :key="id">
			<td>{{ id }}</td>
			<td class="text-center pr-1">{{ hub.agents[id].depart.day }}</td>
			<td class="text-right pr-1">{{ Math.round(hub.agents[id].depart.hour * 100) / 100 }}</td>
			<td class="whitespace-nowrap">{{ hub.agents[id].depart.path }}</td>
		</tr>
	</table>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
	hub: {
		type: Object,
		required: true,
	},
});

const agentIds = computed(() => Object.keys(props.hub.agents) || []);
const arrivals = computed(() => agentIds.value.filter((id) => props.hub.agents[id]?.arrive));
const departures = computed(() => agentIds.value.filter((id) => props.hub.agents[id]?.depart));
</script>
