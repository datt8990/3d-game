import React, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import {
  CITY_OTHER_SHOPS,
  ONLINE_BOT_PLAYERS,
  CHARACTER_OUTFITS,
  getTierForLevel,
} from '../../data/gameData';
import { netSync } from '../../store/multiplayerSync';
import ModelGLB from './ModelGLB';
import BobaCup3D from './BobaCup3D';
import { PlayerAccessories3D } from './BobaShopScene';
import Banner3D from './Banner3D';
import AnimatedCharacter3D, { AnimatedAnimal3D } from './AnimatedCharacter3D';

function WanderingOnlineCitizen({ bot, idx, isParty, onSelectBot, isSelected }) {
  const ref = useRef();
  const radius = 4.4 + (idx % 4) * 1.8;
  const speed = 0.34 + (idx % 3) * 0.11;
  const phase = (idx / ONLINE_BOT_PLAYERS.length) * Math.PI * 2;

  const addFriend = useGameStore((s) => s.addFriend);
  const sendGiftToPlayer = useGameStore((s) => s.sendGiftToPlayer);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (!ref.current) return;
    const angle = t * speed + phase;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const jumpY = isParty ? Math.abs(Math.sin(t * 7 + idx)) * 0.38 : 0;
    ref.current.position.set(x, jumpY, z);
    ref.current.rotation.y = -angle + Math.PI;
  });

  return (
    <group
      ref={ref}
      onClick={(e) => {
        e.stopPropagation();
        onSelectBot(bot.id);
      }}
    >
      <AnimatedCharacter3D
        path={bot.model}
        anim={isParty ? 'wave' : 'walk'}
        scale={1.0}
      />
      {isSelected && (
        <Html position={[0, 2.08, 0]} center>
          <div className="boba-glass px-3 py-1.5 rounded-xl text-center whitespace-nowrap pointer-events-auto shadow-xl">
            <div className="text-xs font-extrabold text-pink-300">{bot.name}</div>
            <div className="text-[10px] text-amber-200 mb-1">{bot.title}</div>
            <div className="flex gap-1 justify-center">
              <button
                onClick={() => addFriend(bot.name)}
                className="bg-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer"
              >
                +Kết bạn
              </button>
              <button
                onClick={() => sendGiftToPlayer(bot.name)}
                className="bg-amber-400 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer"
              >
                🎁 Tặng quà
              </button>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

export default function BobaCityScene() {
  const playerName = useGameStore((s) => s.playerName);
  const level = useGameStore((s) => s.level);
  const character = useGameStore((s) => s.character);
  const partyTimeLeft = useGameStore((s) => s.onlineState.partyTimeLeft);
  const buyBobaFromOtherShop = useGameStore((s) => s.buyBobaFromOtherShop);
  const sendGiftToPlayer = useGameStore((s) => s.sendGiftToPlayer);
  const addFriend = useGameStore((s) => s.addFriend);

  const playerRef = useRef();
  const partyOrbsRef = useRef();
  const keysRef = useRef({});
  const targetPointRef = useRef(new THREE.Vector3(0, 0, 3.8));
  const [peerList, setPeerList] = useState([]);
  const [selectedBotId, setSelectedBotId] = useState(ONLINE_BOT_PLAYERS[0].id);
  const [isPlayerMoving, setIsPlayerMoving] = useState(false);

  const activeOutfit =
    CHARACTER_OUTFITS.models.find((m) => m.id === character.modelId) || CHARACTER_OUTFITS.models[0];
  const tier = getTierForLevel(level);
  const displayTitle = character.customTitle || `${tier.badge} ${tier.title}`;

  useEffect(() => {
    const down = (e) => {
      keysRef.current[e.code] = true;
    };
    const up = (e) => {
      keysRef.current[e.code] = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    const peerTimer = setInterval(() => {
      setPeerList(Array.from(netSync.peerPlayers.values()));
    }, 350);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      clearInterval(peerTimer);
    };
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    if (partyOrbsRef.current) {
      partyOrbsRef.current.rotation.y = t * 0.9;
    }
    if (!playerRef.current) return;

    const k = keysRef.current;
    let dx = 0;
    let dz = 0;
    if (k.KeyW || k.ArrowUp) dz -= 1;
    if (k.KeyS || k.ArrowDown) dz += 1;
    if (k.KeyA || k.ArrowLeft) dx -= 1;
    if (k.KeyD || k.ArrowRight) dx += 1;

    const pos = playerRef.current.position;
    const moveSpeed = 6.2;
    let movingNow = false;

    if (dx !== 0 || dz !== 0) {
      movingNow = true;
      const len = Math.hypot(dx, dz);
      pos.x = THREE.MathUtils.clamp(pos.x + (dx / len) * moveSpeed * delta, -15, 15);
      pos.z = THREE.MathUtils.clamp(pos.z + (dz / len) * moveSpeed * delta, -14, 14);
      playerRef.current.rotation.y = Math.atan2(dx, dz);
      targetPointRef.current.copy(pos);
    } else {
      const dist = pos.distanceTo(targetPointRef.current);
      if (dist > 0.22) {
        movingNow = true;
        const dir = targetPointRef.current.clone().sub(pos).normalize();
        pos.x += dir.x * moveSpeed * delta;
        pos.z += dir.z * moveSpeed * delta;
        playerRef.current.rotation.y = Math.atan2(dir.x, dir.z);
      }
    }

    if (movingNow !== isPlayerMoving) {
      setIsPlayerMoving(movingNow);
    }

    pos.y = partyTimeLeft > 0 ? Math.abs(Math.sin(t * 8)) * 0.35 : 0;

    if (Math.floor(t * 10) % 3 === 0) {
      netSync.broadcastPosition({
        name: playerName,
        title: displayTitle,
        modelPath: activeOutfit.path,
        x: pos.x,
        z: pos.z,
        rotY: playerRef.current.rotation.y,
      });
    }
  });

  return (
    <group>
      {/* Cute Stylized Boba Land Park & Cobblestone Plaza (Tap anywhere on mobile/desktop to walk!) */}
      <mesh
        receiveShadow
        position={[0, -0.05, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerDown={(e) => {
          e.stopPropagation();
          targetPointRef.current.set(
            THREE.MathUtils.clamp(e.point.x, -15, 15),
            0,
            THREE.MathUtils.clamp(e.point.z, -14, 14)
          );
        }}
      >
        <planeGeometry args={[56, 56]} />
        <meshStandardMaterial color="#76b07d" roughness={0.9} />
      </mesh>

      <mesh
        receiveShadow
        position={[0, -0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerDown={(e) => {
          e.stopPropagation();
          targetPointRef.current.set(
            THREE.MathUtils.clamp(e.point.x, -15, 15),
            0,
            THREE.MathUtils.clamp(e.point.z, -14, 14)
          );
        }}
      >
        <circleGeometry args={[13.2, 44]} />
        <meshStandardMaterial color="#e3d5ca" roughness={0.8} />
      </mesh>

      {/* Lush Quaternius Trees, Streetlights & Cute Park Shiba/Alpaca */}
      <ModelGLB path="/models/quaternius/tree_sakura.glb" position={[-6.5, 0, -5.5]} scale={1.55} castShadow={false} />
      <ModelGLB path="/models/quaternius/tree_green.glb" position={[6.5, 0, -5.5]} scale={1.55} castShadow={false} />
      <ModelGLB path="/models/quaternius/tree_green.glb" position={[-6.5, 0, 5.5]} scale={1.55} castShadow={false} />
      <ModelGLB path="/models/quaternius/tree_sakura.glb" position={[6.5, 0, 5.5]} scale={1.55} castShadow={false} />
      <ModelGLB path="/models/quaternius/streetlight.glb" position={[-3.8, 0, -3.8]} scale={2.4} castShadow={false} />
      <ModelGLB path="/models/quaternius/streetlight.glb" position={[3.8, 0, -3.8]} scale={2.4} castShadow={false} />
      <ModelGLB path="/models/quaternius/streetlight.glb" position={[-3.8, 0, 3.8]} scale={2.4} castShadow={false} />
      <ModelGLB path="/models/quaternius/streetlight.glb" position={[3.8, 0, 3.8]} scale={2.4} castShadow={false} />
      <AnimatedAnimal3D path="/models/quaternius/pet_shiba.glb" anim="Idle_2" scale={0.24} position={[2.8, 0, 1.8]} />
      <AnimatedAnimal3D path="/models/quaternius/pet_alpaca.glb" anim="Idle" scale={0.23} position={[-2.8, 0, 1.8]} />

      {/* Central Boba Fountain Monument */}
      <group position={[0, 0, 0]}>
        <mesh receiveShadow castShadow position={[0, 0.3, 0]}>
          <cylinderGeometry args={[2.2, 2.5, 0.6, 28]} />
          <meshStandardMaterial color="#b08968" roughness={0.68} />
        </mesh>
        <mesh position={[0, 0.56, 0]}>
          <cylinderGeometry args={[1.95, 1.95, 0.16, 28]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.2} />
        </mesh>
        <BobaCup3D
          cup={{
            tea: 'oolong_tea',
            milk: 100,
            ice: 100,
            toppings: ['pearl', 'golden_boba', 'cheese_foam'],
            isSealed: true,
          }}
          position={[0, 2.1, 0]}
          scale={1.0}
          autoRotate
        />
        <Banner3D position={[0, 3.85, 0]} color="#fde047" size="lg" distanceFactor={13}>
          🏙️ THÀNH PHỐ TRÀ SỮA BOBA LAND
        </Banner3D>
      </group>

      {/* 4 Neighboring Online Players' Stylized Boba Shops */}
      {CITY_OTHER_SHOPS.map((shop) => (
        <group key={shop.id} position={shop.position}>
          <ModelGLB path={shop.buildingModel} scale={1.38} />
          <ModelGLB path="/models/furniture/tableRound.glb" position={[0, 0, 3.2]} scale={1.9} />
          <ModelGLB path="/models/food/frappe.glb" position={[0, 0.71, 3.2]} scale={0.42} />

          <Html position={[0, 4.4, 1.5]} center>
            <div className="boba-glass rounded-2xl p-2.5 w-52 text-center pointer-events-auto border border-pink-400/50 shadow-xl">
              <div className="text-xs font-extrabold text-yellow-300 truncate">{shop.shopName}</div>
              <div className="text-[10px] text-pink-200 mb-1">
                {shop.owner} • ⭐ {shop.rating}
              </div>
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => buyBobaFromOtherShop(shop)}
                  className="bg-pink-500 text-white text-[10px] font-bold py-1 px-1.5 rounded-lg hover:brightness-110 cursor-pointer"
                >
                  🧋 Mua ({shop.drinkPrice} Xu)
                </button>
                <button
                  onClick={() => sendGiftToPlayer(shop.owner)}
                  className="bg-amber-400 text-slate-950 text-[10px] font-bold py-1 px-1.5 rounded-lg hover:brightness-110 cursor-pointer"
                >
                  🎁 Tặng Quà
                </button>
              </div>
              <button
                onClick={() => addFriend(shop.owner)}
                className="mt-1 w-full bg-white/10 hover:bg-white/20 text-white text-[10px] py-0.5 rounded-lg cursor-pointer"
              >
                🤝 Kết bạn
              </button>
            </div>
          </Html>
        </group>
      ))}

      {/* Rigged Animated Online Citizens */}
      {ONLINE_BOT_PLAYERS.map((bot, idx) => (
        <WanderingOnlineCitizen
          key={bot.id}
          bot={bot}
          idx={idx}
          isParty={partyTimeLeft > 0}
          isSelected={selectedBotId === bot.id}
          onSelectBot={setSelectedBotId}
        />
      ))}

      {/* Real Cross-Tab Peer Players */}
      {peerList.map((peer) => (
        <group key={peer.tabId} position={[peer.x, 0, peer.z]} rotation={[0, peer.rotY, 0]}>
          <AnimatedCharacter3D path={peer.modelPath} anim="walk" scale={1.0} />
          <Html position={[0, 2.05, 0]} center>
            <div className="bg-emerald-600/95 border border-emerald-300 text-white px-2.5 py-0.5 rounded-full text-[11px] font-extrabold whitespace-nowrap">
              🟢 {peer.name}
            </div>
          </Html>
        </group>
      ))}

      {/* Controllable Local Player Avatar with Walk/Idle/Dance Skeletal Animations */}
      <group ref={playerRef} position={[0, 0, 3.8]}>
        <AnimatedCharacter3D
          path={activeOutfit.path}
          anim={partyTimeLeft > 0 ? 'wave' : isPlayerMoving ? 'run' : 'idle'}
          scale={1.02}
        >
          <PlayerAccessories3D hatId={character.hatId} petId={character.petId} />
        </AnimatedCharacter3D>
        <Html position={[0, 2.12, 0]} center>
          <div className="bg-gradient-to-r from-pink-600 to-purple-700 border-2 border-yellow-300 px-3 py-0.5 rounded-full text-center whitespace-nowrap shadow-lg">
            <div className="text-[11px] font-extrabold text-white">{playerName} (Bạn)</div>
          </div>
        </Html>
      </group>

      {/* Boba Party Lanterns */}
      {partyTimeLeft > 0 && (
        <group ref={partyOrbsRef} position={[0, 3.8, 0]}>
          {Array.from({ length: 24 }, (_, i) => {
            const ang = (i / 24) * Math.PI * 2;
            const r = 4 + (i % 3) * 2.8;
            const colors = ['#f472b6', '#facc15', '#38bdf8', '#4ade80'];
            return (
              <mesh key={i} position={[Math.cos(ang) * r, (i % 4) * 0.7, Math.sin(ang) * r]}>
                <sphereGeometry args={[0.2, 10, 10]} />
                <meshBasicMaterial color={colors[i % colors.length]} />
              </mesh>
            );
          })}
        </group>
      )}
    </group>
  );
}
