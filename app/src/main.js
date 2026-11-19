// Duskline Press — editor wiring, photo handling, export and shot scenes.
// Vanilla ES module. All photos stay on the user's machine; the app makes
// no network request. Cover drawing lives in cover.js.

import { LAYOUTS, LAYOUT_IDS, GRADES, GRADE_IDS, SIZES, SIZE_IDS, drawCover, exportCoverPNG, hitPanel } from './cover.js';

const SAMPLE_PHOTOS = ['samples/sunset-rider.jpg', 'samples/neon-skater.jpg'];

const state = {
  layout: 'filmstrip',
  grade: 'vice-sunset',
  size: '1080x1080',
  title: 'DUSKLINE',
  subtitle: 'Vice nights, one tap away',
  images: [],
  panels: [],
  selectedPanel: 0,
};

const undoStack = [];
const redoStack = [];

const preview = document.getElementById('preview');
const thumbsEl = document.getElementById('thumbs');
const titleInput = document.getElementById('titleInput');
const subtitleInput = document.getElementById('subtitleInput');
const zoomInput = document.getElementById('zoomInput');
const panelLabel = document.getElementById('panelLabel');

function panelCount() {
  return (LAYOUTS[state.layout] || LAYOUTS['hero-stack']).panels.length;
}

function resetPanels(keepPhotos) {
  const n = panelCount();
  const old = keepPhotos ? state.panels : [];
  state.panels = Array.from({ length: n }, (_, i) => {
    const prev = old[i] || old[i % Math.max(1, old.length)] || {};
    return { photo: prev.photo ?? (i % Math.max(1, state.images.length || 1)), ox: 0, oy: 0, zoom: 1 };
  });
  state.selectedPanel = 0;
}

function snapshot() {
  return JSON.stringify({
    layout: state.layout, grade: state.grade, size: state.size,
    title: state.title, subtitle: state.subtitle, panels: state.panels,
  });
}

function restore(json) {
  const s = JSON.parse(json);
  Object.assign(state, s);
  syncControls();
  renderPreview();
}

function pushHistory() {
  undoStack.push(snapshot());
  if (undoStack.length > 60) undoStack.shift();
  redoStack.length = 0;
}

function undo() {
  if (!undoStack.length) return;
  redoStack.push(snapshot());
  restore(undoStack.pop());
}

function redo() {
  if (!redoStack.length) return;
  undoStack.push(snapshot());
  restore(redoStack.pop());
}

function renderPreview() {
  const size = SIZES[state.size] || SIZES['1080x1080'];
  drawCover(preview, size.w, size.h, state);
  const pan = state.panels[state.selectedPanel];
  panelLabel.textContent = pan
    ? `Panel ${state.selectedPanel + 1} of ${panelCount()} selected — drag on the preview to pan, use zoom below.`
    : 'No panel selected.';
  if (pan) zoomInput.value = String(pan.zoom || 1);
}

function syncControls() {
  document.querySelectorAll('#layoutButtons button').forEach((b) => {
    b.classList.toggle('active', b.dataset.layout === state.layout);
  });
  document.querySelectorAll('#gradeButtons button').forEach((b) => {
    b.classList.toggle('active', b.dataset.grade === state.grade);
  });
  document.querySelectorAll('#sizeButtons button').forEach((b) => {
    b.classList.toggle('active', b.dataset.size === state.size);
  });
  titleInput.value = state.title;
  subtitleInput.value = state.subtitle;
  document.querySelectorAll('#thumbs img').forEach((img, i) => {
    img.classList.toggle('active', state.panels[state.selectedPanel]?.photo === i);
  });
}

