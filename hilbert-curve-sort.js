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
	let scaleY = side / (maxY - minY);
	if (scaleX === 0 || !Number.isFinite(scaleX)) scaleX = 1;
	if (scaleY === 0 || !Number.isFinite(scaleY)) scaleY = 1;
	const mid = step === 0 ? maxSide / 2 : (1 << (step - 1)) - 0.5;

	// Sub-quadrants according to Gray code sequence G_2
	const [q00, q01, q11, q10] = [[], [], [], []];
	for (let [x, y] of vectors) {
		// Fit vector to origin square with scale 2^n
		x = scaleX * (x - minX);
		y = scaleY * (y - minY);

		switch (((x > mid) << 1) + (y > mid)) {
			case 0b00:
				q00.push([y, x]);
				break;
			case 0b01:
				q01.push([x, y]);
				break;
			case 0b11:
				q11.push([x, y]);
				break;
			case 0b10:
				q10.push([-y, -x]);
				break;
		}
	}

	const sorted = await Promise.all([
		hilbertCurveSort2d(q00).then((res) => res.map(([x, y]) => [y, x])),
		hilbertCurveSort2d(q01),
		hilbertCurveSort2d(q11),
		hilbertCurveSort2d(q10).then((res) => res.map(([x, y]) => [-y, -x])),
	]);

	// De-fitting
	return sorted.flat().map(([x, y]) => [x / scaleX + minX, y / scaleY + minY]);
}

export async function hilbertCurveSort3d(vectors) {
	// Base

	// Equal vectors / empty quadrant
	if (vectors.length < 2 || new Set(vectors.map(String)).size < 2) return vectors;

	// Recursion

	let [minX, minY, minZ] = ([maxX, maxY, maxZ] = vectors[0]);
	for (const [x, y, z] of vectors) {
		if (x < minX) minX = x;
		else if (x > maxX) maxX = x;
		if (y < minY) minY = y;
		else if (y > maxY) maxY = y;
		if (z < minZ) minZ = z;
		else if (z > maxZ) maxZ = z;
	}
	const maxSide = Math.max(maxX - minX, maxY - minY, maxZ - minZ);
	let step = 0;
	let tmp = maxSide + 1;
	while ((tmp >>= 1) !== 0) step++;

	const side = (1 << step) - 1;
	let scaleX = side / (maxX - minX);
	let scaleY = side / (maxY - minY);
	let scaleZ = side / (maxZ - minZ);
	if (scaleX === 0 || !Number.isFinite(scaleX)) scaleX = 1;
	if (scaleY === 0 || !Number.isFinite(scaleY)) scaleY = 1;
	if (scaleZ === 0 || !Number.isFinite(scaleZ)) scaleZ = 1;
	const mid = step === 0 ? maxSide / 2 : (1 << (step - 1)) - 0.5;

	// Sub-octants according to Gray code sequence G_3
	const [o000, o001, o011, o010, o110, o111, o101, o100] = [[], [], [], [], [], [], [], []];
	for (let [x, y, z] of vectors) {
		// Fit vector to origin cube with scale 2^n
		x = scaleX * (x - minX);
		y = scaleY * (y - minY);
		z = scaleZ * (z - minZ);

		switch (((x > mid) << 2) + ((y > mid) << 1) + (z > mid)) {
			case 0b000:
				o000.push([z, x, y]);
				break;
			case 0b001:
				o001.push([y, z, x]);
				break;
			case 0b011:
				o011.push([y, z, x]);
				break;
			case 0b010:
				o010.push([x, -y, -z]);
				break;
			case 0b110:
				o110.push([x, -y, -z]);
				break;
			case 0b111:
				o111.push([-y, z, -x]);
				break;
			case 0b101:
				o101.push([-y, z, -x]);
				break;
			case 0b100:
				o100.push([-z, -x, y]);
				break;
		}
	}

	const sorted = await Promise.all([
		hilbertCurveSort3d(o000).then((res) => res.map(([x, y, z]) => [y, z, x])),
		hilbertCurveSort3d(o001).then((res) => res.map(([x, y, z]) => [z, x, y])),
		hilbertCurveSort3d(o011).then((res) => res.map(([x, y, z]) => [z, x, y])),
		hilbertCurveSort3d(o010).then((res) => res.map(([x, y, z]) => [x, -y, -z])),
		hilbertCurveSort3d(o110).then((res) => res.map(([x, y, z]) => [x, -y, -z])),
		hilbertCurveSort3d(o111).then((res) => res.map(([x, y, z]) => [-z, -x, y])),
		hilbertCurveSort3d(o101).then((res) => res.map(([x, y, z]) => [-z, -x, y])),
		hilbertCurveSort3d(o100).then((res) => res.map(([x, y, z]) => [-y, z, -x])),
	]);

	// De-fitting
	return sorted.flat().map(([x, y, z]) => [x / scaleX + minX, y / scaleY + minY, z / scaleZ + minZ]);
}
