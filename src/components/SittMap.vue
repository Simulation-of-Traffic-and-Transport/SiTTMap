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

			<LControl position="topright">
				<div class="bg-white bg-opacity-80 p-2">
					<div>
						<select v-model="selectedAgentUid">
							<option :value="null">Agent</option>
							<option v-for="agent in data.agents" :key="agent.uid" :value="agent.uid">
								{{ agent.uid }}
							</option>
						</select>
					</div>
				</div>
			</LControl>
			<LControl v-if="selectedAgentUid && selectedAgent" position="topright">
				<div class="bg-white bg-opacity-80 p-2 w-96">
					<div class="font-bold">
						Agent {{ selectedAgent.uid }}
						<template v-if="!selectedAgent.parent">
							<wa-icon
								id="agent-detail-start"
								v-if="!selectedAgent.parent"
								name="play"
								variant="solid"
								class="ml-1 text-green-800"
							/>
							<wa-tooltip for="agent-detail-start">Start</wa-tooltip>
						</template>
						<template v-if="selectedAgent.finished">
							<wa-icon
								id="agent-detail-finished"
								name="flag-checkered"
								variant="solid"
								class="ml-1 text-green-600 animate-bounce"
							/>
							<wa-tooltip for="agent-detail-finished">Finished</wa-tooltip>
						</template>
						<template v-if="selectedAgent.cancelled">
							<wa-icon
								id="agent-detail-cancelled"
								name="ban"
								variant="solid"
								class="ml-1 text-red-500 animate-bounce"
							/>
							<wa-tooltip for="agent-detail-cancelled">Cancelled</wa-tooltip>
						</template>
					</div>
					<div>
						Start
						<DateTime :dateTime="selectedAgent.start" />
						<wa-icon name="play" variant="solid" class="mx-1" />
						Stop
						<DateTime :dateTime="selectedAgent.end" />
					</div>
					<div v-if="selectedAgent.parent" class="text-center">
						Parent:
						<span class="cursor-pointer text-blue-500" @click="selectedAgentUid = selectedAgent.parent">{{
							selectedAgent.parent
						}}</span>
					</div>
					<ul class="p-2">
						<li
							v-for="hub in selectedAgent.hubs"
							:key="hub"
							:id="'agent-detail-' + hub"
							class="timeline-item cursor-pointer"
						>
							{{ hub }}
						</li>
					</ul>
					<wa-tooltip
						v-for="(hub, idx) in selectedAgent.hubs"
						:key="hub"
						:for="'agent-detail-' + hub"
						trigger="click"
						>{{ idx < selectedAgent.hubs.length - 1 ? selectedAgent.edges[idx] : "END" }}</wa-tooltip
					>
					<div v-if="descendants?.length" class="text-center">
						<div>Descendants:</div>
						<div
							v-for="descendant in descendants"
							:key="descendant.uid"
							class="cursor-pointer text-blue-500"
							@click="selectedAgentUid = descendant.uid"
						>
							{{ descendant.uid }}
						</div>
					</div>
				</div>
			</LControl>

			<LLayerGroup>
				<LPolyline
					v-for="path in paths"
					:key="path.id"
					:lat-lngs="path.latLngs"
					:name="path.id"
					:title="path.id"
					:weight="hoverId === path.id ? 7 : 5"
					:color="getPathLineColor(path)"
					@mouseover="onHubMouseOver(path.id)"
					@mouseout="onHubMouseOut(path.id)"
				>
				</LPolyline>
			</LLayerGroup>

			<LLayerGroup>
				<LCircleMarker
					v-for="hub in hubsToShow"
					:key="hub.id"
					:lat-lng="hub.latLng"
					:radius="zoom > 12 ? zoom : zoom / 2"
					:name="hub.id"
					:title="hub.id"
					:fill="true"
					:fill-color="getHubFillColor(hub)"
					:fill-opacity="getHubFillOpacity(hub)"
					@mouseover="onHubMouseOver(hub.id)"
					@mouseout="onHubMouseOut(hub.id)"
				>
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
import "leaflet.vectorgrid";
import { LCircleMarker, LControl, LLayerGroup, LMap, LPolyline, LPopup, LTileLayer } from "@vue-leaflet/vue-leaflet";
import { computed, onBeforeMount, ref, watch, provide } from "vue";
import PopupPath from "@/components/PopupPath.vue";
import DateTime from "@/components/DateTime.vue";

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
const selectedAgentUid = ref(null);
//const slider = ref(minTime.value);
//const sliderPlaying = ref(false);
const bounds = ref(null);

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
const hubsToShow = computed(() => hubs.value.filter((hub) => hub?.type !== "river"));
const selectedAgent = computed(
	() => (selectedAgentUid?.value && props.data.agents.find((agent) => agent.uid === selectedAgentUid.value)) || null
);
const descendants = computed(
	() => selectedAgentUid?.value && props.data.agents.filter((agent) => agent.parent === selectedAgentUid.value)
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

	// TODO
};

const onHubMouseOver = (id) => {
	hoverId.value = id;
};

// eslint-disable-next-line no-unused-vars
const onHubMouseOut = (id) => {
	hoverId.value = "";
};

// methods
const getPathLineColor = (path) => {
	if (hoverId.value === path.id) return "#8b0000";

	if (selectedAgent.value && selectedAgent.value?.edges) {
		if (selectedAgent.value.edges.includes(path.id)) {
			return "#f00";
		}
		return "#2F4F4F66";
	}

	switch (path.type) {
		case "river":
			return "#3388ff";
		case "lake":
			return "#00CED1";
	}
	return "#2F4F4F";
};

const getHubFillColor = (hub) => {
	if (hoverId.value === hub.id) return "#8b0000";

	if (props.data?.from.includes(hub.id)) return "#ffff00";
	if (props.data?.to.includes(hub.id)) return "#00CED1";
	return "#3388ff";
};

const getHubFillOpacity = (hub) => {
	if (hoverId.value === hub.id || props.data?.from.includes(hub.id) || props.data?.to.includes(hub.id)) return 0.7;
	return 0.2;
};
</script>

<style>
@import "leaflet/dist/leaflet.css";
@import "@vueform/slider/themes/default.css";

.timeline-item {
	position: relative;
	left: -10px;
	list-style: none;
	border-left: 3px solid #278472;
	margin-left: 5px;
	padding: 0 0 0.4rem 1rem;
	line-height: 0.9rem;
}
.timeline-item:last-child {
	padding-bottom: 0;
	border-left: 2px solid transparent;
}
.timeline-item:before {
	content: "";
	width: 14px;
	height: 14px;
	background: white;
	border: 2px solid #278472;
	border-radius: 50%;
	position: absolute;
	left: -8px;
	top: 0;
}
</style>
