// Duskline Press — wires the bench: pick photos per panel, choose a layout and
// a sunset grade, write the words, export PNGs. A `?shot=` query sets up a fixed
// scene for a screenshot instead (./shots.js). `?selftest=1` exports once and
// reports the byte count into #selftest, so a headless run can prove the export.
import { SIZES, GRADES, LAYOUTS, LAYOUT_KEYS, GRADE_KEYS, SIZE_KEYS, drawCover } from './cover.js';
import { runShot } from './shots.js';

const $ = (id) => document.getElementById(id);
const canvas = $('cover');
const status = $('status');

const SAMPLES = ['pier', 'boulevard'];
const TITLES = ['DUSKLINE HEIST', 'NEON HARBOUR', 'VELVET FREEWAY', 'PALM COURT', 'MIDNIGHT TOLL', 'SUNSET PAROLE', 'GOLDEN PAROLE', 'TANGERINE TOLL'];
const TAGLINES = ['one last sunset job', 'the city never sleeps', 'drive into the gold', 'every light is a promise', 'run the coast road', 'dusk is the deadline'];

function defaultPanels() {
  return Array.from({ length: 6 }, (_, i) => ({
    src: `samples/${SAMPLES[i % 2]}.jpg`, zoom: 1, ox: 0, oy: 0,
  }));
}

function defaultState() {
  return {
    layout: 'hero', grade: 'vice', size: 'square',
    title: 'DUSKLINE HEIST', tagline: 'one last sunset job',
    panels: defaultPanels(),
  };
}

let state = defaultState();
let selectedPanel = 0;
const images = new Map(); // src -> HTMLImageElement | null
let history = [];
let future = [];

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`cannot load ${url}`));
    img.src = url;
  });
}

async function ensureImage(src) {
  if (!src || images.has(src)) return images.get(src) || null;
  try {
    const img = await loadImage(src);
    images.set(src, img);
    return img;
  } catch {
    images.set(src, null);
    return null;
  }
}

async function render() {
  const size = SIZES[state.size];
  if (canvas.width !== size.w || canvas.height !== size.h) {
    canvas.width = size.w;
    canvas.height = size.h;
  }
  await Promise.all(state.panels.map((p) => ensureImage(p.src)));
  drawCover(canvas, state, images);
}

function snapshot() {
  return JSON.stringify(state);
}

function pushHistory() {
  history.push(snapshot());
  if (history.length > 60) history.shift();
  future = [];
  syncHistoryButtons();
}

function restore(json) {
  state = JSON.parse(json);
  syncAll();
  render();
}

function syncHistoryButtons() {
  $('undo').disabled = history.length === 0;
  $('redo').disabled = future.length === 0;
}

// ---------- controls ----------

function buildButtons(containerId, keys, labels, current, onPick) {
  const box = $(containerId);
  box.innerHTML = '';
  keys.forEach((key) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pick' + (key === current ? ' active' : '');
    b.textContent = labels[key];
    b.dataset.key = key;
    b.addEventListener('click', () => {
      pushHistory();
      onPick(key);
      buildButtons(containerId, keys, labels, key, onPick);
      render();
    });
    box.appendChild(b);
  });
}

function syncPicks() {
  buildButtons('layouts', LAYOUT_KEYS, Object.fromEntries(LAYOUT_KEYS.map((k) => [k, LAYOUTS[k].label])), state.layout, (k) => { state.layout = k; syncSlots(); });
  buildButtons('grades', GRADE_KEYS, Object.fromEntries(GRADE_KEYS.map((k) => [k, GRADES[k].label])), state.grade, (k) => { state.grade = k; });
  buildButtons('sizes', SIZE_KEYS, Object.fromEntries(SIZE_KEYS.map((k) => [k, SIZES[k].label])), state.size, (k) => { state.size = k; });
}

function syncSlots() {
  const layout = LAYOUTS[state.layout];
  const used = layout.panels.length;
  const box = $('slots');
  box.innerHTML = '';
  state.panels.forEach((slot, i) => {
    const card = document.createElement('div');
    card.className = 'slot' + (i === selectedPanel ? ' selected' : '') + (i >= used ? ' unused' : '');
    const name = slot.src ? slot.src.split('/').pop().split('.')[0] : 'empty';
    card.innerHTML = `
      <div class="slot-head"><strong>Panel ${i + 1}</strong><span>${name}</span></div>
      <div class="slot-row">
        <button type="button" data-sample="pier">Pier</button>
        <button type="button" data-sample="boulevard">Boulevard</button>
        <label class="upload">Upload <input type="file" accept="image/*" hidden></label>
      </div>
      <label>Zoom <input type="range" min="1" max="2.5" step="0.01" value="${slot.zoom}" data-field="zoom"></label>
      <label>Pan X <input type="range" min="-0.4" max="0.4" step="0.01" value="${slot.ox}" data-field="ox"></label>
      <label>Pan Y <input type="range" min="-0.4" max="0.4" step="0.01" value="${slot.oy}" data-field="oy"></label>`;
    card.addEventListener('click', (e) => {
      if (e.target.closest('button, label, input')) return;
      selectedPanel = i;
      syncSlots();
    });
    card.querySelectorAll('[data-sample]').forEach((b) => b.addEventListener('click', async () => {
      pushHistory();
      slot.src = `samples/${b.dataset.sample}.jpg`;
      await ensureImage(slot.src);
      syncSlots();
      render();
    }));
    const file = card.querySelector('input[type=file]');
    file.addEventListener('change', () => {
      const f = file.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = async () => {
        pushHistory();
        slot.src = reader.result;
        await ensureImage(slot.src);
        syncSlots();
        render();
        status.textContent = `Panel ${i + 1} loaded ${f.name}.`;
      };
      reader.readAsDataURL(f);
    });
    card.querySelectorAll('input[type=range]').forEach((r) => {
      r.addEventListener('input', () => {
        slot[r.dataset.field] = Number(r.value);
        render();
      });
      r.addEventListener('change', () => { pushHistory(); });
    });
    box.appendChild(card);
  });
}

