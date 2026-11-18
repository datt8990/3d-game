import React, { Suspense, useEffect, useMemo, useRef } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import KawaiiChibi3D from './KawaiiChibi3D';

export default function AnimatedCharacter3D(props) {
  return <KawaiiChibi3D {...props} />;
}

function InnerAnimatedAnimal({
  path = '/models/quaternius/pet_shiba.glb',
  anim = 'Idle',
  scale = 0.2,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) {
  const groupRef = useRef();
  const { scene, animations } = useGLTF(path);

  const clonedScene = useMemo(() => {
    const clone = SkeletonUtils.clone(scene);
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          const mat = child.material.clone();
          if ('roughness' in mat) mat.roughness = 0.68;
          if ('metalness' in mat) mat.metalness = 0.03;
          if ('envMapIntensity' in mat) mat.envMapIntensity = 0.28;
          child.material = mat;
        }
      }
    });
    return clone;
  }, [scene]);

  const { actions } = useAnimations(animations, groupRef);

  useEffect(() => {
    if (!actions) return;
    const fullKey = `AnimalArmature|${anim}`;
    const act = actions[fullKey] || actions['AnimalArmature|Idle'] || Object.values(actions)[0];
    if (!act) return;
    act.reset().fadeIn(0.25).play();
    return () => act.fadeOut(0.2);
  }, [actions, anim]);

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <primitive object={clonedScene} scale={scale} />
    </group>
  );
}

export function AnimatedAnimal3D(props) {
  return (
    <Suspense fallback={null}>
      <InnerAnimatedAnimal {...props} />
    </Suspense>
  );
}
