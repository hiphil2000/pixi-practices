import {utils, Application, Sprite, Polygon} from "pixi.js";
import PixiApp from "./application/app";
import PolygonObject from "./application/object";

const CANVAS_ID = "main-canvas";

(() => {
	let app = new PixiApp({
		width: 256, height: 256
	}).AppendView(document.body as HTMLElement);

	app.NewObject("test", { points: [0, 0, 50, 0, 50, 50, 0, 50] })
})();