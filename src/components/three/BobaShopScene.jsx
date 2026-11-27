import React, { Suspense, lazy, useMemo, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import gsap from 'gsap';
import { useGameStore } from '../../store/useGameStore';
import { CHARACTER_OUTFITS, TEA_BASES, TOPPINGS } from '../../data/gameData';
import { SHOP_THEMES, getFloorTexture, getWallTexture } from './cafeTextures';
import ModelGLB from './ModelGLB';
import BobaCup3D from './BobaCup3D';
import AlienUFO3D from './AlienUFO3D';
import Banner3D from './Banner3D';
import AnimatedCharacter3D, { AnimatedAnimal3D } from './AnimatedCharacter3D';
import FloatingCoins3D from './FloatingCoins3D';

const IS_MOBILE_DEVICE =
  typeof window !== 'undefined' &&
  (window.innerWidth < 820 || window.matchMedia?.('(pointer: coarse)')?.matches);

function LightweightPearlJar({ position = [0.82, 0.95, 0.12] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.24, 16]} />
        <meshStandardMaterial color="#f0f9ff" transparent opacity={0.35} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.105, 0.105, 0.03, 16]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.3} />
      </mesh>
      {[
        [-0.04, 0.04, 0.03],
        [0.04, 0.04, -0.02],
        [0, 0.05, 0.04],
        [-0.03, 0.09, -0.03],
        [0.03, 0.09, 0.03],
        [0, 0.12, 0],
      ].map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.024, 8, 8]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#1e1310' : '#f59e0b'} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

const RapierBobaPhysics = lazy(() => import('./RapierBobaPhysics'));

export function PlayerAccessories3D({ hatId, petId }) {
  const petMap = {
    cafe_cat: { path: '/models/cafe/pet_cat.glb', scale: 1.15, anim: 'Idle' },
    cafe_dog: { path: '/models/cafe/pet_dog.glb', scale: 0.78, anim: 'Idle' },
    golden_pearl: { path: '/models/quaternius/pet_alpaca.glb', scale: 0.2, anim: 'Idle' },
  };
  const chosenPet = petMap[petId];

  return (
    <group>
      {/* Proportioned Hats for ~1.70m Polyfork Character Head */}
      {hatId === 'chef' && (
        <group position={[0, 1.72, 0]}>
          <mesh>
            <cylinderGeometry args={[0.14, 0.12, 0.12, 18]} />
            <meshStandardMaterial color="#ffffff" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.11, 0]}>
            <sphereGeometry args={[0.17, 18, 18]} />
            <meshStandardMaterial color="#ffffff" roughness={0.5} />
          </mesh>
        </group>
      )}
      {hatId === 'boba_crown' && (
        <mesh position={[0, 1.74, 0]}>
          <cylinderGeometry args={[0.15, 0.11, 0.12, 8]} />
          <meshStandardMaterial color="#facc15" roughness={0.2} metalness={0.65} />
        </mesh>
      )}
      {hatId === 'alien_antenna' && (
        <group position={[0, 1.74, 0]}>
          <mesh position={[-0.07, 0.08, 0]} rotation={[0, 0, 0.25]}>
            <cylinderGeometry args={[0.012, 0.012, 0.18, 8]} />
            <meshStandardMaterial color="#22c55e" roughness={0.4} />
          </mesh>
          <mesh position={[-0.1, 0.18, 0]}>
            <sphereGeometry args={[0.038, 12, 12]} />
            <meshBasicMaterial color="#4ade80" />
          </mesh>
          <mesh position={[0.07, 0.08, 0]} rotation={[0, 0, -0.25]}>
            <cylinderGeometry args={[0.012, 0.012, 0.18, 8]} />
            <meshStandardMaterial color="#22c55e" roughness={0.4} />
          </mesh>
          <mesh position={[0.1, 0.18, 0]}>
            <sphereGeometry args={[0.038, 12, 12]} />
            <meshBasicMaterial color="#4ade80" />
          </mesh>
        </group>
      )}
      {hatId === 'halo' && (
        <mesh position={[0, 1.84, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.18, 0.02, 12, 24]} />
          <meshBasicMaterial color="#fde047" />
        </mesh>
      )}

      {chosenPet && (
        <AnimatedAnimal3D
          path={chosenPet.path}
          anim={chosenPet.anim}
          scale={chosenPet.scale}
          position={[0.72, 0, 0.15]}
        />
      )}
    </group>
  );
}

