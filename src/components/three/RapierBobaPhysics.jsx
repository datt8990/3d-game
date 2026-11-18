import React, { Suspense, useEffect, useRef } from 'react';
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier';
import { useGameStore } from '../../store/useGameStore';

function BouncingPearlsInsideJar() {
  const toppings = useGameStore((s) => s.currentCup.toppings);
  const shakeProgress = useGameStore((s) => s.currentCup.shakeProgress);
  const bodyRefs = useRef([]);

  // Give all physics pearls an upward pop impulse whenever player adds toppings or shakes!
  useEffect(() => {
    bodyRefs.current.forEach((rb, i) => {
      if (rb) {
        rb.applyImpulse(
          {
            x: (Math.random() - 0.5) * 0.0025,
            y: 0.0045 + (i % 3) * 0.0012,
            z: (Math.random() - 0.5) * 0.0025,
          },
          true
        );
      }
    });
  }, [toppings.length, shakeProgress]);

  return (
    <Physics gravity={[0, -9.81, 0]}>
      {/* Invisible Physics Containment Box for the Glass Pearl Jar */}
      <RigidBody type="fixed" colliders={false}>
        {/* Bottom & Top */}
        <CuboidCollider args={[0.18, 0.02, 0.18]} position={[0, 0.02, 0]} />
        <CuboidCollider args={[0.18, 0.02, 0.18]} position={[0, 0.52, 0]} />
        {/* 4 Side Walls */}
        <CuboidCollider args={[0.02, 0.26, 0.18]} position={[-0.17, 0.26, 0]} />
        <CuboidCollider args={[0.02, 0.26, 0.18]} position={[0.17, 0.26, 0]} />
        <CuboidCollider args={[0.18, 0.26, 0.02]} position={[0, 0.26, -0.17]} />
        <CuboidCollider args={[0.18, 0.26, 0.02]} position={[0, 0.26, 0.17]} />
      </RigidBody>

      {/* 10 Real Rapier RigidBody Bouncing Tapioca & Golden Pearls */}
      {Array.from({ length: 10 }, (_, i) => {
        const isGold = i % 3 === 0;
        return (
          <RigidBody
            key={i}
            ref={(el) => (bodyRefs.current[i] = el)}
            colliders="ball"
            restitution={0.78}
            friction={0.2}
            position={[
              ((i % 3) - 1) * 0.06,
              0.12 + i * 0.032,
              (((i + 1) % 3) - 1) * 0.06,
            ]}
          >
            <mesh>
              <sphereGeometry args={[0.042, 10, 10]} />
              <meshStandardMaterial
                color={isGold ? '#f59e0b' : '#1b0f0a'}
                roughness={0.15}
                metalness={0.18}
              />
            </mesh>
          </RigidBody>
        );
      })}
    </Physics>
  );
}

export default function RapierBobaPhysics({ position = [1.05, 1.03, 0.16] }) {
  return (
    <group position={position}>
      {/* Clear Glass Boba Jar Exterior */}
      <mesh position={[0, 0.24, 0]}>
        <cylinderGeometry args={[0.18, 0.17, 0.46, 20, 1, true]} />
        <meshStandardMaterial
          color="#bae6fd"
          transparent
          opacity={0.28}
          roughness={0.08}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 0.48, 0]}>
        <cylinderGeometry args={[0.16, 0.18, 0.05, 20]} />
        <meshStandardMaterial color="#d97706" metalness={0.5} roughness={0.3} />
      </mesh>

      <Suspense fallback={null}>
        <BouncingPearlsInsideJar />
      </Suspense>
    </group>
  );
}
