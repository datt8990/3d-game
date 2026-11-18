import React, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/useGameStore';
import { sound } from '../../audio/soundEngine';
import BobaCup3D from './BobaCup3D';

const LANES = [-2.2, 0, 2.2];

export default function CupRunnerScene() {
  const finishCupRunner = useGameStore((s) => s.finishCupRunner);

  const [laneIdx, setLaneIdx] = useState(1);
  const cupGroupRef = useRef();
  const obstaclesRef = useRef([]);
  const pearlsRef = useRef([]);

  const makeInitialState = () => ({
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

  const stateRef = useRef(makeInitialState());

  useEffect(() => {
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

    const onKey = (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') moveLane(-1);
      if (e.code === 'ArrowRight' || e.code === 'KeyD') moveLane(1);
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') jump();
    };

    const onRestart = () => {
      stateRef.current = makeInitialState();
      setLaneIdx(1);
    };

    window.addEventListener('keydown', onKey);
    window.addEventListener('cup-runner-restart', onRestart);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('cup-runner-restart', onRestart);
    };
  }, []);

  useFrame((_, delta) => {
    const st = stateRef.current;
    if (!st.alive) return;

    const dt = Math.min(delta, 0.05);
    const speed = 11.5 + st.score * 0.008;

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
        finishCupRunner(st.score, st.pearls);
      }
    });

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
      }
    });
  });

  return (
    <group>
      <mesh receiveShadow position={[0, 0, -16]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[7.8, 60]} />
        <meshStandardMaterial color="#fbcfe8" roughness={0.6} />
      </mesh>
      <mesh position={[-1.1, 0.02, -16]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.12, 60]} />
        <meshBasicMaterial color="#fb6f92" />
      </mesh>
      <mesh position={[1.1, 0.02, -16]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.12, 60]} />
        <meshBasicMaterial color="#fb6f92" />
      </mesh>

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

      {stateRef.current.obstacles.map((obs, idx) => (
        <mesh
          key={`obs_${idx}`}
          ref={(el) => (obstaclesRef.current[idx] = el)}
          position={[LANES[obs.lane], 0.55, obs.z]}
          castShadow
        >
          <boxGeometry args={[1.35, 1.05, 0.95]} />
          <meshStandardMaterial color="#fb6f92" roughness={0.25} />
        </mesh>
      ))}

      {stateRef.current.bonuses.map((bon, idx) => (
        <mesh
          key={`bon_${idx}`}
          ref={(el) => (pearlsRef.current[idx] = el)}
          position={[LANES[bon.lane], 0.85, bon.z]}
        >
          <sphereGeometry args={[0.36, 18, 18]} />
          <meshStandardMaterial color="#facc15" metalness={0.75} roughness={0.15} />
        </mesh>
      ))}
    </group>
  );
}
