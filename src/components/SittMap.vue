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
					<div class="font-bold text-slate-400">Agents</div>
					<div v-for="agent in agents" :key="agent.uid">
						<button
							class="block px-6 py-2 mt-2 text-base leading-tight rounded shadow-md hover:shadow-lg transition duration-150 ease-in-out"
							:class="
								selectedAgentUid == agent.uid
									? 'bg-fuchsia-400 hover:bg-fuchsia-600 hover:text-white'
									: 'bg-fuchsia-200 hover:bg-fuchsia-400'
							"
							@click="onAgentButtonClicked(agent)"
						>
							<FontAwesomeIcon
								v-if="agent.status === 'finished'"
								icon="fa-solid fa-check"
								class="text-green-700"
							/>
							<FontAwesomeIcon v-else icon="fa-solid fa-ban" class="text-red-500" />
							{{ agent.uid }}
							<span>[day: {{ agent.day }}, hour: {{ Math.round(agent.hour * 100) / 100 }}]</span>
						</button>
					</div>

					{{ agentPositions }}
				</div>
			</LControl>

			<LControl position="bottomleft">
				<div class="bg-white bg-opacity-80 p-2" style="width: 50vw" :style="{ 'min-width': maxTime + 'px' }">
					<Slider
						v-model="slider"
						:min="minTime"
						:max="maxTime"
						:lazy="false"
						:format="formatSliderTooltip"
					/>
				</div>
			</LControl>

			<LLayerGroup>
				<LPolyline
					v-for="path in paths"
					:key="path.id"
					:lat-lngs="path.latLngs"
					:name="path.id"
					:title="path.id"
					:weight="hoverId === path.id ? 5 : 3"
					:color="getPathLineColor(path)"
					@mouseover="onHubMouseOver(path.id)"
					@mouseout="onHubMouseOut(path.id)"
				>
					<LPopup :options="{ maxWidth: 600 }">
						<PopupPath :path="path" />
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
					<LPopup :options="{ maxWidth: 600 }">
						<PopupHub :hub="hub" />
					</LPopup>
				</LCircleMarker>
			</LLayerGroup>

			<LLayerGroup>
				<LMarker v-for="agent in agentPositions" :key="agent.uid" :lat-lng="agent.latLng" />
			</LLayerGroup>
		</LMap>
	</div>
</template>

<script setup>
/**
 * Show the map
 */
import L from "leaflet";
import {
	LCircleMarker,
	LControl,
	LLayerGroup,
	LMap,
	LMarker,
	LPolyline,
	LPopup,
	LTileLayer,
} from "@vue-leaflet/vue-leaflet";
import { computed, onBeforeMount, ref } from "vue";
import PopupPath from "@/components/PopupPath.vue";
import PopupHub from "@/components/PopupHub.vue";
import Slider from "@vueform/slider";

// props
const props = defineProps({
	data: {
		type: Object,
		required: true,
	},
});

