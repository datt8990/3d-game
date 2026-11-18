import React, { Suspense, lazy, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import gsap from 'gsap';
import { useGameStore } from '../../store/useGameStore';
import { CHARACTER_OUTFITS, TEA_BASES, TOPPINGS } from '../../data/gameData';
import ModelGLB from './ModelGLB';
import BobaCup3D from './BobaCup3D';
import AlienUFO3D from './AlienUFO3D';
import Banner3D from './Banner3D';
import AnimatedCharacter3D, { AnimatedAnimal3D } from './AnimatedCharacter3D';
import FloatingCoins3D from './FloatingCoins3D';

const RapierBobaPhysics = lazy(() => import('./RapierBobaPhysics'));

export function PlayerAccessories3D({ hatId, petId }) {
  const petMap = {
    mini_boba: { path: '/models/quaternius/pet_shiba.glb', scale: 0.2 },
    golden_pearl: { path: '/models/quaternius/pet_alpaca.glb', scale: 0.2 },
    mini_ufo: { path: '/models/quaternius/pet_fox.glb', scale: 0.18 },
  };
  const chosenPet = petMap[petId];

  return (
    <group>
      {/* Proportioned Hats for 1.50m Chibi Character Head */}
      {hatId === 'chef' && (
        <group position={[0, 1.52, 0]}>
          <mesh>
            <cylinderGeometry args={[0.16, 0.14, 0.13, 18]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.12, 0]}>
            <sphereGeometry args={[0.19, 18, 18]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.55} />
          </mesh>
        </group>
      )}
      {hatId === 'boba_crown' && (
        <mesh position={[0, 1.53, 0]}>
          <cylinderGeometry args={[0.17, 0.13, 0.14, 8]} />
          <meshStandardMaterial color="#facc15" roughness={0.22} metalness={0.65} />
        </mesh>
      )}
      {hatId === 'alien_antenna' && (
        <group position={[0, 1.54, 0]}>
          <mesh position={[-0.08, 0.09, 0]} rotation={[0, 0, 0.25]}>
            <cylinderGeometry args={[0.014, 0.014, 0.2, 8]} />
            <meshStandardMaterial color="#22c55e" roughness={0.4} />
          </mesh>
          <mesh position={[-0.12, 0.2, 0]}>
            <sphereGeometry args={[0.042, 12, 12]} />
            <meshBasicMaterial color="#4ade80" />
          </mesh>
          <mesh position={[0.08, 0.09, 0]} rotation={[0, 0, -0.25]}>
            <cylinderGeometry args={[0.014, 0.014, 0.2, 8]} />
            <meshStandardMaterial color="#22c55e" roughness={0.4} />
          </mesh>
          <mesh position={[0.12, 0.2, 0]}>
            <sphereGeometry args={[0.042, 12, 12]} />
            <meshBasicMaterial color="#4ade80" />
          </mesh>
        </group>
      )}
      {hatId === 'halo' && (
        <mesh position={[0, 1.62, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.2, 0.024, 12, 24]} />
          <meshBasicMaterial color="#fde047" />
        </mesh>
      )}

      {chosenPet && (
        <AnimatedAnimal3D
          path={chosenPet.path}
          anim="Idle"
          scale={chosenPet.scale}
          position={[0.68, 0, 0.15]}
        />
      )}
    </group>
  );
}

// Cute Apron Cafe Staff (Uses character-employee.glb with native unbroken animations!)
function WalkingCafeStaff({ basePos, idx }) {
  const ref = useRef();
  const isBehindCounter = idx % 2 === 0;

  useFrame((state) => {
    if (!ref.current || isBehindCounter) return;
    const t = state.clock.getElapsedTime();
    const offset = Math.sin(t * 0.9 + idx * 1.7) * 1.35;
    const dir = Math.cos(t * 0.9 + idx * 1.7);
    ref.current.position.z = basePos[2] + offset;
    ref.current.rotation.y = dir >= 0 ? 0 : Math.PI;
  });

  return (
    <group ref={ref} position={basePos}>
      <AnimatedCharacter3D
        path="/models/market/character-employee.glb"
        anim={isBehindCounter ? 'serve' : 'walk'}
        scale={1.0}
      />
    </group>
  );
}

