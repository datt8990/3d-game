import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Sparkles, Eye, PackagePlus, Check } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import {
  TEA_BASES,
  MILK_OPTIONS,
  SUGAR_OPTIONS,
  ICE_OPTIONS,
  TOPPINGS,
} from '../../data/gameData';

const FALLBACK_INV = {
  black_tea: 10,
  strawberry_tea: 10,
  green_tea: 8,
  oolong_tea: 8,
  taro_tea: 6,
  milk: 14,
  sugar: 15,
  ice: 15,
  pearl: 10,
  pudding: 8,
  jelly: 8,
  golden_boba: 6,
  cheese_foam: 6,
};

export default function CraftingOverlay() {
  const sceneMode = useGameStore((s) => s.sceneMode);
  const setSceneMode = useGameStore((s) => s.setSceneMode);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const level = useGameStore((s) => s.level);
  const rawInventory = useGameStore((s) => s.inventory);
  const inventory = rawInventory && rawInventory.black_tea !== undefined ? rawInventory : FALLBACK_INV;
  const customers = useGameStore((s) => s.customers);
  const selectedCustomerUid = useGameStore((s) => s.selectedCustomerUid);
  const currentCup = useGameStore((s) => s.currentCup);
  const lastServeResult = useGameStore((s) => s.lastServeResult);

  const setCupTea = useGameStore((s) => s.setCupTea);
  const setCupMilk = useGameStore((s) => s.setCupMilk);
  const setCupSugar = useGameStore((s) => s.setCupSugar);
  const setCupIce = useGameStore((s) => s.setCupIce);
  const toggleCupTopping = useGameStore((s) => s.toggleCupTopping);
  const toggleAlienIngredient = useGameStore((s) => s.toggleAlienIngredient);
  const autoShakeSealAndServe = useGameStore((s) => s.autoShakeSealAndServe);
  const resetCup = useGameStore((s) => s.resetCup);
  const restockAllIngredients = useGameStore((s) => s.restockAllIngredients);

  const alienQuest = useGameStore((s) => s.alienQuest);
  const pvpBattle = useGameStore((s) => s.onlineState.pvpBattle);
  const tournament = useGameStore((s) => s.tournament);

  // Effortless 3-tab mobile layout: 'tea' | 'topping' | 'serve'
  const [mobileTab, setMobileTab] = useState('tea');

  useEffect(() => {
    if (!currentCup.tea) {
      setMobileTab('tea');
    } else if (currentCup.isServingAnim) {
      setMobileTab('serve');
    }
  }, [currentCup.tea, currentCup.isServingAnim]);

  useEffect(() => {
    if (sceneMode !== 'crafting') return;
    const onKey = (e) => {
      if (e.code === 'Space' && currentCup.tea && !currentCup.isServingAnim) {
        e.preventDefault();
        autoShakeSealAndServe();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sceneMode, currentCup.tea, currentCup.isServingAnim, autoShakeSealAndServe]);

  if (sceneMode !== 'crafting') return null;

  const activeCustomer =
    customers.find((c) => c.uid === selectedCustomerUid) || customers[0] || null;
  const isAlienMode = alienQuest.active && alienQuest.stage === 'crafting';

  const activeOrder = pvpBattle.active
    ? pvpBattle.sharedOrder
    : tournament.active
    ? tournament.order
    : activeCustomer?.order;

  const teaObj = activeOrder ? TEA_BASES.find((t) => t.id === activeOrder.tea) : null;

  const availMilk = inventory.milk ?? 0;
  const availSugar = inventory.sugar ?? 0;
  const availIce = inventory.ice ?? 0;

  const hasLowStock =
    availMilk <= 2 ||
    availSugar <= 2 ||
    availIce <= 2 ||
    TEA_BASES.some((t) => t.unlockLevel <= level && (inventory[t.id] ?? 0) <= 2) ||
    TOPPINGS.some((t) => t.unlockLevel <= level && (inventory[t.id] ?? 0) <= 2);

  const canServeNow = (Boolean(currentCup.tea) || isAlienMode) && !currentCup.isServingAnim;

  const serveStatusText = !currentCup.isServingAnim
    ? '✨ LẮC, DẬP NẮP & GIAO KHÁCH!'
    : currentCup.isSealed
    ? '💖 Đang trao ly cho khách...'
    : currentCup.isPoured
    ? '⚙️ Đang dập nắp xinh xắn...'
    : '🧋 Đang lắc trà sữa thật đều...';

  return (
    <div className="fixed inset-0 z-10 pointer-events-none flex flex-col justify-between pt-16 sm:pt-20 pb-18 sm:pb-20 px-2 sm:px-5">
      {/* TOP ORDER TICKET WITH LIVE CHECKMARKS */}
      <div className="flex flex-wrap justify-between items-start gap-1.5 sm:gap-2">
        <div className="pointer-events-auto max-w-full sm:max-w-lg">
          {isAlienMode ? (
            <div className="boba-card-cream rounded-2xl p-2.5 sm:p-3 border-2 border-emerald-400 shadow-lg">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-display font-extrabold text-emerald-700 text-xs sm:text-sm">
                  👽 ĐƠN HÀNG THIÊN HÀ!
                </span>
                <span className="bg-rose-500 text-white text-[10px] sm:text-xs font-extrabold px-2 py-0.5 rounded-full">
                  🫧 Oxy: {alienQuest.timeLeft}s
                </span>
              </div>
              <div className="flex flex-wrap gap-1 text-[10px] sm:text-[11px] font-extrabold">
                <span className={currentCup.sugar === 0 ? 'bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-lg' : 'bg-pink-100 text-pink-800 px-2 py-0.5 rounded-lg'}>
                  ✓ 0% Đường
                </span>
                <span className={currentCup.loveSpice ? 'bg-pink-400 text-white px-2 py-0.5 rounded-lg' : 'bg-pink-100 text-pink-800 px-2 py-0.5 rounded-lg'}>
                  💖 Ngọt tình yêu
                </span>
                <span className={currentCup.pearl200 ? 'bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-lg' : 'bg-pink-100 text-pink-800 px-2 py-0.5 rounded-lg'}>
                  ⚫ 200 TC
                </span>
                <span className={currentCup.pudding5 ? 'bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-lg' : 'bg-pink-100 text-pink-800 px-2 py-0.5 rounded-lg'}>
                  🍮 5 Pudding
                </span>
              </div>
            </div>
          ) : activeOrder ? (
            <div className="boba-card-cream rounded-2xl px-3 py-2 shadow-lg">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-display font-extrabold text-xs sm:text-sm text-pink-600">
                  {pvpBattle.active
                    ? `⚔️ Solo vs ${pvpBattle.opponentName}`
                    : tournament.active
                    ? `👑 Giải Đấu Vòng ${tournament.round}/3`
                    : `${activeCustomer.icon} ${activeCustomer.type}`}
                </span>
                <span className="bg-gradient-to-r from-pink-400 to-rose-500 text-white text-[10px] sm:text-[11px] font-extrabold px-2 py-0.5 rounded-full">
                  ⏳{' '}
                  {pvpBattle.active
                    ? `${pvpBattle.timeLeft}s`
                    : tournament.active
                    ? `${tournament.timeLeft}s`
                    : `${activeCustomer.patience}s`}
                </span>
              </div>

              {pvpBattle.active && (
                <div className="w-full h-1.5 bg-pink-100 rounded-full overflow-hidden mb-1">
                  <div
                    className="h-full bg-gradient-to-r from-sky-400 to-rose-500 transition-all duration-300"
                    style={{ width: `${pvpBattle.opponentProgress}%` }}
                  />
                </div>
              )}

              {/* Live Match Chips: turns emerald when your cup matches the customer's wish! */}
              <div className="flex flex-wrap items-center gap-1 text-[10px] sm:text-xs font-extrabold">
                <span
                  className={`px-1.5 sm:px-2 py-0.5 rounded-lg border flex items-center gap-0.5 ${
                    currentCup.tea === activeOrder.tea
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-pink-50 text-pink-900 border-pink-200'
                  }`}
                >
                  {currentCup.tea === activeOrder.tea && <Check className="w-3 h-3" />}
                  {teaObj?.icon} {teaObj?.shortName}
                </span>
                <span
                  className={`px-1.5 sm:px-2 py-0.5 rounded-lg border ${
                    currentCup.milk === activeOrder.milk
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-white text-pink-900 border-pink-200'
                  }`}
                >
                  🥛 {activeOrder.milk}%
                </span>
                <span
                  className={`px-1.5 sm:px-2 py-0.5 rounded-lg border ${
                    currentCup.sugar === activeOrder.sugar
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-amber-50 text-amber-900 border-amber-200'
                  }`}
                >
                  🍬 {activeOrder.sugar}%
                </span>
                <span
                  className={`px-1.5 sm:px-2 py-0.5 rounded-lg border ${
                    currentCup.ice === activeOrder.ice
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-sky-50 text-sky-900 border-sky-200'
                  }`}
                >
                  🧊 {activeOrder.ice}%
                </span>
                {activeOrder.toppings.map((tid) => {
                  const top = TOPPINGS.find((x) => x.id === tid);
                  const matched = currentCup.toppings.includes(tid);
                  return (
                    <span
                      key={tid}
                      className={`px-1.5 sm:px-2 py-0.5 rounded-lg border flex items-center gap-0.5 ${
                        matched
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-purple-50 text-purple-900 border-purple-200'
                      }`}
                    >
                      {matched && <Check className="w-3 h-3" />}
                      {top?.icon} {top?.shortName}
                    </span>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="boba-card-cream rounded-2xl px-3 py-2 text-xs font-bold text-pink-700">
              🌸 Đang chờ vị khách đáng yêu tiếp theo ghé quán~
            </div>
          )}
        </div>

        {/* Right: Restock & Shop View */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          <button
            onClick={restockAllIngredients}
            className={`text-[11px] sm:text-xs font-extrabold px-2.5 sm:px-3 py-1.5 rounded-xl shadow cursor-pointer flex items-center gap-1 ${
              hasLowStock
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white ring-2 ring-rose-200'
                : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300'
            }`}
          >
            <PackagePlus className="w-3.5 h-3.5" />
            {hasLowStock ? '🚚 Nhập Đầy Kho!' : '🚚 Nhập Nhanh'}
          </button>

          <button
            onClick={() => setSceneMode('shop')}
            className="boba-card-cream hover:bg-pink-50 text-[11px] sm:text-xs font-extrabold text-pink-700 px-2.5 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Toàn Quán</span>
          </button>
        </div>
      </div>

      {/* Serve Result Toast */}
      {lastServeResult && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mx-auto pointer-events-none rounded-2xl px-3.5 py-1 text-xs font-extrabold border-2 shadow-md ${
            lastServeResult.isSuccess
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-rose-50 border-rose-300 text-rose-800'
          }`}
        >
          {lastServeResult.customerType} ({lastServeResult.accuracy}%): {lastServeResult.comment}
        </motion.div>
      )}

      {/* EFFORTLESS 3-STEP KAWAII BARISTA DOCK */}
      <div className="w-full max-w-5xl mx-auto boba-glass rounded-3xl p-2 sm:p-2.5 pointer-events-auto">
        {/* Mobile 3-Step Switcher (< 768px) */}
        <div className="grid grid-cols-3 gap-1.5 mb-2 md:hidden">
          {[
            { id: 'tea', label: '1. Vị Trà', done: Boolean(currentCup.tea) },
            { id: 'topping', label: '2. Topping', done: currentCup.toppings.length > 0 },
            { id: 'serve', label: '3. Giao Ly ✨', done: currentCup.isSealed },
          ].map((tb) => (
            <button
              key={tb.id}
              onClick={() => setMobileTab(tb.id)}
              className={`py-1.5 px-2 rounded-xl text-[11px] font-extrabold transition cursor-pointer ${
                mobileTab === tb.id
                  ? 'bg-gradient-to-r from-pink-400 to-rose-500 text-white shadow-xs'
                  : tb.done
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-white/85 text-[#591d3b] border border-pink-200'
              }`}
            >
              {tb.done && mobileTab !== tb.id ? '✓ ' : ''}
              {tb.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-stretch">
          {/* STEP 1: CHỌN VỊ TRÀ SỮA + CHỈNH NHANH SỮA/ĐƯỜNG/ĐÁ */}
          <div
            className={`${
              mobileTab === 'tea' ? 'block' : 'hidden md:block'
            } md:col-span-5 space-y-1.5 bg-white/85 rounded-2xl p-2.5 border-2 border-pink-200/80`}
          >
            <div className="flex justify-between items-center text-[11px] font-extrabold text-pink-700">
              <span>🍓 Bước 1: Chọn Vị Trà Sữa</span>
              <span className="text-[10px] text-[#6d3b53]">
                🥛{availMilk} • 🍬{availSugar} • 🧊{availIce}
              </span>
            </div>

            {/* 5 Signature Tea Flavor Buttons */}
            <div className="flex flex-wrap gap-1.5">
              {TEA_BASES.map((t) => {
                const locked = t.unlockLevel > level;
                const stock = inventory[t.id] ?? 0;
                const active = currentCup.tea === t.id;
                const isDisabled = locked || (stock <= 0 && !active) || currentCup.isServingAnim;

                return (
                  <button
                    key={t.id}
                    disabled={isDisabled}
                    onClick={() => setCupTea(t.id)}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold flex items-center gap-1 border transition ${
                      locked
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                        : active
                        ? 'bg-gradient-to-r from-pink-400 to-rose-500 text-white border-pink-500 shadow-sm cursor-pointer'
                        : isDisabled
                        ? 'bg-rose-50 text-rose-300 border-rose-200 opacity-65 cursor-not-allowed line-through'
                        : 'bg-pink-50/70 hover:bg-pink-100 text-[#4a1d35] border-pink-200 cursor-pointer'
                    }`}
                  >
                    <span>
                      {t.icon} {t.shortName}
                    </span>
                    {!locked && (
                      <span
                        className={`px-1.5 rounded-full text-[9px] font-extrabold ${
                          stock === 0
                            ? 'bg-rose-500 text-white'
                            : stock <= 2
                            ? 'bg-amber-400 text-slate-950'
                            : active
                            ? 'bg-white/30 text-white'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {stock}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Compact Pre-Defaulted Milk / Sugar / Ice Tweakers */}
            <div className="grid grid-cols-3 gap-1.5 pt-0.5">
              <div className="flex items-center gap-0.5 bg-pink-50/70 rounded-xl p-1 border border-pink-100">
                <span className="text-[10px] px-0.5">🥛</span>
                {MILK_OPTIONS.map((m) => {
                  const active = currentCup.milk === m.id;
                  const disabled = (availMilk < m.stockCost && !active) || currentCup.isServingAnim;
                  return (
                    <button
                      key={m.id}
                      disabled={disabled}
                      onClick={() => setCupMilk(m.id)}
                      className={`flex-1 py-1 rounded-lg text-[9px] font-extrabold transition ${
                        active
                          ? 'bg-pink-400 text-white cursor-pointer'
                          : disabled
                          ? 'text-rose-300 opacity-50 cursor-not-allowed line-through'
                          : 'text-[#591d3b] hover:bg-pink-100 cursor-pointer'
                      }`}
                    >
                      {m.id}%
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-0.5 bg-amber-50/70 rounded-xl p-1 border border-amber-100">
                <span className="text-[10px] px-0.5">🍬</span>
                {SUGAR_OPTIONS.map((s) => {
                  const active = currentCup.sugar === s.id;
                  const disabled = (availSugar < s.stockCost && !active) || currentCup.isServingAnim;
                  return (
                    <button
                      key={s.id}
                      disabled={disabled}
                      onClick={() => setCupSugar(s.id)}
                      className={`flex-1 py-1 rounded-lg text-[9px] font-extrabold transition ${
                        active
                          ? 'bg-amber-400 text-amber-950 cursor-pointer'
                          : disabled
                          ? 'text-rose-300 opacity-50 cursor-not-allowed line-through'
                          : 'text-amber-900 hover:bg-amber-100 cursor-pointer'
                      }`}
                    >
                      {s.id}%
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-0.5 bg-sky-50/70 rounded-xl p-1 border border-sky-100">
                <span className="text-[10px] px-0.5">🧊</span>
                {ICE_OPTIONS.map((ic) => {
                  const active = currentCup.ice === ic.id;
                  const disabled = (availIce < ic.stockCost && !active) || currentCup.isServingAnim;
                  return (
                    <button
                      key={ic.id}
                      disabled={disabled}
                      onClick={() => setCupIce(ic.id)}
                      className={`flex-1 py-1 rounded-lg text-[9px] font-extrabold transition ${
                        active
                          ? 'bg-sky-400 text-white cursor-pointer'
                          : disabled
                          ? 'text-rose-300 opacity-50 cursor-not-allowed line-through'
                          : 'text-sky-900 hover:bg-sky-100 cursor-pointer'
                      }`}
                    >
                      {ic.id}%
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* STEP 2: THẢ TOPPING CUTE */}
          <div
            className={`${
              mobileTab === 'topping' ? 'block' : 'hidden md:block'
            } md:col-span-4 space-y-1.5 bg-white/85 rounded-2xl p-2.5 border-2 border-pink-200/80`}
          >
            <div className="flex justify-between items-center text-[11px] font-extrabold text-pink-700">
              <span>🍮 Bước 2: Thả Topping</span>
              <button
                onClick={() => setActiveModal('inventory')}
                className="text-[10px] text-emerald-700 underline cursor-pointer"
              >
                +Nhập kho
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {TOPPINGS.map((top) => {
                const locked = top.unlockLevel > level;
                const stock = inventory[top.id] ?? 0;
                const selected = currentCup.toppings.includes(top.id);
                const isDisabled = locked || (stock <= 0 && !selected) || currentCup.isServingAnim;

                return (
                  <button
                    key={top.id}
                    disabled={isDisabled}
                    onClick={() => toggleCupTopping(top.id)}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold flex items-center gap-1 border transition ${
                      locked
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                        : selected
                        ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-white border-emerald-500 shadow-xs cursor-pointer'
                        : isDisabled
                        ? 'bg-rose-50 text-rose-300 border-rose-200 opacity-65 cursor-not-allowed line-through'
                        : 'bg-pink-50/60 hover:bg-pink-100 text-[#4a1d35] border-pink-200 cursor-pointer'
                    }`}
                  >
                    <span>
                      {top.icon} {top.shortName}
                    </span>
                    {!locked && (
                      <span
                        className={`px-1.5 rounded-full text-[9px] font-extrabold ${
                          stock === 0
                            ? 'bg-rose-500 text-white'
                            : stock <= 2
                            ? 'bg-amber-400 text-slate-950'
                            : selected
                            ? 'bg-white/30 text-white'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {stock}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {isAlienMode && (
              <div className="grid grid-cols-3 gap-1 pt-0.5">
                <button
                  onClick={() => toggleAlienIngredient('loveSpice')}
                  className={`py-1 rounded-xl text-[10px] font-extrabold cursor-pointer ${
                    currentCup.loveSpice ? 'bg-pink-500 text-white' : 'bg-pink-100 text-pink-800'
                  }`}
                >
                  💖 Tình Yêu
                </button>
                <button
                  onClick={() => toggleAlienIngredient('pearl200')}
                  className={`py-1 rounded-xl text-[10px] font-extrabold cursor-pointer ${
                    currentCup.pearl200 ? 'bg-emerald-400 text-white' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  ⚫ x200 TC
                </button>
                <button
                  onClick={() => toggleAlienIngredient('pudding5')}
                  className={`py-1 rounded-xl text-[10px] font-extrabold cursor-pointer ${
                    currentCup.pudding5 ? 'bg-amber-400 text-slate-950' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  🍮 x5 Pud
                </button>
              </div>
            )}
          </div>

          {/* STEP 3: 1-TAP MAGIC SHAKE, SEAL & SERVE! */}
          <div
            className={`${
              mobileTab === 'serve' ? 'block' : 'hidden md:block'
            } md:col-span-3 space-y-2 bg-white/85 rounded-2xl p-2.5 border-2 border-pink-200/80 flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-pink-700">
                ✨ Bước 3: Hoàn Tất
              </span>
              <button
                disabled={currentCup.isServingAnim}
                onClick={resetCup}
                className="text-[10px] font-bold text-rose-500 hover:text-rose-700 flex items-center gap-0.5 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Làm lại
              </button>
            </div>

            {/* Smooth Progress Bar during 1-tap Shake & Seal */}
            <div className="w-full h-2.5 bg-pink-100 rounded-full overflow-hidden border border-pink-200">
              <div
                className="h-full bg-gradient-to-r from-pink-400 via-rose-400 to-amber-400 transition-all duration-200"
                style={{ width: `${currentCup.isSealed ? 100 : currentCup.shakeProgress}%` }}
              />
            </div>

            <button
              disabled={!canServeNow}
              onClick={autoShakeSealAndServe}
              className={`w-full py-2.5 px-2 rounded-2xl text-xs font-display font-extrabold flex items-center justify-center gap-1.5 transition ${
                canServeNow
                  ? 'bg-gradient-to-r from-pink-400 via-rose-400 to-amber-400 hover:brightness-105 text-white shadow-md cursor-pointer'
                  : currentCup.isServingAnim
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-white cursor-wait'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span className="truncate">{serveStatusText}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
