export type Vec2 = [number, number];
export type Vec3 = [number, number, number];

type Maps2D = Record<number, (vec2: Vec2) => Vec2>;
type Maps3D = Record<number, (vec3: Vec3) => Vec3>;

// Gray Code defining orthants' order
const gray2 = [0b00, 0b01, 0b11, 0b10];
const gray3 = [0b000, 0b001, 0b011, 0b010, 0b110, 0b111, 0b101, 0b100];

function minmax(vecs: number[][], i: number): [number, number] {
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

export function sort2D(vec2s: Vec2[]): Vec2[] {
	const [minx, maxx] = minmax(vec2s, 0);
	const [miny, maxy] = minmax(vec2s, 1);

	const sidex = maxx - minx;
	const sidey = maxy - miny;
	const bound = Math.max(sidex, sidey);

	const scalex = bound === 0 || sidex === 0 ? 1 : bound / sidex;
	const scaley = bound === 0 || sidey === 0 ? 1 : bound / sidey;

	// Centering and scaling data to fit hypercube
	const fitted = vec2s.map(([x, y]) => [scalex * (x - minx), scaley * (y - miny)]) as Vec2[];

	// De-scaling and de-centering the results from actual sort
	return runSort2D(fitted, bound).map(
		([x, y]) => [x / scalex + minx, y / scaley + miny] as Vec2,
	);
}

function runSort2D(vec2s: Vec2[], side: number): Vec2[] {
	if (isBase2D(vec2s)) {
		return vec2s;
	}

	const mid = side / 2;

	// Transformations of quadrants to (from) U_2(1)
	const maps: Maps2D = {
		0b00: ([x, y]) => [y, x],
		0b01: ([x, y]) => [x, y - mid],
		0b11: ([x, y]) => [x - mid, y - mid],
		0b10: ([x, y]) => [mid - y, side - x],
	};
	const invs: Maps2D = {
		0b00: ([x, y]) => [y, x],
		0b01: ([x, y]) => [x, y + mid],
		0b11: ([x, y]) => [x + mid, y + mid],
		0b10: ([x, y]) => [side - y, mid - x],
	};

	const quads: [Vec2[], Vec2[], Vec2[], Vec2[]] = [[], [], [], []];

	for (const vec2 of vec2s) {
		const bitx = +(vec2[0] > mid);
		const bity = +(vec2[1] > mid);

		// Quadrant as G_2 bit
		const quad = (bitx << 1) + bity;
		quads[quad].push(vec2);
	}

	// Transform quadrants to U_2(1)
	const sorted = quads.map((vec2s, quad) => runSort2D(vec2s.map(maps[quad]), mid));

	// Order quadrants w.r.t G_2 and inv-transform
	return gray2.flatMap((quad) => sorted[quad].map(invs[quad]));
}

function isBase2D(vec2s: Vec2[]): boolean {
	if (vec2s.length < 2) {
		return true;
	}

	const first = vec2s[0];

	return vec2s.slice(1).every((vec2) => {
		return vec2[0] === first[0] && vec2[1] === first[1];
	});
}

export function sort3D(vec3s: Vec3[]): Vec3[] {
	const [minx, maxx] = minmax(vec3s, 0);
	const [miny, maxy] = minmax(vec3s, 1);
	const [minz, maxz] = minmax(vec3s, 2);

	const sidex = maxx - minx;
	const sidey = maxy - miny;
	const sidez = maxz - minz;
	const bound = Math.max(sidex, sidey, sidez);

	const scalex = bound === 0 || sidex === 0 ? 1 : bound / sidex;
	const scaley = bound === 0 || sidey === 0 ? 1 : bound / sidey;
	const scalez = bound === 0 || sidez === 0 ? 1 : bound / sidez;

	// Centering and scaling data to fit hypercube
	const fitted = vec3s.map(([x, y, z]) => [
		scalex * (x - minx),
		scaley * (y - miny),
		scalez * (z - minz),
	]) as Vec3[];

	// De-scaling and de-centering the results from actual sort
	return runSort3D(fitted, bound).map(
		([x, y, z]) => [x / scalex + minx, y / scaley + miny, z / scalez + minz] as Vec3,
	);
}

function runSort3D(vec3s: Vec3[], side: number): Vec3[] {
	if (isBase3D(vec3s)) {
		return vec3s;
	}

	const mid = side / 2;

	// Transformations of octants to (from) U_3(1)
	const maps: Maps3D = {
		0b000: ([x, y, z]) => [z, x, y],
		0b001: ([x, y, z]) => [y, z - mid, x],
		0b011: ([x, y, z]) => [y - mid, z - mid, x],
		0b010: ([x, y, z]) => [x, side - y, mid - z],
		0b110: ([x, y, z]) => [x - mid, side - y, mid - z],
		0b111: ([x, y, z]) => [side - y, z - mid, side - x],
		0b101: ([x, y, z]) => [mid - y, z - mid, side - x],
		0b100: ([x, y, z]) => [mid - z, side - x, y],
	};
	const invs: Maps3D = {
		0b000: ([x, y, z]) => [y, z, x],
		0b001: ([x, y, z]) => [z, x, y + mid],
		0b011: ([x, y, z]) => [z, x + mid, y + mid],
		0b010: ([x, y, z]) => [x, side - y, mid - z],
		0b110: ([x, y, z]) => [x + mid, side - y, mid - z],
		0b111: ([x, y, z]) => [side - z, side - x, y + mid],
		0b101: ([x, y, z]) => [side - z, mid - x, y + mid],
		0b100: ([x, y, z]) => [side - y, z, mid - x],
	};

	const octs: [Vec3[], Vec3[], Vec3[], Vec3[], Vec3[], Vec3[], Vec3[], Vec3[]] = [
		[],
		[],
		[],
		[],
		[],
		[],
		[],
		[],
	];

	for (const vec3 of vec3s) {
		const bitx = +(vec3[0] > mid);
		const bity = +(vec3[1] > mid);
		const bitz = +(vec3[2] > mid);

		// Octant as G_3 bit
		const oct = (bitx << 2) + (bity << 1) + bitz;
		octs[oct].push(vec3);
	}

	// Transform octants to U_3(1)
	const sorted = octs.map((octVec3s, oct) => runSort3D(octVec3s.map(maps[oct]), mid));

	// Order octants w.r.t G_3 and inv-transform
	return gray3.flatMap((oct) => sorted[oct].map(invs[oct]));
}

function isBase3D(vec3s: Vec3[]): boolean {
	if (vec3s.length < 2) {
		return true;
	}

	const first = vec3s[0];

	return vec3s.slice(1).every((vec3) => {
		return vec3[0] === first[0] && vec3[1] === first[1] && vec3[2] === first[2];
	});
}
