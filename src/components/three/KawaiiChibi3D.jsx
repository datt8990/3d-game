import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Preset palettes & accessories for ultra-cute Kawaii Chibi 3D characters (Pop Mart / Sanrio / Animal Crossing vibe!)
export const CHIBI_PRESETS = {
  // Player Owner Outfits
  female_a: {
    skin: '#ffe6dc',
    hair: '#6f453b',
    hairStyle: 'twin_buns',
    eyeColor: '#ec4899',
    outfit: '#ff8fab',
    apron: '#fff5f8',
    hat: 'ribbon',
    accent: '#fb6f92',
  },
  male_a: {
    skin: '#ffe6dc',
    hair: '#4a3531',
    hairStyle: 'fluffy_short',
    eyeColor: '#38bdf8',
    outfit: '#90e0ef',
    apron: '#fffdf9',
    hat: 'beret_cream',
    accent: '#00b4d8',
  },
  employee: {
    skin: '#ffe8df',
    hair: '#8d5b4c',
    hairStyle: 'bob',
    eyeColor: '#34d399',
    outfit: '#a7f3d0',
    apron: '#ffffff',
    hat: 'maid_lace',
    accent: '#10b981',
  },
  female_b: {
    skin: '#ffe6dc',
    hair: '#f4a2b8',
    hairStyle: 'long_princess',
    eyeColor: '#c084fc',
    outfit: '#fbcfe8',
    apron: '#fff0f6',
    hat: 'cat_ears',
    accent: '#ec4899',
  },
  male_d: {
    skin: '#ffe6dc',
    hair: '#d4a373',
    hairStyle: 'twin_buns',
    eyeColor: '#a855f7',
    outfit: '#e9d5ff',
    apron: '#ffffff',
    hat: 'bunny_ears',
    accent: '#c084fc',
  },

  // Customer Archetypes
  student: {
    skin: '#ffe6dc',
    hair: '#3d2b2e',
    hairStyle: 'twintails',
    eyeColor: '#f472b6',
    outfit: '#bae6fd',
    apron: null,
    hat: 'ribbon',
    accent: '#fb7185',
  },
  office: {
    skin: '#ffe6dc',
    hair: '#7f5539',
    hairStyle: 'ponytail',
    eyeColor: '#60a5fa',
    outfit: '#fed7aa',
    apron: null,
    hat: 'glasses',
    accent: '#fb923c',
  },
  tycoon: {
    skin: '#ffe8df',
    hair: '#f3c677',
    hairStyle: 'long_princess',
    eyeColor: '#f59e0b',
    outfit: '#fda4af',
    apron: null,
    hat: 'tiara',
    accent: '#facc15',
  },
  reviewer: {
    skin: '#ffe6dc',
    hair: '#c4b5fd',
    hairStyle: 'bob',
    eyeColor: '#38bdf8',
    outfit: '#f5d0fe',
    apron: null,
    hat: 'cat_headphones',
    accent: '#ec4899',
  },
  troll: {
    skin: '#ffe6dc',
    hair: '#5c4033',
    hairStyle: 'bob',
    eyeColor: '#4ade80',
    outfit: '#fde68a',
    apron: null,
    hat: 'frog_hood',
    accent: '#4ade80',
  },
  idol: {
    skin: '#fff0eb',
    hair: '#ffafcc',
    hairStyle: 'twintails',
    eyeColor: '#f472b6',
    outfit: '#fbcfe8',
    apron: '#fff5f9',
    hat: 'star_tiara',
    accent: '#fde047',
  },
  staff: {
    skin: '#ffe6dc',
    hair: '#7f5539',
    hairStyle: 'twin_buns',
    eyeColor: '#f472b6',
    outfit: '#ffc2d1',
    apron: '#ffffff',
    hat: 'beret_pink',
    accent: '#fb6f92',
  },
  alien: {
    skin: '#bbf7d0',
    hair: '#4ade80',
    hairStyle: 'twin_buns',
    eyeColor: '#38bdf8',
    outfit: '#a7f3d0',
    apron: null,
    hat: 'alien_helmet',
    accent: '#4ade80',
  },
};

