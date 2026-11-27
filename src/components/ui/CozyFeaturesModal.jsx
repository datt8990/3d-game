import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Palette, Gift, ClipboardCheck, BookOpen, CheckCircle2, Sparkles } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import {
  DAILY_QUESTS,
  LUCKY_WHEEL_PRIZES,
  SIGNATURE_RECIPES,
  TEA_BASES,
  TOPPINGS,
} from '../../data/gameData';
import { SHOP_THEME_LIST } from '../three/cafeTextures';

export default function CozyFeaturesModal() {
  const activeModal = useGameStore((s) => s.activeModal);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const coins = useGameStore((s) => s.coins);
  const shopTheme = useGameStore((s) => s.shopTheme || 'sakura');
  const unlockedThemes = useGameStore((s) => s.unlockedThemes || ['sakura', 'matcha']);
  const selectOrBuyTheme = useGameStore((s) => s.selectOrBuyTheme);
  const dailyQuests = useGameStore((s) => s.dailyQuests || {});
  const claimDailyQuest = useGameStore((s) => s.claimDailyQuest);
  const luckyWheelFreeSpins = useGameStore((s) => s.luckyWheelFreeSpins ?? 1);
  const spinLuckyWheel = useGameStore((s) => s.spinLuckyWheel);
  const applyLuckyWheelPrize = useGameStore((s) => s.applyLuckyWheelPrize);
  const recipeMastery = useGameStore((s) => s.recipeMastery || {});

  const [tab, setTab] = useState('themes'); // 'themes' | 'wheel' | 'quests' | 'recipes'
  const [wheelAngle, setWheelAngle] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastWonPrize, setLastWonPrize] = useState(null);

  if (activeModal !== 'cozy') return null;

  const handleSpin = () => {
    if (isSpinning) return;
    const res = spinLuckyWheel();
    if (!res) return;
    setIsSpinning(true);
    setLastWonPrize(null);

    const sliceDeg = 360 / LUCKY_WHEEL_PRIZES.length;
    const targetSliceCenter = res.prizeIdx * sliceDeg + sliceDeg / 2;
    const extraSpins = 5 * 360;
    const finalAngle = wheelAngle + extraSpins + (360 - (wheelAngle % 360)) + (360 - targetSliceCenter);
    setWheelAngle(finalAngle);

    setTimeout(() => {
      setIsSpinning(false);
      setLastWonPrize(res.prize);
      applyLuckyWheelPrize(res.prize);
    }, 2900);
  };

  return (
    <div className="fixed inset-0 z-30 bg-black/45 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-3xl boba-glass rounded-3xl p-4 sm:p-5 max-h-[85vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-pink-200">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🎀</span>
            <div>
              <h2 className="font-display font-extrabold text-lg sm:text-xl text-[#591d3b]">
                GÓC XINH XẮN • STYLE QUÁN & QUÀ TẶNG
              </h2>
              <p className="text-xs text-pink-700 font-bold">
                Số dư: <b className="text-amber-600">{coins.toLocaleString('vi-VN')} Xu</b> • Chọn phong cách quán, quay thưởng & sưu tầm công thức!
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-2 rounded-xl bg-pink-100 hover:bg-pink-200 text-pink-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Cozy Tabs */}
        <div className="grid grid-cols-4 gap-1.5 my-3">
          {[
            { id: 'themes', label: 'Style Quán', icon: Palette },
            { id: 'wheel', label: 'Vòng Quay', icon: Gift },
            { id: 'quests', label: 'Nhiệm Vụ', icon: ClipboardCheck },
            { id: 'recipes', label: 'Sổ Trà Sữa', icon: BookOpen },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`py-2 px-2 rounded-2xl text-[11px] sm:text-xs font-extrabold flex items-center justify-center gap-1 transition cursor-pointer ${
                  tab === t.id
                    ? 'bg-gradient-to-r from-pink-400 to-rose-500 text-white shadow-sm'
                    : 'bg-white/80 hover:bg-pink-50 text-[#591d3b] border border-pink-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="overflow-y-auto pr-1 flex-1">
          {tab === 'themes' && (
            <div className="grid sm:grid-cols-2 gap-3">
              {SHOP_THEME_LIST.map((theme) => {
                const isUnlocked = unlockedThemes.includes(theme.id);
                const isActive = shopTheme === theme.id;
                return (
                  <div
                    key={theme.id}
                    className={`rounded-2xl p-3.5 border-2 flex flex-col justify-between gap-2.5 transition ${
                      isActive
                        ? 'bg-pink-50 border-pink-400 shadow-md'
                        : 'bg-white/85 border-pink-200/80'
                    }`}
                  >
                    <div>
                      <div className={`h-14 rounded-xl bg-gradient-to-r ${theme.previewGradient} mb-2.5 flex items-center justify-between px-3 border border-white shadow-inner`}>
                        <span className="text-2xl">{theme.icon}</span>
                        {isActive && (
                          <span className="bg-white/90 text-pink-600 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                            ✨ Đang dùng
                          </span>
                        )}
                      </div>
                      <h3 className="font-display font-extrabold text-sm text-[#591d3b]">
                        {theme.name}
                      </h3>
                      <p className="text-xs text-[#7b435f] mt-0.5">{theme.desc}</p>
                    </div>

                    <button
                      onClick={() => selectOrBuyTheme(theme.id)}
                      className={`w-full py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                        isActive
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : isUnlocked
                          ? 'bg-gradient-to-r from-pink-400 to-rose-500 text-white shadow'
                          : coins >= theme.cost
                          ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 shadow'
                          : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {isActive
                        ? '✅ Đang trang trí Style này'
                        : isUnlocked
                        ? '🎨 Đổi sang Style này'
                        : `🪙 Mở khóa (${theme.cost} Xu)`}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'wheel' && (
            <div className="flex flex-col items-center py-2 space-y-3">
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
                {/* Pointer Arrow at Top */}
                <div className="absolute -top-2 z-20 text-2xl drop-shadow">🔻</div>

                {/* Rotating Pastel Wheel */}
                <div
                  className="w-full h-full rounded-full border-4 border-white shadow-xl relative overflow-hidden"
                  style={{
                    transform: `rotate(${wheelAngle}deg)`,
                    transition: isSpinning ? 'transform 2.8s cubic-bezier(0.15, 0.85, 0.2, 1)' : 'none',
                    background: `conic-gradient(${LUCKY_WHEEL_PRIZES.map(
                      (p, i) =>
                        `${p.color} ${(i * 100) / LUCKY_WHEEL_PRIZES.length}% ${((i + 1) * 100) / LUCKY_WHEEL_PRIZES.length}%`
                    ).join(', ')})`,
                  }}
                >
                  {LUCKY_WHEEL_PRIZES.map((p, idx) => {
                    const deg = idx * (360 / LUCKY_WHEEL_PRIZES.length) + 30;
                    return (
                      <div
                        key={p.id}
                        className="absolute inset-0 flex justify-center pt-3 sm:pt-4"
                        style={{ transform: `rotate(${deg}deg)` }}
                      >
                        <div className="text-center leading-tight">
                          <div className="text-lg sm:text-xl">{p.icon}</div>
                          <div className="text-[9px] sm:text-[10px] font-extrabold text-[#591d3b]">
                            {p.label}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Center Cute Boba Hub */}
                <div className="absolute w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 border-4 border-white shadow-md flex items-center justify-center text-xl">
                  🧋
                </div>
              </div>

              {lastWonPrize && (
                <div className="bg-emerald-50 border-2 border-emerald-300 text-emerald-800 px-4 py-1.5 rounded-2xl text-xs font-extrabold">
                  🎉 Chúc mừng bạn vừa trúng: {lastWonPrize.icon} {lastWonPrize.label}!
                </div>
              )}

              <button
                disabled={isSpinning}
                onClick={handleSpin}
                className={`px-6 py-2.5 rounded-2xl font-display font-extrabold text-sm shadow-lg transition flex items-center gap-2 ${
                  isSpinning
                    ? 'bg-pink-200 text-pink-600 cursor-wait'
                    : 'bg-gradient-to-r from-pink-400 via-rose-500 to-amber-400 text-white hover:brightness-105 cursor-pointer'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                {isSpinning
                  ? 'Đang quay may mắn...'
                  : luckyWheelFreeSpins > 0
                  ? `🎁 QUAY MIỄN PHÍ (${luckyWheelFreeSpins} lượt)`
                  : '🎰 Quay Tiếp (80 Xu)'}
              </button>
            </div>
          )}

          {tab === 'quests' && (
            <div className="space-y-2.5">
              {DAILY_QUESTS.map((q) => {
                const st = dailyQuests[q.id] || { progress: 0, claimed: false };
                const cur = Math.min(q.target, st.progress);
                const ready = cur >= q.target && !st.claimed;
                const pct = Math.round((cur / q.target) * 100);

                return (
                  <div
                    key={q.id}
                    className="bg-white/85 border-2 border-pink-200 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-11 h-11 rounded-2xl bg-pink-100 flex items-center justify-center text-2xl shrink-0">
                        {q.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-display font-extrabold text-sm text-[#591d3b]">
                          {q.title}
                        </div>
                        <div className="text-[11px] font-bold text-pink-600">
                          Phần thưởng: +{q.rewardCoins} Xu • +{q.rewardXp} XP
                        </div>
                        <div className="w-full h-2 bg-pink-100 rounded-full overflow-hidden mt-1.5">
                          <div
                            className="h-full bg-gradient-to-r from-pink-400 to-emerald-400 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      disabled={!ready}
                      onClick={() => claimDailyQuest(q.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold shrink-0 flex items-center justify-center gap-1 ${
                        st.claimed
                          ? 'bg-emerald-100 text-emerald-700 cursor-default'
                          : ready
                          ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow cursor-pointer'
                          : 'bg-pink-50 text-pink-400 border border-pink-200 cursor-not-allowed'
                      }`}
                    >
                      {st.claimed ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Đã nhận
                        </>
                      ) : ready ? (
                        '🎁 Nhận Quà!'
                      ) : (
                        `${cur}/${q.target}`
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'recipes' && (
            <div className="grid sm:grid-cols-2 gap-2.5">
              {SIGNATURE_RECIPES.map((rec) => {
                const tea = TEA_BASES.find((t) => t.id === rec.tea);
                const count = recipeMastery[rec.id] || 0;
                return (
                  <div
                    key={rec.id}
                    className={`rounded-2xl p-3 border-2 ${
                      count > 0 ? 'bg-amber-50/80 border-amber-300' : 'bg-white/85 border-pink-200/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-display font-extrabold text-sm text-[#591d3b]">
                        {rec.icon} {rec.name}
                      </span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 shrink-0">
                        {count > 0 ? `⭐ Đã pha: ${count}` : 'Mới'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#7b435f] mb-1.5">{rec.desc}</p>
                    <div className="flex flex-wrap gap-1 text-[10px] font-extrabold">
                      <span className="bg-pink-100 text-pink-800 px-1.5 py-0.5 rounded-lg">
                        {tea?.icon} {tea?.shortName}
                      </span>
                      <span className="bg-white border border-pink-200 text-pink-800 px-1.5 py-0.5 rounded-lg">
                        🥛{rec.milk}% • 🍬{rec.sugar}% • 🧊{rec.ice}%
                      </span>
                      {rec.toppings.map((tid) => {
                        const tp = TOPPINGS.find((x) => x.id === tid);
                        return (
                          <span key={tid} className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-lg">
                            {tp?.icon} {tp?.shortName}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
