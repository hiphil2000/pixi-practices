import { RenderTexture, IHitArea, Circle } from "pixi.js";
import BaseObject, { IBaseObjectConfig } from "./object"

export interface ICircleObjectConfig extends IBaseObjectConfig {
	radius: number
}

export default class CircleObject extends BaseObject {
	constructor(config: ICircleObjectConfig) {
		super(config);
		this._sprite.anchor.set(0.5);
	}

	protected GetTexture(): RenderTexture {
		const config = this.config as ICircleObjectConfig;

		this._g.clear();
		this._g.beginFill(config.backgroundColor, 1.0, true);
		this._g.lineStyle(1, config.backgroundColor);
		this._g.drawCircle(this.config.x || 0, this.config.y || 0, config.radius)
		this._g.endFill();

		return this._app.app.renderer.generateTexture(this._g);
	}

	protected GetHitArea(): IHitArea {
		const circleConfig = (this.config as ICircleObjectConfig);

		return new Circle(this.config.x, this.config.y, circleConfig.radius);
	}
}