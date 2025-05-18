import { InputBase, Inputs } from "./InputBase";
import type { BatCam } from "../BatCam";
import { Vector2, Vector3 } from "three";

export class MouseInput extends InputBase {
	/** Boutons souris à utiliser */
	private rotateButton = 0; // bouton gauche
	private translateButton = 2; // bouton droit

	/** Flags d’état */
	private rotating = false;
	private translating = false;

	/** Dernière position connue de la souris */
	private lastPos = new Vector2();

	/** Vitesses (modifiables) */
	public rotationSpeed = 200;
	public translationSpeed = 50;
	public wheelSpeed = 3;

	constructor(batCam: BatCam) {
		super(batCam);
		window.addEventListener("pointerdown", this.onPointerDown);
		window.addEventListener("pointermove", this.onPointerMove);
		window.addEventListener("pointerup", this.onPointerUp);
		window.addEventListener("wheel", this.onWheel, { passive: true });
	}

	/** Polling optionnel, mais ici on fait tout via events */
	public refresh(): void {}

	/** Cleanup */
	public dispose(): void {
		window.removeEventListener("pointerdown", this.onPointerDown);
		window.removeEventListener("pointermove", this.onPointerMove);
		window.removeEventListener("pointerup", this.onPointerUp);
		window.removeEventListener("wheel", this.onWheel);
	}

	// ——————————————————————————————————————————
	// Handlers
	// ——————————————————————————————————————————

	private onPointerDown = (e: PointerEvent) => {
		if (!this.enabled) return;
		this.lastPos.set(e.clientX, e.clientY);
		if (e.button === this.rotateButton) this.rotating = true;
		if (e.button === this.translateButton) this.translating = true;
	};

	private onPointerMove = (e: PointerEvent) => {
		if (!this.enabled) return;

		const pos = new Vector2(e.clientX, e.clientY);
		const delta = pos.clone().sub(this.lastPos);
		const w = window.innerWidth;
		const speedMult = this.getSpeedMultiplier();

		if (this.rotating) {
			if (!this._currentInputs) this._currentInputs = new Inputs();
			const offsetRatio = new Vector2(delta.y / w, delta.x / w);
			this._currentInputs.primaryRotation.x +=
				offsetRatio.x * this.rotationSpeed * speedMult;
			this._currentInputs.primaryRotation.y +=
				offsetRatio.y * this.rotationSpeed * speedMult;
		} else if (this.translating) {
			if (!this._currentInputs) this._currentInputs = new Inputs();
			const offsetRatio = delta.divideScalar(w);
			const t = new Vector3(
				-offsetRatio.x * this.translationSpeed * speedMult,
				-offsetRatio.y * this.translationSpeed * speedMult,
				0,
			);
			this._currentInputs.primaryTranslation.add(t);
		}

		this.lastPos.copy(pos);
	};

	private onPointerUp = (e: PointerEvent) => {
		if (!this.enabled) return;
		if (e.button === this.rotateButton) this.rotating = false;
		if (e.button === this.translateButton) this.translating = false;
	};

	private onWheel = (e: WheelEvent) => {
		if (!this.enabled) return;
		if (!this._currentInputs) this._currentInputs = new Inputs();
		const speedMult = this.getSpeedMultiplier();
		// sens négatif pour zoom “vers l’avant”
		this._currentInputs.primaryTranslation.z +=
			-e.deltaY * this.wheelSpeed * speedMult * 0.01;
	};

	/** Majuscule accélère, Control ralenti */
	private getSpeedMultiplier(): number {
		if (window.event instanceof KeyboardEvent) {
			const ev = window.event as KeyboardEvent;
			if (ev.shiftKey) return 5;
			if (ev.ctrlKey) return 0.2;
		}
		return 1;
	}
}
