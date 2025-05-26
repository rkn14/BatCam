import { MotionBase } from "./MotionBase";
import * as THREE from "three";
import { Easing, type EasingFn } from "../utils/Easing";
import type { BatCam } from "../BatCam";
import { RotationDirection } from "./OrbitMotion";
import { calculateLookAtQuaternion, smoothRotation } from '../utils/MathUtils';

export interface LookAtConfig {
    target: THREE.Vector3 | THREE.Object3D;
    upVector?: THREE.Vector3;
    duration: number;
    rotationDirection?: RotationDirection;
    ease?: EasingFn;
}

export class LookAtMotion extends MotionBase<LookAtConfig> {
    private static defaultConfig: Partial<LookAtConfig> = {
        ease: Easing.easeInOutCubic,
        upVector: new THREE.Vector3(0, 1, 0),
        rotationDirection: RotationDirection.SHORTEST
    };

    private stopped = false;
    private _isComplete = false;
    private elapsed = 0;
    private onCompleteCb?: () => void;

    private startQuaternion = new THREE.Quaternion();
    private endQuaternion = new THREE.Quaternion();

    constructor(config: LookAtConfig) {
        const merged: LookAtConfig = {
            ...LookAtMotion.defaultConfig,
            ...config,
        } as LookAtConfig;
        super(merged);
    }

    private getTargetPosition(): THREE.Vector3 {
        return this.config.target instanceof THREE.Object3D
            ? this.config.target.position
            : this.config.target;
    }

    override init(cam: BatCam): void {
        super.init(cam);
        if (!this._cam) return;

        const camera = this._cam.getCamera();
        this.startQuaternion.copy(camera.quaternion);

        const target = this.getTargetPosition();
        this.endQuaternion = calculateLookAtQuaternion(camera.position, target, this.config.upVector);
    }

    public isComplete(): boolean {
        return this._isComplete;
    }

    stop(): void {
        this.stopped = true;
    }

    setProgress(t: number): void {
        if (!this._cam) return;
        const v = this.config.ease ? this.config.ease(t, 0, 1, 1) : t;

        // Interpoler la rotation
        this.nextQuaternion = smoothRotation(this.startQuaternion, this.endQuaternion, v);
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