// Map legacy file paths or preset IDs cleanly to our Kawaii Chibi presets
export function resolveChibiPreset(pathOrKey) {
  if (!pathOrKey) return CHIBI_PRESETS.female_a;
  if (CHIBI_PRESETS[pathOrKey]) return CHIBI_PRESETS[pathOrKey];
  const s = String(pathOrKey);
  if (s.includes('employee') || s.includes('worker')) return CHIBI_PRESETS.staff;
  if (s.includes('spacesuit')) return CHIBI_PRESETS.alien;
  // Check 'female-' BEFORE 'male-' since 'female-d' contains 'male-d'!
  if (s.includes('female-a') || s.includes('women_casual')) return CHIBI_PRESETS.student;
  if (s.includes('female-b')) return CHIBI_PRESETS.female_b;
  if (s.includes('female-c') || s.includes('punk')) return CHIBI_PRESETS.reviewer;
  if (s.includes('female-d') || s.includes('formal')) return CHIBI_PRESETS.idol;
  if (s.includes('male-b') || s.includes('men_suit')) return CHIBI_PRESETS.office;
  if (s.includes('male-c') || s.includes('beach')) return CHIBI_PRESETS.troll;
  if (s.includes('male-d') || s.includes('king')) return CHIBI_PRESETS.tycoon;
  if (s.includes('male-a')) return CHIBI_PRESETS.male_a;
  return CHIBI_PRESETS.female_a;
}

// Shared smooth geometries for 60fps mobile & desktop rendering
const HEAD_GEO = new THREE.SphereGeometry(0.31, 28, 24);
const HAIR_CAP_GEO = new THREE.SphereGeometry(0.328, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.58);
const BUN_GEO = new THREE.SphereGeometry(0.135, 18, 18);
const HAND_GEO = new THREE.SphereGeometry(0.068, 14, 14);
const SHOE_GEO = new THREE.CapsuleGeometry(0.068, 0.06, 10, 14);

