# Duskline Press — 8 layouts, 6 sunset grades, 3 post sizes, one tap from photo to PNG

Duskline Press is an offline web app that turns any photo and caption into
GTA-style multi-panel cover art and exports it as a PNG to share. It runs
entirely in desktop Chrome from its own static files: photos never leave the
machine, and the app makes no network request.

## What it does

- **8 original layouts**: Hero Stack, Grid Four, Full Bleed, Filmstrip (with
  sprocket holes), Diagonal Slash, Comic Six, Triptych, Billboard.
- **6 original sunset grades**: Vice Sunset, Neon Night, Golden Hour,
  Tangerine Heat, Afterglow Dusk, Mono Noir — gradient-map tint, grain,
  vignette, and halftone where it fits.
- **Any photo**: add several photos, click a panel to select it, click a
  thumbnail to fill it, drag to pan, zoom per panel.
- **Caption**: editable bold title (Archivo Black) and script subtitle
  (Yellowtail), plus a round "Duskline Press — Est. 2026" stamp.
- **Fast**: 3 post sizes (1080×1080, 1080×1350, 1920×1080), one-tap PNG
  export, or export all three at once. Shuffle randomises layout + grade.
  Undo/redo included. Live preview throughout.

## Try it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome.

## Fonts

- Archivo Black (SIL Open Font License 1.1) — see
  `app/fonts/OFL-archivoblack.txt`.
- Yellowtail (Apache License 2.0) — see `app/fonts/LICENSE-yellowtail.txt`.

Both font files live under `app/fonts/`. No Rockstar Games logo, artwork,
or font is used anywhere; all art, lettering, and sample photos are original
(the two sample photos were made with an image model).

## Hand in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/`
to the output directory and writes `dossier.json` with `buildDossier` from
`vendor/makefun-app.ts`.
