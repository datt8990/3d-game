import React, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useGameStore } from '../../store/useGameStore';
import { sound } from '../../audio/soundEngine';
import BobaCup3D from './BobaCup3D';
import Banner3D from './Banner3D';

const LANES = [-2.2, 0, 2.2];

export default function CupRunnerScene() {
  const finishCupRunner = useGameStore((s) => s.finishCupRunner);
  const startCupRunner = useGameStore((s) => s.startCupRunner);
  const setSceneMode = useGameStore((s) => s.setSceneMode);
  const highScore = useGameStore((s) => s.cupRunner.highScore);

  const [laneIdx, setLaneIdx] = useState(1);
  const [hudScore, setHudScore] = useState(0);
  const [hudPearls, setHudPearls] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const cupGroupRef = useRef();
  const obstaclesRef = useRef([]);
  const pearlsRef = useRef([]);

  const stateRef = useRef({
    lane: 1,
    y: 0.9,
    vy: 0,
    score: 0,
    pearls: 0,
    alive: true,
    obstacles: Array.from({ length: 6 }, (_, i) => ({
      lane: Math.floor(Math.random() * 3),
      z: -12 - i * 8,
    })),
    bonuses: Array.from({ length: 6 }, (_, i) => ({
      lane: Math.floor(Math.random() * 3),
      z: -8 - i * 7,
      active: true,
    })),
  });

  const moveLane = (dir) => {
    if (!stateRef.current.alive) return;
    sound.playClick();
    setLaneIdx((prev) => {
      const next = Math.max(0, Math.min(2, prev + dir));
      stateRef.current.lane = next;
      return next;
    });
  };

  const jump = () => {
    if (!stateRef.current.alive) return;
    if (stateRef.current.y <= 0.95) {
      sound.playPearlDrop();
      stateRef.current.vy = 7.8;
    }
  };

  const restartRun = () => {
    stateRef.current = {
      lane: 1,
      y: 0.9,
      vy: 0,
      score: 0,
      pearls: 0,
      alive: true,
      obstacles: Array.from({ length: 6 }, (_, i) => ({
        lane: Math.floor(Math.random() * 3),
        z: -12 - i * 8,
      })),
      bonuses: Array.from({ length: 6 }, (_, i) => ({
        lane: Math.floor(Math.random() * 3),
        z: -8 - i * 7,
        active: true,
      })),
    };
    setLaneIdx(1);
    setHudScore(0);
    setHudPearls(0);
    setGameOver(false);
    startCupRunner();
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') moveLane(-1);
      if (e.code === 'ArrowRight' || e.code === 'KeyD') moveLane(1);
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') jump();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useFrame((_, delta) => {
    const st = stateRef.current;
    if (!st.alive) return;

    const dt = Math.min(delta, 0.05);
    const speed = 11.5 + st.score * 0.008;

    // Smooth X & Jump Physics
    if (cupGroupRef.current) {
      const targetX = LANES[st.lane];
      cupGroupRef.current.position.x += (targetX - cupGroupRef.current.position.x) * 12 * dt;

      st.y += st.vy * dt;
      st.vy -= 20 * dt;
      if (st.y < 0.9) {
        st.y = 0.9;
        st.vy = 0;
      }
      cupGroupRef.current.position.y = st.y;
    }

    st.score += Math.round(dt * 45);
    if (st.score % 5 === 0) setHudScore(st.score);

    // Move obstacles & check collisions
    st.obstacles.forEach((obs, idx) => {
      obs.z += speed * dt;
      if (obs.z > 6) {
        obs.z = -42 - Math.random() * 8;
        obs.lane = Math.floor(Math.random() * 3);
      }
      const mesh = obstaclesRef.current[idx];
      if (mesh) mesh.position.set(LANES[obs.lane], 0.55, obs.z);

      if (Math.abs(obs.z - 2.2) < 0.75 && obs.lane === st.lane && st.y < 1.55) {
        st.alive = false;
        sound.playAngrySplat();
        setHudScore(st.score);
        setGameOver(true);
        finishCupRunner(st.score, st.pearls);
      }
    });

    // Move golden pearls & collect
    st.bonuses.forEach((bon, idx) => {
      bon.z += speed * dt;
      if (bon.z > 6) {
        bon.z = -38 - Math.random() * 10;
        bon.lane = Math.floor(Math.random() * 3);
        bon.active = true;
      }
      const mesh = pearlsRef.current[idx];
      if (mesh) {
        mesh.position.set(LANES[bon.lane], 0.85, bon.z);
        mesh.visible = bon.active;
      }

      if (bon.active && Math.abs(bon.z - 2.2) < 0.85 && bon.lane === st.lane) {
        bon.active = false;
        st.pearls += 1;
        st.score += 30;
        sound.playCoin();
        setHudPearls(st.pearls);
        setHudScore(st.score);
      }
    });
  });

  return (
    <group>
      {/* Pastel Rainbow Boba Track */}
      <mesh receiveShadow position={[0, 0, -16]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[7.8, 60]} />
        <meshStandardMaterial color="#3b1d5e" roughness={0.6} />
      </mesh>
      {/* Lane Stripes */}
      <mesh position={[-1.1, 0.02, -16]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.12, 60]} />
        <meshBasicMaterial color="#f472b6" />
      </mesh>
      <mesh position={[1.1, 0.02, -16]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.12, 60]} />
        <meshBasicMaterial color="#f472b6" />
      </mesh>

      <Banner3D position={[0, 4.3, -6]} color="#facc15" size="lg" distanceFactor={12}>
        🏃‍♂️🧋 ĐƯỜNG ĐUA CỐC KHỔNG LỒ
      </Banner3D>

      {/* Player Giant Boba Cup */}
      <group ref={cupGroupRef} position={[LANES[laneIdx], 0.9, 2.2]}>
        <BobaCup3D
          cup={{
            tea: 'taro_tea',
            milk: 100,
            toppings: ['pearl', 'pudding', 'cheese_foam'],
            isSealed: true,
          }}
          scale={0.85}
        />
      </group>

      {/* Spiky Red Ice Block Obstacles */}
      {stateRef.current.obstacles.map((obs, idx) => (
        <mesh
          key={`obs_${idx}`}
          ref={(el) => (obstaclesRef.current[idx] = el)}
          position={[LANES[obs.lane], 0.55, obs.z]}
          castShadow
        >
          <boxGeometry args={[1.35, 1.05, 0.95]} />
          <meshStandardMaterial color="#f43f5e" emissive="#be123c" emissiveIntensity={0.45} roughness={0.2} />
        </mesh>
      ))}

      {/* Collectible Golden Boba Pearls */}
      {stateRef.current.bonuses.map((bon, idx) => (
        <mesh
          key={`bon_${idx}`}
          ref={(el) => (pearlsRef.current[idx] = el)}
          position={[LANES[bon.lane], 0.85, bon.z]}
        >
          <sphereGeometry args={[0.36, 18, 18]} />
          <meshStandardMaterial color="#facc15" emissive="#f59e0b" emissiveIntensity={0.8} metalness={0.8} roughness={0.1} />
        </mesh>
      ))}

      {/* On-screen Runner Controls & Score (Mobile & Desktop Responsive!) */}
      <Html position={[0, -0.3, 5.2]} center>
        <div className="w-[88vw] max-w-88 boba-glass rounded-2xl p-3 text-center pointer-events-auto border-2 border-pink-400">
          <div className="flex justify-between text-xs font-extrabold mb-2">
            <span className="text-pink-600">🏆 Điểm: {hudScore} (Kỷ lục: {Math.max(highScore, hudScore)})</span>
            <span className="text-amber-700">🟡 TC Vàng: {hudPearls}</span>
          </div>

          {!gameOver ? (
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => moveLane(-1)}
                className="bg-pink-100 hover:bg-pink-200 text-pink-800 border border-pink-300 font-extrabold py-2.5 rounded-xl text-xs cursor-pointer"
              >
                ⬅️ Trái
              </button>
              <button
                onClick={jump}
                className="bg-gradient-to-r from-pink-400 to-rose-500 text-white font-extrabold py-2.5 rounded-xl text-xs shadow cursor-pointer"
              >
                ⬆️ Nhảy
              </button>
              <button
                onClick={() => moveLane(1)}
                className="bg-pink-100 hover:bg-pink-200 text-pink-800 border border-pink-300 font-extrabold py-2.5 rounded-xl text-xs cursor-pointer"
              >
                Phải ➡️
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-sm font-extrabold text-rose-300">
                💥 Đụng chướng ngại vật! Thưởng: +{hudPearls * 15 + Math.floor(hudScore / 5)} Xu!
              </div>
              <div className="flex gap-2">
                <button
                  onClick={restartRun}
                  className="flex-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-extrabold text-xs py-2 rounded-xl cursor-pointer"
                >
                  🔄 Đua Lại Ngay
                </button>
                <button
                  onClick={() => setSceneMode('shop')}
                  className="flex-1 bg-white/15 text-white font-bold text-xs py-2 rounded-xl cursor-pointer"
                >
                  🏪 Về Quán
                </button>
              </div>
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}
