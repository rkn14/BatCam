# BatCam

A powerful and modular camera controller for Three.js, designed to provide smooth and intuitive camera movements through behaviors and motions.

## Core Concepts

### Behaviors
Long-term camera controls that respond to user inputs:
- **OrbitBehavior**: Orbit around a target with configurable angles and distance
- **PanZoomBehavior**: Pan and zoom in the scene
- More to come...

### Motions
Automated camera animations:
- **OrbitMotion**: Smooth orbital transitions with configurable rotation direction
- **TranslationMotion**: Point-to-point camera movements
- Easily extensible for custom motions

## Key Features

- 🎯 **Target-based**: All movements are relative to a target point or object
- 🎮 **Input System**: Modular input system supporting mouse and keyboard
- 🔄 **Smooth Transitions**: Configurable easing and interpolation
- 🛠 **Highly Configurable**: Fine-tune every aspect of camera behavior
- 📦 **Modular Design**: Easy to extend with custom behaviors and motions

## Quick Example

```typescript
import { BatCam, OrbitBehavior } from 'batcam';

// Setup
const batcam = new BatCam(camera, domElement);

// Set default behavior
batcam.setBehavior(new OrbitBehavior(camera, {
    target: new THREE.Vector3(0, 0, 0),
    maxDistance: 50,
    minDistance: 2
}));

// Animate to a new viewpoint
batcam.playMotion(new OrbitMotion({
    target: new THREE.Vector3(0, 0, 0),
    polarAngle: Math.PI / 4,
    azimuthAngle: Math.PI,
    duration: 2,
    rotationDirection: RotationDirection.SHORTEST
}));
```

## Status

🚧 Currently in active development. More features coming soon!

## Features

### Orbit Controls
- Smooth orbital rotation around target
- Configurable min/max distances
- Adjustable polar and azimuth angle limits
- Target-oriented rotation support

### Translation Controls
- Camera-relative translations (right/left, up/down)
- Configurable translation limits
- Smooth transitions with adjustable lerp factors
- Target position offset management

### General Features
- TypeScript support
- React Three Fiber integration
- Configurable smoothing for all movements
- Event-based input system
- Extensible behavior system

## Installation

```bash
npm install batcam
# or
yarn add batcam
```

## Configuration

### OrbitBehavior Options

```typescript
interface OrbitConfig {
  // Distance limits
  minDistance: number;
  maxDistance: number;
  
  // Angle limits
  minPolarAngle: number;
  maxPolarAngle: number;
  minAzimuthAngle: number;
  maxAzimuthAngle: number;
  
  // Translation limits
  maxTranslationDistance: THREE.Vector2;
  
  // Smoothing factors
  angleLerp: number;
  distanceLerp: number;
  translationLerp: number;
  
  // Target options
  target: THREE.Vector3 | THREE.Object3D;
  useTargetOrientation: boolean;
}
```

## Controls

- **Orbit**: Primary mouse button (left click + drag)
  - Vertical drag: Adjust polar angle
  - Horizontal drag: Adjust azimuth angle
  
- **Zoom**: Mouse wheel
  - Scroll up: Zoom in
  - Scroll down: Zoom out
  
- **Translation**: Secondary mouse button (right click + drag)
  - Drag: Move target position relative to camera orientation

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## License

MIT © [Your Name]

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.