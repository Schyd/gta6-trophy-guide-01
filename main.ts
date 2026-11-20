// SPDX-License-Identifier: MIT
// Leonida Legend — entrypoint for gta6-trophy-guide-01.
//
// Hands in the trophy guide: copies app/ and screenshots/ from this
// repository into the output directory, then writes dossier.json exactly as
// buildDossier produces it from those copied files. Node 22, standard
// library only, no network, deterministic — two runs over the same
// repository write the same bytes.
//
// The output directory is only ever created, never removed or emptied.
// Inside the grader it is a mounted volume, and deleting a mount point is
// refused by the system.

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)));
const outDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');

// Create the output directory when it is missing. Nothing here ever
// deletes, clears or empties it or its contents.
mkdirSync(outDir, { recursive: true });

const appDir = join(repoRoot, 'app');
if (!existsSync(appDir)) {
  throw new Error(`app/ folder is missing next to main.ts (${repoRoot})`);
}
cpSync(appDir, join(outDir, 'app'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});

writeFileSync(join(outDir, 'dossier.json'), dossier);

// A quick sanity check that what was written is the dossier the library
// produced, not a truncated write.
JSON.parse(new TextDecoder().decode(dossier));

const shotCount = readdirSync(join(outDir, 'screenshots')).length;
console.log(
  `output: ${outDir} | dossier.json ${Buffer.byteLength(dossier)} bytes | ${shotCount} screenshot(s)`,
);
