// Fixed scenes for screenshots: ?shot=cover shows the cover alone, ?shot=editor
// shows the full press bench with a photo loaded. `photo` picks the sample
// (samples/<photo>.jpg), `caption` the title, `layout` / `grade` / `size` the rest.
// window.__shotReady is set once the scene is painted with fonts loaded.
import { SIZES } from './cover.js';

export async function runShot(shot, query, apply) {
  const photo = query.get('photo') ?? 'pier';
  const caption = query.get('caption') ?? 'Duskline Heist';
  const tagline = query.get('tagline') ?? 'one last sunset job';
  const layout = query.get('layout') ?? 'hero';
  const grade = query.get('grade') ?? 'vice';
  const size = SIZES[query.get('size')] ? query.get('size') : 'square';
  if (shot === 'cover') document.body.classList.add('shot-cover');
  await apply({ photo, caption, tagline, layout, grade, size });
  try {
    await Promise.race([
      Promise.all([
        document.fonts.load('16px "Archivo Black"'),
        document.fonts.load('16px "Yellowtail"'),
      ]),
      new Promise((r) => setTimeout(r, 3000)),
    ]);
  } catch { /* fonts fall back to system faces; the scene still paints */ }
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  window.__shotReady = true;
  document.body.dataset.ready = '1';
}
