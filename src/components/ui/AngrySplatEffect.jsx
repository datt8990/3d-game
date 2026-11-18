import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';

export default function AngrySplatEffect() {
  const angrySplat = useGameStore((s) => s.angrySplat);

  return (
    <AnimatePresence>
      {angrySplat && (
        <motion.div
          key={angrySplat.timestamp}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden animate-screen-shake"
        >
          {/* Giant Milk Tea Splat Blob */}
          <div className="relative w-full h-full flex items-center justify-center">
            <div
              className="absolute w-[520px] h-[520px] rounded-full blur-md animate-drip"
              style={{
                background:
                  'radial-gradient(circle, rgba(196,138,88,0.92) 0%, rgba(140,86,45,0.85) 55%, rgba(111,59,30,0) 75%)',
              }}
            />

            {/* Dripping Tapioca Pearls Stuck on the Screen! 😂 */}
            {[
              [-140, -80],
              [120, -110],
              [-95, 75],
              [150, 60],
              [20, -145],
              [-45, 130],
              [85, -15],
              [-170, 10],
              [55, 115],
              [-20, -40],
            ].map(([dx, dy], i) => (
              <div
                key={i}
                className="absolute w-9 h-9 rounded-full bg-[#1a0f0a] border-2 border-amber-900/60 shadow-xl animate-drip"
                style={{
                  left: `calc(50% + ${dx}px)`,
                  top: `calc(50% + ${dy}px)`,
                  animationDelay: `${i * 0.06}s`,
                }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-white/40 ml-1.5 mt-1" />
              </div>
            ))}

            {/* Angry Customer Message Card */}
            <motion.div
              initial={{ scale: 0.5, rotate: -8 }}
              animate={{ scale: 1, rotate: 0 }}
              className="relative z-10 bg-rose-950/95 border-4 border-rose-400 rounded-3xl px-6 py-5 max-w-md text-center shadow-2xl"
            >
              <div className="text-4xl mb-1">😡🧋💥💦</div>
              <div className="font-display font-extrabold text-xl text-rose-300 mb-1">
                KHÁCH NỔI GIẬN NÉM LY TRÀ SỮA VÀO MẶT!!
              </div>
              <div className="text-xs font-bold text-amber-200 mb-1">
                {angrySplat.customerName} (Độ chính xác chỉ đạt {angrySplat.accuracy}%)
              </div>
              <p className="text-sm text-white italic">&ldquo;{angrySplat.quote}&rdquo;</p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
