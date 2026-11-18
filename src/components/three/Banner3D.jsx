import React from 'react';
import { Html } from '@react-three/drei';

export default function Banner3D({
  position = [0, 0, 0],
  children,
  color = '#f9a8d4',
  bg = 'rgba(35, 16, 62, 0.88)',
  size = 'md',
  distanceFactor = 10,
}) {
  const sizeCls =
    size === 'lg'
      ? 'text-base sm:text-lg px-4 py-1.5 rounded-2xl border-2'
      : size === 'xs'
      ? 'text-[10px] px-1.5 py-0.5 rounded-md border'
      : 'text-xs sm:text-sm px-3 py-1 rounded-xl border';

  return (
    <Html
      position={position}
      center
      distanceFactor={distanceFactor}
      style={{ pointerEvents: 'none', userSelect: 'none' }}
    >
      <div
        className={`font-display font-extrabold whitespace-nowrap shadow-xl ${sizeCls}`}
        style={{
          color,
          background: bg,
          borderColor: color,
          textShadow: `0 0 12px ${color}88`,
        }}
      >
        {children}
      </div>
    </Html>
  );
}
