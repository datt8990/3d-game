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
  SIGNATURE_RECIPES,
  DAILY_QUESTS,
  LUCKY_WHEEL_PRIZES,
  CUSTOMER_ARCHETYPES,
  SHOP_UPGRADES,
  FRANCHISE_CITIES,
  ONLINE_BOT_PLAYERS,
  getTierForLevel,
} from '../data/gameData';
import { SHOP_THEMES } from '../components/three/cafeTextures';
import { sound } from '../audio/soundEngine';

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateOrderForArchetype(archetype, playerLevel = 1) {
  const unlockedTeas = TEA_BASES.filter((t) => t.unlockLevel <= playerLevel);
  const unlockedToppings = TOPPINGS.filter((t) => t.unlockLevel <= playerLevel);

  const tea = pickRandom(unlockedTeas).id;
  let milk = 100;
  let sugar = 50;
  let ice = 50;
  let toppings = [];

  if (archetype.id === 'student') {
    sugar = pickRandom([50, 100]);
    milk = 100;
    const count = Math.min(unlockedToppings.length, Math.random() > 0.45 ? 2 : 1);
    const shuffled = [...unlockedToppings].sort(() => Math.random() - 0.5);
    toppings = shuffled.slice(0, count).map((t) => t.id);
  } else if (archetype.id === 'office') {
    sugar = 0;
    milk = pickRandom([50, 100]);
    ice = pickRandom([50, 100]);
    toppings = [pickRandom(unlockedToppings).id];
  } else if (archetype.id === 'troll') {
    milk = 0;
    ice = pickRandom([0, 100]);
    sugar = ice === 0 ? 100 : 0;
    toppings = unlockedToppings.slice(0, Math.min(2, unlockedToppings.length)).map((t) => t.id);
  } else if (archetype.id === 'idol') {
    sugar = 0;
    milk = 50;
    ice = 50;
    toppings = [pickRandom(unlockedToppings).id];
  } else {
    milk = pickRandom([50, 100]);
    sugar = pickRandom([50, 100]);
    ice = pickRandom([50, 100]);
    const count = Math.random() > 0.55 ? 2 : 1;
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

export const defaultInventory = () => ({
  black_tea: 10,
  strawberry_tea: 10,
  green_tea: 8,
  oolong_tea: 8,
  taro_tea: 6,
  milk: 14,
  sugar: 15,
  ice: 15,
  pearl: 10,
  pudding: 8,
  jelly: 8,
  golden_boba: 6,
  cheese_foam: 6,
});

// Smart pre-defaulted cup so girls only need 3 easy taps (Tea -> Topping -> 1-Tap Shake & Serve!)
function defaultCup(inv = null) {
  const milkStock = inv ? (inv.milk ?? 0) : 14;
  const sugarStock = inv ? (inv.sugar ?? 0) : 15;
  const iceStock = inv ? (inv.ice ?? 0) : 15;
  return {
    step: 1,
    tea: null,
    milk: milkStock >= 2 ? 100 : milkStock >= 1 ? 50 : 0,
    sugar: sugarStock >= 1 ? 50 : 0,
    ice: iceStock >= 1 ? 50 : 0,
    toppings: [],
    shakeProgress: 0,
    isPoured: false,
    isSealed: false,
    isServingAnim: false,
    pearl200: false,
    pudding5: false,
    loveSpice: false,
  };
}

const defaultDailyQuests = () => ({
  serve_3: { progress: 0, claimed: false },
  pet_animal: { progress: 0, claimed: false },
  checkin_photo: { progress: 0, claimed: false },
  change_style: { progress: 0, claimed: false },
});

export const useGameStore = create(
  persist(
    (set, get) => ({
      hasSeenIntro: false,
      playerName: 'Cô Chủ Boba',
      shopName: 'Tiệm Trà Sakura',
      coins: 550,
      gems: 25,
      xp: 0,
      level: 1,
      shopStars: 4.7,
      totalCupsServed: 0,

      // Finite Ingredient Stock System ("Kho nguyên liệu giới hạn")!
      inventory: defaultInventory(),

      // 4 Switchable 3D Shop Themes!
      shopTheme: 'sakura',
      unlockedThemes: ['sakura', 'matcha'],

      // Cozy Features: Recipe Book, Daily Quests, Lucky Wheel, Petting, Photo Check-in
      recipeMastery: {},
      dailyQuests: defaultDailyQuests(),
      luckyWheelFreeSpins: 1,
      lastPetTime: 0,
      photoCount: 0,

      sceneMode: 'shop',
      cameraTarget: 'overview',
      activeModal: null, // null | 'shop_upgrade' | 'inventory' | 'online' | 'leaderboard' | 'events' | 'items' | 'character' | 'cozy' | 'photo'

      upgrades: {
        sealer_pro: 0,
        furniture_set: 2,
        expand_shop: 0,
        auto_brewer: 0,
        hire_staff: 0,
        vip_zone: 0,
        rooftop_floor: 0,
      },
      franchises: {},

      character: {
        modelId: 'vivi',
        hatId: 'none',
        petId: 'cafe_cat',
        unlockedModels: ['vivi', 'girl_a'],
        unlockedHats: ['none'],
        unlockedPets: ['none', 'cafe_cat'],
        customTitle: null,
        badges: ['🌸 Chủ Quán Khởi Nghiệp'],
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
          playerStartCoins: 550,
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
          { id: 'c1', sender: 'BảoNgọc_Boba 🌸', text: 'Style Quán Sakura Hồng Phấn với tiếng rót trà thật nghe chill xỉu luôn mọi người ơi!', time: 'Vừa xong' },
          { id: 'c2', sender: 'HoàngTửTrânChâu 👑', text: 'Ai solo Đại Chiến Pha Chế 1v1 không? Đang chuỗi thắng 5 trận nè 😎', time: 'Vừa xong' },
          { id: 'c3', sender: 'MèoÚ_NghiệnTrà 🐱', text: 'Mọi người nhớ vuốt ve bé Mèo trong quán để nhận Xu & quay Vòng Quay May Mắn nha!', time: 'Vừa xong' },
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

      incrementQuest: (questId, delta = 1) => {
        set((s) => {
          const cur = s.dailyQuests?.[questId] || { progress: 0, claimed: false };
          return {
            dailyQuests: {
              ...(s.dailyQuests || defaultDailyQuests()),
              [questId]: { ...cur, progress: cur.progress + delta },
            },
          };
        });
      },

      claimDailyQuest: (questId) => {
        const s = get();
        const qCfg = DAILY_QUESTS.find((q) => q.id === questId);
        const qState = s.dailyQuests?.[questId];
        if (!qCfg || !qState || qState.claimed || qState.progress < qCfg.target) return;
        sound.playSuccessFanfare();
        confetti({ particleCount: 65, spread: 60, origin: { y: 0.65 } });
        s.addCoinsAndXp(qCfg.rewardCoins, qCfg.rewardXp);
        s.addPopup(`🎁 Hoàn thành nhiệm vụ: +${qCfg.rewardCoins} Xu!`, '#4ade80');
        set((st) => ({
          dailyQuests: {
            ...st.dailyQuests,
            [questId]: { ...qState, claimed: true },
          },
        }));
      },

      selectOrBuyTheme: (themeId) => {
        const s = get();
        const theme = SHOP_THEMES[themeId];
        if (!theme) return;
        const unlocked = s.unlockedThemes || ['sakura', 'matcha'];
        if (unlocked.includes(themeId)) {
          sound.playClick();
          set({ shopTheme: themeId });
          s.incrementQuest('change_style', 1);
          s.addPopup(`🎨 Đã đổi sang Style: ${theme.icon} ${theme.name}!`, '#f472b6');
          return;
        }
        if (s.coins < theme.cost) {
          s.addPopup(`Cần ${theme.cost} Xu để mở khóa Style ${theme.name}!`, '#f43f5e');
          return;
        }
        sound.playSuccessFanfare();
        confetti({ particleCount: 70, spread: 65 });
        set({
          coins: s.coins - theme.cost,
          shopTheme: themeId,
          unlockedThemes: [...unlocked, themeId],
        });
        s.incrementQuest('change_style', 1);
        s.addPopup(`✨ Mở khóa Style ${theme.icon} ${theme.name}!`, '#f472b6');
      },

      spinLuckyWheel: () => {
        const s = get();
        const isFree = (s.luckyWheelFreeSpins ?? 0) > 0;
        const spinCost = 80;
        if (!isFree && s.coins < spinCost) {
          s.addPopup(`Cần ${spinCost} Xu để quay tiếp!`, '#f43f5e');
          return null;
        }
        const prizeIdx = Math.floor(Math.random() * LUCKY_WHEEL_PRIZES.length);
        const prize = LUCKY_WHEEL_PRIZES[prizeIdx];
        sound.playClick();
        set((st) => ({
          coins: isFree ? st.coins : st.coins - spinCost,
          luckyWheelFreeSpins: isFree ? Math.max(0, (st.luckyWheelFreeSpins ?? 1) - 1) : 0,
        }));
        return { prizeIdx, prize };
      },

      applyLuckyWheelPrize: (prize) => {
        if (!prize) return;
        const s = get();
        sound.playSuccessFanfare();
        confetti({ particleCount: 75, spread: 70 });
        if (prize.type === 'coins') {
          s.addCoinsAndXp(prize.value, 20);
          s.addPopup(`🎰 Trúng thưởng ${prize.icon} +${prize.value} Xu!`, '#facc15');
        } else if (prize.type === 'xp') {
          s.addCoinsAndXp(0, prize.value);
          s.addPopup(`🎰 Trúng thưởng ⭐ +${prize.value} XP!`, '#38bdf8');
        } else if (prize.type === 'idol') {
          set({ idolBuffTimer: Math.max(s.idolBuffTimer, prize.value) });
          s.addPopup(`🎰 Trúng Buff 🌸 Idol x2 Khách (${prize.value}s)!`, '#f472b6');
        } else if (prize.type === 'stock') {
          const maxCap = s.getMaxStockCapacity();
          const fullInv = { ...s.inventory };
          Object.keys(defaultInventory()).forEach((k) => {
            fullInv[k] = maxCap;
          });
          set({ inventory: fullInv });
          s.addPopup(`🎰 Trúng thưởng 📦 Lấp Đầy Toàn Bộ Kho!`, '#4ade80');
        }
      },

      petCafeAnimal: (petName = 'Bé Mèo Mướp') => {
        const s = get();
        const now = Date.now();
        if (now - (s.lastPetTime || 0) < 2200) {
          sound.playKittyMeow();
          return;
        }
        sound.playKittyMeow();
        set({ lastPetTime: now });
        s.addCoinsAndXp(20, 12);
        s.incrementQuest('pet_animal', 1);
        s.addPopup(`💖 ${petName} thích lắm! Meow~ (+20 Xu)`, '#f472b6');
      },

      claimPhotoBonus: () => {
        const s = get();
        sound.playShutter();
        setTimeout(() => sound.playCoin(), 180);
        s.addCoinsAndXp(120, 30);
        s.incrementQuest('checkin_photo', 1);
        set((st) => ({ photoCount: (st.photoCount || 0) + 1 }));
        s.addPopup('📸 Đăng ảnh Check-in BobaGram thành công! (+120 Xu)', '#f472b6');
      },

      dismissIntro: (playerName, shopName) => {
        sound.preload();
        sound.playDoorBell();
        set((s) => ({
          hasSeenIntro: true,
          playerName: playerName?.trim() || s.playerName,
          shopName: shopName?.trim() || s.shopName,
        }));
      },

      setSceneMode: (mode) => {
        sound.playClick();
        const s = get();
        set({
          sceneMode: mode,
          activeModal: null,
          currentCup: mode === 'crafting' ? defaultCup(s.inventory) : s.currentCup,
        });
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
        }, 2300);
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

      // --- INGREDIENT RESTOCKING ACTIONS ---
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

        let spawnedNewCustomer = false;

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
            spawnedNewCustomer = true;
          }

          // Staff auto-serving consumes real stock!
          const staffLv = state.upgrades.hire_staff || 0;
          let bonusStaffCoins = 0;
          let nextInv = state.inventory;

          if (staffLv > 0 && updatedCustomers.length >= 2 && Math.random() < staffLv * 0.12) {
            const targetIdx = updatedCustomers.findIndex((c) => c.uid !== state.selectedCustomerUid);
            if (targetIdx !== -1) {
              const targetCust = updatedCustomers[targetIdx];
              const teaId = targetCust.order.tea;
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
            const nextProg = Math.min(100, pvpBattle.opponentProgress + (3.0 + Math.random() * 2.2));
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

        if (spawnedNewCustomer && s.hasSeenIntro && (s.sceneMode === 'shop' || s.sceneMode === 'crafting')) {
          sound.playDoorBell();
        }
      },

      // --- EFFORTLESS 3-STEP CRAFTING WITH STRICT 0-STOCK LOCKING! ---
      selectCustomerAndCraft: (uid) => {
        sound.playClick();
        const s = get();
        set({
          selectedCustomerUid: uid,
          sceneMode: 'crafting',
          currentCup: defaultCup(s.inventory),
          lastServeResult: null,
        });
      },

      resetCup: () => {
        sound.playClick();
        const s = get();
        if (s.currentCup.isServingAnim) return;
        const inv = { ...s.inventory };
        if (s.currentCup.shakeProgress === 0) {
          if (s.currentCup.tea) inv[s.currentCup.tea] = (inv[s.currentCup.tea] ?? 0) + 1;
          s.currentCup.toppings.forEach((tid) => {
            inv[tid] = (inv[tid] ?? 0) + 1;
          });
          set({ inventory: inv, currentCup: defaultCup(inv) });
        } else {
          s.addPopup('🗑️ Đã bỏ ly cũ!', '#fb923c');
          set({ currentCup: defaultCup(inv) });
        }
      },

      setCupTea: (teaId) => {
        const s = get();
        if (s.currentCup.isServingAnim || s.currentCup.tea === teaId) return;
        const inv = { ...s.inventory };
        if (s.currentCup.tea && s.currentCup.shakeProgress === 0) {
          inv[s.currentCup.tea] = (inv[s.currentCup.tea] ?? 0) + 1;
        }
        if ((inv[teaId] ?? 0) <= 0) {
          sound.playAngrySplat();
          s.addPopup('⚠️ Đã HẾT vị trà này! Bấm "🚚 Nhập Đầy Kho" nhé!', '#f43f5e');
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
        if (s.currentCup.isServingAnim) return;
        const newCost = MILK_OPTIONS.find((m) => m.id === milkVal)?.stockCost || 0;
        if ((s.inventory.milk ?? 0) < newCost) {
          sound.playAngrySplat();
          s.addPopup('⚠️ HẾT SỮA TƯƠI trong kho! Bấm "🚚 Nhập Đầy Kho"!', '#f43f5e');
          return;
        }
        sound.playPourMilk();
        set({ currentCup: { ...s.currentCup, milk: milkVal } });
      },

      setCupSugar: (sugarVal) => {
        const s = get();
        if (s.currentCup.isServingAnim) return;
        const newCost = SUGAR_OPTIONS.find((x) => x.id === sugarVal)?.stockCost || 0;
        if ((s.inventory.sugar ?? 0) < newCost) {
          sound.playAngrySplat();
          s.addPopup('⚠️ HẾT ĐƯỜNG trong kho! Bấm "🚚 Nhập Đầy Kho"!', '#f43f5e');
          return;
        }
        sound.playClick();
        set({ currentCup: { ...s.currentCup, sugar: sugarVal } });
      },

      setCupIce: (iceVal) => {
        const s = get();
        if (s.currentCup.isServingAnim) return;
        const newCost = ICE_OPTIONS.find((x) => x.id === iceVal)?.stockCost || 0;
        if ((s.inventory.ice ?? 0) < newCost) {
          sound.playAngrySplat();
          s.addPopup('⚠️ HẾT ĐÁ VIÊN trong kho! Bấm "🚚 Nhập Đầy Kho"!', '#f43f5e');
          return;
        }
        sound.playIceClink();
        set({ currentCup: { ...s.currentCup, ice: iceVal } });
      },

      toggleCupTopping: (toppingId) => {
        const s = get();
        if (s.currentCup.isServingAnim) return;
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
          s.addPopup('⚠️ HẾT TOPPING này! Bấm "🚚 Nhập Đầy Kho" nhé!', '#f43f5e');
          return;
        }

        inv[toppingId] -= 1;
        sound.playPearlDrop();
        set({
          inventory: inv,
          currentCup: {
            ...s.currentCup,
            toppings: [...s.currentCup.toppings, toppingId],
            step: Math.max(s.currentCup.step, 3),
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

      shakeShaker: (amount = 34) => {
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
        }, 400);
      },

      // ONE-TAP MAGIC SERVE (Step 3): Shake -> Seal -> Serve in 1.05s with real-life audio!
      autoShakeSealAndServe: () => {
        const s = get();
        if (s.currentCup.isServingAnim) return;
        const isAlien = s.alienQuest.active && s.alienQuest.stage === 'crafting';
        if (!s.currentCup.tea && !isAlien) {
          s.addPopup('🍓 Chọn 1 vị trà sữa ở Bước 1 trước nhé!', '#f43f5e');
          return;
        }

        // Deduct milk, sugar, ice stock cleanly right on brew
        const inv = { ...s.inventory };
        const milkCost = MILK_OPTIONS.find((m) => m.id === s.currentCup.milk)?.stockCost || 0;
        const sugarCost = SUGAR_OPTIONS.find((x) => x.id === s.currentCup.sugar)?.stockCost || 0;
        const iceCost = ICE_OPTIONS.find((x) => x.id === s.currentCup.ice)?.stockCost || 0;

        if ((inv.milk ?? 0) < milkCost || (inv.sugar ?? 0) < sugarCost || (inv.ice ?? 0) < iceCost) {
          sound.playAngrySplat();
          s.addPopup('⚠️ Thiếu Sữa/Đường/Đá trong kho! Bấm "🚚 Nhập Đầy Kho"!', '#f43f5e');
          return;
        }

        inv.milk = Math.max(0, (inv.milk ?? 0) - milkCost);
        inv.sugar = Math.max(0, (inv.sugar ?? 0) - sugarCost);
        inv.ice = Math.max(0, (inv.ice ?? 0) - iceCost);

        // Phase 1: Shake 1
        sound.playShake();
        set((st) => ({
          inventory: inv,
          currentCup: { ...st.currentCup, isServingAnim: true, step: 5, shakeProgress: 45 },
        }));

        // Phase 2: Shake 2
        setTimeout(() => {
          sound.playShake();
          set((st) => ({
            currentCup: { ...st.currentCup, shakeProgress: 100, isPoured: true, step: 6 },
          }));
        }, 280);

        // Phase 3: Seal Cup
        setTimeout(() => {
          sound.playSealMachine();
          set((st) => ({
            currentCup: { ...st.currentCup, isSealed: true },
          }));
        }, 580);

        // Phase 4: Serve to Customer!
        setTimeout(() => {
          get().serveFinishedCup();
        }, 1020);
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
              currentCup: defaultCup(state.inventory),
            }));
          } else {
            sound.playAlienUFO();
            set((state) => ({
              alienQuest: {
                active: true,
                stage: 'failed_suck',
                timeLeft: 0,
                completedOnce: s.alienQuest.completedOnce,
              },
              currentCup: defaultCup(state.inventory),
            }));
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
              currentCup: defaultCup(state.inventory),
              activeModal: 'online',
            }));
          } else {
            sound.playAngrySplat();
            s.addPopup(`Sai công thức PvP (${acc.score}%)! Hãy pha lại!`, '#f43f5e');
            set((state) => ({ currentCup: defaultCup(state.inventory) }));
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
                currentCup: defaultCup(state.inventory),
                sceneMode: 'shop',
              }));
            } else {
              sound.playCoin();
              const nextRound = s.tournament.round + 1;
              const opponents = { 2: 'Thần Trà Matcha (Bán Kết)', 3: 'Trùm Cuối Hoàng Gia (Chung Kết)' };
              s.addPopup(`Thắng vòng ${s.tournament.round}! Tiến vào vòng sau!`, '#38bdf8');
              set((state) => ({
                tournament: {
                  active: true,
                  round: nextRound,
                  opponent: opponents[nextRound],
                  order: generateOrderForArchetype(pickRandom(CUSTOMER_ARCHETYPES), Math.max(4, s.level)),
                  timeLeft: 38 - nextRound * 3,
                },
                currentCup: defaultCup(state.inventory),
              }));
            }
          } else {
            sound.playAngrySplat();
            s.addPopup(`Độ chuẩn ${acc.score}% chưa đạt chuẩn Giải Đấu (>=80%)!`, '#f43f5e');
            set((state) => ({ currentCup: defaultCup(state.inventory) }));
          }
          return;
        }

        const customer =
          s.customers.find((c) => c.uid === s.selectedCustomerUid) || s.customers[0];
        if (!customer) {
          sound.playSlurp();
          sound.playCoin();
          s.addCoinsAndXp(65, 18);
          s.incrementQuest('serve_3', 1);
          s.addPopup('+65 Xu (Bán mang về)', '#facc15');
          set((state) => ({ currentCup: defaultCup(state.inventory) }));
          return;
        }

        const evalRes = evaluateAccuracy(cup, customer.order);

        if (evalRes.wrongTopping || evalRes.score < customer.strictAccuracy) {
          sound.playAngrySplat();
          const starPenalty = customer.archetypeId === 'reviewer' ? -0.2 : -0.05;
          set((state) => {
            const remaining = state.customers.filter((c) => c.uid !== customer.uid);
            return {
              shopStars: Math.max(1.0, Number((state.shopStars + starPenalty).toFixed(2))),
              customers: remaining,
              selectedCustomerUid: remaining[0]?.uid || null,
              currentCup: defaultCup(state.inventory),
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
              st.angrySplat && Date.now() - st.angrySplat.timestamp >= 3000
                ? { angrySplat: null }
                : {}
            );
          }, 3200);
          return;
        }

        // Real Slurp + Cash Coins Sound!
        sound.playSlurp();
        setTimeout(() => sound.playCoin(), 220);

        let tipMultiplier = 1 + (evalRes.score - 60) / 80;
        SHOP_UPGRADES.forEach((u) => {
          tipMultiplier += (s.upgrades[u.id] || 0) * u.tipBonus;
        });
        if (s.idolBuffTimer > 0) tipMultiplier *= 1.5;
        if (s.cityDrinkBuffTimer > 0) tipMultiplier *= 1.25;

        const coinsEarned = Math.round(customer.baseReward * tipMultiplier);
        const xpEarned = Math.round(customer.xpReward * (evalRes.score / 85));

        s.addCoinsAndXp(coinsEarned, xpEarned);
        s.incrementQuest('serve_3', 1);
        s.addPopup(`+${coinsEarned} Xu (${evalRes.score}% Chuẩn!)`, '#4ade80');

        // Track Recipe Mastery if cup matches a signature recipe!
        const matchedRecipe = SIGNATURE_RECIPES.find(
          (r) => r.tea === cup.tea && r.toppings.every((t) => cup.toppings.includes(t))
        );

        let specialComment = 'Ngon tuyệt cú mèo! Quán xinh quá sẽ quay lại liền! 😍🧋';
        let nextIdolBuff = s.idolBuffTimer;
        let starDelta = 0.03;

        if (customer.archetypeId === 'idol' && evalRes.score >= 82) {
          nextIdolBuff = 45;
          specialComment = '🌟 IDOL ĐĂNG STORY QUẢNG CÁO! Khách kéo đến gấp đôi trong 45s!!';
          confetti({ particleCount: 65, spread: 60 });
        } else if (customer.archetypeId === 'reviewer') {
          starDelta = 0.15;
          specialComment = '📸 Reviewer chấm 10/10 điểm! Uy tín quán tăng vọt ⭐';
        } else if (customer.archetypeId === 'tycoon') {
          specialComment = '💎 Đại Gia siêu ưng ý, thưởng nóng tiền boa kim cương!';
        }

        set((state) => {
          const remaining = state.customers.filter((c) => c.uid !== customer.uid);
          const nextMastery = { ...(state.recipeMastery || {}) };
          if (matchedRecipe) {
            nextMastery[matchedRecipe.id] = (nextMastery[matchedRecipe.id] || 0) + 1;
          }
          return {
            totalCupsServed: state.totalCupsServed + 1,
            shopStars: Math.min(5.0, Number((state.shopStars + starDelta).toFixed(2))),
            idolBuffTimer: nextIdolBuff,
            customers: remaining,
            selectedCustomerUid: remaining[0]?.uid || null,
            currentCup: defaultCup(state.inventory),
            recipeMastery: nextMastery,
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
        const s = get();
        set({
          sceneMode: 'crafting',
          currentCup: defaultCup(s.inventory),
          alienQuest: { ...s.alienQuest, stage: 'crafting', timeLeft: 60 },
        });
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
        const s = get();
        const sharedOrder = generateOrderForArchetype(CUSTOMER_ARCHETYPES[0], s.level);
        set({
          activeModal: null,
          sceneMode: 'crafting',
          currentCup: defaultCup(s.inventory),
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
        });
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
        sound.playSlurp();
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
        const s = get();
        set({
          activeModal: null,
          sceneMode: 'crafting',
          currentCup: defaultCup(s.inventory),
          tournament: {
            active: true,
            round: 1,
            opponent: 'Cao Thủ Hồng Trà (Tứ Kết)',
            order: generateOrderForArchetype(CUSTOMER_ARCHETYPES[3], Math.max(4, s.level)),
            timeLeft: 42,
          },
        });
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
          unlockedThemes: ['sakura', 'matcha', 'paris', 'seoul'],
          luckyWheelFreeSpins: 5,
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
            strawberry_tea: 35,
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
        get().addPopup('⚡ Đã mở khóa Vua Trà Sữa + 4 Style Quán + Full Kho!', '#facc15');
      },

      resetNewGame: () => {
        localStorage.removeItem('boba-tycoon-3d-save-v5');
        window.location.reload();
      },
    }),
    {
      name: 'boba-tycoon-3d-save-v5',
      version: 5,
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
          dailyQuests: {
            ...defaultDailyQuests(),
            ...(ps.dailyQuests || {}),
          },
          unlockedThemes: ps.unlockedThemes || ['sakura', 'matcha'],
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
        shopTheme: state.shopTheme,
        unlockedThemes: state.unlockedThemes,
        recipeMastery: state.recipeMastery,
        dailyQuests: state.dailyQuests,
        luckyWheelFreeSpins: state.luckyWheelFreeSpins,
        photoCount: state.photoCount,
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

  if (cup.tea !== order.tea) score -= 35;
  if (cup.milk !== order.milk) score -= Math.abs((cup.milk ?? 0) - order.milk) === 50 ? 10 : 22;
  if (cup.sugar !== order.sugar) {
    const diff = Math.abs((cup.sugar ?? 50) - order.sugar);
    score -= Math.min(20, Math.round(diff * 0.25));
  }
  if (cup.ice !== order.ice) {
    score -= Math.abs((cup.ice ?? 50) - order.ice) === 50 ? 8 : 16;
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

  if (cup.shakeProgress < 80) score -= 12;
  if (!cup.isSealed) score -= 20;

  return {
    score: Math.max(0, Math.min(100, score)),
    wrongTopping,
  };
}
