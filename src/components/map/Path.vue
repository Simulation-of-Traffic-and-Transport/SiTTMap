<template>
	<LPolyline
		:lat-lngs="path.latLngs"
		:name="path.id"
		:title="path.id"
		:weight="isHover ? 7 : 5"
		:color="lineColor"
		@mouseover="onHubMouseOver()"
		@mouseout="onHubMouseOut()"
	/>
</template>

<script setup>
import { LPolyline } from "@vue-leaflet/vue-leaflet";
import { computed, ref } from "vue";

const props = defineProps({
	path: {
		type: Object,
		required: true,
	},
	selectedAgent: {
		// type: Object || undefined,
		required: true,
	},
});

// data
const isHover = ref(false);

// computed properties
const lineColor = computed(() => {
	if (isHover.value) return "#8b0000";
	if (props.selectedAgent && props.selectedAgent?.edges) {
		if (props.selectedAgent.edges.includes(props.path.id)) {
			return "#f00";
		}
		return "#2F4F4F66";
	}
	switch (props.path?.type) {
		case "river":
			return "#3388ff";
		case "lake":
			return "#00CED1";
	}
	return "#2F4F4F";
});

// events
const onHubMouseOver = () => {
	isHover.value = true;
};

const onHubMouseOut = () => {
	isHover.value = false;
};
</script>
