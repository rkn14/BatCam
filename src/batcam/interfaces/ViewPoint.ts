import type { Vector3 } from "three";

export interface ViewPoint {
	position: Vector3;
	target: Vector3;
	fov?: number;
}

// src/camera/enums/EaseType.ts
export enum EaseType {
	Linear = "Linear",
	QuadIn = "QuadIn",
	QuadOut = "QuadOut",
	// ajouter d'autres Penner si besoin
}
