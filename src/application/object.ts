import { throws } from "assert/strict";
import { Graphics, InteractionData, InteractionEvent, IPointData, Point, Renderer, Sprite } from "pixi.js";

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

export default class PloygonObject {
	public readonly id: string;	// ID
	public readonly configs: IPolygonObjectConfig;	// 설정 값

	// Sprite 생성을 위한 Renderer
	private _renderer: Renderer;
	// Sprite의 Graphic
	private _g: Graphics;

	// Drag event data/flag
	private _dragData: InteractionData | null = null;
	private _offset: IPointData | null = null;
	private _dragging: boolean = false;
	
	public readonly sprite: Sprite;

	constructor(id: string, configs: IPolygonObjectConfig, renderer: Renderer) {
		this.id = id;
		this.configs = this.ResolveDefaults(configs);
		this._renderer = renderer;
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

		//sprite.anchor.set(0.5);
		sprite.interactive = true;

		sprite
			.on("mousedown", e => this.HandleDragStart(e))
			.on("mouseup", e => this.HandleDragEnd())
			.on("mouseupoutside", e => this.HandleDragEnd())
			.on("mousemove", e => this.HandleDragging())

		return sprite;
	}

	/**
	 * Sprite를 업데이트합니다.
	 */
	public UpdateSprite(draw: boolean = true) {	
		if (draw) {
			// graphic을 업데이트합니다.
			this._g.clear();
			this._g.beginFill(this.configs.backgroundColor);
			this._g.drawPolygon(this.configs.points);
			this._g.endFill();
		}

		// texture를 적용합니다.
		this.sprite.texture = this._renderer.generateTexture(this._g);
	}
	
	/**
	 * 드래그 시작 이벤트 핸들러
	 * @param event Drag Event
	 */
	private HandleDragStart(event: InteractionEvent) {
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

		// 스프라이트 업데이트
		this.UpdateSprite(false);
	}

	/**
	 * 드래그 종료 이벤트 핸들러
	 */
	private HandleDragEnd() {
		this._dragData = null;
		this._dragging = false;
		this._g.alpha = 1;
		this.UpdateSprite();
	}
}