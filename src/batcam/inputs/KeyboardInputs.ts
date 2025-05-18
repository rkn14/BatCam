// src/camera/inputs/KeyboardInput.ts
import { InputBase, Inputs } from "./InputBase";
import type { BatCam } from "../BatCam";
import { Vector3 } from "three";

export class KeyboardInput extends InputBase {
	/** Touches configurables */
	private keysRotateLeft = ["arrowleft"];
	private keysRotateRight = ["arrowright"];
	private keysRotateUp = ["arrowup"];
	private keysRotateDown = ["arrowdown"];
	private keysLeft = ["q"];
	private keysRight = ["d"];
	private keysUp = ["z"];
	private keysDown = ["s"];

	/** Vitesse (modifiable) */
	public translationSpeed = 0.1;
	public rotationSpeed = 2;

	/** Etat des touches pressées */
	private pressedKeys = new Set<string>();

	constructor(batCam: BatCam) {
		super(batCam);
		window.addEventListener("keydown", this.onKeyDown);
		window.addEventListener("keyup", this.onKeyUp);
	}
	public dispose(): void {
		window.removeEventListener("keydown", this.onKeyDown);
		window.removeEventListener("keyup", this.onKeyUp);
	}

	public refresh(): void {
		if (!this.enabled || this.pressedKeys.size === 0) return;

		this._currentInputs = null;
		const move = new Vector3();
		const rotate = new Vector3();

		for (const key of this.pressedKeys) {
			if (this.keysLeft.includes(key)) move.x -= 1;
			if (this.keysRight.includes(key)) move.x += 1;
			if (this.keysUp.includes(key)) move.z += 1;
			if (this.keysDown.includes(key)) move.z -= 1;
			if (this.keysRotateLeft.includes(key)) rotate.y += 1;
			if (this.keysRotateRight.includes(key)) rotate.y -= 1;
			if (this.keysRotateUp.includes(key)) rotate.x -= 1;
			if (this.keysRotateDown.includes(key)) rotate.x += 1;
		}

		if (!move.equals(new Vector3())) {
			if (this._currentInputs === null) this._currentInputs = new Inputs();
			move.normalize().multiplyScalar(this.translationSpeed);
			this._currentInputs.primaryTranslation.add(move);
		}
		if (!rotate.equals(new Vector3())) {
			if (this._currentInputs === null) this._currentInputs = new Inputs();
			rotate.normalize().multiplyScalar(this.rotationSpeed);
			this._currentInputs.primaryRotation.add(rotate);
		}
	}

	// ——————————————————
	// Handlers
	// ——————————————————

	private onKeyDown = (e: KeyboardEvent) => {
		if (!this.enabled) return;
		this.pressedKeys.add(e.key.toLowerCase());
	};

	private onKeyUp = (e: KeyboardEvent) => {
		if (!this.enabled) return;
		this.pressedKeys.delete(e.key.toLowerCase());
	};
}