// Strolling Chibi Citizens Outside on Boba Land Sidewalk
function StrollingStreetPedestrian({ modelPath, startX, z, speed }) {
  const ref = useRef();
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.position.x += speed * delta;
    if (speed > 0 && ref.current.position.x > 16) ref.current.position.x = -16;
    if (speed < 0 && ref.current.position.x < -16) ref.current.position.x = 16;
  });

  return (
    <group ref={ref} position={[startX, 0, z]} rotation={[0, speed > 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
      <AnimatedCharacter3D path={modelPath} anim="walk" scale={1.0} />
    </group>
  );
}

// Proportioned Round Oak Cafe Bistro Table (Exact 0.74m height + Real-Size 18cm Drinks Flush on Tabletop!)
function CafeBistroTableSet({ position, seatPatronModel = null }) {
  return (
    <group position={position}>
      {/* Smooth Brushed Floor Base & Center Pedestal */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <cylinderGeometry args={[0.28, 0.3, 0.04, 24]} />
        <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.37, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.065, 0.7, 18]} />
        <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.35} />
      </mesh>
      {/* Crisp Smooth Round Oak Tabletop (Diameter 1.08m, Top Surface at Exact y = 0.74m!) */}
      <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.54, 0.54, 0.04, 32]} />
        <meshStandardMaterial color="#d4a373" roughness={0.55} />
      </mesh>

      {/* 2 Proportioned Cushioned Cafe Chairs (Seat 0.42m, Back 0.78m) */}
      <ModelGLB
        path="/models/furniture/chairCushion.glb"
        position={[-0.72, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        scale={1.7}
      />
      <ModelGLB
        path="/models/furniture/chairCushion.glb"
        position={[0.72, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        scale={1.7}
      />

      {/* True-to-Life 18cm Boba Cup Flush on Tabletop (y = 0.74 + 0.091 = 0.831m) */}
      <BobaCup3D
        cup={{ tea: 'black_tea', milk: 100, toppings: ['pearl'], isSealed: true }}
        position={[-0.16, 0.831, -0.06]}
        scale={0.12}
      />

      {/* Ceramic Saucer + Real-Size 13cm Sprinkled Donut Flush on Tabletop */}
      <mesh position={[0.16, 0.746, 0.08]}>
        <cylinderGeometry args={[0.11, 0.09, 0.014, 20]} />
        <meshStandardMaterial color="#fff1f2" roughness={0.3} />
      </mesh>
      <ModelGLB
        path="/models/food/donut-sprinkles.glb"
        position={[0.16, 0.752, 0.08]}
        scale={0.48}
      />

      {/* Tiny Wooden Menu Card Stand */}
      <mesh position={[0, 0.785, -0.22]} rotation={[-0.1, 0, 0]} castShadow>
        <boxGeometry args={[0.11, 0.09, 0.02]} />
        <meshStandardMaterial color="#fef3c7" roughness={0.5} />
      </mesh>

      {/* Seated Chibi Patron Playing Native 'sit' Animation! */}
      {seatPatronModel && (
        <AnimatedCharacter3D
          path={seatPatronModel}
          anim="sit"
          scale={0.95}
          position={[-0.68, 0.18, 0]}
          rotation={[0, Math.PI / 2, 0]}
        />
      )}
    </group>
  );
}

// Customer Standing in Queue Facing the Barista (-Z)
function CustomerQueueItem({ customer, index, isFront, isCraftingMode, onSelect }) {
  const zPos = 0.95 + index * 1.28;
  const xPos = index === 0 ? 0 : index % 2 === 1 ? -0.52 : 0.52;
  const [justArrived, setJustArrived] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setJustArrived(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const patiencePct = Math.max(0, Math.round((customer.patience / customer.maxPatience) * 100));
  const teaObj = TEA_BASES.find((t) => t.id === customer.order.tea);
  const animState = isFront && justArrived ? 'wave' : 'idle';

  return (
    <group position={[xPos, 0, zPos]}>
      <AnimatedCharacter3D
        presetKey={customer.archetypeId}
        path={customer.model}
        anim={animState}
        scale={1.0}
        rotation={[0, Math.PI, 0]}
        onClick={() => onSelect(customer.uid)}
      />

      {/* Cute Pink Selection Ring Under Front Customer (Zero HTML Portal Unmount Crash!) */}
      {isFront && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.34, 0.42, 28]} />
          <meshBasicMaterial color="#ff8fab" />
        </mesh>
      )}
    </group>
  );
}

