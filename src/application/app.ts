import { Viewport } from "pixi-viewport";
import { AbstractRenderer, Application, autoDetectRenderer, Container, Renderer, utils } from "pixi.js"
import { SmoothGraphics as Graphics } from "@pixi/graphics-smooth"
import PolygonObject, { IPolygonObjectConfig } from "../objects/polygon";
import BaseObject from "../objects/object";

interface IAppConfigs {
	viewport?: {
		zoom?: boolean,
		drag?: boolean,
		worldWidth?: number,
		worldHeight?: number
	}
}

interface IRendererConfigs {
	width?: number;
	height?: number;
	backgroundColor?: number;
	autoResize?: boolean;
	antialias?: boolean;
}

export default class PixiApp {
	public readonly app: Application;
	private static _instance: PixiApp | null = null;

	// configs
	private _rendererConfigs: IRendererConfigs;
	private _appConfigs: IAppConfigs;

	// shortcuts
	private _renderer: AbstractRenderer;
	private _viewport: Viewport | null;
	private _stage: Container;

	// getters
	public get viewport() {
		return this._viewport;
	}

	private _objects: Array<BaseObject> = [];

	private constructor(appConfigs: IAppConfigs, rendererConfigs: IRendererConfigs) {
		this._appConfigs = appConfigs;
		this._rendererConfigs = rendererConfigs;

		this.app = new Application({
			...this._rendererConfigs
		});
		this.app.renderer = autoDetectRenderer({
			...this._rendererConfigs
		});
		
		// init shortcuts
		this._renderer = this.app.renderer;
		this._stage = this.app.stage;
		this._viewport = this.InitViewport();

		if (this._viewport)
			this._stage.addChild(this._viewport);
		return this;
	}

	/**
	 * 인스턴스를 반환합니다. 
	 * 없다면 파라미터 값으로 초기화하고 반환합니다.
	 * @param appConfigs PixiApp configs
	 * @param rendererConfigs Renderer configs
	 */
	public static GetInstance(appConfigs?: IAppConfigs, rendererConfigs?: IRendererConfigs): PixiApp {
		if (PixiApp._instance === null) {
			if (appConfigs === undefined || rendererConfigs === undefined) {
				throw "인스턴스가 없는데, 파라미터가 주어지지 않았습니다.";
			}
			PixiApp._instance = new PixiApp(appConfigs, rendererConfigs);
		}

		return PixiApp._instance;
	}

	/**
	 * Viewport를 초기화합니다.
	 */
	private InitViewport(): Viewport | null {
		let viewport: Viewport | null = null;
		const vpConfigs = this._appConfigs.viewport;

		console.log(vpConfigs);

		if (vpConfigs) {
			viewport = new Viewport({
				screenWidth: this._rendererConfigs.width,
				screenHeight: this._rendererConfigs.height,
				worldWidth: vpConfigs?.worldWidth,
				worldHeight: vpConfigs?.worldHeight
			});
			if (vpConfigs.drag) {
				viewport.drag();
				viewport.decelerate();
			}
			if (vpConfigs.zoom) {
				viewport.wheel({
					percent: 0.25
				});
				viewport.on("zoomed-end", e => {
					this._objects.forEach(x => x.UpdateSprite());
					console.log(`zoom scale: ${e.scaled.toFixed(2)}`);
				})
			}
			const line = viewport.addChild(new Graphics())
			line.lineStyle(10, 0xff0000).drawRect(0, 0, viewport.worldWidth, viewport.worldHeight)
		}
		return viewport
	}

	/**
	 * view를 target에 추가합니다.
	 * @param target view를 추가할 타겟
	 */
	public AppendView(target: HTMLElement) {
		target.appendChild(this.app.view);

		return this;
	}

	/**
	 * 새로운 Object를 생성하여 추가합니다.
	 * @param id Object ID
	 * @param config Object Cofigs
	 */
	public NewObject(config: IPolygonObjectConfig) {
		this.AddObject(new PolygonObject(config));
	}

	/**
	 * Object를 추가합니다.
	 * @param object 추가할 Object
	 */
	public AddObject(object: BaseObject) {
		this._objects.push(object);
		
		// viewport가 있으면 viewport에 추가합니다.
		if (this._viewport !== null) {
			this._viewport.addChild(object.sprite);
		} else {
			this._stage.addChild(object.sprite);
		}

		object.UpdateSprite();
	}

	/**
	 * Stage에 child를 추가합니다.
	 * @param child 
	 */
	public AddChild(child: any) {
		this._viewport?.addChild(child);
	}

	// 오브젝트를 찾아서 반환합니다.
	public GetObject(key: string): BaseObject | undefined {
		return this._objects.find(o => o.id === key);
	}

	// 오브젝트 리스트를 반환합니다.
	public GetObjects(): Array<BaseObject> {
		return this._objects;
	}

	// 오브젝트를 찾아서 삭제합니다.
	public RemoveObject(object: BaseObject) {
		const idx = this._objects.findIndex(x => x === object);
		this._objects.splice(idx, 1);
	}

	// app을 draw합니다.
	public Draw() {
		this._objects.forEach(o => {
			o.UpdateSprite();
		});
	}

	// renderer를 resize합니다.
	public Resize(width: number = window.innerWidth, height: number = window.innerHeight) {
		this._viewport?.resize(width, height);
		this.app.renderer.resize(width, height);
	}
}