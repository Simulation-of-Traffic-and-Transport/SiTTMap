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
		<HubPopup :hub="hub" :isStart="isStart" :isEnd="isEnd" @selectAgent="selectAgent($event)" />
	</LCircleMarker>
</template>

<script setup>
import { LCircleMarker } from "@vue-leaflet/vue-leaflet";
import { computed, ref } from "vue";
import HubPopup from "@/components/map/HubPopup.vue";

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
const emits = defineEmits(["selectAgent"]);

const onHubMouseOver = () => {
	isHover.value = true;
};

const onHubMouseOut = () => {
	isHover.value = false;
};

const selectAgent = (agent) => {
	emits("selectAgent", agent);
};
</script>