// High-Detail Crisp Proportioned Barista Counter with Live 3D Stock Gauges!
function PremiumStylizedBaristaCounter({ sealerLv, autoLv }) {
  const currentCup = useGameStore((s) => s.currentCup);
  const rawInventory = useGameStore((s) => s.inventory);
  const inventory = rawInventory || {};
  const maxCap = useGameStore((s) => 15 + (s.upgrades?.expand_shop || 0) * 10);
  const shakeShaker = useGameStore((s) => s.shakeShaker);
  const lastServeResult = useGameStore((s) => s.lastServeResult);
  const angrySplat = useGameStore((s) => s.angrySplat);
  const totalCupsServed = useGameStore((s) => s.totalCupsServed);

  const shakerRef = useRef();
  const sealerHeadRef = useRef();
  const cupHolderRef = useRef();
  const thrownCupRef = useRef();
  const [isPouringAnim, setIsPouringAnim] = useState(false);

  useEffect(() => {
    if (currentCup.tea !== null || currentCup.milk !== null) {
      setIsPouringAnim(true);
      const timer = setTimeout(() => setIsPouringAnim(false), 600);
      return () => clearTimeout(timer);
    }
  }, [currentCup.tea, currentCup.milk, currentCup.isPoured]);

  useEffect(() => {
    if (!shakerRef.current || currentCup.shakeProgress === 0) return;
    gsap.killTweensOf(shakerRef.current.position);
    gsap.killTweensOf(shakerRef.current.rotation);
    const tl = gsap.timeline();
    tl.to(shakerRef.current.position, { y: 1.32, x: 0.48, duration: 0.08, ease: 'power2.out' })
      .to(shakerRef.current.rotation, { z: -0.32, x: 0.18, duration: 0.08 }, 0)
      .to(shakerRef.current.position, { y: 1.12, x: 0.42, duration: 0.1, ease: 'bounce.out' })
      .to(shakerRef.current.rotation, { z: 0.22, x: -0.1, duration: 0.08 }, 0.08)
      .to(shakerRef.current.rotation, { z: 0, x: 0, duration: 0.12 });
  }, [currentCup.shakeProgress]);

  useEffect(() => {
    if (!cupHolderRef.current || !sealerHeadRef.current) return;
    if (currentCup.isPoured && !currentCup.isSealed) {
      gsap.to(cupHolderRef.current.position, { x: -0.78, duration: 0.3, ease: 'power2.inOut' });
      gsap.to(sealerHeadRef.current.position, {
        y: 0.24,
        duration: 0.22,
        delay: 0.2,
        yoyo: true,
        repeat: 1,
      });
    } else {
      gsap.to(cupHolderRef.current.position, { x: 0, duration: 0.36, ease: 'back.out(1.4)' });
    }
  }, [currentCup.isPoured, currentCup.isSealed]);

  useFrame((_, delta) => {
    if (thrownCupRef.current && angrySplat) {
      thrownCupRef.current.position.z -= delta * 7.8;
      thrownCupRef.current.rotation.x += delta * 12;
    } else if (thrownCupRef.current) {
      thrownCupRef.current.position.set(0, 1.25, 1.55);
      thrownCupRef.current.rotation.set(0, 0, 0);
    }
  });

  // Countertop top surface is at exact y = 1.00m
  return (
    <group position={[0, 0, -1.65]}>
      {/* Warm Walnut Counter Body */}
      <RoundedBox args={[5.8, 0.94, 1.1]} radius={0.05} position={[0, 0.47, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#9c6644" roughness={0.62} />
      </RoundedBox>
      {/* Cream Front Accent Panel */}
      <RoundedBox args={[5.4, 0.66, 0.04]} radius={0.03} position={[0, 0.47, 0.55]} receiveShadow>
        <meshStandardMaterial color="#faedcd" roughness={0.65} />
      </RoundedBox>
      {/* Crisp Smooth Quartz Countertop (Top at y = 1.00m) */}
      <RoundedBox args={[6.0, 0.08, 1.2]} radius={0.03} position={[0, 0.96, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#f5ebe0" roughness={0.4} metalness={0.04} />
      </RoundedBox>

      {/* Proportioned Bar Stools in Front of Counter (0.58m height) */}
      <ModelGLB path="/models/quaternius/stool_bar.glb" position={[-2.0, 0, 0.88]} scale={0.42} />
      <ModelGLB path="/models/quaternius/stool_bar.glb" position={[2.0, 0, 0.88]} scale={0.42} />

      {/* 1. SLEEK GLASS TOPPING SHOWCASE (Proportioned 1.45m wide × 0.22m high + Live Stock Fill!) */}
      <group position={[0.25, 1.0, -0.3]}>
        <RoundedBox args={[1.52, 0.08, 0.34]} radius={0.02} position={[0, 0.04, 0]} castShadow>
          <meshStandardMaterial color="#cbd5e1" metalness={0.65} roughness={0.25} />
        </RoundedBox>
        {/* Crisp Angled Glass Sneeze-Guard */}
        <mesh position={[0, 0.16, 0.16]} rotation={[-0.22, 0, 0]}>
          <boxGeometry args={[1.52, 0.22, 0.015]} />
          <meshStandardMaterial color="#e0f2fe" transparent opacity={0.32} roughness={0.08} />
        </mesh>
        <mesh position={[0, 0.26, 0.03]}>
          <boxGeometry args={[1.52, 0.015, 0.26]} />
          <meshStandardMaterial color="#e0f2fe" transparent opacity={0.32} roughness={0.08} />
        </mesh>
        {TOPPINGS.map((top, idx) => {
          const x = 0.56 - idx * 0.28;
          const active = currentCup.toppings.includes(top.id);
          const stock = inventory[top.id] ?? 0;
          const stockRatio = Math.max(0, Math.min(1, stock / maxCap));
          return (
            <group key={top.id} position={[x, 0.082, 0]}>
              <mesh>
                <boxGeometry args={[0.24, 0.03, 0.26]} />
                <meshStandardMaterial
                  color={stock === 0 ? '#ef4444' : active ? '#ec4899' : '#64748b'}
                  metalness={0.45}
                  roughness={0.3}
                />
              </mesh>
              {stock > 0 && (
                <mesh position={[0, 0.018, 0]} scale={[1, 0.35 + stockRatio * 0.65, 1]}>
                  <boxGeometry args={[0.21, 0.032, 0.23]} />
                  <meshStandardMaterial color={top.color} roughness={0.18} />
                </mesh>
              )}
            </group>
          );
        })}
      </group>

      {/* 2. SLEEK INSULATED GLASS TEA URNS (Proportioned 34cm high + Live 3D Tea Stock Level!) */}
      {TEA_BASES.map((tea, idx) => {
        const x = 2.45 - idx * 0.31;
        const selected = currentCup.tea === tea.id;
        const stock = inventory[tea.id] ?? 0;
        const fillRatio = Math.max(0.05, Math.min(1, stock / maxCap));
        return (
          <group key={tea.id} position={[x, 1.0, -0.22]}>
            {/* Matte Black Stand (10cm high) */}
            <mesh position={[0, 0.05, 0]} castShadow>
              <cylinderGeometry args={[0.105, 0.115, 0.1, 20]} />
              <meshStandardMaterial color="#1e293b" metalness={0.4} roughness={0.4} />
            </mesh>
            {/* Outer Clear Glass Urn Cylinder (22cm high) */}
            <mesh position={[0, 0.21, 0]}>
              <cylinderGeometry args={[0.105, 0.105, 0.22, 22, 1, true]} />
              <meshStandardMaterial color="#e0f2fe" transparent opacity={0.28} roughness={0.08} depthWrite={false} />
            </mesh>
            {/* Dynamic 3D Tea Liquid Level Based on Remaining Stock! */}
            {stock > 0 && (
              <mesh
                position={[0, 0.1 + 0.1 * fillRatio, 0]}
                scale={[1, fillRatio, 1]}
              >
                <cylinderGeometry args={[0.098, 0.098, 0.2, 20]} />
                <meshStandardMaterial
                  color={tea.color}
                  roughness={0.2}
                  emissive={selected ? tea.color : '#000000'}
                  emissiveIntensity={selected ? 0.35 : 0}
                />
              </mesh>
            )}
            {/* Stock Status Dot (Green = OK, Red = Empty!) */}
            <mesh position={[0, 0.05, 0.112]}>
              <sphereGeometry args={[0.016, 10, 10]} />
              <meshBasicMaterial color={stock === 0 ? '#ef4444' : stock <= 2 ? '#f59e0b' : '#4ade80'} />
            </mesh>
            {/* Brushed Steel Lid */}
            <mesh position={[0, 0.33, 0]}>
              <cylinderGeometry args={[0.11, 0.11, 0.03, 20]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.75} roughness={0.2} />
            </mesh>
          </group>
        );
      })}

      {/* 3. PROPORTIONED 24CM CHROME BARTENDER SHAKER */}
      <group
        ref={shakerRef}
        position={[0.42, 1.12, 0.14]}
        onClick={() => {
          if (currentCup.step === 5) shakeShaker(20);
        }}
      >
        <mesh castShadow>
          <cylinderGeometry args={[0.095, 0.072, 0.24, 22]} />
          <meshStandardMaterial
            color={currentCup.step === 5 ? '#38bdf8' : '#e2e8f0'}
            metalness={0.82}
            roughness={0.16}
          />
        </mesh>
        <mesh position={[0, 0.155, 0]}>
          <cylinderGeometry args={[0.045, 0.092, 0.08, 22]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.85} roughness={0.14} />
        </mesh>
      </group>

      {/* 3B. PROPORTIONED RAPIER PHYSICS PEARL JAR */}
      <Suspense fallback={null}>
        <group scale={0.68} position={[0.78, 1.0, 0.14]}>
          <RapierBobaPhysics position={[0, 0, 0]} />
        </group>
      </Suspense>

      {/* 4. ELEVATED PINK BARISTA PEDESTAL & HERO 3D BOBA CUP (100% Visible Above UI Dock!) */}
      <mesh position={[0, 1.04, 0.14]} castShadow>
        <cylinderGeometry args={[0.2, 0.23, 0.08, 28]} />
        <meshStandardMaterial color="#ff8fab" roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.085, 0.14]}>
        <cylinderGeometry args={[0.18, 0.18, 0.015, 28]} />
        <meshStandardMaterial color="#fff0f6" roughness={0.35} />
      </mesh>
      <group ref={cupHolderRef} position={[0, 1.29, 0.14]}>
        <BobaCup3D cup={currentCup} scale={0.26} isPouring={isPouringAnim} />
      </group>

      {/* 5. SLEEK COMPACT STAINLESS CUP SEALER MACHINE (34cm wide × 48cm high!) */}
      <group position={[-0.78, 1.0, 0.14]}>
        {/* Stainless Base */}
        <RoundedBox args={[0.36, 0.04, 0.38]} radius={0.015} position={[0, 0.02, 0]} castShadow>
          <meshStandardMaterial
            color={sealerLv === 0 ? '#78716c' : '#eab308'}
            metalness={0.65}
            roughness={0.25}
          />
        </RoundedBox>
        {/* Sleek Side Columns */}
        <mesh position={[-0.15, 0.24, -0.05]} castShadow>
          <boxGeometry args={[0.04, 0.44, 0.18]} />
          <meshStandardMaterial color={sealerLv === 0 ? '#a8a29e' : '#facc15'} metalness={0.6} roughness={0.25} />
        </mesh>
        <mesh position={[0.15, 0.24, -0.05]} castShadow>
          <boxGeometry args={[0.04, 0.44, 0.18]} />
          <meshStandardMaterial color={sealerLv === 0 ? '#a8a29e' : '#facc15'} metalness={0.6} roughness={0.25} />
        </mesh>
        {/* Top Control Head with Digital LED Screen */}
        <RoundedBox args={[0.38, 0.14, 0.26]} radius={0.025} position={[0, 0.46, -0.02]} castShadow>
          <meshStandardMaterial color={sealerLv === 0 ? '#475569' : '#db2777'} roughness={0.35} />
        </RoundedBox>
        {/* Digital Temp Display */}
        <mesh position={[-0.08, 0.46, 0.112]}>
          <planeGeometry args={[0.12, 0.05]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0.09, 0.46, 0.113]}>
          <circleGeometry args={[0.02, 14]} />
          <meshBasicMaterial color="#4ade80" />
        </mesh>
        {/* Dual Film Rollers on Top */}
        <mesh position={[-0.08, 0.58, -0.02]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.055, 0.055, 0.2, 20]} />
          <meshStandardMaterial color="#fbcfe8" roughness={0.3} />
        </mesh>
        {/* Animated Heater Seal Ring */}
        <mesh ref={sealerHeadRef} position={[0, 0.35, 0.02]}>
          <cylinderGeometry args={[0.11, 0.115, 0.06, 20]} />
          <meshStandardMaterial color="#38bdf8" metalness={0.5} roughness={0.25} />
        </mesh>
      </group>

      {/* 6. CRISP TOUCHSCREEN IPAD POS TERMINAL (-1.38) */}
      <group position={[-1.38, 1.0, 0.12]}>
        <mesh position={[0, 0.015, 0]}>
          <boxGeometry args={[0.24, 0.03, 0.22]} />
          <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.11, -0.03]} rotation={[0.2, 0, 0]}>
          <cylinderGeometry args={[0.022, 0.03, 0.18, 14]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.2} />
        </mesh>
        {/* Tilted Touchscreen Facing Barista */}
        <group position={[0, 0.22, -0.02]} rotation={[-0.45, 0, 0]}>
          <RoundedBox args={[0.3, 0.21, 0.02]} radius={0.015} castShadow>
            <meshStandardMaterial color="#f8fafc" roughness={0.3} />
          </RoundedBox>
          <mesh position={[0, 0, -0.012]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[0.26, 0.17]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        </group>
      </group>

      {/* 7. CLEAR GLASS PASTRY SHOWCASE WITH TRUE-SCALE 22CM CAKE & DONUTS (-2.15) */}
      <group position={[-2.15, 1.0, 0.1]}>
        <RoundedBox args={[0.72, 0.05, 0.44]} radius={0.015} position={[0, 0.025, 0]} castShadow>
          <meshStandardMaterial color="#78350f" roughness={0.6} />
        </RoundedBox>
        {/* Clear Glass Box */}
        <mesh position={[0, 0.22, 0]}>
          <boxGeometry args={[0.7, 0.36, 0.42]} />
          <meshStandardMaterial color="#e0f2fe" transparent opacity={0.24} roughness={0.08} depthWrite={false} />
        </mesh>
        {/* Middle Glass Shelf */}
        <mesh position={[0, 0.21, 0]}>
          <boxGeometry args={[0.66, 0.012, 0.36]} />
          <meshStandardMaterial color="#bae6fd" transparent opacity={0.45} roughness={0.1} />
        </mesh>
        {/* Real-Proportion 22cm Cake on Bottom Shelf & 12cm Donuts on Top Shelf! */}
        <ModelGLB path="/models/food/cake.glb" position={[-0.14, 0.05, 0]} scale={0.26} />
        <ModelGLB path="/models/food/pudding.glb" position={[0.18, 0.05, 0]} scale={0.85} />
        <ModelGLB path="/models/food/donut-sprinkles.glb" position={[-0.15, 0.22, 0]} scale={0.48} />
        <ModelGLB path="/models/food/donut-sprinkles.glb" position={[0.12, 0.22, 0]} scale={0.48} />
      </group>

      {/* 8. BACK BAR EQUIPMENT, LED MENU BOARDS & COMMERCIAL FRIDGE */}
      <group position={[0, 0, -2.25]}>
        <ModelGLB path="/models/quaternius/cabinet.glb" position={[-1.35, 0, 0]} scale={0.92} />
        <ModelGLB path="/models/quaternius/cabinet.glb" position={[0, 0, 0]} scale={0.92} />
        <ModelGLB path="/models/quaternius/cabinet.glb" position={[1.35, 0, 0]} scale={0.92} />
        <ModelGLB path="/models/quaternius/fridge.glb" position={[-2.75, 0, 0.1]} scale={0.58} />
        <ModelGLB path="/models/quaternius/shelf_back.glb" position={[2.75, 0, -0.05]} scale={0.56} />
        <ModelGLB path="/models/furniture/kitchenBlender.glb" position={[1.45, 0.89, 0.05]} scale={1.35} />

        {/* Sleek Commercial Espresso / Tea Extractor (Proportioned 62cm wide × 38cm tall!) */}
        <group position={[-0.45, 1.08, 0.05]}>
          <RoundedBox args={[0.64, 0.38, 0.36]} radius={0.035} castShadow>
            <meshStandardMaterial color="#e11d48" metalness={0.5} roughness={0.25} />
          </RoundedBox>
          <mesh position={[-0.15, -0.05, 0.19]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.08, 16]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.85} roughness={0.15} />
          </mesh>
          <mesh position={[0.15, -0.05, 0.19]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.08, 16]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.85} roughness={0.15} />
          </mesh>
        </group>

        {autoLv > 0 &&
          Array.from({ length: Math.min(autoLv, 3) }, (_, idx) => (
            <ModelGLB
              key={`auto_${idx}`}
              path="/models/furniture/kitchenCoffeeMachine.glb"
              position={[0.35 + idx * 0.45, 0.89, 0.05]}
              scale={1.25}
            />
          ))}

        {/* 3 Illuminated Pastel LED Menu Boards */}
        {[
          { x: -1.6, bg: '#fdf2f8', border: '#f472b6', accent: '#db2777' },
          { x: 0, bg: '#fffbeb', border: '#fbbf24', accent: '#d97706' },
          { x: 1.6, bg: '#ecfdf5', border: '#34d399', accent: '#059669' },
        ].map((board, i) => (
          <group key={i} position={[board.x, 2.48, -0.18]} rotation={[0.08, 0, 0]}>
            <RoundedBox args={[1.38, 0.82, 0.06]} radius={0.035} castShadow>
              <meshStandardMaterial color="#78350f" roughness={0.65} />
            </RoundedBox>
            <mesh position={[0, 0, 0.034]}>
              <planeGeometry args={[1.26, 0.7]} />
              <meshStandardMaterial
                color={board.bg}
                emissive={board.border}
                emissiveIntensity={0.2}
                roughness={0.4}
              />
            </mesh>
            <mesh position={[-0.36, 0.04, 0.038]}>
              <circleGeometry args={[0.18, 22]} />
              <meshBasicMaterial color={board.border} />
            </mesh>
            <mesh position={[0.16, 0.14, 0.038]}>
              <planeGeometry args={[0.58, 0.08]} />
              <meshBasicMaterial color={board.accent} />
            </mesh>
            <mesh position={[0.16, -0.02, 0.038]}>
              <planeGeometry args={[0.48, 0.055]} />
              <meshBasicMaterial color="#64748b" />
            </mesh>
            <mesh position={[0.16, -0.15, 0.038]}>
              <planeGeometry args={[0.42, 0.055]} />
              <meshBasicMaterial color="#94a3b8" />
            </mesh>
          </group>
        ))}

        <pointLight position={[0, 2.75, 0.9]} intensity={0.9} distance={9} color="#ffedd5" />
      </group>

      <FloatingCoins3D triggerKey={totalCupsServed} origin={[0, 1.35, 2.1]} />

      <group ref={thrownCupRef} position={[0, 1.25, 1.55]} visible={!!angrySplat}>
        <BobaCup3D
          cup={{ tea: 'black_tea', milk: 100, toppings: ['pearl'], isSealed: true }}
          scale={0.25}
        />
      </group>

      {lastServeResult?.isSuccess && (
        <mesh position={[0, 1.01, 0.3]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.2, 0.28, 24]} />
          <meshBasicMaterial color="#4ade80" transparent opacity={0.75} />
        </mesh>
      )}
    </group>
  );
}

