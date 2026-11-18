import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Trophy, Award } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { ONLINE_BOT_PLAYERS, LEVEL_TIERS, getTierForLevel } from '../../data/gameData';

export default function LeaderboardModal() {
  const activeModal = useGameStore((s) => s.activeModal);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const playerName = useGameStore((s) => s.playerName);
  const shopName = useGameStore((s) => s.shopName);
  const coins = useGameStore((s) => s.coins);
  const level = useGameStore((s) => s.level);
  const shopStars = useGameStore((s) => s.shopStars);

  const [tab, setTab] = useState('ranking'); // 'ranking' | 'tiers'

  if (activeModal !== 'leaderboard') return null;

  const myTier = getTierForLevel(level);
  const rankings = [
    ...ONLINE_BOT_PLAYERS.map((b) => ({
      id: b.id,
      name: b.name,
      title: b.title,
      coins: b.coins,
      stars: b.stars,
      isMe: false,
    })),
    {
      id: 'me',
      name: `${playerName} (${shopName})`,
      title: myTier.title,
      coins,
      stars: shopStars,
      isMe: true,
    },
  ].sort((a, b) => b.coins - a.coins);

  return (
    <div className="fixed inset-0 z-30 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl boba-glass rounded-3xl p-5 max-h-[82vh] flex flex-col"
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/15">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🏆</span>
            <div>
              <h2 className="font-display font-extrabold text-xl text-white">
                BẢNG XẾP HẠNG & HỆ THỐNG DANH HIỆU BOBA LAND
              </h2>
              <p className="text-xs text-amber-200">
                Đua Top tài sản để trở thành Vua Trà Sữa số 1 thế giới!
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

        <div className="flex gap-2 my-3">
          <button
            onClick={() => setTab('ranking')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer ${
              tab === 'ranking' ? 'bg-amber-400 text-slate-950' : 'bg-white/10 text-slate-200'
            }`}
          >
            <Trophy className="w-4 h-4" /> Bảng Xếp Hạng Đại Gia Toàn Server
          </button>
          <button
            onClick={() => setTab('tiers')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer ${
              tab === 'tiers' ? 'bg-pink-500 text-white' : 'bg-white/10 text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" /> Lộ Trình Cấp Độ & Phần Thưởng (Cấp 1 – 51+)
          </button>
        </div>

        <div className="overflow-y-auto space-y-2 pr-1 flex-1">
          {tab === 'ranking' ? (
            rankings.map((r, idx) => (
              <div
                key={r.id}
                className={`flex items-center justify-between px-4 py-2.5 rounded-2xl border ${
                  r.isMe
                    ? 'bg-gradient-to-r from-pink-600/50 to-purple-700/50 border-yellow-300'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-display font-extrabold text-lg w-8 text-center">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                  </span>
                  <div>
                    <div className="text-sm font-extrabold text-white">
                      {r.name} {r.isMe && <span className="text-yellow-300">(Bạn)</span>}
                    </div>
                    <div className="text-[11px] text-pink-200">
                      Danh hiệu: <b>{r.title}</b> • ⭐ {r.stars.toFixed(1)}
                    </div>
                  </div>
                </div>
                <div className="font-display font-extrabold text-base text-yellow-300">
                  🪙 {r.coins.toLocaleString('vi-VN')} Xu
                </div>
              </div>
            ))
          ) : (
            <div className="space-y-2">
              {LEVEL_TIERS.map((t) => {
                const achieved = level >= t.min;
                return (
                  <div
                    key={t.title}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border ${
                      achieved
                        ? 'bg-emerald-950/50 border-emerald-400/60'
                        : 'bg-white/5 border-white/10 opacity-80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{t.badge}</span>
                      <div>
                        <div className="font-display font-extrabold text-sm" style={{ color: t.color }}>
                          Cấp {t.max > 500 ? `${t.min}+` : `${t.min}–${t.max}`} • {t.title}
                        </div>
                        <div className="text-xs text-slate-200">Mở khóa: {t.unlockText}</div>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                        achieved ? 'bg-emerald-500/30 text-emerald-200' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {achieved ? '✅ Đã đạt' : '🔒 Chưa mở'}
                    </span>
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
