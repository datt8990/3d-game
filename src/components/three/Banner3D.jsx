import React from 'react';
import { RoundedBox } from '@react-three/drei';

// Pure 3D Kawaii Sign Plaque (Zero Drei <Html> nested React roots = Zero React 19 unmount errors!)
export default function Banner3D({ position = [0, 0, 0], color = '#f9a8d4' }) {
  return (
    <group position={position}>
      <RoundedBox args={[3.4, 0.56, 0.1]} radius={0.12} castShadow>
        <meshStandardMaterial color="#fff0f6" roughness={0.4} />
      </RoundedBox>
      <mesh position={[0, 0, 0.055]}>
        <planeGeometry args={[3.1, 0.36]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}
