<template>
	<div class="bg-white bg-opacity-80 p-2 w-96">
		<div class="font-bold mb-2">
			Agent {{ agent.uid }}
			<FontAwesomeIcon
				v-if="!agent.parent"
				v-tooltip="'Start'"
				icon="fa-solid fa-play"
				class="ml-1 text-green-800"
			/>
			<FontAwesomeIcon
				v-if="agent.finished"
				v-tooltip="'Finished'"
				icon="fa-solid fa-check"
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
		<div v-if="agent.start_min && agent.start_max" class="text-center mb-2">
			<p class="font-bold">Start time range</p>
			<p><DateTimeInterval :from="agent.start_min" :to="agent.start_max" /></p>
		</div>
		<div v-if="agent.end_min && agent.end_max" class="text-center mb-2">
			<p class="font-bold">End time range</p>
			<p><DateTimeInterval :from="agent.end_min" :to="agent.end_max" /></p>
		</div>
		<div v-if="agent.parent" class="text-center mb-2">
			<p class="font-bold">Parent</p>
			<p class="hover:font-bold cursor-pointer" @click="model = agent.parent">{{ agent.parent }}</p>
		</div>
		<div v-if="descendants?.length" class="text-center mb-2">
			<p class="font-bold">Children</p>
			<p v-for="descendant in descendants" class="hover:font-bold cursor-pointer" @click="model = descendant.uid">
				{{ descendant.uid }}
			</p>
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
	descendants: {
		type: Array,
		default: () => [],
	},
});

const model = defineModel();
</script>
