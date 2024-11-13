export async function h2CurveSort(vec2s) {
	let [minX, minY] = ([maxX, maxY] = vec2s[0]);
	for (let i = 1; i < vec2s.length; i++) {
		const [x, y] = vec2s[i];
		if (x < minX) minX = x;
		else if (x > maxX) maxX = x;
		if (y < minY) minY = y;
		else if (y > maxY) maxY = y;
	}
	const sideX = maxX - minX;
	const sideY = maxY - minY;
	const maxSide = Math.max(sideX, sideY);

	// Centering and scaling data to fit hypercube
	let scaleX = maxSide / sideX;
	let scaleY = maxSide / sideY;
	if (scaleX === 0 || !Number.isFinite(scaleX)) scaleX = 1;
	if (scaleY === 0 || !Number.isFinite(scaleY)) scaleY = 1;
	const normVec2s = vec2s.map(([x, y]) => [scaleX * (x - minX), scaleY * (y - minY)]);

	// De-scaling and de-centering the results from actual sort
	return (await _h2CurveSort(normVec2s, maxSide)).map(([x, y]) => [x / scaleX + minX, y / scaleY + minY]);
}

export async function h3CurveSort(vec3s) {
	let [minX, minY, minZ] = ([maxX, maxY, maxZ] = vec3s[0]);
	for (let i = 1; i < vec3s.length; i++) {
		const [x, y, z] = vec3s[i];
		if (x < minX) minX = x;
		else if (x > maxX) maxX = x;
		if (y < minY) minY = y;
		else if (y > maxY) maxY = y;
		if (z < minZ) minZ = z;
		else if (z > maxZ) maxZ = z;
	}
	const sideX = maxX - minX;
	const sideY = maxY - minY;
	const sideZ = maxZ - minZ;
	const maxSide = Math.max(sideX, sideY, sideZ);

	// Centering and scaling data to fit hypercube
	let scaleX = maxSide / sideX;
	let scaleY = maxSide / sideY;
	let scaleZ = maxSide / sideZ;
	if (scaleX === 0 || !Number.isFinite(scaleX)) scaleX = 1;
	if (scaleY === 0 || !Number.isFinite(scaleY)) scaleY = 1;
	if (scaleZ === 0 || !Number.isFinite(scaleZ)) scaleZ = 1;
	const normVec3s = vec3s.map(([x, y, z]) => [scaleX * (x - minX), scaleY * (y - minY), scaleZ * (z - minZ)]);

	// De-scaling and de-centering the results from actual sort
	return (await _h3CurveSort(normVec3s, maxSide)).map(([x, y, z]) => [
		x / scaleX + minX,
		y / scaleY + minY,
		z / scaleZ + minZ,
	]);
}

// Gray Code defining orthants' order
const grayCode = (n) => [...Array(2 ** n).keys()].map((bit) => bit ^ (bit >> 1));
const GRAY_2 = grayCode(2);
const GRAY_3 = grayCode(3);

async function _h2CurveSort(vec2s, side) {
	// Base
	if (vec2s.length < 2 || new Set(vec2s.map(String)).size === 1) return vec2s;

	// Recursion
	const mid = side / 2;
	// Transformation of quadrants to (from) U_2(1)
	const maps = {
		0b00: ([x, y]) => [y, x],
		0b01: ([x, y]) => [x, y - mid],
		0b11: ([x, y]) => [x - mid, y - mid],
		0b10: ([x, y]) => [mid - y, side - x],
	};
	const inverseMaps = {
		0b00: ([x, y]) => [y, x],
		0b01: ([x, y]) => [x, y + mid],
		0b11: ([x, y]) => [x + mid, y + mid],
		0b10: ([x, y]) => [side - y, mid - x],
	};

	const quads = [...Array(4)].map(() => []);
	for (const vec2 of vec2s) {
		const bitX = vec2[0] > mid;
		const bitY = vec2[1] > mid;
		// Quadrant as G_2 bit
		const quad = (bitX << 1) + bitY;
		quads[quad].push(vec2);
	}

	// Transform quadrants to U_2(1)
	const sorted = await Promise.all(
		quads.map(async (quadVec2s, quad) => await _h2CurveSort(quadVec2s.map(maps[quad]), mid)),
	);
	// Order quadrants w.r.t G_2 and de-transform
	return GRAY_2.flatMap((quad) => sorted[quad].map(inverseMaps[quad]));
}

async function _h3CurveSort(vec3s, side) {
	// Base
	if (vec3s.length < 2 || new Set(vec3s.map(String)).size === 1) return vec3s;

	// Recursion
	const mid = side / 2;
	// Transformation of octants to (from) U_3(1)
	const maps = {
		0b000: ([x, y, z]) => [z, x, y],
		0b001: ([x, y, z]) => [y, z - mid, x],
		0b011: ([x, y, z]) => [y - mid, z - mid, x],
		0b010: ([x, y, z]) => [x, side - y, mid - z],
		0b110: ([x, y, z]) => [x - mid, side - y, mid - z],
		0b111: ([x, y, z]) => [side - y, z - mid, side - x],
		0b101: ([x, y, z]) => [mid - y, z - mid, side - x],
		0b100: ([x, y, z]) => [mid - z, side - x, y],
	};
	const inverseMaps = {
		0b000: ([x, y, z]) => [y, z, x],
		0b001: ([x, y, z]) => [z, x, y + mid],
		0b011: ([x, y, z]) => [z, x + mid, y + mid],
		0b010: ([x, y, z]) => [x, side - y, mid - z],
		0b110: ([x, y, z]) => [x + mid, side - y, mid - z],
		0b111: ([x, y, z]) => [side - z, side - x, y + mid],
		0b101: ([x, y, z]) => [side - z, mid - x, y + mid],
		0b100: ([x, y, z]) => [side - y, z, mid - x],
	};

	const octs = [...Array(8)].map(() => []);
	for (const vec3 of vec3s) {
		const bitX = vec3[0] > mid;
		const bitY = vec3[1] > mid;
		const bitZ = vec3[2] > mid;
		// Octant as G_3 bit
		const oct = (bitX << 2) + (bitY << 1) + bitZ;
		octs[oct].push(vec3);
	}

	// Transform octants to U_3(1)
	const sorted = await Promise.all(
		octs.map(async (octVec3s, oct) => await _h3CurveSort(octVec3s.map(maps[oct]), mid)),
	);
	// Order octants w.r.t G_3 and de-transform
	return GRAY_3.flatMap((oct) => sorted[oct].map(inverseMaps[oct]));
}
