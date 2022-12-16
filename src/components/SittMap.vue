<template>
	<div style="height: 600px; width: 800px">
		<LMap ref="map" v-model:zoom="zoom" :center="[47.41322, -1.219482]">
			<LTileLayer
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				layer-type="base"
				name="OpenStreetMap"
			></LTileLayer>
		</LMap>
	</div>
</template>

<script setup>
import { LMap, LTileLayer } from "@vue-leaflet/vue-leaflet";
import { ref } from "vue";

// data
const zoom = ref(2);
</script>

<style>
@import "leaflet/dist/leaflet.css";
</style>
