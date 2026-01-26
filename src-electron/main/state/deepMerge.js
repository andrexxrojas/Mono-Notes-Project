export function deepMerge(defaults, saved) {
	if (typeof defaults !== "object" || defaults === null) return saved;
	if (typeof saved !== "object" || saved === null) return defaults;

	const result = Array.isArray(defaults) ? [...defaults] : { ...defaults };

	for (const key of Object.keys(saved)) {
		result[key] =
			key in defaults ? deepMerge(defaults[key], saved[key]) : saved[key];
	}

	return result;
}
