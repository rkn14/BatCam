import { MotionBase } from "./MotionBase";
import * as THREE from "three";
import { Easing, type EasingFn } from "../utils/Easing";
import type { BatCam } from "../BatCam";

export enum RotationDirection {
		CLOCKWISE = "clockwise",
		COUNTER_CLOCKWISE = "counterClockwise",
		SHORTEST = "shortest"
}

export interface OrbitMotionConfig {
	// Position cible finale
	target: THREE.Vector3 | THREE.Object3D;
	
	// Angles finaux (en radians)
	polarAngle?: number;      // Angle vertical
	azimuthAngle?: number;    // Angle horizontal
	
	// Distance finale à la cible
	distance?: number;
	
	// Durée de l'animation en secondes
	duration: number;
	
	// Fonction d'easing
	ease?: EasingFn;

	// Direction de rotation
	rotationDirection?: RotationDirection;
}

export class OrbitMotion extends MotionBase<OrbitMotionConfig> {
	private static defaultConfig: Partial<OrbitMotionConfig> = {
		ease: Easing.linear,
		polarAngle: Math.PI / 2,    // 90 degrés
		azimuthAngle: 0,           // 0 degré
		distance: 10,              // Distance par défaut
		rotationDirection: RotationDirection.SHORTEST
	};

	private stopped = false;
	private _isComplete = false;
	private elapsed = 0;
	private onCompleteCb?: () => void;

	// Valeurs de départ (initialisées dans init())
	private startPolar = 0;
	private startAzimuth = 0;
	private startDistance = 0;
	private startTarget = new THREE.Vector3();

	constructor(config: Partial<OrbitMotionConfig> & Pick<OrbitMotionConfig, "duration">) {
		const merged: OrbitMotionConfig = {
			...OrbitMotion.defaultConfig,
			...config,
		} as OrbitMotionConfig;
		super(merged);
	}

	override init(cam: BatCam): void {
		super.init(cam);
		if (!this._cam) return;

		const camera = this._cam.getCamera();
		const currentTarget = this.getCurrentTarget();

		// Calculer les valeurs de départ
		const offset = camera.position.clone().sub(currentTarget);
		const spherical = new THREE.Spherical().setFromVector3(offset);
		
		this.startPolar = spherical.phi;
		this.startAzimuth = spherical.theta;
		this.startDistance = spherical.radius;
		this.startTarget.copy(currentTarget);
	}

	private getCurrentTarget(): THREE.Vector3 {
		if (this.config.target instanceof THREE.Object3D) {
			return this.config.target.position;
		}
		return this.config.target;
	}

	public isComplete(): boolean {
		return this._isComplete;
	}

	stop(): void {
		this.stopped = true;
	}

	private getTargetAzimuth(start: number, end: number): number {
		// Normaliser les angles entre 0 et 2π pour faciliter les calculs
		const normalizeAngle = (angle: number) => {
			while (angle < 0) angle += Math.PI * 2;
			while (angle >= Math.PI * 2) angle -= Math.PI * 2;
			return angle;
		};

		const normalizedStart = normalizeAngle(start);
		const normalizedEnd = normalizeAngle(end);
		
		switch (this.config.rotationDirection) {
			case RotationDirection.CLOCKWISE: {
				// Si la fin est après le début, on fait un tour complet
				if (normalizedEnd <= normalizedStart) {
					return start + (normalizedEnd - normalizedStart);
				} else {
					return start + (normalizedEnd - normalizedStart) - Math.PI * 2;
				}
			}
			case RotationDirection.COUNTER_CLOCKWISE: {
				// Si la fin est avant le début, on fait un tour complet
				if (normalizedEnd >= normalizedStart) {
					return start + (normalizedEnd - normalizedStart);
				} else {
					return start + (normalizedEnd - normalizedStart) + Math.PI * 2;
				}
			}
			case RotationDirection.SHORTEST:
			default: {
				// Calculer la différence dans les deux sens
				const clockwiseDiff = normalizedEnd <= normalizedStart 
					? normalizedEnd - normalizedStart 
					: normalizedEnd - normalizedStart - Math.PI * 2;
				
				const counterClockwiseDiff = normalizedEnd >= normalizedStart 
					? normalizedEnd - normalizedStart 
					: normalizedEnd - normalizedStart + Math.PI * 2;
				
				// Choisir le plus court
				return start + (Math.abs(clockwiseDiff) < Math.abs(counterClockwiseDiff) 
					? clockwiseDiff 
					: counterClockwiseDiff);
			}
		}
	}

	setProgress(t: number): void {
		if (!this._cam) return;

		const v = this.config.ease ? this.config.ease(t, 0, 1, 1) : t;
		const camera = this._cam.getCamera();

		// Utiliser directement la cible finale
		const currentTarget = this.getCurrentTarget();

		// Calculer l'angle azimutal final selon la direction choisie
		const targetAzimuth = this.config.azimuthAngle !== undefined 
			? this.getTargetAzimuth(this.startAzimuth, this.config.azimuthAngle)
			: this.startAzimuth;

		// Interpoler les angles et la distance
		const polar = THREE.MathUtils.lerp(
			this.startPolar,
			this.config.polarAngle ?? this.startPolar,
			v
		);
		const azimuth = THREE.MathUtils.lerp(
			this.startAzimuth,
			targetAzimuth,
			v
		);
		const distance = THREE.MathUtils.lerp(
			this.startDistance,
			this.config.distance ?? this.startDistance,
			v
		);

		// Calculer la nouvelle position de la caméra
		const spherical = new THREE.Spherical(distance, polar, azimuth);
		const offset = new THREE.Vector3().setFromSpherical(spherical);
		
		// Mettre à jour la position et l'orientation
		this.nextPosition.copy(currentTarget).add(offset);
		this.nextQuaternion.setFromRotationMatrix(
			new THREE.Matrix4().lookAt(
				this.nextPosition,
				currentTarget,
				camera.up
			)
		);
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
