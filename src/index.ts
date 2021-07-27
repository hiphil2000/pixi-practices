import PixiApp from "./application/app";
import PolygonTool from "./application/polygon-tool";
import logo from "./images/github.svg";
import { SVG } from "pixi-svg";
import PloygonObject from "./objects/polygon";

const STAR = [ 80, 0, 100, 50, 160, 55, 115, 95, 130, 150, 80, 120, 30, 150, 45, 95, 0, 55, 60, 50 ];
const BOX = [0, 0, 25, 0, 25, 25, 0, 25];

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
	
	app.NewObject({
		id: `testobj`,
		points: STAR,
		x: Math.random() * 1000 % window.innerWidth,
		y: Math.random() * 1000 % window.innerHeight,
		backgroundColor: Math.random() * (0xFFFFFF - 0x000000) + 0x000000
	});

	for (let i = 0; i < 10; i++) {
		const obj = new PloygonObject({
			points: BOX,
			x: Math.random() * 100,
			y: Math.random() * 100,
			backgroundColor: Math.random() * (0xFFFFFF - 0x000000) + 0x000000
		});
		obj.UpdateSprite();
		app.GetObject("testobj")?.sprite.addChild(obj.sprite);
	}

	const xhr = new XMLHttpRequest();
	xhr.addEventListener("load", function() {
		const svg = new SVG(xhr.responseText.match(/(<svg.*\/>)/)![1]);
		app.AddChild(svg);
	})
	xhr.open("get", logo);
	xhr.send();

	window.addEventListener("resize", function() {
		app.Resize();
	});
})();

(window as any).PixiApp = PixiApp;
(window as any).PolygonTool = new PolygonTool();