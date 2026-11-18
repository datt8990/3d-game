import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import ModelGLB from './ModelGLB';
import AnimatedCharacter3D from './AnimatedCharacter3D';

const PEARL_SUCK_GEO = new THREE.SphereGeometry(0.095, 10, 10);
const PEARL_SUCK_MAT = new THREE.MeshStandardMaterial({ color: '#1c110c', roughness: 0.2 });

export default function AlienUFO3D() {
  const alienQuest = useGameStore((s) => s.alienQuest);
  const acceptAlienCrafting = useGameStore((s) => s.acceptAlienCrafting);
  const closeAlienQuest = useGameStore((s) => s.closeAlienQuest);

  const ufoRef = useRef();
  const pearlsRef = useRef();

  const flyingPearls = useMemo(
    () =>
      Array.from({ length: 42 }, (_, i) => ({
        angle: (i / 42) * Math.PI * 6,
        radius: 0.25 + (i % 6) * 0.16,
        yOffset: (i / 42) * 4.8,
        speed: 2.1 + (i % 4) * 0.35,
      })),
    []
  );

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    if (ufoRef.current) {
      ufoRef.current.rotation.y += delta * 1.4;
      ufoRef.current.position.y = 4.9 + Math.sin(t * 2.4) * 0.22;
    }
    if (pearlsRef.current && alienQuest.stage === 'failed_suck') {
      pearlsRef.current.children.forEach((mesh, idx) => {
        const p = flyingPearls[idx];
        const y = (t * p.speed + p.yOffset) % 4.6;
        const r = p.radius * (1 - y / 6.0);
        mesh.position.set(Math.cos(t * 4 + p.angle) * r, y + 0.4, Math.sin(t * 4 + p.angle) * r);
      });
    }
  });

  if (!alienQuest.active) return null;

  return (
    <group position={[0, 0, 0.55]}>
      {/* Quaternius Stylized 3D Frog UFO Spaceship Hovering Above! */}
      <group ref={ufoRef} position={[0, 4.9, 1.4]}>
        <ModelGLB path="/models/quaternius/ufo_frog.glb" scale={0.34} castShadow={false} />
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
          <torusGeometry args={[1.65, 0.07, 10, 28]} />
          <meshBasicMaterial color="#4ade80" />
        </mesh>
      </group>

      {/* Soft Green Tractor Beam */}
      <mesh position={[0, 2.4, 0.7]}>
        <coneGeometry args={[1.45, 4.8, 20, 1, true]} />
        <meshBasicMaterial color="#4ade80" transparent opacity={0.14} depthWrite={false} side={2} />
      </mesh>

      {/* Rigged Animated Galactic Visitor Facing the Barista! */}
      {alienQuest.stage !== 'failed_suck' && (
        <group position={[0, 0, 0]} rotation={[0, Math.PI, 0]}>
          <AnimatedCharacter3D
            path="/models/quaternius/men_spacesuit.glb"
            anim={alienQuest.stage === 'won' ? 'wave' : 'idle'}
            scale={1.02}
          >
            {/* Glowing Green Alien Antennae on Helmet */}
            <group position={[0, 1.72, 0]}>
              <mesh position={[-0.1, 0.1, 0]} rotation={[0, 0, 0.3]}>
                <cylinderGeometry args={[0.016, 0.016, 0.22, 8]} />
                <meshBasicMaterial color="#4ade80" />
              </mesh>
              <mesh position={[-0.15, 0.22, 0]}>
                <sphereGeometry args={[0.05, 10, 10]} />
                <meshBasicMaterial color="#fde047" />
              </mesh>
              <mesh position={[0.1, 0.1, 0]} rotation={[0, 0, -0.3]}>
                <cylinderGeometry args={[0.016, 0.016, 0.22, 8]} />
                <meshBasicMaterial color="#4ade80" />
              </mesh>
              <mesh position={[0.15, 0.22, 0]}>
                <sphereGeometry args={[0.05, 10, 10]} />
                <meshBasicMaterial color="#fde047" />
              </mesh>
            </group>
          </AnimatedCharacter3D>

          {alienQuest.stage === 'intro' && (
            <Html position={[0, 2.25, 0]} center>
              <div className="w-80 boba-glass rounded-2xl p-4 text-left border-2 border-emerald-400 shadow-2xl pointer-events-auto">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-display text-emerald-300 font-extrabold text-sm">
                    👽 KHÁCH HÀNG NGOÀI HÀNH TINH
                  </span>
                  <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                    ⏱️ 60 GIÂY!
                  </span>
                </div>
                <p className="text-xs text-emerald-100 italic mb-1.5">
                  &ldquo;Tôi muốn một ly trà sữa có <b>200 viên trân châu</b>, <b>5 lớp pudding</b>,{' '}
                  <b>0% đường</b> nhưng phải <b>ngọt như tình yêu 💖</b>!&rdquo;
                </p>
                <p className="text-[11px] text-amber-200 mb-1">
                  🧑‍🍳 <b>Bạn:</b> Dạ... anh có chắc không ạ?
                </p>
                <p className="text-xs text-rose-300 font-bold mb-3">
                  👽 <b>Khách:</b> Nhanh lên! Tôi sắp hết oxy rồi!!
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={acceptAlienCrafting}
                    className="flex-1 bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-extrabold text-xs py-2 px-3 rounded-xl hover:brightness-110 transition cursor-pointer"
                  >
                    🧋 Pha Ngay Tại Quầy (+5.000 Xu)
                  </button>
                  <button
                    onClick={closeAlienQuest}
                    className="bg-white/10 text-white text-xs px-2.5 py-2 rounded-xl hover:bg-white/20 cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </Html>
          )}
        </group>
      )}

      {/* FAILED CUTSCENE: Pearls sucked into Frog UFO */}
      {alienQuest.stage === 'failed_suck' && (
        <group>
          <group ref={pearlsRef}>
            {flyingPearls.map((_, idx) => (
              <mesh key={idx} geometry={PEARL_SUCK_GEO} material={PEARL_SUCK_MAT} />
            ))}
          </group>
          <Html position={[0, 2.2, 0]} center>
            <div className="w-80 boba-glass rounded-2xl p-4 text-center border-2 border-rose-500 shadow-2xl pointer-events-auto">
              <div className="text-2xl mb-1">🛸💨 ⚫⚫⚫</div>
              <h3 className="font-display text-rose-300 font-extrabold text-base mb-1">
                THẤT BẠI! BỊ HÚT SẠCH TRÂN CHÂU! 😂
              </h3>
              <p className="text-xs text-slate-200 mb-3">
                Người ngoài hành tinh bật tia kéo hút sạch toàn bộ trân châu trên quầy của bạn rồi phóng tàu vũ trụ bay mất!
              </p>
              <button
                onClick={closeAlienQuest}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs py-2 rounded-xl cursor-pointer"
              >
                Dọn lại quầy & phục thù sau 😭
              </button>
            </div>
          </Html>
        </group>
      )}

      {alienQuest.stage === 'won' && (
        <Html position={[0, 2.2, 0]} center>
          <div className="w-80 boba-glass rounded-2xl p-4 text-center border-2 border-yellow-400 shadow-2xl pointer-events-auto">
            <div className="text-3xl mb-1">👽💖🧋✨</div>
            <h3 className="font-display text-yellow-300 font-extrabold text-base mb-1">
              NHIỆM VỤ THIÊN HÀ THÀNH CÔNG!
            </h3>
            <p className="text-xs text-emerald-200 mb-2">
              &ldquo;Trời ơi vị ngọt tình yêu trái đất đỉnh quá! Tặng bạn 5.000 Xu và danh hiệu cao quý nhất dải ngân hà!&rdquo;
            </p>
            <div className="bg-yellow-400/20 border border-yellow-400/50 rounded-xl py-1.5 px-2 text-xs font-extrabold text-yellow-200 mb-3">
              🌌 Danh hiệu mới: Người Pha Chế Thiên Hà (+5.000 Xu)
            </div>
            <button
              onClick={closeAlienQuest}
              className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-extrabold text-xs py-2 rounded-xl cursor-pointer"
            >
              Tuyệt vời! Nhận thưởng 🎉
            </button>
          </div>
        </Html>
      )}
    </group>
  );
}
