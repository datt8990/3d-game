import * as THREE from 'three';

export const SHOP_THEMES = {
  sakura: {
    id: 'sakura',
    name: 'Sakura Hồng Phấn',
    icon: '🌸',
    cost: 0,
    desc: 'Quán trà sữa Nhật Bản ngập tràn sắc hoa anh đào dịu ngọt & gỗ sồi sáng.',
    sky: '#ffdce8',
    fog: '#fff0f6',
    ambient: '#fff5f8',
    hemiSky: '#ffeef6',
    hemiGround: '#c89f82',
    sunColor: '#fff4df',
    sunIntensity: 1.18,
    accentHex: '#ff8fab',
    carpetColor: '#ffe5ec',
    wallTop: '#ffeef4',
    wallStripe: '#ffdce9',
    wainscot: '#fff8fa',
    floorMode: 'wood',
    woodBase: '#dfb895',
    woodGrain: '#c89b74',
    woodSeam: '#b2825b',
    previewGradient: 'from-pink-300 via-rose-200 to-amber-100',
  },
  matcha: {
    id: 'matcha',
    name: 'Matcha Gỗ Nhật',
    icon: '🍵',
    cost: 0,
    desc: 'Phong cách Kyoto tối giản với gỗ Hinoki ấm áp & tường xanh trà thanh mát.',
    sky: '#d9f2e6',
    fog: '#eefaf4',
    ambient: '#f7fff9',
    hemiSky: '#e8faef',
    hemiGround: '#b79b78',
    sunColor: '#fff7e6',
    sunIntensity: 1.15,
    accentHex: '#6bbf8a',
    carpetColor: '#e8f5e9',
    wallTop: '#edf7ee',
    wallStripe: '#dceee0',
    wainscot: '#f5efe6',
    floorMode: 'wood',
    woodBase: '#d6b68c',
    woodGrain: '#be9a6d',
    woodSeam: '#a57f52',
    previewGradient: 'from-emerald-300 via-teal-100 to-amber-100',
  },
  paris: {
    id: 'paris',
    name: 'Tiệm Bánh Dâu Paris',
    icon: '🍓',
    cost: 350,
    desc: 'Sàn gạch caro kem-hồng kiểu Pháp, tường kẻ sọc pastel sang chảnh chuẩn nàng thơ.',
    sky: '#dbeafe',
    fog: '#f1f5f9',
    ambient: '#fff9f5',
    hemiSky: '#eff6ff',
    hemiGround: '#d4a373',
    sunColor: '#fff6e8',
    sunIntensity: 1.22,
    accentHex: '#fb7185',
    carpetColor: '#fff1f2',
    wallTop: '#fff7ed',
    wallStripe: '#fde4e8',
    wainscot: '#ffffff',
    floorMode: 'checkered',
    tileA: '#fff8f2',
    tileB: '#f7d6e0',
    tileGrout: '#e9c4cf',
    previewGradient: 'from-rose-300 via-amber-100 to-sky-200',
  },
  seoul: {
    id: 'seoul',
    name: 'Neon Đêm Seoul',
    icon: '🌙',
    cost: 650,
    desc: 'Quán trà sữa đêm lung linh ánh đèn dây vàng ấm & sắc tím mộng mơ cực chill.',
    sky: '#31214f',
    fog: '#432c68',
    ambient: '#e9d5ff',
    hemiSky: '#c084fc',
    hemiGround: '#6b4464',
    sunColor: '#ffdcb8',
    sunIntensity: 0.92,
    accentHex: '#e879f9',
    carpetColor: '#3b2459',
    wallTop: '#3e295e',
    wallStripe: '#4b3270',
    wainscot: '#2d1c47',
    floorMode: 'wood',
    woodBase: '#8c624a',
    woodGrain: '#724d38',
    woodSeam: '#5a3a29',
    previewGradient: 'from-purple-600 via-fuchsia-500 to-amber-300',
  },
};

export const SHOP_THEME_LIST = Object.values(SHOP_THEMES);

const texCache = new Map();

