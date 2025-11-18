<template>
	<LMarker :latLng="position"></LMarker>
</template>

<script setup>
import { computed } from "vue";
import { LMarker } from "@vue-leaflet/vue-leaflet";

const props = defineProps({
	currentTime: {
		type: Number,
		required: true,
	},
	agent: {
		type: Object,
		required: true,
	},
});

const position = computed(() => {
	if (props.agent.type === "hub") {
		return props.agent.data.latLng;
	}
	try {
		let legTime = props.agent.start;
		let i = 0;

		while (legTime < props.currentTime && i < (props.agent.legs?.length || -1)) {
			legTime = props.agent.legs[i++];
		}

		// reversed order?
		i = props.agent.reversed ? props.agent.data.latLngs.length - i : i - 1;
		const latLng = props.agent.data.latLngs[i];
		if (!latLng) {
			console.error("No lat lng provided for agent", props.agent, i, legTime, props.currentTime);
			throw new Error("No latLng provided for agent");
		}
		return latLng;
	} catch (error) {
		console.error("Error calculating position for agent", props.agent, error);
		return { lat: 0, lng: 0 };
	}
});
</script>
