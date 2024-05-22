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
							<span class="ml-1">
								<DateTime :date-time="{ day: agent.day, time: Math.round(agent.hour * 100) / 100 }" />
							</span>
						</button>
					</div>
				</div>
			</LControl>

			<LControl position="bottomleft">
				<div
					class="bg-white bg-opacity-80 p-2 ml-10 flex flex-row items-center"
					style="width: 50vw"
					:style="{ 'min-width': maxTime + 'px' }"
				>
					<Slider
						v-model="slider"
						:min="minTime"
						:max="maxTime"
						:step="-1"
						:lazy="false"
						:format="formatSliderTooltip"
						class="flex-grow m-1"
					/>

					<div
						class="flex-shrink p-1 cursor-pointer hover:text-slate-500"
						@click="sliderPlaying = !sliderPlaying"
					>
						<FontAwesomeIcon :icon="sliderPlaying ? 'fa-solid fa-stop' : 'fa-solid fa-play'" size="lg" />
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
					<LPopup :options="{ maxWidth: 600 }">
						<PopupPath :path="path" />
					</LPopup>
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

			<LLayerGroup v-if="agentPositions?.length">
				<LMarker v-for="positionData in agentPositions" :key="positionData.id" :lat-lng="positionData.latLng">
					<LPopup :options="{ maxWidth: 600, minWidth: 200 }">
						<PopupPositionData :data="positionData" />
					</LPopup>
				</LMarker>
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
import { computed, onBeforeMount, ref, watch } from "vue";
import PopupPath from "@/components/PopupPath.vue";
import PopupHub from "@/components/PopupHub.vue";
import PopupPositionData from "@/components/PopupPositionData.vue";
import Slider from "@vueform/slider";
import IntervalTree from "@flatten-js/interval-tree";
import DateTime from "@/components/DateTime.vue";

// helper functions
const valueToDayHourMinute = (value) => ({
	day: Math.floor(value / 24) + 1,
	hour: Math.floor(value % 24),
	minute: Math.round(((value % 24) % 1) * 60),
});
const dayHourToValue = (v) => (v.day - 1) * 24 + v.time;

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
		if (entry.agents) {
			for (const uid in entry.agents) {
				const agent = entry.agents[uid];

				const start = agent.start ? dayHourToValue(agent.start) : -1;
				const end = agent.end ? dayHourToValue(agent.end) : -1;

				if (start > -1 && end > -1) {
					const data = {
						id: entry.id,
						type: entry.type,
						agent: uid,
						start: agent.start,
						end: agent.end,
					};
					if (entry.type === "edge") {
						data.from = entry.from;
						data.to = entry.to;
						data.leg_times = agent.leg_times;
					}
					tree.insert([start, end], data);
				}
			}
		}
	}

	return tree;
});
/**
 * This keeps all agents per path entry (path is the key)
 */
const agentsPerPath = computed(() =>
	Object.fromEntries(props.data.history.filter((entry) => entry.type === "edge").map((entry) => [entry.id, entry]))
);
/**
 * This keeps all agents per hub (hubId is the key)
 */
const agentsPerHub = computed(() =>
	Object.fromEntries(props.data.history.filter((entry) => entry.type === "node").map((entry) => [entry.id, entry]))
);
/**
 * Corrected data of paths
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
			heights: path.geom.coordinates.map((coord) => coord[2]),
			uids:
				(agentsPerPath.value[path.id]?.agents && Object.keys(agentsPerPath.value[path.id].agents).sort()) || [],
			agents: agentsPerPath.value[path.id]?.agents || {},
		}))
);
/**
 * List of all hubs with corrected data
 */
const hubs = computed(() =>
	props.data.nodes
		.filter((hub) => hub?.geom?.coordinates?.length)
		.map((hub) => ({
			id: hub.id,
			type: hub.type,
			overnight: hub.overnight,
			latLng: [hub.geom.coordinates[1], hub.geom.coordinates[0]], // leaflet lat/lng switch
			height: hub.geom.coordinates[2],
			uids: (agentsPerHub.value[hub.id]?.agents && Object.keys(agentsPerHub.value[hub.id].agents).sort()) || [],
			agents: agentsPerHub.value[hub.id]?.agents || {},
		}))
);
const hubsToShow = computed(() => hubs.value.filter((hub) => hub?.type !== "river"));
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
	() =>
		Math.ceil(
			(intervalTree.value.keys &&
				intervalTree.value.keys[0] &&
				intervalTree.value.keys[intervalTree.value.keys.length - 1][1]) ||
				0
		)
	// we use the key list of the tree - this is handy, because we know it is correctly sorted
);
/**
 * agent positions at current slider setting
 */
