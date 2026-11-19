// main.js — Duskline Press editor: state, panels, pan/zoom, undo/redo,
// export, and the deterministic ?shot= scenes used for the screenshots.
import {
  LAYOUTS,
  GRADES,
  POST_SIZES,
  layoutById,
  gradeById,
  drawCover,
  exportCoverPNG,
  blankPanels,
} from './cover.js';

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const shot = params.get('shot') || '';

const canvas = $('preview');
const ctx = canvas.getContext('2d');

const state = {
  layout: 'hero-stack',
  grade: 'vice-sunset',
  size: '1080x1080',
  caption: 'SUNSET DRIVE',
  subtitle: 'golden hour, your story',
  halftone: false,
  seed: 7,
  panels: blankPanels(8),
  selected: 0,
};

let photos = []; // { name, dataUrl }
let images = []; // Image|null per photo slot, parallel to photos
let history = [];
let historyIndex = -1;

function snapshot() {
  return JSON.stringify({
    layout: state.layout,
    grade: state.grade,
    size: state.size,
    caption: state.caption,
    subtitle: state.subtitle,
    halftone: state.halftone,
    seed: state.seed,
    panels: state.panels,
    selected: state.selected,
  });
}

function pushHistory() {
  history = history.slice(0, historyIndex + 1);
  history.push(snapshot());
  historyIndex = history.length - 1;
  syncUndoButtons();
}

function restoreHistory(text) {
  const s = JSON.parse(text);
  Object.assign(state, s);
  syncControls();
  draw();
}

function syncUndoButtons() {
  $('undoBtn').disabled = historyIndex <= 0;
  $('redoBtn').disabled = historyIndex >= history.length - 1;
}

function currentLayout() {
  return layoutById(state.layout);
}

function currentSize() {
  return POST_SIZES[state.size];
}

function fitCanvas() {
  const [w, h] = currentSize();
  const scale = 1080 / Math.max(w, h);
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
}

function draw() {
  if (shot.startsWith('cover-')) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  } else {
    fitCanvas();
  }
  drawCover(ctx, state, canvas.width, canvas.height, images);
}

function pointInPolygon(px, py, pts, W, H) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i][0] * W;
    const yi = pts[i][1] * H;
    const xj = pts[j][0] * W;
    const yj = pts[j][1] * H;
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function pickPanel(clientX, clientY) {
  const r = canvas.getBoundingClientRect();
  const x = clientX - r.left;
  const y = clientY - r.top;
  const sx = canvas.width / r.width;
  const sy = canvas.height / r.height;
  const px = x * sx;
  const py = y * sy;
  const panels = currentLayout().panels;
  for (let i = panels.length - 1; i >= 0; i--) {
    if (pointInPolygon(px, py, panels[i], canvas.width, canvas.height)) return i;
  }
  return -1;
}

function selectPanel(i) {
  state.selected = i;
  syncControls();
  draw();
}

function loadImage(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
}

async function addPhotos(files) {
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;
    const dataUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
    const img = await loadImage(dataUrl);
    if (!img) continue;
    const slot = photos.length;
    photos.push({ name: file.name, dataUrl });
    images.push(img);
    const panel = state.panels[state.selected];
    if (panel.photo == null) panel.photo = slot;
    else if (state.panels.every((p) => p.photo != null)) panel.photo = slot;
  }
  pushHistory();
  syncControls();
  draw();
}

async function loadSample(name) {
  const res = await fetch(`samples/${name}`);
  const blob = await res.blob();
  const dataUrl = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
  const img = await loadImage(dataUrl);
  const slot = photos.length;
  photos.push({ name, dataUrl });
  images.push(img);
  return slot;
}

function download(dataUrl, filename) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

function exportOne(sizeName) {
  const [w, h] = POST_SIZES[sizeName];
  const url = exportCoverPNG(state, w, h, images);
  download(url, `duskline-press-${sizeName}.png`);
  return url;
}

