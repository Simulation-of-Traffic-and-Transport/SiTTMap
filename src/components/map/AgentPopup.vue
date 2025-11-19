<template>
	<div>
		<div>
			<FontAwesomeIcon icon="fa-solid fa-dolly" size="lg" class="pr-1" />
			<FontAwesomeIcon v-if="agent.type === 'hub'" icon="fa-solid fa-map-pin" size="lg" v-tooltip="'Hub'" />
			<FontAwesomeIcon v-else icon="fa-solid fa-horse" size="lg" v-tooltip="'Path'" />
		</div>
		<div class="my-1">
			<DateTimeInterval :from="agent.start" :to="agent.end" />
			<span v-if="agent.data.activity[0]?.reversed" class="pl-2 italic">reversed traversal</span>
		</div>
		<div class="mt-1 max-h-64 overflow-y-auto">
			<div v-for="agent in agent.agents" class="cursor-pointer" @click="selectAgent(agent)">{{ agent }}</div>
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
	isCancelled: {
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
