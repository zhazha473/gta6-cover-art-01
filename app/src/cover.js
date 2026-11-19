// Duskline Press — cover renderer: 8 multi-panel layouts, 6 sunset grades,
// per-panel photos with crop + position, bold display lettering + script tagline.
// Draws onto any 2D canvas at its own pixel size. No network, no libraries.

export const SIZES = {
  square: { label: 'Square · 1080 x 1080', w: 1080, h: 1080 },
  portrait: { label: 'Portrait · 1080 x 1350', w: 1080, h: 1350 },
  story: { label: 'Story · 1080 x 1920', w: 1080, h: 1920 },
};

export const GRADES = {
  vice: {
    label: 'Vice Sunset', accent: '#ff5ea8',
    top: [255, 94, 168, 0.10], bottom: [255, 140, 0, 0.38], filter: null,
  },
  neon: {
    label: 'Neon Night', accent: '#00e5ff',
    top: [0, 229, 255, 0.12], bottom: [123, 47, 255, 0.42], filter: null,
  },
  golden: {
    label: 'Golden Hour', accent: '#ffd166',
    top: [255, 209, 102, 0.10], bottom: [255, 123, 0, 0.40], filter: null,
  },
  tangerine: {
    label: 'Tangerine Heat', accent: '#ff6b35',
    top: [255, 107, 53, 0.12], bottom: [193, 18, 31, 0.42], filter: null,
  },
  afterglow: {
    label: 'Afterglow Dusk', accent: '#e07bff',
    top: [181, 23, 158, 0.14], bottom: [58, 12, 163, 0.44], filter: null,
  },
  noir: {
    label: 'Mono Noir', accent: '#e8e8e8',
    top: [255, 255, 255, 0.05], bottom: [0, 0, 0, 0.30], filter: 'grayscale(1) contrast(1.15)',
  },
};