function syncControls() {
  document.querySelectorAll('#layoutChoices button').forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.id === state.layout));
  });
  document.querySelectorAll('#gradeChoices button').forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.id === state.grade));
  });
  document.querySelectorAll('#sizeChoices button').forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.id === state.size));
  });
  $('captionInput').value = state.caption;
  $('subtitleInput').value = state.subtitle;
  $('halftoneInput').checked = state.halftone;
  const panel = state.panels[state.selected];
  $('zoomInput').value = String(panel?.zoom ?? 1);
  const strip = $('panelStrip');
  strip.innerHTML = '';
  currentLayout().panels.forEach((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = `Panel ${i + 1}${state.panels[i].photo != null ? ' ✓' : ''}`;
    b.setAttribute('aria-pressed', String(i === state.selected));
    b.addEventListener('click', () => selectPanel(i));
    strip.appendChild(b);
  });
  const clear = document.createElement('button');
  clear.type = 'button';
  clear.textContent = 'Clear panel photo';
  clear.addEventListener('click', () => {
    state.panels[state.selected].photo = null;
    pushHistory();
    syncControls();
    draw();
  });
  strip.appendChild(clear);
}

function buildChoices() {
  const layoutBox = $('layoutChoices');
  LAYOUTS.forEach((l) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = l.name;
    b.dataset.id = l.id;
    b.addEventListener('click', () => {
      state.layout = l.id;
      state.selected = 0;
      pushHistory();
      syncControls();
      draw();
    });
    layoutBox.appendChild(b);
  });
  const gradeBox = $('gradeChoices');
  GRADES.forEach((g) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = g.name;
    b.dataset.id = g.id;
    b.addEventListener('click', () => {
      state.grade = g.id;
      pushHistory();
      syncControls();
      draw();
    });
    gradeBox.appendChild(b);
  });
  const sizeBox = $('sizeChoices');
  Object.keys(POST_SIZES).forEach((s) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = s;
    b.dataset.id = s;
    b.addEventListener('click', () => {
      state.size = s;
      pushHistory();
      syncControls();
      draw();
    });
    sizeBox.appendChild(b);
  });
}

function wireEditor() {
  $('photoInput').addEventListener('change', (e) => {
    addPhotos([...e.target.files]);
    e.target.value = '';
  });
  document.addEventListener('dragover', (e) => e.preventDefault());
  document.addEventListener('drop', (e) => {
    e.preventDefault();
    if (e.dataTransfer?.files?.length) addPhotos([...e.dataTransfer.files]);
  });
  $('captionInput').addEventListener('input', (e) => {
    state.caption = e.target.value;
    draw();
  });
  $('captionInput').addEventListener('change', () => pushHistory());
  $('subtitleInput').addEventListener('input', (e) => {
    state.subtitle = e.target.value;
    draw();
  });
  $('subtitleInput').addEventListener('change', () => pushHistory());
  $('halftoneInput').addEventListener('change', (e) => {
    state.halftone = e.target.checked;
    pushHistory();
    draw();
  });
  $('zoomInput').addEventListener('input', (e) => {
    state.panels[state.selected].zoom = Number(e.target.value);
    draw();
  });
  $('zoomInput').addEventListener('change', () => pushHistory());
  $('undoBtn').addEventListener('click', () => {
    if (historyIndex > 0) {
      historyIndex -= 1;
      restoreHistory(history[historyIndex]);
      syncUndoButtons();
    }
  });
  $('redoBtn').addEventListener('click', () => {
    if (historyIndex < history.length - 1) {
      historyIndex += 1;
      restoreHistory(history[historyIndex]);
      syncUndoButtons();
    }
  });
  $('shuffleBtn').addEventListener('click', () => {
    state.layout = LAYOUTS[Math.floor(Math.random() * LAYOUTS.length)].id;
    state.grade = GRADES[Math.floor(Math.random() * GRADES.length)].id;
    state.selected = 0;
    pushHistory();
    syncControls();
    draw();
  });
  $('exportBtn').addEventListener('click', () => exportOne(state.size));
  $('exportAllBtn').addEventListener('click', () => {
    Object.keys(POST_SIZES).forEach((s) => exportOne(s));
  });
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  canvas.addEventListener('pointerdown', (e) => {
    const i = pickPanel(e.clientX, e.clientY);
    if (i >= 0) {
      selectPanel(i);
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    }
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const r = canvas.getBoundingClientRect();
    const panel = state.panels[state.selected];
    if (panel.photo == null) return;
    panel.ox += (e.clientX - lastX) / r.width;
    panel.oy += (e.clientY - lastY) / r.height;
    panel.ox = Math.max(-0.5, Math.min(0.5, panel.ox));
    panel.oy = Math.max(-0.5, Math.min(0.5, panel.oy));
    lastX = e.clientX;
    lastY = e.clientY;
    draw();
  });
  canvas.addEventListener('pointerup', () => {
    if (dragging) {
      dragging = false;
      pushHistory();
    }
  });
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const panel = state.panels[state.selected];
    if (panel.photo == null) return;
    panel.zoom = Math.max(1, Math.min(2.5, panel.zoom * (e.deltaY < 0 ? 1.08 : 0.92)));
    $('zoomInput').value = String(panel.zoom);
    draw();
  }, { passive: false });
}