export default function BobaShopScene() {
  const sceneMode = useGameStore((s) => s.sceneMode);
  const shopName = useGameStore((s) => s.shopName);
  const upgrades = useGameStore((s) => s.upgrades);
  const character = useGameStore((s) => s.character);
  const customers = useGameStore((s) => s.customers);
  const selectedCustomerUid = useGameStore((s) => s.selectedCustomerUid);
  const selectCustomerAndCraft = useGameStore((s) => s.selectCustomerAndCraft);

  const isCraftingMode = sceneMode === 'crafting';

  const expandLv = upgrades.expand_shop || 0;
  const furnLv = upgrades.furniture_set || 1;
  const autoLv = upgrades.auto_brewer || 0;
  const staffLv = upgrades.hire_staff || 0;
  const vipLv = upgrades.vip_zone || 0;
  const roofLv = upgrades.rooftop_floor || 0;
  const sealerLv = upgrades.sealer_pro || 0;

  const floorWidth = 11.4 + expandLv * 2.6;
  const floorDepth = 11.6 + expandLv * 1.8;

  const activeOutfit =
    CHARACTER_OUTFITS.models.find((m) => m.id === character.modelId) || CHARACTER_OUTFITS.models[0];

  const orderedCustomers = [...customers].sort((a, b) => {
    if (a.uid === selectedCustomerUid) return -1;
    if (b.uid === selectedCustomerUid) return 1;
    return 0;
  });

  return (
    <group>
      {/* 1. SUNNY STREET & NEIGHBORHOOD OUTSIDE (+Z) */}
      <mesh receiveShadow position={[0, -0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[75, 75]} />
        <meshStandardMaterial color="#76b07d" roughness={0.92} />
      </mesh>
      <mesh receiveShadow position={[0, -0.05, floorDepth / 2 + 1.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[52, 3.6]} />
        <meshStandardMaterial color="#dfd5c8" roughness={0.85} />
      </mesh>
      <mesh receiveShadow position={[0, -0.04, floorDepth / 2 + 5.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[52, 4.4]} />
        <meshStandardMaterial color="#475569" roughness={0.88} />
      </mesh>
      {[-12, -6, 0, 6, 12].map((rx) => (
        <mesh key={rx} position={[rx, -0.03, floorDepth / 2 + 5.8]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.4, 0.22]} />
          <meshBasicMaterial color="#e2e8f0" />
        </mesh>
      ))}

      <ModelGLB path="/models/quaternius/tree_sakura.glb" position={[-7.2, 0, floorDepth / 2 + 2.8]} scale={1.4} castShadow={false} />
      <ModelGLB path="/models/quaternius/tree_green.glb" position={[7.2, 0, floorDepth / 2 + 2.8]} scale={1.4} castShadow={false} />
      <ModelGLB path="/models/quaternius/tree_green.glb" position={[-11.5, 0, floorDepth / 2 + 2.6]} scale={1.35} castShadow={false} />
      <ModelGLB path="/models/quaternius/tree_sakura.glb" position={[11.5, 0, floorDepth / 2 + 2.6]} scale={1.35} castShadow={false} />
      <ModelGLB path="/models/quaternius/bush_berries.glb" position={[-3.4, 0, floorDepth / 2 + 0.65]} scale={0.7} />
      <ModelGLB path="/models/quaternius/bush_berries.glb" position={[3.4, 0, floorDepth / 2 + 0.65]} scale={0.7} />
      <ModelGLB path="/models/quaternius/streetlight.glb" position={[-4.2, 0, floorDepth / 2 + 3.1]} scale={2.3} castShadow={false} />
      <ModelGLB path="/models/quaternius/streetlight.glb" position={[4.2, 0, floorDepth / 2 + 3.1]} scale={2.3} castShadow={false} />

      <ModelGLB path="/models/quaternius/city_shop1.glb" position={[-7.2, 0, floorDepth / 2 + 11.2]} rotation={[0, Math.PI, 0]} scale={1.35} castShadow={false} />
      <ModelGLB path="/models/quaternius/city_shop2.glb" position={[0, 0, floorDepth / 2 + 11.5]} rotation={[0, Math.PI, 0]} scale={1.35} castShadow={false} />
      <ModelGLB path="/models/quaternius/city_shop3.glb" position={[7.2, 0, floorDepth / 2 + 11.2]} rotation={[0, Math.PI, 0]} scale={1.35} castShadow={false} />

      <StrollingStreetPedestrian
        modelPath="/models/characters/character-female-b.glb"
        startX={-8}
        z={floorDepth / 2 + 1.9}
        speed={1.6}
      />
      <StrollingStreetPedestrian
        modelPath="/models/characters/character-male-a.glb"
        startX={7}
        z={floorDepth / 2 + 2.5}
        speed={-1.4}
      />

      {/* 2. CAFE FLOOR, WALLS & GLASS STOREFRONT */}
      <RoundedBox
        args={[floorWidth, 0.14, floorDepth]}
        radius={0.05}
        position={[0, -0.02, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#c69568" roughness={0.68} />
      </RoundedBox>

      <mesh receiveShadow position={[0, 0.052, 1.9]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.9, 4.6]} />
        <meshStandardMaterial color="#f5ebe0" roughness={0.85} />
      </mesh>

      <RoundedBox
        args={[floorWidth, 3.85, 0.32]}
        radius={0.05}
        position={[0, 1.92, -floorDepth / 2]}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial color="#f2dfd3" roughness={0.78} />
      </RoundedBox>
      <RoundedBox
        args={[0.32, 3.85, floorDepth]}
        radius={0.05}
        position={[-floorWidth / 2, 1.92, 0]}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial color="#dfece2" roughness={0.78} />
      </RoundedBox>

      <ModelGLB
        path="/models/quaternius/window_large.glb"
        position={[-floorWidth / 2 + 0.18, 1.35, 1.6]}
        rotation={[0, Math.PI / 2, 0]}
        scale={1.05}
      />

      {/* Panoramic Glass Storefront */}
      <group position={[0, 0, floorDepth / 2]}>
        <mesh position={[-floorWidth * 0.28, 1.75, 0]}>
          <boxGeometry args={[floorWidth * 0.34, 3.2, 0.08]} />
          <meshStandardMaterial color="#bae6fd" transparent opacity={0.25} roughness={0.1} depthWrite={false} />
        </mesh>
        <mesh position={[floorWidth * 0.28, 1.75, 0]}>
          <boxGeometry args={[floorWidth * 0.34, 3.2, 0.08]} />
          <meshStandardMaterial color="#bae6fd" transparent opacity={0.25} roughness={0.1} depthWrite={false} />
        </mesh>
        <mesh position={[-floorWidth / 2 + 0.35, 1.6, 0]} castShadow>
          <boxGeometry args={[0.36, 3.2, 0.36]} />
          <meshStandardMaterial color="#b57c52" roughness={0.65} />
        </mesh>
        <mesh position={[floorWidth / 2 - 0.35, 1.6, 0]} castShadow>
          <boxGeometry args={[0.36, 3.2, 0.36]} />
          <meshStandardMaterial color="#b57c52" roughness={0.65} />
        </mesh>
      </group>

      <ModelGLB path="/models/quaternius/light_pendant.glb" position={[-2.2, 3.25, -1.5]} scale={0.9} castShadow={false} />
      <ModelGLB path="/models/quaternius/light_pendant.glb" position={[2.2, 3.25, -1.5]} scale={0.9} castShadow={false} />
      <ModelGLB path="/models/quaternius/light_pendant.glb" position={[0, 3.25, 1.2]} scale={0.9} castShadow={false} />

      {!isCraftingMode && (
        <Banner3D position={[0, 4.15, -floorDepth / 2 + 0.3]} color="#fde047" size="lg" distanceFactor={13}>
          🧋 {shopName.toUpperCase()}
        </Banner3D>
      )}

      {/* 3. CRISP PROPORTIONED BARISTA COUNTER */}
      <PremiumStylizedBaristaCounter sealerLv={sealerLv} autoLv={autoLv} />

      {/* 4. SHOP OWNER CHARACTER BEHIND COUNTER FACING CUSTOMERS (+Z) */}
      <AnimatedCharacter3D
        path={activeOutfit.path}
        anim={isCraftingMode ? 'serve' : 'idle'}
        scale={1.0}
        position={isCraftingMode ? [2.05, 0, -2.5] : [0.2, 0, -2.5]}
        rotation={[0, 0, 0]}
      >
        <PlayerAccessories3D hatId={character.hatId} petId={character.petId} />
      </AnimatedCharacter3D>

      {/* 5. HIRED CUTE APRON CAFE STAFF */}
      {staffLv > 0 &&
        Array.from({ length: Math.min(staffLv, 4) }, (_, idx) => (
          <WalkingCafeStaff
            key={`staff_${idx}`}
            idx={idx}
            basePos={idx % 2 === 0 ? [-1.6, 0, -2.5] : [2.2, 0, 2.2]}
          />
        ))}

      {/* 6. PROPORTIONED CAFE BISTRO TABLES WITH REAL-SIZE DRINKS & SEATED PATRONS! */}
      {[
        { pos: [-3.25, 0, 1.25], patron: '/models/characters/character-female-b.glb' },
        { pos: [3.25, 0, 1.25], patron: '/models/characters/character-male-a.glb' },
        { pos: [-3.35, 0, 3.65], patron: null },
        { pos: [3.35, 0, 3.65], patron: null },
      ]
        .slice(0, furnLv)
        .map((cfg, idx) => (
          <CafeBistroTableSet key={`table_${idx}`} position={cfg.pos} seatPatronModel={cfg.patron} />
        ))}

      {/* Houseplants & Cute Shiba Inu Cafe Mascot */}
      <ModelGLB path="/models/quaternius/plant_1.glb" position={[-floorWidth / 2 + 0.85, 0, -floorDepth / 2 + 0.85]} scale={1.1} />
      <ModelGLB path="/models/quaternius/plant_3.glb" position={[floorWidth / 2 - 0.85, 0, -floorDepth / 2 + 0.85]} scale={1.15} />
      <ModelGLB path="/models/quaternius/plant_5.glb" position={[-floorWidth / 2 + 0.85, 0, floorDepth / 2 - 0.85]} scale={1.2} />
      {furnLv >= 2 && (
        <AnimatedAnimal3D
          path="/models/quaternius/pet_shiba.glb"
          anim="Idle_2"
          scale={0.21}
          position={[-1.8, 0, floorDepth / 2 - 1.3]}
          rotation={[0, 0.5, 0]}
        />
      )}
      {furnLv >= 3 && (
        <ModelGLB path="/models/quaternius/light_floor.glb" position={[-floorWidth / 2 + 0.9, 0, 2.4]} scale={0.95} />
      )}

      {/* 7. VIP ROYAL LOUNGE (Proportioned Sundae & Coffee Table!) */}
      {vipLv > 0 && (
        <group position={[floorWidth / 2 - 2.3, 0.03, -1.1]}>
          <ModelGLB path="/models/quaternius/carpet_vip.glb" scale={1.05} />
          <ModelGLB path="/models/quaternius/couch_vip.glb" position={[0.2, 0, -0.5]} rotation={[0, -Math.PI / 2, 0]} scale={0.48} />
          <ModelGLB path="/models/furniture/tableCoffeeGlass.glb" position={[-0.25, 0, 0.35]} scale={1.65} />
          <ModelGLB path="/models/food/sundae.glb" position={[-0.25, 0.4, 0.35]} scale={0.38} />
          <ModelGLB path="/models/quaternius/light_chandelier.glb" position={[0, 3.1, 0]} scale={1.05} castShadow={false} />
          <AnimatedAnimal3D
            path="/models/quaternius/pet_alpaca.glb"
            anim="Idle"
            scale={0.19}
            position={[-1.25, 0, 0.85]}
            rotation={[0, 0.6, 0]}
          />
          {!isCraftingMode && (
            <Banner3D position={[0, 2.0, -0.9]} color="#facc15" distanceFactor={11}>
              👑 KHU VỰC VIP
            </Banner3D>
          )}
        </group>
      )}

      {/* 8. 2ND FLOOR SKY ROOFTOP CAFE */}
      {roofLv > 0 && !isCraftingMode && (
        <group position={[0, 3.88, -1.5]}>
          <RoundedBox args={[floorWidth * 0.72, 0.22, floorDepth * 0.52]} radius={0.05} receiveShadow castShadow>
            <meshStandardMaterial color="#d4a373" roughness={0.7} />
          </RoundedBox>
          <mesh position={[0, 0.52, (floorDepth * 0.52) / 2]}>
            <boxGeometry args={[floorWidth * 0.72, 0.85, 0.07]} />
            <meshStandardMaterial color="#7dd3fc" transparent opacity={0.35} roughness={0.12} />
          </mesh>
          <CafeBistroTableSet position={[-1.9, 0.11, 0]} />
          <CafeBistroTableSet position={[1.9, 0.11, 0]} />
          <Banner3D position={[0, 1.35, (floorDepth * 0.52) / 2 + 0.06]} color="#38bdf8" distanceFactor={12}>
            ✨ SKY BAR TẦNG THƯỢNG ✨
          </Banner3D>
        </group>
      )}

      {/* 9. SKELETAL-ANIMATED CHIBI CUSTOMER QUEUE */}
      {orderedCustomers.map((c, idx) => (
        <CustomerQueueItem
          key={c.uid}
          customer={c}
          index={idx}
          isFront={idx === 0}
          isCraftingMode={isCraftingMode}
          onSelect={selectCustomerAndCraft}
        />
      ))}

      {/* 10. ALIEN EMERGENCY UFO VISIT 👽 */}
      <AlienUFO3D />
    </group>
  );
}
