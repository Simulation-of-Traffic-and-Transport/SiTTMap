<template>
	<div class="h-screen w-screen flex justify-center items-center">
		<div class="shrink">
			<div v-if="loading">Loading...</div>
			<SittMap v-else-if="loadedData" :data="loadedData" />
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
const loading = ref(false);

// predefined data?
if (window.location.search) {
	const dataMatches = /data=([^&#=]*)/.exec(window.location.search);
	const dataLocation = decodeURIComponent(dataMatches[1]);
	loading.value = true;
	fetch(dataLocation).then((response) => {
		response.json().then((data) => {
			loadedData.value = data;
			loading.value = false;
		});
	});
}
</script>
