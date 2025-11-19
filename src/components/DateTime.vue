<template>
	<span v-if="dt" class="whitespace-nowrap">
		<span class="text-red-600 font-bold">{{ dt[0] }}</span> {{ dt[1] }}
	</span>
</template>

<script setup>
import { computed } from "vue";
import { dtTOHuman } from "@/lib/dt_to_human";

const props = defineProps({
	dateTime: {
		//type: Number | undefined,
		required: true,
	},
});

const dt = computed(() => dtTOHuman(props.dateTime));
</script>
