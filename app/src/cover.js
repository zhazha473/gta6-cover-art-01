// Duskline Press — cover render engine.
// Draws an original multi-panel poster cover on a 2D canvas: panels, a
// sunset/neon colour grade, bold Archivo Black lettering with a Yellowtail
// script subtitle, and a round press stamp. No outside assets are used.

export const LAYOUTS = {
  'hero-stack': {
    label: 'Hero Stack',
    panels: [
      { x: 0, y: 0, w: 1, h: 0.6 },
      { x: 0, y: 0.62, w: 0.49, h: 0.38 },
      { x: 0.51, y: 0.62, w: 0.49, h: 0.38 },
    ],
  },
  'grid-four': {
    label: 'Grid Four',
    panels: [
      { x: 0, y: 0, w: 0.49, h: 0.49 },
      { x: 0.51, y: 0, w: 0.49, h: 0.49 },
      { x: 0, y: 0.51, w: 0.49, h: 0.49 },
      { x: 0.51, y: 0.51, w: 0.49, h: 0.49 },
    ],
  },
  'full-bleed': {
    label: 'Full Bleed',
    panels: [{ x: 0, y: 0, w: 1, h: 1 }],
  },
  filmstrip: {
    label: 'Filmstrip',
    panels: [
      { x: 0.02, y: 0.2, w: 0.225, h: 0.6 },
      { x: 0.265, y: 0.2, w: 0.225, h: 0.6 },
      { x: 0.51, y: 0.2, w: 0.225, h: 0.6 },
      { x: 0.755, y: 0.2, w: 0.225, h: 0.6 },
    ],
    sprockets: true,
  },
  'diagonal-slash': {
    label: 'Diagonal Slash',
    panels: [
      { x: 0, y: 0, w: 0.62, h: 1, poly: [[0, 0], [0.62, 0], [0.38, 1], [0, 1]] },
      { x: 0.38, y: 0, w: 0.62, h: 1, poly: [[0.62, 0], [1, 0], [1, 1], [0.38, 1]] },
    ],
  },
  'comic-six': {
    label: 'Comic Six',
    panels: [
      { x: 0, y: 0, w: 1, h: 0.33 },
      { x: 0, y: 0.35, w: 0.49, h: 0.31 },
      { x: 0.51, y: 0.35, w: 0.49, h: 0.31 },
      { x: 0, y: 0.68, w: 0.49, h: 0.32 },
      { x: 0.51, y: 0.68, w: 0.49, h: 0.32 },
    ],
  },
  triptych: {
    label: 'Triptych',
    panels: [
      { x: 0, y: 0, w: 0.32, h: 1 },
      { x: 0.34, y: 0, w: 0.32, h: 1 },
      { x: 0.68, y: 0, w: 0.32, h: 1 },
    ],
    ribbon: true,
  },
  billboard: {
    label: 'Billboard',
    panels: [
      { x: 0, y: 0, w: 0.68, h: 0.78 },
      { x: 0.7, y: 0, w: 0.3, h: 0.25 },
      { x: 0.7, y: 0.265, w: 0.3, h: 0.25 },
      { x: 0.7, y: 0.53, w: 0.3, h: 0.25 },
    ],
    captionBand: true,
  },
};

export const LAYOUT_IDS = Object.keys(LAYOUTS);

