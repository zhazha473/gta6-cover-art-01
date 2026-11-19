// cover.js — Duskline Press render engine: layouts, sunset grades, lettering, badge.
// Everything here draws on a 2D canvas, no network, no library.

export const POST_SIZES = {
  '1080x1080': [1080, 1080],
  '1080x1350': [1080, 1350],
  '1920x1080': [1920, 1080],
};

// One panel is a polygon of [x, y] points in 0..1 cover space. A rectangle is
// just a four-point polygon, so diagonal layouts reuse the same drawing path.
function rect(x, y, w, h) {
  return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
}

export const LAYOUTS = [
  {
    id: 'hero-stack',
    name: 'Hero Stack',
    panels: [rect(0, 0, 1, 0.6), rect(0, 0.62, 0.32, 0.38), rect(0.34, 0.62, 0.32, 0.38), rect(0.68, 0.62, 0.32, 0.38)],
    band: 0,
  },
  {
    id: 'grid-four',
    name: 'Grid Four',
    panels: [rect(0, 0, 0.49, 0.49), rect(0.51, 0, 0.49, 0.49), rect(0, 0.51, 0.49, 0.49), rect(0.51, 0.51, 0.49, 0.49)],
    band: 0,
  },
  { id: 'full-bleed', name: 'Full Bleed', panels: [rect(0, 0, 1, 1)], band: 0 },
  {
    id: 'filmstrip',
    name: 'Filmstrip',
    panels: [rect(0, 0.09, 1, 0.19), rect(0, 0.3, 1, 0.19), rect(0, 0.51, 1, 0.19), rect(0, 0.72, 1, 0.19)],
    band: 0,
    sprockets: true,
  },
  {
    id: 'diagonal-slash',
    name: 'Diagonal Slash',
    panels: [
      [[0, 0], [1, 0], [0.38, 1], [0, 1]],
      [[1, 0], [1, 1], [0.38, 1]],
    ],
    band: 0,
  },
  {
    id: 'comic-six',
    name: 'Comic Six',
    panels: [
      rect(0, 0, 1, 0.34),
      rect(0, 0.36, 0.49, 0.3),
      rect(0.51, 0.36, 0.49, 0.3),
      rect(0, 0.68, 0.32, 0.32),
      rect(0.34, 0.68, 0.32, 0.32),
      rect(0.68, 0.68, 0.32, 0.32),
    ],
    band: 0,
  },
  {
    id: 'triptych',
    name: 'Triptych',
    panels: [rect(0, 0, 0.32, 0.84), rect(0.34, 0, 0.32, 0.84), rect(0.68, 0, 0.32, 0.84)],
    band: 0.16,
  },
  {
    id: 'billboard',
    name: 'Billboard',
    panels: [
      rect(0, 0, 1, 0.62),
      rect(0, 0.64, 0.32, 0.2),
      rect(0.34, 0.64, 0.32, 0.2),
      rect(0.68, 0.64, 0.32, 0.2),
    ],
    band: 0.14,
  },
];

export const GRADES = [
  {
    id: 'vice-sunset',
    name: 'Vice Sunset',
    top: '#ff9a3d',
    bottom: '#c2145c',
    tint: '#ff5e3a',
    tintAlpha: 0.16,
    grain: 0.05,
    vignette: 0.42,
  },
  {
    id: 'neon-night',
    name: 'Neon Night',
    top: '#ff2fb3',
    bottom: '#1b2aff',
    tint: '#7a2bff',
    tintAlpha: 0.18,
    grain: 0.06,
    vignette: 0.5,
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    top: '#ffd166',
    bottom: '#e4572e',
    tint: '#ffb703',
    tintAlpha: 0.14,
    grain: 0.04,
    vignette: 0.34,
  },
  {
    id: 'tangerine-heat',
    name: 'Tangerine Heat',
    top: '#ff7b00',
    bottom: '#8c1d18',
    tint: '#ff5400',
    tintAlpha: 0.2,
    grain: 0.06,
    vignette: 0.46,
  },
  {
    id: 'afterglow-dusk',
    name: 'Afterglow Dusk',
    top: '#f72585',
    bottom: '#3a0ca3',
    tint: '#b5179e',
    tintAlpha: 0.17,
    grain: 0.05,
    vignette: 0.48,
  },
  {
    id: 'mono-noir',
    name: 'Mono Noir',
    top: '#e8e8e8',
    bottom: '#111111',
    tint: '#888888',
    tintAlpha: 0.1,
    grain: 0.09,
    vignette: 0.55,
    mono: true,
  },
];

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function tracePath(ctx, pts, W, H) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => {
    const px = x * W;
    const py = y * H;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.closePath();
}

