import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import * as THREE from 'three';
import { TEA_BASES } from '../../data/gameData';
import { getBobaCupStickerTexture, getTigerStripeTexture } from './cafeTextures';

const PEARL_GEO = new THREE.SphereGeometry(0.075, 14, 14);
const JELLY_GEO = new THREE.BoxGeometry(0.105, 0.085, 0.105);
const ICE_GEO = new THREE.BoxGeometry(0.145, 0.145, 0.145);

const BLACK_PEARL_MAT = new THREE.MeshStandardMaterial({
  color: '#1b0f0a',
  roughness: 0.12,
  metalness: 0.14,
});
const GOLD_PEARL_MAT = new THREE.MeshStandardMaterial({
  color: '#f59e0b',
  roughness: 0.15,
  metalness: 0.28,
});
const JELLY_MAT = new THREE.MeshStandardMaterial({
  color: '#e0f2fe',
  transparent: true,
  opacity: 0.85,
  roughness: 0.16,
});
const ICE_MAT = new THREE.MeshStandardMaterial({
  color: '#bae6fd',
  transparent: true,
  opacity: 0.74,
  roughness: 0.08,
  metalness: 0.05,
});

export default function BobaCup3D({
  cup,
  position = [0, 0, 0],
  scale = 1,
  autoRotate = false,
  isPouring = false,
}) {
  const groupRef = useRef();
  const liquidRef = useRef();
  const pearlsGroupRef = useRef();
  const iceGroupRef = useRef();
  const dropGroupRef = useRef();
  const heartsRef = useRef();

  const stickerTex = useMemo(() => getBobaCupStickerTexture(), []);
  const tigerTex = useMemo(() => getTigerStripeTexture(), []);

  const teaObj = useMemo(() => {
    if (!cup?.tea) return null;
    return TEA_BASES.find((t) => t.id === cup.tea) || TEA_BASES[0];
  }, [cup?.tea]);

  const { teaPureColor, liquidColor } = useMemo(() => {
    if (!teaObj) return { teaPureColor: null, liquidColor: null };
    const baseC = new THREE.Color(teaObj.color);
    const milkC = new THREE.Color(teaObj.milkColor);
    const ratio = cup.milk === null || cup.milk === undefined ? 0.5 : cup.milk / 100;
    return {
      teaPureColor: teaObj.color,
      liquidColor: '#' + baseC.clone().lerp(milkC, ratio).getHexString(),
    };
  }, [teaObj, cup?.milk]);

  const targetFill = !cup?.tea ? 0 : cup?.milk > 0 ? 1.0 : 0.75;
  const toppingCountKey = `${cup?.toppings?.join(',')}_${cup?.pearl200}_${cup?.pudding5}_${cup?.ice}`;

  // GSAP Bouncy Physics Drop whenever toppings or ice are added!
  useEffect(() => {
    if (!dropGroupRef.current) return;
    if (!cup?.toppings?.length && !cup?.ice && !cup?.pearl200) return;

    gsap.killTweensOf(dropGroupRef.current.position);
    gsap.fromTo(
      dropGroupRef.current.position,
      { y: 1.05 },
      { y: 0, duration: 0.52, ease: 'bounce.out' }
    );
    if (groupRef.current) {
      gsap.fromTo(
        groupRef.current.scale,
        { x: scale * 1.08, y: scale * 0.93, z: scale * 1.08 },
        { x: scale, y: scale, z: scale, duration: 0.4, ease: 'elastic.out(1, 0.4)' }
      );
    }
  }, [toppingCountKey, scale]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.9;
    }
    if (liquidRef.current && liquidColor) {
      liquidRef.current.scale.y = THREE.MathUtils.lerp(
        liquidRef.current.scale.y,
        targetFill,
        Math.min(1, delta * 12.0)
      );
    }
    if (pearlsGroupRef.current) {
      const swirlSpeed = cup?.shakeProgress > 0 && cup?.shakeProgress < 100 ? 7.0 : 0.45;
      pearlsGroupRef.current.rotation.y += delta * swirlSpeed;
      pearlsGroupRef.current.children.forEach((pMesh, idx) => {
        pMesh.position.y = pMesh.userData.baseY + Math.sin(t * 2.6 + idx * 0.9) * 0.025;
      });
    }
    if (iceGroupRef.current) {
      iceGroupRef.current.rotation.y = Math.sin(t * 0.8) * 0.25;
      iceGroupRef.current.children.forEach((iMesh, idx) => {
        iMesh.position.y = iMesh.userData.baseY + Math.sin(t * 2.2 + idx) * 0.032;
      });
    }
    if (heartsRef.current) {
      heartsRef.current.rotation.y = t * 1.8;
      heartsRef.current.position.y = 0.2 + Math.sin(t * 3) * 0.08;
    }
  });

  const pearls = useMemo(() => {
    const hasBlack = cup?.toppings?.includes('pearl') || cup?.pearl200;
    const hasGold = cup?.toppings?.includes('golden_boba');
    if (!hasBlack && !hasGold) return [];

    const count = cup?.pearl200 ? 48 : (hasBlack ? 16 : 0) + (hasGold ? 14 : 0);
    const arr = [];
    for (let i = 0; i < count; i++) {
      const layer = Math.floor(i / 12);
      const angle = (i * 2.39996) % (Math.PI * 2);
      const maxR = 0.31 + layer * 0.025;
      const r = (0.15 + (((i * 7) % 10) / 10) * 0.8) * maxR;
      const y = -0.6 + layer * 0.115 + (i % 3) * 0.015;
      const isGold = hasGold && (!hasBlack || i % 2 === 1) && !cup?.pearl200;
      arr.push({
        pos: [Math.cos(angle) * r, Math.min(0.42, y), Math.sin(angle) * r],
        baseY: Math.min(0.42, y),
        isGold,
      });
    }
    return arr;
  }, [cup?.toppings, cup?.pearl200]);

  const iceCubes = useMemo(() => {
    if (!cup?.ice || cup.ice === 0) return [];
    const count = cup.ice === 50 ? 4 : 7;
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 + 0.4;
      const r = 0.2 + (i % 2) * 0.11;
      const baseY = 0.24 + (i % 3) * 0.1;
      return {
        pos: [Math.cos(angle) * r, baseY, Math.sin(angle) * r],
        baseY,
        rot: [i * 0.5, i * 0.8, i * 0.3],
      };
    });
  }, [cup?.ice]);

  const jellies = useMemo(() => {
    if (!cup?.toppings?.includes('jelly')) return [];
    return Array.from({ length: 10 }, (_, i) => {
      const angle = (i / 10) * Math.PI * 2;
      return [Math.cos(angle) * 0.26, -0.34 + (i % 2) * 0.09, Math.sin(angle) * 0.26];
    });
  }, [cup?.toppings]);

  const hasPudding = cup?.toppings?.includes('pudding') || cup?.pudding5;
  const puddingLayers = cup?.pudding5 ? 5 : hasPudding ? 1 : 0;
  const hasCheeseFoam = cup?.toppings?.includes('cheese_foam');

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Translucent Tea + Creamy Milk Blend Liquid */}
      {liquidColor && (
        <group position={[0, -0.7, 0]} ref={liquidRef} scale={[1, 0.1, 1]}>
          <mesh position={[0, 0.65, 0]}>
            <cylinderGeometry args={[0.55, 0.4, 1.3, 30]} />
            <meshStandardMaterial
              color={liquidColor}
              roughness={0.22}
              metalness={0.02}
              transparent
              opacity={cup.milk > 0 ? 0.9 : 0.76}
            />
          </mesh>
          {/* Creamy Milk Foam Ring on Top of Liquid */}
          {cup.milk > 0 && (
            <mesh position={[0, 1.31, 0]}>
              <cylinderGeometry args={[0.555, 0.55, 0.05, 28]} />
              <meshStandardMaterial color="#fffbeb" roughness={0.38} />
            </mesh>
          )}
        </group>
      )}

      {/* Realistic Caramelized Brown-Sugar Tiger Stripes Inside Cup! */}
      {teaObj?.hasTigerStripes && tigerTex && (
        <mesh position={[0, -0.02, 0]}>
          <cylinderGeometry args={[0.59, 0.425, 1.38, 28, 1, true]} />
          <meshStandardMaterial
            map={tigerTex}
            transparent
            opacity={0.85}
            roughness={0.2}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Animated Liquid Pouring Stream + Splash Ring */}
      {isPouring && liquidColor && (
        <group>
          <mesh position={[0, 1.18, 0]}>
            <cylinderGeometry args={[0.05, 0.085, 1.38, 14]} />
            <meshStandardMaterial
              color={cup?.milk > 0 ? '#fffbeb' : teaPureColor || liquidColor}
              roughness={0.18}
            />
          </mesh>
          <mesh position={[0, 0.56, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.08, 0.28, 20]} />
            <meshBasicMaterial color="#fffbeb" transparent opacity={0.75} />
          </mesh>
        </group>
      )}

      {/* Bouncy Drop Container for Toppings & Ice */}
      <group ref={dropGroupRef}>
        {puddingLayers > 0 &&
          Array.from({ length: puddingLayers }, (_, idx) => (
            <mesh key={`pud_${idx}`} position={[0, -0.52 + idx * 0.155, 0]}>
              <cylinderGeometry args={[0.42 + idx * 0.02, 0.4 + idx * 0.02, 0.115, 24]} />
              <meshStandardMaterial
                color={idx % 2 === 0 ? '#fde047' : '#facc15'}
                roughness={0.26}
              />
            </mesh>
          ))}

        <group ref={pearlsGroupRef}>
          {pearls.map((p, idx) => (
            <mesh
              key={`p_${idx}`}
              geometry={PEARL_GEO}
              material={p.isGold ? GOLD_PEARL_MAT : BLACK_PEARL_MAT}
              position={p.pos}
              userData={{ baseY: p.baseY }}
            />
          ))}
        </group>

        {jellies.map((pos, idx) => (
          <mesh
            key={`j_${idx}`}
            geometry={JELLY_GEO}
            material={JELLY_MAT}
            position={pos}
            rotation={[0.2 * idx, 0.4 * idx, 0]}
          />
        ))}

        <group ref={iceGroupRef}>
          {iceCubes.map((ice, idx) => (
            <mesh
              key={`i_${idx}`}
              geometry={ICE_GEO}
              material={ICE_MAT}
              position={ice.pos}
              rotation={ice.rot}
              userData={{ baseY: ice.baseY }}
            />
          ))}
        </group>
      </group>

      {/* Salted Cheese Foam Dome + Fresh Strawberry Garnish */}
      {hasCheeseFoam && (
        <mesh position={[0, 0.64, 0]}>
          <cylinderGeometry args={[0.57, 0.54, 0.19, 28]} />
          <meshStandardMaterial color="#fffbeb" roughness={0.42} />
        </mesh>
      )}

      {teaObj?.hasBerryGarnish && (
        <group position={[-0.2, 0.72, 0.16]} rotation={[0.2, 0.4, 0.3]}>
          <mesh>
            <coneGeometry args={[0.12, 0.2, 14]} />
            <meshStandardMaterial color="#e11d48" roughness={0.3} />
          </mesh>
          <mesh position={[0, -0.09, 0]}>
            <cylinderGeometry args={[0.09, 0.04, 0.04, 8]} />
            <meshStandardMaterial color="#22c55e" roughness={0.5} />
          </mesh>
        </group>
      )}

      {/* Love Spice Floating Orbs */}
      {cup?.loveSpice && (
        <group ref={heartsRef}>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const a = (i / 6) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.cos(a) * 0.68, (i % 3) * 0.25 - 0.1, Math.sin(a) * 0.68]}>
                <sphereGeometry args={[0.055, 8, 8]} />
                <meshBasicMaterial color="#f472b6" />
              </mesh>
            );
          })}
        </group>
      )}

      {/* Clear Glossy Boba Cup Shell */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.62, 0.44, 1.54, 30, 1, true]} />
        <meshStandardMaterial
          color="#f0f9ff"
          transparent
          opacity={0.22}
          roughness={0.07}
          metalness={0.1}
          depthWrite={false}
        />
      </mesh>

      {/* Kawaii Boba Bear Sticker on Front & Back of Cup! */}
      {stickerTex && (
        <>
          <mesh position={[0, 0.04, 0.545]} rotation={[-0.11, 0, 0]}>
            <circleGeometry args={[0.25, 28]} />
            <meshStandardMaterial map={stickerTex} transparent roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.04, -0.545]} rotation={[0.11, Math.PI, 0]}>
            <circleGeometry args={[0.25, 28]} />
            <meshStandardMaterial map={stickerTex} transparent roughness={0.35} />
          </mesh>
        </>
      )}

      {/* Cup Base & Rolled Rim */}
      <mesh position={[0, -0.76, 0]}>
        <cylinderGeometry args={[0.44, 0.43, 0.06, 28]} />
        <meshStandardMaterial color="#e2e8f0" transparent opacity={0.55} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.77, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.62, 0.032, 12, 32]} />
        <meshStandardMaterial color="#ffffff" roughness={0.25} />
      </mesh>

      {/* Cute Sealed Pastel Lid + Wide Boba Straw */}
      {cup?.isSealed && (
        <group>
          <mesh position={[0, 0.78, 0]}>
            <cylinderGeometry args={[0.625, 0.625, 0.03, 28]} />
            <meshStandardMaterial color="#fbcfe8" transparent opacity={0.88} roughness={0.22} />
          </mesh>
          <mesh position={[0.08, 1.08, 0]} rotation={[0, 0, -0.14]}>
            <cylinderGeometry args={[0.072, 0.072, 1.44, 18]} />
            <meshStandardMaterial color="#fb7185" roughness={0.22} />
          </mesh>
        </group>
      )}
    </group>
  );
}
