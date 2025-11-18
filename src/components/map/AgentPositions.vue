<template>
	<LLayerGroup>
		<AgentMarker v-for="agent in activeAgents" :agent="agent" :currentTime="currentTime" />
	</LLayerGroup>
</template>

<script setup>
import { computed } from "vue";
import { LLayerGroup } from "@vue-leaflet/vue-leaflet";
import AgentMarker from "@/components/map/AgentMarker.vue";
import IntervalTree from "@flatten-js/interval-tree";

const props = defineProps({
	currentTime: {
		type: Number,
		required: true,
	},
	hubs: {
		type: Object,
		required: true,
	},
	paths: {
		type: Object,
		required: true,
	},
});

// computed data
/**
 * This is the interval tree to hold the time intervals of all entries in hour history. This is handy to find all
 * entries for certain intervals efficiently.
 */
const intervalTree = computed(() => {
	const tree = new IntervalTree();

	for (const entry of props.hubs) {
		if (entry.activity) {
			for (const activity of entry.activity) {
				const start = activity.arrival || activity.departure;
				const end = activity.departure || activity.arrival;
				const data = {
					type: "hub",
					agents: activity.agents,
					start: start,
					end: end,
					data: entry,
				};
				if (activity.rest) {
					data["rest"] = activity.rest;
				}
				tree.insert([start, end], data);
			}
		}
	}
	for (const entry of Object.values(props.paths)) {
		if (entry.activity) {
			for (const activity of entry.activity) {
				const start = activity.legs[0];
				const end = activity.legs[activity.legs.length - 1];
				const data = {
					type: "path",
					agents: activity.agents,
					start: start,
					end: end,
					legs: activity.legs,
					reversed: activity.reversed,
					data: entry,
				};
				if (activity.rest) {
					data["rest"] = activity.rest;
				}
				tree.insert([start, end], data);
			}
		}
	}

	return tree;
});

/**
 * agent positions at current slider setting
 */
const activeAgents = computed(() => Object.values(intervalTree.value.search([props.currentTime, props.currentTime])));
</script>
