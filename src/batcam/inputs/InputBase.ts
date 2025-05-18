import { Vector3 } from "three";
import { BatCam } from "../BatCam";

export class Inputs {
	/** Autorise ou non la prise en compte des inputs */
	public enabled: boolean = true;

	/** Translation principale (ex. pan) */
	public primaryTranslation: Vector3 = new Vector3();

	/** Rotation principale (ex. orbite) */
	public primaryRotation: Vector3 = new Vector3();

	/** Translation secondaire (ex. zoom sur deux doigts) */
	public secondaryTranslation: Vector3 = new Vector3();

	/** Rotation secondaire (ex. tilt sur deux doigts) */
	public secondaryRotation: Vector3 = new Vector3();

	/** Remet tous les vecteurs à (0,0,0) */
	public reset(): void {
		this.primaryTranslation.set(0, 0, 0);
		this.primaryRotation.set(0, 0, 0);
		this.secondaryTranslation.set(0, 0, 0);
		this.secondaryRotation.set(0, 0, 0);
	}

	public clone(): Inputs {
		const c = new Inputs();
		c.enabled = this.enabled;
		c.primaryTranslation.copy(this.primaryTranslation);
		c.primaryRotation.copy(this.primaryRotation);
		c.secondaryTranslation.copy(this.secondaryTranslation);
		c.secondaryRotation.copy(this.secondaryRotation);
		return c;
	}
}

export abstract class InputBase {
	public enabled: boolean = true;
	public batCam: BatCam;

	/** Valeurs d’entrée exposées */
	protected _currentInputs: Inputs | null = null;

	constructor(batCam: BatCam) {
		this.batCam = batCam;
	}

	public consumeCurrentInputs(): Inputs | null {
		const inputs = this._currentInputs?.clone() || null;
		this._currentInputs = null;
		return inputs;
	}

	abstract refresh(): void;
}
