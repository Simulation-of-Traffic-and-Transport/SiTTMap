<template>
	<span class="text-red-600 font-bold">{{ day }}</span> {{ time }}
</template>

<script setup>
const props = defineProps({
	dateTime: {
		type: Object,
		required: true,
	},
});

const day = props.dateTime.day;

const time = (() => {
	const hours = Math.floor(props.dateTime.time);
	const minutes = Math.round((props.dateTime.time - hours) * 60);

	return ("" + hours).padStart(2, "0") + ":" + ("" + minutes).padStart(2, "0");
})();
</script>
