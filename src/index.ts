import {
	hilbertCurveSort2D,
	hilbertCurveSort3D,
	Vec2,
	Vec3,
} from "./algorithms/ts/hilbert-curve-sort.js";
import { minmax } from "./utils/minmax.js";

function rand(a: number, b: number): number {
	return Math.random() * (b - a) + a;
}

// #region points

const pointsCanvas = document.getElementById("points-canvas") as HTMLCanvasElement;
const pointsInput = document.getElementById("points-input") as HTMLTextAreaElement;
const pointsSet = document.getElementById("points-set") as HTMLButtonElement;
const pointsNumber = document.getElementById("points-number") as HTMLInputElement;
const pointsRandom = document.getElementById("points-random") as HTMLButtonElement;

const pointsSide = document.documentElement.clientWidth * 0.35;

pointsCanvas.width = pointsSide;
pointsCanvas.height = pointsSide;

const pointsContext = pointsCanvas.getContext("2d");

if (!pointsContext) {
	throw new Error("missing canvas context");
}

function drawPoints(context: CanvasRenderingContext2D, points: Vec2[]): void {
	const sorted = hilbertCurveSort2D(points);

	const [minx, maxx] = minmax(sorted, 0);
	const [miny, maxy] = minmax(sorted, 1);

	const scalex = (pointsSide - 10) / (maxx - minx);
	const scaley = (pointsSide - 10) / (maxy - miny);

	context.clearRect(0, 0, pointsSide, pointsSide);
	context.beginPath();

	const mapped = sorted.map(([x, y]) => [scalex * (x - minx) + 5, scaley * (y - miny) + 5]);

	for (const [x, y] of mapped) {
		context.lineTo(x, pointsSide - y);
	}

	context.stroke();
}

function setPoints(context: CanvasRenderingContext2D): void {
	const points = pointsInput.value
		.trim()
		.split("\n")
		.map((c) => c.split(",").map((x) => +x.trim()))
		.filter((v) => v.length === 2) as Vec2[];

	if (points.length < 3) {
		return;
	}

	drawPoints(context, points);
}

pointsSet.addEventListener("click", () => {
	setPoints(pointsContext);
});

pointsRandom.addEventListener("click", () => {
	let n = +pointsNumber.value;

	if (n < 2 || Number.isNaN(n)) {
		n = 200;
	}

	const points = [...Array<number>(n)].map(() => {
		return [rand(0, pointsSide), rand(0, pointsSide)] as Vec2;
	});

	drawPoints(pointsContext, points);
});

pointsNumber.value = "200";

const order = 5;
const pointBits = [...Array(1 << order).keys()];

pointsInput.textContent = pointBits
	.flatMap((x) => pointBits.map((y) => [x, y].join(",")))
	.join("\n");
setPoints(pointsContext);

// #endregion points

// #region colors

const colorsOriginal = document.getElementById("colors-original") as HTMLCanvasElement;
const colorsSorted = document.getElementById("colors-sorted") as HTMLCanvasElement;
const colorsInput = document.getElementById("colors-input") as HTMLTextAreaElement;
const colorsSet = document.getElementById("colors-set") as HTMLButtonElement;
const colorsNumber = document.getElementById("colors-number") as HTMLInputElement;
const colorsRandom = document.getElementById("colors-random") as HTMLButtonElement;

const colorsWidth = document.documentElement.clientWidth;
const colorsHeight = 100;

colorsOriginal.width = colorsWidth;
colorsSorted.width = colorsWidth;
colorsOriginal.height = colorsHeight;
colorsSorted.height = colorsHeight;

const colorsOriginalContext = colorsOriginal.getContext("2d");
const colorsSortedContext = colorsSorted.getContext("2d");

if (!colorsOriginalContext || !colorsSortedContext) {
	throw new Error("missing canvas context");
}

function drawColors(
	originalContext: CanvasRenderingContext2D,
	sortedContext: CanvasRenderingContext2D,
	colors: Vec3[],
): void {
	const sorted = hilbertCurveSort3D(colors);

	const width = colorsWidth / colors.length;

	originalContext.clearRect(0, 0, colorsWidth, colorsHeight);

	for (let i = 0; i < colors.length; i++) {
		const [r, g, b] = colors[i].map((x) => x.toFixed(2));

		originalContext.fillStyle = `rgb(${r} ${g} ${b})`;
		originalContext.fillRect(i * width, 0, width + 1, colorsHeight);
	}

	sortedContext.clearRect(0, 0, colorsWidth, colorsHeight);

	for (let i = 0; i < sorted.length; i++) {
		const [r, g, b] = sorted[i].map((x) => x.toFixed(2));

		sortedContext.fillStyle = `rgb(${r} ${g} ${b})`;
		sortedContext.fillRect(i * width, 0, width + 1, colorsHeight);
	}
}

function setColors(
	originalContext: CanvasRenderingContext2D,
	sortedContext: CanvasRenderingContext2D,
): void {
	const colors = colorsInput.value
		.trim()
		.split("\n")
		.map((c) => c.split(",").map((x) => +x.trim()))
		.filter((v) => v.length === 3) as Vec3[];

	if (colors.length < 3) {
		return;
	}

	drawColors(originalContext, sortedContext, colors);
}

colorsSet.addEventListener("click", () => {
	setColors(colorsOriginalContext, colorsSortedContext);
});

colorsRandom.addEventListener("click", () => {
	let n = +colorsNumber.value;

	if (n < 2 || Number.isNaN(n)) {
		n = 100;
	}

	const colors = [...Array<number>(n)].map(() => {
		return [rand(0, 255), rand(0, 255), rand(0, 255)] as Vec3;
	});

	drawColors(colorsOriginalContext, colorsSortedContext, colors);
});

colorsNumber.value = "100";

const step = 32;
const colorBits = [...Array(Math.ceil(255 / step)).keys()].map((b) => b * step);

colorsInput.textContent = colorBits
	.flatMap((r) => {
		return colorBits.flatMap((g) => {
			return colorBits.map((b) => [r, g, b].join(","));
		});
	})
	.join("\n");
setColors(colorsOriginalContext, colorsSortedContext);

// #endregion colors
