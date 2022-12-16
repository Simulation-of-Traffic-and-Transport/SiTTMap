<template>
	<div class="h-screen w-screen">
		<LMap
			v-model:zoom="zoom"
			:max-zoom="19"
			zoom-animation
			:inertia="true"
			:inertiaDeceleration="3000"
			:inertiaMaxSpeed="Infinity"
			:easeLinearity="0.2"
			:zoomAnimation="true"
			:useGlobalLeaflet="true"
			@ready="onMapReady"
		>
			<LTileLayer
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				layer-type="base"
				name="OpenStreetMap"
				attribution="&copy; <a target='_blank' href='http://osm.org/copyright'>OpenStreetMap</a> contributors"
			></LTileLayer>
			<LLayerGroup>
				<LGeoJson v-for="path in data.paths" :key="path.id" :geojson="path.geom">
					<LPopup>
						<div class="font-bold mb-2">{{ path.id }}</div>
						<div>TODO</div>
					</LPopup>
				</LGeoJson>
			</LLayerGroup>
			<LLayerGroup>
				<LCircleMarker
					v-for="hub in hubs"
					:key="hub.id"
					:lat-lng="hub.latLng"
					:radius="zoom > 12 ? zoom * 2 : zoom"
					:name="hub.id"
					:title="hub.id"
					:fill="true"
					:fill-color="hoverId == hub.id ? '#f00' : '#00f'"
					@mouseover="onHubMouseOver(hub)"
					@mouseout="onHubMouseOut(hub)"
				>
					<LPopup>
						<div class="font-bold mb-2">{{ hub.id }}</div>
						<div>
							<FontAwesomeIcon v-if="hub.overnight" icon="fa-solid fa-bed" size="lg" title="Overnight" />
						</div>
					</LPopup>
				</LCircleMarker>
			</LLayerGroup>
		</LMap>
	</div>
</template>

<script setup>
/**
 * Show the map
 */
import L from "leaflet";
import { LCircleMarker, LGeoJson, LLayerGroup, LMap, LPopup, LTileLayer } from "@vue-leaflet/vue-leaflet";
import { computed, ref } from "vue";

// props
const props = defineProps({
	data: {
		type: Object,
		required: true,
	},
});

// data
const zoom = ref(4);
const map = ref();
const hoverId = ref(null);

// computed data
const hubs = computed(() =>
	props.data.nodes.map((node) => ({
		id: node.id,
		overnight: node.overnight,
		latLng: [node.geom.coordinates[1], node.geom.coordinates[0]],
		height: node.geom.coordinates[2],
	}))
);

// events
const onMapReady = (readyMap) => {
	// map to ref variable
	map.value = readyMap;

	// TODO
	console.log(props.data);

	const bounds = L.latLngBounds();

	for (const node of props.data.nodes) {
		bounds.extend(L.latLng([node.geom.coordinates[1], node.geom.coordinates[0]]));
	}

	readyMap.fitBounds(bounds, { padding: [10, 10] });
};

const onHubMouseOver = (hub) => {
	hoverId.value = hub.id;
};

// eslint-disable-next-line no-unused-vars
const onHubMouseOut = (hub) => {
	hoverId.value = "";
};
</script>

<style>
@import "leaflet/dist/leaflet.css";
</style>
