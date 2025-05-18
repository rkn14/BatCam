import type { BatCam } from "../BatCam";
import * as THREE from "three";

export abstract class MotionBase<Config extends object> {
	protected _cam: BatCam | null = null;
	protected config: Config;

	public nextPosition: THREE.Vector3 = new THREE.Vector3();
	public nextQuaternion: THREE.Quaternion = new THREE.Quaternion();

	constructor(config: Config) {
		this.config = config;
	}

	public init(cam: BatCam): void {
		this._cam = cam;
	}
	abstract stop(): void;
	abstract setProgress(t: number): void;
	abstract onComplete(fn: () => void): void;
	abstract update(delta: number): void;
	abstract isComplete(): boolean;
}
