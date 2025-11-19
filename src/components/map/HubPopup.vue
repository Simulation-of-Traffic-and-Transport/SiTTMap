<template>
	<LPopup :options="{ maxWidth: 600 }">
		<div class="font-bold mb-2">
			<FontAwesomeIcon icon="fa-solid fa-map-pin" size="lg" v-tooltip="'Hub'" /> {{ hub.id }}
		</div>
		<div>
			<FontAwesomeIcon v-if="hub.overnight" icon="fa-solid fa-bed" size="lg" v-tooltip="'Overnight'" />
			<FontAwesomeIcon
				v-if="isStart"
				icon="fa-solid fa-play"
				size="lg"
				class="text-green-800"
				v-tooltip="'Start Hub'"
			/>
			<FontAwesomeIcon
				v-if="isEnd"
				icon="fa-solid fa-check"
				size="lg"
				class="text-green-700"
				v-tooltip="'End Hub'"
			/>
		</div>
		<div class="max-h-64 overflow-y-auto">
			<table v-if="hub.activity?.length" class="w-full mt-2">
				<tbody>
					<tr class="text-slate-400 border border-gray-300">
						<th class="p-1">Agents</th>
						<th class="text-right p-1 pl-2">Arrival</th>
						<th class="text-right p-1 pl-2">Departure</th>
						<th class="text-right p-1 pl-2">Pause?</th>
					</tr>
					<tr v-for="activity in hub.activity" class="border border-gray-300">
						<td class="align-top p-1">
							<span
								v-for="agent in activity.agents"
								class="inline-block pr-2 cursor-pointer"
								@click="selectAgent(agent)"
							>
								{{ agent }}
							</span>
						</td>
						<td class="text-right align-top p-1 pl-2"><DateTime :date-time="activity.arrival" /></td>
						<td class="text-right align-top p-1 pl-2"><DateTime :date-time="activity.departure" /></td>
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
import DateTime from "@/components/DateTime.vue";

const props = defineProps({
	hub: {
		type: Object,
		required: true,
	},
	isStart: {
		type: Boolean,
		default: false,
	},
	isEnd: {
		type: Boolean,
		default: false,
	},
});

// events
const emits = defineEmits(["selectAgent"]);

const selectAgent = (agent) => {
	emits("selectAgent", agent);
};
</script>
