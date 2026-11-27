import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import gsap from 'gsap';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { SHOP_THEMES } from './cafeTextures';
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

  useEffect(() => {
    camera.fov = isPortrait ? 58 : 46;
    camera.updateProjectionMatrix();

    let pos = isPortrait ? { x: 6.4, y: 8.6, z: 13.0 } : { x: 5.2, y: 6.2, z: 9.6 };
    let look = { x: 0, y: 1.05, z: -0.45 };

    if (sceneMode === 'crafting') {
      // Barista POV: mathematically centered so Hero Boba Cup & Anime Character face frame cleanly above the 3-step dock!
      pos = isPortrait ? { x: 0, y: 2.28, z: -3.55 } : { x: 0, y: 2.15, z: -3.32 };
      look = isPortrait ? { x: 0, y: 0.74, z: 0.2 } : { x: 0, y: 0.74, z: 0.25 };
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
        pos = isPortrait ? { x: 0, y: 2.32, z: -3.55 } : { x: 0, y: 2.18, z: -3.05 };
        look = { x: 0, y: 0.92, z: 0.5 };
      } else if (cameraTarget === 'vip') {
        pos = { x: 2.2, y: 3.8, z: isPortrait ? 6.4 : 4.8 };
        look = { x: 3.6, y: 1.0, z: -0.6 };
      } else if (cameraTarget === 'rooftop') {
        pos = { x: 4.8, y: 7.4, z: isPortrait ? 10.4 : 8.0 };
        look = { x: 0, y: 4.4, z: -1.4 };
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
  const shopTheme = useGameStore((s) => s.shopTheme || 'sakura');
  const controlsRef = useRef();

  const isMobile =
    typeof window !== 'undefined' &&
    (window.innerWidth < 820 || window.matchMedia?.('(pointer: coarse)')?.matches);

  const theme = SHOP_THEMES[shopTheme] || SHOP_THEMES.sakura;
  const enableOrbit = sceneMode === 'shop' || sceneMode === 'city';
  const isShopOrCrafting = sceneMode === 'shop' || sceneMode === 'crafting';

  const skyColor = sceneMode === 'boss_raid' ? '#3b1d4a' : theme.sky;
  const fogColor = sceneMode === 'boss_raid' ? '#3b1d4a' : theme.fog;

  return (
    <div className="fixed inset-0 w-full h-full z-0 touch-none">
      <Canvas
        shadows={isMobile ? true : 'soft'}
        dpr={isMobile ? [1, 1.35] : [1, 2]}
        camera={{ position: [5.4, 6.4, 9.8], fov: 46 }}
        gl={{
          antialias: true,
          preserveDrawingBuffer: true, // Enables real BobaGram 3D Photo Check-in!
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.94,
        }}
      >
        <color attach="background" args={[skyColor]} />
        <fog attach="fog" args={[fogColor, 26, 64]} />

        <ambientLight intensity={isMobile ? 0.6 : 0.52} color={theme.ambient} />
        <hemisphereLight args={[theme.hemiSky, theme.hemiGround, 0.68]} />
        <directionalLight
          castShadow
          position={[10, 17, 12]}
          intensity={theme.sunIntensity}
          color={theme.sunColor}
          shadow-mapSize={isMobile ? [512, 512] : [1024, 1024]}
          shadow-bias={-0.0005}
          shadow-camera-left={-14}
          shadow-camera-right={14}
          shadow-camera-top={14}
          shadow-camera-bottom={-14}
        />

        <Suspense fallback={null}>
          <Environment files="/hdri/cafe_env.hdr" environmentIntensity={0.28} />
        </Suspense>

        <Suspense fallback={null}>
          {isShopOrCrafting && <BobaShopScene />}
          {sceneMode === 'city' && <BobaCityScene />}
          {sceneMode === 'boss_raid' && <BossRaidScene />}
          {sceneMode === 'cup_runner' && <CupRunnerScene />}
        </Suspense>

        {!isMobile && (
          <ContactShadows
            frames={1}
            position={[0, 0.01, 0]}
            resolution={512}
            opacity={0.34}
            scale={24}
            blur={2.2}
            far={6}
          />
        )}

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
