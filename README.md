# Duskline Press — 8 layouts, 6 sunset grades, 3 post sizes, one tap from photo to PNG

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/zhazha473/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/zhazha473/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Duskline Press turns your own photos into a multi-panel poster cover in the style of a sunset-drenched crime saga — right in the browser, fully offline, no upload. Pick a layout, pick a sunset grade, type your caption, and export a share-ready PNG in one tap.

## What it does

- **8 original layouts** — Hero Stack, Grid Four, Full Bleed, Filmstrip, Diagonal Slash, Comic Six, Triptych and Billboard. Every panel takes its own photo, so one cover can mix several moments.
- **6 original sunset grades** — Vice Sunset, Neon Night, Golden Hour, Tangerine Heat, Afterglow Dusk and Mono Noir. Each is a gradient-map grade with grain, vignette and an optional halftone finish.
- **Any photo** — drop in one photo or several, click a panel to fill it, then drag to pan and slide to zoom each panel into place. Captions and subtitles are editable live.
- **Fast** — three common post sizes (1080×1080, 1080×1350, 1920×1080), a one-tap PNG export, an "export all three at once" button, plus Shuffle, undo and redo so you never lose a good accident.
- **Offline by design** — static files only, no network request, no account, no upload. Your photos never leave your machine.

## Try it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. Load a photo (or two), pick a layout and a grade, edit the caption, and hit Export PNG.

## Fonts

- Archivo Black — SIL Open Font License 1.1 (`app/fonts/OFL-archivoblack.txt`)
- Yellowtail — Apache License 2.0 (`app/fonts/LICENSE-yellowtail.txt`)

Both font files live under `app/fonts/` with their licences. The interface text uses the system sans font; nothing here is a game font, logo or artwork.

## Hand in

`main.ts` at the repository root copies `app/` and `screenshots/` into the output directory and writes `dossier.json` with `buildDossier` from `vendor/makefun-app.ts` (the kit's copy, unchanged).

---
<sub>Entered on [make.fun](https://make.fun/?ref=6dykmzap&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
