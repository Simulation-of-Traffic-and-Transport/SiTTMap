<template>
	<div class="font-bold mb-2"><FontAwesomeIcon :icon="dataByType.icon" size="lg" /> {{ path.id }}</div>
	<div>{{ path.from }} &ndash; {{ path.to }}</div>
	<div>Type: {{ dataByType.label }}</div>
	<div>Length: {{ Math.round(path.length_m) }}m</div>
	<table v-if="path.uids?.length" class="w-full mt-2">
		<tbody>
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
		</tbody>
	</table>
</template>

<script setup>
import { computed } from "vue";
import DateTime from "@/components/DateTime.vue";

const props = defineProps({
	path: {
		type: Object,
		required: true,
	},
});

const dataByType = computed(() => {
	switch (props.path.type) {
		case "river":
			return {
				label: "River",
				icon: "fa-solid fa-water",
			};
		case "lake":
			return {
				label: "Lake",
				icon: "fa-solid fa-sailboat",
			};
	}
	return {
		label: "Road",
		icon: "fa-solid fa-road",
	};
});
</script>
