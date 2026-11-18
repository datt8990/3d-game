// Full Game Configuration for TRÀ SỮA ĐẠI CHIẾN – MILK TEA TYCOON 3D 🧋

export const TEA_BASES = [
  {
    id: 'black_tea',
    name: 'Hồng Trà Đen',
    shortName: 'Trà Đen',
    icon: '🍂',
    color: '#6f3b1e',
    milkColor: '#d49a6a',
    unlockLevel: 1,
    restockPack: 10,
    restockCost: 35,
    desc: 'Đậm đà truyền thống chuẩn vị Đài Loan',
  },
  {
    id: 'green_tea',
    name: 'Trà Xanh Matcha',
    shortName: 'Trà Xanh',
    icon: '🍵',
    color: '#3c8d53',
    milkColor: '#8fd19e',
    unlockLevel: 1,
    restockPack: 10,
    restockCost: 35,
    desc: 'Thanh mát hương trà xanh Uji Nhật Bản',
  },
  {
    id: 'oolong_tea',
    name: 'Trà Ô Long Hoàng Kim',
    shortName: 'Ô Long',
    icon: '🌼',
    color: '#b86b1b',
    milkColor: '#e7bc7d',
    unlockLevel: 1,
    restockPack: 10,
    restockCost: 40,
    desc: 'Hương hoa mộc thơm ngát hậu vị ngọt',
  },
  {
    id: 'taro_tea',
    name: 'Trà Khoai Môn Tím',
    shortName: 'Khoai Môn',
    icon: '🍠',
    color: '#7e48b8',
    milkColor: '#bfa2eb',
    unlockLevel: 4,
    restockPack: 10,
    restockCost: 45,
    desc: 'Béo bùi sắc tím pastel gây nghiện',
  },
];

export const BASE_INGREDIENTS = [
  { id: 'milk', name: 'Sữa Tươi Nguyên Kem', icon: '🥛', restockPack: 12, restockCost: 30 },
  { id: 'sugar', name: 'Đường Mía Hữu Cơ', icon: '🍬', restockPack: 15, restockCost: 20 },
  { id: 'ice', name: 'Đá Viên Tinh Khiết', icon: '🧊', restockPack: 15, restockCost: 15 },
];

export const MILK_OPTIONS = [
  { id: 0, label: '0% Không Sữa', short: '0% Sữa', icon: '💧', ratio: 0, stockCost: 0 },
  { id: 50, label: '50% Sữa Tươi', short: '50% Sữa', icon: '🥛', ratio: 0.5, stockCost: 1 },
  { id: 100, label: '100% Full Kem Sữa', short: '100% Sữa', icon: '🍼', ratio: 1.0, stockCost: 2 },
];

export const SUGAR_OPTIONS = [
  { id: 0, label: '0% Đường', stockCost: 0 },
  { id: 30, label: '30% Ít Đường', stockCost: 1 },
  { id: 50, label: '50% Vừa', stockCost: 1 },
  { id: 70, label: '70% Ngọt', stockCost: 1 },
  { id: 100, label: '100% Full Đường', stockCost: 2 },
];

export const ICE_OPTIONS = [
  { id: 0, label: '0% Không Đá', stockCost: 0 },
  { id: 50, label: '50% Ít Đá', stockCost: 1 },
  { id: 100, label: '100% Đầy Đá', stockCost: 2 },
];

export const TOPPINGS = [
  {
    id: 'pearl',
    name: 'Trân Châu Đen',
    icon: '⚫',
    color: '#1e1310',
    unlockLevel: 1,
    priceBonus: 15,
    restockPack: 8,
    restockCost: 30,
  },
  {
    id: 'pudding',
    name: 'Pudding Trứng',
    icon: '🍮',
    color: '#facc15',
    unlockLevel: 1,
    priceBonus: 20,
    restockPack: 8,
    restockCost: 35,
  },
  {
    id: 'jelly',
    name: 'Thạch Dừa Giòn',
    icon: '🧊',
    color: '#e0f2fe',
    unlockLevel: 1,
    priceBonus: 15,
    restockPack: 8,
    restockCost: 30,
  },
  {
    id: 'golden_boba',
    name: 'Trân Châu Hoàng Kim',
    icon: '🟡',
    color: '#f59e0b',
    unlockLevel: 6,
    priceBonus: 30,
    restockPack: 8,
    restockCost: 45,
  },
  {
    id: 'cheese_foam',
    name: 'Kem Phô Mai Mặn',
    icon: '🧀',
    color: '#fffbeb',
    unlockLevel: 6,
    priceBonus: 35,
    restockPack: 8,
    restockCost: 50,
  },
];

