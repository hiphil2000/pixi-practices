import { Graphics } from "pixi.js";

export interface IPolygonObjectConfig {
	points: Array<number>;
	backgroundColor?: number;
	x?: number;
	y?: number;
}

export const DEFAULT_CONFIGS: IPolygonObjectConfig = {
	points: [],
	backgroundColor: 0x697075,
	x: 0,
	y: 0
}

export default class PolygonObject {
	id: string;
	config: IPolygonObjectConfig;

	constructor(id: string, config: IPolygonObjectConfig) {
		this.id = id;
		this.config = this.ResolveDefaults(config);
	}

	private ResolveDefaults(config: IPolygonObjectConfig): IPolygonObjectConfig {
		config.backgroundColor = config.backgroundColor || DEFAULT_CONFIGS.backgroundColor;
		config.x = config.x || DEFAULT_CONFIGS.x;
		config.y = config.y || DEFAULT_CONFIGS.y;

		return config;
	}

	private ResolvePoints(): Array<number> {
		return this.config.points.map((p, i) => {
			return i % 2 == 1 ?
				p + this.config.y! :
				p + this.config.x!;
		});
	}

	public Draw(g: Graphics) {
		g.beginFill(this.config.backgroundColor);
		g.drawPolygon(this.ResolvePoints());
		g.endFill();
	}
}