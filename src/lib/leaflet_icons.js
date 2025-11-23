import L from "leaflet";

export const stdIcon = new L.Icon.Default();

export const cancelledIcon = new L.Icon.Default();
cancelledIcon.options.iconUrl = "marker-icon-red.png";
cancelledIcon.options.iconRetinaUrl = "marker-icon-2x-red.png";

export const sleepingIcon = new L.Icon.Default();
sleepingIcon.options.iconUrl = "marker-icon-gray.png";
sleepingIcon.options.iconRetinaUrl = "marker-icon-2x-gray.png";

export const cancelledIcon2 = new L.Icon.Default();
cancelledIcon2.options.iconUrl = "marker-icon-cancelled.png";
cancelledIcon2.options.iconRetinaUrl = "marker-icon-2x-cancelled.png";