export const GRADES = {
  'vice-sunset': {
    label: 'Vice Sunset',
    sky: ['#2b1055', '#ff7e3d', '#ffc46b'],
    tint: '#ff5e62', tintAlpha: 0.16, blend: 'overlay',
    warm: 0.1, grain: 0.05, halftone: false,
  },
  'neon-night': {
    label: 'Neon Night',
    sky: ['#0b0620', '#3b0f66', '#ff2e88'],
    tint: '#22d3ee', tintAlpha: 0.18, blend: 'screen',
    warm: 0, grain: 0.06, halftone: true,
  },
  'golden-hour': {
    label: 'Golden Hour',
    sky: ['#3d1c02', '#e07b39', '#ffd98a'],
    tint: '#ffb347', tintAlpha: 0.2, blend: 'soft-light',
    warm: 0.22, grain: 0.04, halftone: false,
  },
  'tangerine-heat': {
    label: 'Tangerine Heat',
    sky: ['#4a0e0e', '#ff4e00', '#ff9a3d'],
    tint: '#ff3d00', tintAlpha: 0.2, blend: 'overlay',
    warm: 0.16, grain: 0.05, halftone: false,
  },
  'afterglow-dusk': {
    label: 'Afterglow Dusk',
    sky: ['#1a1033', '#7b2f8b', '#ff8fa3'],
    tint: '#b06ab3', tintAlpha: 0.18, blend: 'overlay',
    warm: 0.05, grain: 0.06, halftone: true,
  },
  'mono-noir': {
    label: 'Mono Noir',
    sky: ['#0a0a0a', '#3a3a3a', '#cfcfcf'],
    tint: '#ffffff', tintAlpha: 0.08, blend: 'overlay',
    warm: 0, grain: 0.09, halftone: true, mono: true,
  },
};

export const GRADE_IDS = Object.keys(GRADES);

export const SIZES = {
  '1080x1080': { label: 'Square 1080 x 1080', w: 1080, h: 1080 },
  '1080x1350': { label: 'Portrait 1080 x 1350', w: 1080, h: 1350 },
  '1920x1080': { label: 'Landscape 1920 x 1080', w: 1920, h: 1080 },
};

export const SIZE_IDS = Object.keys(SIZES);

function mulberry32(seed) {
  let a = seed >>> 0;
  return function nextRandom() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let grainTile = null;
function grainPattern(ctx) {
  if (grainTile) return grainTile;
  const tile = document.createElement('canvas');
  tile.width = 128; tile.height = 128;
  const tctx = tile.getContext('2d');
  const img = tctx.createImageData(128, 128);
  const rand = mulberry32(20261119);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.floor(rand() * 255);
    img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v; img.data[i + 3] = 255;
  }
  tctx.putImageData(img, 0, 0);
  grainTile = ctx.createPattern(tile, 'repeat');
  return grainTile;
}

function panelRect(panel, W, H) {
  return { x: panel.x * W, y: panel.y * H, w: panel.w * W, h: panel.h * H };
}

function clipPanel(ctx, panel, W, H) {
  ctx.beginPath();
  if (panel.poly) {
    panel.poly.forEach(([px, py], i) => {
      if (i === 0) ctx.moveTo(px * W, py * H);
      else ctx.lineTo(px * W, py * H);
    });
    ctx.closePath();
  } else {
    const r = panelRect(panel, W, H);
    ctx.rect(r.x, r.y, r.w, r.h);
  }
  ctx.clip();
}

function drawImageCover(ctx, img, rect, pan) {
  const zoom = Math.max(0.5, Math.min(4, pan.zoom || 1));
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const scale = Math.max(rect.w / iw, rect.h / ih) * zoom;
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = rect.x + (rect.w - dw) / 2 + (pan.ox || 0) * rect.w * 0.25;
  const dy = rect.y + (rect.h - dh) / 2 + (pan.oy || 0) * rect.h * 0.25;
  ctx.drawImage(img, dx, dy, dw, dh);
}

function drawPlaceholder(ctx, rect, index) {
  const g = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
  g.addColorStop(0, '#3b2350');
  g.addColorStop(1, '#12081f');
  ctx.fillStyle = g;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = `700 ${Math.max(14, rect.w * 0.045)}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`PANEL ${index + 1} — ADD A PHOTO`, rect.x + rect.w / 2, rect.y + rect.h / 2);
}

function drawSprockets(ctx, W, H, grade) {
  ctx.fillStyle = 'rgba(10,6,18,0.92)';
  ctx.fillRect(0, 0, W, H * 0.14);
  ctx.fillRect(0, H * 0.86, W, H * 0.14);
  ctx.fillStyle = '#f5efe4';
  const holeW = W * 0.045;
  const holeH = H * 0.055;
  for (let i = 0; i < 12; i++) {
    const x = W * 0.03 + i * (W * 0.08);
    ctx.fillRect(x, H * 0.045, holeW, holeH);
    ctx.fillRect(x, H * 0.905, holeW, holeH);
  }
  ctx.fillStyle = '#ffd166';
  ctx.font = `700 ${Math.round(H * 0.028)}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('D U S K L I N E   F I L M S T R I P', W / 2, H * 0.115);
}

