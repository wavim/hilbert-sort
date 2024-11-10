export async function hilbertCurveSort2d(vectors) {
	// Recursion Base

	// Equal vectors / empty quadrant
	if (vectors.length < 2 || new Set(vectors.map(String)).size < 2) return vectors;

	// Recursion Step

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
	while ((tmp >>= 1)) step++;

	const side = (1 << step) - 1;
	let scaleX = side / (maxX - minX);
	let scaleY = side / (maxX - minX);
	if (!scaleX) scaleX = 1;
	if (!scaleY) scaleY = 1;

	// Fit vectors to origin cube with scale 2^n
	vectors = vectors.map(([x, y]) => [scaleX * (x - minX), scaleY * (y - minY)]);

	const mid = step === 0 ? maxSide / 2 : (1 << (step - 1)) - 0.5;

	// Sub-quadrants according to Gray code sequence G_2
	const [quad00, quad01, quad11, quad10] = [[], [], [], []];
	for (const [x, y] of vectors) {
		if (x < mid) {
			if (y < mid) {
				quad00.push([y, x]);
				continue;
			}
			quad01.push([x, y]);
			continue;
		}
		if (y > mid) {
			quad11.push([x, y]);
			continue;
		}
		quad10.push([-y, -x]);
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
