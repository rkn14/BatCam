import * as THREE from 'three';

export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

/**
 * Calcule une matrice de rotation lookAt
 * @param eye Position de l'œil (caméra)
 * @param target Position de la cible
 * @param up Vecteur up (généralement Y)
 * @returns Quaternion représentant la rotation
 */
export function calculateLookAtQuaternion(
    eye: THREE.Vector3,
    target: THREE.Vector3,
    up: THREE.Vector3 = new THREE.Vector3(0, 1, 0)
): THREE.Quaternion {
    const lookAtMatrix = new THREE.Matrix4();
    lookAtMatrix.lookAt(eye, target, up);
    return new THREE.Quaternion().setFromRotationMatrix(lookAtMatrix);
}

/**
 * Interpole linéairement entre deux positions avec un facteur de lissage
 * @param current Position actuelle
 * @param target Position cible
 * @param smoothing Facteur de lissage (0-1)
 * @returns Nouvelle position
 */
export function smoothPosition(
    current: THREE.Vector3,
    target: THREE.Vector3,
    smoothing: number
): THREE.Vector3 {
    return current.clone().lerp(target, clamp(smoothing, 0, 1));
}

/**
 * Interpole sphériquement entre deux rotations avec un facteur de lissage
 * @param current Rotation actuelle
 * @param target Rotation cible
 * @param smoothing Facteur de lissage (0-1)
 * @returns Nouvelle rotation
 */
export function smoothRotation(
    current: THREE.Quaternion,
    target: THREE.Quaternion,
    smoothing: number
): THREE.Quaternion {
    return current.clone().slerp(target, clamp(smoothing, 0, 1));
}

/**
 * Convertit des degrés en radians
 */
export function degToRad(degrees: number): number {
    return THREE.MathUtils.degToRad(degrees);
}

/**
 * Convertit des radians en degrés
 */
export function radToDeg(radians: number): number {
    return THREE.MathUtils.radToDeg(radians);
}

/**
 * Calcule une position relative à une cible en utilisant des coordonnées sphériques
 * @param target Position de la cible
 * @param distance Distance à la cible
 * @param verticalAngle Angle vertical en degrés
 * @param horizontalAngle Angle horizontal en radians
 * @returns Position calculée
 */
export function calculateOrbitPosition(
    target: THREE.Vector3,
    distance: number,
    verticalAngle: number,
    horizontalAngle: number
): THREE.Vector3 {
    const verticalRad = degToRad(verticalAngle);
    return new THREE.Vector3(
        -Math.cos(verticalRad) * Math.cos(horizontalAngle) * distance,
        Math.sin(verticalRad) * distance,
        -Math.cos(verticalRad) * Math.sin(horizontalAngle) * distance
    ).add(target);
}

/**
 * Calcule la direction entre deux points et la normalise
 */
export function calculateDirection(
    from: THREE.Vector3,
    to: THREE.Vector3
): THREE.Vector3 {
    return to.clone().sub(from).normalize();
}

/**
 * Calcule les angles sphériques à partir d'un vecteur offset
 * @param offset Vecteur de décalage
 * @returns {phi: number, theta: number} Angles en radians
 */
export function calculateSphericalAngles(offset: THREE.Vector3): { phi: number; theta: number } {
    const spherical = new THREE.Spherical().setFromVector3(offset);
    return {
        phi: spherical.phi,
        theta: spherical.theta
    };
} 