// Hired Cafe Staff using real Polyfork Waiter/Chef GLB with native Walk/Idle!
function WalkingCafeStaff({ basePos, idx }) {
  const ref = useRef();
  const isBehindCounter = idx % 2 === 0;

  useFrame((state) => {
    if (!ref.current || isBehindCounter) return;
    const t = state.clock.getElapsedTime();
    const offset = Math.sin(t * 0.85 + idx * 1.7) * 1.4;
    const dir = Math.cos(t * 0.85 + idx * 1.7);
    ref.current.position.z = basePos[2] + offset;
    ref.current.rotation.y = dir >= 0 ? 0 : Math.PI;
  });

  return (
    <group ref={ref} position={basePos}>
      <AnimatedCharacter3D
        path={isBehindCounter ? '/models/anime/anime_girl_b.vrm' : '/models/anime/anime_vita.vrm'}
        anim={isBehindCounter ? 'idle' : 'walk'}
        scale={1.0}
      />
    </group>
  );
}

// Strolling Citizens Outside on Blossom Cafe Sidewalk
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

// Real Polyfork Parisian Bistro Table Set (Table H=0.75m, Chairs, Plant, Lantern, Menu, Takeaway Cup!)
function PolyforkBistroTableSet({ position, withCup = true }) {
  return (
    <group position={position}>
      <ModelGLB path="/models/cafe/bistro_table.glb" position={[0, 0, 0]} scale={1.08} />
      <ModelGLB path="/models/cafe/bistro_chair.glb" position={[-0.68, 0, 0]} rotation={[0, Math.PI / 2, 0]} scale={1.02} />
      <ModelGLB path="/models/cafe/bistro_chair.glb" position={[0.68, 0, 0]} rotation={[0, -Math.PI / 2, 0]} scale={1.02} />
      <ModelGLB path="/models/cafe/table_plant.glb" position={[0.14, 0.81, -0.14]} scale={1.0} />
      <ModelGLB path="/models/cafe/table_lantern.glb" position={[-0.16, 0.81, -0.12]} scale={1.0} />
      <ModelGLB path="/models/cafe/table_menu.glb" position={[0.02, 0.81, 0.16]} rotation={[0, 0.3, 0]} scale={1.0} />
      {withCup && (
        <ModelGLB path="/models/cafe/takeaway_cup.glb" position={[-0.14, 0.81, 0.14]} scale={1.15} />
      )}
    </group>
  );
}

// Customer Standing in Queue Facing the Barista (-Z)
function CustomerQueueItem({ customer, index, isFront, onSelect }) {
  const zPos = 1.05 + index * 1.35;
  const xPos = index === 0 ? 0 : index % 2 === 1 ? -0.58 : 0.58;

  return (
    <group position={[xPos, 0, zPos]}>
      <AnimatedCharacter3D
        path={customer.model}
        anim="idle"
        scale={1.0}
        rotation={[0, Math.PI, 0]}
        onClick={() => onSelect(customer.uid)}
      />

      {/* Soft Pink Selection Ring Under Front Customer */}
      {isFront && (
        <mesh position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.36, 0.45, 32]} />
          <meshBasicMaterial color="#ff8fab" />
        </mesh>
      )}
    </group>
  );
}

