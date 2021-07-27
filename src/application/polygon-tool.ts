import { Circle, Container, InteractionEvent, Point } from "pixi.js";
import PixiApp from "./app";
import PloygonObject, { IPolygonObjectConfig } from "../objects/polygon";
import CircleObject, { ICircleObjectConfig } from "../objects/circle";
import { Guid } from "guid-typescript";
import LineObject, { ILineObjectConfig } from "../objects/line";

const DRAWING_CLASS = "polygon-tool__working";
const POINT_DETECT_RANGE = 5;	// 점 종료 감지 범위
const SHIFT_THRESHOLD = 10;		// 선 직각 감지 범위

export default class PolygonTool {
	private _app: PixiApp;

	private _isWorking: boolean = false;	// 작업중 flag
	private _isShift: boolean = false;

	private _drawingStage: Container;		// 폴리곤 drawing하는 stage
	private _points: Array<CircleObject>;	// 폴리곤 점들
	private _lines: Array<LineObject>;		// 폴리곤 점을 이은 선들
	private _object: PloygonObject | null;	// 실제 오브젝트
	
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
			
		window.addEventListener("keydown", e => this.HandleKeyEvent(e), false);
		window.addEventListener("keyup", e => this.HandleKeyEvent(e), false);
	}

	//#region Stage Methods
	
	/**
	 * Drawing Stage를 초기화합니다.
	 */
	private InitStage() {
		const stage = new Container();
		stage.width = this._app.viewport!.width;
		stage.height = this._app.viewport!.height;

		this._app.AddChild(stage);

		return stage;
	}

	/**
	 * Drawing Stage를 비웁니다.
	 */
	private ClearStage() {
		this._drawingStage.children.forEach(c => c.destroy());
		this._points = [];
		this._lines = [];
	}

	//#endregion

	//#region Drawing Methods

	/**
	 * 점을 추가합니다.
	 */
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

	/**
	 * 마지막 선을 업데이트합니다.
	 */
	private UpdateLastLine() {
		if (this._lines.length === 0) {
			return;
		}

		const last = this._lines[this._lines.length - 1];
		(last.config as ILineObjectConfig).lineTo = this._cursorPoint!;
		last.UpdateSprite();
	}

	/**
	 * 선을 추가합니다.
	 * @param from 시작 점
	 * @param to 끝 점
	 */
	private AddLine(from: Point, to: Point) {
		const lineObject = new LineObject({
			lineFrom: from,
			lineTo: to,
			label: {
				text: "test",
				fontSize: 16,
				color: 0xffffff
			}
		});

		this._lines.push(lineObject);
		this._app.AddObject(lineObject);
	}

	/**
	 * 작업을 시작합니다.
	 */
	public BeginDraw() {
		this.ClearStage();
		this.UpdateState(true);
	}
	
	/**
	 * 작업을 마치고 오브젝트를 반환합니다.
	 */
	public EndDraw(): PloygonObject | null {
		const position = this.GetObjectPosition();

		this._app.NewObject({
			points: this.GetResultPoints(),
			x: position.x,
			y: position.y
		});
		
		this.UpdateState(false);

		return this._object;
	}

	/**
	 * 작업 상태를 업데이트합니다.
	 * @param isWorking 작업 상태
	 */
	private UpdateState(isWorking: boolean) {
		this._isWorking = isWorking;
		const viewport = this._app.viewport!;

		if (this._isWorking) {
			viewport.plugins.pause("drag");
		}
		else {
			viewport.plugins.resume("drag");
			this._points.forEach(x => x.destroy());
			this._lines.forEach(x => x.destroy());
		}

		this._app.app.view.classList.toggle(DRAWING_CLASS, this._isWorking);
	}

	//#endregion

	/**
	 * 오브젝트의 위치를 찾습니다.
	 */
	private GetObjectPosition() {
		const x = Math.min(...this._points.map(p => p.sprite.x));
		const y = Math.min(...this._points.map(p => p.sprite.y));

		return new Point(x, y);
	}

	/**
	 * 점들을 하나의 리스트로 반환합니다.
	 */
	private GetResultPoints(): Array<number> {
		const position = this.GetObjectPosition();
		const result: Array<number> = [];
		this._points.forEach(p => {
			result.push(p.sprite.x - position.x, p.sprite.y - position.y);
		});

		return result;
	}

	/**
	 * 점의 좌표를 Point 타입으로 반환합니다.
	 * @param point 점 좌표
	 */
	private GetPointPosition(point: CircleObject): Point {
		const config = point.config as ICircleObjectConfig;
		return new Point(config.x, config.y);
	}

	/**
	 * 클릭 이벤트 핸들러입니다.
	 * @param e Event
	 */
	private HandlePointClick(e: InteractionEvent) {
		if (this._isWorking === false || this._cursorPoint === null)
			return;

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

	/**
	 * MouseMove 이벤트 핸들러입니다.
	 * 작업중인 경우, 현재 커서 위치로 선을 그립니다.
	 * @param e Event
	 */
	private HandleMouseMove(e: InteractionEvent) {
		if (this._isWorking === false)
			return;

		const position = e.data.getLocalPosition(this._app.viewport!);
		let point = new Point(position.x, position.y);

		// 첫 점이 아닌 경우
		if (this._points.length > 0) {
			const first = this.GetPointPosition(this._points[0]);	// 첫 점
			const latest = this.GetPointPosition(this._points[this._points.length - 1]);	// 마지막 점

			if (this._isShift) {
				// Shift를 누르고 있는 경우, 직각으로만 그을수 있도록 합니다.
				const radian = Math.atan2(point.y - latest.y, point.x - latest.x);
				let degree = radian * 180 / Math.PI + 90;
				degree = degree < 0 ? 360 + degree : degree;	// 위가 0이 되는 각도계로 계산합니다.

				// 각도 범위를 계산합니다.
				const targets = [0, 90, 180, 270];
				const flag = targets.map(d => {
					const min = d - 45 < 0 ? 360 + d - 45 : d - 45;
					const max = d + 45 > 360 ? 360 - d + 45 : d + 45;

					return min <= degree && degree <= max;
				}).findIndex(x => x === true);

				// 범위 플래그에 맞게 좌표 값을 직각으로 설정합니다.
				switch(flag) {
					case 1:
					case 3:
						point.y = latest.y;
						break;
					case -1:
					case 2:
						point.x = latest.x;
						break;
				}
			} else {
				// Shift를 누르지 않은 경우
				// 첫 점으로부터 POINT_DETECT_RANGE 안에 있다면, 마지막 점으로 유도합니다.
				const detectRange = new Circle(first.x, first.y, POINT_DETECT_RANGE);

				if (detectRange.contains(point.x, point.y)) {
					point = first;
				}
			}
		}

		this._cursorPoint = point;
		this.UpdateLastLine();
	}

	/**
	 * Keydown 이벤트 핸들러입니다.
	 * Shift 입력을 감지하고, 보정된 각도로 선이 그어지도록 플래그를 수정합니다.
	 * @param e d
	 */
	private HandleKeyEvent(e: KeyboardEvent) {
		if (this._isWorking === false) {
			return;
		}

		// shift인 경우, 플래그를 수정합니다.
		if (e.key === "Shift") {
			this._isShift = e.type === "keydown";
		}
	}
}