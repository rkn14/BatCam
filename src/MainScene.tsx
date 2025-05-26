import React, { useEffect, useRef } from "react";
import "./App.css";
import { useThree } from "@react-three/fiber";
import { BatCam } from "./batcam/BatCam";
import { OrbitBehavior } from "./batcam/behaviors/OrbitBehavior";
import * as THREE from "three";
import { TranslationMotion } from "./batcam/motions/TranslationMotion";
import { OrbitMotion } from "./batcam/motions/OrbitMotion";
import { DollyZoomMotion } from "./batcam/motions/DollyZoomMotion";
import { LookAtMotion } from "./batcam/motions/LookAtMotion";
import { ShakeMotion } from "./batcam/motions/ShakeMotion";
import { Easing } from "./batcam/utils/Easing";
import PerlinTerrain from "./components/PerlinTerrain";

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
							Math.random() * 3 + 1,
							Math.random() * 10 - 5,
						),
						lookAt: new THREE.Vector3(),
						duration: 2,
					}),
				);
			} else if (e.key === "Enter") {
				batcamRef.current?.playMotion(
					new OrbitMotion({
						target: new THREE.Vector3(0, 0, 0),
						polarAngle: Math.PI/2,
						azimuthAngle: Math.random() * Math.PI * 2,
						distance: Math.random() * 8 + 2,
						duration: 2,
						ease: Easing.easeInOutCubic
					}),
				);
			} else if (e.key.toLowerCase() === "i") {
				// DollyZoom effect
				batcamRef.current?.playMotion(
					new DollyZoomMotion({
						target: new THREE.Vector3(0, 0, 0),
						finalDistance: 15,  // Recule la caméra
						finalFOV: 30,      // Réduit le FOV pour l'effet vertigo
						duration: 3,
						ease: Easing.easeInOutQuad
					}),
				);
			} else if (e.key.toLowerCase() === "o") {
				// LookAt - regarde la sphère bleue
				batcamRef.current?.playMotion(
					new LookAtMotion({
						target: new THREE.Vector3(0, 1, 0),  // Position de la sphère bleue
						duration: 1.5,
						ease: Easing.easeInOutCubic
					}),
				);
			} else if (e.key.toLowerCase() === "p") {
				// Shake effect
				batcamRef.current?.playMotion(
					new ShakeMotion({
						intensity: 0.03,
						frequency: 115,
						decay: 0,
						duration: .2,
						rotationIntensity: 0,
						ease: Easing.easeOutQuad
					}),
				);
			}
		});
	}, [camera, scene, gl]);

	return (
		<>
			<perspectiveCamera position={[0, 0, 20]} />
			<ambientLight intensity={0.5} />
			<directionalLight position={[0, 10, 0]} intensity={1} castShadow shadow-mapSize={[2048, 2048]}/>
			<PerlinTerrain
				receiveShadow
				width={100}
				depth={100}
				maxHeight={20}
				position={[0, -10, 0]}
				rotation={[-Math.PI / 2, 0, 0]} // Pour avoir le terrain horizontal
				>
				<meshStandardMaterial color="#AABB22" metalness={0.1} roughness={0.8}/>
				</PerlinTerrain>
			<mesh position={[0, 0, 0]} scale={[20, .2, 20]} castShadow receiveShadow visible={false}>
				<boxGeometry />
				<meshStandardMaterial color={0xcccccc} />
			</mesh>
			<mesh position={[0, 0, 0]} castShadow receiveShadow>
				<boxGeometry />
				<meshStandardMaterial color={0xcccccc} />
			</mesh>
			<mesh position={[0, 1, 0]} scale={0.5} castShadow receiveShadow>
				<sphereGeometry />
				<meshStandardMaterial color={0x0000ff} />
			</mesh>
			<mesh position={[0, 1, 0.5]} scale={0.15} castShadow receiveShadow>
				<sphereGeometry />
				<meshStandardMaterial color={0xff0000} />
			</mesh>
		</>
	);
}

export default MainScene;