function drawPhotoInto(ctx, img, pts, W, H, pan) {
  const xs = pts.map((p) => p[0] * W);
  const ys = pts.map((p) => p[1] * H);
  const x0 = Math.min(...xs);
  const x1 = Math.max(...xs);
  const y0 = Math.min(...ys);
  const y1 = Math.max(...ys);
  const pw = x1 - x0;
  const ph = y1 - y0;
  if (pw <= 0 || ph <= 0) return;
  ctx.save();
  tracePath(ctx, pts, W, H);
  ctx.clip();
  if (!img) {
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, '#3d2b4f');
    g.addColorStop(1, '#120e1c');
    ctx.fillStyle = g;
    ctx.fillRect(x0, y0, pw, ph);
    ctx.restore();
    return;
  }
  const zoom = pan?.zoom ?? 1;
  const scale = Math.max(pw / img.naturalWidth, ph / img.naturalHeight) * zoom;
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const dx = x0 + (pw - dw) / 2 + (pan?.ox ?? 0) * pw;
  const dy = y0 + (ph - dh) / 2 + (pan?.oy ?? 0) * ph;
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}

function drawSprockets(ctx, W, H) {
  ctx.save();
  ctx.fillStyle = '#0d0a14';
  ctx.fillRect(0, 0, W, H * 0.07);
  ctx.fillRect(0, H * 0.93, W, H * 0.07);
  ctx.fillStyle = '#f5efe4';
  const holeW = W * 0.028;
  const holeH = H * 0.032;
  const gap = W * 0.055;
  for (const y of [H * 0.019, H * 0.949]) {
    for (let x = W * 0.02; x < W * 0.98; x += gap) {
      ctx.fillRect(x, y, holeW, holeH);
    }
  }
  ctx.restore();
}

