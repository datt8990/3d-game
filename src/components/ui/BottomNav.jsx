import React from 'react';
import { useGameStore } from '../../store/useGameStore';

const NAV_ITEMS = [
  { id: 'my_shop', icon: '🏪', label: 'Cửa hàng của tôi', shortLabel: 'Quán', action: 'shop_upgrade' },
  { id: 'craft', icon: '🧋', label: 'Pha chế', shortLabel: 'Pha chế', action: 'scene_crafting' },
  { id: 'online', icon: '👥', label: 'Online', shortLabel: 'Online', action: 'online' },
  { id: 'leaderboard', icon: '🏆', label: 'Bảng xếp hạng', shortLabel: 'BXH', action: 'leaderboard' },
  { id: 'events', icon: '🎁', label: 'Sự kiện', shortLabel: 'Sự kiện', action: 'events' },
  { id: 'item_shop', icon: '🛍️', label: 'Cửa hàng vật phẩm', shortLabel: 'Vật phẩm', action: 'items' },
  { id: 'character', icon: '👤', label: 'Nhân vật', shortLabel: 'Nhân vật', action: 'character' },
];

export default function BottomNav() {
  const sceneMode = useGameStore((s) => s.sceneMode);
  const activeModal = useGameStore((s) => s.activeModal);
  const setSceneMode = useGameStore((s) => s.setSceneMode);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const customers = useGameStore((s) => s.customers);

  const handleNav = (item) => {
    if (item.action === 'scene_crafting') {
      if (sceneMode === 'crafting' && !activeModal) {
        setSceneMode('shop');
      } else {
        setSceneMode('crafting');
      }
      return;
    }
    setActiveModal(item.action);
  };

  return (
    <nav className="fixed bottom-2 left-2 right-2 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-20 pointer-events-auto sm:max-w-[96vw]">
      <div className="boba-glass rounded-2xl sm:rounded-3xl p-1.5 sm:px-3 sm:py-2 grid grid-cols-7 sm:flex items-center gap-1 sm:gap-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            (item.action === 'scene_crafting' && sceneMode === 'crafting' && !activeModal) ||
            activeModal === item.action;

          return (
            <button
              key={item.id}
              onClick={() => handleNav(item)}
              className={`relative flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 px-1 sm:px-3 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl font-extrabold text-[10px] sm:text-xs transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-pink-400 to-rose-500 text-white shadow-md scale-[1.03]'
                  : 'bg-white/75 hover:bg-pink-100/80 text-[#591d3b] border border-pink-200/80'
              }`}
            >
              <span className="text-base sm:text-lg leading-none">{item.icon}</span>
              <span className="sm:hidden truncate max-w-full leading-tight">{item.shortLabel}</span>
              <span className="hidden sm:inline whitespace-nowrap">{item.label}</span>

              {item.id === 'craft' && customers.length > 0 && sceneMode !== 'crafting' && (
                <span className="absolute -top-1 -right-0.5 sm:-right-1 bg-rose-500 text-white text-[9px] sm:text-[10px] font-extrabold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center animate-bounce border-2 border-white">
                  {customers.length}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
