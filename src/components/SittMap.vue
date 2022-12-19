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
				<LPolyline
					v-for="path in paths"
					:key="path.id"
					:lat-lngs="path.latLngs"
					:name="path.id"
					:title="path.id"
					:weight="hoverId === path.id ? 5 : 3"
					:color="hoverId === path.id ? '#8b0000' : '#3388ff'"
					@mouseover="onHubMouseOver(path.id)"
					@mouseout="onHubMouseOut(path.id)"
				>
					<LPopup>
						<div class="font-bold mb-2">{{ path.id }}</div>
						<div>{{ path.from }} &ndash; {{ path.to }}</div>
						<div>Length: {{ Math.round(path.length_m) }}m</div>
					</LPopup>
				</LPolyline>
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
					:fill-color="hoverId === hub.id ? '#8b0000' : '#3388ff'"
					:fill-opacity="hoverId === hub.id ? 0.7 : 0.2"
					@mouseover="onHubMouseOver(hub.id)"
					@mouseout="onHubMouseOut(hub.id)"
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
import { LCircleMarker, LLayerGroup, LMap, LPolyline, LPopup, LTileLayer } from "@vue-leaflet/vue-leaflet";
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
const paths = computed(() =>
	props.data.paths.map((path) => ({
		id: path.id,
		from: path.from,
		to: path.to,
		length_m: path.length_m,
		latLngs: path.geom.coordinates.map((coord) => [coord[1], coord[0]]), // leaflet lat/lng switch
		heights: path.geom.coordinates.map((coord) => coord[2]),
	}))
);
const hubs = computed(() =>
	props.data.nodes.map((node) => ({
		id: node.id,
		overnight: node.overnight,
		latLng: [node.geom.coordinates[1], node.geom.coordinates[0]], // leaflet lat/lng switch
		height: node.geom.coordinates[2],
	}))
);

// events
const onMapReady = (readyMap) => {
	// map to ref variable
	map.value = readyMap;

	const bounds = L.latLngBounds();

	for (const node of props.data.nodes) {
		bounds.extend(L.latLng([node.geom.coordinates[1], node.geom.coordinates[0]]));
	}
	// TODO: might make sense to add the data of the paths, too

	readyMap.fitBounds(bounds, { padding: [10, 10] });
};

const onHubMouseOver = (id) => {
	hoverId.value = id;
};

// eslint-disable-next-line no-unused-vars
const onHubMouseOut = (id) => {
	hoverId.value = "";
};
</script>

<style>
@import "leaflet/dist/leaflet.css";
</style>
