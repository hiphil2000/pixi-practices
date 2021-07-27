import { SVG } from "pixi-svg";
import { RenderTexture, IHitArea } from "pixi.js";

export interface ISvgObjectConfig {
	path: string;
}

export default class SvgObject {
	public readonly config: ISvgObjectConfig

	public _svg: SVG | null;
	private _ready: boolean

	public get ready() {
		return this._ready;
	}

	constructor(config: ISvgObjectConfig) {
		this.config = config;
		this._ready = false;
		this._svg = null;
		this.LoadSvgData();
	}

	/**
	 * SVG를 로드합니다.
	 * 실패할 경우, null을 반환합니다.
	 */
	public async LoadSvgData(): Promise<SVG | null> {
		return await fetch(this.config.path)
			.then(response => response.text())
			.then(body => {
				const match = body.match(/(<svg.*\/>)/);
				if (match !== null && match.length > 1) {
					this._svg = new SVG(match[1]);
					this._ready = true;
				} else {
					this._svg= null;
					this._ready = false;
				}

				return this._svg;
			})
			.catch(reason => {
				console.log(reason);
				this._svg= null;
				this._ready = false;

				return this._svg;
			});
	}

}