function buildButtons() {
  const layoutBox = document.getElementById('layoutButtons');
  LAYOUT_IDS.forEach((id) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = LAYOUTS[id].label;
    b.dataset.layout = id;
    b.addEventListener('click', () => {
      pushHistory();
      state.layout = id;
      resetPanels(true);
      syncControls();
      renderPreview();
    });
    layoutBox.appendChild(b);
  });
  const gradeBox = document.getElementById('gradeButtons');
  GRADE_IDS.forEach((id) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = GRADES[id].label;
    b.dataset.grade = id;
    b.addEventListener('click', () => {
      pushHistory();
      state.grade = id;
      syncControls();
      renderPreview();
    });
    gradeBox.appendChild(b);
  });
  const sizeBox = document.getElementById('sizeButtons');
  SIZE_IDS.forEach((id) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = SIZES[id].label;
    b.dataset.size = id;
    b.addEventListener('click', () => {
      pushHistory();
      state.size = id;
      syncControls();
      renderPreview();
    });
    sizeBox.appendChild(b);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function loadSamples() {
  for (const src of SAMPLE_PHOTOS) {
    try {
      const img = await loadImage(src);
      state.images.push(img);
    } catch (err) {
      // A missing sample is fine; the user can add their own photos.
    }
  }
  rebuildThumbs();
}

function rebuildThumbs() {
  thumbsEl.innerHTML = '';
  state.images.forEach((img, i) => {
    const t = document.createElement('img');
    t.src = img.src;
    t.alt = `Photo ${i + 1}`;
    t.addEventListener('click', () => {
      pushHistory();
      const pan = state.panels[state.selectedPanel];
      if (pan) pan.photo = i;
      syncControls();
      renderPreview();
    });
    thumbsEl.appendChild(t);
  });
}

function addFiles(files) {
  const list = Array.from(files || []).filter((f) => f.type.startsWith('image/'));
  if (!list.length) return;
  Promise.all(list.map((f) => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = String(reader.result);
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(f);
  }))).then((loaded) => {
    const fresh = loaded.filter(Boolean);
    if (!fresh.length) return;
    pushHistory();
    fresh.forEach((img) => state.images.push(img));
    rebuildThumbs();
    renderPreview();
  });
}

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

async function exportOne(sizeId) {
  const { blob } = await exportCoverPNG(state, sizeId);
  if (!blob) return false;
  downloadBlob(blob, `duskline-press-${sizeId}.png`);
  return true;
}

async function exportAll() {
  for (const id of SIZE_IDS) await exportOne(id);
}

function shuffleAll() {
  pushHistory();
  const layouts = LAYOUT_IDS.filter((id) => id !== state.layout);
  const grades = GRADE_IDS.filter((id) => id !== state.grade);
  state.layout = layouts[Math.floor(Math.random() * layouts.length)];
  state.grade = grades[Math.floor(Math.random() * grades.length)];
  resetPanels(true);
  syncControls();
  renderPreview();
}

// Pointer interaction on the preview: click selects a panel, drag pans it.
let drag = null;
function canvasPoint(ev) {
  const rect = preview.getBoundingClientRect();
  const size = SIZES[state.size] || SIZES['1080x1080'];
  return {
    x: ((ev.clientX - rect.left) / rect.width) * size.w,
    y: ((ev.clientY - rect.top) / rect.height) * size.h,
  };
}
preview.addEventListener('pointerdown', (ev) => {
  const p = canvasPoint(ev);
  const size = SIZES[state.size] || SIZES['1080x1080'];
  const hit = hitPanel(state.layout, p.x, p.y, size.w, size.h);
  if (hit >= 0) {
    state.selectedPanel = hit;
    syncControls();
    renderPreview();
  }
  drag = { x: ev.clientX, y: ev.clientY, ox: state.panels[state.selectedPanel]?.ox || 0, oy: state.panels[state.selectedPanel]?.oy || 0 };
  preview.classList.add('dragging');
  preview.setPointerCapture(ev.pointerId);
});
preview.addEventListener('pointermove', (ev) => {
  if (!drag) return;
  const rect = preview.getBoundingClientRect();
  const pan = state.panels[state.selectedPanel];
  if (!pan) return;
  pan.ox = drag.ox + ((ev.clientX - drag.x) / rect.width) * 2;
  pan.oy = drag.oy + ((ev.clientY - drag.y) / rect.height) * 2;
  renderPreview();
});
preview.addEventListener('pointerup', () => {
  if (drag) pushHistory();
  drag = null;
  preview.classList.remove('dragging');
});

