import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { TEA_BASES, CITY_OTHER_SHOPS } from '../../data/gameData';

export default function SceneOverlaysHUD() {
  const sceneMode = useGameStore((s) => s.sceneMode);
  const activeModal = useGameStore((s) => s.activeModal);
  const customers = useGameStore((s) => s.customers);
  const selectCustomerAndCraft = useGameStore((s) => s.selectCustomerAndCraft);
  const setSceneMode = useGameStore((s) => s.setSceneMode);

  // Alien Quest state
  const alienQuest = useGameStore((s) => s.alienQuest);
  const acceptAlienCrafting = useGameStore((s) => s.acceptAlienCrafting);
  const closeAlienQuest = useGameStore((s) => s.closeAlienQuest);

  // City shops
  const buyBobaFromOtherShop = useGameStore((s) => s.buyBobaFromOtherShop);
  const sendGiftToPlayer = useGameStore((s) => s.sendGiftToPlayer);
  const addFriend = useGameStore((s) => s.addFriend);

  // Boss Raid
  const bossRaid = useGameStore((s) => s.bossRaid);
  const hitBossPearl = useGameStore((s) => s.hitBossPearl);

  // Cup Runner
  const cupRunner = useGameStore((s) => s.cupRunner);
  const startCupRunner = useGameStore((s) => s.startCupRunner);

  if (activeModal) return null;

  // 1. Alien Emergency Dialog Overlay
  if (alienQuest.active && alienQuest.stage !== 'crafting') {
    return (
      <div className="fixed inset-x-0 bottom-20 z-20 flex justify-center px-3 pointer-events-none">
        {alienQuest.stage === 'intro' && (
          <div className="w-full max-w-sm boba-glass rounded-3xl p-4 pointer-events-auto border-2 border-emerald-400 shadow-2xl">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-display text-emerald-700 font-extrabold text-sm">
                👽 KHÁCH HÀNG NGOÀI HÀNH TINH
              </span>
              <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                ⏱️ 60 GIÂY!
              </span>
            </div>
            <p className="text-xs text-[#4a1d35] italic mb-1.5">
              &ldquo;Tôi muốn một ly trà sữa có <b>200 viên trân châu</b>, <b>5 lớp pudding</b>,{' '}
              <b>0% đường</b> nhưng phải <b>ngọt như tình yêu 💖</b>!&rdquo;
            </p>
            <p className="text-[11px] text-pink-700 mb-1">
              🧑‍🍳 <b>Bạn:</b> Dạ... anh có chắc không ạ?
            </p>
            <p className="text-xs text-rose-600 font-bold mb-3">
              👽 <b>Khách:</b> Nhanh lên! Tôi sắp hết oxy rồi!!
            </p>
            <div className="flex gap-2">
              <button
                onClick={acceptAlienCrafting}
                className="flex-1 bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-extrabold text-xs py-2.5 px-3 rounded-xl shadow cursor-pointer"
              >
                🧋 Pha Ngay (+5.000 Xu)
              </button>
              <button
                onClick={closeAlienQuest}
                className="bg-pink-100 text-pink-700 font-bold text-xs px-3 py-2.5 rounded-xl cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        )}

        {alienQuest.stage === 'failed_suck' && (
          <div className="w-full max-w-sm boba-glass rounded-3xl p-4 text-center pointer-events-auto border-2 border-rose-400 shadow-2xl">
            <div className="text-2xl mb-1">🛸💨 ⚫⚫⚫</div>
            <h3 className="font-display text-rose-600 font-extrabold text-base mb-1">
              THẤT BẠI! BỊ HÚT SẠCH TRÂN CHÂU! 😂
            </h3>
            <p className="text-xs text-[#591d3b] mb-3">
              Người ngoài hành tinh bật tia kéo hút sạch trân châu trên quầy của bạn rồi phóng tàu bay mất!
            </p>
            <button
              onClick={closeAlienQuest}
              className="w-full bg-gradient-to-r from-pink-400 to-rose-500 text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer"
            >
              Dọn lại quầy & phục thù sau 😭
            </button>
          </div>
        )}

        {alienQuest.stage === 'won' && (
          <div className="w-full max-w-sm boba-glass rounded-3xl p-4 text-center pointer-events-auto border-2 border-amber-400 shadow-2xl">
            <div className="text-3xl mb-1">👽💖🧋✨</div>
            <h3 className="font-display text-amber-700 font-extrabold text-base mb-1">
              NHIỆM VỤ THIÊN HÀ THÀNH CÔNG!
            </h3>
            <p className="text-xs text-emerald-700 font-bold mb-3">
              🌌 Danh hiệu mới: Người Pha Chế Thiên Hà (+5.000 Xu)
            </p>
            <button
              onClick={closeAlienQuest}
              className="w-full bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 font-extrabold text-xs py-2.5 rounded-xl cursor-pointer"
            >
              Tuyệt vời! Nhận thưởng 🎉
            </button>
          </div>
        )}
      </div>
    );
  }

  // 2. Shop Overview Customer Waiting Strip (Uncovers 3D Kawaii Chibi Faces!)
  if (sceneMode === 'shop' && customers.length > 0) {
    return (
      <div className="fixed inset-x-0 bottom-18 sm:bottom-20 z-10 flex justify-center px-2 pointer-events-none">
        <div className="flex gap-2 overflow-x-auto max-w-full py-1 px-1 pointer-events-auto">
          {customers.slice(0, 3).map((c) => {
            const teaObj = TEA_BASES.find((t) => t.id === c.order.tea);
            return (
              <button
                key={c.uid}
                onClick={() => selectCustomerAndCraft(c.uid)}
                className="boba-card-cream rounded-2xl px-3 py-2 flex items-center gap-2.5 shadow-md hover:scale-[1.02] transition shrink-0 cursor-pointer"
              >
                <span className="text-xl">{c.icon}</span>
                <div className="text-left">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-pink-600">
                    <span>{c.type}</span>
                    <span className="bg-pink-100 text-pink-700 text-[10px] px-1.5 py-0.2 rounded-full">
                      ⏳{c.patience}s
                    </span>
                  </div>
                  <div className="text-[10px] font-bold text-[#6d3b53]">
                    {teaObj?.icon} {teaObj?.shortName} • {c.order.milk}% Sữa
                  </div>
                </div>
                <span className="bg-gradient-to-r from-pink-400 to-rose-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-xl">
                  Pha ngay
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // 3. Boba City Neighboring Shops Bar
  if (sceneMode === 'city') {
    return (
      <div className="fixed top-16 sm:top-20 inset-x-0 z-10 flex justify-center px-2 pointer-events-none">
        <div className="flex gap-2 overflow-x-auto max-w-full py-1 px-1 pointer-events-auto">
          {CITY_OTHER_SHOPS.map((shop) => (
            <div
              key={shop.id}
              className="boba-card-cream rounded-2xl px-3 py-2 w-52 shrink-0 shadow-md"
            >
              <div className="text-xs font-extrabold text-pink-600 truncate">{shop.shopName}</div>
              <div className="text-[10px] text-[#6d3b53] mb-1.5 truncate">
                {shop.owner} • ⭐{shop.rating}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => buyBobaFromOtherShop(shop)}
                  className="flex-1 bg-gradient-to-r from-pink-400 to-rose-500 text-white text-[10px] font-extrabold py-1 rounded-lg cursor-pointer"
                >
                  🧋 {shop.drinkPrice} Xu
                </button>
                <button
                  onClick={() => sendGiftToPlayer(shop.owner)}
                  className="bg-amber-200 text-amber-900 text-[10px] font-extrabold px-2 py-1 rounded-lg cursor-pointer"
                >
                  🎁
                </button>
                <button
                  onClick={() => addFriend(shop.owner)}
                  className="bg-pink-100 text-pink-700 text-[10px] font-extrabold px-2 py-1 rounded-lg cursor-pointer"
                >
                  +Bạn
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 4. Boss Trân Châu Raid Controls Overlay
  if (sceneMode === 'boss_raid') {
    const hpPct = Math.round((bossRaid.hp / bossRaid.maxHp) * 100);
    return (
      <div className="fixed inset-x-0 bottom-18 sm:bottom-20 z-20 flex justify-center px-3 pointer-events-none">
        <div className="w-full max-w-md boba-glass rounded-3xl p-3.5 text-center pointer-events-auto shadow-2xl">
          <div className="flex justify-between items-center text-xs font-extrabold mb-1.5">
            <span className="text-rose-600">
              👾 HP BOSS: {bossRaid.hp.toLocaleString()} / {bossRaid.maxHp.toLocaleString()}
            </span>
            <span className="text-amber-700">⏱️ Còn {bossRaid.timeLeft}s</span>
          </div>
          <div className="w-full h-3 bg-pink-100 rounded-full overflow-hidden border border-pink-300 mb-2.5">
            <div
              className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 transition-all duration-150"
              style={{ width: `${hpPct}%` }}
            />
          </div>

          {!bossRaid.won && bossRaid.timeLeft > 0 ? (
            <div className="flex gap-2">
              <button
                onClick={() => hitBossPearl(260)}
                className="flex-1 bg-gradient-to-r from-pink-400 to-rose-500 text-white font-extrabold text-xs sm:text-sm py-2.5 px-3 rounded-xl shadow cursor-pointer"
              >
                🔫 Đại Bác Trà Sữa (-260)
              </button>
              <button
                onClick={() => hitBossPearl(620)}
                className="bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 font-extrabold text-xs py-2.5 px-3 rounded-xl shadow cursor-pointer"
              >
                💣 Bom Pudding!
              </button>
            </div>
          ) : (
            <div>
              <p className="text-xs sm:text-sm font-extrabold text-emerald-700 mb-2">
                {bossRaid.won
                  ? '🎉 CHIẾN THẮNG! Đã hạ gục Boss Trân Châu (+2.500 Xu)!'
                  : '⏰ Hết giờ! Boss Trân Châu đã trốn thoát!'}
              </p>
              <button
                onClick={() => setSceneMode('shop')}
                className="w-full bg-gradient-to-r from-emerald-400 to-teal-400 text-white font-extrabold text-xs py-2 rounded-xl cursor-pointer"
              >
                🏪 Quay về Tiệm Trà Sữa
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 5. Đua Cốc Khổng Lồ Controls Overlay
  if (sceneMode === 'cup_runner') {
    const triggerKey = (code) => {
      window.dispatchEvent(new KeyboardEvent('keydown', { code }));
    };
    return (
      <div className="fixed inset-x-0 bottom-18 sm:bottom-20 z-20 flex justify-center px-3 pointer-events-none">
        <div className="w-full max-w-sm boba-glass rounded-3xl p-3 text-center pointer-events-auto shadow-2xl">
          <div className="flex justify-between text-xs font-extrabold mb-2">
            <span className="text-pink-600">🏃‍♂️ Đua Cốc Khổng Lồ 3D</span>
            <span className="text-amber-700">Kỷ lục: {cupRunner.highScore}</span>
          </div>

          {!cupRunner.isGameOver ? (
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => triggerKey('ArrowLeft')}
                className="bg-pink-100 active:bg-pink-200 text-pink-800 border border-pink-300 font-extrabold py-2.5 rounded-xl text-xs cursor-pointer"
              >
                ⬅️ Trái
              </button>
              <button
                onClick={() => triggerKey('Space')}
                className="bg-gradient-to-r from-pink-400 to-rose-500 text-white font-extrabold py-2.5 rounded-xl text-xs shadow cursor-pointer"
              >
                ⬆️ Nhảy
              </button>
              <button
                onClick={() => triggerKey('ArrowRight')}
                className="bg-pink-100 active:bg-pink-200 text-pink-800 border border-pink-300 font-extrabold py-2.5 rounded-xl text-xs cursor-pointer"
              >
                Phải ➡️
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-xs font-extrabold text-rose-600">
                💥 Điểm lượt này: {cupRunner.score} • Trân châu vàng: {cupRunner.coinsCollected}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    startCupRunner();
                    window.dispatchEvent(new CustomEvent('cup-runner-restart'));
                  }}
                  className="flex-1 bg-gradient-to-r from-pink-400 to-rose-500 text-white font-extrabold text-xs py-2 rounded-xl cursor-pointer"
                >
                  🔄 Đua Lại
                </button>
                <button
                  onClick={() => setSceneMode('shop')}
                  className="flex-1 bg-pink-100 text-pink-800 font-extrabold text-xs py-2 rounded-xl cursor-pointer"
                >
                  🏪 Về Quán
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
