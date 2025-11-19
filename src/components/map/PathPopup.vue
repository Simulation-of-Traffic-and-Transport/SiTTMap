<template>
	<LPopup :options="{ maxWidth: 600 }">
		<div class="font-bold mb-2">
			<FontAwesomeIcon :icon="dataByType.icon" v-tooltip="dataByType.label" :class="dataByType.class" size="lg" />
			{{ path.id }}
		</div>
		<div>{{ path.from }} &ndash; {{ path.to }}</div>
		<div>Length: {{ Math.round(path.length_m) }}m</div>
		<div class="max-h-64 overflow-y-auto">
			<table v-if="path.activity?.length" class="w-full mt-2">
				<tbody>
					<tr class="text-slate-400 border border-gray-300">
						<th class="p-1">Agents</th>
						<th class="text-right p-1 pl-2">Arrival</th>
						<th class="text-right p-1 pl-2">Departure</th>
						<th class="text-right p-1 pl-2">Pause?</th>
					</tr>
					<tr v-for="activity in path.activity" class="border border-gray-300">
						<td class="align-top p-1">
							<span
								v-for="agent in activity.agents"
								class="inline-block pr-2 cursor-pointer"
								@click="selectAgent(agent)"
							>
								{{ agent }}
							</span>
						</td>
						<td class="text-right align-top p-1 pl-2"><DateTime :date-time="activity.legs[0]" /></td>
						<td class="text-right align-top p-1 pl-2">
							<DateTime :date-time="activity.legs[activity.legs.length - 1]" />
						</td>
						<td class="text-right align-top p-1 pl-2">
							{{ activity.rest?.length > 2 ? activity.rest[2] : "" }}
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</LPopup>
</template>

<script setup>
import { LPopup } from "@vue-leaflet/vue-leaflet";
import { computed } from "vue";
import DateTime from "@/components/DateTime.vue";

const props = defineProps({
	path: {
		type: Object,
		required: true,
	},
});

// events
const emits = defineEmits(["selectAgent"]);

const selectAgent = (agent) => {
	emits("selectAgent", agent);
};

const dataByType = computed(() => {
	switch (props.path.type) {
		case "river":
			return {
				label: "River",
				icon: "fa-solid fa-water",
				class: "text-blue-500",
			};
		case "lake":
			return {
				label: "Lake",
				icon: "fa-solid fa-sailboat",
				class: "text-cyan-500",
			};
	}
	return {
		label: "Road",
		icon: "fa-solid fa-road",
		class: "text-gray-600",
	};
});
</script>
