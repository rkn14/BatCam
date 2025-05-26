import { MotionBase } from "./MotionBase";
import * as THREE from "three";
import { Easing, type EasingFn } from "../utils/Easing";
import type { BatCam } from "../BatCam";

export interface ShakeConfig {
    intensity: number;         // Amplitude maximale du tremblement
    frequency: number;         // Fréquence des oscillations
    decay: number;            // Vitesse de diminution (0-1)
    duration: number;
    rotationIntensity?: number; // Intensité des rotations (0-1)
    ease?: EasingFn;
}

export class ShakeMotion extends MotionBase<ShakeConfig> {
    private static defaultConfig: Partial<ShakeConfig> = {
        ease: Easing.linear,
        decay: 0.75,
        rotationIntensity: 0.2
    };

    private stopped = false;
    private _isComplete = false;
    private elapsed = 0;
    private onCompleteCb?: () => void;

    // Valeurs de départ
    private startPosition = new THREE.Vector3();
    private startQuaternion = new THREE.Quaternion();
    private noise = new THREE.Vector3();
    private rotNoise = new THREE.Euler();

    constructor(config: ShakeConfig) {
        const merged: ShakeConfig = {
            ...ShakeMotion.defaultConfig,
            ...config,
        } as ShakeConfig;
        super(merged);
    }

    override init(cam: BatCam): void {
        super.init(cam);
        if (!this._cam) return;

        const camera = this._cam.getCamera();
        this.startPosition.copy(camera.position);
        this.startQuaternion.copy(camera.quaternion);
    }

    private generateNoise(t: number, decay: number): void {
        const phase = t * this.config.frequency * Math.PI * 2;
        
        // Utiliser des fonctions trigonométriques déphasées pour un mouvement plus naturel
        this.noise.set(
            Math.sin(phase) + Math.sin(phase * 0.5),
            Math.cos(phase * 1.1) + Math.cos(phase * 0.7),
            Math.sin(phase * 0.8) + Math.cos(phase * 1.2)
        ).multiplyScalar(this.config.intensity * decay);

        // Rotation aléatoire
        if (this.config.rotationIntensity) {
            this.rotNoise.set(
                (Math.sin(phase * 0.9) + Math.sin(phase * 1.2)) * this.config.rotationIntensity * decay,
                (Math.cos(phase * 1.1) + Math.sin(phase * 0.8)) * this.config.rotationIntensity * decay,
                (Math.sin(phase * 1.3) + Math.cos(phase * 0.9)) * this.config.rotationIntensity * decay
            );
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
        
        if (t >= 1) {
            // Retour à la position et rotation initiales
            this.nextPosition.copy(this.startPosition);
            this.nextQuaternion.copy(this.startQuaternion);
            return;
        }

        // Calculer le decay exponentiel
        const decay = Math.pow(1 - t, this.config.decay);
        
        // Générer le bruit pour cette frame
        this.generateNoise(this.elapsed, decay);

        // Appliquer le bruit à la position de départ
        this.nextPosition.copy(this.startPosition).add(this.noise);

        // Appliquer la rotation
        if (this.config.rotationIntensity) {
            this.nextQuaternion.setFromEuler(this.rotNoise);
            this.nextQuaternion.multiply(this.startQuaternion);
        } else {
            this.nextQuaternion.copy(this.startQuaternion);
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