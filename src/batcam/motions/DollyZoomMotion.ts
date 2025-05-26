import { MotionBase } from "./MotionBase";
import * as THREE from "three";
import { Easing, type EasingFn } from "../utils/Easing";
import type { BatCam } from "../BatCam";

export interface DollyZoomConfig {
    target: THREE.Vector3;        // Point d'intérêt fixe
    finalDistance: number;        // Distance finale à la cible
    finalFOV: number;            // FOV final
    duration: number;
    ease?: EasingFn;
}

export class DollyZoomMotion extends MotionBase<DollyZoomConfig> {
    private static defaultConfig: Partial<DollyZoomConfig> = {
        ease: Easing.linear
    };

    private stopped = false;
    private _isComplete = false;
    private elapsed = 0;
    private onCompleteCb?: () => void;

    // Valeurs de départ
    private startDistance = 0;
    private startFOV = 0;
    private startDirection = new THREE.Vector3();

    constructor(config: DollyZoomConfig) {
        const merged: DollyZoomConfig = {
            ...DollyZoomMotion.defaultConfig,
            ...config,
        } as DollyZoomConfig;
        super(merged);
    }

    override init(cam: BatCam): void {
        super.init(cam);
        if (!this._cam) return;

        const camera = this._cam.getCamera() as THREE.PerspectiveCamera;
        if (!(camera instanceof THREE.PerspectiveCamera)) {
            throw new Error("DollyZoomMotion requires a PerspectiveCamera");
        }

        // Calculer la distance et direction initiales
        const offset = camera.position.clone().sub(this.config.target);
        this.startDistance = offset.length();
        this.startDirection = offset.normalize();
        this.startFOV = camera.fov;

        // Vérifier que la configuration est valide
        if (this.config.finalDistance <= 0) {
            throw new Error("finalDistance must be greater than 0");
        }
        if (this.config.finalFOV <= 0 || this.config.finalFOV >= 180) {
            throw new Error("finalFOV must be between 0 and 180");
        }
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
        const camera = this._cam.getCamera() as THREE.PerspectiveCamera;

        // Interpoler la distance et le FOV
        const distance = THREE.MathUtils.lerp(
            this.startDistance,
            this.config.finalDistance,
            v
        );
        const fov = THREE.MathUtils.lerp(
            this.startFOV,
            this.config.finalFOV,
            v
        );

        // Calculer la nouvelle position tout en gardant la même direction
        const newPosition = this.config.target.clone().add(
            this.startDirection.clone().multiplyScalar(distance)
        );

        // Mettre à jour la position et le FOV
        this.nextPosition.copy(newPosition);
        this.nextQuaternion.copy(camera.quaternion); // Garde l'orientation
        camera.fov = fov;
        camera.updateProjectionMatrix();
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