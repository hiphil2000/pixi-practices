import { Application, utils } from "pixi.js"

interface IPixiAppConfigs {
	width?: number;
	height?: number;
	backgroundColor?: number;
	autoResize?: boolean;
}

export default class PixiApp {
	public readonly app: Application;
	
	private _type: string;

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
}