function makeCanvas(w = 512, h = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  return canvas;
}

export function getFloorTexture(themeId = 'sakura') {
  const key = `floor_${themeId}`;
  if (texCache.has(key)) return texCache.get(key);
  if (typeof document === 'undefined') return null;

  const theme = SHOP_THEMES[themeId] || SHOP_THEMES.sakura;
  const canvas = makeCanvas(512, 512);
  const ctx = canvas.getContext('2d');

  if (theme.floorMode === 'checkered') {
    const cells = 8;
    const size = 512 / cells;
    for (let y = 0; y < cells; y++) {
      for (let x = 0; x < cells; x++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? theme.tileA : theme.tileB;
        ctx.fillRect(x * size, y * size, size, size);
        // Subtle marble veining
        ctx.strokeStyle = 'rgba(255,255,255,0.28)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x * size + 8, y * size + size * 0.35);
        ctx.bezierCurveTo(
          x * size + size * 0.4,
          y * size + size * 0.2,
          x * size + size * 0.6,
          y * size + size * 0.7,
          x * size + size - 8,
          y * size + size * 0.55
        );
        ctx.stroke();
      }
    }
    ctx.strokeStyle = theme.tileGrout;
    ctx.lineWidth = 2;
    for (let i = 0; i <= cells; i++) {
      ctx.beginPath();
      ctx.moveTo(i * size, 0);
      ctx.lineTo(i * size, 512);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * size);
      ctx.lineTo(512, i * size);
      ctx.stroke();
    }
  } else {
    // Cozy Café Wood Planks
    ctx.fillStyle = theme.woodBase;
    ctx.fillRect(0, 0, 512, 512);
    const plankH = 64;
    for (let row = 0; row < 8; row++) {
      const y = row * plankH;
      const toneShift = (row % 3 - 1) * 7;
      ctx.fillStyle = theme.woodBase;
      ctx.fillRect(0, y, 512, plankH);
      ctx.fillStyle = toneShift > 0 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.045)';
      ctx.fillRect(0, y, 512, plankH);

      // Soft wood grain lines
      ctx.strokeStyle = theme.woodGrain;
      ctx.globalAlpha = 0.24;
      ctx.lineWidth = 1.6;
      for (let g = 0; g < 6; g++) {
        const gy = y + 8 + g * 9;
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.bezierCurveTo(170, gy + (g % 2 ? 3 : -3), 340, gy - (g % 2 ? 2 : -2), 512, gy);
        ctx.stroke();
      }
      ctx.globalAlpha = 1.0;

      // Plank seams
      ctx.strokeStyle = theme.woodSeam;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();

      const jointX = ((row * 193) % 380) + 60;
      ctx.beginPath();
      ctx.moveTo(jointX, y);
      ctx.lineTo(jointX, y + plankH);
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  tex.anisotropy = 8;
  texCache.set(key, tex);
  return tex;
}

