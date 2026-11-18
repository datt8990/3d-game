import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import confetti from 'canvas-confetti';
import {
  TEA_BASES,
  BASE_INGREDIENTS,
  MILK_OPTIONS,
  SUGAR_OPTIONS,
  ICE_OPTIONS,
  TOPPINGS,
  CUSTOMER_ARCHETYPES,
  SHOP_UPGRADES,
  FRANCHISE_CITIES,
  ONLINE_BOT_PLAYERS,
  getTierForLevel,
} from '../data/gameData';
import { sound } from '../audio/soundEngine';

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateOrderForArchetype(archetype, playerLevel = 1) {
  const unlockedTeas = TEA_BASES.filter((t) => t.unlockLevel <= playerLevel);
  const unlockedToppings = TOPPINGS.filter((t) => t.unlockLevel <= playerLevel);

  const tea = pickRandom(unlockedTeas).id;
  let milk = pickRandom(MILK_OPTIONS).id;
  let sugar = pickRandom(SUGAR_OPTIONS).id;
  let ice = pickRandom(ICE_OPTIONS).id;
  let toppings = [];

  if (archetype.id === 'student') {
    sugar = pickRandom([70, 100]);
    milk = 100;
    const count = Math.min(unlockedToppings.length, Math.random() > 0.4 ? 2 : 3);
    const shuffled = [...unlockedToppings].sort(() => Math.random() - 0.5);
    toppings = shuffled.slice(0, count).map((t) => t.id);
  } else if (archetype.id === 'office') {
    sugar = pickRandom([0, 30]);
    ice = pickRandom([50, 100]);
    toppings = [pickRandom(unlockedToppings).id];
  } else if (archetype.id === 'troll') {
    milk = 0;
    ice = pickRandom([0, 100]);
    sugar = ice === 0 ? 100 : 0;
    toppings = unlockedToppings.slice(0, 3).map((t) => t.id);
  } else if (archetype.id === 'idol') {
    sugar = pickRandom([0, 30, 50]);
    milk = 50;
    toppings = [pickRandom(unlockedToppings).id];
  } else {
    milk = pickRandom([50, 100]);
    const count = Math.random() > 0.45 ? 2 : 1;
    const shuffled = [...unlockedToppings].sort(() => Math.random() - 0.5);
    toppings = shuffled.slice(0, count).map((t) => t.id);
  }

  return { tea, milk, sugar, ice, toppings };
}

