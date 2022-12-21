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
				</div>
			</LControl>

			<LControl position="bottomleft">
				<div
					class="bg-white bg-opacity-80 p-2 ml-10"
					style="width: 50vw"
					:style="{ 'min-width': maxTime + 'px' }"
				>
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
import IntervalTree from "@flatten-js/interval-tree";

// helper functions
const valueToDayHour = (value) => ({ day: Math.floor(value / 24) + 1, hour: Math.round(value % 24) });
const dayHourToValue = (day, hour) => (day - 1) * 24 + hour;

// props
const props = defineProps({
	data: {
		type: Object,
		required: true,
	},
});

// computed data
/**
 * This is the interval tree to hold the time intervals of all entries in hour history. This is handy to find all
 * entries for certain intervals efficiently.
 */
const intervalTree = computed(() => {
	let tree = new IntervalTree();

	for (const entry of props.data.history) {
		const begin = entry.begin ? dayHourToValue(entry.begin.day, entry.begin.hour) : -1;
		const end = entry.end ? dayHourToValue(entry.end.day, entry.end.hour) : -1;

		tree.insert([begin, end], entry);
	}

	return tree;
});
/**
 * This keeps all agents per path entry (path is the key)
 */
const agentsPerPath = computed(() => {
	const agentsPerPath = {};

	for (const entry of props.data.history.filter((entry) => entry.type === "edge")) {
		const pathId = entry.path;
		const uid = entry.agent;

		if (!agentsPerPath[pathId]) agentsPerPath[pathId] = {};
		agentsPerPath[pathId][uid] = entry;
	}

	return agentsPerPath;
});
/**
 * Corrected data of paths
 */
const paths = computed(() =>
	props.data.paths.map((path) => ({
		id: path.id,
		from: path.from,
		to: path.to,
		length_m: path.length_m,
		latLngs: path.geom.coordinates.map((coord) => [coord[1], coord[0]]), // leaflet lat/lng switch
		heights: path.geom.coordinates.map((coord) => coord[2]),
		agentUids: (agentsPerPath.value[path.id] && Object.keys(agentsPerPath.value[path.id])) || [],
		agents: agentsPerPath.value[path.id] || {},
	}))
);
/**
 * This keeps all agents per hub (hubId is the key)
 */
const agentsPerHub = computed(() => {
	const agentsPerHub = {};
	// TODO

	for (const id in props.data.agents) {
		for (const pathData of props.data.agents[id]) {
			if (!agentsPerHub[pathData.from]) agentsPerHub[pathData.from] = {};
			if (!agentsPerHub[pathData.to]) agentsPerHub[pathData.to] = {};
			if (!agentsPerHub[pathData.from][id]) agentsPerHub[pathData.from][id] = {};
			if (!agentsPerHub[pathData.to][id]) agentsPerHub[pathData.to][id] = {};

			agentsPerHub[pathData.from][id].depart = { day: pathData.day, hour: pathData.start, path: pathData.path };
			agentsPerHub[pathData.to][id].arrive = { day: pathData.day, hour: pathData.end, path: pathData.path };
		}
	}
	return agentsPerHub;
});
/**
 * List of all hubs with corrected data
 */
const hubs = computed(() =>
	props.data.nodes.map((hub) => ({
		id: hub.id,
		overnight: hub.overnight,
		latLng: [hub.geom.coordinates[1], hub.geom.coordinates[0]], // leaflet lat/lng switch
		height: hub.geom.coordinates[2],
		agents: agentsPerHub.value[hub.id] || {},
	}))
);
/**
 * All known agents
 */
const agents = computed(() => [...props.data.agents_finished, ...props.data.agents_cancelled]);
/**
 * Currently selected agent (selected in Agent list top right)
 */
const selectedAgent = computed(() => {
	const filtered = selectedAgentUid.value ? agents.value.filter((a) => a.uid === selectedAgentUid.value) : [];
	return filtered.length > 0 ? filtered[0] : {};
});
/**
 * UIDs of agents in the selected agent list
 */
const selectedAgentUids = computed(() => selectedAgent.value?.uids || []);
/**
 * minimum time in slider
 */
const minTime = computed(
	() => Math.floor((intervalTree.value.keys && intervalTree.value.keys[0] && intervalTree.value.keys[0][0]) || 0)
	// we use the key list of the tree - this is handy, because we know it is correctly sorted
);
/**
 * maximum time in slider
 */
const maxTime = computed(
	() => Math.ceil((intervalTree.value.keys && intervalTree.value.keys[intervalTree.value.keys.length - 1][1]) || 0)
	// we use the key list of the tree - this is handy, because we know it is correctly sorted
);
/**
 * agent positions at current slider setting
 */
const agentPositions = computed(() => {
	// iterate all the paths and agents to find possible candidates
	const agentList = [];

	for (const entry of intervalTree.value.search([slider.value, slider.value])) {
		if (entry.type === "hub") {
			const hub = hubs.value.find((hub) => hub.id === entry.hub);
			agentList.push({ agent: entry.agent, latLng: hub.latLng });
		} else {
			//console.log(entry);
			let legTime = dayHourToValue(entry.begin.day, entry.begin.hour);
			let i = 0;

			while (Math.floor(legTime) < slider.value && i < (entry.leg_times?.length || -1)) {
				legTime += entry.leg_times[i];
				i++;
			}

			const path = paths.value.find((path) => path.id === entry.path);
			// check the direction of the indexes
			console.log(path.from, "->", path.to);
			if (path.from !== entry.from) {
				agentList.push({ uid: entry.agent, latLng: path.latLngs[path.latLngs.length - i - 1] });
			} else {
				agentList.push({ uid: entry.agent, latLng: path.latLngs[i] });
			}
		}
	}

	// we will add hubs first
	// for (const hub of hubs.value) {
	// 	let min = Number.MAX_SAFE_INTEGER;
	// 	let max = -1;
	//
	// 	for (const id in hub.agents) {
	// 		const agent = hub.agents[id];
	// 		if (hub.agents[id].depart) {
	// 			const hour = dayHourToValue(agent.depart.day, agent.depart.hour);
	// 			if (hour > max) max = hour;
	// 		}
	// 		if (agent.arrive) {
	// 			const hour = dayHourToValue(agent.arrive.day, agent.arrive.hour);
	// 			if (hour < min) min = hour;
	// 		}
	// 	}
	// 	// start and stop places?
	// 	if (min === Number.MAX_SAFE_INTEGER) min = 0;
	// 	if (max === -1) max = Number.MAX_SAFE_INTEGER;
	//
	// 	if (min <= slider.value && max >= slider.value) {
	// 		agentList.push({ uid: hub.id, latLng: hub.latLng });
	// 		agentIds.push(...Object.keys(hub.agents)); // add agents, so we do not have double entries below
	// 		// TODO: das funktioniert so nicht...
	// 	}
	// }

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
</script>

<style>
@import "leaflet/dist/leaflet.css";
@import "@vueform/slider/themes/default.css";
</style>
