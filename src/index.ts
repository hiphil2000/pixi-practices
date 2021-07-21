import {utils, Application} from "pixi.js";
import PixiApp from "./app";

const CANVAS_ID = "main-canvas";

(() => {
	let app = new PixiApp({
		width: 256, height: 256
	}).AppendView(document.body as HTMLElement);
})();