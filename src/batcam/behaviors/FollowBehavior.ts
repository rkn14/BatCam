import { BehaviorBase } from "./BehaviorBase";
import type { Inputs } from "../inputs/InputBase";
import * as THREE from "three";

export class FollowBehavior extends BehaviorBase {
	handleInputs(inputs: Inputs): void {
		throw new Error("Method not implemented.");
	}
	dispose(): void {
		throw new Error("Method not implemented.");
	}
	constructor(camera: THREE.Camera) {
		super(camera);
		this.enable();
	}
	update(delta: number): void {
		if (!this.enabled) return;
		// TODO: suivre un objet cible si défini
	}
}
