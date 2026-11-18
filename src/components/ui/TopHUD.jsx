import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Music, Sparkles, Camera, Zap, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { getTierForLevel, TEA_BASES, TOPPINGS } from '../../data/gameData';
import { sound } from '../../audio/soundEngine';

const FALLBACK_INV = {
  black_tea: 8,
  green_tea: 7,
  oolong_tea: 7,
  taro_tea: 5,
  milk: 12,
  sugar: 14,
  ice: 15,
  pearl: 8,
  pudding: 7,
  jelly: 7,
  golden_boba: 5,
  cheese_foam: 5,
};

export default function TopHUD() {
  const shopName = useGameStore((s) => s.shopName);
  const coins = useGameStore((s) => s.coins);
  const xp = useGameStore((s) => s.xp);
  const level = useGameStore((s) => s.level);
  const shopStars = useGameStore((s) => s.shopStars);
  const rawInv = useGameStore((s) => s.inventory);
  const inventory = rawInv || FALLBACK_INV;
  const sceneMode = useGameStore((s) => s.sceneMode);
  const cameraTarget = useGameStore((s) => s.cameraTarget);
  const setCameraTarget = useGameStore((s) => s.setCameraTarget);
  const setSceneMode = useGameStore((s) => s.setSceneMode);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const getPassiveIncomePerSec = useGameStore((s) => s.getPassiveIncomePerSec);
  const floatingPopups = useGameStore((s) => s.floatingPopups);
  const idolBuffTimer = useGameStore((s) => s.idolBuffTimer);
  const cityDrinkBuffTimer = useGameStore((s) => s.cityDrinkBuffTimer);
  const tycoonRace = useGameStore((s) => s.onlineState.tycoonRace);
  const playerName = useGameStore((s) => s.playerName);
  const customTitle = useGameStore((s) => s.character.customTitle);
  const unlockDemoMaxMode = useGameStore((s) => s.unlockDemoMaxMode);
  const resetNewGame = useGameStore((s) => s.resetNewGame);
  const startAlienQuest = useGameStore((s) => s.startAlienQuest);

  const [sfxOn, setSfxOn] = useState(true);
  const [bgmOn, setBgmOn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tier = getTierForLevel(level);
  const xpNeeded = level * 120;
  const xpPct = Math.min(100, Math.round((xp / xpNeeded) * 100));
  const passiveSec = getPassiveIncomePerSec();

  const hasLowStock =
    (inventory.milk ?? 0) <= 2 ||
    TEA_BASES.some((t) => t.unlockLevel <= level && (inventory[t.id] ?? 0) <= 2) ||
    TOPPINGS.some((t) => t.unlockLevel <= level && (inventory[t.id] ?? 0) <= 2);

  const raceStandings = tycoonRace.active
    ? [
        { name: `${playerName} (Bạn)`, earned: tycoonRace.playerEarned, isMe: true },
        ...tycoonRace.rivals.map((r) => ({ name: r.name, earned: r.earned, isMe: false })),
      ].sort((a, b) => b.earned - a.earned)
    : [];

  return (
    <header className="fixed top-0 left-0 right-0 z-20 p-2 sm:p-3 pointer-events-none">
      <div className="flex items-start justify-between gap-1.5 sm:gap-2">
        {/* Left: Cute Shop Badge, Level & Stars */}
        <div className="boba-glass rounded-2xl sm:rounded-3xl px-2.5 py-1.5 sm:px-3.5 sm:py-2 pointer-events-auto flex items-center gap-2 sm:gap-3 max-w-[52vw] sm:max-w-none">
          <div className="w-9 h-9 sm:w-11 sm:h-11 shrink-0 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-lg sm:text-2xl shadow-sm border-2 border-white">
            {tier.badge}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-extrabold text-xs sm:text-base text-[#591d3b] truncate">
                {shopName}
              </span>
              <span className="bg-amber-100 border border-amber-300 text-amber-700 text-[10px] sm:text-xs font-extrabold px-1.5 py-0.5 rounded-full shrink-0">
                ⭐{shopStars.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs mt-0.5">
              <span className="font-extrabold text-pink-600 truncate">
                Lv.{level} {customTitle || tier.title}
              </span>
              <div className="hidden sm:block w-20 h-2 bg-pink-100 rounded-full overflow-hidden border border-pink-300">
                <div
                  className="h-full bg-gradient-to-r from-pink-400 to-rose-500 transition-all duration-300"
                  style={{ width: `${xpPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center/Right Economy + Quick Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
          {/* Coins & Kho Hàng Pill */}
          <div className="boba-glass rounded-2xl sm:rounded-3xl px-2.5 py-1.5 sm:px-4 sm:py-2 flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1">
              <span className="text-base sm:text-xl">🪙</span>
              <div>
                <div className="font-display font-extrabold text-xs sm:text-lg text-amber-600 leading-none">
                  {coins.toLocaleString('vi-VN')} <span className="hidden sm:inline">Xu</span>
                </div>
                <div className="text-[9px] sm:text-[10px] text-emerald-600 font-extrabold">
                  +{passiveSec}/s
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveModal('inventory')}
              className={`relative text-[11px] sm:text-xs font-extrabold px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border transition cursor-pointer ${
                hasLowStock
                  ? 'bg-rose-500 text-white border-rose-300 animate-pulse'
                  : 'bg-pink-100 hover:bg-pink-200 text-pink-700 border-pink-300'
              }`}
            >
              📦 <span className="hidden sm:inline">Kho Hàng</span>
              {hasLowStock && (
                <span className="sm:hidden ml-0.5">!</span>
              )}
            </button>

            <button
              onClick={startAlienQuest}
              title="Sự kiện Khách UFO Ngoài Hành Tinh"
              className="hidden md:flex bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 text-emerald-800 text-xs font-extrabold px-2.5 py-1.5 rounded-xl items-center gap-1 cursor-pointer"
            >
              👽 UFO
            </button>

            <button
              onClick={unlockDemoMaxMode}
              title="Mở khóa nhanh VIP + 50.000 Xu để trải nghiệm"
              className="hidden md:flex bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-800 text-xs font-extrabold px-2.5 py-1.5 rounded-xl items-center gap-1 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-600" /> VIP Test
            </button>
          </div>

          {/* Desktop Camera & Sound Controls */}
          <div className="hidden lg:flex boba-glass rounded-3xl px-2.5 py-1.5 items-center gap-1">
            {sceneMode === 'shop' ? (
              <>
                <Camera className="w-3.5 h-3.5 text-pink-500 ml-1" />
                {[
                  { id: 'overview', label: 'Toàn cảnh' },
                  { id: 'counter', label: 'Sau Quầy' },
                  { id: 'vip', label: 'VIP' },
                  { id: 'rooftop', label: 'Tầng Cao' },
                ].map((cam) => (
                  <button
                    key={cam.id}
                    onClick={() => setCameraTarget(cam.id)}
                    className={`text-[11px] font-extrabold px-2 py-1 rounded-xl transition cursor-pointer ${
                      cameraTarget === cam.id
                        ? 'bg-gradient-to-r from-pink-400 to-rose-500 text-white shadow-xs'
                        : 'text-[#6d3b53] hover:bg-pink-100'
                    }`}
                  >
                    {cam.label}
                  </button>
                ))}
              </>
            ) : (
              <button
                onClick={() => setSceneMode('shop')}
                className="bg-gradient-to-r from-pink-400 to-rose-500 text-white text-xs font-extrabold px-3 py-1 rounded-xl cursor-pointer"
              >
                🏪 Về Quán
              </button>
            )}

            <button
              onClick={() => setSfxOn(sound.toggleSfx())}
              className={`p-1.5 rounded-xl cursor-pointer ${sfxOn ? 'bg-pink-100 text-pink-600' : 'text-slate-400'}`}
            >
              {sfxOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setBgmOn(sound.toggleBgm())}
              className={`p-1.5 rounded-xl cursor-pointer ${bgmOn ? 'bg-amber-200 text-amber-800' : 'text-slate-400 hover:bg-pink-100'}`}
            >
              <Music className="w-4 h-4" />
            </button>
            <button
              onClick={resetNewGame}
              title="Chơi lại từ đầu"
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile/Tablet Compact Utility Menu Button */}
          <div className="relative lg:hidden">
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="boba-glass p-2.5 rounded-2xl text-pink-600 cursor-pointer"
              aria-label="Tiện ích"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {mobileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 boba-glass rounded-2xl p-3 space-y-2 shadow-2xl z-40">
                <div className="text-[11px] font-extrabold text-pink-600">📷 Góc nhìn Camera</div>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { id: 'overview', label: 'Toàn cảnh' },
                    { id: 'counter', label: 'Sau Quầy' },
                    { id: 'vip', label: 'Khu VIP' },
                    { id: 'rooftop', label: 'Tầng Cao' },
                  ].map((cam) => (
                    <button
                      key={cam.id}
                      onClick={() => {
                        setCameraTarget(cam.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`text-[11px] font-bold py-1.5 rounded-xl cursor-pointer ${
                        cameraTarget === cam.id && sceneMode === 'shop'
                          ? 'bg-pink-500 text-white'
                          : 'bg-white/80 text-[#591d3b]'
                      }`}
                    >
                      {cam.label}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-1 pt-1 border-t border-pink-200">
                  <button
                    onClick={() => {
                      startAlienQuest();
                      setMobileMenuOpen(false);
                    }}
                    className="bg-emerald-100 text-emerald-800 font-extrabold text-[11px] py-1.5 rounded-xl cursor-pointer"
                  >
                    👽 Khách UFO
                  </button>
                  <button
                    onClick={() => {
                      unlockDemoMaxMode();
                      setMobileMenuOpen(false);
                    }}
                    className="bg-amber-100 text-amber-800 font-extrabold text-[11px] py-1.5 rounded-xl cursor-pointer"
                  >
                    ⚡ Test VIP
                  </button>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-pink-200">
                  <button
                    onClick={() => setSfxOn(sound.toggleSfx())}
                    className="text-xs font-bold text-pink-700 px-2 py-1 rounded-lg bg-pink-100 cursor-pointer"
                  >
                    {sfxOn ? '🔊 Âm thanh' : '🔇 Tắt tiếng'}
                  </button>
                  <button
                    onClick={() => setBgmOn(sound.toggleBgm())}
                    className="text-xs font-bold text-amber-800 px-2 py-1 rounded-lg bg-amber-100 cursor-pointer"
                  >
                    {bgmOn ? '🎵 Tắt nhạc' : '🎵 Nhạc Lo-Fi'}
                  </button>
                  <button
                    onClick={resetNewGame}
                    className="text-xs font-bold text-rose-600 px-2 py-1 rounded-lg bg-rose-100 cursor-pointer"
                  >
                    🔄
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Buffs & Floating Popups */}
      <div className="flex flex-col items-center mt-1 pointer-events-none">
        <div className="flex flex-wrap justify-center gap-1.5">
          {idolBuffTimer > 0 && (
            <div className="bg-gradient-to-r from-pink-400 to-rose-500 text-white text-[11px] font-extrabold px-3 py-0.5 rounded-full shadow flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Idol Viral x2 Khách ({idolBuffTimer}s)
            </div>
          )}
          {cityDrinkBuffTimer > 0 && (
            <div className="bg-sky-500 text-white text-[11px] font-extrabold px-3 py-0.5 rounded-full shadow">
              🧋 Buff Trà +25% Xu ({cityDrinkBuffTimer}s)
            </div>
          )}
        </div>

        <AnimatePresence>
          {floatingPopups.slice(-2).map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 6, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -18 }}
              className="mt-1 bg-white/95 border-2 border-pink-300 px-3 py-0.5 rounded-full font-display font-extrabold text-xs sm:text-sm text-pink-600 shadow-md"
            >
              {p.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Live 4P Tycoon Race Card */}
      {tycoonRace.active && (
        <div className="mt-1.5 ml-auto boba-glass rounded-2xl p-2.5 w-56 sm:w-64 pointer-events-auto">
          <div className="flex justify-between items-center text-[11px] font-extrabold text-pink-700 mb-1">
            <span>🏁 ĐẤU CHỦ QUÁN</span>
            <span className="bg-rose-500 text-white px-2 py-0.5 rounded-full">
              {Math.floor(tycoonRace.timeLeft / 60)}:{String(tycoonRace.timeLeft % 60).padStart(2, '0')}
            </span>
          </div>
          <div className="space-y-1">
            {raceStandings.map((r, i) => (
              <div
                key={r.name}
                className={`flex justify-between text-[11px] px-2 py-0.5 rounded-lg ${
                  r.isMe ? 'bg-pink-200 font-extrabold text-pink-900' : 'bg-white/70 text-[#591d3b]'
                }`}
              >
                <span className="truncate">
                  #{i + 1} {r.name}
                </span>
                <span className="font-bold text-amber-700">+{r.earned}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