// 5. Hệ thống cấp độ và phần thưởng
export const LEVEL_TIERS = [
  { min: 1, max: 5, title: 'Tập Sự', badge: '🌱', unlockText: 'Quán nhỏ khởi nghiệp', color: '#4ade80' },
  { min: 6, max: 10, title: 'Chủ Quán', badge: '🧋', unlockText: 'Mở khóa Topping Hoàng Kim & Kem Cheese', color: '#38bdf8' },
  { min: 20 >= 11 ? 11 : 11, max: 20, title: 'Đại Gia Boba', badge: '💼', unlockText: 'Mở khóa Thuê Nhân Viên & Đầu Bếp', color: '#c084fc' },
  { min: 21, max: 30, title: 'Ông Trùm', badge: '🏢', unlockText: 'Mở chuỗi thương hiệu đa thành phố', color: '#fb923c' },
  { min: 31, max: 50, title: 'Huyền Thoại', badge: '👑', unlockText: 'Mở Khu Vực VIP Hoàng Gia', color: '#f43f5e' },
  { min: 51, max: 999, title: 'Vua Trà Sữa', badge: '🌟', unlockText: 'Làm chủ Thành Phố Boba Land riêng', color: '#facc15' },
];

export function getTierForLevel(level) {
  return LEVEL_TIERS.find((t) => level >= t.min && level <= t.max) || LEVEL_TIERS[LEVEL_TIERS.length - 1];
}

