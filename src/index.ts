import {utils, Application, Sprite, Polygon} from "pixi.js";
import PixiApp from "./application/app";
import PolygonObject from "./application/object";

const CANVAS_ID = "main-canvas";

(() => {
	let app = new PixiApp({
		width: 256, height: 256
	}).AppendView(document.body as HTMLElement);

	app.AddObject(new PolygonObject("test", {
		points: [0, 0, 10, 0, 10, 10, 0, 10]
	}));

	app.app.view.addEventListener("mousemove", function(e: MouseEvent) {
		const object = app.GetObject("test");
		if (object === undefined)
			return;

		object.config.x = e.offsetX;
		object.config.y = e.offsetY;

		app.Draw();
	})
})();