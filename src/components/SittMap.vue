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
					<LPopup>
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
					<LPopup>
						<PopupHub :hub="hub" />
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
import { LCircleMarker, LControl, LLayerGroup, LMap, LPolyline, LPopup, LTileLayer } from "@vue-leaflet/vue-leaflet";
import { computed, ref } from "vue";
import PopupPath from "@/components/PopupPath.vue";
import PopupHub from "@/components/PopupHub.vue";

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

// computed data
const paths = computed(() =>
	props.data.paths.map((path) => ({
		id: path.id,
		from: path.from,
		to: path.to,
		length_m: path.length_m,
		latLngs: path.geom.coordinates.map((coord) => [coord[1], coord[0]]), // leaflet lat/lng switch
		heights: path.geom.coordinates.map((coord) => coord[2]),
		agents: (props.data?.legs[path.id] && props.data.legs[path.id]?.agents) || [],
		agentUids:
			(props.data?.legs[path.id] &&
				props.data.legs[path.id]?.agents &&
				Object.keys(props.data.legs[path.id].agents)) ||
			[],
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
const agents = computed(() => [...props.data.agents_finished, ...props.data.agents_cancelled]);
const selectedAgent = computed(() => {
	const filtered = selectedAgentUid.value ? agents.value.filter((a) => a.uid === selectedAgentUid.value) : [];
	return filtered.length > 0 ? filtered[0] : {};
});
const selectedAgentUids = computed(() => selectedAgent.value?.uids || []);

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
</script>

<style>
@import "leaflet/dist/leaflet.css";
</style>
