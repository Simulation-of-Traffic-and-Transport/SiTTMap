<template>
	<LControl position="bottomleft">
		<div class="bg-white bg-opacity-80 p-2 ml-10 flex flex-row items-center" style="min-width: 60vw">
			<Slider
				v-model="model"
				:min="start"
				:max="end"
				:step="-1"
				:lazy="false"
				:format="formatSliderTooltip"
				class="flex-grow m-1"
			/>

			<div class="flex-shrink p-1 cursor-pointer hover:text-slate-500" @click="isPlaying = !isPlaying">
				<FontAwesomeIcon :icon="isPlaying ? 'fa-solid fa-stop' : 'fa-solid fa-play'" size="lg" />
			</div>
		</div>
	</LControl>
</template>

<script setup>
import { LControl } from "@vue-leaflet/vue-leaflet";
import Slider from "@vueform/slider";
import { dtTOHuman } from "@/lib/dt_to_human";
import { ref, watch } from "vue";

const props = defineProps({
	start: {
		type: Number,
		required: true,
	},
	end: {
		type: Number,
		required: true,
	},
});

// data
const model = defineModel();
const isPlaying = ref(false);

const formatSliderTooltip = (value) => {
	const v = dtTOHuman(value);
	return "day: " + v[0] + ", hour: " + v[1];
};

// "Game" loop
let oldTimeStamp;

const sliderPlayingLoop = (timeStamp) => {
	// Calculate the number of seconds passed since the last frame
	if (!oldTimeStamp) {
		model.value += 0.01;
	} else {
		let tsDiff = timeStamp - oldTimeStamp;
		// increase slider value
		model.value += Math.ceil(tsDiff / 20) / 100;
	}

	oldTimeStamp = timeStamp;

	// stop at the end
	if (model.value >= props.end) {
		model.value = props.end;
		isPlaying.value = false;
	}

	// keep on playing
	if (isPlaying.value) {
		window.requestAnimationFrame(sliderPlayingLoop);
	}
};

// watcher for slider play
watch(isPlaying, () => {
	if (isPlaying.value) {
		window.requestAnimationFrame(sliderPlayingLoop);
	} else {
		// reset old time stamp
		oldTimeStamp = undefined;
	}
});
</script>
