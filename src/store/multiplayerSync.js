// Real Cross-Tab Multiplayer Synchronization (BroadcastChannel) + Lively Online Bot Chatter
import { useGameStore } from './useGameStore';

const BOT_CHAT_LINES = [
  { sender: 'BảoNgọc_Boba 🌸', text: 'Vừa nâng cấp Khu VIP xong, Đại Gia vào boa quá trời xu luôn 😍' },
  { sender: 'MinhTuấn_Pro ⚡', text: 'Có ông khách ngoài hành tinh vừa đòi 200 viên trân châu làm tui đổ mồ hôi hột 👽😂' },
  { sender: 'MèoÚ_NghiệnTrà 🐱', text: 'Pha nhầm thạch cho bà Reviewer bị bả ném nguyên ly trà sữa vô mặt huhu 😭🧋' },
  { sender: 'HoàngTửTrânChâu 👑', text: 'Ai mở chuỗi chi nhánh Siêu Đô Thị Cyber chưa? Thu nhập thụ động đỉnh thực sự!' },
  { sender: 'ThánhSănTopping 🧋', text: 'Mọi người ra Quảng Trường Thành Phố Trà Sữa chơi tiệc pháo hoa đi!! 🎉' },
  { sender: 'LinhKa_BobaLand 🌟', text: 'Đua Cốc Khổng Lồ vui xỉu, kỷ lục mới của mình là 850 điểm nè!' },
];

class MultiplayerChannel {
  constructor() {
    this.channel = null;
    this.tabId = `tab_${Math.random().toString(36).slice(2, 8)}`;
    this.peerPlayers = new Map(); // Real players in other open browser tabs!
  }

  init() {
    if (typeof window === 'undefined' || this.channel) return;
    if ('BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('tra_sua_dai_chien_3d_net');
      this.channel.onmessage = (ev) => {
        const data = ev.data;
        if (!data || data.tabId === this.tabId) return;

        if (data.type === 'CHAT') {
          useGameStore.getState().sendWorldChat(data.text, `${data.sender} (Online)`);
        } else if (data.type === 'POS_SYNC') {
          this.peerPlayers.set(data.tabId, {
            tabId: data.tabId,
            name: data.name,
            title: data.title,
            modelPath: data.modelPath,
            x: data.x,
            z: data.z,
            rotY: data.rotY,
            lastSeen: Date.now(),
          });
        } else if (data.type === 'PARTY') {
          useGameStore.setState((s) => ({
            onlineState: { ...s.onlineState, partyTimeLeft: 40 },
          }));
          useGameStore
            .getState()
            .addPopup(`🎉 ${data.sender} vừa mở Đại Tiệc Trà Sữa liên server!`, '#f472b6');
        }
      };
    }

    // Periodic ambient world chat from Boba Land online players
    this.botInterval = setInterval(() => {
      if (Math.random() < 0.35) {
        const line = BOT_CHAT_LINES[Math.floor(Math.random() * BOT_CHAT_LINES.length)];
        useGameStore.getState().sendWorldChat(line.text, line.sender);
      }
      // Prune stale peer tabs
      const now = Date.now();
      for (const [id, p] of this.peerPlayers.entries()) {
        if (now - p.lastSeen > 8000) this.peerPlayers.delete(id);
      }
    }, 14000);
  }

  broadcastChat(sender, text) {
    this.channel?.postMessage({ type: 'CHAT', tabId: this.tabId, sender, text });
  }

  broadcastPosition(payload) {
    this.channel?.postMessage({ type: 'POS_SYNC', tabId: this.tabId, ...payload });
  }

  broadcastParty(sender) {
    this.channel?.postMessage({ type: 'PARTY', tabId: this.tabId, sender });
  }
}

export const netSync = new MultiplayerChannel();
