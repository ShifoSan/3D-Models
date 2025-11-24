import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, CameraControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Planet Data (Scenic/Relative Scale)
const PLANETS = [
  { name: 'Mercury', color: '#B0B0B0', size: 0.4, distance: 10, speed: 4.1 },
  { name: 'Venus', color: '#E3BB76', size: 0.8, distance: 15, speed: 1.6 },
  { name: 'Earth', color: '#2B3284', size: 1.0, distance: 20, speed: 1.0 },
  { name: 'Mars', color: '#D14A28', size: 0.6, distance: 25, speed: 0.5 },
  { name: 'Jupiter', color: '#BCB19C', size: 3.5, distance: 35, speed: 0.08 },
  { name: 'Saturn', color: '#C5AB6E', size: 3.0, distance: 45, speed: 0.03 },
  { name: 'Uranus', color: '#93B8BE', size: 1.8, distance: 55, speed: 0.01 },
  { name: 'Neptune', color: '#4b70dd', size: 1.7, distance: 65, speed: 0.006 },
];

function Planet({ planet, speedMultiplier, onPlanetClick, onPlanetHover, onPlanetOut, isSelected }) {
  const meshRef = useRef();
  const groupRef = useRef();

  // Random start angle so they aren't all aligned
  const initialAngle = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state, delta) => {
    if (groupRef.current) {
        // Rotate the group to orbit
        groupRef.current.rotation.y += (planet.speed * speedMultiplier * delta);
    }
    if (meshRef.current) {
        // Rotate the planet itself a bit
        meshRef.current.rotation.y += delta * 0.5;
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    onPlanetClick(planet, meshRef);
  };

  return (
    <group ref={groupRef} rotation={[0, initialAngle, 0]}>
      {/* Orbit Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[planet.distance, 0.05, 16, 100]} />
        <meshBasicMaterial color="#ffffff" opacity={0.2} transparent />
      </mesh>

      {/* Planet Mesh Container - Offset by distance */}
      <group position={[planet.distance, 0, 0]}>
        <mesh
          ref={meshRef}
          onClick={handleClick}
          onPointerOver={(e) => { e.stopPropagation(); onPlanetHover(planet); }}
          onPointerOut={(e) => { onPlanetOut(); }}
        >
          <sphereGeometry args={[planet.size, 32, 32]} />
          <meshStandardMaterial
            color={planet.color}
            emissive={planet.color}
            emissiveIntensity={isSelected ? 0.6 : 0.1} // Highlight if selected
            roughness={0.7}
          />
        </mesh>
      </group>
    </group>
  );
}

function Sun() {
  return (
    <mesh>
      <sphereGeometry args={[4.5, 32, 32]} />
      <meshStandardMaterial color="#FFD700" emissive="#FFD000" emissiveIntensity={2} toneMapped={false} />
      <pointLight intensity={2} distance={100} decay={2} color="#fff" />
    </mesh>
  );
}

function Scene({ selectedPlanetName, speedMultiplier, onPlanetClick, onPlanetHover, onPlanetOut }) {
  const cameraControlsRef = useRef();

  const handlePlanetClick = (planet, meshRef) => {
    onPlanetClick(planet);

    if (cameraControlsRef.current && meshRef.current) {
        // Calculate world position of the planet
        const worldPos = new THREE.Vector3();
        meshRef.current.getWorldPosition(worldPos);

        // Fit camera to sphere with some padding
        // fitToBox(box, enableTransition)
        // or setLookAt(positionX, positionY, positionZ, targetX, targetY, targetZ, enableTransition)

        // Let's zoom in nicely. We want to look AT the planet, from a position slightly offset.
        // Since the planet moves, this is tricky for a static "lookAt".
        // But CameraControls has 'fitToBox' which might handle static bounds well, but moving objects are harder.
        // However, user asked for "Click to Focus", implies moving camera there.
        // For a moving planet, we might need to update the camera target in a useFrame if we want to "lock" on it.
        // BUT, keeping it simple: just move camera to the planet's CURRENT position.
        // If the planet moves away, the user can pan/orbit.

        // Better yet: Just move camera close to the planet.
        const offset = planet.size * 3.5;
        // We can use fitToSphere?
        cameraControlsRef.current.fitToSphere(meshRef.current, true);
    }
  };

  // Helper to reset view if needed (optional)
  // const resetView = () => cameraControlsRef.current?.reset(true);

  return (
    <>
      <ambientLight intensity={0.1} />
      <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      <Sun />

      {PLANETS.map((planet) => (
        <Planet
          key={planet.name}
          planet={planet}
          speedMultiplier={speedMultiplier}
          onPlanetClick={handlePlanetClick}
          onPlanetHover={onPlanetHover}
          onPlanetOut={onPlanetOut}
          isSelected={selectedPlanetName === planet.name}
        />
      ))}

      <CameraControls ref={cameraControlsRef} makeDefault minDistance={5} maxDistance={200} />
    </>
  );
}

export default function SolarSystem({
  onHoverChange,
  onSelectionChange,
  speedMultiplier,
  selectedPlanetName
}) {

  return (
    <Canvas camera={{ position: [0, 60, 90], fov: 45 }} style={{ background: 'black' }} onClick={() => onSelectionChange(null)}>
      <Scene
        selectedPlanetName={selectedPlanetName}
        speedMultiplier={speedMultiplier}
        onPlanetClick={onSelectionChange}
        onPlanetHover={onHoverChange}
        onPlanetOut={() => onHoverChange(null)}
      />
    </Canvas>
  );
}
