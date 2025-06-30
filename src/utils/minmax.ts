export function minmax(vecs: number[][], i: number): [number, number] {
	let min = Infinity;
	let max = -Infinity;

	for (const item of vecs) {
		const value = item[i];

		if (value < min) {
			min = value;
			continue;
		}

		if (value > max) {
			max = value;
		}
	}

	return [min, max];
}
