import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import ModelGLB from './ModelGLB';
import AnimatedCharacter3D from './AnimatedCharacter3D';

const PEARL_SUCK_GEO = new THREE.SphereGeometry(0.095, 10, 10);
const PEARL_SUCK_MAT = new THREE.MeshStandardMaterial({ color: '#1c110c', roughness: 0.2 });

export default function AlienUFO3D() {
  const alienQuest = useGameStore((s) => s.alienQuest);
  const ufoRef = useRef();
  const pearlsRef = useRef();

  const flyingPearls = useMemo(
    () =>
      Array.from({ length: 42 }, (_, i) => ({
        angle: (i / 42) * Math.PI * 6,
        radius: 0.25 + (i % 6) * 0.16,
        yOffset: (i / 42) * 4.8,
        speed: 2.1 + (i % 4) * 0.35,
      })),
    []
  );

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    if (ufoRef.current) {
      ufoRef.current.rotation.y += delta * 1.4;
      ufoRef.current.position.y = 4.9 + Math.sin(t * 2.4) * 0.22;
    }
    if (pearlsRef.current && alienQuest.stage === 'failed_suck') {
      pearlsRef.current.children.forEach((mesh, idx) => {
        const p = flyingPearls[idx];
        const y = (t * p.speed + p.yOffset) % 4.6;
        const r = p.radius * (1 - y / 6.0);
        mesh.position.set(Math.cos(t * 4 + p.angle) * r, y + 0.4, Math.sin(t * 4 + p.angle) * r);
      });
    }
  });

  if (!alienQuest.active) return null;

  return (
    <group position={[0, 0, 0.95]}>
      <group ref={ufoRef} position={[0, 4.9, 1.2]}>
        <ModelGLB path="/models/quaternius/ufo_frog.glb" scale={0.34} castShadow={false} />
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
          <torusGeometry args={[1.65, 0.07, 10, 28]} />
          <meshBasicMaterial color="#4ade80" />
        </mesh>
      </group>

      <mesh position={[0, 2.4, 0.5]}>
        <coneGeometry args={[1.45, 4.8, 20, 1, true]} />
        <meshBasicMaterial color="#4ade80" transparent opacity={0.14} depthWrite={false} side={2} />
      </mesh>

      {alienQuest.stage !== 'failed_suck' && (
        <AnimatedCharacter3D
          presetKey="alien"
          anim={alienQuest.stage === 'won' ? 'wave' : 'idle'}
          scale={1.0}
          position={[0, 0, 0]}
          rotation={[0, Math.PI, 0]}
        />
      )}

      {alienQuest.stage === 'failed_suck' && (
        <group ref={pearlsRef}>
          {flyingPearls.map((_, idx) => (
            <mesh key={idx} geometry={PEARL_SUCK_GEO} material={PEARL_SUCK_MAT} />
          ))}
        </group>
      )}
    </group>
  );
}
