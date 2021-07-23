import { InteractionEvent, Point } from "pixi.js";
import PixiApp from "./app";
import PloygonObject from "./object";

const DRAWING_CLASS = "polygon-tool__working";

export default class PolygonTool {
	private _app: PixiApp;

	private _isWorking: boolean = false;
	private _points: Array<number>;
	private _anchorPoint: Point | null;
	private _object: PloygonObject | null;

	constructor() {
		this._app = PixiApp.GetInstance();
		this._points = [];
		this._object = null;
		this._anchorPoint = null;
		this._app.viewport!.on("mousedown", e => this.HandlePointClick(e));
	}

	public BeginDraw() {
		this._points = [];
		this.UpdateState(true);
		this._object = new PloygonObject(Math.random().toString(), {
			points: this._points
		});
		this._app.AddObject(this._object);
	}
	
	public EndDraw() {
		console.log(this._points);
		this.UpdateState(false);
	}

	private UpdateState(isWorking: boolean) {
		this._isWorking = isWorking;
		const viewport = this._app.viewport!;

		if (this._isWorking) {
			viewport.plugins.pause("drag");
		}
		else {
			viewport.plugins.resume("drag");
		}

		this._app.app.view.classList.toggle(DRAWING_CLASS, this._isWorking);
	}

	private UpdatePolygon() {
		this._object!.sprite.x = this._anchorPoint!.x;
		this._object!.sprite.y = this._anchorPoint!.y;
		this._object?.UpdateSprite();
	}

	private UpdateAnchor(newPoint: Point) {
		const anchor = this._anchorPoint as Point;

		const xDiff = newPoint.x - anchor.x;
		const yDiff = newPoint.y - anchor.y;

		if (xDiff > 0 && yDiff > 0)
			return;

		this._points.forEach((val, idx) => {
			if (idx % 2 === 0 && xDiff < 0) {
				this._points[idx] += Math.abs(xDiff);
			} else if (idx % 2 === 1 && yDiff < 0) {
				this._points[idx] += Math.abs(yDiff);
			}
		})

		this._anchorPoint = new Point(
			xDiff < 0 ? newPoint.x : anchor.x,
			yDiff < 0 ? newPoint.y : anchor.y
		);

		console.log(this._anchorPoint);
	}

	private HandlePointClick(e: InteractionEvent) {
		if (this._isWorking === false)
			return;

		const position = e.data.getLocalPosition(this._app.viewport!);
		const point = new Point(position.x, position.y);

		if (this._anchorPoint === null) {
			this._anchorPoint = point;
		}
		
		this._points.push(point.x - this._anchorPoint.x, point.y - this._anchorPoint.y);
		
		this.UpdateAnchor(point);
		this.UpdatePolygon();

		console.log(this._object?.configs.points);
	}
}