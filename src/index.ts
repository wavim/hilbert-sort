import { sort2D, sort3D, Vec2, Vec3 } from "./ts/hilbert-sort.js";

const pointsCntInput = document.getElementById("points-cnt") as HTMLInputElement;
const pointsStdInput = document.getElementById("points-std") as HTMLInputElement;
const pointsResult = document.getElementById("points-result") as HTMLCanvasElement;

function randomPoints(n: number, std: number): Vec2[] {
	const points: Vec2[] = [];

	const pad = 0;
	const w = pointsResult.width - pad;

	for (let i = 0; i < n; i++) {
		const u0 = Math.random();
		const u1 = Math.random();
		const z0 = Math.sqrt(-2 * Math.log(u0)) * Math.cos(2 * Math.PI * u1);
		const z1 = Math.sqrt(-2 * Math.log(u0)) * Math.sin(2 * Math.PI * u1);

		const x = w * (0.5 + z0 * std);
		const y = w * (0.5 + z1 * std);

		points.push([
			Math.min(Math.max(x, 0), w) + pad / 2,
			Math.min(Math.max(y, 0), w) + pad / 2,
		]);
	}
	return points;
}

function renderPoints(points: Vec2[]): void {
	const ctx = pointsResult.getContext("2d")!;
	const len = points.length;

	for (let i = 0; i < len; i++) {
		ctx.beginPath();
		ctx.moveTo(...points.at(i - 1)!);
		ctx.lineTo(...points.at(i)!);

		ctx.strokeStyle = `hsl(${(i / (len - 1)) * 360} 100 50)`;
		ctx.stroke();
	}
}

function updatePoints(): void {
	pointsResult.width = pointsResult.height = pointsResult.clientWidth; // resets canvas

	const points = randomPoints(pointsCntInput.valueAsNumber, pointsStdInput.valueAsNumber);
	renderPoints(sort2D(points));
}
updatePoints();

pointsCntInput.oninput = pointsStdInput.oninput = pointsResult.onclick = updatePoints;

const colorsCntInput = document.getElementById("colors-cnt") as HTMLInputElement;
const colorsBefore = document.getElementById("colors-before") as HTMLCanvasElement;
const colorsResult = document.getElementById("colors-result") as HTMLCanvasElement;

function randomColors(n: number): Vec3[] {
	const colors: Vec3[] = [];

	for (let i = 0; i < n; i++) {
		colors.push([
			Math.floor(Math.random() * 256),
			Math.floor(Math.random() * 256),
			Math.floor(Math.random() * 256),
		]);
	}
	return colors;
}

function renderColors(canvas: HTMLCanvasElement, colors: Vec3[]): void {
	const ctx = canvas.getContext("2d")!;

	const w = canvas.width / colors.length;
	const h = canvas.height;

	for (let i = 0; i < colors.length; i++) {
		ctx.fillStyle = `rgb(${colors[i].join(" ")})`;
		ctx.fillRect(w * i, 0, w + 1, h);
	}
}

function updateColors(): void {
	// reset canvas
	colorsBefore.width = colorsResult.width = colorsBefore.clientWidth;
	colorsBefore.height = colorsResult.height = colorsBefore.clientHeight;

	const colors = randomColors(colorsCntInput.valueAsNumber);
	renderColors(colorsBefore, colors);
	renderColors(colorsResult, sort3D(colors));
}
updateColors();

colorsCntInput.oninput = colorsBefore.onclick = colorsResult.onclick = updateColors;
