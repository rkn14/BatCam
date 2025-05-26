import type { Vector3 } from "three";
import { Easing, type EasingFn } from "../utils/Easing";
import { MotionBase } from "./MotionBase";
import type { BatCam } from "../BatCam";
import * as THREE from "three";
import { calculateLookAtQuaternion } from '../utils/MathUtils';

export interface TranslationConfig {
	endPos: THREE.Vector3;
	lookAt: THREE.Vector3 | THREE.Object3D | null;
	duration: number;
	ease: EasingFn;
}

export class TranslationMotion extends MotionBase<TranslationConfig> {
	// Define defaults
	private static defaultConfig: Partial<TranslationConfig> = {
		lookAt: new THREE.Vector3(0, 0, 0),
		duration: 1,
		ease: Easing.linear,
	};

	private stopped = false;
	private _isComplete = false;
	private elapsed = 0;
	private startPos: Vector3 | null = null;
	private onCompleteCb?: () => void;

	constructor(
		config: Partial<TranslationConfig> & Pick<TranslationConfig, "endPos">,
	) {
		// Merge user config with defaults
		const merged: TranslationConfig = {
			...TranslationMotion.defaultConfig,
			...config,
		} as TranslationConfig;
		super(merged);
	}

	public isComplete(): boolean {
		return this._isComplete;
	}

	override init(cam: BatCam): void {
		super.init(cam);
		this.startPos = cam.getCamera().position.clone();
	}
	stop(): void {
		this.stopped = true;
	}
	setProgress(t: number): void {
		if (!this.startPos) return;
		const v = this.config.ease(t, 0, 1, 1);
		// position
		this.nextPosition.lerpVectors(this.startPos, this.config.endPos, v);
		// lookAt
		if (this.config.lookAt) {
			let lookAtPos: THREE.Vector3;
			if (this.config.lookAt instanceof THREE.Object3D) {
				lookAtPos = this.config.lookAt.position;
			} else if (this.config.lookAt instanceof THREE.Vector3) {
				lookAtPos = this.config.lookAt;
			} else {
				throw new Error("Invalid lookAt type"); // sécurité supplémentaire
			}
			this.nextQuaternion = calculateLookAtQuaternion(this.nextPosition, lookAtPos);
		}
	}
	onComplete(fn: () => void): void {
		this.onCompleteCb = fn;
	}
	update(delta: number): void {
		if (this.stopped) return;
		this.elapsed += delta;
		const t = Math.min(this.elapsed / this.config.duration, 1);
		this.setProgress(t);
		if (t >= 1) {
			this._isComplete = true;
			this.onCompleteCb?.();
		}
	}
}
