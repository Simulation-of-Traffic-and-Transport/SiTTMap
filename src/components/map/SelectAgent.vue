<template>
	<select v-model="model">
		<option :value="null">Agent</option>
		<option v-for="agent in agents" :key="agent.uid" :value="agent.uid">
			{{ agent.uid }}
		</option>
	</select>
</template>

<script setup>
defineProps({
	agents: {
		type: Array,
		required: true,
	},
});

const model = defineModel();
</script>