function drawRibbon(ctx, W, H) {
  const y = H * 0.44;
  ctx.save();
  ctx.fillStyle = 'rgba(12,6,24,0.88)';
  ctx.fillRect(0, y, W, H * 0.12);
  ctx.strokeStyle = '#ffd166';
  ctx.lineWidth = Math.max(2, W * 0.003);
  ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.moveTo(0, y + H * 0.12); ctx.lineTo(W, y + H * 0.12); ctx.stroke();
  const label = 'VICE NIGHTS';
  let size = H * 0.055;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const fitLabel = (s) => {
    ctx.font = `${s}px "Archivo Black", system-ui, sans-serif`;
    return ctx.measureText(label).width;
  };
  while (fitLabel(size) > W * 0.86 && size > 12) size *= 0.92;
  ctx.fillStyle = '#ffd166';
  ctx.fillText(label, W / 2, y + H * 0.06);
  ctx.restore();
}

function drawBadge(ctx, W, H) {
  const r = Math.min(W, H) * 0.085;
  const cx = W - r - W * 0.03;
  const cy = r + H * 0.03;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.22);
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(12,6,24,0.72)';
  ctx.fill();
  ctx.lineWidth = Math.max(2, r * 0.07);
  ctx.strokeStyle = '#ffd166';
  ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, r * 0.78, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,209,102,0.8)';
  ctx.lineWidth = Math.max(1, r * 0.03);
  ctx.stroke();
  ctx.fillStyle = '#ffd166';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${Math.round(r * 0.34)}px "Archivo Black", system-ui, sans-serif`;
  ctx.fillText('DUSKLINE', 0, -r * 0.22);
  ctx.fillText('PRESS', 0, r * 0.16);
  ctx.font = `${Math.round(r * 0.2)}px system-ui, sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.fillText('EST. 2026', 0, r * 0.52);
  ctx.restore();
}

function drawTitleBlock(ctx, W, H, title, subtitle, grade) {
  const bandH = H * 0.2;
  const y0 = H - bandH;
  const g = ctx.createLinearGradient(0, y0 - H * 0.06, 0, H);
  g.addColorStop(0, 'rgba(10,5,20,0)');
  g.addColorStop(0.35, 'rgba(10,5,20,0.82)');
  g.addColorStop(1, 'rgba(10,5,20,0.94)');
  ctx.fillStyle = g;
  ctx.fillRect(0, y0 - H * 0.06, W, bandH + H * 0.06);

  const text = (title || 'DUSKLINE').toUpperCase();
  let size = W * 0.11;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  const fitTitle = (s) => {
    ctx.font = `${s}px "Archivo Black", system-ui, sans-serif`;
    return ctx.measureText(text).width;
  };
  while (fitTitle(size) > W * 0.92 && size > 12) size *= 0.92;
  const tx = W * 0.04;
  const ty = H - H * 0.075;
  const tg = ctx.createLinearGradient(tx, ty - size, tx, ty);
  tg.addColorStop(0, '#ffffff');
  tg.addColorStop(0.55, '#ffe9a8');
  tg.addColorStop(1, '#ff7e3d');
  ctx.lineWidth = Math.max(2, size * 0.09);
  ctx.strokeStyle = '#160a2e';
  ctx.lineJoin = 'round';
  ctx.strokeText(text, tx, ty);
  ctx.fillStyle = tg;
  ctx.fillText(text, tx, ty);

  if (subtitle) {
    const subSize = Math.max(16, W * 0.038);
    ctx.font = `${subSize}px "Yellowtail", cursive`;
    ctx.fillStyle = '#ff5e8a';
    ctx.shadowColor = '#ff2e88';
    ctx.shadowBlur = Math.max(6, W * 0.012);
    ctx.fillText(subtitle, tx + W * 0.01, ty - size * 1.02);
    ctx.shadowBlur = 0;
  }
  if (grade.halftone) {
    ctx.fillStyle = 'rgba(255,255,255,0.16)';
    const step = Math.max(7, W * 0.012);
    for (let y = y0 + step; y < H - step * 0.5; y += step) {
      for (let x = W * 0.9; x < W - step * 0.4; x += step) {
        ctx.beginPath(); ctx.arc(x, y, step * 0.16, 0, Math.PI * 2); ctx.fill();
      }
    }
  }
}