// 2B. Các kiểu khách hàng Chibi 3D có khuôn mặt & 32 animation gốc mượt mà!
export const CUSTOMER_ARCHETYPES = [
  {
    id: 'student',
    type: 'Học sinh',
    icon: '🎒',
    model: '/models/characters/character-female-a.glb',
    patience: 52,
    baseReward: 95,
    xpReward: 30,
    trait: 'Thích trà sữa ngọt & thật nhiều topping!',
    greetings: [
      'Chủ quán ơi cho em ly full topping nhai cho đã miệng nha!',
      'Tan học đói bụng quá, cho em ly trà sữa ngập topping ạ!',
    ],
    angryQuotes: [
      'Ủa em gọi topping khác mà?! Ghét quá ném luôn ly nè!! 😡🧋',
      'Pha trật lất đơn của học sinh rồi, trả tiền đây!! 💢',
    ],
  },
  {
    id: 'office',
    type: 'Dân văn phòng',
    icon: '💼',
    model: '/models/characters/character-male-b.glb',
    patience: 36,
    baseReward: 120,
    xpReward: 38,
    trait: 'Muốn cực nhanh, ít đường (0%–30%) để kịp chạy deadline!',
    greetings: [
      'Làm nhanh giúp mình 1 ly ít đường nhé, sắp trễ họp với sếp rồi!',
      'Deadline dí sát nút rồi, pha tốc độ ánh sáng giúp tôi nhé!',
    ],
    angryQuotes: [
      'Ngọt khé cổ thế này sao chạy deadline?! Nhận lấy ly trà nè!! 🤬',
      'Sai công thức rồi lại còn lâu! Tặng chủ quán lên mặt luôn! 💢',
    ],
  },
  {
    id: 'tycoon',
    type: 'Đại gia',
    icon: '💎',
    model: '/models/characters/character-male-d.glb',
    patience: 48,
    baseReward: 270,
    xpReward: 55,
    trait: 'Trả tiền cực kỳ hậu hĩnh (x3 tiền boa kim cương)!',
    greetings: [
      'Tiền không thành vấn đề! Pha cho bổn thiếu gia ly ngon nhất quán!',
      'Nghe đồn quán này đang hot ở Boba Land, làm ngon anh thưởng đậm!',
    ],
    angryQuotes: [
      'Bổn thiếu gia trả bạc triệu mà pha dở ẹc vậy hả?! Ném luôn!! 💸😡',
    ],
  },
  {
    id: 'reviewer',
    type: 'Reviewer',
    icon: '📸',
    model: '/models/characters/character-female-c.glb',
    patience: 45,
    baseReward: 160,
    xpReward: 65,
    strictAccuracy: 85,
    trait: 'Chấm điểm cực khó! Pha chuẩn tăng Sao uy tín quán ⭐',
    greetings: [
      'Xin chào các bạn nha~ Hôm nay mình review thực tế quán này xem có chuẩn vị không!',
      'Máy quay bật sẵn rồi đó, đừng để kênh TikTok 2 triệu follow thất vọng nha!',
    ],
    angryQuotes: [
      'Trời đất ơi thảm họa ẩm thực!! Lên clip bóc phốt + ném ly tại chỗ!! 📹💥',
    ],
  },
  {
    id: 'troll',
    type: 'Khách troll',
    icon: '🤡',
    model: '/models/characters/character-male-c.glb',
    patience: 50,
    baseReward: 185,
    xpReward: 50,
    trait: 'Chuyên đặt đơn hàng siêu dị thử thách thần kinh chủ quán!',
    greetings: [
      'Hehe cho tui ly trà KHÔNG SỮA, KHÔNG ĐÁ nhưng FULL 3 LOẠI TOPPING coi dám làm không!',
      'Đố chủ quán pha chuẩn đơn siêu dị độc nhất vô nhị của tui đó! 😂',
    ],
    angryQuotes: [
      'Hahaha chủ quán bị lừa pha sai bét nhè rồi! Ăn nguyên cốc trà sữa nè!! 🤡💦',
    ],
  },
  {
    id: 'idol',
    type: 'Idol',
    icon: '🌟',
    model: '/models/characters/character-female-d.glb',
    patience: 46,
    baseReward: 220,
    xpReward: 75,
    trait: 'Nếu hài lòng sẽ quảng cáo quán -> Nhân đôi lượng khách & xu!',
    greetings: [
      'Suỵt khẽ thôi nha fan phát hiện bây giờ! Cho mình 1 ly giữ dáng trước giờ lên sân khấu ✨',
      'Nếu trà sữa quán bạn ngon, mình sẽ đăng story tag quán lên trang cá nhân ngay 💖',
    ],
    angryQuotes: [
      'Huhu hỏng hết thanh quản của Idol rồi! Anti quán này luôn!! 😭💢',
    ],
  },
];

// 2C. Xây dựng cửa hàng & Nâng cấp Tycoon
export const SHOP_UPGRADES = [
  {
    id: 'sealer_pro',
    category: 'machine',
    name: 'Máy Dập Nắp Tự Động Pro',
    icon: '⚙️',
    baseCost: 220,
    maxLevel: 3,
    unlockLevel: 1,
    incomePerSec: 2,
    tipBonus: 0.12,
    desc: 'Thay máy dập nắp cũ bằng máy dập nắp cảm biến inox chuẩn quán lớn!',
  },
  {
    id: 'furniture_set',
    category: 'decor',
    name: 'Bàn Ghế Cafe & Thú Cưng Shiba',
    icon: '🪑',
    baseCost: 180,
    maxLevel: 4,
    unlockLevel: 1,
    incomePerSec: 4,
    tipBonus: 0.1,
    desc: 'Thêm bàn tròn gỗ sồi, khách ngồi uống trà & cún cưng Shiba Inu đón khách!',
  },
  {
    id: 'expand_shop',
    category: 'structure',
    name: 'Mở Rộng Quán & Kho Nguyên Liệu',
    icon: '🏗️',
    baseCost: 420,
    maxLevel: 3,
    unlockLevel: 2,
    incomePerSec: 8,
    tipBonus: 0.15,
    desc: 'Mở rộng mặt bằng quán + Tăng sức chứa Kho Nguyên Liệu thêm +10 mỗi loại!',
  },
  {
    id: 'auto_brewer',
    category: 'machine',
    name: 'Máy Chiết Trà Tự Động AI',
    icon: '🤖',
    baseCost: 550,
    maxLevel: 5,
    unlockLevel: 3,
    incomePerSec: 16,
    tipBonus: 0.08,
    desc: 'Hệ thống chiết trà thông minh sinh lời thụ động mỗi giây!',
  },
  {
    id: 'hire_staff',
    category: 'staff',
    name: 'Tuyển Nhân Viên Tạp Dề Chibi',
    icon: '👨‍🍳',
    baseCost: 680,
    maxLevel: 4,
    unlockLevel: 11,
    allowEarlyWithCoins: true,
    incomePerSec: 25,
    tipBonus: 0.15,
    desc: 'Nhân viên mặc tạp dề 3D đứng quầy & bưng bê tự động phục vụ khách phụ (có tốn nguyên liệu kho)!',
  },
  {
    id: 'vip_zone',
    category: 'structure',
    name: 'Mở Khu Vực VIP Hoàng Gia',
    icon: '🛋️',
    baseCost: 1400,
    maxLevel: 2,
    unlockLevel: 31,
    allowEarlyWithCoins: true,
    incomePerSec: 45,
    tipBonus: 0.35,
    desc: 'Sofa sang trọng, đèn chùm & lạc đà Alpaca thu hút Đại Gia và Idol!',
  },
  {
    id: 'rooftop_floor',
    category: 'structure',
    name: 'Xây Cửa Hàng Trên Tầng Cao',
    icon: '🏙️',
    baseCost: 1950,
    maxLevel: 2,
    unlockLevel: 15,
    allowEarlyWithCoins: true,
    incomePerSec: 60,
    tipBonus: 0.3,
    desc: 'Xây dựng tầng thượng Sky Bar ngắm toàn cảnh Boba Land lung linh!',
  },
];