// Real Polyfork Modern Cafe Barista Counter (3x counter.glb + Espresso + Pastry + Topping Case + Hero Cup!)
function PolyforkBaristaCounter({ sealerLv, autoLv, accentHex }) {
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
      const timer = setTimeout(() => setIsPouringAnim(false), 550);
      return () => clearTimeout(timer);
    }
  }, [currentCup.tea, currentCup.milk, currentCup.isPoured]);

  useEffect(() => {
    if (!shakerRef.current || currentCup.shakeProgress === 0) return;
    gsap.killTweensOf(shakerRef.current.position);
    gsap.killTweensOf(shakerRef.current.rotation);
    const tl = gsap.timeline();
    tl.to(shakerRef.current.position, { y: 1.32, x: 0.52, duration: 0.08, ease: 'power2.out' })
      .to(shakerRef.current.rotation, { z: -0.34, x: 0.18, duration: 0.08 }, 0)
      .to(shakerRef.current.position, { y: 1.07, x: 0.45, duration: 0.1, ease: 'bounce.out' })
      .to(shakerRef.current.rotation, { z: 0.24, x: -0.1, duration: 0.08 }, 0.08)
      .to(shakerRef.current.rotation, { z: 0, x: 0, duration: 0.12 });
  }, [currentCup.shakeProgress]);

  useEffect(() => {
    if (!cupHolderRef.current || !sealerHeadRef.current) return;
    if (currentCup.isPoured && !currentCup.isSealed) {
      gsap.to(cupHolderRef.current.position, { x: -0.85, duration: 0.26, ease: 'power2.inOut' });
      gsap.to(sealerHeadRef.current.position, {
        y: 0.24,
        duration: 0.18,
        delay: 0.14,
        yoyo: true,
        repeat: 1,
      });
    } else {
      gsap.to(cupHolderRef.current.position, { x: 0, duration: 0.32, ease: 'back.out(1.4)' });
    }
  }, [currentCup.isPoured, currentCup.isSealed]);

  useFrame((_, delta) => {
    if (thrownCupRef.current && angrySplat) {
      thrownCupRef.current.position.z -= delta * 7.8;
      thrownCupRef.current.rotation.x += delta * 12;
    } else if (thrownCupRef.current) {
      thrownCupRef.current.position.set(0, 1.3, 1.55);
      thrownCupRef.current.rotation.set(0, 0, 0);
    }
  });

  // Polyfork counter.glb height is exact 0.95m!
  return (
    <group position={[0, 0, -1.65]}>
      {/* 1. REAL POLYFORK MODULAR CAFE COUNTER (6.0m wide × 0.95m tall) */}
      <ModelGLB path="/models/cafe/counter.glb" position={[-2.0, 0, 0]} scale={[1.0, 1.0, 1.25]} />
      <ModelGLB path="/models/cafe/counter.glb" position={[0, 0, 0]} scale={[1.0, 1.0, 1.25]} />
      <ModelGLB path="/models/cafe/counter.glb" position={[2.0, 0, 0]} scale={[1.0, 1.0, 1.25]} />

      {/* Freestanding Real Polyfork Glass Pastry Case (Left) & Chilled Topping Case (Right) */}
      <ModelGLB path="/models/cafe/pastry_case.glb" position={[-3.78, 0, 0.05]} scale={1.0} />
      <ModelGLB path="/models/cafe/topping_case.glb" position={[3.68, 0.24, 0.02]} scale={0.96} />

      {/* Real Polyfork Countertop Props: POS Terminal, Cake Stand, Milk Pitcher, Serving Tray, Tea Urn */}
      <ModelGLB path="/models/cafe/pos.glb" position={[-1.65, 1.0, 0.06]} rotation={[0, Math.PI, 0]} scale={1.05} />
      <ModelGLB path="/models/cafe/cake_stand.glb" position={[-2.42, 0.95, 0.05]} scale={1.05} />
      <ModelGLB path="/models/cafe/serving_tray.glb" position={[-0.48, 0.95, 0.14]} scale={0.82} />
      <ModelGLB path="/models/cafe/milk_pitcher.glb" position={[0.3, 0.95, -0.18]} scale={1.15} />
      <ModelGLB path="/models/cafe/tea_urn.glb" position={[2.68, 0.95, -0.12]} scale={0.95} />

      {/* 2. LIVE 3D STOCK TEA DISPENSERS (Shows Real Remaining Tea Levels!) */}
      {TEA_BASES.slice(0, 5).map((tea, idx) => {
        const x = 2.28 - idx * 0.24;
        const selected = currentCup.tea === tea.id;
        const stock = inventory[tea.id] ?? 0;
        const fillRatio = Math.max(0.06, Math.min(1, stock / maxCap));
        return (
          <group key={tea.id} position={[x, 0.95, -0.22]}>
            <mesh position={[0, 0.04, 0]} castShadow>
              <cylinderGeometry args={[0.088, 0.095, 0.08, 18]} />
              <meshStandardMaterial color="#334155" metalness={0.45} roughness={0.35} />
            </mesh>
            <mesh position={[0, 0.18, 0]}>
              <cylinderGeometry args={[0.086, 0.086, 0.2, 20, 1, true]} />
              <meshStandardMaterial color="#f0f9ff" transparent opacity={0.28} roughness={0.08} depthWrite={false} />
            </mesh>
            {stock > 0 && (
              <mesh position={[0, 0.08 + 0.095 * fillRatio, 0]} scale={[1, fillRatio, 1]}>
                <cylinderGeometry args={[0.08, 0.08, 0.19, 18]} />
                <meshStandardMaterial
                  color={tea.milkColor}
                  roughness={0.22}
                  emissive={selected ? tea.color : '#000000'}
                  emissiveIntensity={selected ? 0.35 : 0}
                />
              </mesh>
            )}
            <mesh position={[0, 0.04, 0.096]}>
              <sphereGeometry args={[0.014, 10, 10]} />
              <meshBasicMaterial color={stock === 0 ? '#ef4444' : stock <= 2 ? '#f59e0b' : '#4ade80'} />
            </mesh>
            <mesh position={[0, 0.29, 0]}>
              <cylinderGeometry args={[0.092, 0.092, 0.025, 18]} />
              <meshStandardMaterial color="#f8fafc" metalness={0.6} roughness={0.22} />
            </mesh>
          </group>
        );
      })}

      {/* 3. SLEEK CHROME SHAKER & RAPIER PHYSICS PEARL JAR */}
      <group
        ref={shakerRef}
        position={[0.45, 1.07, 0.12]}
        onClick={() => {
          if (currentCup.step === 5) shakeShaker(34);
        }}
      >
        <mesh castShadow>
          <cylinderGeometry args={[0.085, 0.065, 0.22, 22]} />
          <meshStandardMaterial
            color={currentCup.isServingAnim ? '#f472b6' : '#e2e8f0'}
            metalness={0.78}
            roughness={0.18}
          />
        </mesh>
        <mesh position={[0, 0.145, 0]}>
          <cylinderGeometry args={[0.042, 0.082, 0.07, 22]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.82} roughness={0.14} />
        </mesh>
      </group>

      {IS_MOBILE_DEVICE ? (
        <LightweightPearlJar position={[0.82, 0.95, 0.12]} />
      ) : (
        <Suspense fallback={null}>
          <group scale={0.62} position={[0.82, 0.95, 0.12]}>
            <RapierBobaPhysics position={[0, 0, 0]} />
          </group>
        </Suspense>
      )}

      {/* 4. PASTEL PEDESTAL & HERO 3D BOBA CUP */}
      <mesh position={[0, 1.0, 0.12]} castShadow>
        <cylinderGeometry args={[0.19, 0.22, 0.09, 28]} />
        <meshStandardMaterial color={accentHex} roughness={0.38} />
      </mesh>
      <mesh position={[0, 1.05, 0.12]}>
        <cylinderGeometry args={[0.17, 0.17, 0.015, 28]} />
        <meshStandardMaterial color="#fff5f7" roughness={0.32} />
      </mesh>
      <group ref={cupHolderRef} position={[0, 1.29, 0.12]}>
        <BobaCup3D cup={currentCup} scale={0.275} isPouring={isPouringAnim} />
      </group>

      {/* 5. CUTE COMPACT PASTEL CUP SEALER MACHINE */}
      <group position={[-0.85, 0.95, 0.12]}>
        <RoundedBox args={[0.34, 0.04, 0.36]} radius={0.015} position={[0, 0.02, 0]} castShadow>
          <meshStandardMaterial
            color={sealerLv === 0 ? '#f472b6' : '#fbbf24'}
            metalness={0.35}
            roughness={0.3}
          />
        </RoundedBox>
        <mesh position={[-0.14, 0.23, -0.05]} castShadow>
          <boxGeometry args={[0.036, 0.42, 0.16]} />
          <meshStandardMaterial color="#fff1f5" roughness={0.35} />
        </mesh>
        <mesh position={[0.14, 0.23, -0.05]} castShadow>
          <boxGeometry args={[0.036, 0.42, 0.16]} />
          <meshStandardMaterial color="#fff1f5" roughness={0.35} />
        </mesh>
        <RoundedBox args={[0.36, 0.13, 0.24]} radius={0.025} position={[0, 0.44, -0.02]} castShadow>
          <meshStandardMaterial color={sealerLv === 0 ? '#ec4899' : '#eab308'} roughness={0.32} />
        </RoundedBox>
        <mesh position={[-0.07, 0.44, 0.102]}>
          <planeGeometry args={[0.11, 0.045]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0.08, 0.44, 0.103]}>
          <circleGeometry args={[0.018, 14]} />
          <meshBasicMaterial color="#4ade80" />
        </mesh>
        <mesh position={[0, 0.55, -0.02]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.05, 0.18, 20]} />
          <meshStandardMaterial color="#fbcfe8" roughness={0.3} />
        </mesh>
        <mesh ref={sealerHeadRef} position={[0, 0.34, 0.02]}>
          <cylinderGeometry args={[0.105, 0.11, 0.055, 20]} />
          <meshStandardMaterial color="#38bdf8" metalness={0.45} roughness={0.25} />
        </mesh>
      </group>

      {/* 6. REAL POLYFORK BACK BAR (Shelves, Espresso Machine, Drinks Fridges, Menu Boards, Neon Sign!) */}
      <group position={[0, 0, -2.55]}>
        <ModelGLB path="/models/cafe/back_shelf.glb" position={[-2.0, 0, -0.35]} scale={1.0} />
        <ModelGLB path="/models/cafe/back_shelf.glb" position={[0, 0, -0.35]} scale={1.0} />
        <ModelGLB path="/models/cafe/back_shelf.glb" position={[2.0, 0, -0.35]} scale={1.0} />

        {/* Real Polyfork Espresso / Tea Extractor Machine */}
        <ModelGLB path="/models/cafe/espresso.glb" position={[-1.4, 1.04, -0.22]} scale={1.0} />

        {/* Auto-Brewers when upgraded */}
        {autoLv > 0 &&
          Array.from({ length: Math.min(autoLv, 2) }, (_, idx) => (
            <ModelGLB
              key={`auto_${idx}`}
              path="/models/cafe/espresso.glb"
              position={[0.6 + idx * 1.1, 1.04, -0.22]}
              scale={0.9}
            />
          ))}

        {/* Tall Commercial Drinks Fridges */}
        <ModelGLB path="/models/cafe/drinks_fridge.glb" position={[-3.68, 0, -0.25]} scale={1.0} />
        <ModelGLB path="/models/cafe/drinks_fridge.glb" position={[3.68, 0, -0.25]} scale={1.0} />

        {/* Hanging Menu Boards & Glowing Neon Sign on Back Wall */}
        <ModelGLB path="/models/cafe/menu_board.glb" position={[-1.8, 0.95, -0.95]} scale={1.0} />
        <ModelGLB path="/models/cafe/menu_board.glb" position={[1.8, 0.95, -0.95]} scale={1.0} />
        <ModelGLB path="/models/cafe/neon_sign.glb" position={[0, 0.95, -0.92]} scale={1.15} />

        <pointLight position={[0, 2.75, 0.8]} intensity={0.85} distance={10} color="#fff1e6" />
      </group>

      <FloatingCoins3D triggerKey={totalCupsServed} origin={[0, 1.35, 2.1]} />

      <group ref={thrownCupRef} position={[0, 1.3, 1.55]} visible={!!angrySplat}>
        <BobaCup3D
          cup={{ tea: 'black_tea', milk: 100, toppings: ['pearl'], isSealed: true }}
          scale={0.25}
        />
      </group>

      {lastServeResult?.isSuccess && (
        <mesh position={[0, 0.96, 0.3]} rotation={[-Math.PI / 2, 0, 0]}>
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
  const shopTheme = useGameStore((s) => s.shopTheme || 'sakura');
  const upgrades = useGameStore((s) => s.upgrades);
  const character = useGameStore((s) => s.character);
  const customers = useGameStore((s) => s.customers);
  const selectedCustomerUid = useGameStore((s) => s.selectedCustomerUid);
  const selectCustomerAndCraft = useGameStore((s) => s.selectCustomerAndCraft);
  const petCafeAnimal = useGameStore((s) => s.petCafeAnimal);

  const cameraTarget = useGameStore((s) => s.cameraTarget);
  const isCraftingMode = sceneMode === 'crafting';
  const showFrontGlassWall = isCraftingMode || cameraTarget === 'counter';
  const theme = SHOP_THEMES[shopTheme] || SHOP_THEMES.sakura;
  const floorTex = useMemo(() => getFloorTexture(shopTheme), [shopTheme]);
  const wallTex = useMemo(() => getWallTexture(shopTheme), [shopTheme]);

  const expandLv = upgrades.expand_shop || 0;
  const furnLv = upgrades.furniture_set || 2;
  const autoLv = upgrades.auto_brewer || 0;
  const staffLv = upgrades.hire_staff || 0;
  const vipLv = upgrades.vip_zone || 0;
  const roofLv = upgrades.rooftop_floor || 0;
  const sealerLv = upgrades.sealer_pro || 0;

  const floorWidth = 12.2 + expandLv * 2.4;
  const floorDepth = 12.0 + expandLv * 1.6;

  const activeOutfit =
    CHARACTER_OUTFITS.models.find((m) => m.id === character.modelId) || CHARACTER_OUTFITS.models[0];

  const orderedCustomers = [...customers].sort((a, b) => {
    if (a.uid === selectedCustomerUid) return -1;
    if (b.uid === selectedCustomerUid) return 1;
    return 0;
  });

  return (
    <group>
      {/* 1. DREAMY JAPANESE / EUROPEAN CAFE STREET OUTSIDE (+Z) */}
      <mesh receiveShadow position={[0, -0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color={shopTheme === 'seoul' ? '#2c3e35' : '#8ec695'} roughness={0.92} />
      </mesh>
      <mesh receiveShadow position={[0, -0.05, floorDepth / 2 + 2.0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[56, 4.0]} />
        <meshStandardMaterial color={shopTheme === 'seoul' ? '#4a4458' : '#efe5dc'} roughness={0.85} />
      </mesh>
      <mesh receiveShadow position={[0, -0.04, floorDepth / 2 + 6.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[56, 4.4]} />
        <meshStandardMaterial color="#475569" roughness={0.88} />
      </mesh>
      {[-12, -6, 0, 6, 12].map((rx) => (
        <mesh key={rx} position={[rx, -0.03, floorDepth / 2 + 6.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.4, 0.22]} />
          <meshBasicMaterial color="#f1f5f9" />
        </mesh>
      ))}

      {/* Real Polyfork Lush Sakura Trees, Planter Boxes, Cute Scooter & Bicycle! */}
      <ModelGLB path="/models/cafe/sakura_tree.glb" position={[-7.8, 0, floorDepth / 2 + 2.6]} scale={1.08} castShadow={false} />
      <ModelGLB path="/models/cafe/sakura_tree.glb" position={[7.8, 0, floorDepth / 2 + 2.6]} scale={1.12} castShadow={false} />
      <ModelGLB path="/models/cafe/planter_box.glb" position={[-3.4, 0, floorDepth / 2 + 0.72]} scale={0.95} />
      <ModelGLB path="/models/cafe/planter_box.glb" position={[3.4, 0, floorDepth / 2 + 0.72]} scale={0.95} />
      <ModelGLB path="/models/cafe/scooter.glb" position={[-5.1, 0, floorDepth / 2 + 2.1]} rotation={[0, 0.65, 0]} scale={1.0} />
      <ModelGLB path="/models/cafe/bicycle.glb" position={[5.2, 0, floorDepth / 2 + 2.0]} rotation={[0, -0.5, 0]} scale={1.0} />

      {/* Japanese Shophouses Across the Street */}
      <ModelGLB path="/models/cafe/jp_shophouse.glb" position={[-8.2, 0, floorDepth / 2 + 11.4]} rotation={[0, Math.PI, 0]} scale={0.95} castShadow={false} />
      <ModelGLB path="/models/cafe/jp_shophouse.glb" position={[0, 0, floorDepth / 2 + 11.6]} rotation={[0, Math.PI, 0]} scale={0.95} castShadow={false} />
      <ModelGLB path="/models/cafe/jp_shophouse.glb" position={[8.2, 0, floorDepth / 2 + 11.4]} rotation={[0, Math.PI, 0]} scale={0.95} castShadow={false} />

      {/* Strolling Anime Citizens Outside (Desktop only to protect Mobile VRAM & 60 FPS!) */}
      {!IS_MOBILE_DEVICE && (
        <>
          <StrollingStreetPedestrian
            modelPath="/models/anime/anime_vita.vrm"
            startX={-8}
            z={floorDepth / 2 + 2.4}
            speed={1.45}
          />
          <StrollingStreetPedestrian
            modelPath="/models/anime/anime_girl_b.vrm"
            startX={7}
            z={floorDepth / 2 + 3.0}
            speed={-1.35}
          />
        </>
      )}

      {/* 2. PBR TEXTURED CAFE FLOOR, STRIPED WAINSCOT WALLS & REAL GLASS STOREFRONT */}
      <RoundedBox
        args={[floorWidth, 0.14, floorDepth]}
        radius={0.05}
        position={[0, -0.02, 0]}
        receiveShadow
      >
        <meshStandardMaterial map={floorTex} roughness={0.62} />
      </RoundedBox>

      {/* Cozy Pastel Entry Runner Rug */}
      <mesh receiveShadow position={[0, 0.054, 2.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.1, 4.4]} />
        <meshStandardMaterial color={theme.carpetColor} roughness={0.85} />
      </mesh>

      {/* Back & Left Boutique Textured Walls */}
      <RoundedBox
        args={[floorWidth, 4.0, 0.32]}
        radius={0.05}
        position={[0, 2.0, -floorDepth / 2]}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial map={wallTex} roughness={0.76} />
      </RoundedBox>
      <RoundedBox
        args={[0.32, 4.0, floorDepth]}
        radius={0.05}
        position={[-floorWidth / 2, 2.0, 0]}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial map={wallTex} roughness={0.76} />
      </RoundedBox>

      {/* Real Polyfork Wall Lamps & Cozy Hanging Decor */}
      <ModelGLB path="/models/cafe/wall_lamp.glb" position={[-floorWidth / 2 + 0.25, 0.4, -1.6]} rotation={[0, Math.PI / 2, 0]} scale={1.05} />
      <ModelGLB path="/models/cafe/wall_lamp.glb" position={[-floorWidth / 2 + 0.25, 0.4, 2.0]} rotation={[0, Math.PI / 2, 0]} scale={1.05} />
      <ModelGLB path="/models/cafe/hanging_plant.glb" position={[-3.2, 3.65, -2.1]} scale={0.95} castShadow={false} />
      <ModelGLB path="/models/cafe/hanging_plant.glb" position={[3.2, 3.65, -2.1]} scale={0.95} castShadow={false} />
      {showFrontGlassWall && (
        <>
          <ModelGLB path="/models/cafe/string_lights.glb" position={[-2.2, 3.45, 2.2]} scale={1.1} castShadow={false} />
          <ModelGLB path="/models/cafe/string_lights.glb" position={[2.2, 3.45, 2.2]} scale={1.1} castShadow={false} />
        </>
      )}

      {/* Dollhouse Cutaway: Glass Storefront & Awnings visible in Barista POV (open unobstructed view in Overview!) */}
      {showFrontGlassWall && (
        <group position={[0, 0, floorDepth / 2]}>
          <ModelGLB path="/models/cafe/shopfront_glass.glb" position={[-4.0, 0, 0]} scale={1.0} />
          <ModelGLB path="/models/cafe/shopfront_glass.glb" position={[-2.0, 0, 0]} scale={1.0} />
          <ModelGLB path="/models/cafe/shopfront_glass.glb" position={[2.0, 0, 0]} scale={1.0} />
          <ModelGLB path="/models/cafe/shopfront_glass.glb" position={[4.0, 0, 0]} scale={1.0} />
          <ModelGLB path="/models/cafe/awning.glb" position={[-3.0, 0.1, 0.35]} scale={[1.35, 1, 1]} />
          <ModelGLB path="/models/cafe/awning.glb" position={[0, 0.1, 0.35]} scale={[1.35, 1, 1]} />
          <ModelGLB path="/models/cafe/awning.glb" position={[3.0, 0.1, 0.35]} scale={[1.35, 1, 1]} />
        </group>
      )}

      {/* Subtle Warm Seoul Night Glow */}
      {shopTheme === 'seoul' && (
        <>
          <pointLight position={[-2.5, 3.1, 1.5]} intensity={1.1} distance={9} color="#f472b6" />
          <pointLight position={[2.5, 3.1, 1.5]} intensity={1.1} distance={9} color="#fbbf24" />
        </>
      )}

      {!isCraftingMode && (
        <Banner3D position={[0, 4.25, -floorDepth / 2 + 0.3]} color={theme.accentHex} size="lg" distanceFactor={13}>
          🧋 {shopName.toUpperCase()}
        </Banner3D>
      )}

      {/* 3. REAL POLYFORK BARISTA COUNTER */}
      <PolyforkBaristaCounter sealerLv={sealerLv} autoLv={autoLv} accentHex={theme.accentHex} />

      {/* 4. SHOP OWNER BEHIND COUNTER FACING CUSTOMERS (+Z) */}
      <AnimatedCharacter3D
        path={activeOutfit.path}
        anim="idle"
        scale={1.0}
        position={isCraftingMode ? [2.15, 0, -2.75] : [0.2, 0, -2.75]}
        rotation={[0, 0, 0]}
      >
        <PlayerAccessories3D hatId={character.hatId} petId={character.petId} />
      </AnimatedCharacter3D>

      {/* 5. HIRED ANIME CAFE STAFF (Capped to 2 on mobile for steady 60 FPS) */}
      {staffLv > 0 &&
        Array.from({ length: Math.min(staffLv, IS_MOBILE_DEVICE ? 2 : 4) }, (_, idx) => (
          <WalkingCafeStaff
            key={`staff_${idx}`}
            idx={idx}
            basePos={idx % 2 === 0 ? [-1.85, 0, -2.75] : [2.35, 0, 2.2]}
          />
        ))}

      {/* 6. REAL POLYFORK BISTRO DINING TABLES */}
      {[
        { pos: [-3.55, 0, 1.25] },
        { pos: [3.55, 0, 1.25] },
        { pos: [-3.55, 0, 3.55] },
        { pos: [3.55, 0, 3.55] },
      ]
        .slice(0, furnLv)
        .map((cfg, idx) => (
          <PolyforkBistroTableSet key={`table_${idx}`} position={cfg.pos} />
        ))}

      {/* Lush Potted Olive Trees & Interactive Pettable 3D Cafe Cat & Dog! */}
      <ModelGLB path="/models/cafe/olive_tree.glb" position={[-floorWidth / 2 + 0.95, 0, -floorDepth / 2 + 0.95]} scale={0.95} />
      <ModelGLB path="/models/cafe/olive_tree.glb" position={[floorWidth / 2 - 0.95, 0, -floorDepth / 2 + 0.95]} scale={0.95} />
      <ModelGLB path="/models/cafe/olive_tree.glb" position={[-floorWidth / 2 + 0.95, 0, floorDepth / 2 - 1.05]} scale={0.9} />

      {/* Clickable Lounging Cafe Cat (Meow + Coins!) */}
      <AnimatedAnimal3D
        path="/models/cafe/pet_cat.glb"
        anim="Lounge"
        scale={1.38}
        position={[-1.65, 0.06, 2.2]}
        rotation={[0, 0.65, 0]}
        onClick={() => petCafeAnimal('Bé Mèo Mướp')}
      />
      {furnLv >= 2 && (
        <AnimatedAnimal3D
          path="/models/cafe/pet_dog.glb"
          anim="Idle"
          scale={0.88}
          position={[1.75, 0.05, 2.65]}
          rotation={[0, -0.6, 0]}
          onClick={() => petCafeAnimal('Cún Bông Cafe')}
        />
      )}

      {/* 7. VIP ROYAL SOFA LOUNGE (Real Polyfork Sofa Bench + Booth Divider!) */}
      {vipLv > 0 && (
        <group position={[floorWidth / 2 - 2.15, 0.05, -0.5]}>
          <ModelGLB path="/models/cafe/booth_divider.glb" position={[0, 0, -1.25]} scale={1.15} />
          <ModelGLB path="/models/cafe/sofa_bench.glb" position={[0.4, 0, 0]} rotation={[0, -Math.PI / 2, 0]} scale={0.95} />
          <ModelGLB path="/models/cafe/bistro_table.glb" position={[-0.45, 0, 0]} scale={1.05} />
          <ModelGLB path="/models/cafe/table_lantern.glb" position={[-0.45, 0.8, 0]} scale={1.1} />
          {!isCraftingMode && (
            <Banner3D position={[0, 2.15, -1.1]} color="#facc15" distanceFactor={11}>
              👑 KHU VỰC VIP
            </Banner3D>
          )}
        </group>
      )}

      {/* 8. 2ND FLOOR SKY GARDEN ROOFTOP (Real Polyfork Pergola + Parasols + Bistro Tables!) */}
      {roofLv > 0 && !isCraftingMode && (
        <group position={[0, 4.02, -1.4]}>
          <RoundedBox args={[floorWidth * 0.72, 0.22, floorDepth * 0.54]} radius={0.05} receiveShadow castShadow>
            <meshStandardMaterial color="#e6ccb2" roughness={0.68} />
          </RoundedBox>
          <mesh position={[0, 0.52, (floorDepth * 0.54) / 2]}>
            <boxGeometry args={[floorWidth * 0.72, 0.85, 0.07]} />
            <meshStandardMaterial color="#bae6fd" transparent opacity={0.32} roughness={0.1} />
          </mesh>
          <ModelGLB path="/models/cafe/pergola.glb" position={[0, 0.11, -0.3]} scale={[1.6, 0.9, 1.3]} />
          <ModelGLB path="/models/cafe/parasol.glb" position={[-2.1, 0.11, 0.2]} scale={0.85} />
          <ModelGLB path="/models/cafe/parasol.glb" position={[2.1, 0.11, 0.2]} scale={0.85} />
          <PolyforkBistroTableSet position={[-2.1, 0.11, 0.2]} />
          <PolyforkBistroTableSet position={[2.1, 0.11, 0.2]} />
        </group>
      )}

      {/* 9. STUDIO VROID ANIME CUSTOMER QUEUE (Max 3 visible at once on mobile for fast GPU frame time) */}
      {(IS_MOBILE_DEVICE ? orderedCustomers.slice(0, 3) : orderedCustomers).map((c, idx) => (
        <CustomerQueueItem
          key={c.uid}
          customer={c}
          index={idx}
          isFront={idx === 0}
          onSelect={selectCustomerAndCraft}
        />
      ))}

      {/* 10. ALIEN EMERGENCY UFO VISIT 👽 */}
      <AlienUFO3D />
    </group>
  );
}