const agentPositions = computed(() => {
	// iterate all the paths and agents to find possible candidates
	const positionList = {};

	for (const entry of intervalTree.value.search([slider.value, slider.value])) {
		if (entry.type === "node") {
			if (!(entry.id in positionList)) {
				const hub = hubs.value.find((hub) => hub.id === entry.id);

				if (hub) {
					const activeAgents = [];

					// reduce agents to list to those that are active at this moment
					for (const uid of hub.uids) {
						if (
							slider.value >= dayHourToValue(hub.agents[uid].start) &&
							slider.value <= dayHourToValue(hub.agents[uid].end)
						) {
							activeAgents.push(uid);
						}
					}

					positionList[entry.id] = {
						id: entry.id,
						type: "node",
						label: entry.id,
						latLng: hub.latLng,
						overnight: hub.overnight,
						uids: activeAgents,
						agents: hub.agents,
					};
				} else {
					console.error("Path not found in hub list: " + entry.id, entry);
				}
			}
		} else {
			let legTime = dayHourToValue(entry.start);
			let i = 0;

			while (legTime < slider.value && i < (entry.leg_times?.length || -1)) {
				legTime += entry.leg_times[i++];
			}

			const path = paths.value.find((path) => path.id === entry.id);

			if (path) {
				const activeAgents = [];

				// reduce agents to list to those that are active at this moment
				for (const uid of path.uids) {
					if (
						slider.value >= dayHourToValue(path.agents[uid].start) &&
						slider.value <= dayHourToValue(path.agents[uid].end)
					) {
						activeAgents.push(uid);
					}
				}

				// check the direction of the indexes for some entries
				const latLng = path.latLngs[path.from !== entry.from ? path.latLngs.length - i - 1 : i];

				// We add the lat/lng to edges, because there is the possibility to have multiple points on the
				// same edge at the same time. This will allow for multiple pointers to appear here.
				positionList[entry.id + "_" + latLng[0] + "_" + latLng[1]] = {
					id: entry.id + latLng[0] + "_" + latLng[1],
					type: "edge",
					label: path.from !== entry.from ? path.to + " ↦ " + path.from : path.from + " ↦ " + path.to,
					latLng,
					uids: activeAgents,
					agents: path.agents,
				};
			} else {
				console.error("Path not found in path list: " + entry.id, entry);
			}
		}
	}

	return Object.values(positionList);
});

// data
const zoom = ref(4);
const map = ref();
const hoverId = ref(null);
const selectedAgentUid = ref(null);
const slider = ref(minTime.value);
const sliderPlaying = ref(false);
const bounds = ref(null);

// events
onBeforeMount(() => {
	// calculate bounds
	bounds.value = L.latLngBounds();

	for (const node of props.data.nodes) {
		if (node.geom?.coordinates?.length) {
			bounds.value.extend(L.latLng([node.geom.coordinates[1], node.geom.coordinates[0]]));
		}
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
		path.uids.length &&
		selectedAgentUids.value.some((e) => path.uids.includes(e))
	) {
		return "#f00";
	}

	switch (path.type) {
		case "river":
			return "#3388ff";
		case "lake":
			return "#00CED1";
	}
	return "#2F4F4F";
};
const formatSliderTooltip = (value) => {
	const v = valueToDayHourMinute(value);
	return "day: " + v.day + ", hour: " + ("" + v.hour).padStart(2, "0") + ":" + ("" + v.minute).padStart(2, "0");
};

// "Game" loop
let oldTimeStamp;

const sliderPlayingLoop = (timeStamp) => {
	console.log(timeStamp);

	// Calculate the number of seconds passed since the last frame
	if (!oldTimeStamp) {
		slider.value += 0.01;
	} else {
		let tsDiff = timeStamp - oldTimeStamp;
		// increase slider value
		slider.value += Math.ceil(tsDiff / 20) / 100;
	}

	oldTimeStamp = timeStamp;

	// keep on playing
	if (sliderPlaying.value) {
		window.requestAnimationFrame(sliderPlayingLoop);
	}
};

// watcher for slider play
watch(sliderPlaying, () => {
	if (sliderPlaying.value) {
		window.requestAnimationFrame(sliderPlayingLoop);
	} else {
		// reset old time stamp
		oldTimeStamp = undefined;
	}
});
</script>

<style>
@import "leaflet/dist/leaflet.css";
@import "@vueform/slider/themes/default.css";
</style>
