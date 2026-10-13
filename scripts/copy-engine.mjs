// Copies the Stockfish lite single-threaded build (js + wasm) from node_modules into public/engine.
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'node_modules', 'stockfish', 'bin');
const dest = join(root, 'public', 'engine');
if (!existsSync(src)) {
  console.warn('[copy-engine] node_modules/stockfish/bin not found; skipping');
  process.exit(0);
}
mkdirSync(dest, { recursive: true });
const files = readdirSync(src).filter((f) => /lite-single\.(js|wasm)$/.test(f));
if (files.length < 2) {
  console.error('[copy-engine] could not find lite-single js+wasm in', src, readdirSync(src));
  process.exit(1);
}
for (const f of files) {
  copyFileSync(join(src, f), join(dest, f));
  console.log('[copy-engine] copied', f);
}
const lic = join(root, 'node_modules', 'stockfish', 'Copying.txt');
if (existsSync(lic)) copyFileSync(lic, join(dest, 'COPYING.txt'));
