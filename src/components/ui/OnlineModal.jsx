import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send, PartyPopper, Swords, Trophy, MapPin } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { netSync } from '../../store/multiplayerSync';

export function CityFloatingChat() {
  const sceneMode = useGameStore((s) => s.sceneMode);
  const worldChat = useGameStore((s) => s.onlineState.worldChat);
  const partyTimeLeft = useGameStore((s) => s.onlineState.partyTimeLeft);
  const playerName = useGameStore((s) => s.playerName);
  const sendWorldChat = useGameStore((s) => s.sendWorldChat);
  const triggerBobaParty = useGameStore((s) => s.triggerBobaParty);
  const [msg, setMsg] = useState('');
  const [chatOpenMobile, setChatOpenMobile] = useState(false);

  if (sceneMode !== 'city') return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!msg.trim()) return;
    sendWorldChat(msg);
    netSync.broadcastChat(playerName, msg);
    setMsg('');
  };

  return (
    <div className="fixed left-2 right-2 sm:right-auto bottom-18 sm:bottom-20 z-20 sm:w-80 pointer-events-auto space-y-1.5">
      <div className="boba-glass rounded-2xl p-2 sm:p-2.5 flex items-center justify-between gap-2">
        <div className="text-xs min-w-0">
          <div className="font-extrabold text-pink-600 truncate">🏙️ Quảng Trường Boba Land</div>
          <div className="text-[10px] text-[#6d3b53] truncate">Chạm mặt đất hoặc nhấn WASD để dạo phố</div>
        </div>
        <div className="flex gap-1 shrink-0">
          <button
            onClick={() => setChatOpenMobile((v) => !v)}
            className="sm:hidden bg-pink-100 text-pink-700 border border-pink-300 font-extrabold text-[11px] px-2.5 py-1.5 rounded-xl cursor-pointer"
          >
            💬 {chatOpenMobile ? 'Ẩn' : 'Chat'}
          </button>
          <button
            onClick={() => {
              triggerBobaParty();
              netSync.broadcastParty(playerName);
            }}
            className="bg-gradient-to-r from-pink-400 to-amber-400 text-white font-extrabold text-[11px] px-2.5 py-1.5 rounded-xl shadow cursor-pointer flex items-center gap-1"
          >
            <PartyPopper className="w-3.5 h-3.5" />
            {partyTimeLeft > 0 ? `${partyTimeLeft}s` : 'Tiệc (150)'}
          </button>
        </div>
      </div>

      <div className={`${chatOpenMobile ? 'block' : 'hidden sm:block'} boba-glass rounded-2xl p-3`}>
        <div className="text-xs font-extrabold text-pink-600 mb-1.5 flex justify-between">
          <span>💬 Chat Thành Phố Online</span>
          <span className="text-[10px] text-emerald-600">● Live Đa Tab</span>
        </div>
        <div className="h-28 sm:h-32 overflow-y-auto space-y-1 text-xs mb-2 pr-1">
          {worldChat.slice(-10).map((c) => (
            <div key={c.id} className="leading-snug">
              <span className="font-extrabold text-pink-600">{c.sender}: </span>
              <span className="text-[#4a1d35]">{c.text}</span>
            </div>
          ))}
        </div>
        <form onSubmit={handleSend} className="flex gap-1.5">
          <input
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Nhập tin nhắn giao lưu..."
            className="flex-1 bg-white border border-pink-300 rounded-xl px-2.5 py-1.5 text-xs text-[#4a1d35] focus:outline-none"
          />
          <button
            type="submit"
            className="bg-pink-500 hover:bg-pink-600 text-white px-2.5 rounded-xl cursor-pointer flex items-center justify-center"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default function OnlineModal() {
  const activeModal = useGameStore((s) => s.activeModal);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const setSceneMode = useGameStore((s) => s.setSceneMode);
  const startTycoonRace = useGameStore((s) => s.startTycoonRace);
  const startPvpBattle = useGameStore((s) => s.startPvpBattle);
  const triggerBobaParty = useGameStore((s) => s.triggerBobaParty);
  const onlineState = useGameStore((s) => s.onlineState);
  const playerName = useGameStore((s) => s.playerName);
  const sendWorldChat = useGameStore((s) => s.sendWorldChat);

  const [chatInput, setChatInput] = useState('');

  if (activeModal !== 'online') return null;

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendWorldChat(chatInput);
    netSync.broadcastChat(playerName, chatInput);
    setChatInput('');
  };

  return (
    <div className="fixed inset-0 z-30 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl boba-glass rounded-3xl p-5 max-h-[84vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/15 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">👥</span>
            <div>
              <h2 className="font-display font-extrabold text-xl text-white">
                CHẾ ĐỘ ONLINE MULTIPLAYER – BOBA LAND NETWORK
              </h2>
              <p className="text-xs text-emerald-300">
                🟢 Máy chủ Boba Land VN-01 • Hỗ trợ đồng bộ nhiều Tab trình duyệt thời gian thực!
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

        {/* Post-match Results Banner if any */}
        {onlineState.pvpBattle.result && (
          <div
            className={`mb-4 rounded-2xl p-3 text-sm font-extrabold border ${
              onlineState.pvpBattle.result === 'win'
                ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200'
                : 'bg-rose-950/80 border-rose-400 text-rose-200'
            }`}
          >
            {onlineState.pvpBattle.result === 'win'
              ? '🏆 CHIẾN THẮNG ĐẠI CHIẾN PHA CHẾ 1v1! Bạn đã nhận +600 Xu & Huy Hiệu Độc Quyền!'
              : '⚡ Đối thủ vừa hoàn thành ly trà sữa nhanh hơn bạn một chút! Bấm Tái Đấu ngay!'}
          </div>
        )}

        {onlineState.tycoonRace.finishedResult && (
          <div className="mb-4 rounded-2xl p-3 bg-amber-950/70 border border-amber-400 text-xs text-amber-100">
            <div className="font-extrabold text-sm text-yellow-300 mb-1">
              🏁 Kết quả Đấu Chủ Quán vừa rồi: Hạng #{onlineState.tycoonRace.finishedResult.rank}/4!
            </div>
            <div className="flex flex-wrap gap-3">
              {onlineState.tycoonRace.finishedResult.standings.map((st, idx) => (
                <span key={st.name}>
                  #{idx + 1} <b>{st.name}</b>: +{st.earned} Xu
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 3 Core Multiplayer Modes */}
        <div className="grid md:grid-cols-3 gap-3.5 mb-4">
          {/* Mode 1 */}
          <div className="bg-white/5 border border-amber-400/40 rounded-2xl p-4 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-amber-300 font-display font-extrabold text-base mb-1">
                <Trophy className="w-5 h-5" /> Chế Độ 1: Đấu Chủ Quán
              </div>
              <ul className="text-xs text-slate-200 space-y-1 list-disc list-inside">
                <li>4 người chơi cùng tham gia đua doanh thu.</li>
                <li>Ai kiếm được nhiều tiền nhất khi hết giờ sẽ chiến thắng!</li>
                <li>Bảng xếp hạng nhảy số trực tiếp góc phải màn hình.</li>
              </ul>
            </div>
            <div className="space-y-1.5">
              <button
                onClick={() => startTycoonRace(300)}
                className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-extrabold text-xs cursor-pointer"
              >
                🏁 Đấu Chuẩn 5 Phút (4 Người)
              </button>
              <button
                onClick={() => startTycoonRace(90)}
                className="w-full py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-200 font-bold text-[11px] cursor-pointer"
              >
                ⚡ Đấu Nhanh 90 Giây
              </button>
            </div>
          </div>

          {/* Mode 2 */}
          <div className="bg-white/5 border border-sky-400/40 rounded-2xl p-4 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-sky-300 font-display font-extrabold text-base mb-1">
                <Swords className="w-5 h-5" /> Chế Độ 2: Đại Chiến Pha Chế
              </div>
              <ul className="text-xs text-slate-200 space-y-1 list-disc list-inside">
                <li>2 người thi đấu trực tiếp 1v1 nghẹt thở.</li>
                <li>Cùng nhận 1 đơn hàng bí mật giống hệt nhau.</li>
                <li>Pha nhanh & chính xác hơn nhận <b>Huy Hiệu Độc Quyền</b> + 600 Xu!</li>
              </ul>
            </div>
            <button
              onClick={startPvpBattle}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-500 text-white font-extrabold text-xs cursor-pointer shadow-lg"
            >
              ⚔️ Ghép Trận Solo 1v1 Ngay!
            </button>
          </div>

          {/* Mode 3 */}
          <div className="bg-white/5 border border-pink-400/40 rounded-2xl p-4 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-pink-300 font-display font-extrabold text-base mb-1">
                <MapPin className="w-5 h-5" /> Chế Độ 3: Thành Phố Trà Sữa
              </div>
              <ul className="text-xs text-slate-200 space-y-1 list-disc list-inside">
                <li>20–30 người chơi xuất hiện trong Quảng trường 3D.</li>
                <li>Thăm quán bạn bè, mua trà sữa, chat, kết bạn & tặng quà.</li>
                <li>Tổ chức <b>Tiệc Trà Sữa 🎉</b> bắn pháo hoa rực rỡ!</li>
              </ul>
            </div>
            <div className="space-y-1.5">
              <button
                onClick={() => setSceneMode('city')}
                className="w-full py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-xs cursor-pointer shadow-lg"
              >
                🏙️ Bước Vào Thành Phố 3D
              </button>
              <button
                onClick={() => {
                  triggerBobaParty();
                  netSync.broadcastParty(playerName);
                }}
                className="w-full py-1.5 rounded-xl bg-pink-500/20 border border-pink-400/50 text-pink-200 font-bold text-[11px] cursor-pointer"
              >
                🎉 Mở Đại Tiệc Trà Sữa (150 Xu)
              </button>
            </div>
          </div>
        </div>

        {/* Bottom: World Chat & Friends List */}
        <div className="grid md:grid-cols-3 gap-3.5">
          <div className="md:col-span-2 bg-slate-950/60 border border-white/10 rounded-2xl p-3.5">
            <div className="text-xs font-extrabold text-pink-300 mb-2">
              💬 Kênh Chat Toàn Server (Mở 2 tab trình duyệt để chat thật với nhau!)
            </div>
            <div className="h-32 overflow-y-auto space-y-1 text-xs mb-2 pr-1">
              {onlineState.worldChat.map((m) => (
                <div key={m.id}>
                  <span className="text-slate-500 text-[10px] mr-1">[{m.time}]</span>
                  <span className="font-bold text-amber-300">{m.sender}: </span>
                  <span className="text-slate-100">{m.text}</span>
                </div>
              ))}
            </div>
            <form onSubmit={handleChatSubmit} className="flex gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Gửi lời chào hoặc mời bạn bè sang thăm quán..."
                className="flex-1 bg-white/10 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
              />
              <button
                type="submit"
                className="bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold px-4 py-1.5 rounded-xl cursor-pointer"
              >
                Gửi
              </button>
            </form>
          </div>

          <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-3.5">
            <div className="text-xs font-extrabold text-emerald-300 mb-2">
              🤝 Danh Sách Bạn Bè ({onlineState.friends.length})
            </div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {onlineState.friends.map((fr) => (
                <div
                  key={fr}
                  className="flex items-center justify-between bg-white/5 px-2.5 py-1.5 rounded-xl text-xs"
                >
                  <span className="font-bold text-white truncate">🟢 {fr}</span>
                  <button
                    onClick={() => useGameStore.getState().sendGiftToPlayer(fr)}
                    className="text-[10px] bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded-lg cursor-pointer"
                  >
                    🎁 Tặng
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
