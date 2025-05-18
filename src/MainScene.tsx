import React, { useEffect, useRef } from "react";
import "./App.css";
import { useThree } from "@react-three/fiber";
import { BatCam } from "./batcam/BatCam";
import { OrbitBehavior } from "./batcam/behaviors/OrbitBehavior";
import * as THREE from "three";
import { TranslationMotion } from "./batcam/motions/TranslationMotion";
import { Easing } from "./batcam/utils/Easing";

function MainScene() {
	const { scene, camera, gl } = useThree();
	const batcamRef = useRef<BatCam>();

	useEffect(() => {
		batcamRef.current = new BatCam(camera, gl.domElement, scene);
		batcamRef.current.setBehavior(
			new OrbitBehavior(camera, { useTargetOrientation: true }),
		);

		window.addEventListener("keyup", (e) => {
			if (e.key.toLowerCase() === " ") {
				batcamRef.current?.playMotion(
					new TranslationMotion({
						endPos: new THREE.Vector3(
							Math.random() * 10 - 5,
							Math.random() * 10 - 5,
							Math.random() * 10 - 5,
						),
						lookAt: new THREE.Vector3(),
						duration: 2,
					}),
				);
			}
		});
	}, [camera, scene, gl]);

	return (
		<>
			<perspectiveCamera position={[0, 0, 20]} />
			<ambientLight intensity={0.5} />
			<directionalLight position={[0, 10, 0]} intensity={1} />
			<mesh position={[0, 0, 0]}>
				<boxGeometry />
				<meshStandardMaterial color={0xcccccc} />
			</mesh>
			<mesh position={[0, 1, 0]} scale={0.5}>
				<sphereGeometry />
				<meshStandardMaterial color={0x0000ff} />
			</mesh>
			<mesh position={[0, 1, 0.5]} scale={0.15}>
				<sphereGeometry />
				<meshStandardMaterial color={0xff0000} />
			</mesh>
		</>
	);
}

export default MainScene;
