<template>
	<LCircleMarker
		:lat-lng="hub.latLng"
		:radius="zoom > 12 ? zoom : zoom / 2"
		:name="hub.id"
		:title="hub.id"
		:fill="true"
		:fill-color="fillColor"
		:fill-opacity="fillOpacity"
		@mouseover="onHubMouseOver()"
		@mouseout="onHubMouseOut()"
	>
		<LPopup :options="{ maxWidth: 600 }"> {{ hub }} </LPopup>
	</LCircleMarker>
</template>

<script setup>
import { LCircleMarker, LPopup } from "@vue-leaflet/vue-leaflet";
import { computed, ref } from "vue";

const props = defineProps({
	hub: {
		type: Object,
		required: true,
	},
	zoom: {
		type: Number,
		required: true,
	},
	isStart: {
		type: Boolean,
		default: false,
	},
	isEnd: {
		type: Boolean,
		default: false,
	},
});

// data
const isHover = ref(false);

// computed properties
const fillColor = computed(() =>
	isHover.value ? "#8b0000" : props.isStart ? "#ffff00" : props.isEnd ? "#00CED1" : "#3388ff"
);

const fillOpacity = computed(() => ((isHover.value || props.isStart || props.isEnd) && 0.7) || 0.2);

// events
const onHubMouseOver = () => {
	isHover.value = true;
};

const onHubMouseOut = () => {
	isHover.value = false;
};
</script>
