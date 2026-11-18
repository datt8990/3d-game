import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import gsap from 'gsap';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import BobaShopScene from './BobaShopScene';
import BobaCityScene from './BobaCityScene';
import BossRaidScene from './BossRaidScene';
import CupRunnerScene from './CupRunnerScene';

function GsapCameraRig({ controlsRef }) {
  const sceneMode = useGameStore((s) => s.sceneMode);
  const cameraTarget = useGameStore((s) => s.cameraTarget);
  const angrySplat = useGameStore((s) => s.angrySplat);
  const bossDamage = useGameStore((s) => s.bossRaid.playerDamage);
  const { camera, size } = useThree();

  const isPortrait = size.width < size.height * 0.9;

  // Responsive FOV + Camera Distance for Both Portrait Phones & Desktop Monitors!
  useEffect(() => {
    camera.fov = isPortrait ? 60 : 48;
    camera.updateProjectionMatrix();

    let pos = isPortrait ? { x: 6.2, y: 8.6, z: 12.8 } : { x: 4.8, y: 6.4, z: 9.2 };
    let look = { x: 0, y: 0.95, z: -0.4 };

    if (sceneMode === 'crafting') {
      // Barista Behind-Counter POV: lower look.y lifts the 3D Counter, Cup & Customer right into the open center above the bottom dock!
      pos = isPortrait ? { x: 0, y: 2.38, z: -3.75 } : { x: 0, y: 2.22, z: -3.12 };
      look = isPortrait ? { x: 0, y: 0.58, z: 0.25 } : { x: 0, y: 0.68, z: 0.35 };
    } else if (sceneMode === 'city') {
      pos = isPortrait ? { x: 0, y: 14.5, z: 21.0 } : { x: 0, y: 11.2, z: 16.5 };
      look = { x: 0, y: 0.9, z: 1.5 };
    } else if (sceneMode === 'boss_raid') {
      pos = isPortrait ? { x: 0, y: 5.4, z: 12.8 } : { x: 0, y: 4.4, z: 9.6 };
      look = { x: 0, y: 1.9, z: -0.5 };
    } else if (sceneMode === 'cup_runner') {
      pos = isPortrait ? { x: 0, y: 6.0, z: 10.8 } : { x: 0, y: 4.8, z: 8.2 };
      look = { x: 0, y: 1.0, z: -3.5 };
    } else {
      if (cameraTarget === 'counter') {
        pos = isPortrait ? { x: 0, y: 2.38, z: -3.75 } : { x: 0, y: 2.25, z: -3.15 };
        look = { x: 0, y: 0.85, z: 0.5 };
      } else if (cameraTarget === 'vip') {
        pos = { x: 2.2, y: 3.8, z: isPortrait ? 6.4 : 4.8 };
        look = { x: 3.5, y: 1.0, z: -1.1 };
      } else if (cameraTarget === 'rooftop') {
        pos = { x: 4.5, y: 7.2, z: isPortrait ? 10.2 : 7.8 };
        look = { x: 0, y: 4.1, z: -1.4 };
      }
    }

    gsap.killTweensOf(camera.position);
    gsap.to(camera.position, {
      x: pos.x,
      y: pos.y,
      z: pos.z,
      duration: 0.85,
      ease: 'power3.out',
    });

    if (controlsRef.current) {
      gsap.killTweensOf(controlsRef.current.target);
      gsap.to(controlsRef.current.target, {
        x: look.x,
        y: look.y,
        z: look.z,
        duration: 0.85,
        ease: 'power3.out',
        onUpdate: () => controlsRef.current?.update(),
      });
    }
  }, [sceneMode, cameraTarget, isPortrait, camera, controlsRef]);

  useEffect(() => {
    if (!angrySplat && !bossDamage) return;
    const intensity = angrySplat ? 0.2 : 0.08;
    const basePos = camera.position.clone();
    gsap.fromTo(
      camera.position,
      { x: basePos.x - intensity, y: basePos.y + intensity * 0.6 },
      {
        x: basePos.x,
        y: basePos.y,
        duration: 0.32,
        ease: 'elastic.out(1.2, 0.25)',
      }
    );
  }, [angrySplat, bossDamage, camera]);

  return null;
}

export default function GameCanvas() {
  const sceneMode = useGameStore((s) => s.sceneMode);
  const controlsRef = useRef();

  const enableOrbit = sceneMode === 'shop' || sceneMode === 'city';
  const isShopOrCrafting = sceneMode === 'shop' || sceneMode === 'crafting';

  const skyColor = sceneMode === 'boss_raid' ? '#3b1d4a' : '#a8dadc';
  const fogColor = sceneMode === 'boss_raid' ? '#3b1d4a' : '#dff2f6';

  return (
    <div className="fixed inset-0 w-full h-full z-0 touch-none">
      <Canvas
        shadows="soft"
        dpr={[1, 2]}
        camera={{ position: [6.2, 6.6, 10.2], fov: 48 }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.94,
        }}
      >
        <color attach="background" args={[skyColor]} />
        <fog attach="fog" args={[fogColor, 26, 62]} />

        <ambientLight intensity={0.5} color="#fff7f9" />
        <hemisphereLight args={['#ffeef4', '#b08968', 0.62]} />
        <directionalLight
          castShadow
          position={[10, 17, 12]}
          intensity={1.2}
          color="#fff3d9"
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.0004}
          shadow-camera-left={-15}
          shadow-camera-right={15}
          shadow-camera-top={15}
          shadow-camera-bottom={-15}
        />

        <Suspense fallback={null}>
          <Environment files="/hdri/cafe_env.hdr" environmentIntensity={0.25} />
        </Suspense>

        <Suspense fallback={null}>
          {isShopOrCrafting && <BobaShopScene />}
          {sceneMode === 'city' && <BobaCityScene />}
          {sceneMode === 'boss_raid' && <BossRaidScene />}
          {sceneMode === 'cup_runner' && <CupRunnerScene />}
        </Suspense>

        <ContactShadows
          frames={1}
          position={[0, 0.01, 0]}
          resolution={512}
          opacity={0.35}
          scale={24}
          blur={2.2}
          far={6}
        />

        <OrbitControls
          ref={controlsRef}
          enabled={enableOrbit}
          enableDamping
          dampingFactor={0.08}
          maxPolarAngle={Math.PI / 2.08}
          minDistance={3.5}
          maxDistance={26}
          enablePan={false}
        />
        <GsapCameraRig controlsRef={controlsRef} />
      </Canvas>
    </div>
  );
}
