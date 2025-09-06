import { sort2D, Vec2 } from "./ts/hilbert-sort.js";

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
	pointsResult.height = pointsResult.width; // also resets canvas

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
	const points = randomPoints(pointsCntInput.valueAsNumber, pointsStdInput.valueAsNumber);
	renderPoints(sort2D(points));
}
updatePoints();

pointsCntInput.oninput = pointsStdInput.oninput = updatePoints;
