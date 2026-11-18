import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Store, Globe2, ShoppingBag, Edit3, PackagePlus, Truck } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import {
  SHOP_UPGRADES,
  FRANCHISE_CITIES,
  TEA_BASES,
  BASE_INGREDIENTS,
  TOPPINGS,
} from '../../data/gameData';

export default function ShopUpgradeModal() {
  const activeModal = useGameStore((s) => s.activeModal);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const coins = useGameStore((s) => s.coins);
  const level = useGameStore((s) => s.level);
  const shopName = useGameStore((s) => s.shopName);
  const rawInventory = useGameStore((s) => s.inventory);
  const inventory = rawInventory || {};
  const maxCap = useGameStore((s) => 15 + (s.upgrades?.expand_shop || 0) * 10);
  const upgrades = useGameStore((s) => s.upgrades);
  const franchises = useGameStore((s) => s.franchises);
  const buyUpgrade = useGameStore((s) => s.buyUpgrade);
  const buyFranchise = useGameStore((s) => s.buyFranchise);
  const buyIngredientStock = useGameStore((s) => s.buyIngredientStock);
  const restockAllIngredients = useGameStore((s) => s.restockAllIngredients);
  const addCoinsAndXp = useGameStore((s) => s.addCoinsAndXp);
  const addPopup = useGameStore((s) => s.addPopup);

  const [tab, setTab] = useState('upgrades'); // 'upgrades' | 'inventory' | 'franchise'
  const [newShopTitle, setNewShopTitle] = useState(shopName);

  useEffect(() => {
    if (activeModal === 'inventory') setTab('inventory');
    else if (activeModal === 'shop_upgrade') setTab('upgrades');
  }, [activeModal]);

  if (activeModal !== 'shop_upgrade' && activeModal !== 'items' && activeModal !== 'inventory') {
    return null;
  }

  const isItemShop = activeModal === 'items';

  const allStockItems = [
    ...TEA_BASES.map((t) => ({ ...t, group: 'Trà Nền' })),
    ...BASE_INGREDIENTS.map((b) => ({ ...b, unlockLevel: 1, group: 'Sữa • Đường • Đá' })),
    ...TOPPINGS.map((tp) => ({ ...tp, group: 'Topping' })),
  ];

  const specialItems = [
    {
      id: 'idol_megaphone',
      icon: '📢',
      name: 'Loa Quảng Cáo Idol Viral',
      cost: 280,
      desc: 'Kích hoạt ngay 45 giây hiệu ứng Idol quảng cáo x2 lượng khách & x1.5 Xu!',
      onBuy: () => {
        if (coins < 280) return addPopup('Chưa đủ 280 Xu!', '#f43f5e');
        addCoinsAndXp(-280, 40);
        useGameStore.setState({ idolBuffTimer: 45 });
        addPopup('📢 Kích hoạt Loa Quảng Cáo Idol 45s!', '#f472b6');
      },
    },
    {
      id: 'golden_recipe_book',
      icon: '📖',
      name: 'Bí Kíp Trà Sữa Hoàng Cung (+XP)',
      cost: 350,
      desc: 'Tăng ngay +320 Điểm Kinh Nghiệm (XP) giúp thăng cấp danh hiệu siêu tốc!',
      onBuy: () => {
        if (coins < 350) return addPopup('Chưa đủ 350 Xu!', '#f43f5e');
        addCoinsAndXp(-350, 320);
        addPopup('📖 Lĩnh hội Bí Kíp +320 XP!', '#38bdf8');
      },
    },
    {
      id: 'five_star_pr',
      icon: '🌟',
      name: 'Chiến Dịch Truyền Thông 5 Sao',
      cost: 400,
      desc: 'Nâng điểm đánh giá uy tín cửa hàng lên tối đa 5.0 ⭐!',
      onBuy: () => {
        if (coins < 400) return addPopup('Chưa đủ 400 Xu!', '#f43f5e');
        addCoinsAndXp(-400, 50);
        useGameStore.setState({ shopStars: 5.0 });
        addPopup('⭐ Cửa hàng đạt chuẩn 5.0 Sao Tuyệt Đối!', '#facc15');
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-3xl boba-glass rounded-3xl p-5 max-h-[84vh] flex flex-col"
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/15">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">
              {isItemShop ? '🛍️' : tab === 'inventory' ? '📦' : '🏪'}
            </span>
            <div>
              <h2 className="font-display font-extrabold text-xl text-white">
                {isItemShop
                  ? 'CỬA HÀNG VẬT PHẨM ĐẶC BIỆT'
                  : 'QUẢN LÝ QUÁN, KHO NGUYÊN LIỆU & CHI NHÁNH'}
              </h2>
              <p className="text-xs text-pink-200">
                Số dư: <b className="text-yellow-300">{coins.toLocaleString('vi-VN')} Xu</b> • Sức chứa kho tối đa:{' '}
                <b className="text-emerald-300">{maxCap} phần/loại</b>
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

        {!isItemShop && (
          <div className="flex flex-wrap items-center justify-between gap-2 my-3">
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setTab('upgrades')}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer ${
                  tab === 'upgrades' ? 'bg-pink-500 text-white' : 'bg-white/10 text-slate-200'
                }`}
              >
                <Store className="w-4 h-4" /> Nâng Cấp Quán 3D
              </button>
              <button
                onClick={() => setTab('inventory')}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer ${
                  tab === 'inventory' ? 'bg-emerald-500 text-slate-950' : 'bg-white/10 text-slate-200'
                }`}
              >
                <PackagePlus className="w-4 h-4" /> Kho & Nhập Nguyên Liệu
              </button>
              <button
                onClick={() => setTab('franchise')}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer ${
                  tab === 'franchise' ? 'bg-amber-400 text-slate-950' : 'bg-white/10 text-slate-200'
                }`}
              >
                <Globe2 className="w-4 h-4" /> Chuỗi Đa Thành Phố
              </button>
            </div>

            {tab === 'inventory' ? (
              <button
                onClick={restockAllIngredients}
                className="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-extrabold text-xs px-3.5 py-2 rounded-xl shadow flex items-center gap-1.5 cursor-pointer"
              >
                <Truck className="w-4 h-4" /> Nhập Đầy Toàn Bộ Kho
              </button>
            ) : (
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/15 rounded-xl px-2.5 py-1">
                <Edit3 className="w-3.5 h-3.5 text-pink-300" />
                <input
                  value={newShopTitle}
                  onChange={(e) => setNewShopTitle(e.target.value)}
                  maxLength={22}
                  className="bg-transparent text-xs font-bold text-white focus:outline-none w-32"
                  placeholder="Tên thương hiệu..."
                />
                <button
                  onClick={() => {
                    if (newShopTitle.trim()) {
                      useGameStore.setState({ shopName: newShopTitle.trim() });
                      addPopup('Đã cập nhật bảng hiệu 3D!', '#4ade80');
                    }
                  }}
                  className="bg-pink-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg cursor-pointer"
                >
                  Đổi tên
                </button>
              </div>
            )}
          </div>
        )}

        <div className="overflow-y-auto pr-1 space-y-2.5 mt-1 flex-1">
          {isItemShop ? (
            <div className="grid sm:grid-cols-2 gap-3">
              {/* Quick Full Restock Card inside Item Shop too! */}
              <div className="bg-emerald-950/40 border border-emerald-400/50 rounded-2xl p-4 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <span className="text-3xl">📦</span>
                    <div className="font-display font-extrabold text-base text-emerald-300">
                      Lấp Đầy Kho Nguyên Liệu Cấp Tốc
                    </div>
                  </div>
                  <p className="text-xs text-slate-300">
                    Nhập đầy toàn bộ Trà, Sữa, Đường, Đá & Topping lên mức tối đa ({maxCap} phần/loại) để không bị gián đoạn bán hàng!
                  </p>
                </div>
                <button
                  onClick={restockAllIngredients}
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-extrabold text-xs cursor-pointer"
                >
                  🚚 Nhập Đầy Ngay (Tự tính Xu)
                </button>
              </div>

              {specialItems.map((it) => (
                <div
                  key={it.id}
                  className="bg-white/5 border border-white/15 rounded-2xl p-4 flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2.5 mb-1">
                      <span className="text-3xl">{it.icon}</span>
                      <div className="font-display font-extrabold text-base text-amber-200">
                        {it.name}
                      </div>
                    </div>
                    <p className="text-xs text-slate-300">{it.desc}</p>
                  </div>
                  <button
                    onClick={it.onBuy}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:brightness-110 text-white font-extrabold text-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> Mua ngay ({it.cost} Xu)
                  </button>
                </div>
              ))}
            </div>
          ) : tab === 'inventory' ? (
            <div className="grid sm:grid-cols-2 gap-2.5">
              {allStockItems.map((item) => {
                const locked = (item.unlockLevel || 1) > level;
                const cur = inventory[item.id] ?? 0;
                const isFull = cur >= maxCap;
                const pct = Math.min(100, Math.round((cur / maxCap) * 100));

                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl p-3 border flex flex-col justify-between gap-2 ${
                      cur === 0 && !locked
                        ? 'bg-rose-950/50 border-rose-400/70'
                        : 'bg-white/5 border-white/15'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-extrabold mb-1">
                        <span className="text-white flex items-center gap-1.5">
                          <span className="text-base">{item.icon}</span> {item.name}
                        </span>
                        <span
                          className={
                            cur === 0
                              ? 'text-rose-400 font-extrabold'
                              : cur <= 3
                              ? 'text-amber-300'
                              : 'text-emerald-300'
                          }
                        >
                          {locked ? `Mở Cấp ${item.unlockLevel}` : `${cur} / ${maxCap} phần`}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            cur <= 2 ? 'bg-rose-500' : 'bg-gradient-to-r from-emerald-400 to-teal-400'
                          }`}
                          style={{ width: `${locked ? 0 : pct}%` }}
                        />
                      </div>
                    </div>

                    <button
                      disabled={locked || isFull || coins < item.restockCost}
                      onClick={() =>
                        buyIngredientStock(item.id, item.restockPack, item.restockCost)
                      }
                      className={`w-full py-1.5 rounded-xl text-xs font-extrabold cursor-pointer ${
                        locked
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : isFull
                          ? 'bg-emerald-500/25 text-emerald-200 cursor-default'
                          : coins < item.restockCost
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950'
                      }`}
                    >
                      {locked
                        ? `🔒 Yêu cầu Cấp ${item.unlockLevel}`
                        : isFull
                        ? '✅ Đầy Kho'
                        : `📦 Nhập +${item.restockPack} phần (${item.restockCost} Xu)`}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : tab === 'upgrades' ? (
            <div className="grid sm:grid-cols-2 gap-3">
              {SHOP_UPGRADES.map((u) => {
                const curLv = upgrades[u.id] || 0;
                const isMax = curLv >= u.maxLevel;
                const cost = Math.round(u.baseCost * Math.pow(1.65, curLv));
                const levelLocked = level < u.unlockLevel && !u.allowEarlyWithCoins;

                return (
                  <div
                    key={u.id}
                    className="bg-white/5 border border-white/15 rounded-2xl p-3.5 flex flex-col justify-between gap-2.5"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-display font-extrabold text-sm text-white flex items-center gap-1.5">
                          <span className="text-xl">{u.icon}</span> {u.name}
                        </span>
                        <span className="text-[11px] font-extrabold bg-pink-500/25 text-pink-200 px-2 py-0.5 rounded-full">
                          Cấp {curLv}/{u.maxLevel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mb-1.5">{u.desc}</p>
                      <div className="text-[11px] text-emerald-300 font-bold">
                        +{u.incomePerSec} Xu/giây • +{Math.round(u.tipBonus * 100)}% Tiền boa mỗi cấp
                      </div>
                    </div>

                    <button
                      disabled={isMax || levelLocked || coins < cost}
                      onClick={() => buyUpgrade(u.id)}
                      className={`w-full py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                        isMax
                          ? 'bg-emerald-500/25 text-emerald-300 cursor-default'
                          : coins < cost || levelLocked
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 shadow-md'
                      }`}
                    >
                      {isMax
                        ? '✅ ĐÃ TỐI ĐA CẤP ĐỘ'
                        : levelLocked
                        ? `🔒 Yêu cầu Cấp ${u.unlockLevel}`
                        : `🪙 Nâng cấp (${cost.toLocaleString('vi-VN')} Xu)`}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {FRANCHISE_CITIES.map((city) => {
                const owned = !!franchises[city.id];
                return (
                  <div
                    key={city.id}
                    className={`rounded-2xl p-4 border flex flex-col justify-between gap-3 ${
                      owned ? 'bg-emerald-950/40 border-emerald-400/60' : 'bg-white/5 border-white/15'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-display font-extrabold text-base text-amber-200">
                          {city.icon} {city.name}
                        </span>
                        <span className="text-xs font-extrabold text-emerald-300">
                          +{city.incomePerSec} Xu/giây
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{city.desc}</p>
                    </div>
                    <button
                      disabled={owned || coins < city.cost}
                      onClick={() => buyFranchise(city.id)}
                      className={`w-full py-2 rounded-xl text-xs font-extrabold cursor-pointer ${
                        owned
                          ? 'bg-emerald-500/30 text-emerald-200 cursor-default'
                          : coins < city.cost
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950'
                      }`}
                    >
                      {owned
                        ? '🏢 ĐANG KINH DOANH THỊNH VƯỢNG'
                        : `🚀 Khai trương chi nhánh (${city.cost.toLocaleString('vi-VN')} Xu)`}
                    </button>
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
