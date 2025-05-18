import type { PerspectiveCamera, OrthographicCamera, Scene } from "three";
import * as THREE from "three";
import { MouseInput } from "./inputs/MouseInput";
import { KeyboardInput } from "./inputs/KeyboardInputs";
import type { BehaviorBase } from "./behaviors/BehaviorBase";
import type { MotionBase } from "./motions/MotionBase";
import { Easing, type EasingFn } from "./utils/Easing";

export class BatCam {
	public defaultDuration = 1000;
	public defaultEase: EasingFn = Easing.easeInCubic;
	private camera: PerspectiveCamera | OrthographicCamera;

	public currentBehavior: BehaviorBase<object> | null = null;
	private _currentMotion: MotionBase<object> | null = null;

	private inputs: {
		mouse: MouseInput;
		keyboard: KeyboardInput;
	};

	private _running = false;
	private _clock = new THREE.Clock();

	constructor(
		camera: PerspectiveCamera | OrthographicCamera,
		domElement: HTMLElement,
		scene?: Scene,
	) {
		this.camera = camera;

		this.inputs = {
			mouse: new MouseInput(this),
			keyboard: new KeyboardInput(this),
		};

		this.startAutoUpdate();
	}

	public startAutoUpdate() {
		if (this._running) return;
		this._running = true;

		const loop = () => {
			if (!this._running) return;
			requestAnimationFrame(loop);
			const delta = this._clock.getDelta();
			this.update(delta);
		};
		loop();
	}

	public stopAutoUpdate() {
		this._running = false;
	}

	public setBehavior(behavior: BehaviorBase): void {
		if (this.currentBehavior) {
			this.currentBehavior.dispose();
		}
		this.currentBehavior = behavior;
	}

	public playMotion(motion: iMotion): void {
		motion.init(this);
		this._currentMotion = motion;
	}

	public update(delta: number): void {
		if (this._currentMotion) this._updateMotion(delta);
		else this._updateBehavior(delta);
	}

	private _updateMotion(delta: number) {
		if (!this._currentMotion) return;

		this._currentMotion.update(delta);
		this.camera.position.copy(this._currentMotion.nextPosition);
		this.camera.quaternion.copy(this._currentMotion.nextQuaternion);

		if (this._currentMotion.isComplete()) {
			this._currentMotion = null;
			this.currentBehavior?.reStart();
		}
	}

	private _updateBehavior(delta: number) {
		if (!this.currentBehavior) return;

		this.inputs.mouse.refresh();
		const frameMouseInputs = this.inputs.mouse.consumeCurrentInputs();
		if (frameMouseInputs) {
			this.currentBehavior?.handleInputs(frameMouseInputs);
		}

		this.inputs.keyboard.refresh();
		const frameKeyboardInputs = this.inputs.keyboard.consumeCurrentInputs();
		if (frameKeyboardInputs) {
			this.currentBehavior?.handleInputs(frameKeyboardInputs);
		}

		this.currentBehavior.update(delta);

		const newPosition = this.camera.position.lerp(
			this.currentBehavior.nextPosition,
			1,
		);
		const newQuternion = this.camera.quaternion.slerp(
			this.currentBehavior.nextQuaternion,
			1,
		);
		this.camera.position.copy(newPosition);
		this.camera.quaternion.copy(newQuternion);
	}

	/** Resize handler */
	onResize(width: number, height: number): void {
		if ("aspect" in this.camera) {
			this.camera.aspect = width / height;
			this.camera.updateProjectionMatrix();
		} else {
			// adapter orthographic si besoin
		}
	}

	setCamera(cam: PerspectiveCamera | OrthographicCamera): void {
		this.camera = cam;
	}

	getCamera(): PerspectiveCamera | OrthographicCamera {
		return this.camera;
	}

	/*
	moveTo(view: ViewPoint, duration?: number, ease?: EaseType): iMotion {
		return this.behaviors.automated.moveTo(view, duration, ease);
	}

	lookAt(target: Vector3, duration?: number, ease?: EaseType): iMotion {
		return this.behaviors.automated.lookAt(target, duration, ease);
	}
		*/

	disableAllBehaviors(): void {
		Object.values(this.behaviors).forEach((b) => b.disable());
	}
	enableDefaultBehaviors(): void {
		// réactive orbit et panzoom par défaut
		this.behaviors.orbit.enable();
		this.behaviors.panzoom.enable();
	}

	dispose(): void {
		// TODO: cleanup listeners et controls
	}
}
