<template>
	<LTileLayer
		url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
		layer-type="base"
		name="OpenStreetMap"
		attribution="&copy; <a target='_blank' href='http://osm.org/copyright'>OpenStreetMap</a> contributors"
	></LTileLayer>
</template>

<script setup>
import { LTileLayer } from "@vue-leaflet/vue-leaflet";
</script>