function syncWords() {
  $('title').value = state.title;
  $('tagline').value = state.tagline;
}

function syncAll() {
  syncPicks();
  syncSlots();
  syncWords();
  syncHistoryButtons();
}

// Canvas click selects the panel under the pointer.
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width;
  const y = (e.clientY - rect.top) / rect.height;
  const layout = LAYOUTS[state.layout];
  const hit = layout.panels.findIndex((p) => {
    if (p.pts) {
      const xs = p.pts.map((q) => q[0]);
      const ys = p.pts.map((q) => q[1]);
      return x >= Math.min(...xs) && x <= Math.max(...xs) && y >= Math.min(...ys) && y <= Math.max(...ys);
    }
    return x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h;
  });
  if (hit >= 0) {
    selectedPanel = hit;
    syncSlots();
    status.textContent = `Panel ${hit + 1} selected — pick a photo, zoom, or pan it.`;
  }
});

$('title').addEventListener('input', () => { state.title = $('title').value; render(); });
$('title').addEventListener('change', () => pushHistory());
$('tagline').addEventListener('input', () => { state.tagline = $('tagline').value; render(); });
$('tagline').addEventListener('change', () => pushHistory());

$('shuffle').addEventListener('click', () => {
  pushHistory();
  state.layout = LAYOUT_KEYS[Math.floor(Math.random() * LAYOUT_KEYS.length)];
  state.grade = GRADE_KEYS[Math.floor(Math.random() * GRADE_KEYS.length)];
  state.title = TITLES[Math.floor(Math.random() * TITLES.length)];
  state.tagline = TAGLINES[Math.floor(Math.random() * TAGLINES.length)];
  state.panels = state.panels.map((p, i) => ({
    ...p,
    src: `samples/${SAMPLES[Math.floor(Math.random() * SAMPLES.length)]}.jpg`,
    zoom: 1 + Math.random() * 0.6,
    ox: (Math.random() - 0.5) * 0.3,
    oy: (Math.random() - 0.5) * 0.3,
  }));
  syncAll();
  render();
  status.textContent = `Shuffled: ${LAYOUTS[state.layout].label} + ${GRADES[state.grade].label}.`;
});

$('undo').addEventListener('click', () => {
  if (!history.length) return;
  future.push(snapshot());
  restore(history.pop());
  status.textContent = 'Undid one step.';
});
$('redo').addEventListener('click', () => {
  if (!future.length) return;
  history.push(snapshot());
  restore(future.pop());
  status.textContent = 'Redid one step.';
});

function downloadBlob(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

function renderToCanvas(sizeKey) {
  const size = SIZES[sizeKey];
  const off = document.createElement('canvas');
  off.width = size.w;
  off.height = size.h;
  drawCover(off, { ...state, size: sizeKey }, images);
  return off;
}

function exportOne(sizeKey) {
  return new Promise((resolve) => {
    renderToCanvas(sizeKey).toBlob((blob) => {
      if (!blob) { status.textContent = 'Export failed.'; resolve(0); return; }
      downloadBlob(blob, `duskline-press-${sizeKey}.png`);
      status.textContent = `Saved duskline-press-${sizeKey}.png (${Math.round(blob.size / 1024)} KiB).`;
      resolve(blob.size);
    }, 'image/png');
  });
}

$('export').addEventListener('click', () => { exportOne(state.size); });
$('export-all').addEventListener('click', async () => {
  for (const key of SIZE_KEYS) {
    await exportOne(key);
    await new Promise((r) => setTimeout(r, 350));
  }
  status.textContent = 'Saved all three post sizes.';
});

// ---------- boot ----------

async function boot() {
  syncAll();
  try {
    await Promise.race([
      Promise.all([document.fonts.load('16px "Archivo Black"'), document.fonts.load('16px "Yellowtail"')]),
      new Promise((r) => setTimeout(r, 3000)),
    ]);
  } catch { /* system faces as fallback */ }

  const params = new URLSearchParams(location.search);
  const shot = params.get('shot');
  if (shot) {
    await runShot(shot, params, async ({ photo, caption, tagline, layout, grade, size }) => {
      state.layout = LAYOUTS[layout] ? layout : 'hero';
      state.grade = GRADES[grade] ? grade : 'vice';
      state.size = SIZES[size] ? size : 'square';
      state.title = caption;
      state.tagline = tagline;
      state.panels = state.panels.map((p, i) => ({
        ...p,
        src: `samples/${i % 2 === 0 ? photo : SAMPLES.find((s) => s !== photo) || photo}.jpg`,
        zoom: 1, ox: 0, oy: 0,
      }));
      syncAll();
      await render();
    });
    return;
  }

  await render();

  if (params.get('selftest') === '1') {
    const bytes = await new Promise((resolve) => {
      renderToCanvas(state.size).toBlob((b) => resolve(b ? b.size : 0), 'image/png');
    });
    const el = $('selftest');
    el.textContent = `selftest ok ${bytes} bytes`;
    document.title = `selftest ok ${bytes}`;
    document.body.dataset.ready = '1';
    window.__shotReady = true;
  }
}

boot();
