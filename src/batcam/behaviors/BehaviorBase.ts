import type { Inputs } from "../inputs/InputBase";
import * as THREE from "three";

export abstract class BehaviorBase<Config extends object> {
	protected config: Config;
	protected enabled = false;
	protected camera: THREE.Camera;
	public nextPosition: THREE.Vector3 = new THREE.Vector3();
	public nextQuaternion: THREE.Quaternion = new THREE.Quaternion();

	constructor(camera: THREE.Camera, config: Config) {
		this.camera = camera;
		this.config = config;
	}

	reStart(): void {}

	enable(): void {
		this.enabled = true;
	}
	disable(): void {
		this.enabled = false;
	}
	abstract update(delta: number): void;
	abstract handleInputs(inputs: Inputs): void;
	abstract dispose(): void;
}
