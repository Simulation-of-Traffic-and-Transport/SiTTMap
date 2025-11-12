export const dtTOHuman = function (dt) {
	if (!dt) return undefined;

	const hours = dt % 24;
	const days = Math.floor(dt / 24) + 1;

	const hour = ("" + Math.floor(hours)).padStart(2, "0");
	const minutes = ("" + Math.floor((hours % 1) * 60)).padStart(2, "0");
	return [days, [hour, minutes].join(":")];
};