// Panels are unit rects (x, y, w, h in 0..1) or polygons (pts, unit coords).
// title: zone for the big display title; band draws a dark strip behind it.
export const LAYOUTS = {
  hero: {
    label: 'Hero Stack',
    panels: [
      { x: 0, y: 0, w: 1, h: 0.62 },
      { x: 0, y: 0.62, w: 0.5, h: 0.38 },
      { x: 0.5, y: 0.62, w: 0.5, h: 0.38 },
    ],
    title: { x: 0.045, y: 0.40, w: 0.91, h: 0.20, align: 'left', band: false },
  },
  grid: {
    label: 'Grid Four',
    panels: [
      { x: 0, y: 0, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0, w: 0.5, h: 0.5 },
      { x: 0, y: 0.5, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
    ],
    title: { x: 0.05, y: 0.76, w: 0.90, h: 0.20, align: 'center', band: true },
  },
  full: {
    label: 'Full Bleed',
    panels: [{ x: 0, y: 0, w: 1, h: 1 }],
    title: { x: 0.05, y: 0.74, w: 0.90, h: 0.22, align: 'left', band: false },
  },
  filmstrip: {
    label: 'Filmstrip',
    panels: [
      { x: 0, y: 0, w: 0.3334, h: 1 },
      { x: 0.3334, y: 0, w: 0.3333, h: 1 },
      { x: 0.6667, y: 0, w: 0.3333, h: 1 },
    ],
    title: { x: 0.05, y: 0.78, w: 0.90, h: 0.18, align: 'center', band: true },
  },
  diagonal: {
    label: 'Diagonal Slash',
    panels: [
      { pts: [[0, 0], [1, 0], [0, 1]] },
      { pts: [[1, 0], [1, 1], [0, 1]] },
    ],
    title: { x: 0.05, y: 0.72, w: 0.90, h: 0.22, align: 'left', band: false },
  },
  comic: {
    label: 'Comic Six',
    panels: [
      { x: 0, y: 0, w: 0.3334, h: 0.5 },
      { x: 0.3334, y: 0, w: 0.3333, h: 0.5 },
      { x: 0.6667, y: 0, w: 0.3333, h: 0.5 },
      { x: 0, y: 0.5, w: 0.3334, h: 0.5 },
      { x: 0.3334, y: 0.5, w: 0.3333, h: 0.5 },
      { x: 0.6667, y: 0.5, w: 0.3333, h: 0.5 },
    ],
    title: { x: 0.05, y: 0.80, w: 0.90, h: 0.16, align: 'center', band: true },
  },
  triptych: {
    label: 'Triptych',
    panels: [
      { x: 0, y: 0, w: 0.3334, h: 1 },
      { x: 0.3334, y: 0, w: 0.3333, h: 1 },
      { x: 0.6667, y: 0, w: 0.3333, h: 1 },
    ],
    title: { x: 0.05, y: 0.80, w: 0.90, h: 0.16, align: 'center', band: false },
  },
  billboard: {
    label: 'Billboard',
    panels: [
      { x: 0, y: 0.22, w: 1, h: 0.56 },
      { x: 0, y: 0.78, w: 0.5, h: 0.22 },
      { x: 0.5, y: 0.78, w: 0.5, h: 0.22 },
    ],
    title: { x: 0.05, y: 0.015, w: 0.90, h: 0.19, align: 'center', band: false },
  },
};

export const LAYOUT_KEYS = Object.keys(LAYOUTS);
export const GRADE_KEYS = Object.keys(GRADES);
export const SIZE_KEYS = Object.keys(SIZES);

const GAP = 0.008; // white gutter between panels, in unit space

function panelRect(panel, w, h) {
  if (panel.pts) {
    const xs = panel.pts.map((p) => p[0]);
    const ys = panel.pts.map((p) => p[1]);
    return {
      x: Math.min(...xs) * w, y: Math.min(...ys) * h,
      w: (Math.max(...xs) - Math.min(...xs)) * w,
      h: (Math.max(...ys) - Math.min(...ys)) * h,
    };
  }
  return { x: panel.x * w, y: panel.y * h, w: panel.w * w, h: panel.h * h };
}

function clipPanel(ctx, panel, w, h) {
  ctx.beginPath();
  if (panel.pts) {
    panel.pts.forEach(([px, py], i) => {
      if (i === 0) ctx.moveTo(px * w, py * h);
      else ctx.lineTo(px * w, py * h);
    });
    ctx.closePath();
  } else {
    ctx.rect(panel.x * w, panel.y * h, panel.w * w, panel.h * h);
  }
  ctx.clip();
}

function rgba(c) {
  return `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${c[3]})`;
}

/** Draws one photo into a panel rect, cover-fit, with zoom (1 = fit) and pan offsets in -0.4..0.4. */
function drawPhoto(ctx, img, rect, slot) {
  const zoom = slot.zoom || 1;
  const scale = Math.max(rect.w / img.naturalWidth, rect.h / img.naturalHeight) * zoom;
  const pw = img.naturalWidth * scale;
  const ph = img.naturalHeight * scale;
  const dx = rect.x + (rect.w - pw) / 2 + (slot.ox || 0) * rect.w;
  const dy = rect.y + (rect.h - ph) / 2 + (slot.oy || 0) * rect.h;
  ctx.drawImage(img, dx, dy, pw, ph);
}

function fitFont(ctx, text, maxWidth, startSize, family, weight) {
  let size = startSize;
  ctx.font = `${weight} ${size}px ${family}`;
  while (size > 10 && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = `${weight} ${size}px ${family}`;
  }
  return size;
}

/**
 * Draws the whole cover.
 * @param {HTMLCanvasElement} canvas
 * @param {object} state { layout, grade, size, title, tagline, panels: [{src, zoom, ox, oy}] }
 * @param {Map<string, HTMLImageElement|null>} images photo source -> loaded image (null = not loaded)
 */
export function drawCover(canvas, state, images) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const layout = LAYOUTS[state.layout] || LAYOUTS.hero;
  const grade = GRADES[state.grade] || GRADES.vice;
  const gap = Math.max(2, Math.round(w * GAP));

  // Press-room backdrop.
  ctx.fillStyle = '#160a1e';
  ctx.fillRect(0, 0, w, h);

  // Panels.
  layout.panels.forEach((panel, i) => {
    const slot = state.panels[i] || { src: null, zoom: 1, ox: 0, oy: 0 };
    const rect = panelRect(panel, w, h);
    ctx.save();
    clipPanel(ctx, panel, w, h);
    const img = slot.src ? images.get(slot.src) : null;
    if (img) {
      if (grade.filter) ctx.filter = grade.filter;
      drawPhoto(ctx, img, rect, slot);
      ctx.filter = 'none';
    } else {
      // Empty slot: dusk gradient so the layout still reads.
      const g = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
      g.addColorStop(0, '#3a1c4d');
      g.addColorStop(1, '#12081a');
      ctx.fillStyle = g;
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    }
    // Sunset grade wash, top to bottom.
    const wash = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
    wash.addColorStop(0, rgba(grade.top));
    wash.addColorStop(1, rgba(grade.bottom));
    ctx.fillStyle = wash;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.restore();
    // White gutter stroke.
    ctx.strokeStyle = '#fdf8f2';
    ctx.lineWidth = gap;
    ctx.beginPath();
    if (panel.pts) {
      panel.pts.forEach(([px, py], j) => {
        if (j === 0) ctx.moveTo(px * w, py * h);
        else ctx.lineTo(px * w, py * h);
      });
      ctx.closePath();
    } else {
      ctx.rect(rect.x, rect.y, rect.w, rect.h);
    }
    ctx.stroke();
  });

  // Vignette.
  const vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.45, w / 2, h / 2, Math.max(w, h) * 0.75);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(10,4,16,0.45)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);

  // Masthead.
  ctx.save();
  ctx.fillStyle = '#fdf8f2';
  ctx.globalAlpha = 0.92;
  const mastSize = fitFont(ctx, 'DUSKLINE PRESS', w * 0.30, Math.round(h * 0.028), '"Archivo Black", sans-serif', '400');
  ctx.font = `400 ${mastSize}px "Archivo Black", sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('DUSKLINE PRESS', w * 0.045, h * 0.045 + mastSize * 0.5);
  ctx.globalAlpha = 1;
  ctx.restore();

  // Title.
  const tz = layout.title;
  const tx = tz.x * w;
  const ty = tz.y * h;
  const tw = tz.w * w;
  const th = tz.h * h;
  const title = (state.title || '').trim().toUpperCase();
  if (tz.band && title) {
    ctx.fillStyle = 'rgba(12, 5, 18, 0.82)';
    ctx.fillRect(tx - w * 0.02, ty - th * 0.12, tw + w * 0.04, th * 1.28);
  }
  if (title) {
    ctx.save();
    ctx.translate(tx + tw / 2, ty + th / 2);
    ctx.rotate(-0.026);
    ctx.translate(-(tx + tw / 2), -(ty + th / 2));
    const tag = (state.tagline || '').trim();
    const titleY = tag ? ty + th * 0.36 : ty + th / 2;
    const startSize = Math.round(th * (tag ? 0.58 : 0.72));
    const size = fitFont(ctx, title, tw, startSize, '"Archivo Black", sans-serif', '400');
    ctx.font = `400 ${size}px "Archivo Black", sans-serif`;
    ctx.textAlign = tz.align === 'center' ? 'center' : 'left';
    ctx.textBaseline = 'middle';
    const cx = tz.align === 'center' ? tx + tw / 2 : tx;
    ctx.lineWidth = Math.max(2, size * 0.14);
    ctx.strokeStyle = '#12081a';
    ctx.lineJoin = 'round';
    ctx.strokeText(title, cx, titleY);
    ctx.fillStyle = '#fdf8f2';
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = size * 0.18;
    ctx.shadowOffsetY = size * 0.05;
    ctx.fillText(title, cx, titleY);
    ctx.restore();

    // Tagline in script, tucked under the title inside the same zone.
    if (tag) {
      ctx.save();
      const tagSize = fitFont(ctx, tag, tw * 0.8, Math.round(th * 0.34), '"Yellowtail", cursive', '400');
      ctx.font = `400 ${tagSize}px "Yellowtail", cursive`;
      ctx.textAlign = tz.align === 'center' ? 'center' : 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = grade.accent;
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = tagSize * 0.2;
      const tagX = tz.align === 'center' ? tx + tw / 2 : tx;
      ctx.fillText(tag, tagX, ty + th * 0.88);
      ctx.restore();
    }
  }

  // Accent rule under the masthead.
  ctx.fillStyle = grade.accent;
  ctx.fillRect(w * 0.045, h * 0.075, w * 0.12, Math.max(3, h * 0.006));
}
