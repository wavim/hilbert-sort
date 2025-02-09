export type VEC2 = [number, number];
export type VEC3 = [number, number, number];

// Gray Code defining orthants' order
const GRAY_CODE = (n: number) => [...Array(1 << n).keys()].map((bit) => bit ^ (bit >> 1));
const GRAY_2 = GRAY_CODE(2);
const GRAY_3 = GRAY_CODE(3);

export function hilbertCurveSort2D(vec2s: VEC2[]): VEC2[] {
	let [minX, minY] = [Infinity, Infinity];
	let [maxX, maxY] = [-Infinity, -Infinity];
	for (const [x, y] of vec2s) {
		[minX, minY] = [Math.min(x, minX), Math.min(y, minY)];
		[maxX, maxY] = [Math.max(x, maxX), Math.max(y, maxY)];
	}
	const sideX = maxX - minX;
	const sideY = maxY - minY;
	const maxSide = Math.max(sideX, sideY);

	// Centering and scaling data to fit hypercube
	const scaleX = maxSide === 0 || sideX === 0 ? 1 : maxSide / sideX;
	const scaleY = maxSide === 0 || sideY === 0 ? 1 : maxSide / sideY;
	const fitVec2s = <VEC2[]>vec2s.map(([x, y]) => [scaleX * (x - minX), scaleY * (y - minY)]);

	// De-scaling and de-centering the results from actual sort
	return runHilbertCurveSort2D(fitVec2s, maxSide).map(([x, y]) => [x / scaleX + minX, y / scaleY + minY]);
}

export function hilbertCurveSort3D(vec3s: VEC3[]): VEC3[] {
	let [minX, minY, minZ] = [Infinity, Infinity, Infinity];
	let [maxX, maxY, maxZ] = [-Infinity, -Infinity, -Infinity];
	for (const [x, y, z] of vec3s) {
		[minX, minY, minZ] = [Math.min(x, minX), Math.min(y, minY), Math.min(z, minZ)];
		[maxX, maxY, maxZ] = [Math.max(x, maxX), Math.max(y, maxY), Math.max(z, maxZ)];
	}
	const sideX = maxX - minX;
	const sideY = maxY - minY;
	const sideZ = maxZ - minZ;
	const maxSide = Math.max(sideX, sideY, sideZ);

	// Centering and scaling data to fit hypercube
	const scaleX = maxSide === 0 || sideX === 0 ? 1 : maxSide / sideX;
	const scaleY = maxSide === 0 || sideY === 0 ? 1 : maxSide / sideY;
	const scaleZ = maxSide === 0 || sideZ === 0 ? 1 : maxSide / sideZ;
	const fitVec3s = <VEC3[]>(
		vec3s.map(([x, y, z]) => [scaleX * (x - minX), scaleY * (y - minY), scaleZ * (z - minZ)])
	);

	// De-scaling and de-centering the results from actual sort
	return runHilbertCurveSort3D(fitVec3s, maxSide).map(([x, y, z]) => [
		x / scaleX + minX,
		y / scaleY + minY,
		z / scaleZ + minZ,
	]);
}

function runHilbertCurveSort2D(vec2s: VEC2[], side: number): VEC2[] {
	// Base
	if (vec2s.length < 2 || new Set(vec2s.map(String)).size === 1) return vec2s;

	// Recursion
	const mid = side / 2;
	// Transformation of quadrants to (from) U_2(1)
	const maps = {
		0b00: ([x, y]: VEC2) => <VEC2>[y, x],
		0b01: ([x, y]: VEC2) => <VEC2>[x, y - mid],
		0b11: ([x, y]: VEC2) => <VEC2>[x - mid, y - mid],
		0b10: ([x, y]: VEC2) => <VEC2>[mid - y, side - x],
	};
	const inverseMaps = {
		0b00: ([x, y]: VEC2) => <VEC2>[y, x],
		0b01: ([x, y]: VEC2) => <VEC2>[x, y + mid],
		0b11: ([x, y]: VEC2) => <VEC2>[x + mid, y + mid],
		0b10: ([x, y]: VEC2) => <VEC2>[side - y, mid - x],
	};

	const quads: VEC2[][] = [[], [], [], []];
	for (const vec2 of vec2s) {
		const bitX = Number(vec2[0] > mid);
		const bitY = Number(vec2[1] > mid);
		// Quadrant as G_2 bit
		const quad = (bitX << 1) + bitY;
		quads[quad].push(vec2);
	}

	// Transform quadrants to U_2(1)
	const sorted = quads.map((quadVec2s, quad) =>
		runHilbertCurveSort2D(quadVec2s.map(maps[<keyof typeof maps>quad]), mid),
	);
	// Order quadrants w.r.t G_2 and de-transform
	return GRAY_2.flatMap((quad) => sorted[quad].map(inverseMaps[<keyof typeof inverseMaps>quad]));
}

function runHilbertCurveSort3D(vec3s: VEC3[], side: number): VEC3[] {
	// Base
	if (vec3s.length < 2 || new Set(vec3s.map(String)).size === 1) return vec3s;

	// Recursion
	const mid = side / 2;
	// Transformation of octants to (from) U_3(1)
	const maps = {
		0b000: ([x, y, z]: VEC3) => <VEC3>[z, x, y],
		0b001: ([x, y, z]: VEC3) => <VEC3>[y, z - mid, x],
		0b011: ([x, y, z]: VEC3) => <VEC3>[y - mid, z - mid, x],
		0b010: ([x, y, z]: VEC3) => <VEC3>[x, side - y, mid - z],
		0b110: ([x, y, z]: VEC3) => <VEC3>[x - mid, side - y, mid - z],
		0b111: ([x, y, z]: VEC3) => <VEC3>[side - y, z - mid, side - x],
		0b101: ([x, y, z]: VEC3) => <VEC3>[mid - y, z - mid, side - x],
		0b100: ([x, y, z]: VEC3) => <VEC3>[mid - z, side - x, y],
	};
	const inverseMaps = {
		0b000: ([x, y, z]: VEC3) => <VEC3>[y, z, x],
		0b001: ([x, y, z]: VEC3) => <VEC3>[z, x, y + mid],
		0b011: ([x, y, z]: VEC3) => <VEC3>[z, x + mid, y + mid],
		0b010: ([x, y, z]: VEC3) => <VEC3>[x, side - y, mid - z],
		0b110: ([x, y, z]: VEC3) => <VEC3>[x + mid, side - y, mid - z],
		0b111: ([x, y, z]: VEC3) => <VEC3>[side - z, side - x, y + mid],
		0b101: ([x, y, z]: VEC3) => <VEC3>[side - z, mid - x, y + mid],
		0b100: ([x, y, z]: VEC3) => <VEC3>[side - y, z, mid - x],
	};

	const octs: VEC3[][] = [[], [], [], [], [], [], [], []];
	for (const vec3 of vec3s) {
		const bitX = Number(vec3[0] > mid);
		const bitY = Number(vec3[1] > mid);
		const bitZ = Number(vec3[2] > mid);
		// Octant as G_3 bit
		const oct = (bitX << 2) + (bitY << 1) + bitZ;
		octs[oct].push(vec3);
	}

	// Transform octants to U_3(1)
	const sorted = octs.map((octVec3s, oct) =>
		runHilbertCurveSort3D(octVec3s.map(maps[<keyof typeof maps>oct]), mid),
	);
	// Order octants w.r.t G_3 and de-transform
	return GRAY_3.flatMap((oct) => sorted[oct].map(inverseMaps[<keyof typeof inverseMaps>oct]));
}