export function createCustomerInstance(level = 1, vipUnlocked = false) {
  let pool = CUSTOMER_ARCHETYPES;
  if (vipUnlocked && Math.random() < 0.4) {
    pool = CUSTOMER_ARCHETYPES.filter((c) => ['tycoon', 'idol', 'reviewer'].includes(c.id));
  }
  const arch = pickRandom(pool);
  const order = generateOrderForArchetype(arch, level);
  return {
    uid: `cust_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    archetypeId: arch.id,
    type: arch.type,
    icon: arch.icon,
    model: arch.model,
    trait: arch.trait,
    greeting: pickRandom(arch.greetings),
    angryQuote: pickRandom(arch.angryQuotes),
    baseReward: arch.baseReward,
    xpReward: arch.xpReward,
    strictAccuracy: arch.strictAccuracy || 60,
    maxPatience: arch.patience,
    patience: arch.patience,
    order,
  };
}

const defaultInventory = () => ({
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
});

const defaultCup = () => ({
  step: 1,
  tea: null,
  milk: null,
  sugar: null,
  ice: null,
  toppings: [],
  shakeProgress: 0,
  isPoured: false,
  isSealed: false,
  pearl200: false,
  pudding5: false,
  loveSpice: false,
});

export const useGameStore = create(
  persist(
    (set, get) => ({
      hasSeenIntro: false,
      playerName: 'Chủ Quán Boba',
      shopName: 'Boba Mộng Mơ',
      coins: 500,
      gems: 25,
      xp: 0,
      level: 1,
      shopStars: 4.5,
      totalCupsServed: 0,

      // Finite Ingredient Stock System ("Kho nguyên liệu giới hạn")!
      inventory: defaultInventory(),

      sceneMode: 'shop',
      cameraTarget: 'overview',
      activeModal: null, // null | 'shop_upgrade' | 'inventory' | 'online' | 'leaderboard' | 'events' | 'items' | 'character'

      upgrades: {
        sealer_pro: 0,
        furniture_set: 1,
        expand_shop: 0,
        auto_brewer: 0,
        hire_staff: 0,
        vip_zone: 0,
        rooftop_floor: 0,
      },
      franchises: {},

      character: {
        modelId: 'female_a',
        hatId: 'none',
        petId: 'none',
        unlockedModels: ['female_a', 'male_a'],
        unlockedHats: ['none'],
        unlockedPets: ['none'],
        customTitle: null,
        badges: ['🌱 Khởi Nghiệp Boba Land'],
      },

      customers: [],
      selectedCustomerUid: null,
      currentCup: defaultCup(),
      lastServeResult: null,
      angrySplat: null,
      floatingPopups: [],

      idolBuffTimer: 0,
      cityDrinkBuffTimer: 0,

      alienQuest: {
        active: false,
        stage: 'intro',
        timeLeft: 60,
        completedOnce: false,
      },

      onlineState: {
        tycoonRace: {
          active: false,
          timeLeft: 120,
          duration: 120,
          playerStartCoins: 500,
          playerEarned: 0,
          rivals: [
            { id: 'r1', name: 'HoàngTửTrânChâu 👑', earned: 0, rate: 18 },
            { id: 'r2', name: 'BảoNgọc_Boba 🌸', earned: 0, rate: 14 },
            { id: 'r3', name: 'MinhTuấn_Pro ⚡', earned: 0, rate: 11 },
          ],
          finishedResult: null,
        },
        pvpBattle: {
          active: false,
          opponentName: 'ThánhPhaChế_99 🔥',
          sharedOrder: null,
          opponentStep: 1,
          opponentProgress: 0,
          timeLeft: 45,
          result: null,
        },
        worldChat: [
          { id: 'c1', sender: 'BảoNgọc_Boba 🌸', text: 'Nhớ canh kho nguyên liệu nha mọi người, đang pha mà hết trân châu là khách bỏ về đó!', time: 'Vừa xong' },
          { id: 'c2', sender: 'HoàngTửTrânChâu 👑', text: 'Ai solo Đại Chiến Pha Chế 1v1 không? Đang chuỗi thắng 5 trận nè 😎', time: 'Vừa xong' },
          { id: 'c3', sender: 'MèoÚ_NghiệnTrà 🐱', text: 'Sắp có Boss Trân Châu xuất hiện ở quảng trường kìa anh em ơi!!', time: 'Vừa xong' },
        ],
        friends: ['BảoNgọc_Boba 🌸'],
        partyTimeLeft: 0,
        visitingShop: null,
      },

      festivalProgress: { drinksCrafted: 0, claimed: false },
      tournament: { active: false, round: 1, opponent: 'Bậc Thầy Ô Long', order: null, timeLeft: 40 },
      bossRaid: { hp: 10000, maxHp: 10000, timeLeft: 60, playerDamage: 0, won: false },
      cupRunner: { score: 0, highScore: 0, coinsCollected: 0, isGameOver: false },

      // --- HELPERS ---
      getMaxStockCapacity: () => {
        const expandLv = get().upgrades.expand_shop || 0;
        return 15 + expandLv * 10;
      },

      dismissIntro: (playerName, shopName) =>
        set((s) => ({
          hasSeenIntro: true,
          playerName: playerName?.trim() || s.playerName,
          shopName: shopName?.trim() || s.shopName,
        })),

      setSceneMode: (mode) => {
        sound.playClick();
        set({ sceneMode: mode, activeModal: null });
      },

      setCameraTarget: (target) => {
        sound.playClick();
        set({ cameraTarget: target, sceneMode: 'shop' });
      },

      setActiveModal: (modal) => {
        sound.playClick();
        set((s) => ({ activeModal: s.activeModal === modal ? null : modal }));
      },

      addPopup: (text, color = '#facc15') => {
        const id = `${Date.now()}_${Math.random()}`;
        set((s) => ({
          floatingPopups: [...s.floatingPopups.slice(-5), { id, text, color }],
        }));
        setTimeout(() => {
          set((s) => ({
            floatingPopups: s.floatingPopups.filter((p) => p.id !== id),
          }));
        }, 2200);
      },

      addCoinsAndXp: (coinDelta, xpDelta = 0) => {
        set((s) => {
          const newCoins = Math.max(0, Math.round(s.coins + coinDelta));
          let newXp = s.xp + xpDelta;
          let newLevel = s.level;
          let leveledUp = false;

          while (newXp >= newLevel * 120) {
            newXp -= newLevel * 120;
            newLevel += 1;
            leveledUp = true;
          }

          if (leveledUp) {
            sound.playSuccessFanfare();
            confetti({ particleCount: 70, spread: 65, origin: { y: 0.6 } });
          }

          const race = s.onlineState.tycoonRace;
          const updatedRace =
            race.active && coinDelta > 0
              ? { ...race, playerEarned: race.playerEarned + Math.round(coinDelta) }
              : race;

          return {
            coins: newCoins,
            xp: newXp,
            level: newLevel,
            onlineState: { ...s.onlineState, tycoonRace: updatedRace },
          };
        });
      },

      getPassiveIncomePerSec: () => {
        const s = get();
        let total = 0;
        SHOP_UPGRADES.forEach((u) => {
          const lv = s.upgrades[u.id] || 0;
          total += lv * u.incomePerSec;
        });
        FRANCHISE_CITIES.forEach((c) => {
          if (s.franchises[c.id]) total += c.incomePerSec;
        });
        if (s.idolBuffTimer > 0) total *= 1.5;
        return Math.round(total);
      },

      // --- INGREDIENT RESTOCKING ACTIONS ("Nhập nguyên liệu giới hạn") ---
      buyIngredientStock: (id, packAmount, cost) => {
        const s = get();
        const maxCap = s.getMaxStockCapacity();
        const cur = s.inventory[id] ?? 0;
        if (cur >= maxCap) {
          s.addPopup('Kho mặt hàng này đã đầy!', '#38bdf8');
          return;
        }
        if (s.coins < cost) {
          s.addPopup(`Cần ${cost} Xu để nhập lô hàng này!`, '#f43f5e');
          return;
        }
        sound.playCoin();
        const nextVal = Math.min(maxCap, cur + packAmount);
        set((st) => ({
          coins: st.coins - cost,
          inventory: { ...st.inventory, [id]: nextVal },
        }));
        s.addPopup(`📦 Đã nhập thêm nguyên liệu (${nextVal}/${maxCap})!`, '#4ade80');
      },

      restockAllIngredients: () => {
        const s = get();
        const maxCap = s.getMaxStockCapacity();
        const allDefs = [
          ...TEA_BASES.filter((t) => t.unlockLevel <= s.level),
          ...BASE_INGREDIENTS,
          ...TOPPINGS.filter((t) => t.unlockLevel <= s.level),
        ];

        let totalCost = 0;
        const nextInv = { ...s.inventory };
        let anyAdded = false;

        for (const item of allDefs) {
          const cur = nextInv[item.id] ?? 0;
          if (cur < maxCap) {
            const needed = maxCap - cur;
            const itemCost = Math.max(5, Math.round((needed / item.restockPack) * item.restockCost));
            if (s.coins - totalCost >= itemCost) {
              totalCost += itemCost;
              nextInv[item.id] = maxCap;
              anyAdded = true;
            }
          }
        }

        if (!anyAdded) {
          if (s.coins < 20) {
            s.addPopup('Chưa đủ Xu để nhập đầy kho!', '#f43f5e');
          } else {
            s.addPopup('Toàn bộ Kho Nguyên Liệu đã đầy 100%!', '#38bdf8');
          }
          return;
        }

        sound.playSuccessFanfare();
        set((st) => ({
          coins: st.coins - totalCost,
          inventory: nextInv,
        }));
        s.addPopup(`🚚 Đã lấp đầy Kho Nguyên Liệu (-${totalCost} Xu)!`, '#4ade80');
      },

      tickSecond: () => {
        const s = get();
        const passive = s.getPassiveIncomePerSec();
        if (passive > 0) {
          s.addCoinsAndXp(passive, Math.max(1, Math.floor(passive / 30)));
        }

        set((state) => {
          const idolBuffTimer = Math.max(0, state.idolBuffTimer - 1);
          const cityDrinkBuffTimer = Math.max(0, state.cityDrinkBuffTimer - 1);

          let updatedCustomers = state.customers
            .map((c) => ({ ...c, patience: c.patience - 1 }))
            .filter((c) => c.patience > 0);

          const maxQueue = 3 + (state.upgrades.expand_shop || 0);
          const spawnChance = idolBuffTimer > 0 ? 0.65 : 0.35;
          if (updatedCustomers.length < maxQueue && Math.random() < spawnChance) {
            updatedCustomers.push(
              createCustomerInstance(state.level, (state.upgrades.vip_zone || 0) > 0)
            );
          }

          // Staff auto-serving consumes real stock from inventory!
          const staffLv = state.upgrades.hire_staff || 0;
          let bonusStaffCoins = 0;
          let nextInv = state.inventory;

          if (staffLv > 0 && updatedCustomers.length >= 2 && Math.random() < staffLv * 0.12) {
            const targetIdx = updatedCustomers.findIndex((c) => c.uid !== state.selectedCustomerUid);
            if (targetIdx !== -1) {
              const targetCust = updatedCustomers[targetIdx];
              const teaId = targetCust.order.tea;
              // Check if shop has enough tea & milk for staff to make the drink!
              if ((nextInv[teaId] ?? 0) >= 1 && (nextInv.milk ?? 0) >= 1) {
                nextInv = {
                  ...nextInv,
                  [teaId]: nextInv[teaId] - 1,
                  milk: Math.max(0, nextInv.milk - 1),
                };
                bonusStaffCoins = Math.round(targetCust.baseReward * 0.9);
                updatedCustomers.splice(targetIdx, 1);
              }
            }
          }

          const selectedStillExists = updatedCustomers.some((c) => c.uid === state.selectedCustomerUid);
          const nextSelected = selectedStillExists
            ? state.selectedCustomerUid
            : updatedCustomers[0]?.uid || null;

          // Alien countdown
          let alienQuest = state.alienQuest;
          if (alienQuest.active && alienQuest.stage === 'crafting') {
            const nextTime = alienQuest.timeLeft - 1;
            if (nextTime <= 0) {
              sound.playAlienUFO();
              alienQuest = { ...alienQuest, stage: 'failed_suck', timeLeft: 0 };
            } else {
              alienQuest = { ...alienQuest, timeLeft: nextTime };
            }
          }

          // Online Mode 1: Tycoon Race
          let tycoonRace = state.onlineState.tycoonRace;
          if (tycoonRace.active) {
            const nextRaceTime = tycoonRace.timeLeft - 1;
            const rivals = tycoonRace.rivals.map((r) => ({
              ...r,
              earned: r.earned + Math.round(r.rate * (0.7 + Math.random() * 0.8)),
            }));
            if (nextRaceTime <= 0) {
              const allScores = [
                { name: state.playerName + ' (Bạn)', earned: tycoonRace.playerEarned, isPlayer: true },
                ...rivals.map((r) => ({ name: r.name, earned: r.earned, isPlayer: false })),
              ].sort((a, b) => b.earned - a.earned);
              const rank = allScores.findIndex((x) => x.isPlayer) + 1;
              if (rank === 1) {
                sound.playSuccessFanfare();
                confetti({ particleCount: 90, spread: 75 });
              }
              tycoonRace = {
                ...tycoonRace,
                active: false,
                timeLeft: 0,
                rivals,
                finishedResult: { rank, standings: allScores },
              };
            } else {
              tycoonRace = { ...tycoonRace, timeLeft: nextRaceTime, rivals };
            }
          }

          // Online Mode 2: 1v1 PvP
          let pvpBattle = state.onlineState.pvpBattle;
          if (pvpBattle.active && !pvpBattle.result) {
            const nextPvpTime = pvpBattle.timeLeft - 1;
            const nextProg = Math.min(100, pvpBattle.opponentProgress + (3.2 + Math.random() * 2.5));
            const nextStep = Math.min(6, Math.floor(nextProg / 17) + 1);
            if (nextProg >= 100 || nextPvpTime <= 0) {
              pvpBattle = {
                ...pvpBattle,
                active: false,
                opponentProgress: 100,
                opponentStep: 6,
                timeLeft: Math.max(0, nextPvpTime),
                result: 'lose',
              };
            } else {
              pvpBattle = {
                ...pvpBattle,
                timeLeft: nextPvpTime,
                opponentProgress: nextProg,
                opponentStep: nextStep,
              };
            }
          }

          const partyTimeLeft = Math.max(0, state.onlineState.partyTimeLeft - 1);

          let bossRaid = state.bossRaid;
          if (state.sceneMode === 'boss_raid' && !bossRaid.won && bossRaid.timeLeft > 0) {
            const allyDmg = 95 + Math.floor(Math.random() * 65);
            const newHp = Math.max(0, bossRaid.hp - allyDmg);
            const won = newHp === 0;
            if (won) {
              sound.playSuccessFanfare();
              confetti({ particleCount: 100, spread: 80 });
            }
            bossRaid = {
              ...bossRaid,
              hp: newHp,
              timeLeft: won ? bossRaid.timeLeft : Math.max(0, bossRaid.timeLeft - 1),
              won,
            };
          }

          let tournament = state.tournament;
          if (tournament.active && tournament.timeLeft > 0) {
            const nextT = tournament.timeLeft - 1;
            tournament = nextT <= 0 ? { ...tournament, active: false, timeLeft: 0 } : { ...tournament, timeLeft: nextT };
          }

          return {
            coins: state.coins + bonusStaffCoins,
            inventory: nextInv,
            totalCupsServed: bonusStaffCoins > 0 ? state.totalCupsServed + 1 : state.totalCupsServed,
            idolBuffTimer,
            cityDrinkBuffTimer,
            customers: updatedCustomers,
            selectedCustomerUid: nextSelected,
            alienQuest,
            bossRaid,
            tournament,
            onlineState: {
              ...state.onlineState,
              tycoonRace,
              pvpBattle,
              partyTimeLeft,
            },
          };
        });
      },

      // --- 6-STEP CRAFTING WITH FINITE STOCK DEDUCTION! ---
      selectCustomerAndCraft: (uid) => {
        sound.playClick();
        set({
          selectedCustomerUid: uid,
          sceneMode: 'crafting',
          currentCup: defaultCup(),
          lastServeResult: null,
        });
      },

      resetCup: () => {
        sound.playClick();
        const s = get();
        // If cup hasn't been shaken yet, refund unmixed ingredients; if already shaken/ruined, ingredients are wasted!
        if (s.currentCup.shakeProgress === 0) {
          const inv = { ...s.inventory };
          if (s.currentCup.tea) inv[s.currentCup.tea] = (inv[s.currentCup.tea] ?? 0) + 1;
          const prevMilkCost = MILK_OPTIONS.find((m) => m.id === s.currentCup.milk)?.stockCost || 0;
          const prevSugarCost = SUGAR_OPTIONS.find((x) => x.id === s.currentCup.sugar)?.stockCost || 0;
          const prevIceCost = ICE_OPTIONS.find((x) => x.id === s.currentCup.ice)?.stockCost || 0;
          inv.milk = (inv.milk ?? 0) + prevMilkCost;
          inv.sugar = (inv.sugar ?? 0) + prevSugarCost;
          inv.ice = (inv.ice ?? 0) + prevIceCost;
          s.currentCup.toppings.forEach((tid) => {
            inv[tid] = (inv[tid] ?? 0) + 1;
          });
          set({ inventory: inv, currentCup: defaultCup() });
        } else {
          s.addPopup('🗑️ Đã đổ bỏ ly pha hỏng (mất nguyên liệu đã lắc)!', '#fb923c');
          set({ currentCup: defaultCup() });
        }
      },

      setCupTea: (teaId) => {
        const s = get();
        if (s.currentCup.tea === teaId) return;
        const inv = { ...s.inventory };
        // Refund previous unshaken tea if switching
        if (s.currentCup.tea && s.currentCup.shakeProgress === 0) {
          inv[s.currentCup.tea] = (inv[s.currentCup.tea] ?? 0) + 1;
        }
        if ((inv[teaId] ?? 0) <= 0) {
          sound.playAngrySplat();
          s.addPopup('⚠️ Kho đã HẾT loại trà này! Bấm "📦 Nhập Hàng" ngay!', '#f43f5e');
          return;
        }
        inv[teaId] -= 1;
        sound.playPour();
        set({
          inventory: inv,
          currentCup: { ...s.currentCup, tea: teaId, step: Math.max(s.currentCup.step, 2) },
        });
      },

      setCupMilk: (milkVal) => {
        const s = get();
        if (s.currentCup.milk === milkVal) return;
        const inv = { ...s.inventory };
        const prevCost = MILK_OPTIONS.find((m) => m.id === s.currentCup.milk)?.stockCost || 0;
        const newCost = MILK_OPTIONS.find((m) => m.id === milkVal)?.stockCost || 0;
        const avail = (inv.milk ?? 0) + (s.currentCup.shakeProgress === 0 ? prevCost : 0);

        if (avail < newCost) {
          sound.playAngrySplat();
          s.addPopup('⚠️ HẾT SỮA TƯƠI trong kho! Hãy bấm "📦 Nhập Hàng"!', '#f43f5e');
          return;
        }
        inv.milk = avail - newCost;
        sound.playPour();
        set({
          inventory: inv,
          currentCup: { ...s.currentCup, milk: milkVal, step: Math.max(s.currentCup.step, 3) },
        });
      },

      setCupSugar: (sugarVal) => {
        const s = get();
        if (s.currentCup.sugar === sugarVal) return;
        const inv = { ...s.inventory };
        const prevCost = SUGAR_OPTIONS.find((x) => x.id === s.currentCup.sugar)?.stockCost || 0;
        const newCost = SUGAR_OPTIONS.find((x) => x.id === sugarVal)?.stockCost || 0;
        const avail = (inv.sugar ?? 0) + (s.currentCup.shakeProgress === 0 ? prevCost : 0);

        if (avail < newCost) {
          sound.playAngrySplat();
          s.addPopup('⚠️ HẾT ĐƯỜNG trong kho! Hãy bấm "📦 Nhập Hàng"!', '#f43f5e');
          return;
        }
        inv.sugar = avail - newCost;
        sound.playClick();
        const next = { ...s.currentCup, sugar: sugarVal };
        if (next.ice !== null) next.step = Math.max(next.step, 4);
        set({ inventory: inv, currentCup: next });
      },

      setCupIce: (iceVal) => {
        const s = get();
        if (s.currentCup.ice === iceVal) return;
        const inv = { ...s.inventory };
        const prevCost = ICE_OPTIONS.find((x) => x.id === s.currentCup.ice)?.stockCost || 0;
        const newCost = ICE_OPTIONS.find((x) => x.id === iceVal)?.stockCost || 0;
        const avail = (inv.ice ?? 0) + (s.currentCup.shakeProgress === 0 ? prevCost : 0);

        if (avail < newCost) {
          sound.playAngrySplat();
          s.addPopup('⚠️ HẾT ĐÁ VIÊN trong kho! Hãy bấm "📦 Nhập Hàng"!', '#f43f5e');
          return;
        }
        inv.ice = avail - newCost;
        sound.playIceClink();
        const next = { ...s.currentCup, ice: iceVal };
        if (next.sugar !== null) next.step = Math.max(next.step, 4);
        set({ inventory: inv, currentCup: next });
      },

      toggleCupTopping: (toppingId) => {
        const s = get();
        const exists = s.currentCup.toppings.includes(toppingId);
        const inv = { ...s.inventory };

        if (exists) {
          if (s.currentCup.shakeProgress === 0) {
            inv[toppingId] = (inv[toppingId] ?? 0) + 1;
          }
          sound.playClick();
          set({
            inventory: inv,
            currentCup: {
              ...s.currentCup,
              toppings: s.currentCup.toppings.filter((id) => id !== toppingId),
            },
          });
          return;
        }

        if ((inv[toppingId] ?? 0) <= 0) {
          sound.playAngrySplat();
          s.addPopup('⚠️ HẾT TOPPING này trong tủ! Hãy bấm "📦 Nhập Hàng"!', '#f43f5e');
          return;
        }

        inv[toppingId] -= 1;
        sound.playPearlDrop();
        set({
          inventory: inv,
          currentCup: {
            ...s.currentCup,
            toppings: [...s.currentCup.toppings, toppingId],
            step: Math.max(s.currentCup.step, 4),
          },
        });
      },

      toggleAlienIngredient: (key) => {
        sound.playPearlDrop();
        set((s) => ({
          currentCup: { ...s.currentCup, [key]: !s.currentCup[key] },
        }));
      },

      advanceToShakeStep: () => {
        sound.playClick();
        set((s) => ({ currentCup: { ...s.currentCup, step: 5 } }));
      },

      shakeShaker: (amount = 18) => {
        sound.playShake();
        set((s) => {
          const shakeProgress = Math.min(100, s.currentCup.shakeProgress + amount);
          const step = shakeProgress >= 100 ? 6 : 5;
          return {
            currentCup: { ...s.currentCup, shakeProgress, step },
          };
        });
      },

      pourAndSealCup: () => {
        sound.playPour();
        set((s) => ({ currentCup: { ...s.currentCup, isPoured: true } }));
        setTimeout(() => {
          sound.playSealMachine();
          set((s) => ({ currentCup: { ...s.currentCup, isSealed: true } }));
        }, 480);
      },

      serveFinishedCup: () => {
        const s = get();
        const cup = s.currentCup;

        if (s.alienQuest.active && s.alienQuest.stage === 'crafting') {
          const isAlienCorrect =
            cup.pearl200 && cup.pudding5 && cup.sugar === 0 && cup.loveSpice && cup.isSealed;
          if (isAlienCorrect) {
            sound.playSuccessFanfare();
            confetti({ particleCount: 120, spread: 90 });
            s.addCoinsAndXp(5000, 350);
            s.addPopup('+5.000 Xu 👽 Thiên Hà!', '#4ade80');
            set((state) => ({
              alienQuest: {
                active: true,
                stage: 'won',
                timeLeft: state.alienQuest.timeLeft,
                completedOnce: true,
              },
              character: {
                ...state.character,
                customTitle: 'Người Pha Chế Thiên Hà 🌌',
                badges: Array.from(
                  new Set([...state.character.badges, '👽 Người Pha Chế Thiên Hà'])
                ),
              },
              currentCup: defaultCup(),
            }));
          } else {
            sound.playAlienUFO();
            set({
              alienQuest: {
                active: true,
                stage: 'failed_suck',
                timeLeft: 0,
                completedOnce: s.alienQuest.completedOnce,
              },
              currentCup: defaultCup(),
            });
          }
          return;
        }

        if (s.onlineState.pvpBattle.active && s.onlineState.pvpBattle.sharedOrder) {
          const acc = evaluateAccuracy(cup, s.onlineState.pvpBattle.sharedOrder);
          if (acc.score >= 75) {
            sound.playSuccessFanfare();
            confetti({ particleCount: 95, spread: 70 });
            s.addCoinsAndXp(600, 120);
            s.addPopup('🏆 Thắng PvP +600 Xu!', '#facc15');
            set((state) => ({
              onlineState: {
                ...state.onlineState,
                pvpBattle: { ...state.onlineState.pvpBattle, active: false, result: 'win' },
              },
              character: {
                ...state.character,
                badges: Array.from(
                  new Set([...state.character.badges, '🏅 Huy Hiệu Độc Quyền Đại Chiến Pha Chế'])
                ),
              },
              currentCup: defaultCup(),
              activeModal: 'online',
            }));
          } else {
            sound.playAngrySplat();
            s.addPopup(`Sai công thức PvP (${acc.score}%)! Hãy pha lại!`, '#f43f5e');
            set({ currentCup: defaultCup() });
          }
          return;
        }

        if (s.tournament.active && s.tournament.order) {
          const acc = evaluateAccuracy(cup, s.tournament.order);
          if (acc.score >= 80) {
            if (s.tournament.round >= 3) {
              sound.playSuccessFanfare();
              confetti({ particleCount: 130, spread: 95 });
              s.addCoinsAndXp(3000, 280);
              s.addPopup('👑 VÔ ĐỊCH VUA PHA CHẾ +3.000 Xu!', '#facc15');
              set((state) => ({
                tournament: { ...state.tournament, active: false, round: 1 },
                character: {
                  ...state.character,
                  customTitle: 'Vua Pha Chế Boba Land 👑',
                  badges: Array.from(new Set([...state.character.badges, '👑 Quán Quân Vua Pha Chế'])),
                },
                currentCup: defaultCup(),
                sceneMode: 'shop',
              }));
            } else {
              sound.playCoin();
              const nextRound = s.tournament.round + 1;
              const opponents = { 2: 'Thần Trà Matcha (Bán Kết)', 3: 'Trùm Cuối Hoàng Gia (Chung Kết)' };
              s.addPopup(`Thắng vòng ${s.tournament.round}! Tiến vào vòng sau!`, '#38bdf8');
              set({
                tournament: {
                  active: true,
                  round: nextRound,
                  opponent: opponents[nextRound],
                  order: generateOrderForArchetype(pickRandom(CUSTOMER_ARCHETYPES), Math.max(6, s.level)),
                  timeLeft: 38 - nextRound * 3,
                },
                currentCup: defaultCup(),
              });
            }
          } else {
            sound.playAngrySplat();
            s.addPopup(`Độ chuẩn ${acc.score}% chưa đạt chuẩn Giải Đấu (>=80%)!`, '#f43f5e');
            set({ currentCup: defaultCup() });
          }
          return;
        }

        const customer =
          s.customers.find((c) => c.uid === s.selectedCustomerUid) || s.customers[0];
        if (!customer) {
          s.addCoinsAndXp(55, 15);
          s.addPopup('+55 Xu (Bán mang về)', '#facc15');
          set({ currentCup: defaultCup() });
          return;
        }

        const evalRes = evaluateAccuracy(cup, customer.order);

        if (evalRes.wrongTopping || evalRes.score < customer.strictAccuracy) {
          sound.playAngrySplat();
          const starPenalty = customer.archetypeId === 'reviewer' ? -0.25 : -0.05;
          set((state) => {
            const remaining = state.customers.filter((c) => c.uid !== customer.uid);
            return {
              shopStars: Math.max(1.0, Number((state.shopStars + starPenalty).toFixed(2))),
              customers: remaining,
              selectedCustomerUid: remaining[0]?.uid || null,
              currentCup: defaultCup(),
              angrySplat: {
                quote: customer.angryQuote,
                customerName: `${customer.icon} ${customer.type}`,
                accuracy: evalRes.score,
                timestamp: Date.now(),
              },
              lastServeResult: {
                isSuccess: false,
                accuracy: evalRes.score,
                coinsEarned: 0,
                xpEarned: 5,
                customerType: `${customer.icon} ${customer.type}`,
                comment: customer.angryQuote,
              },
            };
          });
          setTimeout(() => {
            set((st) =>
              st.angrySplat && Date.now() - st.angrySplat.timestamp >= 3200
                ? { angrySplat: null }
                : {}
            );
          }, 3400);
          return;
        }

        sound.playCoin();
        let tipMultiplier = 1 + (evalRes.score - 60) / 80;
        SHOP_UPGRADES.forEach((u) => {
          tipMultiplier += (s.upgrades[u.id] || 0) * u.tipBonus;
        });
        if (s.idolBuffTimer > 0) tipMultiplier *= 1.5;
        if (s.cityDrinkBuffTimer > 0) tipMultiplier *= 1.25;

        const coinsEarned = Math.round(customer.baseReward * tipMultiplier);
        const xpEarned = Math.round(customer.xpReward * (evalRes.score / 85));

        s.addCoinsAndXp(coinsEarned, xpEarned);
        s.addPopup(`+${coinsEarned} Xu (${evalRes.score}% Chuẩn!)`, '#4ade80');

        let specialComment = 'Ngon tuyệt cú mèo! Sẽ quay lại ủng hộ quán! 😍🧋';
        let nextIdolBuff = s.idolBuffTimer;
        let starDelta = 0.03;

        if (customer.archetypeId === 'idol' && evalRes.score >= 85) {
          nextIdolBuff = 45;
          specialComment = '🌟 IDOL LIVESTREAM QUẢNG CÁO QUÁN! Khách kéo đến gấp đôi trong 45s!!';
          confetti({ particleCount: 65, spread: 60 });
        } else if (customer.archetypeId === 'reviewer') {
          starDelta = 0.15;
          specialComment = '📸 Reviewer chấm 10/10 điểm! Uy tín sao của quán tăng mạnh! ⭐';
        } else if (customer.archetypeId === 'tycoon') {
          specialComment = '💎 Đại Gia cực kỳ ưng ý, thưởng nóng tiền boa kim cương!';
        }

        set((state) => {
          const remaining = state.customers.filter((c) => c.uid !== customer.uid);
          return {
            totalCupsServed: state.totalCupsServed + 1,
            shopStars: Math.min(5.0, Number((state.shopStars + starDelta).toFixed(2))),
            idolBuffTimer: nextIdolBuff,
            customers: remaining,
            selectedCustomerUid: remaining[0]?.uid || null,
            currentCup: defaultCup(),
            festivalProgress: {
              ...state.festivalProgress,
              drinksCrafted: state.festivalProgress.drinksCrafted + 1,
            },
            lastServeResult: {
              isSuccess: true,
              accuracy: evalRes.score,
              coinsEarned,
              xpEarned,
              customerType: `${customer.icon} ${customer.type}`,
              comment: specialComment,
            },
          };
        });
      },

      buyUpgrade: (upgradeId) => {
        const s = get();
        const cfg = SHOP_UPGRADES.find((u) => u.id === upgradeId);
        if (!cfg) return;
        const currentLv = s.upgrades[upgradeId] || 0;
        if (currentLv >= cfg.maxLevel) return;
        const cost = Math.round(cfg.baseCost * Math.pow(1.65, currentLv));
        if (s.coins < cost) {
          s.addPopup('Chưa đủ Xu để nâng cấp!', '#f43f5e');
          return;
        }
        sound.playSuccessFanfare();
        s.addPopup(`Nâng cấp ${cfg.name} Cấp ${currentLv + 1}!`, '#38bdf8');
        set((state) => ({
          coins: state.coins - cost,
          xp: state.xp + 45,
          upgrades: { ...state.upgrades, [upgradeId]: currentLv + 1 },
        }));
      },

      buyFranchise: (cityId) => {
        const s = get();
        const city = FRANCHISE_CITIES.find((c) => c.id === cityId);
        if (!city || s.franchises[cityId]) return;
        if (s.coins < city.cost) {
          s.addPopup('Chưa đủ Xu để mở chi nhánh này!', '#f43f5e');
          return;
        }
        sound.playSuccessFanfare();
        confetti({ particleCount: 80, spread: 70 });
        s.addPopup(`Khai trương chi nhánh ${city.name}!`, '#facc15');
        set((state) => ({
          coins: state.coins - city.cost,
          xp: state.xp + 120,
          franchises: { ...state.franchises, [cityId]: true },
        }));
      },

      equipOrBuyCosmetic: (type, itemId, cost) => {
        const s = get();
        const mapKey =
          type === 'model'
            ? ['unlockedModels', 'modelId']
            : type === 'hat'
            ? ['unlockedHats', 'hatId']
            : ['unlockedPets', 'petId'];
        const [unlockedKey, activeKey] = mapKey;
        const isUnlocked = s.character[unlockedKey].includes(itemId);

        if (isUnlocked) {
          sound.playClick();
          set((st) => ({
            character: { ...st.character, [activeKey]: itemId },
          }));
          return;
        }
        if (s.coins < cost) {
          s.addPopup('Chưa đủ Xu để mua vật phẩm!', '#f43f5e');
          return;
        }
        sound.playCoin();
        s.addPopup('Đã mở khóa & trang bị!', '#c084fc');
        set((st) => ({
          coins: st.coins - cost,
          character: {
            ...st.character,
            [unlockedKey]: [...st.character[unlockedKey], itemId],
            [activeKey]: itemId,
          },
        }));
      },

      startAlienQuest: () => {
        sound.playAlienUFO();
        set({
          activeModal: null,
          sceneMode: 'shop',
          cameraTarget: 'overview',
          alienQuest: {
            active: true,
            stage: 'intro',
            timeLeft: 60,
            completedOnce: get().alienQuest.completedOnce,
          },
        });
      },

      acceptAlienCrafting: () => {
        sound.playClick();
        set((s) => ({
          sceneMode: 'crafting',
          currentCup: defaultCup(),
          alienQuest: { ...s.alienQuest, stage: 'crafting', timeLeft: 60 },
        }));
      },

      closeAlienQuest: () => {
        set((s) => ({
          alienQuest: { ...s.alienQuest, active: false, stage: 'intro' },
          sceneMode: 'shop',
        }));
      },

      startTycoonRace: (durationSec = 120) => {
        sound.playSuccessFanfare();
        set((s) => ({
          activeModal: null,
          sceneMode: 'shop',
          onlineState: {
            ...s.onlineState,
            tycoonRace: {
              active: true,
              timeLeft: durationSec,
              duration: durationSec,
              playerStartCoins: s.coins,
              playerEarned: 0,
              rivals: [
                { id: 'r1', name: 'HoàngTửTrânChâu 👑', earned: 0, rate: 16 },
                { id: 'r2', name: 'BảoNgọc_Boba 🌸', earned: 0, rate: 13 },
                { id: 'r3', name: 'MinhTuấn_Pro ⚡', earned: 0, rate: 10 },
              ],
              finishedResult: null,
            },
          },
        }));
      },

      startPvpBattle: () => {
        sound.playSuccessFanfare();
        const sharedOrder = generateOrderForArchetype(CUSTOMER_ARCHETYPES[0], get().level);
        set((s) => ({
          activeModal: null,
          sceneMode: 'crafting',
          currentCup: defaultCup(),
          onlineState: {
            ...s.onlineState,
            pvpBattle: {
              active: true,
              opponentName: pickRandom(ONLINE_BOT_PLAYERS).name + ' 🔥',
              sharedOrder,
              opponentStep: 1,
              opponentProgress: 0,
              timeLeft: 45,
              result: null,
            },
          },
        }));
      },

      sendWorldChat: (text, senderOverride = null) => {
        if (!text.trim()) return;
        const s = get();
        const tier = getTierForLevel(s.level);
        const msg = {
          id: `msg_${Date.now()}_${Math.random()}`,
          sender: senderOverride || `${s.playerName} [${tier.badge} ${tier.title}]`,
          text: text.trim(),
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        };
        set((st) => ({
          onlineState: {
            ...st.onlineState,
            worldChat: [...st.onlineState.worldChat.slice(-25), msg],
          },
        }));
        return msg;
      },

      addFriend: (name) => {
        sound.playCoin();
        get().addPopup(`Đã kết bạn với ${name}! 💖`, '#f472b6');
        set((s) => ({
          onlineState: {
            ...s.onlineState,
            friends: Array.from(new Set([...s.onlineState.friends, name])),
          },
        }));
      },

      sendGiftToPlayer: (name) => {
        const s = get();
        if (s.coins < 50) {
          s.addPopup('Cần 50 Xu để gửi Hộp Quà Trân Châu!', '#f43f5e');
          return;
        }
        sound.playCoin();
        s.addPopup(`🎁 Đã tặng quà cho ${name}! (+25 XP thân thiện)`, '#c084fc');
        s.addCoinsAndXp(-50, 25);
        s.sendWorldChat(`🎁 Vừa gửi tặng một Hộp Quà Trà Sữa Hoàng Kim tới ${name}!`);
      },

      buyBobaFromOtherShop: (shop) => {
        const s = get();
        if (s.coins < shop.drinkPrice) {
          s.addPopup('Chưa đủ Xu để mua trà sữa quán bạn!', '#f43f5e');
          return;
        }
        sound.playPour();
        s.addCoinsAndXp(-shop.drinkPrice, 35);
        s.addPopup(`🧋 Đã thưởng thức ${shop.specialty}! Buff +25% tiền boa 60s!`, '#38bdf8');
        set({ cityDrinkBuffTimer: 60 });
      },

      triggerBobaParty: () => {
        const s = get();
        if (s.coins < 150) {
          s.addPopup('Cần 150 Xu để tổ chức Tiệc Trà Sữa toàn thành phố!', '#f43f5e');
          return;
        }
        sound.playSuccessFanfare();
        confetti({ particleCount: 140, spread: 100 });
        s.addCoinsAndXp(-150, 90);
        s.sendWorldChat('🎉 ĐANG TỔ CHỨC ĐẠI TIỆC TRÀ SỮA TẠI QUẢNG TRƯỜNG BOBA LAND! Mọi người cùng nhảy nào!! 🧋🎆');
        set((st) => ({
          sceneMode: 'city',
          activeModal: null,
          onlineState: { ...st.onlineState, partyTimeLeft: 40 },
        }));
      },

      startBossRaid: () => {
        sound.playAlienUFO();
        set({
          activeModal: null,
          sceneMode: 'boss_raid',
          bossRaid: { hp: 10000, maxHp: 10000, timeLeft: 60, playerDamage: 0, won: false },
        });
      },

      hitBossPearl: (dmg = 220) => {
        const s = get();
        if (s.bossRaid.won || s.bossRaid.hp <= 0) return;
        sound.playLaser();
        const newHp = Math.max(0, s.bossRaid.hp - dmg);
        const won = newHp === 0;
        if (won) {
          sound.playSuccessFanfare();
          confetti({ particleCount: 140, spread: 95 });
          s.addCoinsAndXp(2500, 260);
          s.addPopup('👾 ĐÁNH BẠI BOSS TRÂN CHÂU! +2.500 Xu!', '#facc15');
        }
        set((st) => ({
          bossRaid: { ...st.bossRaid, hp: newHp, playerDamage: st.bossRaid.playerDamage + dmg, won },
        }));
      },

      startCupRunner: () => {
        sound.playClick();
        set((s) => ({
          activeModal: null,
          sceneMode: 'cup_runner',
          cupRunner: { ...s.cupRunner, score: 0, coinsCollected: 0, isGameOver: false },
        }));
      },

      finishCupRunner: (score, coinsCollected) => {
        sound.playCoin();
        const s = get();
        const bonusCoins = coinsCollected * 15 + Math.floor(score / 5);
        if (bonusCoins > 0) {
          s.addCoinsAndXp(bonusCoins, 60);
          s.addPopup(`🏃‍♂️ Đua Cốc Khổng Lồ: +${bonusCoins} Xu!`, '#4ade80');
        }
        set((st) => ({
          cupRunner: {
            score,
            highScore: Math.max(st.cupRunner.highScore, score),
            coinsCollected,
            isGameOver: true,
          },
        }));
      },

      startTournament: () => {
        sound.playSuccessFanfare();
        set((s) => ({
          activeModal: null,
          sceneMode: 'crafting',
          currentCup: defaultCup(),
          tournament: {
            active: true,
            round: 1,
            opponent: 'Cao Thủ Hồng Trà (Tứ Kết)',
            order: generateOrderForArchetype(CUSTOMER_ARCHETYPES[3], Math.max(6, s.level)),
            timeLeft: 42,
          },
        }));
      },

      claimFestivalReward: () => {
        const s = get();
        if (s.festivalProgress.claimed || s.festivalProgress.drinksCrafted < 3) return;
        sound.playSuccessFanfare();
        confetti({ particleCount: 90, spread: 75 });
        s.addCoinsAndXp(1500, 180);
        s.addPopup('🏮 Nhận thưởng Lễ Hội Trà Sữa +1.500 Xu!', '#f472b6');
        set((st) => ({
          festivalProgress: { ...st.festivalProgress, claimed: true },
          character: {
            ...st.character,
            badges: Array.from(new Set([...st.character.badges, '🏮 Ngôi Sao Lễ Hội Trà Sữa'])),
          },
        }));
      },

      unlockDemoMaxMode: () => {
        sound.playSuccessFanfare();
        confetti({ particleCount: 120, spread: 90 });
        set((s) => ({
          coins: s.coins + 50000,
          level: Math.max(s.level, 52),
          shopStars: 5.0,
          upgrades: {
            sealer_pro: 3,
            furniture_set: 4,
            expand_shop: 2,
            auto_brewer: 3,
            hire_staff: 3,
            vip_zone: 1,
            rooftop_floor: 1,
          },
          inventory: {
            black_tea: 35,
            green_tea: 35,
            oolong_tea: 35,
            taro_tea: 35,
            milk: 35,
            sugar: 35,
            ice: 35,
            pearl: 35,
            pudding: 35,
            jelly: 35,
            golden_boba: 35,
            cheese_foam: 35,
          },
          franchises: {
            downtown: true,
            sakura_city: true,
          },
        }));
        get().addPopup('⚡ Đã mở khóa Vua Trà Sữa + Kho Nguyên Liệu Đầy 35/35!', '#facc15');
      },

      resetNewGame: () => {
        localStorage.removeItem('boba-tycoon-3d-save');
        window.location.reload();
      },
    }),
    {
      name: 'boba-tycoon-3d-save-v4',
      version: 4,
      merge: (persistedState, currentState) => {
        const ps = persistedState || {};
        return {
          ...currentState,
          ...ps,
          upgrades: {
            ...currentState.upgrades,
            ...(ps.upgrades || {}),
          },
          character: {
            ...currentState.character,
            ...(ps.character || {}),
          },
          inventory: {
            ...defaultInventory(),
            ...(ps.inventory || {}),
          },
        };
      },
      partialize: (state) => ({
        hasSeenIntro: state.hasSeenIntro,
        playerName: state.playerName,
        shopName: state.shopName,
        coins: state.coins,
        gems: state.gems,
        xp: state.xp,
        level: state.level,
        shopStars: state.shopStars,
        totalCupsServed: state.totalCupsServed,
        inventory: state.inventory,
        upgrades: state.upgrades,
        franchises: state.franchises,
        character: state.character,
        festivalProgress: state.festivalProgress,
      }),
    }
  )
);

export function evaluateAccuracy(cup, order) {
  let score = 100;
  let wrongTopping = false;

  if (cup.tea !== order.tea) score -= 30;
  if (cup.milk !== order.milk) score -= Math.abs((cup.milk ?? 0) - order.milk) === 50 ? 12 : 25;
  if (cup.sugar !== order.sugar) {
    const diff = Math.abs((cup.sugar ?? 50) - order.sugar);
    score -= Math.min(25, Math.round(diff * 0.3));
  }
  if (cup.ice !== order.ice) {
    score -= Math.abs((cup.ice ?? 50) - order.ice) === 50 ? 10 : 20;
  }

  const extraToppings = cup.toppings.filter((t) => !order.toppings.includes(t));
  const missingToppings = order.toppings.filter((t) => !cup.toppings.includes(t));

  if (extraToppings.length > 0) {
    wrongTopping = true;
    score -= extraToppings.length * 28;
  }
  if (missingToppings.length > 0) {
    score -= missingToppings.length * 22;
  }

  if (cup.shakeProgress < 80) score -= 15;
  if (!cup.isSealed) score -= 25;

  return {
    score: Math.max(0, Math.min(100, score)),
    wrongTopping,
  };
}
