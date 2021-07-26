import { SmoothGraphics } from "@pixi/graphics-smooth";
import { Guid } from "guid-typescript";
import { IHitArea, InteractionData, InteractionEvent, Point, RenderTexture, Sprite } from "pixi.js";
import PixiApp from "../application/app";

export interface IBaseObjectConfig {
	id?: string;
	lineStyle?: {
		width: number;
		color: number;
	}
	backgroundColor?: number;
	x?: number;
	y?: number;
}

export default abstract class BaseObject {
	public readonly config: IBaseObjectConfig;
	
	protected _app: PixiApp;
	protected _g: SmoothGraphics;
	protected _sprite: Sprite;
	
	// Drag event data/flag
	private _dragData: InteractionData | null = null;
	private _offset: Point | null = null;
	private _dragging: boolean = false;

	// getters
	public get id() {
		return this.config.id;
	}

	public get sprite() {
		return this._sprite;
	}

	constructor(config?: IBaseObjectConfig) {
		this.config = this.ResolveConfig(config);
		this._app = PixiApp.GetInstance();
		this._g = new SmoothGraphics();
		this._sprite = this.InitSprite();
	}

	/**
	 * 기본 설정값을 채워넣습니다.
	 * @param config 설정
	 */
	private ResolveConfig(config?: IBaseObjectConfig): IBaseObjectConfig {
		config = config || {};
		config.id = config.id || Guid.create().toString();
		config.backgroundColor = config.backgroundColor || 0x697075;
		config.lineStyle = config.lineStyle || { width: 1, color: config.backgroundColor }
		config.x = config.x || 0;
		config.y = config.y || 0;

		return config;
	}

	/**
	 * 오브젝트의 스프라이트를 초기화합니다.
	 */
	private InitSprite(): Sprite {
		const sprite = new Sprite();

		// configs
		sprite.interactive = true;
		if (this.config.x)
			sprite.x = this.config.x;
		if (this.config.y)
			sprite.y = this.config.y;
		sprite.hitArea = this.GetHitArea();

		// events
		sprite
			.on("mousedown", e => this.HandleDragStart(e))
			.on("mouseup", e => this.HandleDragEnd())
			.on("mouseupoutside", e => this.HandleDragEnd())
			.on("mousemove", e => this.HandleDragging());

		return sprite;
	}

	protected abstract GetTexture(): RenderTexture;

	protected abstract GetHitArea(): IHitArea;

	/**
	 * 스프라이트의 텍스쳐를 업데이트합니다.
	 */
	public UpdateSprite() {
		this._sprite.texture = this.GetTexture();
		this._sprite.hitArea = this.GetHitArea();
	}
	
	/**
	 * 드래그 시작 이벤트 핸들러
	 * @param event Drag Event
	 */
	private HandleDragStart(event: InteractionEvent) {
		// stop viewport dragging
		this._app.viewport?.plugins.pause("drag");

		// Sprite offset 설정
		const position = event.data.getLocalPosition(this._sprite.parent);
		this._offset = new Point(this._sprite.x - position.x, this._sprite.y - position.y);

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
		const position = this._dragData.getLocalPosition(this._sprite.parent);

		// 스프라이트 위치 업데이트
		this._sprite.x = position.x + this._offset!.x;
		this._sprite.y = position.y + this._offset!.y;
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