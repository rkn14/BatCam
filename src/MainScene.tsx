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
import { CircularTarget } from "./components/CircularTarget";
import { FollowBehavior } from "./batcam/behaviors/FollowBehavior";
import { LookAtBehavior } from "./batcam/behaviors/LookAtBehavior";

function MainScene() {
	const { scene, camera, gl } = useThree();
	const batcamRef = useRef<BatCam>();
	const targetRef = useRef(null);

	useEffect(() => {
		console.log("ini", targetRef.current);
		if(!targetRef.current)
			return;
		
		batcamRef.current = new BatCam(camera, gl.domElement, scene);
		batcamRef.current.setBehavior(
			new LookAtBehavior(camera, {target: targetRef.current})
			//new FollowBehavior(camera, {distance: 10, target:targetRef.current!})
			/*new OrbitBehavior(camera, { 
				distance: 10,
				minDistance: 5,
				maxDistance: 20,
				polarAngle: Math.PI / 4,
				minPolarAngle: 0,
				maxPolarAngle: Math.PI / 2,
				azimuthAngle: 0,
				minAzimuthAngle: -Infinity,
				maxAzimuthAngle: Infinity,
				target: new THREE.Vector3(0, 0, 0),
				angleLerp: 0.1,
				distanceLerp: 0.1,
				translationLerp: 0.1,
				maxTranslationDistance: new THREE.Vector2(10, 10),
				useTargetOrientation: true
			}),*/
		);
	},[targetRef.current]);

	useEffect(() => {
	

		window.addEventListener("keyup", (e) => {
			if (e.key === " ") {
				// Translation aléatoire
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
				// Orbite aléatoire
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
			} else if (e.key.toLowerCase() === "d") {
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
			} else if (e.key.toLowerCase() === "l") {
				// LookAt - regarde la sphère bleue
				batcamRef.current?.playMotion(
					new LookAtMotion({
						target: new THREE.Vector3(0, 1, 0),  // Position de la sphère bleue
						duration: 1.5,
						ease: Easing.easeInOutCubic
					}),
				);
			} else if (e.key.toLowerCase() === "s") {
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
			} else if (e.key.toLowerCase() === "f") {
				// Active le FollowBehavior sur la cible circulaire
				if (batcamRef.current && targetRef.current) {
					const followConfig = {
						distance: 15,
						minDistance: 10,
						maxDistance: 20,
						verticalAngle: 30,
						followRotation: true,
						positionSmoothing: 0.05,
						rotationSmoothing: 0.05,
						enableCollisions: true,
						target: targetRef.current
					};
					batcamRef.current.setBehavior(new FollowBehavior(camera, followConfig));
				}
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
				rotation={[-Math.PI / 2, 0, 0]} 
			>
				<meshStandardMaterial color="#AABB22" metalness={0.1} roughness={0.8}/>
			</PerlinTerrain>

			{/* Obstacles pour tester les collisions */}
			<group>
				<mesh position={[5, 0, 5]} scale={[2, 4, 2]} castShadow receiveShadow>
					<boxGeometry />
					<meshStandardMaterial color="#666666" />
				</mesh>
				<mesh position={[-5, 0, -5]} scale={[2, 3, 2]} castShadow receiveShadow>
					<boxGeometry />
					<meshStandardMaterial color="#666666" />
				</mesh>
				<mesh position={[0, 0, -8]} scale={[4, 2, 2]} castShadow receiveShadow>
					<boxGeometry />
					<meshStandardMaterial color="#666666" />
				</mesh>
			</group>

			{/* Cible circulaire */}

				<CircularTarget
					ref={targetRef}
					radius={10}
					speed={0.5}
					height={2}
					sphereRadius={0.5}
					color="#ff0000"
				/>
			
		</>
	);
}

export default MainScene;
