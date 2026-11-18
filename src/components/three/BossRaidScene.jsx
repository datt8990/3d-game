import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { ONLINE_BOT_PLAYERS } from '../../data/gameData';
import AnimatedCharacter3D from './AnimatedCharacter3D';
import Banner3D from './Banner3D';

const SHRINK_VEC = new THREE.Vector3(0.1, 0.1, 0.1);

export default function BossRaidScene() {
  const bossRaid = useGameStore((s) => s.bossRaid);
  const hitBossPearl = useGameStore((s) => s.hitBossPearl);
  const setSceneMode = useGameStore((s) => s.setSceneMode);

  const bossRef = useRef();
  const minionsRef = useRef();
  const [hitFlash, setHitFlash] = useState(false);

  const handleAttack = (dmg = 240) => {
    if (bossRaid.won) return;
    setHitFlash(true);
    hitBossPearl(dmg);
    setTimeout(() => setHitFlash(false), 110);
  };

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    if (bossRef.current) {
      if (bossRaid.won) {
        bossRef.current.scale.lerp(SHRINK_VEC, delta * 3);
      } else {
        const bounce = 2.1 + Math.abs(Math.sin(t * 3.2)) * 0.65;
        bossRef.current.position.y = bounce;
        bossRef.current.rotation.y = Math.sin(t * 1.5) * 0.45;
      }
    }
    if (minionsRef.current) {
      minionsRef.current.rotation.y += delta * 1.8;
    }
  });

  const hpPct = Math.round((bossRaid.hp / bossRaid.maxHp) * 100);

  return (
    <group>
      {/* Volcanic Boba Arena Floor */}
      <mesh receiveShadow position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[16, 48]} />
        <meshStandardMaterial color="#2a0f35" roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[5.2, 5.5, 48]} />
        <meshBasicMaterial color="#f43f5e" />
      </mesh>

      {/* GIANT KING PEARL MONSTER (BOSS TRÂN CHÂU) */}
      <group
        ref={bossRef}
        position={[0, 2.2, -1]}
        onClick={(e) => {
          e.stopPropagation();
          handleAttack(250);
        }}
      >
        <mesh castShadow>
          <sphereGeometry args={[1.85, 32, 32]} />
          <meshStandardMaterial
            color={hitFlash ? '#f43f5e' : '#1e1024'}
            emissive={hitFlash ? '#fb7185' : '#581c87'}
            emissiveIntensity={hitFlash ? 1.2 : 0.35}
            roughness={0.12}
            metalness={0.35}
          />
        </mesh>
        {/* King Crown */}
        <mesh position={[0, 1.95, 0]}>
          <cylinderGeometry args={[0.85, 0.65, 0.55, 8]} />
          <meshStandardMaterial color="#facc15" metalness={0.85} roughness={0.15} emissive="#f59e0b" emissiveIntensity={0.4} />
        </mesh>
        {/* Glowing Angry Eyes */}
        <mesh position={[-0.58, 0.35, 1.65]} rotation={[0, 0, -0.3]}>
          <boxGeometry args={[0.52, 0.2, 0.15]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} />
        </mesh>
        <mesh position={[0.58, 0.35, 1.65]} rotation={[0, 0, 0.3]}>
          <boxGeometry args={[0.52, 0.2, 0.15]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} />
        </mesh>

        {/* Orbiting Evil Tapioca Minions */}
        <group ref={minionsRef}>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const ang = (i / 6) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.cos(ang) * 2.9, -0.3, Math.sin(ang) * 2.9]}>
                <sphereGeometry args={[0.32, 16, 16]} />
                <meshStandardMaterial color="#3b0764" roughness={0.15} emissive="#a855f7" emissiveIntensity={0.4} />
              </mesh>
            );
          })}
        </group>
      </group>

      {/* Co-op Rigged Animated Online Players Attacking the Boss */}
      {ONLINE_BOT_PLAYERS.slice(0, 5).map((ally, idx) => {
        const ang = (idx / 5) * Math.PI + 0.3;
        const x = Math.cos(ang) * 5.8;
        const z = Math.sin(ang) * 4.5 + 1.5;
        return (
          <AnimatedCharacter3D
            key={ally.id}
            path={ally.model}
            anim={bossRaid.won ? 'wave' : 'angry'}
            scale={1.0}
            position={[x, 0, z]}
            rotation={[0, Math.atan2(-x, -1 - z), 0]}
          />
        );
      })}

      <Banner3D position={[0, 5.1, -1]} color="#fb7185" size="lg" distanceFactor={11}>
        👾 BOSS ĐẠI VƯƠNG TRÂN CHÂU HẮC ÁM
      </Banner3D>

      {/* Interactive Boss Raid Overlay Panel (Mobile & Desktop Responsive!) */}
      <Html position={[0, -0.2, 4.2]} center>
        <div className="w-[88vw] max-w-96 boba-glass rounded-2xl p-3 sm:p-4 text-center pointer-events-auto border-2 border-pink-400 shadow-2xl">
          <div className="flex justify-between items-center text-xs font-bold mb-1.5">
            <span className="text-rose-300">❤️ HP BOSS: {bossRaid.hp.toLocaleString()} / {bossRaid.maxHp.toLocaleString()}</span>
            <span className="text-amber-300">⏱️ Còn {bossRaid.timeLeft}s</span>
          </div>
          <div className="w-full h-3.5 bg-slate-900 rounded-full overflow-hidden border border-rose-400/40 mb-3">
            <div
              className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 transition-all duration-150"
              style={{ width: `${hpPct}%` }}
            />
          </div>

          {!bossRaid.won && bossRaid.timeLeft > 0 ? (
            <div className="flex gap-2">
              <button
                onClick={() => handleAttack(260)}
                className="flex-1 bg-gradient-to-r from-pink-500 to-rose-600 hover:brightness-110 active:scale-95 text-white font-extrabold text-sm py-2.5 px-3 rounded-xl shadow-lg cursor-pointer"
              >
                🔫 Bắn Đại Bác Trà Sữa (-260 HP)
              </button>
              <button
                onClick={() => handleAttack(620)}
                className="bg-gradient-to-r from-amber-400 to-orange-500 hover:brightness-110 active:scale-95 text-slate-950 font-extrabold text-xs py-2.5 px-3 rounded-xl shadow-lg cursor-pointer"
              >
                💣 Bom Pudding!
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm font-extrabold text-yellow-300 mb-2">
                {bossRaid.won
                  ? '🎉 CHIẾN THẮNG! Bạn và đồng đội Online đã hạ gục Boss (+2.500 Xu)!'
                  : '⏰ Hết giờ! Boss Trân Châu đã trốn thoát!'}
              </p>
              <button
                onClick={() => setSceneMode('shop')}
                className="w-full bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-extrabold text-xs py-2 rounded-xl cursor-pointer"
              >
                🏪 Quay về Cửa Hàng Của Tôi
              </button>
            </div>
          )}
          <p className="text-[11px] text-slate-300 mt-2">
            💡 Click trực tiếp liên tục vào Boss 3D hoặc bấm nút để tung đòn cùng 5 người chơi Online!
          </p>
        </div>
      </Html>
    </group>
  );
}
