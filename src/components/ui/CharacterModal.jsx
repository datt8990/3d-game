import React from 'react';
import { motion } from 'framer-motion';
import { X, Award } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { CHARACTER_OUTFITS, getTierForLevel } from '../../data/gameData';

export default function CharacterModal() {
  const activeModal = useGameStore((s) => s.activeModal);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const playerName = useGameStore((s) => s.playerName);
  const level = useGameStore((s) => s.level);
  const coins = useGameStore((s) => s.coins);
  const totalCupsServed = useGameStore((s) => s.totalCupsServed);
  const character = useGameStore((s) => s.character);
  const equipOrBuyCosmetic = useGameStore((s) => s.equipOrBuyCosmetic);

  if (activeModal !== 'character') return null;

  const tier = getTierForLevel(level);

  return (
    <div className="fixed inset-0 z-30 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-3xl boba-glass rounded-3xl p-5 max-h-[84vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/15 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">👤</span>
            <div>
              <h2 className="font-display font-extrabold text-xl text-white">
                HỒ SƠ & TÙY CHỈNH NHÂN VẬT 3D
              </h2>
              <p className="text-xs text-pink-200">
                {playerName} • Cấp {level} ({character.customTitle || tier.title}) • Đã phục vụ {totalCupsServed} ly
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

        {/* Player Name Edit */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs">
            <span className="text-slate-300">Tên Chủ Quán hiển thị Online: </span>
            <b className="text-yellow-300">{playerName}</b>
          </div>
          <div className="flex gap-2">
            <input
              defaultValue={playerName}
              maxLength={20}
              id="owner-name-input"
              className="bg-slate-900/80 border border-white/20 rounded-xl px-2.5 py-1 text-xs text-white"
            />
            <button
              onClick={() => {
                const el = document.getElementById('owner-name-input');
                if (el && el.value.trim()) {
                  useGameStore.setState({ playerName: el.value.trim() });
                  useGameStore.getState().addPopup('Đã cập nhật tên nhân vật!', '#4ade80');
                }
              }}
              className="bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-xl cursor-pointer"
            >
              Lưu tên
            </button>
          </div>
        </div>

        {/* 1. 3D Character Models */}
        <div className="mb-4">
          <h3 className="font-display font-extrabold text-sm text-amber-200 mb-2">
            🧍 Ngoại Hình Nhân Vật 3D
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {CHARACTER_OUTFITS.models.map((m) => {
              const unlocked = character.unlockedModels.includes(m.id);
              const equipped = character.modelId === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => equipOrBuyCosmetic('model', m.id, m.cost)}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                    equipped
                      ? 'bg-pink-500/35 border-yellow-300'
                      : 'bg-white/5 hover:bg-white/15 border-white/15'
                  }`}
                >
                  <div className="text-xs font-extrabold text-white mb-1">{m.name}</div>
                  <div className="text-[11px] font-bold text-amber-300">
                    {equipped ? '✅ Đang dùng' : unlocked ? 'Trang bị ngay' : `🪙 ${m.cost} Xu`}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. 3D Hats */}
        <div className="mb-4">
          <h3 className="font-display font-extrabold text-sm text-amber-200 mb-2">
            👑 Phụ Kiện Mũ & Hào Quang 3D
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {CHARACTER_OUTFITS.hats.map((h) => {
              const unlocked = character.unlockedHats.includes(h.id);
              const equipped = character.hatId === h.id;
              return (
                <button
                  key={h.id}
                  onClick={() => equipOrBuyCosmetic('hat', h.id, h.cost)}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                    equipped
                      ? 'bg-purple-500/35 border-yellow-300'
                      : 'bg-white/5 hover:bg-white/15 border-white/15'
                  }`}
                >
                  <div className="text-sm font-extrabold text-white mb-1">
                    {h.icon} {h.name}
                  </div>
                  <div className="text-[11px] font-bold text-amber-300">
                    {equipped ? '✅ Đang đội' : unlocked ? 'Đội ngay' : `🪙 ${h.cost} Xu`}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Floating 3D Pets */}
        <div className="mb-4">
          <h3 className="font-display font-extrabold text-sm text-amber-200 mb-2">
            🧋 Thú Cưng Đồng Hành Bay Lượn 3D
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {CHARACTER_OUTFITS.pets.map((p) => {
              const unlocked = character.unlockedPets.includes(p.id);
              const equipped = character.petId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => equipOrBuyCosmetic('pet', p.id, p.cost)}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                    equipped
                      ? 'bg-sky-500/35 border-yellow-300'
                      : 'bg-white/5 hover:bg-white/15 border-white/15'
                  }`}
                >
                  <div className="text-sm font-extrabold text-white mb-1">
                    {p.icon} {p.name}
                  </div>
                  <div className="text-[11px] font-bold text-amber-300">
                    {equipped ? '✅ Đang bay' : unlocked ? 'Triệu hồi' : `🪙 ${p.cost} Xu`}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Exclusive Badges Collection */}
        <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-yellow-300 mb-2">
            <Award className="w-4 h-4" /> Bộ Sưu Tập Huy Hiệu Độc Quyền ({character.badges.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {character.badges.map((b) => (
              <span
                key={b}
                className="bg-gradient-to-r from-amber-500/25 to-pink-500/25 border border-amber-400/50 text-amber-100 text-xs font-bold px-3 py-1 rounded-full"
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
