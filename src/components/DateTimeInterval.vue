<template>
	<span v-if="hasDate" class="whitespace-nowrap">
		<template v-if="hasSameDay">
			<span v-if="showDay" class="text-red-600 font-bold">{{ fromDate[0] }}</span> {{ fromDate[1] }}&ndash;{{
				toDate[1]
			}}
		</template>
		<template v-else>
			<span v-if="showDay" class="text-red-600 font-bold">{{ fromDate[0] }}</span> {{ fromDate[1] }}&ndash;<span
				class="text-red-600 font-bold"
				>{{ toDate[0] }}</span
			>
			{{ toDate[1] }}
		</template>
	</span>
</template>

<script setup>
import { computed } from "vue";
import { dtTOHuman } from "@/lib/dt_to_human";

const props = defineProps({
	from: {
		type: Number,
		required: true,
	},
	to: {
		type: Number,
		required: true,
	},
	showDay: {
		type: Boolean,
		default: true,
	},
});

// computed properties
const fromDate = computed(() => dtTOHuman(props.from));
const toDate = computed(() => dtTOHuman(props.to));

const hasDate = computed(() => fromDate.value && toDate.value);

const hasSameDay = computed(() => hasDate.value && fromDate.value[0] === toDate.value[0]);
</script>
