import * as THREE from 'three';
import { BehaviorBase } from './BehaviorBase';
import type { Inputs } from '../inputs/InputBase';
import { calculateLookAtQuaternion, smoothRotation } from '../utils/MathUtils';

export interface LookAtConfig {
    target: THREE.Vector3 | THREE.Object3D;  // Cible à regarder
    smoothing?: number;                      // Facteur de lissage (0-1)
    upVector?: THREE.Vector3;                // Vecteur up (par défaut Y)
}

export class LookAtBehavior extends BehaviorBase<LookAtConfig> {
    private static readonly DEFAULT_CONFIG: Partial<LookAtConfig> = {
        smoothing: 0.1,
        upVector: new THREE.Vector3(0, 1, 0)
    };

    private desiredRotation = new THREE.Quaternion();

    constructor(camera: THREE.Camera, config: LookAtConfig) {
        const mergedConfig = {
            ...LookAtBehavior.DEFAULT_CONFIG,
            ...config
        } as LookAtConfig;
        super(camera, mergedConfig);
        this.enable();
    }

    private getTargetPosition(): THREE.Vector3 {
        if (!this.config.target) {
            console.warn('LookAtBehavior: No target specified');
            return this.camera.position.clone(); // Return current camera position as fallback
        }
        
        if (this.config.target instanceof THREE.Object3D) {
            if (!this.config.target.position) {
                console.warn('LookAtBehavior: Target Object3D has no position');
                return this.camera.position.clone();
            }
            return this.config.target.position;
        }
        
        return this.config.target;
    }

    handleInputs(inputs: Inputs): void {
        // Ce behavior ne réagit pas aux inputs
    }

    update(delta: number): void {
        if (!this.enabled) return;

        // Calculer la rotation désirée pour regarder la cible
        const targetPos = this.getTargetPosition();
        if (!targetPos || !this.camera.position) {
            console.warn('LookAtBehavior: Invalid camera or target position');
            return;
        }

        this.desiredRotation = calculateLookAtQuaternion(
            this.camera.position,
            targetPos,
            this.config.upVector
        );

        // Appliquer le lissage à la rotation
        this.nextQuaternion = smoothRotation(
            this.camera.quaternion,
            this.desiredRotation,
            this.config.smoothing || 0.1
        );

        // Garder la position actuelle
        this.nextPosition.copy(this.camera.position);
    }

    dispose(): void {
        // Rien à nettoyer
    }
} 