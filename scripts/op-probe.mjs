// Dev helper for authoring opening courses.
//   node scripts/op-probe.mjs "e4 c5 Nf3 d6" [depth=14] [multipv=4]      -> top engine lines after the SAN moves
//   node scripts/op-probe.mjs --file lines.txt [depth] [multipv]          -> one SAN line per row (blank/# ignored)
// Scores are from White's point of view in pawns. Reuses the validator's engine cache.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Chess } from 'chess.js';
import { Pool } from './lib/pool.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
let rows;
let rest;
if (argv[0] === '--file') {
  rows = readFileSync(argv[1], 'utf8').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
  rest = argv.slice(2);
} else {
  rows = [argv[0]];
  rest = argv.slice(1);
}
const depth = Number(rest[0] ?? 14);
const mpv = Number(rest[1] ?? 4);
const pool = new Pool(Number(process.env.VALIDATE_WORKERS) || undefined, join(root, '.cache', 'validate-engine.json'));
await pool.start();
const out = await Promise.all(
  rows.map(async (row) => {
    const c = new Chess();
    for (const t of row.split(/\s+/).filter(Boolean)) {
      const v = t.replace(/^\d+\.+/, '').replace(/[?!]+$/, '');
      if (!v) continue;
      try { c.move(v); } catch { return `${row}\n  ILLEGAL ${t}`; }
    }
    const fen = c.fen();
    const lines = await pool.analyse(fen, depth, mpv);
    const sign = c.turn() === 'w' ? 1 : -1;
    const fmt = (l) => {
      const cc = new Chess(fen);
      const s = [];
      for (const u of l.pv.slice(0, Number(process.env.PLY ?? 6))) {
        try { s.push(cc.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] }).san); } catch { break; }
      }
      const v = l.mate !== undefined ? `M${l.mate * sign}` : ((l.cp * sign) / 100).toFixed(2);
      return `${v.padStart(6)}  ${s.join(' ')}`;
    };
    return `${row}  [${c.turn()} to move]\n` + lines.map((l) => '  ' + fmt(l)).join('\n');
  }),
);
console.log(out.join('\n'));
pool.save();
await pool.stop();
process.exit(0);
