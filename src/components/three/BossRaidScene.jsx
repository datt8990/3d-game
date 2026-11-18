import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { ONLINE_BOT_PLAYERS } from '../../data/gameData';
import AnimatedCharacter3D from './AnimatedCharacter3D';

const SHRINK_VEC = new THREE.Vector3(0.1, 0.1, 0.1);

export default function BossRaidScene() {
  const bossRaid = useGameStore((s) => s.bossRaid);
  const hitBossPearl = useGameStore((s) => s.hitBossPearl);

  const bossRef = useRef();
  const minionsRef = useRef();
  const [hitFlash, setHitFlash] = useState(false);

  const handleAttack = (dmg = 250) => {
    if (bossRaid.won) return;
    setHitFlash(true);
    hitBossPearl(dmg);
    setTimeout(() => setHitFlash(false), 110);
  };

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    if (bossRef.current) {
      if (bossRaid.won) {
        bossRef.current.scale.lerp(SHRINK_VEC, delta * 3);
      } else {
        const bounce = 2.1 + Math.abs(Math.sin(t * 3.2)) * 0.55;
        bossRef.current.position.y = bounce;
        bossRef.current.rotation.y = Math.sin(t * 1.5) * 0.45;
      }
    }
    if (minionsRef.current) {
      minionsRef.current.rotation.y += delta * 1.8;
    }
  });

  return (
    <group>
      <mesh receiveShadow position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[16, 48]} />
        <meshStandardMaterial color="#3b1d4a" roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[5.2, 5.5, 48]} />
        <meshBasicMaterial color="#ff8fab" />
      </mesh>

      <group
        ref={bossRef}
        position={[0, 2.2, -1]}
        onPointerDown={(e) => {
          e.stopPropagation();
          handleAttack(260);
        }}
      >
        <mesh castShadow>
          <sphereGeometry args={[1.85, 32, 32]} />
          <meshStandardMaterial
            color={hitFlash ? '#fb6f92' : '#2b132e'}
            emissive={hitFlash ? '#ff8fab' : '#581c87'}
            emissiveIntensity={hitFlash ? 0.9 : 0.3}
            roughness={0.14}
            metalness={0.3}
          />
        </mesh>
        <mesh position={[0, 1.95, 0]}>
          <cylinderGeometry args={[0.85, 0.65, 0.55, 8]} />
          <meshStandardMaterial color="#facc15" metalness={0.75} roughness={0.2} />
        </mesh>
        <mesh position={[-0.58, 0.35, 1.65]} rotation={[0, 0, -0.3]}>
          <boxGeometry args={[0.52, 0.2, 0.15]} />
          <meshBasicMaterial color="#fb7185" />
        </mesh>
        <mesh position={[0.58, 0.35, 1.65]} rotation={[0, 0, 0.3]}>
          <boxGeometry args={[0.52, 0.2, 0.15]} />
          <meshBasicMaterial color="#fb7185" />
        </mesh>

        <group ref={minionsRef}>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const ang = (i / 6) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.cos(ang) * 2.9, -0.3, Math.sin(ang) * 2.9]}>
                <sphereGeometry args={[0.32, 16, 16]} />
                <meshStandardMaterial color="#4a1d59" roughness={0.15} />
              </mesh>
            );
          })}
        </group>
      </group>

      {ONLINE_BOT_PLAYERS.slice(0, 5).map((ally, idx) => {
        const ang = (idx / 5) * Math.PI + 0.3;
        const x = Math.cos(ang) * 5.8;
        const z = Math.sin(ang) * 4.5 + 1.5;
        return (
          <AnimatedCharacter3D
            key={ally.id}
            path={ally.model}
            anim={bossRaid.won ? 'wave' : 'angry'}
            scale={1.0}
            position={[x, 0, z]}
            rotation={[0, Math.atan2(-x, -1 - z), 0]}
          />
        );
      })}
    </group>
  );
}
