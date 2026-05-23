import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Trail, Sphere, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store/useStore';
import { useTransientStore } from '../store/useTransientStore';

export const SpiritFox3D = () => {
  const meshRef = useRef<THREE.Group>(null);

  // Use transient state for position to avoid React re-renders every frame
  const posRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const emotionRef = useRef<string>('waiting');

  useEffect(() => {
    // Subscribe to specific store fields without triggering re-render
    const unsubEmotion = useStore.subscribe((state) => {
        emotionRef.current = state.companion.emotion;
    });

    const unsubPos = useTransientStore.subscribe((state) => {
        posRef.current = state.companionPosition;
    });

    return () => {
      unsubEmotion();
      unsubPos();
    };
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Improved screen-to-3D mapping
    const vUnits = 12.42;
    const aspect = window.innerWidth / window.innerHeight;
    const hUnits = vUnits * aspect;

    const targetX = ((posRef.current.x / window.innerWidth) - 0.5) * hUnits;
    const targetY = -((posRef.current.y / window.innerHeight) - 0.5) * vUnits;

    meshRef.current.position.x += (targetX - meshRef.current.position.x) * 0.08;
    meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.08;

    // Organic micro-rotations
    const tilt = emotionRef.current === 'excited' ? 1.5 : 1;
    meshRef.current.rotation.y += delta * 0.6 * tilt;
    meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
  });

  const bodyColor = useMemo(() => new THREE.Color(0x67E8F9), []);
  const pulseColor = useMemo(() => new THREE.Color(0x8B5CF6), []);

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <group ref={meshRef}>
        <mesh scale={[0.8, 1, 0.8]}>
          <icosahedronGeometry args={[1, 10]} />
          <MeshDistortMaterial
            color="#ffffff"
            emissive={bodyColor}
            emissiveIntensity={3}
            speed={4}
            distort={0.4}
            radius={1}
            transparent
            opacity={0.9}
          />
        </mesh>

        <group position={[0, 0.6, 0]}>
          <mesh position={[-0.4, 0.3, 0]} rotation={[0, 0, 0.4]}>
            <coneGeometry args={[0.15, 0.8, 4]} />
            <meshStandardMaterial color="#ffffff" emissive={bodyColor} emissiveIntensity={2} />
          </mesh>
          <mesh position={[0.4, 0.3, 0]} rotation={[0, 0, -0.4]}>
            <coneGeometry args={[0.15, 0.8, 4]} />
            <meshStandardMaterial color="#ffffff" emissive={bodyColor} emissiveIntensity={2} />
          </mesh>
        </group>

        <group position={[0, -0.5, 0]}>
            {[...Array(3)].map((_, i) => (
                <Trail
                    key={i}
                    width={1.5}
                    length={10 + i * 2}
                    color={pulseColor}
                    attenuation={(t) => t * t}
                >
                    <Sphere args={[0.05]} />
                </Trail>
            ))}
        </group>

        <Sparkles
            count={20}
            scale={3}
            size={2}
            speed={0.5}
            opacity={0.5}
            color={bodyColor}
        />

        <pointLight intensity={15} distance={20} color="#67E8F9" />
      </group>
    </Float>
  );
};
