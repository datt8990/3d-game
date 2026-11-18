import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, CheckCircle2, Eye, PackagePlus } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import {
  TEA_BASES,
  MILK_OPTIONS,
  SUGAR_OPTIONS,
  ICE_OPTIONS,
  TOPPINGS,
} from '../../data/gameData';

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

export default function CraftingOverlay() {
  const sceneMode = useGameStore((s) => s.sceneMode);
  const setSceneMode = useGameStore((s) => s.setSceneMode);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const level = useGameStore((s) => s.level);
  const rawInventory = useGameStore((s) => s.inventory);
  const inventory = rawInventory && rawInventory.black_tea !== undefined ? rawInventory : FALLBACK_INV;
  const customers = useGameStore((s) => s.customers);
  const selectedCustomerUid = useGameStore((s) => s.selectedCustomerUid);
  const selectCustomerAndCraft = useGameStore((s) => s.selectCustomerAndCraft);
  const currentCup = useGameStore((s) => s.currentCup);
  const lastServeResult = useGameStore((s) => s.lastServeResult);

  const setCupTea = useGameStore((s) => s.setCupTea);
  const setCupMilk = useGameStore((s) => s.setCupMilk);
  const setCupSugar = useGameStore((s) => s.setCupSugar);
  const setCupIce = useGameStore((s) => s.setCupIce);
  const toggleCupTopping = useGameStore((s) => s.toggleCupTopping);
  const toggleAlienIngredient = useGameStore((s) => s.toggleAlienIngredient);
  const advanceToShakeStep = useGameStore((s) => s.advanceToShakeStep);
  const shakeShaker = useGameStore((s) => s.shakeShaker);
  const pourAndSealCup = useGameStore((s) => s.pourAndSealCup);
  const serveFinishedCup = useGameStore((s) => s.serveFinishedCup);
  const resetCup = useGameStore((s) => s.resetCup);
  const restockAllIngredients = useGameStore((s) => s.restockAllIngredients);

  const alienQuest = useGameStore((s) => s.alienQuest);
  const pvpBattle = useGameStore((s) => s.onlineState.pvpBattle);
  const tournament = useGameStore((s) => s.tournament);

  // Mobile step tab ('tea' | 'sugar' | 'topping' | 'finish')
  const [mobileTab, setMobileTab] = useState('tea');

  // Auto-guide mobile tab as player progresses!
  useEffect(() => {
    if (currentCup.tea === null && currentCup.milk === null) {
      setMobileTab('tea');
    } else if (currentCup.tea !== null && currentCup.milk !== null && currentCup.sugar === null) {
      setMobileTab('sugar');
    } else if (currentCup.sugar !== null && currentCup.ice !== null && currentCup.toppings.length === 0 && currentCup.step <= 4) {
      setMobileTab('topping');
    } else if (currentCup.step >= 5) {
      setMobileTab('finish');
    }
  }, [currentCup.tea, currentCup.milk, currentCup.sugar, currentCup.ice, currentCup.step]);

  useEffect(() => {
    if (sceneMode !== 'crafting') return;
    const onKey = (e) => {
      if (e.code === 'Space' && currentCup.step === 5 && currentCup.shakeProgress < 100) {
        e.preventDefault();
        shakeShaker(20);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sceneMode, currentCup.step, currentCup.shakeProgress, shakeShaker]);

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

  // Compute exact available stock including unshaken refund so 0-stock items are STRICTLY disabled!
  const prevMilkRefund =
    currentCup.shakeProgress === 0
      ? MILK_OPTIONS.find((m) => m.id === currentCup.milk)?.stockCost || 0
      : 0;
  const availMilk = (inventory.milk ?? 0) + prevMilkRefund;

  const prevSugarRefund =
    currentCup.shakeProgress === 0
      ? SUGAR_OPTIONS.find((x) => x.id === currentCup.sugar)?.stockCost || 0
      : 0;
  const availSugar = (inventory.sugar ?? 0) + prevSugarRefund;

  const prevIceRefund =
    currentCup.shakeProgress === 0
      ? ICE_OPTIONS.find((x) => x.id === currentCup.ice)?.stockCost || 0
      : 0;
  const availIce = (inventory.ice ?? 0) + prevIceRefund;

  const hasLowStock =
    (inventory.milk ?? 0) <= 2 ||
    (inventory.sugar ?? 0) <= 2 ||
    (inventory.ice ?? 0) <= 2 ||
    TEA_BASES.some((t) => t.unlockLevel <= level && (inventory[t.id] ?? 0) <= 2) ||
    TOPPINGS.some((t) => t.unlockLevel <= level && (inventory[t.id] ?? 0) <= 2);

  return (
    <div className="fixed inset-0 z-10 pointer-events-none flex flex-col justify-between pt-16 sm:pt-20 pb-18 sm:pb-20 px-2 sm:px-5">
      {/* TOP ORDER TICKET & QUICK RESTOCK */}
      <div className="flex flex-wrap justify-between items-start gap-1.5 sm:gap-2">
        <div className="pointer-events-auto max-w-full sm:max-w-md">
          {isAlienMode ? (
            <div className="boba-card-cream rounded-2xl p-2.5 sm:p-3 border-2 border-emerald-400 shadow-lg">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-display font-extrabold text-emerald-700 text-xs sm:text-sm">
                  👽 ĐƠN HÀNG THIÊN HÀ!
                </span>
                <span className="bg-rose-500 text-white text-[10px] sm:text-xs font-extrabold px-2 py-0.5 rounded-full animate-pulse">
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

              <div className="flex flex-wrap items-center gap-1 text-[10px] sm:text-xs font-extrabold">
                <span className="bg-purple-100 text-purple-900 border border-purple-200 px-1.5 sm:px-2 py-0.5 rounded-lg">
                  {teaObj?.icon} {teaObj?.shortName}
                </span>
                <span className="bg-pink-100 text-pink-900 border border-pink-200 px-1.5 sm:px-2 py-0.5 rounded-lg">
                  🥛 {activeOrder.milk}%
                </span>
                <span className="bg-amber-100 text-amber-900 border border-amber-200 px-1.5 sm:px-2 py-0.5 rounded-lg">
                  🍬 {activeOrder.sugar}%
                </span>
                <span className="bg-sky-100 text-sky-900 border border-sky-200 px-1.5 sm:px-2 py-0.5 rounded-lg">
                  🧊 {activeOrder.ice}%
                </span>
                {activeOrder.toppings.map((tid) => {
                  const top = TOPPINGS.find((x) => x.id === tid);
                  return (
                    <span
                      key={tid}
                      className="bg-emerald-100 text-emerald-900 border border-emerald-200 px-1.5 sm:px-2 py-0.5 rounded-lg"
                    >
                      {top?.icon} {top?.name}
                    </span>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="boba-card-cream rounded-2xl px-3 py-2 text-xs font-bold text-pink-700">
              🌸 Đang chờ khách đáng yêu tiếp theo ghé quán~
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

      {/* Serve Toast */}
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

      {/* KAWAII PASTEL WORKSTATION DOCK */}
      <div className="w-full max-w-5xl mx-auto boba-glass rounded-3xl p-2 sm:p-2.5 pointer-events-auto">
        {/* Mobile Step Switcher Pills (< 768px) */}
        <div className="grid grid-cols-4 gap-1 mb-2 md:hidden">
          {[
            { id: 'tea', label: '1. Trà & Sữa', done: currentCup.tea !== null && currentCup.milk !== null },
            { id: 'sugar', label: '2. Đường/Đá', done: currentCup.sugar !== null && currentCup.ice !== null },
            { id: 'topping', label: '3. Topping', done: currentCup.toppings.length > 0 },
            { id: 'finish', label: '4. Lắc & Giao', done: currentCup.isSealed },
          ].map((tb) => (
            <button
              key={tb.id}
              onClick={() => setMobileTab(tb.id)}
              className={`py-1.5 px-1 rounded-xl text-[10px] font-extrabold transition cursor-pointer ${
                mobileTab === tb.id
                  ? 'bg-gradient-to-r from-pink-400 to-rose-500 text-white shadow-xs'
                  : tb.done
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-white/80 text-[#591d3b] border border-pink-200'
              }`}
            >
              {tb.done && mobileTab !== tb.id ? '✓ ' : ''}
              {tb.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-stretch">
          {/* SECTION 1: TRÀ & SỮA */}
          <div
            className={`${
              mobileTab === 'tea' ? 'block' : 'hidden md:block'
            } md:col-span-3 space-y-1.5 bg-white/80 rounded-2xl p-2.5 border-2 border-pink-200/80`}
          >
            <div className="flex justify-between items-center text-[11px] font-extrabold text-pink-700">
              <span>🍓 1. Trà & 2. Sữa</span>
              <span className={(inventory.milk ?? 0) <= 2 ? 'text-rose-600 animate-pulse' : 'text-sky-700'}>
                🥛 Sữa: {inventory.milk ?? 0}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {TEA_BASES.map((t) => {
                const locked = t.unlockLevel > level;
                const stock = inventory[t.id] ?? 0;
                const active = currentCup.tea === t.id;
                const isDisabled = locked || (stock <= 0 && !active);

                return (
                  <button
                    key={t.id}
                    disabled={isDisabled}
                    onClick={() => setCupTea(t.id)}
                    className={`px-2 py-1.5 rounded-xl text-[11px] font-extrabold flex items-center justify-between gap-1 border transition ${
                      locked
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                        : active
                        ? 'bg-gradient-to-r from-pink-400 to-rose-500 text-white border-pink-500 shadow-sm cursor-pointer'
                        : isDisabled
                        ? 'bg-rose-50 text-rose-300 border-rose-200 opacity-65 cursor-not-allowed line-through'
                        : 'bg-pink-50/70 hover:bg-pink-100 text-[#4a1d35] border-pink-200 cursor-pointer'
                    }`}
                  >
                    <span className="truncate">
                      {t.icon} {t.shortName}
                    </span>
                    {!locked && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold ${
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

            <div className="grid grid-cols-3 gap-1">
              {MILK_OPTIONS.map((m) => {
                const active = currentCup.milk === m.id;
                const noMilk = availMilk < m.stockCost && !active;
                return (
                  <button
                    key={m.id}
                    disabled={noMilk}
                    onClick={() => setCupMilk(m.id)}
                    className={`py-1.5 rounded-xl text-[10px] font-extrabold border transition ${
                      active
                        ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white border-pink-500 cursor-pointer'
                        : noMilk
                        ? 'bg-rose-50 text-rose-300 border-rose-200 opacity-60 cursor-not-allowed line-through'
                        : 'bg-white hover:bg-pink-50 text-[#591d3b] border-pink-200 cursor-pointer'
                    }`}
                  >
                    {m.short}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: ĐƯỜNG & ĐÁ */}
          <div
            className={`${
              mobileTab === 'sugar' ? 'block' : 'hidden md:block'
            } md:col-span-3 space-y-1.5 bg-white/80 rounded-2xl p-2.5 border-2 border-pink-200/80`}
          >
            <div className="flex justify-between items-center text-[11px] font-extrabold text-pink-700">
              <span>🍬 3. Đường & Đá</span>
              <span className="text-[10px] text-[#6d3b53]">
                🍬{inventory.sugar ?? 0} • 🧊{inventory.ice ?? 0}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1">
              {SUGAR_OPTIONS.map((s) => {
                const active = currentCup.sugar === s.id;
                const noSugar = availSugar < s.stockCost && !active;
                return (
                  <button
                    key={s.id}
                    disabled={noSugar}
                    onClick={() => setCupSugar(s.id)}
                    className={`py-1.5 rounded-xl text-[10px] font-extrabold border transition ${
                      active
                        ? 'bg-amber-400 text-amber-950 border-amber-500 cursor-pointer'
                        : noSugar
                        ? 'bg-rose-50 text-rose-300 border-rose-200 opacity-60 cursor-not-allowed line-through'
                        : 'bg-amber-50/70 hover:bg-amber-100 text-amber-900 border-amber-200 cursor-pointer'
                    }`}
                  >
                    {s.id}%
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-3 gap-1">
              {ICE_OPTIONS.map((ic) => {
                const active = currentCup.ice === ic.id;
                const noIce = availIce < ic.stockCost && !active;
                return (
                  <button
                    key={ic.id}
                    disabled={noIce}
                    onClick={() => setCupIce(ic.id)}
                    className={`py-1.5 rounded-xl text-[10px] font-extrabold border transition ${
                      active
                        ? 'bg-sky-400 text-white border-sky-500 cursor-pointer'
                        : noIce
                        ? 'bg-rose-50 text-rose-300 border-rose-200 opacity-60 cursor-not-allowed line-through'
                        : 'bg-sky-50/80 hover:bg-sky-100 text-sky-900 border-sky-200 cursor-pointer'
                    }`}
                  >
                    🧊 {ic.id}%
                  </button>
                );
              })}
            </div>

            {isAlienMode && (
              <button
                onClick={() => toggleAlienIngredient('loveSpice')}
                className={`w-full py-1.5 rounded-xl text-[10px] font-extrabold cursor-pointer ${
                  currentCup.loveSpice
                    ? 'bg-gradient-to-r from-pink-400 to-rose-500 text-white'
                    : 'bg-pink-100 text-pink-700 border border-pink-300'
                }`}
              >
                💖 {currentCup.loveSpice ? 'Đã thêm Tình Yêu!' : '+ Gia vị Tình Yêu'}
              </button>
            )}
          </div>

          {/* SECTION 3: TOPPING */}
          <div
            className={`${
              mobileTab === 'topping' ? 'block' : 'hidden md:block'
            } md:col-span-3 space-y-1.5 bg-white/80 rounded-2xl p-2.5 border-2 border-pink-200/80`}
          >
            <div className="flex justify-between items-center text-[11px] font-extrabold text-pink-700">
              <span>🍮 4. Topping Cute</span>
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
                const isDisabled = locked || (stock <= 0 && !selected);

                return (
                  <button
                    key={top.id}
                    disabled={isDisabled}
                    onClick={() => toggleCupTopping(top.id)}
                    className={`px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold flex items-center gap-1 border transition ${
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
                      {top.icon} {top.name.replace('Trân Châu ', 'TC ')}
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
              <div className="grid grid-cols-2 gap-1">
                <button
                  disabled={(inventory.pearl ?? 0) <= 0 && !currentCup.pearl200}
                  onClick={() => toggleAlienIngredient('pearl200')}
                  className={`py-1 rounded-xl text-[10px] font-extrabold cursor-pointer ${
                    currentCup.pearl200 ? 'bg-emerald-400 text-white' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}
                >
                  ⚫ x200 TC
                </button>
                <button
                  disabled={(inventory.pudding ?? 0) <= 0 && !currentCup.pudding5}
                  onClick={() => toggleAlienIngredient('pudding5')}
                  className={`py-1 rounded-xl text-[10px] font-extrabold cursor-pointer ${
                    currentCup.pudding5 ? 'bg-amber-400 text-slate-950' : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  🍮 x5 Pudding
                </button>
              </div>
            )}
          </div>

          {/* SECTION 4: LẮC BÌNH, DẬP NẮP & GIAO KHÁCH */}
          <div
            className={`${
              mobileTab === 'finish' ? 'block' : 'hidden md:block'
            } md:col-span-3 space-y-2 bg-white/80 rounded-2xl p-2.5 border-2 border-pink-200/80 flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-pink-700">
                🧋 5. Lắc ({currentCup.shakeProgress}%) & 6. Giao
              </span>
              <button
                onClick={resetCup}
                className="text-[10px] font-bold text-rose-500 hover:text-rose-700 flex items-center gap-0.5 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Làm lại
              </button>
            </div>

            <div className="w-full h-2.5 bg-pink-100 rounded-full overflow-hidden border border-pink-200">
              <div
                className="h-full bg-gradient-to-r from-pink-400 via-purple-400 to-amber-400 transition-all duration-100"
                style={{ width: `${currentCup.shakeProgress}%` }}
              />
            </div>

            {currentCup.shakeProgress < 100 ? (
              <button
                disabled={!currentCup.tea}
                onClick={() => {
                  if (currentCup.step < 5) advanceToShakeStep();
                  shakeShaker(25);
                }}
                className={`w-full py-2.5 rounded-2xl text-xs font-extrabold transition ${
                  !currentCup.tea
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-pink-400 to-purple-500 hover:brightness-105 text-white shadow-md cursor-pointer'
                }`}
              >
                🫨 BẤM ĐỂ LẮC BÌNH!
              </button>
            ) : !currentCup.isSealed ? (
              <button
                onClick={pourAndSealCup}
                className="w-full py-2.5 rounded-2xl text-xs font-extrabold bg-gradient-to-r from-amber-400 to-orange-400 hover:brightness-105 text-slate-950 shadow-md cursor-pointer"
              >
                ⚙️ ĐỔ CỐC & DẬP NẮP
              </button>
            ) : (
              <button
                onClick={serveFinishedCup}
                className="w-full py-2.5 rounded-2xl text-xs font-display font-extrabold bg-gradient-to-r from-emerald-400 to-teal-400 hover:brightness-105 text-white shadow-lg flex items-center justify-center gap-1 cursor-pointer animate-pulse"
              >
                <CheckCircle2 className="w-4 h-4" /> GIAO LY TRÀ SỮA! 💖
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
