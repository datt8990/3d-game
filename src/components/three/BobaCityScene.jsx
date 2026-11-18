import React, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
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

function WanderingOnlineCitizen({ bot, idx, isParty }) {
  const ref = useRef();
  const radius = 4.4 + (idx % 4) * 1.8;
  const speed = 0.34 + (idx % 3) * 0.11;
  const phase = (idx / ONLINE_BOT_PLAYERS.length) * Math.PI * 2;
  const addFriend = useGameStore((s) => s.addFriend);

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
        addFriend(bot.name);
      }}
    >
      <AnimatedCharacter3D path={bot.model} anim={isParty ? 'wave' : 'walk'} scale={1.0} />
    </group>
  );
}

export default function BobaCityScene() {
  const playerName = useGameStore((s) => s.playerName);
  const level = useGameStore((s) => s.level);
  const character = useGameStore((s) => s.character);
  const partyTimeLeft = useGameStore((s) => s.onlineState.partyTimeLeft);
  const buyBobaFromOtherShop = useGameStore((s) => s.buyBobaFromOtherShop);

  const playerRef = useRef();
  const partyOrbsRef = useRef();
  const keysRef = useRef({});
  const targetPointRef = useRef(new THREE.Vector3(0, 0, 3.8));
  const [peerList, setPeerList] = useState([]);
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
        <Banner3D position={[0, 3.85, 0]} color="#ff8fab" />
      </group>

      {CITY_OTHER_SHOPS.map((shop) => (
        <group
          key={shop.id}
          position={shop.position}
          onClick={(e) => {
            e.stopPropagation();
            buyBobaFromOtherShop(shop);
          }}
        >
          <ModelGLB path={shop.buildingModel} scale={1.38} />
          <ModelGLB path="/models/furniture/tableRound.glb" position={[0, 0, 3.2]} scale={1.9} />
          <ModelGLB path="/models/food/frappe.glb" position={[0, 0.71, 3.2]} scale={0.42} />
        </group>
      ))}

      {ONLINE_BOT_PLAYERS.map((bot, idx) => (
        <WanderingOnlineCitizen
          key={bot.id}
          bot={bot}
          idx={idx}
          isParty={partyTimeLeft > 0}
        />
      ))}

      {peerList.map((peer) => (
        <group key={peer.tabId} position={[peer.x, 0, peer.z]} rotation={[0, peer.rotY, 0]}>
          <AnimatedCharacter3D path={peer.modelPath} anim="walk" scale={1.0} />
        </group>
      ))}

      {/* Controllable Local Player Avatar with Golden Ring Marker Under Feet */}
      <group ref={playerRef} position={[0, 0, 3.8]}>
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.38, 0.48, 28]} />
          <meshBasicMaterial color="#fb6f92" />
        </mesh>
        <AnimatedCharacter3D
          presetKey={character.modelId}
          path={activeOutfit.path}
          anim={partyTimeLeft > 0 ? 'wave' : isPlayerMoving ? 'run' : 'idle'}
          scale={1.05}
        >
          <PlayerAccessories3D hatId={character.hatId} petId={character.petId} />
        </AnimatedCharacter3D>
      </group>

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
