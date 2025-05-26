import React, { useRef, useEffect, forwardRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { FollowBehavior, type FollowConfig } from '../batcam/behaviors/FollowBehavior';
import type { BatCam } from '../batcam/BatCam';

interface CircularTargetProps {
    radius?: number;          // Rayon du cercle de déplacement
    speed?: number;          // Vitesse de rotation (radians par seconde)
    height?: number;         // Hauteur de la sphère
    sphereRadius?: number;   // Rayon de la sphère
    color?: string;         // Couleur de la sphère      // Instance de BatCam
}

export const CircularTarget = forwardRef<THREE.Mesh, CircularTargetProps>(({
    radius = 10,
    speed = 0.5,
    height = 2,
    sphereRadius = 0.5,
    color = '#ff0000',
}, ref) => {
    const time = useRef(0);
    const internalRef = useRef<THREE.Mesh>(null);
    const meshRef = (ref as React.MutableRefObject<THREE.Mesh>) || internalRef;

    // Configurer le FollowBehavior


    // Animation de la sphère
    useFrame((state, delta) => {
        if (!meshRef.current) return;

        time.current += delta;
        
        // Calculer la nouvelle position
        const x = Math.cos(time.current * speed) * radius;
        const z = Math.sin(time.current * speed) * radius;
        
        // Mettre à jour la position
        meshRef.current.position.set(x, height, z);
        
        // Orienter la sphère vers sa direction de déplacement
        const direction = new THREE.Vector2(-Math.sin(time.current * speed), -Math.cos(time.current * speed));
        const angle = direction.angle();
        meshRef.current.rotation.y = angle;
    });

    return (
        <mesh ref={meshRef} position={[radius, height, 0]}>
            <sphereGeometry args={[sphereRadius, 32, 32]} />
            <meshStandardMaterial color={color} />
        </mesh>
    );
}); 