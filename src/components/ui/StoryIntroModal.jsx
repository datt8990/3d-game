import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';

export default function StoryIntroModal() {
  const hasSeenIntro = useGameStore((s) => s.hasSeenIntro);
  const dismissIntro = useGameStore((s) => s.dismissIntro);

  const [name, setName] = useState('Bé Chủ Quán');
  const [shop, setShop] = useState('Tiệm Trà Dâu Hồng');

  if (hasSeenIntro) return null;

  return (
    <div className="fixed inset-0 z-50 bg-pink-950/45 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg boba-glass rounded-3xl p-5 sm:p-6 shadow-2xl text-center"
      >
        <div className="text-4xl sm:text-5xl mb-1.5">🍓🧋🎀👑</div>
        <h1 className="font-display font-extrabold text-xl sm:text-2xl text-pink-600 mb-1">
          TRÀ SỮA ĐẠI CHIẾN 3D – MILK TEA TYCOON
        </h1>
        <p className="text-xs text-rose-400 font-extrabold mb-3">
          🌸 Simulation • Kawaii Tycoon • Multiplayer 3D Online 🌸
        </p>

        <div className="bg-white/85 border-2 border-pink-200 rounded-2xl p-3 sm:p-3.5 text-left text-xs text-[#591d3b] space-y-1.5 mb-4">
          <p>
            🌟 Thành phố <b>Boba Land</b> đang mở hội thi tìm kiếm thương hiệu trà sữa dễ thương & ngon nhất thế giới!
          </p>
          <p>
            🎀 Bạn khởi đầu với <b>một tiệm nhỏ xinh</b>, <b>chiếc máy dập nắp cũ</b>, <b>kho nguyên liệu giới hạn</b> và{' '}
            <b className="text-amber-600">500 Xu</b>.
          </p>
          <p>
            💖 Pha chế siêu gọn <b>3 bước</b>, đổi <b>4 Style Quán 3D</b>, vuốt ve bé Mèo/Cún, quay Vòng Quay May Mắn, chụp ảnh Check-in & thi đấu Online để trở thành <b>Nữ Hoàng Trà Sữa Boba Land</b>!
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-2.5 text-left mb-4">
          <div>
            <label className="text-[11px] font-extrabold text-pink-600 block mb-1">
              🎀 Tên Chủ Quán của bạn
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              className="w-full bg-white border-2 border-pink-300 rounded-xl px-3 py-2 text-xs font-extrabold text-[#4a1d35] focus:outline-none focus:border-pink-500"
            />
          </div>
          <div>
            <label className="text-[11px] font-extrabold text-pink-600 block mb-1">
              🏪 Tên Tiệm Trà Sữa
            </label>
            <input
              value={shop}
              onChange={(e) => setShop(e.target.value)}
              maxLength={22}
              className="w-full bg-white border-2 border-pink-300 rounded-xl px-3 py-2 text-xs font-extrabold text-[#4a1d35] focus:outline-none focus:border-pink-500"
            />
          </div>
        </div>

        <button
          onClick={() => dismissIntro(name, shop)}
          className="w-full py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-pink-400 via-rose-400 to-amber-400 hover:brightness-105 text-white font-display font-extrabold text-sm sm:text-base shadow-lg cursor-pointer"
        >
          🌸 KHAI TRƯƠNG TIỆM TRÀ SỮA NGAY! (500 Xu)
        </button>
      </motion.div>
    </div>
  );
}
