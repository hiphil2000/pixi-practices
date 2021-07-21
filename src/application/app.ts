import { Application, Graphics, Renderer, utils } from "pixi.js"
import PolygonObject, { IPolygonObjectConfig } from "./object";

interface IPixiAppConfigs {
	width?: number;
	height?: number;
	backgroundColor?: number;
	autoResize?: boolean;
	antialias?: boolean;
}

export default class PixiApp {
	public readonly app: Application;
	
	private _type: string;
	private _objects: Array<PolygonObject> = [];

	constructor(configs: IPixiAppConfigs) {
		this._type = "WebGL";
		if(!utils.isWebGLSupported()) {
			this._type = "canvas";
		}

		this.app = new Application({
			...configs
		});
		
		return this;
	}

	public AppendView(target: HTMLElement) {
		target.appendChild(this.app.view);

		return this;
	}

	public NewObject(id: string, config: IPolygonObjectConfig) {
		this.AddObject(new PolygonObject(id, config, this.app.renderer as Renderer));
	}

	public AddObject(object: PolygonObject) {
		this._objects.push(object);
		this.app.stage.addChild(object.sprite);
		object.UpdateSprite();
	}

	public GetObject(key: string): PolygonObject | undefined {
		return this._objects.find(o => o.id === key);
	}

	public Draw() {
		this._objects.forEach(o => {
			o.UpdateSprite();
		});
	}
}