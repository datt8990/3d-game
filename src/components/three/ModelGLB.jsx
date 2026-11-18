import React, { Suspense, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

function InnerGLB({
  path,
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  castShadow = true,
  receiveShadow = true,
  onClick,
}) {
  const { scene } = useGLTF(path);

  const clonedScene = useMemo(() => {
    const clone = SkeletonUtils.clone(scene);
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = castShadow;
        child.receiveShadow = receiveShadow;
        if (child.material) {
          const mat = child.material.clone();
          if (mat.map) {
            mat.map.anisotropy = 8;
          }
          if ('roughness' in mat) mat.roughness = Math.max(mat.roughness ?? 0.68, 0.62);
          if ('metalness' in mat) mat.metalness = Math.min(mat.metalness ?? 0, 0.06);
          if ('envMapIntensity' in mat) mat.envMapIntensity = 0.28;
          child.material = mat;
        }
      }
    });
    return clone;
  }, [scene, castShadow, receiveShadow]);

  return (
    <group position={position} rotation={rotation} scale={scale} onClick={onClick}>
      <primitive object={clonedScene} />
    </group>
  );
}

export default function ModelGLB(props) {
  return (
    <Suspense fallback={null}>
      <InnerGLB {...props} />
    </Suspense>
  );
}
