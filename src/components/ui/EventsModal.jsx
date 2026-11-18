import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';

export default function EventsModal() {
  const activeModal = useGameStore((s) => s.activeModal);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const startBossRaid = useGameStore((s) => s.startBossRaid);
  const startCupRunner = useGameStore((s) => s.startCupRunner);
  const startTournament = useGameStore((s) => s.startTournament);
  const startAlienQuest = useGameStore((s) => s.startAlienQuest);
  const festivalProgress = useGameStore((s) => s.festivalProgress);
  const claimFestivalReward = useGameStore((s) => s.claimFestivalReward);
  const cupRunnerHigh = useGameStore((s) => s.cupRunner.highScore);

  if (activeModal !== 'events') return null;

  return (
    <div className="fixed inset-0 z-30 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-3xl boba-glass rounded-3xl p-5 max-h-[84vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/15 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🎁</span>
            <div>
              <h2 className="font-display font-extrabold text-xl text-white">
                SỰ KIỆN ĐẶC BIỆT & NHIỆM VỤ KHẨN CẤP BOBA LAND
              </h2>
              <p className="text-xs text-pink-200">
                Tham gia săn Boss 3D, đua vượt chướng ngại vật & phục vụ khách Ngoài Hành Tinh!
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Highlighted Section 7 Funny Alien Event */}
        <div className="mb-4 rounded-2xl p-4 bg-gradient-to-r from-emerald-950/90 via-teal-950/80 to-slate-900 border-2 border-emerald-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">👽🛸</span>
              <span className="font-display font-extrabold text-base text-emerald-300">
                NHIỆM VỤ ĐẶC BIỆT: ĐƠN HÀNG CỦA KHÁCH NGOÀI HÀNH TINH!
              </span>
            </div>
            <p className="text-xs text-slate-200">
              <i>&ldquo;200 viên trân châu, 5 lớp pudding, 0% đường nhưng phải ngọt như tình yêu!&rdquo;</i> — Hoàn thành trong 60 giây nhận <b>5.000 Xu</b> & danh hiệu <b>Người Pha Chế Thiên Hà</b>. Thất bại sẽ bị UFO hút sạch trân châu! 😂
            </p>
          </div>
          <button
            onClick={startAlienQuest}
            className="shrink-0 bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-extrabold text-xs px-4 py-3 rounded-2xl hover:brightness-110 shadow-lg cursor-pointer"
          >
            🛸 Gọi Đĩa Bay Tới Quán!
          </button>
        </div>

        {/* 4 Core Special Events from Section 4 */}
        <div className="grid sm:grid-cols-2 gap-3.5">
          {/* 1. Boss Trân Châu */}
          <div className="bg-white/5 border border-rose-400/40 rounded-2xl p-4 flex flex-col justify-between gap-3">
            <div>
              <div className="font-display font-extrabold text-base text-rose-300 mb-1">
                👾 Boss Trân Châu Khổng Lồ
              </div>
              <p className="text-xs text-slate-300">
                Quái vật Đại Vương Trân Châu 10.000 HP xuất hiện! Cùng 5 người chơi Online bắn Đại Bác Trà Sữa đánh bại Boss nhận <b>+2.500 Xu</b>!
              </p>
            </div>
            <button
              onClick={startBossRaid}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-extrabold text-xs cursor-pointer shadow-lg"
            >
              ⚔️ Vào Đấu Trường Săn Boss 3D
            </button>
          </div>

          {/* 2. Đua Cốc Khổng Lồ */}
          <div className="bg-white/5 border border-sky-400/40 rounded-2xl p-4 flex flex-col justify-between gap-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-display font-extrabold text-base text-sky-300">
                  🏃‍♂️🧋 Đua Cốc Khổng Lồ 3D
                </span>
                <span className="text-[11px] text-yellow-300 font-bold">Kỷ lục: {cupRunnerHigh}</span>
              </div>
              <p className="text-xs text-slate-300">
                Điều khiển Siêu Cốc Trà Sữa 3D nhảy vượt chướng ngại vật trên đường đua 3 làn và thu thập Trân Châu Vàng đổi Xu!
              </p>
            </div>
            <button
              onClick={startCupRunner}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-500 text-white font-extrabold text-xs cursor-pointer shadow-lg"
            >
              🏁 Bắt Đầu Đường Đua 3D
            </button>
          </div>

          {/* 3. Lễ Hội Trà Sữa */}
          <div className="bg-white/5 border border-pink-400/40 rounded-2xl p-4 flex flex-col justify-between gap-3">
            <div>
              <div className="font-display font-extrabold text-base text-pink-300 mb-1">
                🏮 Lễ Hội Trà Sữa Mùa Lễ Hội
              </div>
              <p className="text-xs text-slate-300 mb-2">
                Pha chế thành công 3 ly trà sữa chuẩn vị phục vụ du khách lễ hội để rinh thưởng <b>+1.500 Xu</b> & Huy hiệu Ngôi Sao Lễ Hội!
              </p>
              <div className="text-xs font-bold text-amber-200">
                Tiến độ: {Math.min(3, festivalProgress.drinksCrafted)} / 3 ly hoàn thành
              </div>
            </div>
            <button
              disabled={festivalProgress.claimed || festivalProgress.drinksCrafted < 3}
              onClick={claimFestivalReward}
              className={`w-full py-2.5 rounded-xl font-extrabold text-xs cursor-pointer ${
                festivalProgress.claimed
                  ? 'bg-emerald-500/25 text-emerald-200 cursor-default'
                  : festivalProgress.drinksCrafted < 3
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-pink-500 to-amber-400 text-slate-950'
              }`}
            >
              {festivalProgress.claimed
                ? '✅ Đã Nhận Thưởng Lễ Hội'
                : festivalProgress.drinksCrafted < 3
                ? `Pha thêm ${3 - festivalProgress.drinksCrafted} ly nữa để nhận 1.500 Xu`
                : '🎁 Nhận Ngay +1.500 Xu!'}
            </button>
          </div>

          {/* 4. Giải Đấu Vua Pha Chế */}
          <div className="bg-white/5 border border-amber-400/40 rounded-2xl p-4 flex flex-col justify-between gap-3">
            <div>
              <div className="font-display font-extrabold text-base text-amber-300 mb-1">
                👑 Giải Đấu Vua Pha Chế Toàn Thành Phố
              </div>
              <p className="text-xs text-slate-300">
                Vượt qua 3 vòng loại trực tiếp (Tứ Kết → Bán Kết → Chung Kết) với độ chính xác &ge;80% để nhận <b>+3.000 Xu</b> & Vương Miện!
              </p>
            </div>
            <button
              onClick={startTournament}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-extrabold text-xs cursor-pointer shadow-lg"
            >
              🏆 Đăng Ký Thi Đấu Ngay
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
