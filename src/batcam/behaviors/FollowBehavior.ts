import * as THREE from 'three';
import { BehaviorBase } from './BehaviorBase';
import type { BatCam } from '../BatCam';
import { clamp, calculateLookAtQuaternion, smoothPosition, smoothRotation, calculateOrbitPosition, calculateDirection } from '../utils/MathUtils';
import type { Inputs } from '../inputs/InputBase';

export interface FollowConfig {
	// Distance de suivi
	distance: number;
	minDistance?: number;
	maxDistance?: number;

	// Angles de vue
	verticalAngle?: number;      // Angle vertical en degrés (0 = niveau, 90 = au-dessus)
	minVerticalAngle?: number;   // Angle vertical minimum
	maxVerticalAngle?: number;   // Angle vertical maximum

	// Options de suivi
	followRotation?: boolean;    // Suivre la rotation de la cible
	lockHeight?: boolean;        // Verrouiller la hauteur de la caméra
	heightOffset?: number;       // Décalage de hauteur quand verrouillée

	// Lissage
	positionSmoothing?: number;  // Facteur de lissage pour la position (0-1)
	rotationSmoothing?: number;  // Facteur de lissage pour la rotation (0-1)

	// Collisions
	enableCollisions?: boolean;  // Activer la détection de collisions
	collisionLayers?: number;    // Masque de couches pour les collisions
	collisionOffset?: number;    // Distance minimale aux obstacles

	target: THREE.Object3D;     // Cible à suivre
}

export class FollowBehavior extends BehaviorBase<FollowConfig> {
	private static readonly DEFAULT_CONFIG: Partial<FollowConfig> = {
		minDistance: 2,
		maxDistance: 20,
		verticalAngle: 30,
		minVerticalAngle: 0,
		maxVerticalAngle: 89,
		followRotation: false,
		lockHeight: false,
		heightOffset: 2,
		positionSmoothing: 0.1,
		rotationSmoothing: 0.1,
		enableCollisions: false,
		collisionLayers: 1,
		collisionOffset: 0.5
	};

	private targetPosition = new THREE.Vector3();
	private targetRotation = new THREE.Euler();
	private desiredPosition = new THREE.Vector3();
	private desiredRotation = new THREE.Quaternion();
	private currentVelocity = new THREE.Vector3();
	private raycaster: THREE.Raycaster;

	constructor(camera: THREE.Camera, config: FollowConfig) {
		const mergedConfig = {
			...FollowBehavior.DEFAULT_CONFIG,
			...config
		} as FollowConfig;
		super(camera, mergedConfig);

		this.raycaster = new THREE.Raycaster();
		this.raycaster.layers.mask = this.config.collisionLayers || 1;

		// Initialiser la position de la caméra
		this.updateDesiredPosition();
		this.lookAtTarget();
	}

	handleInputs(inputs: Inputs): void {
		// Cette méthode est vide car le FollowBehavior ne gère pas les inputs directement
	}

	dispose(): void {
		// Rien à nettoyer spécifiquement
	}

	private updateDesiredPosition(): void {
		if (!this.config.target) return;

		// Mettre à jour la position cible
		this.targetPosition.copy(this.config.target.position);

		// Si on suit la rotation
		let horizontalAngle = 0;
		if (this.config.followRotation) {
			this.targetRotation.copy(this.config.target.rotation);
			horizontalAngle = this.targetRotation.y;
		}

		// Calculer la position désirée
		const distance = clamp(
			this.config.distance,
			this.config.minDistance || 2,
			this.config.maxDistance || 20
		);

		// Position de base derrière la cible
		this.desiredPosition = calculateOrbitPosition(
			this.targetPosition,
			distance,
			this.config.verticalAngle || 30,
			horizontalAngle
		);

		// Appliquer le verrouillage de hauteur si nécessaire
		if (this.config.lockHeight) {
			this.desiredPosition.y = this.targetPosition.y + (this.config.heightOffset || 2);
		}

		// Gérer les collisions si activées
		if (this.config.enableCollisions) {
			this.handleCollisions();
		}

		// Mettre à jour la position suivante pour le BehaviorBase
		this.nextPosition.copy(this.desiredPosition);
	}

	private handleCollisions(): void {
		if (!this.config.target) return;

		// Direction de la caméra vers la cible
		const directionToTarget = calculateDirection(this.desiredPosition, this.targetPosition);
		
		// Configurer le raycaster
		this.raycaster.set(this.targetPosition, directionToTarget.negate());
		const distance = this.targetPosition.distanceTo(this.desiredPosition);
		
		// Vérifier les collisions
		const scene = this.camera.parent;
		if (!scene) return;
		
		const intersects = this.raycaster.intersectObjects(scene.children, true);
		
		if (intersects.length > 0) {
			const collision = intersects[0];
			if (collision.distance < distance) {
				// Ajuster la position pour éviter la collision
				this.desiredPosition.copy(collision.point).add(
					directionToTarget.multiplyScalar(this.config.collisionOffset || 0.5)
				);
			}
		}
	}

	private lookAtTarget(): void {
		if (!this.config.target) return;
		
		// Calculer la rotation pour regarder la cible
		this.desiredRotation = calculateLookAtQuaternion(this.desiredPosition, this.targetPosition, this.camera.up);
		
		// Appliquer le lissage à la rotation
		const rotationSmoothing = this.config.rotationSmoothing || 0.1;
		this.nextQuaternion = smoothRotation(this.camera.quaternion, this.desiredRotation, rotationSmoothing);
	}

	update(delta: number): void {
		if (!this.config.target) return;

		// Mettre à jour la position désirée
		this.updateDesiredPosition();

		// Appliquer le lissage à la position
		const positionSmoothing = this.config.positionSmoothing || 0.1;
		this.camera.position.copy(smoothPosition(this.camera.position, this.desiredPosition, positionSmoothing));

		// Mettre à jour la rotation
		this.lookAtTarget();
	}
}
