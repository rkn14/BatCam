import { BehaviorBase } from "./BehaviorBase";
import { BatCam } from "../BatCam";
import { iMotion } from "../interfaces/iMotion";
import { ViewPoint } from "../interfaces/ViewPoint";
import { EaseType } from "../enums/EaseType";
import { TranslationMotion } from "../motions/TranslationMotion";
import { RotationMotion } from "../motions/RotationMotion";
import { FovMotion } from "../motions/FovMotion";
import { CompositeMotion } from "../motions/CompositeMotion";

export class AutomatedBehavior extends BehaviorBase {
	private activeMotion: iMotion | null = null;

	moveTo(
		view: ViewPoint,
		duration = this.cam.defaultDuration,
		ease: EaseType = this.cam.defaultEase,
	): iMotion {
		this.cam.disableAllBehaviors();
		const motions: iMotion[] = [
			new TranslationMotion(this.cam, view.position, duration, ease),
			new RotationMotion(this.cam, view.target, duration, ease),
		];
		if (view.fov !== undefined) {
			motions.push(new FovMotion(this.cam, view.fov, duration, ease));
		}
		const composite = new CompositeMotion(motions);
		this.activeMotion = composite;
		composite.onComplete(() => this.cam.enableDefaultBehaviors());
		return composite;
	}

	lookAt(
		target: THREE.Vector3,
		duration = this.cam.defaultDuration,
		ease: EaseType = this.cam.defaultEase,
	): iMotion {
		this.cam.disableAllBehaviors();
		const motion = new RotationMotion(this.cam, target, duration, ease);
		this.activeMotion = motion;
		motion.onComplete(() => this.cam.enableDefaultBehaviors());
		return motion;
	}

	update(delta: number): void {
		if (this.activeMotion) {
			this.activeMotion.update(delta);
		}
	}
}