function applyGrade(ctx, W, H, grade) {
  if (grade.mono) {
    ctx.save();
    ctx.globalCompositeOperation = 'saturation';
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
  ctx.save();
  ctx.globalCompositeOperation = grade.blend;
  ctx.globalAlpha = grade.tintAlpha + 0.25;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, grade.tint);
  g.addColorStop(1, '#1a0b2e');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
  if (grade.warm) {
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = grade.warm;
    ctx.fillStyle = '#ff9a3d';
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
  const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(8,3,16,0.55)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
  if (grade.grain) {
    ctx.save();
    ctx.globalAlpha = grade.grain;
    ctx.fillStyle = grainPattern(ctx);
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
}

// Draw the cover for the given state onto ctx's canvas (sized W x H).
// state: { layout, grade, title, subtitle, images, panels }
// panels: [{ photo, ox, oy, zoom }] aligned with the layout's panels.
export function drawCover(canvas, W, H, state) {
  const ctx = canvas.getContext('2d');
  canvas.width = W; canvas.height = H;
  const layout = LAYOUTS[state.layout] || LAYOUTS['hero-stack'];
  const grade = GRADES[state.grade] || GRADES['vice-sunset'];
  const sky = ctx.createLinearGradient(0, 0, W, H);
  sky.addColorStop(0, grade.sky[0]);
  sky.addColorStop(0.55, grade.sky[1]);
  sky.addColorStop(1, grade.sky[2]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  layout.panels.forEach((panel, i) => {
    const rect = panelRect(panel, W, H);
    const pan = (state.panels && state.panels[i]) || { photo: 0, ox: 0, oy: 0, zoom: 1 };
    const img = state.images && state.images[pan.photo];
    ctx.save();
    clipPanel(ctx, panel, W, H);
    if (img && img.complete && img.naturalWidth > 0) drawImageCover(ctx, img, rect, pan);
    else drawPlaceholder(ctx, rect, i);
    ctx.restore();
    ctx.save();
    clipPanel(ctx, panel, W, H);
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = Math.max(2, W * 0.004);
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    ctx.restore();
  });

  if (layout.sprockets) drawSprockets(ctx, W, H, grade);
  if (layout.ribbon) drawRibbon(ctx, W, H);
  if (layout.captionBand) {
    ctx.fillStyle = 'rgba(12,6,24,0.9)';
    ctx.fillRect(0, H * 0.8, W, H * 0.2);
  }
  applyGrade(ctx, W, H, grade);
  drawTitleBlock(ctx, W, H, state.title, state.subtitle, grade);
  drawBadge(ctx, W, H);
  return canvas;
}

export function exportCoverPNG(state, sizeId) {
  const size = SIZES[sizeId] || SIZES['1080x1080'];
  const canvas = document.createElement('canvas');
  drawCover(canvas, size.w, size.h, state);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve({ blob, canvas }), 'image/png');
  });
}

export function hitPanel(layoutId, x, y, W, H) {
  const layout = LAYOUTS[layoutId] || LAYOUTS['hero-stack'];
  for (let i = layout.panels.length - 1; i >= 0; i--) {
    const r = panelRect(layout.panels[i], W, H);
    if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return i;
  }
  return -1;
}