export default function KawaiiChibi3D({
  presetKey,
  path,
  anim = 'idle', // 'idle' | 'walk' | 'run' | 'wave' | 'serve' | 'sit' | 'angry'
  scale = 1.0,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  onClick,
  children,
}) {
  const cfg = useMemo(() => resolveChibiPreset(presetKey || path), [presetKey, path]);

  const rootRef = useRef();
  const bodyBounceRef = useRef();
  const headGroupRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const eyesRef = useRef();

  // Unique animation phase per character instance so crowds don't move robotically in sync
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() + phase;

    // Cute periodic eye blink every ~3.4s!
    if (eyesRef.current) {
      const blinkCycle = t % 3.4;
      const isBlinking = blinkCycle > 3.26 && blinkCycle < 3.38;
      eyesRef.current.scale.y = isBlinking ? 0.12 : 1.0;
    }

    if (!bodyBounceRef.current || !headGroupRef.current) return;

    if (anim === 'sit') {
      bodyBounceRef.current.position.y = -0.14;
      headGroupRef.current.rotation.z = Math.sin(t * 1.8) * 0.06;
      headGroupRef.current.rotation.y = Math.sin(t * 1.1) * 0.12;
      if (leftLegRef.current) leftLegRef.current.rotation.x = -Math.PI / 2.2;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.PI / 2.2;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -0.35;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -0.35;
      return;
    }

    if (anim === 'walk' || anim === 'run') {
      const spd = anim === 'run' ? 10.5 : 6.5;
      const amp = anim === 'run' ? 0.55 : 0.38;
      bodyBounceRef.current.position.y = Math.abs(Math.sin(t * spd)) * 0.055;
      headGroupRef.current.rotation.z = Math.sin(t * spd * 0.5) * 0.06;
      if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(t * spd) * amp;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.sin(t * spd) * amp;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -Math.sin(t * spd) * amp * 0.85;
      if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(t * spd) * amp * 0.85;
      return;
    }

    if (anim === 'wave') {
      bodyBounceRef.current.position.y = Math.abs(Math.sin(t * 5)) * 0.05;
      headGroupRef.current.rotation.z = 0.12 + Math.sin(t * 4) * 0.06;
      if (rightArmRef.current) {
        rightArmRef.current.rotation.z = -2.35 + Math.sin(t * 10) * 0.32;
        rightArmRef.current.rotation.x = -0.2;
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.z = 0.25;
        leftArmRef.current.rotation.x = 0;
      }
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
      return;
    }

    if (anim === 'serve') {
      bodyBounceRef.current.position.y = Math.sin(t * 3.5) * 0.025;
      headGroupRef.current.rotation.x = 0.08 + Math.sin(t * 2.5) * 0.04;
      headGroupRef.current.rotation.z = Math.sin(t * 2.0) * 0.05;
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -0.65 + Math.sin(t * 6) * 0.18;
        leftArmRef.current.rotation.z = 0.18;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -0.65 - Math.sin(t * 6) * 0.18;
        rightArmRef.current.rotation.z = -0.18;
      }
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
      return;
    }

    if (anim === 'angry') {
      bodyBounceRef.current.position.y = Math.abs(Math.sin(t * 12)) * 0.08;
      headGroupRef.current.rotation.z = Math.sin(t * 14) * 0.1;
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -1.4 + Math.sin(t * 12) * 0.5;
        rightArmRef.current.rotation.z = -0.2;
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -0.8;
        leftArmRef.current.rotation.z = 0.3;
      }
      return;
    }

    // Default cute breathing & head-bob 'idle'
    bodyBounceRef.current.position.y = Math.sin(t * 2.6) * 0.022;
    headGroupRef.current.rotation.z = Math.sin(t * 1.6) * 0.055;
    headGroupRef.current.rotation.y = Math.sin(t * 0.9) * 0.09;
    headGroupRef.current.rotation.x = 0;
    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = Math.sin(t * 2.0) * 0.08;
      leftArmRef.current.rotation.z = 0.26;
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = -Math.sin(t * 2.0) * 0.08;
      rightArmRef.current.rotation.z = -0.26;
    }
    if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
    if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
  });

  // Total character height ~ 1.48m at scale = 1.0
  return (
    <group ref={rootRef} position={position} rotation={rotation} scale={scale} onClick={onClick}>
      <group ref={bodyBounceRef}>
        {/* --- LEGS & CUTE ROUNDED MARY-JANE SHOES --- */}
        <group ref={leftLegRef} position={[-0.11, 0.34, 0]}>
          <mesh position={[0, -0.14, 0]} castShadow>
            <capsuleGeometry args={[0.062, 0.16, 10, 14]} />
            <meshStandardMaterial color={cfg.skin} roughness={0.55} />
          </mesh>
          {/* White Ankle Sock */}
          <mesh position={[0, -0.23, 0]}>
            <cylinderGeometry args={[0.066, 0.064, 0.08, 14]} />
            <meshStandardMaterial color="#ffffff" roughness={0.5} />
          </mesh>
          {/* Cute Rounded Shoe */}
          <mesh geometry={SHOE_GEO} position={[0, -0.29, 0.03]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <meshStandardMaterial color={cfg.accent} roughness={0.35} />
          </mesh>
        </group>

        <group ref={rightLegRef} position={[0.11, 0.34, 0]}>
          <mesh position={[0, -0.14, 0]} castShadow>
            <capsuleGeometry args={[0.062, 0.16, 10, 14]} />
            <meshStandardMaterial color={cfg.skin} roughness={0.55} />
          </mesh>
          <mesh position={[0, -0.23, 0]}>
            <cylinderGeometry args={[0.066, 0.064, 0.08, 14]} />
            <meshStandardMaterial color="#ffffff" roughness={0.5} />
          </mesh>
          <mesh geometry={SHOE_GEO} position={[0, -0.29, 0.03]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <meshStandardMaterial color={cfg.accent} roughness={0.35} />
          </mesh>
        </group>

        {/* --- CHIBI FLARED DRESS / PASTEL TUNIC TORSO --- */}
        <group position={[0, 0.58, 0]}>
          {/* Flared Cute Dress/Top */}
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.16, 0.27, 0.48, 24]} />
            <meshStandardMaterial color={cfg.outfit} roughness={0.48} />
          </mesh>
          {/* Cute White Peter-Pan Collar */}
          <mesh position={[0, 0.22, 0.02]} rotation={[0.15, 0, 0]}>
            <torusGeometry args={[0.145, 0.032, 10, 22]} />
            <meshStandardMaterial color="#ffffff" roughness={0.4} />
          </mesh>
          {/* Cute Bow Ribbon on Chest */}
          <group position={[0, 0.16, 0.175]}>
            <mesh position={[-0.04, 0, 0]} rotation={[0, 0, 0.3]}>
              <sphereGeometry args={[0.038, 10, 10]} />
              <meshStandardMaterial color={cfg.accent} roughness={0.35} />
            </mesh>
            <mesh position={[0.04, 0, 0]} rotation={[0, 0, -0.3]}>
              <sphereGeometry args={[0.038, 10, 10]} />
              <meshStandardMaterial color={cfg.accent} roughness={0.35} />
            </mesh>
          </group>

          {/* Ruffled White Cafe Apron (for Owner, Staff & Idol!) */}
          {cfg.apron && (
            <group>
              <mesh position={[0, -0.04, 0.19]} rotation={[-0.18, 0, 0]}>
                <boxGeometry args={[0.24, 0.34, 0.03]} />
                <meshStandardMaterial color={cfg.apron} roughness={0.45} />
              </mesh>
              {/* Pink Heart Pocket on Apron */}
              <mesh position={[0, -0.05, 0.212]}>
                <circleGeometry args={[0.055, 16]} />
                <meshStandardMaterial color="#ff8fab" roughness={0.4} />
              </mesh>
            </group>
          )}
        </group>

        {/* --- CUTE CHUBBY ARMS & PUFF SLEEVES --- */}
        <group ref={leftArmRef} position={[-0.2, 0.76, 0]} rotation={[0, 0, 0.26]}>
          {/* Puff Sleeve */}
          <mesh position={[0, -0.03, 0]}>
            <sphereGeometry args={[0.082, 14, 14]} />
            <meshStandardMaterial color={cfg.outfit} roughness={0.48} />
          </mesh>
          <mesh position={[0, -0.15, 0]} castShadow>
            <capsuleGeometry args={[0.048, 0.16, 10, 12]} />
            <meshStandardMaterial color={cfg.skin} roughness={0.55} />
          </mesh>
          <mesh geometry={HAND_GEO} position={[0, -0.26, 0]}>
            <meshStandardMaterial color={cfg.skin} roughness={0.55} />
          </mesh>
        </group>

        <group ref={rightArmRef} position={[0.2, 0.76, 0]} rotation={[0, 0, -0.26]}>
          <mesh position={[0, -0.03, 0]}>
            <sphereGeometry args={[0.082, 14, 14]} />
            <meshStandardMaterial color={cfg.outfit} roughness={0.48} />
          </mesh>
          <mesh position={[0, -0.15, 0]} castShadow>
            <capsuleGeometry args={[0.048, 0.16, 10, 12]} />
            <meshStandardMaterial color={cfg.skin} roughness={0.55} />
          </mesh>
          <mesh geometry={HAND_GEO} position={[0, -0.26, 0]}>
            <meshStandardMaterial color={cfg.skin} roughness={0.55} />
          </mesh>
        </group>

        {/* --- ADORABLE KAWAII CHIBI HEAD, SPARKLY EYES, ROSY BLUSH & HAIRSTYLES! --- */}
        <group ref={headGroupRef} position={[0, 1.12, 0]}>
          {/* Smooth Chubby Baby-Cheeks Head */}
          <mesh geometry={HEAD_GEO} scale={[1.08, 0.96, 1.0]} castShadow receiveShadow>
            <meshStandardMaterial color={cfg.skin} roughness={0.52} />
          </mesh>

          {/* Cute Rounded Ears */}
          <mesh position={[-0.32, -0.02, 0]}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshStandardMaterial color={cfg.skin} roughness={0.52} />
          </mesh>
          <mesh position={[0.32, -0.02, 0]}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshStandardMaterial color={cfg.skin} roughness={0.52} />
          </mesh>

          {/* Rosy Pink Kawaii Blush Cheeks 🌸 */}
          <mesh position={[-0.165, -0.065, 0.27]} rotation={[0, -0.35, 0]} scale={[1.35, 0.85, 0.3]}>
            <sphereGeometry args={[0.048, 12, 12]} />
            <meshBasicMaterial color="#ff758f" transparent opacity={0.68} />
          </mesh>
          <mesh position={[0.165, -0.065, 0.27]} rotation={[0, 0.35, 0]} scale={[1.35, 0.85, 0.3]}>
            <sphereGeometry args={[0.048, 12, 12]} />
            <meshBasicMaterial color="#ff758f" transparent opacity={0.68} />
          </mesh>

          {/* Big Sparkling Anime/Pop-Mart Eyes (Blinks Automatically!) */}
          <group ref={eyesRef} position={[0, -0.01, 0]}>
            {[-1, 1].map((side) => (
              <group
                key={side}
                position={[side * 0.115, 0.0, 0.285]}
                rotation={[0, side * 0.22, 0]}
              >
                {/* Dark Espresso Outer Eye */}
                <mesh scale={[0.88, 1.12, 0.35]}>
                  <sphereGeometry args={[0.058, 16, 16]} />
                  <meshStandardMaterial color="#2b1321" roughness={0.12} />
                </mesh>
                {/* Colored Lower Iris Jewel */}
                <mesh position={[0, -0.016, 0.014]} scale={[0.72, 0.65, 0.25]}>
                  <sphereGeometry args={[0.048, 14, 14]} />
                  <meshBasicMaterial color={cfg.eyeColor} />
                </mesh>
                {/* Big Top-Left White Starlight Catchlight ✨ */}
                <mesh position={[-0.016, 0.022, 0.021]}>
                  <sphereGeometry args={[0.016, 10, 10]} />
                  <meshBasicMaterial color="#ffffff" />
                </mesh>
                {/* Tiny Bottom-Right Secondary Sparkle */}
                <mesh position={[0.016, -0.02, 0.021]}>
                  <sphereGeometry args={[0.008, 8, 8]} />
                  <meshBasicMaterial color="#ffffff" />
                </mesh>
                {/* Cute Curved Upper Eyelash */}
                <mesh position={[0, 0.058, 0.01]} rotation={[0, 0, side * -0.14]}>
                  <boxGeometry args={[0.095, 0.016, 0.016]} />
                  <meshBasicMaterial color="#2b1321" />
                </mesh>
              </group>
            ))}
          </group>

          {/* Sweet Happy Kawaii Smile ∪ (flips to pout ∩ when angry!) */}
          <mesh
            position={[0, -0.095, 0.298]}
            rotation={[0, 0, anim === 'angry' ? 0 : Math.PI]}
          >
            <torusGeometry args={[0.032, 0.0085, 8, 16, Math.PI]} />
            <meshBasicMaterial color="#e11d48" />
          </mesh>

          {/* --- LUSH 3D KAWAII HAIRSTYLES --- */}
          {/* Top Hair Cap */}
          <mesh geometry={HAIR_CAP_GEO} scale={[1.09, 1.0, 1.04]} rotation={[-0.14, 0, 0]} castShadow>
            <meshStandardMaterial color={cfg.hair} roughness={0.48} />
          </mesh>
          {/* Cute Front Bangs (3 Fluffy Fringes Across Forehead) */}
          {[-0.11, 0, 0.11].map((bx, i) => (
            <mesh
              key={i}
              position={[bx, 0.13, 0.275 - Math.abs(bx) * 0.18]}
              rotation={[0.25, 0, bx * -0.6]}
              scale={[0.85, 1.25, 0.55]}
            >
              <sphereGeometry args={[0.085, 14, 14]} />
              <meshStandardMaterial color={cfg.hair} roughness={0.48} />
            </mesh>
          ))}
          {/* Side Hair Locks Framing Cheeks */}
          {[-1, 1].map((side) => (
            <mesh
              key={`lock_${side}`}
              position={[side * 0.29, -0.04, 0.12]}
              rotation={[0.1, 0, side * 0.15]}
            >
              <capsuleGeometry args={[0.052, 0.18, 10, 12]} />
              <meshStandardMaterial color={cfg.hair} roughness={0.48} />
            </mesh>
          ))}

          {/* Style: Twin Buns (Tóc búi củ tỏi đôi + Nơ ruy băng!) */}
          {cfg.hairStyle === 'twin_buns' &&
            [-1, 1].map((side) => (
              <group key={side} position={[side * 0.26, 0.24, -0.04]}>
                <mesh geometry={BUN_GEO} castShadow>
                  <meshStandardMaterial color={cfg.hair} roughness={0.48} />
                </mesh>
                <mesh position={[0, -0.08, 0.08]}>
                  <torusGeometry args={[0.075, 0.022, 8, 16]} />
                  <meshStandardMaterial color={cfg.accent} roughness={0.35} />
                </mesh>
              </group>
            ))}

          {/* Style: Twin-Tails (Tóc buộc 2 bên bồng bềnh!) */}
          {cfg.hairStyle === 'twintails' &&
            [-1, 1].map((side) => (
              <group key={side} position={[side * 0.31, 0.08, -0.05]} rotation={[0, 0, side * -0.35]}>
                <mesh position={[0, -0.14, 0]} castShadow>
                  <capsuleGeometry args={[0.085, 0.26, 12, 16]} />
                  <meshStandardMaterial color={cfg.hair} roughness={0.48} />
                </mesh>
                <mesh position={[0, 0.04, 0.04]}>
                  <sphereGeometry args={[0.055, 10, 10]} />
                  <meshStandardMaterial color={cfg.accent} roughness={0.3} />
                </mesh>
              </group>
            ))}

          {/* Style: High Ponytail */}
          {cfg.hairStyle === 'ponytail' && (
            <mesh position={[0, 0.16, -0.32]} rotation={[-0.55, 0, 0]} castShadow>
              <capsuleGeometry args={[0.095, 0.24, 12, 16]} />
              <meshStandardMaterial color={cfg.hair} roughness={0.48} />
            </mesh>
          )}

          {/* Style: Long Flowing Princess Hair */}
          {cfg.hairStyle === 'long_princess' && (
            <mesh position={[0, -0.14, -0.18]} scale={[1.15, 1.0, 0.65]} castShadow>
              <capsuleGeometry args={[0.24, 0.32, 14, 18]} />
              <meshStandardMaterial color={cfg.hair} roughness={0.48} />
            </mesh>
          )}

          {/* Style: Cute Rounded Bob Back */}
          {cfg.hairStyle === 'bob' && (
            <mesh position={[0, -0.02, -0.06]} scale={[1.12, 0.95, 1.05]}>
              <sphereGeometry args={[0.31, 20, 18]} />
              <meshStandardMaterial color={cfg.hair} roughness={0.48} />
            </mesh>
          )}

          {/* --- CUTE PRESET HEADWEAR --- */}
          {(cfg.hat === 'beret_pink' || cfg.hat === 'beret_cream') && (
            <mesh position={[0.06, 0.29, 0.02]} rotation={[0.1, 0, -0.18]} scale={[1.15, 0.45, 1.15]}>
              <sphereGeometry args={[0.24, 20, 16]} />
              <meshStandardMaterial
                color={cfg.hat === 'beret_pink' ? '#ff8fab' : '#fef3c7'}
                roughness={0.45}
              />
            </mesh>
          )}

          {cfg.hat === 'maid_lace' && (
            <mesh position={[0, 0.26, 0.08]} rotation={[-0.3, 0, 0]}>
              <torusGeometry args={[0.24, 0.038, 10, 24, Math.PI]} />
              <meshStandardMaterial color="#ffffff" roughness={0.35} />
            </mesh>
          )}

          {cfg.hat === 'cat_ears' &&
            [-1, 1].map((s) => (
              <mesh key={s} position={[s * 0.19, 0.33, 0.04]} rotation={[0, 0, s * -0.35]}>
                <coneGeometry args={[0.085, 0.16, 12]} />
                <meshStandardMaterial color="#ff8fab" roughness={0.4} />
              </mesh>
            ))}

          {cfg.hat === 'bunny_ears' &&
            [-1, 1].map((s) => (
              <mesh key={s} position={[s * 0.13, 0.44, 0.02]} rotation={[0.1, 0, s * -0.15]}>
                <capsuleGeometry args={[0.052, 0.22, 10, 14]} />
                <meshStandardMaterial color="#fbcfe8" roughness={0.4} />
              </mesh>
            ))}

          {cfg.hat === 'cat_headphones' && (
            <group>
              <mesh position={[0, 0.06, 0]} rotation={[0, 0, 0]}>
                <torusGeometry args={[0.335, 0.024, 10, 28, Math.PI]} />
                <meshStandardMaterial color="#f472b6" roughness={0.3} />
              </mesh>
              {[-1, 1].map((s) => (
                <mesh key={s} position={[s * 0.34, 0.0, 0.02]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.075, 0.075, 0.05, 16]} />
                  <meshStandardMaterial color="#fbcfe8" roughness={0.3} />
                </mesh>
              ))}
            </group>
          )}

          {(cfg.hat === 'tiara' || cfg.hat === 'star_tiara') && (
            <mesh position={[0, 0.31, 0.1]}>
              <cylinderGeometry args={[0.14, 0.11, 0.11, 7]} />
              <meshStandardMaterial color="#facc15" metalness={0.65} roughness={0.2} />
            </mesh>
          )}

          {cfg.hat === 'glasses' &&
            [-1, 1].map((s) => (
              <mesh key={s} position={[s * 0.115, 0.0, 0.31]}>
                <torusGeometry args={[0.068, 0.008, 8, 20]} />
                <meshStandardMaterial color="#d97706" metalness={0.6} roughness={0.25} />
              </mesh>
            ))}

          {cfg.hat === 'frog_hood' && (
            <group position={[0, 0.28, 0.1]}>
              <mesh position={[-0.12, 0.04, 0]}>
                <sphereGeometry args={[0.065, 14, 14]} />
                <meshStandardMaterial color="#4ade80" roughness={0.4} />
              </mesh>
              <mesh position={[-0.12, 0.05, 0.055]}>
                <sphereGeometry args={[0.025, 10, 10]} />
                <meshBasicMaterial color="#0f172a" />
              </mesh>
              <mesh position={[0.12, 0.04, 0]}>
                <sphereGeometry args={[0.065, 14, 14]} />
                <meshStandardMaterial color="#4ade80" roughness={0.4} />
              </mesh>
              <mesh position={[0.12, 0.05, 0.055]}>
                <sphereGeometry args={[0.025, 10, 10]} />
                <meshBasicMaterial color="#0f172a" />
              </mesh>
            </group>
          )}

          {cfg.hat === 'alien_helmet' && (
            <mesh position={[0, 0.02, 0]}>
              <sphereGeometry args={[0.42, 22, 22]} />
              <meshStandardMaterial color="#bae6fd" transparent opacity={0.3} roughness={0.1} depthWrite={false} />
            </mesh>
          )}
        </group>

        {children}
      </group>
    </group>
  );
}
