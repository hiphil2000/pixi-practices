import { Viewport } from "pixi-viewport";
import {utils, Application, Sprite, Polygon} from "pixi.js";
import PixiApp from "./application/app";

const STAR = [ 80, 0, 100, 50, 160, 55, 115, 95, 130, 150, 80, 120, 30, 150, 45, 95, 0, 55, 60, 50 ];

(() => {
	let app = PixiApp.GetInstance({
		viewport: {
			worldWidth: 2000,
			worldHeight: 2000,
			drag: true,
			zoom: true
		}
	}, {
		width: window.innerWidth,
		height: window.innerHeight,
		autoResize: true,
		antialias: true,
		backgroundColor: 0x2d2d2d
	}).AppendView(document.body as HTMLElement);

	const viewport = new Viewport({
		screenWidth: window.innerWidth,
		screenHeight: window.innerHeight,
		worldWidth: 2000,
		worldHeight: 2000,

		interaction: app.app.renderer.plugins.interaction
	});

	for(let i = 0; i < 5; i++) {
		app.NewObject(`test_${i}`, {
			points: STAR,
			x: Math.random() * 1000 % window.innerWidth,
			y: Math.random() * 1000 % window.innerHeight
		});
	}

	window.addEventListener("resize", function() {
		app.Resize();
	});

	console.log(app.GetObject("test_1")?.sprite.width);
})();