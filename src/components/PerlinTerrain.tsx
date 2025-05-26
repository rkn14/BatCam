import React, { useMemo, forwardRef } from 'react';
import * as THREE from 'three';
import { extend, Object3DNode, MeshProps } from '@react-three/fiber';

interface PerlinTerrainProps extends Omit<MeshProps, 'args'> {
    width?: number;          // Largeur du terrain
    depth?: number;          // Profondeur du terrain
    resolution?: number;     // Nombre de segments
    maxHeight?: number;      // Hauteur maximale
    minHeight?: number;      // Hauteur minimale
    scale?: number;         // Échelle du bruit de Perlin
    octaves?: number;       // Nombre d'octaves pour le bruit
    persistence?: number;   // Persistence pour les octaves
    seed?: number;         // Seed pour la génération
}

class PerlinNoiseGenerator {
    private perm: number[] = new Array(512);

    constructor(seed = Math.random()) {
        // Initialiser la table de permutation avec une seed
        const rand = this.mulberry32(seed);
        const p = [...Array(256)].map(() => Math.floor(rand() * 256));
        for (let i = 0; i < 512; i++) {
            this.perm[i] = p[i & 255];
        }
    }

    private mulberry32(a: number) {
        return () => {
            let t = (a += 0x6D2B79F5);
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    private fade(t: number): number {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    private lerp(t: number, a: number, b: number): number {
        return a + t * (b - a);
    }

    private grad(hash: number, x: number, y: number, z: number): number {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    noise(x: number, y: number, z: number = 0): number {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);

        const u = this.fade(x);
        const v = this.fade(y);
        const w = this.fade(z);

        const A = this.perm[X] + Y;
        const AA = this.perm[A] + Z;
        const AB = this.perm[A + 1] + Z;
        const B = this.perm[X + 1] + Y;
        const BA = this.perm[B] + Z;
        const BB = this.perm[B + 1] + Z;

        return this.lerp(w,
            this.lerp(v,
                this.lerp(u,
                    this.grad(this.perm[AA], x, y, z),
                    this.grad(this.perm[BA], x - 1, y, z)
                ),
                this.lerp(u,
                    this.grad(this.perm[AB], x, y - 1, z),
                    this.grad(this.perm[BB], x - 1, y - 1, z)
                )
            ),
            this.lerp(v,
                this.lerp(u,
                    this.grad(this.perm[AA + 1], x, y, z - 1),
                    this.grad(this.perm[BA + 1], x - 1, y, z - 1)
                ),
                this.lerp(u,
                    this.grad(this.perm[AB + 1], x, y - 1, z - 1),
                    this.grad(this.perm[BB + 1], x - 1, y - 1, z - 1)
                )
            )
        );
    }
}

const PerlinTerrainImpl = forwardRef<THREE.Mesh, PerlinTerrainProps>(({
    width = 100,
    depth = 100,
    resolution = 100,
    maxHeight = 10,
    minHeight = -10,
    scale = 0.02,
    octaves = 4,
    persistence = 0.5,
    seed = Math.random(),
    ...props
}, ref) => {
    const geometry = useMemo(() => {
        const perlin = new PerlinNoiseGenerator(seed);
        const geo = new THREE.PlaneGeometry(width, depth, resolution, resolution);
        const heightRange = maxHeight - minHeight;

        // Fonction pour générer du bruit de Perlin avec plusieurs octaves
        const getFractalNoise = (x: number, y: number) => {
            let amplitude = 1;
            let frequency = 1;
            let noiseHeight = 0;
            let amplitudeSum = 0;

            for (let i = 0; i < octaves; i++) {
                const sampleX = x * scale * frequency;
                const sampleY = y * scale * frequency;
                
                noiseHeight += perlin.noise(sampleX, sampleY) * amplitude;
                amplitudeSum += amplitude;

                amplitude *= persistence;
                frequency *= 2;
            }

            // Normaliser et mapper à la plage de hauteur
            noiseHeight = (noiseHeight / amplitudeSum + 1) / 2;
            return minHeight + noiseHeight * heightRange;
        };

        // Appliquer le bruit de Perlin aux vertices
        const positions = geo.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            positions.setZ(i, getFractalNoise(x, y));
        }

        // Recalculer les normales pour un éclairage correct
        geo.computeVertexNormals();
        return geo;
    }, [width, depth, resolution, maxHeight, minHeight, scale, octaves, persistence, seed]);

    return (
        <mesh
            ref={ref}
            geometry={geometry}
            {...props}
        >
            {props.children}
        </mesh>
    );
});

// Créer la classe pour l'extension
class PerlinTerrain extends THREE.Mesh {
    constructor(args?: PerlinTerrainProps) {
        super();
        this.geometry = new THREE.PlaneGeometry(
            args?.width || 100,
            args?.depth || 100,
            args?.resolution || 100,
            args?.resolution || 100
        );
    }
}

// Étendre Three.js avec notre composant
extend({ PerlinTerrain });

// Exporter le composant React
export default PerlinTerrainImpl;

// Déclarer le type pour TypeScript avec @react-three/fiber
declare module '@react-three/fiber' {
    interface ThreeElements {
        perlinTerrain: Object3DNode<typeof PerlinTerrain, PerlinTerrainProps>
    }
} 