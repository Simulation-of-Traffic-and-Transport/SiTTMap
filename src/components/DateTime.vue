<template>
	<span class="text-red-600 font-bold">{{ day }}</span> {{ time }}
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
	dateTime: {
		type: Number,
		required: true,
	},
});

const day = computed(() => Math.ceil(props.dateTime / 24));
const time = computed(() => {
	const hours = Math.floor(props.dateTime % 24);
	const minutes = Math.round(((props.dateTime % 24) - hours) * 60);

	return ("" + hours).padStart(2, "0") + ":" + ("" + minutes).padStart(2, "0");
});
</script>
