import { Circle, Container, InteractionEvent, Point } from "pixi.js";
import PixiApp from "./app";
import PloygonObject, { IPolygonObjectConfig } from "../objects/polygon";
import CircleObject, { ICircleObjectConfig } from "../objects/circle";
import { Guid } from "guid-typescript";
import LineObject, { ILineObjectConfig } from "../objects/line";

const DRAWING_CLASS = "polygon-tool__working";

export default class PolygonTool {
	private _app: PixiApp;

	private _isWorking: boolean = false;

	private _drawingStage: Container;
	private _points: Array<CircleObject>;
	private _lines: Array<LineObject>;
	private _object: PloygonObject | null;
	
	private _cursorPoint: Point | null;

	constructor() {
		this._app = PixiApp.GetInstance();

		// reset variables
		this._points = [];
		this._lines = [];
		this._object = null;
		this._cursorPoint = null;

		// create drawing stage
		this._drawingStage = this.InitStage();

		// set event
		this._app.viewport!
			.on("mousedown", e => this.HandlePointClick(e))
			.on("mousemove", e => this.HandleMouseMove(e));
	}

	private InitStage() {
		const stage = new Container();
		stage.width = this._app.viewport!.width;
		stage.height = this._app.viewport!.height;

		this._app.AddChild(stage);

		return stage;
	}

	private ClearStage() {
		this._drawingStage.children.forEach(c => c.destroy());
		this._points = [];
		this._lines = [];
	}

	private AddPoint() {
		if (this._cursorPoint === null)
			return;

		const circlePoint = new CircleObject({
			radius: 5,
			x: this._cursorPoint.x,
			y: this._cursorPoint.y
		});
		this._points.push(circlePoint);
		this._app.AddObject(circlePoint);

		console.log(this._cursorPoint);
	}

	private UpdateLastLine() {
		if (this._lines.length === 0) {
			return;
		}

		const last = this._lines[this._lines.length - 1];
		(last.config as ILineObjectConfig).lineTo = this._cursorPoint!;
		last.UpdateSprite();
	}

	private AddLine(from: Point, to: Point) {
		const lineObject = new LineObject({
			lineFrom: from,
			lineTo: to
		});

		this._lines.push(lineObject);
		this._app.AddObject(lineObject);
	}

	private GetPointsAsList(): Array<number> {
		const result: Array<number> = [];
		this._points.forEach(p => {
			result.push(p.sprite.x, p.sprite.y);
		});

		return result;
	}

	public BeginDraw() {
		this.ClearStage();
		this.UpdateState(true);
		this._object = new PloygonObject({
			id: Guid.create().toString(),
			points: this.GetPointsAsList()
		});
	}
	
	public EndDraw(): PloygonObject | null {
		this.UpdateState(false);
		console.log(this._object);
		return this._object;
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

	private GetPointPosition(point: CircleObject) {
		const config = point.config as ICircleObjectConfig;
		return new Point(config.x, config.y);
	}

	private HandlePointClick(e: InteractionEvent) {
		if (this._isWorking === false || this._cursorPoint === null)
			return;

		const position = e.data.getLocalPosition(this._app.viewport!);
		const point = new Point(position.x, position.y);

		this.AddPoint();
		this.UpdateLastLine();
		this.AddLine(this._cursorPoint, this._cursorPoint);

		if (this._points.length > 2) {
			const first = this.GetPointPosition(this._points[0]);
			const last = this.GetPointPosition(this._points[this._points.length - 1]);
			
			if (first.equals(last))
				this.EndDraw();
		}
	}

	private HandleMouseMove(e: InteractionEvent) {
		if (this._isWorking === false)
			return;

		const position = e.data.getLocalPosition(this._app.viewport!);
		let point = new Point(position.x, position.y);

		if (this._points.length > 0) {
			const fristPoint = this._points[0];
			if (new Circle(fristPoint.config.x, fristPoint.config.y, 5).contains(point.x, point.y)) {
				point = new Point(fristPoint.config.x, fristPoint.config.y);
			}
		}

		this._cursorPoint = point;
		this.UpdateLastLine();
	}
}