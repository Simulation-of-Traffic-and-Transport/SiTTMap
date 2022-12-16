<template>
	<div class="h-screen w-screen flex justify-center items-center">
		<div class="shrink">
			<SittMap v-if="loadedData" :data="loadedData" />
			<DataLoader v-else @change="loadedData = $event" />
		</div>
	</div>
</template>

<script setup>
import DataLoader from "./components/DataLoader.vue";
import SittMap from "./components/SittMap.vue";
import { ref } from "vue";

// data
const loadedData = ref(null);
</script>
