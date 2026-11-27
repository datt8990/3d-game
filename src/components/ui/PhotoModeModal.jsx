import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Download, Heart, Camera } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { SHOP_THEMES } from '../three/cafeTextures';
import { sound } from '../../audio/soundEngine';

const CAPTIONS = [
  'Check-in góc trà sữa siêu xinh cùng bé Mèo Mướp 🌸🧋',
  'Hôm nay quán đông khách quá chừng luôn mọi người ơi 💖✨',
  'Một ly Đường Đen full topping nạp mood cho ngày mới 🤎🎀',
  'Chủ quán cute xỉu, pha trà chuẩn 100 điểm luôn nè 📸⭐',
];

export default function PhotoModeModal() {
  const activeModal = useGameStore((s) => s.activeModal);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const shopName = useGameStore((s) => s.shopName);
  const shopStars = useGameStore((s) => s.shopStars);
  const shopTheme = useGameStore((s) => s.shopTheme || 'sakura');
  const claimPhotoBonus = useGameStore((s) => s.claimPhotoBonus);

  const [snapshotUrl, setSnapshotUrl] = useState(null);
  const [captionIdx, setCaptionIdx] = useState(0);
  const [posted, setPosted] = useState(false);

  const takeSnapshot = () => {
    sound.playShutter();
    setPosted(false);
    try {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        setSnapshotUrl(canvas.toDataURL('image/png'));
      }
    } catch {
      setSnapshotUrl(null);
    }
  };

  useEffect(() => {
    if (activeModal === 'photo') {
      takeSnapshot();
    }
  }, [activeModal]);

  if (activeModal !== 'photo') return null;

  const theme = SHOP_THEMES[shopTheme] || SHOP_THEMES.sakura;

  const handleDownload = () => {
    if (!snapshotUrl) return;
    const a = document.createElement('a');
    a.href = snapshotUrl;
    a.download = `BobaGram_${shopName.replace(/\s+/g, '_')}.png`;
    a.click();
  };

  const handlePostBobaGram = () => {
    if (posted) return;
    setPosted(true);
    claimPhotoBonus();
  };

  return (
    <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotate: -1.5 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        className="w-full max-w-md bg-white rounded-3xl p-4 shadow-2xl border-4 border-pink-200"
      >
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xl">📸</span>
            <h2 className="font-display font-extrabold text-base text-[#591d3b]">
              BOBAGRAM CHECK-IN POLAROID
            </h2>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 rounded-xl bg-pink-100 text-pink-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Polaroid Photo Card */}
        <div className="bg-gradient-to-b from-pink-50 to-white p-2.5 pb-4 rounded-2xl border-2 border-pink-100 shadow-inner">
          <div className="relative rounded-xl overflow-hidden aspect-[16/10] bg-pink-100">
            {snapshotUrl ? (
              <img
                src={snapshotUrl}
                alt="BobaGram Snapshot"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-pink-500 text-xs font-bold">
                Đang chụp ảnh 3D...
              </div>
            )}
            <div className="absolute top-2 left-2 bg-white/90 text-pink-600 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow">
              {theme.icon} {shopName}
            </div>
            <div className="absolute top-2 right-2 bg-amber-100/95 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow">
              ⭐ {shopStars.toFixed(1)}
            </div>
          </div>

          <div className="mt-2.5 px-1">
            <button
              onClick={() => setCaptionIdx((i) => (i + 1) % CAPTIONS.length)}
              className="text-left text-xs font-bold text-[#591d3b] hover:text-pink-600 cursor-pointer"
              title="Bấm để đổi caption dễ thương"
            >
              &ldquo;{CAPTIONS[captionIdx]}&rdquo; <span className="text-[10px] text-pink-400">(đổi câu)</span>
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <button
            onClick={takeSnapshot}
            className="py-2 rounded-xl bg-pink-100 hover:bg-pink-200 text-pink-800 text-xs font-extrabold flex items-center justify-center gap-1 cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" /> Chụp lại
          </button>
          <button
            onClick={handleDownload}
            className="py-2 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-800 text-xs font-extrabold flex items-center justify-center gap-1 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Tải Ảnh
          </button>
          <button
            disabled={posted}
            onClick={handlePostBobaGram}
            className={`py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 shadow ${
              posted
                ? 'bg-emerald-100 text-emerald-700 cursor-default'
                : 'bg-gradient-to-r from-pink-400 to-rose-500 text-white cursor-pointer'
            }`}
          >
            <Heart className="w-3.5 h-3.5" /> {posted ? 'Đã đăng!' : '+120 Xu'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