function drawBadge(ctx, W, H) {
  const r = Math.min(W, H) * 0.085;
  const cx = W - r - Math.min(W, H) * 0.03;
  const cy = r + Math.min(W, H) * 0.03;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.22);
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(12, 8, 20, 0.82)';
  ctx.fill();
  ctx.lineWidth = Math.max(2, r * 0.06);
  ctx.strokeStyle = '#ffd166';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.78, 0, Math.PI * 2);
  ctx.lineWidth = Math.max(1, r * 0.03);
  ctx.strokeStyle = 'rgba(255, 209, 102, 0.8)';
  ctx.stroke();
  const ring = 'DUSKLINE PRESS • EST. 2026 • ';
  ctx.fillStyle = '#ffd166';
  ctx.font = `${Math.max(9, r * 0.16)}px "Archivo Black", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < ring.length; i++) {
    const a = (i / ring.length) * Math.PI * 2 - Math.PI / 2;
    ctx.save();
    ctx.rotate(a);
    ctx.translate(0, -r * 0.89);
    ctx.fillText(ring[i], 0, 0);
    ctx.restore();
  }
  ctx.fillStyle = '#ffffff';
  ctx.font = `${r * 0.42}px "Archivo Black", sans-serif`;
  ctx.fillText('DP', 0, r * 0.02);
  ctx.restore();
}

function drawTitleBlock(ctx, state, W, H, bandH) {
  const title = (state.caption || 'SUNSET DRIVE').toUpperCase();
  const sub = state.subtitle || 'golden hour, your story';
  const bandTop = H - bandH;
  if (bandH > 0) {
    ctx.save();
    ctx.fillStyle = '#0d0a14';
    ctx.fillRect(0, bandTop, W, bandH);
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(0, bandTop, W, Math.max(2, H * 0.004));
    ctx.restore();
  } else {
    const scrim = ctx.createLinearGradient(0, H * 0.62, 0, H);
    scrim.addColorStop(0, 'rgba(10, 6, 18, 0)');
    scrim.addColorStop(1, 'rgba(10, 6, 18, 0.88)');
    ctx.save();
    ctx.fillStyle = scrim;
    ctx.fillRect(0, H * 0.62, W, H * 0.38);
    ctx.restore();
  }
  const padX = W * 0.045;
  const baseY = bandH > 0 ? bandTop + bandH * 0.62 : H * 0.94;
  const titleSize = Math.min(W * 0.085, (bandH > 0 ? bandH * 0.52 : H * 0.085));
  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `${titleSize}px "Archivo Black", sans-serif`;
  const maxW = W - padX * 2;
  let size = titleSize;
  while (size > W * 0.03 && ctx.measureText(title).width > maxW) {
    size *= 0.92;
    ctx.font = `${size}px "Archivo Black", sans-serif`;
  }
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(2, size * 0.09);
  ctx.strokeStyle = 'rgba(10, 6, 18, 0.95)';
  ctx.strokeText(title, padX, baseY);
  const tg = ctx.createLinearGradient(padX, baseY - size, padX, baseY);
  tg.addColorStop(0, '#fff7e6');
  tg.addColorStop(0.55, '#ffd166');
  tg.addColorStop(1, '#ff7b3d');
  ctx.fillStyle = tg;
  ctx.fillText(title, padX, baseY);
  const subSize = Math.max(W * 0.018, size * 0.42);
  ctx.font = `${subSize}px "Yellowtail", cursive`;
  ctx.fillStyle = '#ffe9a8';
  const subY = bandH > 0 ? bandTop + bandH * 0.9 : H * 0.985;
  ctx.fillText(sub, padX, subY);
  ctx.restore();
}

function applyGrade(ctx, grade, W, H, seed) {
  const g = ctx.createLinearGradient(0, 0, W * 0.25, H);
  g.addColorStop(0, grade.top);
  g.addColorStop(1, grade.bottom);
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = grade.tintAlpha;
  ctx.fillStyle = grade.tint;
  ctx.fillRect(0, 0, W, H);
  if (grade.mono) {
    ctx.globalCompositeOperation = 'saturation';
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
  // Vignette.
  const vg = ctx.createRadialGradient(
    W / 2, H / 2, Math.min(W, H) * 0.42,
    W / 2, H / 2, Math.max(W, H) * 0.75,
  );
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, `rgba(8,4,16,${grade.vignette})`);
  ctx.save();
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
  // Grain, seeded so the same state always draws the same specks.
  const rnd = mulberry32(seed);
  const dots = Math.floor((W * H) / 2600);
  ctx.save();
  ctx.globalAlpha = grade.grain;
  for (let i = 0; i < dots; i++) {
    const v = rnd() > 0.5 ? 255 : 0;
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(rnd() * W, rnd() * H, 1.4, 1.4);
  }
  ctx.restore();
}

function applyHalftone(ctx, W, H) {
  ctx.save();
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = '#0d0a14';
  const step = Math.max(7, Math.round(W / 150));
  for (let y = step / 2; y < H; y += step) {
    for (let x = step / 2; x < W; x += step) {
      const r = (step * 0.22 * (0.5 + 0.5 * Math.sin((x + y) / step))) | 0;
      ctx.beginPath();
      ctx.arc(x, y, Math.max(0.6, r), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

export function layoutById(id) {
  return LAYOUTS.find((l) => l.id === id) ?? LAYOUTS[0];
}

export function gradeById(id) {
  return GRADES.find((g) => g.id === id) ?? GRADES[0];
}

// Draw one cover onto ctx at W x H. state: { layout, grade, caption, subtitle,
// halftone, seed, panels: [{ photo, zoom, ox, oy }] }. images: Image|null per
// photo slot. The same function powers the live preview, the PNG export and
// every ?shot= scene, so what you see is what the PNG holds.
export function drawCover(ctx, state, W, H, images) {
  const layout = layoutById(state.layout);
  const grade = gradeById(state.grade);
  const seed = state.seed ?? 7;
  ctx.save();
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#0d0a14';
  ctx.fillRect(0, 0, W, H);
  layout.panels.forEach((pts, i) => {
    const pan = state.panels?.[i];
    const img = pan && pan.photo != null ? images[pan.photo] ?? null : null;
    drawPhotoInto(ctx, img, pts, W, H, pan);
  });
  // Panel gutters: thin dark seams, then a pale poster frame.
  ctx.save();
  ctx.strokeStyle = 'rgba(13, 10, 20, 0.9)';
  ctx.lineWidth = Math.max(2, W * 0.004);
  layout.panels.forEach((pts) => {
    tracePath(ctx, pts, W, H);
    ctx.stroke();
  });
  ctx.strokeStyle = 'rgba(245, 239, 228, 0.92)';
  ctx.lineWidth = Math.max(3, W * 0.006);
  ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, W - ctx.lineWidth, H - ctx.lineWidth);
  ctx.restore();
  if (layout.sprockets) drawSprockets(ctx, W, H);
  applyGrade(ctx, grade, W, H, seed);
  if (state.halftone) applyHalftone(ctx, W, H);
  drawTitleBlock(ctx, state, W, H, layout.band * H);
  drawBadge(ctx, W, H);
  ctx.restore();
}

export function exportCoverPNG(state, W, H, images) {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  drawCover(ctx, state, W, H, images);
  return canvas.toDataURL('image/png');
}

export function blankPanels(count) {
  return Array.from({ length: count }, () => ({ photo: null, zoom: 1, ox: 0, oy: 0 }));
}