// computed data
const agentsPerPath = computed(() => {
	const agentsPerPath = {};

	for (const id in props.data.agents) {
		for (const pathData of props.data.agents[id]) {
			if (!agentsPerPath[pathData.path]) agentsPerPath[pathData.path] = {};
			agentsPerPath[pathData.path][id] = { id, ...pathData };
		}
	}

	return agentsPerPath;
});
const paths = computed(() =>
	props.data.paths.map((path) => ({
		id: path.id,
		from: path.from,
		to: path.to,
		length_m: path.length_m,
		latLngs: path.geom.coordinates.map((coord) => [coord[1], coord[0]]), // leaflet lat/lng switch
		heights: path.geom.coordinates.map((coord) => coord[2]),
		agentUids: Object.keys(agentsPerPath.value[path.id]) || [],
		agents: agentsPerPath.value[path.id] || {},
	}))
);
const agentsPerHub = computed(() => {
	const agentsPerHub = {};

	for (const id in props.data.agents) {
		for (const pathData of props.data.agents[id]) {
			if (!agentsPerHub[pathData.from]) agentsPerHub[pathData.from] = {};
			if (!agentsPerHub[pathData.to]) agentsPerHub[pathData.to] = {};
			if (!agentsPerHub[pathData.from][id]) agentsPerHub[pathData.from][id] = {};
			if (!agentsPerHub[pathData.to][id]) agentsPerHub[pathData.to][id] = {};

			agentsPerHub[pathData.from][id].leave = { day: pathData.day, hour: pathData.start, path: pathData.path };
			agentsPerHub[pathData.to][id].arrive = { day: pathData.day, hour: pathData.end, path: pathData.path };
		}
	}
	return agentsPerHub;
});
const hubs = computed(() =>
	props.data.nodes.map((node) => ({
		id: node.id,
		overnight: node.overnight,
		latLng: [node.geom.coordinates[1], node.geom.coordinates[0]], // leaflet lat/lng switch
		height: node.geom.coordinates[2],
		agents: agentsPerHub.value[node.id] || {},
	}))
);
const agents = computed(() => [...props.data.agents_finished, ...props.data.agents_cancelled]);
const selectedAgent = computed(() => {
	const filtered = selectedAgentUid.value ? agents.value.filter((a) => a.uid === selectedAgentUid.value) : [];
	return filtered.length > 0 ? filtered[0] : {};
});
const selectedAgentUids = computed(() => selectedAgent.value?.uids || []);
const minTime = computed(() => {
	let minTime = Number.MAX_SAFE_INTEGER;
	for (const id in props.data.agents) {
		const t = props.data.agents[id].reduce((prevValue, agent) => {
			const myValue = (agent.day - 1) * 24 + agent.start;
			return myValue < prevValue ? myValue : prevValue;
		}, Number.MAX_SAFE_INTEGER);
		if (t < minTime) minTime = t;
	}
	return minTime;
});
const maxTime = computed(() =>
	// calculate maximum time of all agents
	Math.ceil(
		agents.value.reduce((prevValue, agent) => {
			const myValue = (agent.day - 1) * 24 + agent.hour;
			return myValue > prevValue ? myValue : prevValue;
		}, 0)
	)
);
// calculate all the agent positions dynamically:
const agentPositions = computed(() => {
	// define day and hour to find
	const find = valueToDayHour(slider.value);

	// iterate all the paths and agents to find possible candidates
	const agentList = [];
	const agentIds = {}; // for doubles

	// for (const path of paths.value) {
	// 	for (const agentUid of path.agentUids) {
	// 		if (agentIds[agentUid]) continue; // no double entries
	//
	// 		const agent = path.agents[agentUid];
	// 		if (agent.day === find.day && agent.start <= find.hour && agent.end >= find.hour) {
	// 			let legTime = agent.start;
	// 			let i = 0;
	// 			while (Math.floor(legTime) < find.hour && i < (agent.leg_times?.length || -1)) {
	// 				legTime += agent.leg_times[0];
	// 				i++;
	// 			}
	//
	// 			agentIds[agentUid] = true; // TODO
	// 			agentList.push({ uid: agentUid, latLng: path.latLngs[i] });
	// 		}
	// 	}
	// }

	return agentList;
});

// data
const zoom = ref(4);
const map = ref();
const hoverId = ref(null);
const selectedAgentUid = ref(null);
const slider = ref(minTime.value);
const bounds = ref(null);

// events
onBeforeMount(() => {
	// calculate bounds
	bounds.value = L.latLngBounds();

	for (const node of props.data.nodes) {
		bounds.value.extend(L.latLng([node.geom.coordinates[1], node.geom.coordinates[0]]));
	}
	// TODO: might make sense to add the data of the paths, too
});
const onMapReady = (readyMap) => {
	readyMap.fitBounds(bounds.value, { animate: false, padding: [10, 10], maxZoom: 16 });

	// map to ref variable
	map.value = readyMap;
};

const onHubMouseOver = (id) => {
	hoverId.value = id;
};

// eslint-disable-next-line no-unused-vars
const onHubMouseOut = (id) => {
	hoverId.value = "";
};

const onAgentButtonClicked = (agent) => {
	// clicking again will disable selection
	selectedAgentUid.value = selectedAgentUid.value === agent.uid ? null : agent.uid;
};

// methods
const getPathLineColor = (path) => {
	if (hoverId.value === path.id) return "#8b0000";

	if (
		selectedAgentUids.value.length &&
		path.agentUids.length &&
		selectedAgentUids.value.some((e) => path.agentUids.includes(e))
	) {
		return "#f00";
	}

	return "#3388ff";
};
const formatSliderTooltip = (value) => {
	const v = valueToDayHour(value);
	return "day: " + v.day + ", hour: " + v.hour;
};

const valueToDayHour = (value) => ({ day: Math.floor(value / 24) + 1, hour: Math.round(value % 24) });
</script>

<style>
@import "leaflet/dist/leaflet.css";
@import "@vueform/slider/themes/default.css";
</style>
