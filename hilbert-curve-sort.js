export async function hilbertCurveSort2d(vectors) {
	// Base Case

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
	while ((tmp >>= 1)) step++;

	const side = (1 << step) - 1;
	let scaleX = side / (maxX - minX);
	let scaleY = side / (maxX - minX);
	if (!scaleX) scaleX = 1;
	if (!scaleY) scaleY = 1;

	// Normalize vectors to origin with scale 2^n
	vectors = vectors.map(([x, y]) => [scaleX * (x - minX), scaleY * (y - minY)]);

	let subside;
	let mid;
	if (step) {
		subside = 1 << (step - 1);
		mid = subside - 0.5;
	} else {
		subside = mid = maxSide / 2;
	}

	// Sub-quadrants according to Gray code G(2)
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
	// De-normalize
	return sorted.flat().map(([x, y]) => [x / scaleX + minX, y / scaleY + minY]);
}
