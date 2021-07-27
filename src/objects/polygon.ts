import { IHitArea, Polygon, RenderTexture } from "pixi.js";
import BaseObject, { IBaseObjectConfig } from "./object";

export interface IPolygonObjectConfig extends IBaseObjectConfig {
	points: Array<number>;
}

export default class PloygonObject extends BaseObject {
	constructor(config: IPolygonObjectConfig) {
		super(config);
	}

	protected GetTexture(): RenderTexture {
		const config = this.config as IPolygonObjectConfig;

		this._g.clear();
		this._g.beginFill(config.backgroundColor, 1.0, true);
		this._g.lineStyle(1, config.backgroundColor);
		this._g.drawPolygon(config.points);
		this._g.endFill();

		return this._app.app.renderer.generateTexture(this._g);
	}

	protected GetHitArea(): IHitArea {
		return new Polygon((this.config as IPolygonObjectConfig).points);
	}
	
}