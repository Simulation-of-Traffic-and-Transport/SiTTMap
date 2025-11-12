<template>
	<span class="text-red-600 font-bold" v-if="dt">{{ dt[0] }}</span> {{ dt[1] }}
</template>

<script setup>
import { computed } from "vue";
import { dtTOHuman } from "@/lib/dt_to_human";

const props = defineProps({
	dateTime: {
		type: Number,
		required: true,
	},
});

const dt = computed(() => dtTOHuman(props.dateTime));
</script>