export function getWallTexture(themeId = 'sakura') {
  const key = `wall_${themeId}`;
  if (texCache.has(key)) return texCache.get(key);
  if (typeof document === 'undefined') return null;

  const theme = SHOP_THEMES[themeId] || SHOP_THEMES.sakura;
  const canvas = makeCanvas(512, 512);
  const ctx = canvas.getContext('2d');

  // Top striped boutique wallpaper
  ctx.fillStyle = theme.wallTop;
  ctx.fillRect(0, 0, 512, 340);

  ctx.fillStyle = theme.wallStripe;
  for (let x = 0; x < 512; x += 48) {
    ctx.fillRect(x, 0, 22, 340);
  }

  // Subtle cute floral/sparkle dots on stripes
  ctx.fillStyle = 'rgba(255,255,255,0.42)';
  for (let x = 11; x < 512; x += 48) {
    for (let y = 32; y < 320; y += 56) {
      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Wainscoting chair rail
  ctx.fillStyle = theme.wainscot;
  ctx.fillRect(0, 340, 512, 172);
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  ctx.fillRect(0, 336, 512, 8);
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillRect(0, 344, 512, 5);

  // Decorative recessed wainscot panels
  ctx.strokeStyle = 'rgba(130, 80, 100, 0.16)';
  ctx.lineWidth = 3;
  for (let p = 0; p < 4; p++) {
    ctx.strokeRect(18 + p * 124, 368, 92, 118);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.repeat.set(3, 1);
  tex.anisotropy = 8;
  texCache.set(key, tex);
  return tex;
}

export function getBobaCupStickerTexture() {
  const key = 'cup_sticker';
  if (texCache.has(key)) return texCache.get(key);
  if (typeof document === 'undefined') return null;

  const canvas = makeCanvas(256, 256);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 256, 256);

  // Outer pastel pink scalloped badge
  ctx.fillStyle = '#fff1f5';
  ctx.beginPath();
  ctx.arc(128, 128, 112, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineWidth = 10;
  ctx.strokeStyle = '#ff8fab';
  ctx.stroke();

  // Cute Bear Ears
  ctx.fillStyle = '#f8c39b';
  ctx.beginPath();
  ctx.arc(76, 82, 24, 0, Math.PI * 2);
  ctx.arc(180, 82, 24, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fda4af';
  ctx.beginPath();
  ctx.arc(76, 82, 12, 0, Math.PI * 2);
  ctx.arc(180, 82, 12, 0, Math.PI * 2);
  ctx.fill();

  // Kawaii Bear Face
  ctx.fillStyle = '#f8c39b';
  ctx.beginPath();
  ctx.ellipse(128, 126, 62, 52, 0, 0, Math.PI * 2);
  ctx.fill();

  // Glossy Eyes
  ctx.fillStyle = '#3b1d2a';
  ctx.beginPath();
  ctx.arc(104, 120, 9, 0, Math.PI * 2);
  ctx.arc(152, 120, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(101, 117, 3.2, 0, Math.PI * 2);
  ctx.arc(149, 117, 3.2, 0, Math.PI * 2);
  ctx.fill();

  // Rosy Cheeks
  ctx.fillStyle = 'rgba(251, 113, 133, 0.55)';
  ctx.beginPath();
  ctx.ellipse(84, 134, 13, 8, 0, 0, Math.PI * 2);
  ctx.ellipse(172, 134, 13, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cute Snout + Smile
  ctx.fillStyle = '#fff5eb';
  ctx.beginPath();
  ctx.ellipse(128, 136, 18, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#591d3b';
  ctx.beginPath();
  ctx.arc(128, 131, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#591d3b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(122, 138, 6, 0.1, Math.PI - 0.1);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(134, 138, 6, 0.1, Math.PI - 0.1);
  ctx.stroke();

  // Text "BOBA LAND"
  ctx.fillStyle = '#e11d48';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('BOBA LAND', 128, 206);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  texCache.set(key, tex);
  return tex;
}

export function getTigerStripeTexture() {
  const key = 'tiger_stripes';
  if (texCache.has(key)) return texCache.get(key);
  if (typeof document === 'undefined') return null;

  const canvas = makeCanvas(512, 256);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 512, 256);

  // Caramelized Brown Sugar Drips along inner wall of cup
  const grad = ctx.createLinearGradient(0, 40, 0, 256);
  grad.addColorStop(0, 'rgba(92, 42, 14, 0.0)');
  grad.addColorStop(0.25, 'rgba(92, 42, 14, 0.65)');
  grad.addColorStop(1, 'rgba(58, 24, 8, 0.85)');
  ctx.fillStyle = grad;

  for (let i = 0; i < 12; i++) {
    const x = i * 44 + 8;
    const h = 95 + ((i * 37) % 90);
    const w = 16 + ((i * 19) % 14);
    ctx.beginPath();
    ctx.moveTo(x, 256);
    ctx.quadraticCurveTo(x - 6, 256 - h * 0.55, x + w * 0.45, 256 - h);
    ctx.quadraticCurveTo(x + w + 4, 256 - h * 0.5, x + w, 256);
    ctx.closePath();
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  texCache.set(key, tex);
  return tex;
}
