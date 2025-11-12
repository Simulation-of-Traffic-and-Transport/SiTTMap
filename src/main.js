import { createApp } from "vue";
import App from "./App.vue";
import { vTooltip } from "floating-vue";

// Font Awesome
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
	faArrowUpFromBracket,
	faBed,
	faBan,
	faCheck,
	faDolly,
	faMapPin,
	faPlay,
	faRoad,
	faSailboat,
	faWater,
	faStop,
	faFlagCheckered,
} from "@fortawesome/free-solid-svg-icons";

library.add(
	faArrowUpFromBracket,
	faBed,
	faBan,
	faCheck,
	faDolly,
	faMapPin,
	faPlay,
	faRoad,
	faSailboat,
	faWater,
	faStop,
	faFlagCheckered
);

import "./assets/styles.css";
import "floating-vue/dist/style.css";

const app = createApp(App);
app.directive("tooltip", vTooltip);
app.component("FontAwesomeIcon", FontAwesomeIcon).mount("#app");
