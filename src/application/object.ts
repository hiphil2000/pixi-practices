import { InteractionData, InteractionEvent, IPointData, Point, Polygon, Renderer, RenderTexture, Sprite } from "pixi.js";
import { SmoothGraphics as Graphics } from "@pixi/graphics-smooth";
import PixiApp from "./app";

export interface IPolygonObjectConfig {
	points: Array<number>;
	stroke?: number;
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

// TODO: vector 그리는 것으로 변경
// ref: https://codepen.io/hz/pen/vYNMxBj

export default class PloygonObject {
	public readonly id: string;	// ID
	public readonly configs: IPolygonObjectConfig;	// 설정 값

	private _app: PixiApp;
	// Sprite 생성을 위한 Renderer
	private _renderer: Renderer;
	// Sprite의 Graphic
	private _g: Graphics;

	// Drag event data/flag
	private _dragData: InteractionData | null = null;
	private _offset: IPointData | null = null;
	private _dragging: boolean = false;
	
	public readonly sprite: Sprite;

	constructor(id: string, configs: IPolygonObjectConfig) {
		this.id = id;
		this.configs = this.ResolveDefaults(configs);
		this._app = PixiApp.GetInstance();
		this._renderer = this._app.app.renderer as Renderer;
		this._g = new Graphics();
		this.sprite = this.InitSprite();

		this.UpdateSprite();
	}
	
	/**
	 * config을 받고, 기본 값을 채워 넣은 후 반환합니다.
	 * @param config 기본 값이 들어간 config
	 */
	private ResolveDefaults(config: IPolygonObjectConfig): IPolygonObjectConfig {
		config.backgroundColor = config.backgroundColor || DEFAULT_CONFIGS.backgroundColor;
		config.x = config.x || DEFAULT_CONFIGS.x;
		config.y = config.y || DEFAULT_CONFIGS.y;

		return config;
	}

	/**
	 * Sprite를 생성합니다.
	 */
	private InitSprite(): Sprite {
		const sprite = new Sprite();

		// configs
		sprite.interactive = true;
		if (this.configs.x)
			sprite.x = this.configs.x;
		if (this.configs.y)
			sprite.y = this.configs.y;
		sprite.hitArea = new Polygon(this.configs.points);

		// events
		sprite
			.on("mousedown", e => this.HandleDragStart(e))
			.on("mouseup", e => this.HandleDragEnd())
			.on("mouseupoutside", e => this.HandleDragEnd())
			.on("mousemove", e => this.HandleDragging());

		return sprite;
	}

	private generateTexture(): RenderTexture {
		this._g.clear();
		this._g.beginFill(this.configs.backgroundColor, 1.0, true);
		this._g.lineStyle(1, this.configs.backgroundColor);
		this._g.drawPolygon(this.configs.points);
		this._g.endFill();

		return this._renderer.generateTexture(this._g);
	}

	/**
	 * Sprite를 업데이트합니다.
	 */
	public UpdateSprite() {	
		// texture를 적용합니다.
		this.sprite.texture = this.generateTexture();
		this.sprite.hitArea = new Polygon(this.configs.points);
	}
	
	/**
	 * 드래그 시작 이벤트 핸들러
	 * @param event Drag Event
	 */
	private HandleDragStart(event: InteractionEvent) {
		// stop viewport dragging
		this._app.viewport?.plugins.pause("drag");

		// Sprite offset 설정
		const position = event.data.getLocalPosition(this.sprite.parent);
		this._offset = {
			x: this.sprite.x - position.x,
			y: this.sprite.y - position.y
		};

		// 드래그 관련 데이터 설정
		this._dragData = event.data;
		this._dragging = true;
		this._g.alpha = 0.5;
		
		// 스프라이트 업데이트
		this.UpdateSprite();
	}

	/**
	 * 드래그 동작 이벤트 핸들러
	 */
	private HandleDragging() {
		// 드래그중이 아니면 반환
		if (this._dragging === false || this._dragData === null) {
			return;
		}

		// 현재 Position
		const position = this._dragData.getLocalPosition(this.sprite.parent);

		// 스프라이트 위치 업데이트
		this.sprite.x = position.x + this._offset!.x;
		this.sprite.y = position.y + this._offset!.y;
	}

	/**
	 * 드래그 종료 이벤트 핸들러
	 */
	private HandleDragEnd() {
		// resume viewport dragging
		this._app.viewport?.plugins.resume("drag");

		this._dragData = null;
		this._dragging = false;
		this._g.alpha = 1;
		this.UpdateSprite();
	}
}