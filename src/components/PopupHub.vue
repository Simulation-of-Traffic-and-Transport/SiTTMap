<template>
	<div class="font-bold mb-2">{{ hub.id }}</div>
	<div>
		<FontAwesomeIcon v-if="hub.overnight" icon="fa-solid fa-bed" size="lg" title="Overnight" />
	</div>
</template>

<script setup>
defineProps({
	hub: {
		type: Object,
		required: true,
	},
});
</script>