function wireControls() {
  const input = document.getElementById('photoInput');
  const drop = document.getElementById('dropZone');
  drop.addEventListener('click', () => input.click());
  input.addEventListener('change', () => { addFiles(input.files); input.value = ''; });
  drop.addEventListener('dragover', (ev) => { ev.preventDefault(); });
  drop.addEventListener('drop', (ev) => { ev.preventDefault(); addFiles(ev.dataTransfer.files); });
  titleInput.addEventListener('input', () => { state.title = titleInput.value; renderPreview(); });
  titleInput.addEventListener('change', pushHistory);
  subtitleInput.addEventListener('input', () => { state.subtitle = subtitleInput.value; renderPreview(); });
  subtitleInput.addEventListener('change', pushHistory);
  zoomInput.addEventListener('input', () => {
    const pan = state.panels[state.selectedPanel];
    if (pan) { pan.zoom = Number(zoomInput.value); renderPreview(); }
  });
  zoomInput.addEventListener('change', pushHistory);
  document.getElementById('shuffleBtn').addEventListener('click', shuffleAll);
  document.getElementById('undoBtn').addEventListener('click', undo);
  document.getElementById('redoBtn').addEventListener('click', redo);
  document.getElementById('exportBtn').addEventListener('click', () => exportOne(state.size));
  document.getElementById('exportAllBtn').addEventListener('click', exportAll);
}

// Deterministic shot scenes for screenshots. Each uses the same drawCover
// and export code as the Export button, with fixed seeds and sample photos.
const SHOT_PRESETS = {
  'cover-landscape': { layout: 'filmstrip', grade: 'vice-sunset', size: '1920x1080', title: 'DUSKLINE', subtitle: 'Vice nights, one tap away' },
  'cover-portrait': { layout: 'triptych', grade: 'neon-night', size: '1080x1350', title: 'DUSKLINE', subtitle: 'Neon hearts, golden streets' },
  'cover-square': { layout: 'comic-six', grade: 'golden-hour', size: '1080x1080', title: 'DUSKLINE', subtitle: 'Chase the last light' },
  editor: { layout: 'billboard', grade: 'tangerine-heat', size: '1920x1080', title: 'DUSKLINE', subtitle: 'Vice nights, one tap away' },
};

async function runShotMode(shot) {
  const preset = SHOT_PRESETS[shot];
  if (!preset) return false;
  Object.assign(state, { layout: preset.layout, grade: preset.grade, size: preset.size, title: preset.title, subtitle: preset.subtitle });
  await loadSamples();
  resetPanels(false);
  // Alternate the two sample photos across panels for a multi-photo cover.
  state.panels.forEach((pan, i) => { pan.photo = i % Math.max(1, state.images.length); });
  await document.fonts.ready;
  if (shot === 'editor') {
    syncControls();
    renderPreview();
  } else {
    document.body.classList.add('shot-cover');
    syncControls();
    renderPreview();
  }
  return true;
}

async function runSelfTest() {
  await loadSamples();
  resetPanels(false);
  state.panels.forEach((pan, i) => { pan.photo = i % Math.max(1, state.images.length); });
  await document.fonts.ready;
  const { canvas } = await exportCoverPNG(state, '1080x1080');
  const dataUrl = canvas.toDataURL('image/png');
  const el = document.getElementById('selftest');
  const ok = dataUrl.startsWith('data:image/png') && dataUrl.length > 100000;
  el.textContent = ok ? `export-ok ${dataUrl.length}` : `export-fail ${dataUrl.length}`;
  return ok;
}

async function boot() {
  buildButtons();
  wireControls();
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (shot === 'selftest') {
    await runSelfTest();
    return;
  }
  if (shot && SHOT_PRESETS[shot]) {
    await runShotMode(shot);
    return;
  }
  await loadSamples();
  resetPanels(false);
  syncControls();
  renderPreview();
}

boot();