export const FRANCHISE_CITIES = [
  {
    id: 'downtown',
    name: 'Quận Trung Tâm Boba Land',
    icon: '🏙️',
    cost: 1200,
    incomePerSec: 35,
    unlockLevel: 5,
    desc: 'Phố đi bộ sầm uất nhất thành phố, khách xếp hàng dài cả cây số.',
  },
  {
    id: 'sakura_city',
    name: 'Thành Phố Hoa Anh Đào',
    icon: '🌸',
    cost: 2800,
    incomePerSec: 85,
    unlockLevel: 21,
    desc: 'Thiên đường check-in lãng mạn của giới trẻ và các Idol.',
  },
  {
    id: 'cyber_neon',
    name: 'Siêu Đô Thị Cyber Boba',
    icon: '⚡',
    cost: 5500,
    incomePerSec: 175,
    unlockLevel: 25,
    desc: 'Giao trà sữa bằng drone bay xuyên các tòa nhà chọc trời.',
  },
  {
    id: 'pearl_island',
    name: 'Đảo Ngọc Hoàng Gia',
    icon: '🏝️',
    cost: 11000,
    incomePerSec: 360,
    unlockLevel: 35,
    desc: 'Resort nghỉ dưỡng của giới siêu giàu, mỗi ly trà sữa giá ngàn vàng.',
  },
];

// 6 & 7. Vật phẩm trang phục Nhân Vật Chibi 3D (Khuôn mặt dễ thương, tỷ lệ chuẩn!)
export const CHARACTER_OUTFITS = {
  models: [
    { id: 'female_a', name: 'Bà Chủ Dễ Thương', path: '/models/characters/character-female-a.glb', cost: 0 },
    { id: 'male_a', name: 'Ông Chủ Điển Trai', path: '/models/characters/character-male-a.glb', cost: 0 },
    { id: 'employee', name: 'Bếp Trưởng Tạp Dề', path: '/models/market/character-employee.glb', cost: 250 },
    { id: 'female_b', name: 'Nữ Hoàng Trà Đào', path: '/models/characters/character-female-b.glb', cost: 350 },
    { id: 'male_d', name: 'Tổng Tài Boba', path: '/models/characters/character-male-d.glb', cost: 500 },
  ],
  hats: [
    { id: 'none', name: 'Không đội mũ', icon: '✨', cost: 0 },
    { id: 'chef', name: 'Mũ Vua Đầu Bếp', icon: '👨‍🍳', cost: 250 },
    { id: 'boba_crown', name: 'Vương Miện Vua Trà Sữa', icon: '👑', cost: 900 },
    { id: 'alien_antenna', name: 'Ăng-ten Người Ngoài Hành Tinh', icon: '👽', cost: 1200 },
    { id: 'halo', name: 'Vòng Hào Quang Idol', icon: '😇', cost: 750 },
  ],
  pets: [
    { id: 'none', name: 'Chưa có Pet', icon: '🐾', cost: 0 },
    { id: 'mini_boba', name: 'Cún Shiba Inu 3D', icon: '🐕', cost: 400 },
    { id: 'golden_pearl', name: 'Lạc Đà Alpaca Bông', icon: '🦙', cost: 850 },
    { id: 'mini_ufo', name: 'Cáo Đỏ Tinh Nghịch 3D', icon: '🦊', cost: 1500 },
  ],
};

