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
				<AgentInformation v-model="selectedAgentUid" :agent="selectedAgent" :descendants="descendants" />
			</LControl>

			<!-- Slider Element -->
			<LControl position="bottomleft">
				<div class="bg-white bg-opacity-80 p-2 ml-10 flex flex-row items-center" style="width: 50vw">
					<Slider
						v-model="currentTime"
						:min="data.start"
						:max="data.end"
						:step="0.1"
						:lazy="false"
						:format="formatSliderTooltip"
						class="flex-grow m-1"
					/>
				</div>
			</LControl>

			<!-- Paths -->
			<LLayerGroup>
				<Path v-for="path in paths" :key="path.id" :path="path" :selectedAgent="selectedAgent" />
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
				/>
			</LLayerGroup>

			<!-- Agent Positions -->
			<AgentPositions :currentTime="currentTime" :timeSlices="data.time_slices" />
		</LMap>
	</div>
</template>

<script setup>
import L from "leaflet";
import { computed, onBeforeMount, ref } from "vue";
import { LControl, LLayerGroup, LMap, LPolyline } from "@vue-leaflet/vue-leaflet";
import BaseTileLayer from "@/components/map/BaseTileLayer.vue";
import SelectAgent from "@/components/map/SelectAgent.vue";
import AgentInformation from "@/components/map/AgentInformation.vue";
import Path from "@/components/map/Path.vue";
import Hub from "@/components/map/Hub.vue";
import Slider from "@vueform/slider";
import { dtTOHuman } from "@/lib/dt_to_human";
import AgentPositions from "@/components/map/AgentPositions.vue";

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

// computed data
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
		}))
);
/**
 * List of all hubs with canonical data
 */
const hubs = computed(() =>
	props.data.nodes
		.filter((hub) => hub?.lat && hub?.lng)
		.map((hub) => ({
			id: hub.id,
			type: hub.type,
			overnight: hub.overnight,
			latLng: L.latLng([hub.lat, hub.lng]), // leaflet lat/lng switch
		}))
);
// const hubsToShow = computed(() => hubs.value.filter((hub) => hub?.type !== "river"));
/**
 * Selected agent data
 */
const selectedAgent = computed(
	() => (selectedAgentUid?.value && props.data.agents.find((agent) => agent.uid === selectedAgentUid.value)) || null
);
/**
 * Selected agent's descendants
 */
const descendants = computed(
	() => selectedAgentUid?.value && props.data.agents.filter((agent) => agent.parent === selectedAgentUid.value)
);
const formatSliderTooltip = (value) => {
	const v = dtTOHuman(value);
	return "day: " + v[0] + ", hour: " + v[1];
};

// "Game" loop
// TODO

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
};
</script>

<style>
@import "leaflet/dist/leaflet.css";
@import "@vueform/slider/themes/default.css";
</style>
