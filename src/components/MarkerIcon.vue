<template>
	<LMarker :lat-lng="data.latLng" :icon="leafletIcon">
		<LPopup :options="{ maxWidth: 600, minWidth: 200 }">
			<PopupPositionData :data="data" />
		</LPopup>
	</LMarker>
</template>

<script setup>
import L from "leaflet";
import { LMarker, LPopup } from "@vue-leaflet/vue-leaflet";
import PopupPositionData from "@/components/PopupPositionData.vue";

const props = defineProps({
	data: {
		type: Object,
		required: true,
	},
	cancelled: {
		type: Boolean,
		default: false,
	},
});

const leafletIcon = new L.Icon.Default();
if (props.cancelled) {
	leafletIcon.options.iconUrl = "marker-icon-red.png";
	leafletIcon.options.iconRetinaUrl = "marker-icon-2x-red.png";
}
</script>
