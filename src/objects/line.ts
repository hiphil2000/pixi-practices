import { IHitArea, Point, Polygon, Rectangle, RenderTexture, Text } from "pixi.js";
import BaseObject, { IBaseObjectConfig } from "./object";

export interface ILineObjectConfig extends IBaseObjectConfig {
	lineFrom: Point,
	lineTo: Point,
	label: {
		text: string
		fontSize?: number,
		color?: number
	}
}

export default class LineObject extends BaseObject {
	private _text: Text;

	public set text(text: string) {
		this._text.text = text;
		this._text.updateText(false);
	}

	constructor(config: ILineObjectConfig) {
		super(config);
		this._sprite.interactive = false;
		this._text = new Text("test", {
			fontSize: config.label.fontSize || 8,
			align: "center",
			fill: config.label.color || 0x000000
		});
		this._sprite.addChild(this._text);
	}

	protected GetTexture(): RenderTexture {
		const config = this.config as ILineObjectConfig;
		const [from, to] = [config.lineFrom, config.lineTo];

		this._g.clear();
		this._g
			.lineStyle(config.lineStyle!.width, config.lineStyle!.color)
			.moveTo(0, 0)
			.lineTo(from.x - to.x, from.y - to.y);

		const position = {
			x: from.x - to.x > 0 ? from.x - (from.x - to.x) : from.x,
			y: from.y - to.y > 0 ? from.y - (from.y - to.y) : from.y
		}
		this._sprite.position.set(position.x, position.y);

		const center = {
			x: this._sprite.width / 2 - this._text.width / 2,
			y: this._sprite.height / 2 - this._text.height / 2
		}
		const length = Math.sqrt(Math.pow(from.x - to.x, 2) + Math.pow(from.y - to.y, 2));

		this._text.position.set(center.x, center.y);
		this.text = length.toFixed(2);

		return this._app.app.renderer.generateTexture(this._g);
	}

	protected GetHitArea(): IHitArea {
		// const config = (this.config as ILineObjectConfig);

		// const [from, to] = [config.lineFrom, config.lineTo];

		// const lineLength = Math.sqrt(Math.pow(from.x - to.x, 2) + Math.pow(from.y - to.y, 2));

		// const rect = new Rectangle(0, 0, lineLength, 5);

		return new Rectangle();
	}
}