export async function hilbertCurveSort2d(vectors) {
	// Base

	// Equal vectors / empty quadrant
	if (vectors.length < 2 || new Set(vectors.map(String)).size < 2) return vectors;

	// Recursion

	let [minX, minY] = ([maxX, maxY] = vectors[0]);
	for (const [x, y] of vectors) {
		if (x < minX) minX = x;
		else if (x > maxX) maxX = x;
		if (y < minY) minY = y;
		else if (y > maxY) maxY = y;
	}
	const maxSide = Math.max(maxX - minX, maxY - minY);
	let step = 0;
	let tmp = maxSide + 1;
	while ((tmp >>= 1) !== 0) step++;

	const side = (1 << step) - 1;
	let scaleX = side / (maxX - minX);
	let scaleY = side / (maxX - minX);
	if (!scaleX) scaleX = 1;
	if (!scaleY) scaleY = 1;
	const mid = step === 0 ? maxSide / 2 : (1 << (step - 1)) - 0.5;

	// Sub-quadrants according to Gray code sequence G_2
	const [quad00, quad01, quad11, quad10] = [[], [], [], []];
	for (let [x, y] of vectors) {
		// Fit vector to origin cube with scale 2^n
		x = scaleX * (x - minX);
		y = scaleY * (y - minY);

		switch (((x > mid) << 1) + (y > mid)) {
			case 0b00:
				quad00.push([y, x]);
				break;
			case 0b01:
				quad01.push([x, y]);
				break;
			case 0b11:
				quad11.push([x, y]);
				break;
			case 0b10:
				quad10.push([-y, -x]);
				break;
		}
	}

	const sorted = await Promise.all([
		hilbertCurveSort2d(quad00).then((res) => res.map(([x, y]) => [y, x])),
		hilbertCurveSort2d(quad01),
		hilbertCurveSort2d(quad11),
		hilbertCurveSort2d(quad10).then((res) => res.map(([x, y]) => [-y, -x])),
	]);

	// De-fitting
	return sorted.flat().map(([x, y]) => [x / scaleX + minX, y / scaleY + minY]);
}
