[![make.fun](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/zhazha473/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/zhazha473/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

# Duskline Press — 8 layouts, 6 sunset grades, 3 post sizes, one tap from photo to PNG

[Duskline Press](https://make.fun/bounty/gta6-cover-art-01) is a print-shop press
that turns a photo and a caption into GTA 6-style multi-panel cover art, offline
in a desktop browser. No account, no upload, no network: the photos never leave
your machine.

## What it does — the counted proof

- **8 layouts**: Hero Stack, Grid Four, Full Bleed, Filmstrip, Diagonal Slash,
  Comic Six, Triptych, Billboard.
- **6 sunset grades**: Vice Sunset, Neon Night, Golden Hour, Tangerine Heat,
  Afterglow Dusk, Mono Noir.
- **3 post sizes**: Square 1080 × 1080, Portrait 1080 × 1350, Story 1080 × 1920 —
  plus export-all, which saves all three at once.
- **Per-panel photos**: every panel takes its own photo (upload or one of the two
  built-in samples), with zoom and pan to crop and position it exactly.
- **Words**: a big display title (Archivo Black, auto-fitted, tilted) and a script
  tagline (Yellowtail) in the grade's accent colour.
- **Fast**: shuffle deals a new layout + grade + photos in one click; undo/redo
  cover every step; live preview redraws as you type.
- **Scenes**: `?shot=cover` and `?shot=editor` set up fixed scenes for
  screenshots (see `shots.json`).

## Run it offline

```sh
node serve.ts        # serves app/ on http://localhost:8080
```

Open the page, pick a layout and a grade, drop a photo on any panel (or click a
panel on the cover, then choose Pier, Boulevard, or Upload), write the title and
tagline, and press **Export PNG** — or **Export all 3 sizes** for every post
format at once.

Hand the app in with `main.ts` (Node 22): it copies `app/` and `screenshots/`
to `/output` and writes `/output/dossier.json` via the vendored make.fun
library (`vendor/makefun-app.ts`):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Files

- `app/index.html`, `app/style.css` — the press bench.
- `app/src/cover.js` — the renderer: layouts, grades, lettering.
- `app/src/main.js` — state, history, export, shuffle.
- `app/src/shots.js` — fixed `?shot=` scenes.
- `app/fonts/` — Archivo Black (SIL OFL 1.1, see `OFL-archivoblack.txt`) and
  Yellowtail (Apache 2.0, see `LICENSE-yellowtail.txt`), both vendored.
- `app/samples/` — two sample photos (Pier, Boulevard), free to use.
- `screenshots/` — 4 screenshots: the app with a photo loaded, and covers it
  exported.

## Licence

MIT — see `LICENSE`. Everything in this repo is original work: no Rockstar Games
logo, no official artwork, no official fonts.
