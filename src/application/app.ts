import { Application, Graphics, utils } from "pixi.js"
import PolygonObject from "./object";

interface IPixiAppConfigs {
	width?: number;
	height?: number;
	backgroundColor?: number;
	autoResize?: boolean;
}

export default class PixiApp {
	public readonly app: Application;
	
	private _type: string;
	private _g: Graphics;
	private _objects: Array<PolygonObject> = [];

	constructor(configs: IPixiAppConfigs) {
		this._type = "WebGL";
		if(!utils.isWebGLSupported()) {
			this._type = "canvas";
		}

		this.app = new Application({
			...configs
		});
		
		this._g = new Graphics();
		this.app.stage.addChild(this._g);

		return this;
	}

	public AppendView(target: HTMLElement) {
		target.appendChild(this.app.view);

		return this;
	}

	public AddObject(object: PolygonObject) {
		this._objects.push(object);
	}

	public GetObject(key: string): PolygonObject | undefined {
		return this._objects.find(o => o.id === key);
	}

	public Draw() {
		this._g.clear();
		this._objects.forEach(o => {
			o.Draw(this._g);
		});
	}
}