export const CITY_OTHER_SHOPS = [
  {
    id: 'shop_sakura',
    owner: 'BảoNgọc_Boba 🌸',
    shopName: 'Tiệm Trà Hồng Đào Mộng Mơ',
    rating: 4.9,
    specialty: 'Trà Ô Long Kem Cheese',
    drinkPrice: 65,
    position: [-10.5, 0, -9.5],
    buildingModel: '/models/quaternius/city_shop1.glb',
    themeColor: '#f472b6',
  },
  {
    id: 'shop_royal',
    owner: 'HoàngTửTrânChâu 👑',
    shopName: 'Hoàng Gia Boba Palace',
    rating: 4.8,
    specialty: 'Sữa Tươi Trân Châu Hoàng Kim',
    drinkPrice: 90,
    position: [10.5, 0, -9.5],
    buildingModel: '/models/quaternius/city_shop2.glb',
    themeColor: '#facc15',
  },
  {
    id: 'shop_cyber',
    owner: 'MinhTuấn_Pro ⚡',
    shopName: 'Cyber Matcha Lab 3000',
    rating: 4.7,
    specialty: 'Matcha Khoai Môn Lạnh Cực Độ',
    drinkPrice: 75,
    position: [-10.5, 0, 9.5],
    buildingModel: '/models/quaternius/city_shop3.glb',
    themeColor: '#38bdf8',
  },
  {
    id: 'shop_cat',
    owner: 'MèoÚ_NghiệnTrà 🐱',
    shopName: 'Tiệm Trà Sữa Mèo Béo',
    rating: 4.95,
    specialty: 'Hồng Trà 5 Lớp Pudding',
    drinkPrice: 80,
    position: [10.5, 0, 9.5],
    buildingModel: '/models/quaternius/city_shop4.glb',
    themeColor: '#c084fc',
  },
];

export const ONLINE_BOT_PLAYERS = [
  { id: 'p1', name: 'BảoNgọc_Boba', title: 'Đại Gia Boba', model: '/models/characters/character-female-b.glb', coins: 48200, stars: 4.9 },
  { id: 'p2', name: 'HoàngTửTrânChâu', title: 'Vua Trà Sữa', model: '/models/characters/character-male-d.glb', coins: 92500, stars: 5.0 },
  { id: 'p3', name: 'MinhTuấn_Pro', title: 'Ông Trùm', model: '/models/characters/character-male-a.glb', coins: 35900, stars: 4.8 },
  { id: 'p4', name: 'MèoÚ_NghiệnTrà', title: 'Huyền Thoại', model: '/models/characters/character-female-c.glb', coins: 67400, stars: 4.95 },
  { id: 'p5', name: 'ThánhSănTopping', title: 'Chủ Quán', model: '/models/characters/character-male-c.glb', coins: 19400, stars: 4.6 },
  { id: 'p6', name: 'BéDâuTây_2k', title: 'Đại Gia Boba', model: '/models/characters/character-female-d.glb', coins: 29800, stars: 4.7 },
  { id: 'p7', name: 'ChủTịchFullĐá', title: 'Ông Trùm', model: '/models/characters/character-male-b.glb', coins: 44100, stars: 4.8 },
  { id: 'p8', name: 'LinhKa_BobaLand', title: 'Idol Phố Trà', model: '/models/characters/character-female-a.glb', coins: 53600, stars: 4.9 },
];
