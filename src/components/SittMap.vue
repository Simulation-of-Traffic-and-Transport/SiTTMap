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
			<!-- Base Map -->
			<BaseTileLayer />

			<!-- Select Agent and show selected agent's data -->
			<LControl position="topright">
				<div class="bg-white bg-opacity-80 p-2">
					<SelectAgent v-model="selectedAgentUid" :agents="data.agents" />
				</div>
			</LControl>
			<LControl v-if="selectedAgent" position="topright">
				<AgentInformation v-model="selectedAgentUid" :agent="selectedAgent" :starts="data.from" />
			</LControl>

			<!-- Slider Element -->
			<SliderPlayer v-model="currentTime" :start="data.start" :end="data.end" />

			<!-- Paths -->
			<LLayerGroup>
				<Path
					v-for="path in paths"
					:key="path.id"
					:path="path"
					:selectedAgent="selectedAgent"
					@selectAgent="selectedAgentUid = $event"
				/>
			</LLayerGroup>

			<!-- Hubs -->
			<LLayerGroup>
				<Hub
					v-for="hub in hubs"
					:key="hub.id"
					:hub="hub"
					:zoom="zoom"
					:isStart="data?.from.includes(hub.id)"
					:isEnd="data?.to.includes(hub.id)"
					@selectAgent="selectedAgentUid = $event"
				/>
			</LLayerGroup>

			<!-- Agent Positions -->
			<AgentPositions
				:currentTime="currentTime"
				:hubs="hubs"
				:paths="paths"
				:start="data.start"
				:end="data.end"
				:startHubs="data?.from"
				:endHubs="data?.to"
				:agents="data.agents"
			/>
		</LMap>
	</div>
</template>

<script setup>
import L from "leaflet";
import "leaflet.vectorgrid";
import { computed, onBeforeMount, ref } from "vue";
import { LControl, LLayerGroup, LMap, LPolyline } from "@vue-leaflet/vue-leaflet";
import BaseTileLayer from "@/components/map/BaseTileLayer.vue";
import SelectAgent from "@/components/map/SelectAgent.vue";
import AgentInformation from "@/components/map/AgentInformation.vue";
import Path from "@/components/map/Path.vue";
import Hub from "@/components/map/Hub.vue";
import AgentPositions from "@/components/map/AgentPositions.vue";
import SliderPlayer from "@/components/map/SliderPlayer.vue";

// props
const props = defineProps({
	data: {
		type: Object,
		required: true,
	},
});

// data
const zoom = ref(4);
const bounds = ref(null);
const selectedAgentUid = ref(null);
const currentTime = ref(props.data.start);
// refs
const map = ref();
/**
 * Canonical data of paths
 */
const paths = computed(() =>
	props.data.paths
		.filter((path) => path?.geom?.coordinates?.length)
		.map((path) => ({
			id: path.id,
			from: path.from,
			to: path.to,
			length_m: path.length_m,
			type: path.type,
			latLngs: path.geom.coordinates.map((coord) => [coord[1], coord[0]]), // leaflet lat/lng switch
			activity: path.activity,
		}))
);
// const pathMap = computed(() =>
// 	paths.value.reduce((acc, path) => {
// 		return { ...acc, [path.id]: path };
// 	}, {})
// );
/**
 * List of all hubs with canonical data
 */
const hubs = computed(() =>
	props.data.hubs
		.filter((hub) => hub?.lat && hub?.lng)
		.map((hub) => ({
			id: hub.id,
			overnight: hub.overnight,
			latLng: L.latLng([hub.lat, hub.lng]), // leaflet lat/lng switch
			activity: hub.activity,
		}))
);
// const hubMap = computed(() =>
// 	hubs.value.reduce((acc, hub) => {
// 		return { ...acc, [hub.id]: hub };
// 	}, {})
// );
// const hubsToShow = computed(() => hubs.value.filter((hub) => hub?.type !== "river"));
/**
 * Selected agent data
 */
const selectedAgent = computed(
	() => (selectedAgentUid?.value && props.data.agents.find((agent) => agent.uid === selectedAgentUid.value)) || null
);

// events
onBeforeMount(() => {
	// calculate bounds
	bounds.value = L.latLngBounds();

	for (const hub of hubs.value) {
		bounds.value.extend(hub.latLng);
	}
});

const onMapReady = (readyMap) => {
	readyMap.fitBounds(bounds.value, { animate: false, padding: [10, 10], maxZoom: 16 });

	// map to ref variable
	map.value = readyMap;

	L.vectorGrid
		.protobuf("http://0.0.0.0:3000/water_bodies/{z}/{x}/{y}", {
			vectorTileLayerStyles: {
				water_bodies: {
					weight: 0,
					fillColor: "#00BCD4",
					fillOpacity: 0.8,
					fill: true,
				},
			},
		})
		.addTo(map.value);
	L.vectorGrid
		.protobuf("http://0.0.0.0:3000/mittelmeer/{z}/{x}/{y}", {
			vectorTileLayerStyles: {
				mittelmeer: {
					weight: 0,
					fillColor: "#00BCD4",
					fillOpacity: 0.9,
					fill: true,
				},
			},
		})
		.addTo(map.value);
};
</script>

<style>
@import "leaflet/dist/leaflet.css";
@import "@vueform/slider/themes/default.css";
</style>
