<template>
	<div class="bg-white bg-opacity-80 p-2 w-96">
		<div class="font-bold mb-2">
			Agent {{ agent.uid }}
			<FontAwesomeIcon
				v-if="starts.includes(agent.start_hub)"
				v-tooltip="'Start'"
				icon="fa-solid fa-play"
				class="ml-1 text-green-800"
			/>
			<FontAwesomeIcon
				v-if="agent.finished"
				v-tooltip="'Finished'"
				icon="fa-solid fa-flag-checkered"
				class="ml-1 text-green-700"
				bounce
			/>
			<FontAwesomeIcon
				v-else-if="agent.cancelled"
				v-tooltip="'Cancelled'"
				icon="fa-solid fa-ban"
				class="text-red-500"
			/>
		</div>
		<div class="text-center mb-2">
			<p class="font-bold">{{ agent.start_hub }}</p>
			<p>↓</p>
			<p class="font-bold">{{ agent.end_hub }}</p>
			<p><DateTimeInterval :from="agent.min_dt" :to="agent.max_dt" /></p>
		</div>
		<div v-if="agent.parent" class="text-center mb-2">
			<p class="font-bold">Parent</p>
			<p class="hover:font-bold cursor-pointer" @click="model = agent.parent">{{ agent.parent }}</p>
		</div>
	</div>
</template>

<script setup>
import DateTimeInterval from "@/components/DateTimeInterval.vue";

const props = defineProps({
	agent: {
		type: Object,
		required: true,
	},
	starts: {
		type: Array,
		default: () => [],
	},
});

const model = defineModel();
</script>
