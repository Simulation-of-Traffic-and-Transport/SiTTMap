<template>
	<div>
		<div class="text-center mb-6">Select Si.T.T. output file (JSON)</div>
		<div v-if="error" class="mb-6 bg-red-900 text-white p-3"><strong>Error:</strong> {{ error }}</div>
		<form class="flex items-center space-x-6">
			<div class="shrink-0">
				<FontAwesomeIcon icon="fa-solid fa-arrow-up-from-bracket" size="3x" :beat="isParsing" />
			</div>
			<label class="block" :style="{ visibility: isParsing ? 'hidden' : 'visible' }">
				<span class="sr-only">Choose profile photo</span>
				<input
					type="file"
					class="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
					@change="onFileSelected"
				/>
			</label>
		</form>
	</div>
</template>

<script setup>
/**
 * Data loader to locally load Si.T.T. output
 */
import { ref } from "vue";
// data
const error = ref("");
const isParsing = ref(false);

// events
const emit = defineEmits(["change"]);

const onFileSelected = async function ($event) {
	// reset error
	error.value = "";

	if (!$event?.target?.files || !$event.target.files.length) {
		error.value = "No file selected.";
		return;
	}
	const file = $event.target.files[0];

	// is this a correct file?
	if (file.type === "application/json" || file.name.split(".").pop() === "json") {
		// start parsing
		isParsing.value = true;

		// read into string
		try {
			const fileContents = await file.text();
			const jsonContent = JSON.parse(fileContents);

			// check the content a bit - does it make sense?
			if (
				jsonContent &&
				jsonContent.from &&
				jsonContent.to &&
				jsonContent.start &&
				jsonContent.end &&
				jsonContent.simulation_route &&
				jsonContent.agents &&
				jsonContent.hubs &&
				jsonContent.paths
			) {
				emit("change", jsonContent); // emit event
			} else {
				error.value = "Incorrect file type: Please provide JSON output file";
			}
		} catch (e) {
			error.value = e.message || e;
		}
	} else {
		error.value = "Incorrect file type: Please provide JSON output file";
	}
};
</script>
