import {utils, Application, Sprite, Polygon} from "pixi.js";
import PixiApp from "./application/app";
import PolygonObject from "./application/object";

const CANVAS_ID = "main-canvas";

(() => {
	let app = new PixiApp({
		width: 256,
		height: 256,
		antialias: true
	}).AppendView(document.body as HTMLElement);

	app.NewObject("test", { points: [
		80, 0,
		100, 50,
		160, 55,
		115, 95,
		130, 150,
		80, 120,
		30, 150,
		45, 95,
		0, 55,
		60, 50,
	] })
})();