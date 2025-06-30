import { minmax } from "../../utils/minmax";

export type Vec2 = [number, number];
export type Vec3 = [number, number, number];

export function hilbertCurveSort2D(vec2s: Vec2[]): Vec2[] {
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
	return sort2D(fitted, bound).map(
		([x, y]) => [x / scalex + minx, y / scaley + miny] as Vec2,
	);
}

export function hilbertCurveSort3D(vec3s: Vec3[]): Vec3[] {
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
	return sort3D(fitted, bound).map(
		([x, y, z]) => [x / scalex + minx, y / scaley + miny, z / scalez + minz] as Vec3,
	);
}

type Maps2D = Record<number, (vec2: Vec2) => Vec2>;
type Maps3D = Record<number, (vec3: Vec3) => Vec3>;

// Gray Code defining orthants' order
function gray(n: number): number[] {
	return [...Array(1 << n).keys()].map((bit) => bit ^ (bit >> 1));
}

const gray2 = gray(2);
const gray3 = gray(3);

function sort2D(vec2s: Vec2[], side: number): Vec2[] {
	if (vec2s.length < 2 || new Set(vec2s.map(String)).size === 1) {
		return vec2s;
	}

	const mid = side / 2;

	// Transformations of quadrants to (from) U_2(1)
	const maps: Maps2D = {
		0b00: ([x, y]: Vec2) => [y, x],
		0b01: ([x, y]: Vec2) => [x, y - mid],
		0b11: ([x, y]: Vec2) => [x - mid, y - mid],
		0b10: ([x, y]: Vec2) => [mid - y, side - x],
	};
	const invs: Maps2D = {
		0b00: ([x, y]: Vec2) => [y, x],
		0b01: ([x, y]: Vec2) => [x, y + mid],
		0b11: ([x, y]: Vec2) => [x + mid, y + mid],
		0b10: ([x, y]: Vec2) => [side - y, mid - x],
	};

	const quads: Vec2[][] = [[], [], [], []];

	for (const vec2 of vec2s) {
		const bitx = Number(vec2[0] > mid);
		const bity = Number(vec2[1] > mid);

		// Quadrant as G_2 bit
		const quad = (bitx << 1) + bity;
		quads[quad].push(vec2);
	}

	// Transform quadrants to U_2(1)
	const sorted = quads.map((vec2s, quad) => sort2D(vec2s.map(maps[quad]), mid));

	// Order quadrants w.r.t G_2 and inv-transform
	return gray2.flatMap((quad) => sorted[quad].map(invs[quad]));
}

function sort3D(vec3s: Vec3[], side: number): Vec3[] {
	if (vec3s.length < 2 || new Set(vec3s.map(String)).size === 1) {
		return vec3s;
	}

	const mid = side / 2;

	// Transformations of octants to (from) U_3(1)
	const maps: Maps3D = {
		0b000: ([x, y, z]: Vec3) => [z, x, y],
		0b001: ([x, y, z]: Vec3) => [y, z - mid, x],
		0b011: ([x, y, z]: Vec3) => [y - mid, z - mid, x],
		0b010: ([x, y, z]: Vec3) => [x, side - y, mid - z],
		0b110: ([x, y, z]: Vec3) => [x - mid, side - y, mid - z],
		0b111: ([x, y, z]: Vec3) => [side - y, z - mid, side - x],
		0b101: ([x, y, z]: Vec3) => [mid - y, z - mid, side - x],
		0b100: ([x, y, z]: Vec3) => [mid - z, side - x, y],
	};
	const invs: Maps3D = {
		0b000: ([x, y, z]: Vec3) => [y, z, x],
		0b001: ([x, y, z]: Vec3) => [z, x, y + mid],
		0b011: ([x, y, z]: Vec3) => [z, x + mid, y + mid],
		0b010: ([x, y, z]: Vec3) => [x, side - y, mid - z],
		0b110: ([x, y, z]: Vec3) => [x + mid, side - y, mid - z],
		0b111: ([x, y, z]: Vec3) => [side - z, side - x, y + mid],
		0b101: ([x, y, z]: Vec3) => [side - z, mid - x, y + mid],
		0b100: ([x, y, z]: Vec3) => [side - y, z, mid - x],
	};

	const octs: Vec3[][] = [[], [], [], [], [], [], [], []];

	for (const vec3 of vec3s) {
		const bitx = Number(vec3[0] > mid);
		const bity = Number(vec3[1] > mid);
		const bitz = Number(vec3[2] > mid);

		// Octant as G_3 bit
		const oct = (bitx << 2) + (bity << 1) + bitz;
		octs[oct].push(vec3);
	}

	// Transform octants to U_3(1)
	const sorted = octs.map((octVec3s, oct) => sort3D(octVec3s.map(maps[oct]), mid));

	// Order octants w.r.t G_3 and inv-transform
	return gray3.flatMap((oct) => sorted[oct].map(invs[oct]));
}
