import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import * as THREE from 'three';

const COIN_GEO = new THREE.CylinderGeometry(0.14, 0.14, 0.04, 16);
const COIN_MAT = new THREE.MeshStandardMaterial({
  color: '#facc15',
  metalness: 0.75,
  roughness: 0.2,
  emissive: '#d97706',
  emissiveIntensity: 0.25,
});

export default function FloatingCoins3D({ triggerKey, origin = [0, 1.4, 0.4] }) {
  const groupRef = useRef();
  const coinsRef = useRef([]);

  useEffect(() => {
    if (!triggerKey || !groupRef.current) return;

    coinsRef.current.forEach((mesh, i) => {
      if (!mesh) return;
      const angle = (i / 6) * Math.PI * 2;
      const spread = 0.35 + (i % 2) * 0.2;
      mesh.visible = true;
      mesh.position.set(origin[0], origin[1], origin[2]);
      mesh.scale.setScalar(0.01);

      const tl = gsap.timeline({
        onComplete: () => {
          if (mesh) mesh.visible = false;
        },
      });
      tl.to(mesh.scale, { x: 1, y: 1, z: 1, duration: 0.22, ease: 'back.out(2)' }, 0);
      tl.to(
        mesh.position,
        {
          x: origin[0] + Math.cos(angle) * spread,
          y: origin[1] + 1.35 + (i % 3) * 0.22,
          z: origin[2] + Math.sin(angle) * spread,
          duration: 0.95,
          ease: 'power2.out',
        },
        0
      );
      tl.to(mesh.scale, { x: 0.01, y: 0.01, z: 0.01, duration: 0.25, ease: 'power2.in' }, 0.72);
    });
  }, [triggerKey]);

  useFrame((_, delta) => {
    coinsRef.current.forEach((mesh) => {
      if (mesh && mesh.visible) {
        mesh.rotation.y += delta * 9;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: 6 }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => (coinsRef.current[i] = el)}
          geometry={COIN_GEO}
          material={COIN_MAT}
          rotation={[Math.PI / 2, 0, 0]}
          visible={false}
        />
      ))}
    </group>
  );
}
