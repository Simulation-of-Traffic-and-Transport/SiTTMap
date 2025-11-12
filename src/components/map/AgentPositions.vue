<template>
	<LLayerGroup>
		<AgentMarker v-for="markerInfo in currentSlice" :markerInfo="markerInfo" />
	</LLayerGroup>
</template>

<script setup>
import { computed, ref } from "vue";
import { LLayerGroup } from "@vue-leaflet/vue-leaflet";
import AgentMarker from "@/components/map/AgentMarker.vue";

const props = defineProps({
	currentTime: {
		type: Number,
		required: true,
	},
	timeSlices: {
		type: Object,
		required: true,
	},
});

const currentSlice = computed(() => props.timeSlices[props.currentTime] || []);
</script>
