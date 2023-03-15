import { createApp } from "vue";
import App from "./App.vue";

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
	faRoad,
} from "@fortawesome/free-solid-svg-icons";

library.add(faArrowUpFromBracket, faBed, faBan, faCheck, faDolly, faMapPin, faRoad);

import "./assets/styles.css";

createApp(App).component("FontAwesomeIcon", FontAwesomeIcon).mount("#app");
