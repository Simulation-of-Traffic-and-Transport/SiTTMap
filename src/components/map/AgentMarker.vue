<template>
	<LMarker :latLng="markerInfo.latLng"></LMarker>
</template>

<script setup>
import { LMarker } from "@vue-leaflet/vue-leaflet";

const props = defineProps({
	markerInfo: {
		type: Object,
		required: true,
	},
});
</script>
