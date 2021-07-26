import PixiApp from "./application/app";
import PolygonTool from "./application/polygon-tool";
import logo from "./images/github.svg";
import { SVG } from "pixi-svg";

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

	for(let i = 0; i < 5; i++) {
		app.NewObject({
			id: `test_${i}`,
			points: STAR,
			x: Math.random() * 1000 % window.innerWidth,
			y: Math.random() * 1000 % window.innerHeight,
			backgroundColor: Math.random() * (0xFFFFFF - 0x000000) + 0x000000
		});
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