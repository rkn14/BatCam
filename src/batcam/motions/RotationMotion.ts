import { iMotion } from "../interfaces/iMotion";
import { BatCam } from "../BatCam";
import { Vector3, Quaternion } from "three";
import { EaseType } from "../enums/EaseType";
import { getEasingFunction } from "../utils/Easing";

export class RotationMotion implements iMotion {
	private stopped = false;
	private _isComplete = false;
	private elapsed = 0;
	private startQuat: Quaternion;
	private onCompleteCb?: () => void;
	private easeFn = getEasingFunction(this.ease);

	constructor(
		private cam: BatCam,
		private target: Vector3,
		private duration: number,
		private ease: EaseType,
	) {
		this.startQuat = cam.getCamera().quaternion.clone();
	}
	public isComplete(): boolean {
		return this._isComplete;
	}

	stop(): void {
		this.stopped = true;
	}
	setProgress(t: number): void {
		const v = this.easeFn(t);
		const cam = this.cam.getCamera();
		const endQuat = new Quaternion().setFromRotationMatrix(
			new THREE.Matrix4().lookAt(cam.position, this.target, cam.up),
		);
		Quaternion.slerp(this.startQuat, endQuat, cam.quaternion, v);
	}
	onComplete(fn: () => void): void {
		this.onCompleteCb = fn;
	}
	update(delta: number): void {
		if (this.stopped) return;
		this.elapsed += delta;
		const t = Math.min(this.elapsed / this.duration, 1);
		this.setProgress(t);
		if (t >= 1) {
			this._isComplete = true;
			this.onCompleteCb?.();
		}
	}
}
