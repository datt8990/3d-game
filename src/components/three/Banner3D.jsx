import React, { useMemo } from 'react';
import * as THREE from 'three';

function flattenText(children) {
  if (typeof children === 'string' || typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(flattenText).join('');
  return 'BOBA LAND CAFE';
}

export default function Banner3D({
  position = [0, 3.8, 0],
  rotation = [0, 0, 0],
  color = '#ff8fab',
  size = 'md',
  children,
}) {
  const label = flattenText(children).trim() || 'BOBA LAND CAFE';
  const width = size === 'lg' ? 3.4 : 2.3;
  const height = size === 'lg' ? 0.68 : 0.48;

  const signTex = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 140;
    const ctx = canvas.getContext('2d');

    // Creamy pastel rounded plaque background
    ctx.fillStyle = '#fff5f8';
    ctx.fillRect(0, 0, 640, 140);

    // Inner pink frame
    ctx.strokeStyle = color;
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, 620, 120);

    // Cute corner dots
    ctx.fillStyle = color;
    [
      [26, 26],
      [614, 26],
      [26, 114],
      [614, 114],
    ].forEach(([cx, cy]) => {
      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx.fill();
    });

    // Crisp dark berry text
    ctx.fillStyle = '#591d3b';
    ctx.font = '800 44px "Baloo 2", "Nunito", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label.slice(0, 26), 320, 72);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }, [label, color]);

  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow>
        <boxGeometry args={[width + 0.14, height + 0.12, 0.1]} />
        <meshStandardMaterial color={color} roughness={0.35} />
      </mesh>
      {signTex && (
        <mesh position={[0, 0, 0.055]}>
          <planeGeometry args={[width, height]} />
          <meshStandardMaterial map={signTex} roughness={0.35} />
        </mesh>
      )}
    </group>
  );
}
