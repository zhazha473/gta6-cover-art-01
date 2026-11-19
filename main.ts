// Duskline Press — hand the app in.
// Copies app/ and screenshots/ next to this file into the output directory
// and writes dossier.json with buildDossier. The program reads only its own
// repository files, so two runs over the same tree write identical bytes.
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
for (const dir of ['app', 'screenshots']) {
  const src = join(here, dir);
  if (existsSync(src)) cpSync(src, join(out, dir), { recursive: true });
}
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);
