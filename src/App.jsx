import React, { Component, useEffect } from 'react';
import { useGameStore, createCustomerInstance, defaultInventory } from './store/useGameStore';
import { netSync } from './store/multiplayerSync';
import { sound } from './audio/soundEngine';
import GameCanvas from './components/three/GameCanvas';
import TopHUD from './components/ui/TopHUD';
import BottomNav from './components/ui/BottomNav';
import CraftingOverlay from './components/ui/CraftingOverlay';
import SceneOverlaysHUD from './components/ui/SceneOverlaysHUD';
import AngrySplatEffect from './components/ui/AngrySplatEffect';
import ShopUpgradeModal from './components/ui/ShopUpgradeModal';
import CozyFeaturesModal from './components/ui/CozyFeaturesModal';
import PhotoModeModal from './components/ui/PhotoModeModal';
import OnlineModal, { CityFloatingChat } from './components/ui/OnlineModal';
import LeaderboardModal from './components/ui/LeaderboardModal';
import EventsModal from './components/ui/EventsModal';
import CharacterModal from './components/ui/CharacterModal';
import StoryIntroModal from './components/ui/StoryIntroModal';

class GameErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="fixed inset-0 bg-[#fff0f6] text-[#591d3b] flex items-center justify-center p-6 z-50">
          <div className="boba-glass rounded-3xl p-6 max-w-md text-center space-y-3">
            <div className="text-4xl">🧋🔄</div>
            <h2 className="font-display font-extrabold text-xl text-pink-600">
              Cập Nhật Phiên Bản Mới!
            </h2>
            <p className="text-xs text-[#6d3b53]">
              Dữ liệu giao diện vừa được nâng cấp. Bấm nút bên dưới để làm mới trình duyệt nhé!
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-400 to-rose-500 text-white font-extrabold text-sm cursor-pointer"
            >
              🔄 Tải Lại Trang Ngay
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const tickSecond = useGameStore((s) => s.tickSecond);

  useEffect(() => {
    netSync.init();
    sound.preload();

    const st = useGameStore.getState();
    const needsFreshCustomers =
      st.customers.length === 0 ||
      st.customers.some((c) => !c.model?.startsWith('/models/anime/'));
    if (needsFreshCustomers) {
      const c1 = createCustomerInstance(st.level, false);
      const c2 = createCustomerInstance(st.level, false);
      useGameStore.setState({
        customers: [c1, c2],
        selectedCustomerUid: c1.uid,
      });
    }
    if (!['vivi', 'girl_a', 'girl_b', 'vita', 'victoria', 'boy_c'].includes(st.character?.modelId)) {
      useGameStore.setState((prev) => ({
        character: {
          ...prev.character,
          modelId: 'vivi',
          unlockedModels: Array.from(new Set(['vivi', 'girl_a', ...(prev.character?.unlockedModels || [])])),
        },
      }));
    }
    if (!st.inventory || st.inventory.strawberry_tea === undefined) {
      useGameStore.setState({
        inventory: {
          ...defaultInventory(),
          ...(st.inventory || {}),
          strawberry_tea: st.inventory?.strawberry_tea ?? 10,
        },
      });
    }

    const timer = setInterval(() => {
      useGameStore.getState().tickSecond?.();
    }, 1000);
    return () => clearInterval(timer);
  }, [tickSecond]);

  return (
    <GameErrorBoundary>
      <div className="relative w-screen h-screen overflow-hidden select-none">
        <GameCanvas />

        <TopHUD />
        <CraftingOverlay />
        <SceneOverlaysHUD />
        <CityFloatingChat />
        <BottomNav />

        <ShopUpgradeModal />
        <CozyFeaturesModal />
        <PhotoModeModal />
        <OnlineModal />
        <LeaderboardModal />
        <EventsModal />
        <CharacterModal />
        <StoryIntroModal />

        <AngrySplatEffect />
      </div>
    </GameErrorBoundary>
  );
}
