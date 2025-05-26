// src/camera/behaviors/OrbitBehavior.ts
import type { Inputs } from "../inputs/InputBase";
import { BehaviorBase } from "./BehaviorBase";
import * as THREE from "three";

export interface OrbitConfig {
	minDistance: number;
	maxDistance: number;
	distance: number;

	minPolarAngle: number;
	maxPolarAngle: number;
	polarAngle: number;

	minAzimuthAngle: number;
	maxAzimuthAngle: number;
	azimuthAngle: number;

	target: THREE.Vector3 | THREE.Object3D;

	angleLerp: number;
	distanceLerp: number;
	translationLerp: number;

	maxTranslationDistance: THREE.Vector2;

	useTargetOrientation: boolean;
}

export class OrbitBehavior extends BehaviorBase<OrbitConfig> {
	private static defaultConfig: Partial<OrbitConfig> = {
		minDistance: 2,
		maxDistance: 50,
		distance: 0,

		minPolarAngle: 0,
		maxPolarAngle: Math.PI,
		polarAngle: 0,

		minAzimuthAngle: Number.NEGATIVE_INFINITY,
		maxAzimuthAngle: Number.POSITIVE_INFINITY,
		azimuthAngle: 0,

		target: new THREE.Vector3(),
		angleLerp: 0.1,
		distanceLerp: 0.1,
		translationLerp: 0.3,

		maxTranslationDistance: new THREE.Vector2(10, 10),

		useTargetOrientation: false,
	};

	// Internal targets
	private _targetDistance = 0;
	private _targetPolar = 0;
	private _targetAzimuth = 0;
	private _targetOffset = new THREE.Vector2(0, 0);
	private _currentOffset = new THREE.Vector2(0, 0);

	constructor(camera: THREE.Camera, config: Partial<OrbitConfig>) {
		const merged: OrbitConfig = {
			...OrbitBehavior.defaultConfig,
			...config,
		} as OrbitConfig;
		super(camera, merged);
		this._initFromStartPosition();
		this.enable();
	}

	override reStart(): void {
		this._initFromStartPosition();
	}

	private _getTargetPosition(): THREE.Vector3 {
		return this.config.target instanceof THREE.Object3D
			? this.config.target.position
			: this.config.target;
	}

	private _getTargetMatrix(): THREE.Matrix4 {
		if (
			this.config.useTargetOrientation &&
			this.config.target instanceof THREE.Object3D
		) {
			return new THREE.Matrix4().makeRotationFromQuaternion(
				this.config.target.quaternion,
			);
		}
		return new THREE.Matrix4();
	}

	/** Initialise distance et angles depuis la position actuelle de la caméra */
	private _initFromStartPosition() {
		const camPos = this.camera.position.clone();
		const targetPos = this._getTargetPosition();
		const offset = camPos.sub(targetPos);

		// distance
		this.config.distance = offset.length();
		this._targetDistance = this.config.distance;

		// angles
		const spherical = new THREE.Spherical().setFromVector3(offset);
		this.config.polarAngle = spherical.phi;
		this.config.azimuthAngle = spherical.theta;

		this._targetPolar = this.config.polarAngle;
		this._targetAzimuth = this.config.azimuthAngle;
	}

	/** Réinitialise l'offset de translation à zéro */
	public resetOffset(): void {
		this._targetOffset.set(0, 0);
		this._currentOffset.set(0, 0);
	}

	/** Applique les valeurs d'inputs sur les angles + distance cible */
	handleInputs(inputs: Inputs): void {
		if (!this.enabled || !inputs.enabled) return;

		// Rotation
		this._targetPolar -= THREE.MathUtils.degToRad(inputs.primaryRotation.x);
		this._targetAzimuth -= THREE.MathUtils.degToRad(inputs.primaryRotation.y);

		// Clamp angles
		this._targetPolar = THREE.MathUtils.clamp(
			this._targetPolar,
			this.config.minPolarAngle,
			this.config.maxPolarAngle,
		);
		this._targetAzimuth = THREE.MathUtils.clamp(
			this._targetAzimuth,
			this.config.minAzimuthAngle,
			this.config.maxAzimuthAngle,
		);

		// Distance (zoom)
		this._targetDistance -= inputs.primaryTranslation.z;
		this._targetDistance = THREE.MathUtils.clamp(
			this._targetDistance,
			this.config.minDistance,
			this.config.maxDistance,
		);

		// Translation
		if (inputs.primaryTranslation) {
			this._targetOffset.x += inputs.primaryTranslation.x;
			this._targetOffset.y += inputs.primaryTranslation.y;
			
			// Clamp translations
			this._targetOffset.x = THREE.MathUtils.clamp(
				this._targetOffset.x,
				-this.config.maxTranslationDistance.x,
				this.config.maxTranslationDistance.x
			);
			this._targetOffset.y = THREE.MathUtils.clamp(
				this._targetOffset.y,
				-this.config.maxTranslationDistance.y,
				this.config.maxTranslationDistance.y
			);
		}
	}

	update(delta: number): void {
		if (!this.enabled) return;
		const targetPos = this._getTargetPosition();

		// Lerp current values toward targets
		this.config.polarAngle = THREE.MathUtils.lerp(
			this.config.polarAngle,
			this._targetPolar,
			this.config.angleLerp,
		);
		this.config.azimuthAngle = THREE.MathUtils.lerp(
			this.config.azimuthAngle,
			this._targetAzimuth,
			this.config.angleLerp,
		);
		this.config.distance = THREE.MathUtils.lerp(
			this.config.distance,
			this._targetDistance,
			this.config.distanceLerp,
		);

		// Lerp offset
		this._currentOffset.x = THREE.MathUtils.lerp(
			this._currentOffset.x,
			this._targetOffset.x,
			this.config.translationLerp
		);
		this._currentOffset.y = THREE.MathUtils.lerp(
			this._currentOffset.y,
			this._targetOffset.y,
			this.config.translationLerp
		);

		// Calculer nouvelle position
		const spherical = new THREE.Spherical(
			this.config.distance,
			this.config.polarAngle,
			this.config.azimuthAngle,
		);
		const localOffset = new THREE.Vector3().setFromSpherical(spherical);
		localOffset.applyMatrix4(this._getTargetMatrix());

		// Calculer les vecteurs de translation relatifs à l'orientation
		const right = new THREE.Vector3(1, 0, 0);
		const up = new THREE.Vector3(0, 1, 0);
		
		// Rotation autour de l'axe Y (azimuth)
		const rotationMatrix = new THREE.Matrix4().makeRotationY(this.config.azimuthAngle);
		right.applyMatrix4(rotationMatrix);
		up.applyMatrix4(rotationMatrix);

		// Appliquer l'offset de translation en utilisant les vecteurs orientés
		const translatedTarget = targetPos.clone()
			.add(right.multiplyScalar(this._currentOffset.x))
			.add(up.multiplyScalar(-this._currentOffset.y));

		const newPos = localOffset.add(translatedTarget);

		// Affecter nextPosition et nextQuaternion
		this.nextPosition.copy(newPos);
		const quat = new THREE.Quaternion().setFromRotationMatrix(
			new THREE.Matrix4().lookAt(newPos, translatedTarget, this.camera.up),
		);
		this.nextQuaternion.copy(quat);
	}

	dispose(): void {
		// rien à faire pour l'instant
	}
}
