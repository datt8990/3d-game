import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import gsap from 'gsap';

// Cache raw ArrayBuffers so each .vrm downloads only ONCE over the network,
// while every mounted character gets its own independent VRM skeleton, expressions & hair physics!
const vrmBufferPromises = new Map();

function fetchVrmBuffer(url) {
  if (!vrmBufferPromises.has(url)) {
    vrmBufferPromises.set(
      url,
      fetch(url).then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch VRM: ${url}`);
        return res.arrayBuffer();
      })
    );
  }
  return vrmBufferPromises.get(url);
}

function createVrmLoader() {
  const loader = new GLTFLoader();
  loader.register((parser) => new VRMLoaderPlugin(parser));
  return loader;
}

const IS_MOBILE_PERF =
  typeof window !== 'undefined' &&
  (window.innerWidth < 820 || window.matchMedia?.('(pointer: coarse)')?.matches);

function VrmAnimeCharacter({
  path = '/models/anime/anime_vivi.vrm',
  anim = 'idle',
  scale = 1.0,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  onClick,
  children,
}) {
  const safePath = path && path.endsWith('.vrm') ? path : '/models/anime/anime_vivi.vrm';
  const groupRef = useRef();
  const vrmRef = useRef(null);
  const [vrmScene, setVrmScene] = useState(null);
  const phaseRef = useRef(Math.random() * 10);
  const accumRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    let activeVrm = null;

    fetchVrmBuffer(safePath)
      .then((rawBuf) => {
        if (cancelled) return;
        const loader = createVrmLoader();
        // Slice buffer so parser owns a fresh copy
        loader.parse(
          rawBuf.slice(0),
          '',
          (gltf) => {
            if (cancelled) return;
            const vrm = gltf.userData?.vrm;
            if (!vrm) return;

            if (typeof VRMUtils.removeUnnecessaryVertices === 'function') {
              try { VRMUtils.removeUnnecessaryVertices(vrm.scene); } catch {}
            }
            if (typeof VRMUtils.combineSkeletons === 'function') {
              try { VRMUtils.combineSkeletons(vrm.scene); } catch {}
            }
            if (typeof VRMUtils.rotateVRM0 === 'function') {
              VRMUtils.rotateVRM0(vrm);
            }

            vrm.scene.traverse((obj) => {
              if (obj.isMesh) {
                // On mobile GPUs, skip double-pass skinned shadow casting for silky 60 FPS!
                obj.castShadow = !IS_MOBILE_PERF;
                obj.receiveShadow = true;
                obj.frustumCulled = false;
              }
            });

            // Cute soft smile by default
            try {
              vrm.expressionManager?.setValue('happy', 0.35);
            } catch {
              // Ignore if preset absent
            }

            activeVrm = vrm;
            vrmRef.current = vrm;
            setVrmScene(vrm.scene);
          },
          () => {
            // Silently ignore parse error
          }
        );
      })
      .catch(() => {
        // Silently ignore network error
      });

    return () => {
      cancelled = true;
      vrmRef.current = null;
      setVrmScene(null);
      if (activeVrm && typeof VRMUtils.deepDispose === 'function') {
        try {
          VRMUtils.deepDispose(activeVrm.scene);
        } catch {
          // Ignore dispose error
        }
      }
    };
  }, [safePath]);

  useFrame((state, delta) => {
    const vrm = vrmRef.current;
    if (!vrm) return;

    // On phones, throttle VRM bone/spring-bone update to ~30Hz (silky visual motion at half CPU cost!)
    if (IS_MOBILE_PERF) {
      accumRef.current += delta;
      if (accumRef.current < 0.032) return;
    }
    const dt = Math.min(IS_MOBILE_PERF ? accumRef.current : delta, 0.05);
    accumRef.current = 0;
    const t = state.clock.getElapsedTime() + phaseRef.current;
    const h = vrm.humanoid;

    if (h) {
      const hips = h.getNormalizedBoneNode('hips');
      const spine = h.getNormalizedBoneNode('spine');
      const chest = h.getNormalizedBoneNode('chest');
      const head = h.getNormalizedBoneNode('head');
      const lUpperArm = h.getNormalizedBoneNode('leftUpperArm');
      const rUpperArm = h.getNormalizedBoneNode('rightUpperArm');
      const lLowerArm = h.getNormalizedBoneNode('leftLowerArm');
      const rLowerArm = h.getNormalizedBoneNode('rightLowerArm');
      const lUpperLeg = h.getNormalizedBoneNode('leftUpperLeg');
      const rUpperLeg = h.getNormalizedBoneNode('rightUpperLeg');
      const lLowerLeg = h.getNormalizedBoneNode('leftLowerLeg');
      const rLowerLeg = h.getNormalizedBoneNode('rightLowerLeg');

      const mode = String(anim || 'idle').toLowerCase();
      const isMoving = mode === 'walk' || mode === 'run';
      const isWave = mode === 'wave' || mode === 'serve';

      // Gentle breathing & cute anime posture
      if (spine) spine.rotation.x = Math.sin(t * 2.0) * 0.02;
      if (chest) chest.rotation.x = Math.sin(t * 2.0 - 0.5) * 0.025;
      if (head) {
        head.rotation.y = Math.sin(t * 0.85) * 0.14;
        head.rotation.z = Math.sin(t * 0.65) * 0.055;
        head.rotation.x = Math.sin(t * 1.4) * 0.03;
      }

      if (isMoving) {
        const freq = mode === 'run' ? 9.5 : 5.8;
        const swing = mode === 'run' ? 0.52 : 0.34;
        const s = Math.sin(t * freq);

        if (hips) hips.position.y = Math.abs(Math.cos(t * freq)) * 0.032;
        if (lUpperLeg) lUpperLeg.rotation.x = s * swing;
        if (rUpperLeg) rUpperLeg.rotation.x = -s * swing;
        if (lLowerLeg) lLowerLeg.rotation.x = Math.max(0, -s) * swing * 1.05;
        if (rLowerLeg) rLowerLeg.rotation.x = Math.max(0, s) * swing * 1.05;

        if (lUpperArm) {
          lUpperArm.rotation.z = 1.22;
          lUpperArm.rotation.x = -s * swing * 0.7;
        }
        if (rUpperArm) {
          rUpperArm.rotation.z = -1.22;
          rUpperArm.rotation.x = s * swing * 0.7;
        }
        if (lLowerArm) lLowerArm.rotation.x = 0.2;
        if (rLowerArm) rLowerArm.rotation.x = 0.2;
      } else {
        // Relaxed graceful anime standing pose (arms gently down by sides!)
        if (lUpperLeg) lUpperLeg.rotation.x = 0;
        if (rUpperLeg) rUpperLeg.rotation.x = 0;
        if (lLowerLeg) lLowerLeg.rotation.x = 0;
        if (rLowerLeg) rLowerLeg.rotation.x = 0;

        if (lUpperArm) {
          lUpperArm.rotation.z = 1.24 + Math.sin(t * 1.6) * 0.03;
          lUpperArm.rotation.x = 0.08;
        }
        if (lLowerArm) {
          lLowerArm.rotation.x = 0.16;
          lLowerArm.rotation.z = 0.06;
        }

        if (isWave) {
          // Cute gentle right-hand greeting wave!
          if (rUpperArm) {
            rUpperArm.rotation.z = -0.55 + Math.sin(t * 5.0) * 0.12;
            rUpperArm.rotation.x = 0.28;
          }
          if (rLowerArm) {
            rLowerArm.rotation.z = -0.65 + Math.sin(t * 5.0) * 0.18;
            rLowerArm.rotation.x = 0.22;
          }
        } else {
          if (rUpperArm) {
            rUpperArm.rotation.z = -1.24 - Math.sin(t * 1.6) * 0.03;
            rUpperArm.rotation.x = 0.08;
          }
          if (rLowerArm) {
            rLowerArm.rotation.x = 0.16;
            rLowerArm.rotation.z = -0.06;
          }
        }
      }
    }

    // Automatic Natural Anime Eye Blinking every ~4 seconds!
    if (vrm.expressionManager) {
      const blinkCycle = t % 4.2;
      const blinkVal =
        blinkCycle > 4.02 ? Math.sin(((blinkCycle - 4.02) / 0.18) * Math.PI) : 0;
      try {
        vrm.expressionManager.setValue('blink', Math.max(0, Math.min(1, blinkVal)));
        vrm.expressionManager.setValue('happy', 0.36 + Math.sin(t * 0.7) * 0.08);
      } catch {
        // Ignore missing preset
      }
    }

    // Update VRM humanoid rig, expressions & spring-bone hair/skirt physics!
    try {
      vrm.update(dt);
    } catch {
      // Ignore frame update error
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      onClick={
        onClick
          ? (e) => {
              e.stopPropagation();
              onClick(e);
            }
          : undefined
      }
      onPointerOver={onClick ? () => { document.body.style.cursor = 'pointer'; } : undefined}
      onPointerOut={onClick ? () => { document.body.style.cursor = 'auto'; } : undefined}
    >
      {vrmScene && <primitive object={vrmScene} scale={scale * 1.06} />}
      {children}
    </group>
  );
}

export default function AnimatedCharacter3D(props) {
  return (
    <Suspense fallback={null}>
      <VrmAnimeCharacter {...props} />
    </Suspense>
  );
}

// Animated 3D Cafe Pets (Cat, Dog, Alpaca) with Clickable Petting Bounce!
function resolveAnimalClip(actions, anim) {
  if (!actions) return null;
  const keys = Object.keys(actions);
  if (!keys.length) return null;
  const target = String(anim || 'Idle').toLowerCase();
  const exact = keys.find(
    (k) => k.toLowerCase() === target || k.toLowerCase().endsWith(`|${target}`)
  );
  return exact || keys[0];
}

function InnerAnimatedAnimal({
  path = '/models/cafe/pet_cat.glb',
  anim = 'Idle',
  scale = 1.0,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  onClick,
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
          if ('roughness' in mat) mat.roughness = 0.62;
          if ('metalness' in mat) mat.metalness = 0.04;
          if ('envMapIntensity' in mat) mat.envMapIntensity = 0.3;
          child.material = mat;
        }
      }
    });
    return clone;
  }, [scene]);

  const { actions } = useAnimations(animations, groupRef);

  useEffect(() => {
    const clipName = resolveAnimalClip(actions, anim);
    if (!clipName || !actions[clipName]) return;
    const act = actions[clipName];
    act.reset().fadeIn(0.25).play();
    return () => act.fadeOut(0.2);
  }, [actions, anim]);

  const handleTap = (e) => {
    if (!onClick) return;
    e.stopPropagation();
    if (groupRef.current) {
      gsap.fromTo(
        groupRef.current.position,
        { y: position[1] },
        { y: position[1] + 0.24, duration: 0.16, yoyo: true, repeat: 1, ease: 'power2.out' }
      );
    }
    onClick(e);
  };

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      onClick={onClick ? handleTap : undefined}
      onPointerOver={onClick ? () => { document.body.style.cursor = 'pointer'; } : undefined}
      onPointerOut={onClick ? () => { document.body.style.cursor = 'auto'; } : undefined}
    >
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