// Shot scenes: fixed seed, fixed layout/grade, the same render and export
// code the Export button calls. No randomness, so a screenshot is repeatable.
async function runShot() {
  const scooter = await loadSample('scooter.jpg');
  const bonfire = await loadSample('bonfire.jpg');
  if (shot === 'cover-landscape') {
    document.body.classList.add('shot-cover');
    state.layout = 'hero-stack';
    state.grade = 'vice-sunset';
    state.size = '1920x1080';
    state.panels[0].photo = scooter;
    state.panels[1].photo = bonfire;
    state.panels[2].photo = scooter;
    state.panels[3].photo = bonfire;
  } else if (shot === 'cover-portrait') {
    document.body.classList.add('shot-cover');
    state.layout = 'triptych';
    state.grade = 'neon-night';
    state.size = '1080x1350';
    state.panels[0].photo = scooter;
    state.panels[1].photo = bonfire;
    state.panels[2].photo = scooter;
  } else if (shot === 'cover-square') {
    document.body.classList.add('shot-cover');
    state.layout = 'grid-four';
    state.grade = 'golden-hour';
    state.size = '1080x1080';
    state.panels[0].photo = scooter;
    state.panels[1].photo = bonfire;
    state.panels[2].photo = bonfire;
    state.panels[3].photo = scooter;
  } else if (shot === 'editor') {
    state.layout = 'grid-four';
    state.grade = 'neon-night';
    // Landscape preview so the whole cover fits the 720px-tall shot frame.
    state.size = '1920x1080';
    state.panels[0].photo = scooter;
    state.panels[1].photo = bonfire;
    state.panels[2].photo = bonfire;
    state.panels[3].photo = scooter;
  } else if (shot === 'selftest') {
    document.body.classList.add('shot-cover');
    state.layout = 'hero-stack';
    state.grade = 'vice-sunset';
    state.panels[0].photo = scooter;
    state.panels[1].photo = bonfire;
    const url = exportCoverPNG(state, 1080, 1080, images);
    const el = $('selftest');
    el.hidden = false;
    el.textContent = url.startsWith('data:image/png') && url.length > 100000
      ? `export-ok ${url.length}`
      : `export-fail ${url.length}`;
  }
  syncControls();
  draw();
}

async function boot() {
  try {
    await document.fonts.load('32px "Archivo Black"');
    await document.fonts.load('32px "Yellowtail"');
    await document.fonts.ready;
  } catch {
    // Fall back to system fonts; the cover still draws.
  }
  buildChoices();
  wireEditor();
  pushHistory();
  if (shot) {
    await runShot();
  } else {
    syncControls();
    draw();
  }
  window.addEventListener('resize', () => {
    if (shot.startsWith('cover-')) draw();
  });
}

boot();
