import { BehaviorBase } from "./BehaviorBase";
import type { Inputs } from "../inputs/InputBase";
import * as THREE from "three";

export class PanZoomBehavior extends BehaviorBase {
	handleInputs(inputs: Inputs): void {
		throw new Error("Method not implemented.");
	}
	dispose(): void {
		throw new Error("Method not implemented.");
	}
	constructor(camera: THREE.Camera) {
		super(camera);
		// TODO: ajouter listeners pointer et wheel
		this.enable();
	}
	update(delta: number): void {
		if (!this.enabled) return;
		// TODO: appliquer lerp vers nextPosition / nextQuaternion
	}
}
