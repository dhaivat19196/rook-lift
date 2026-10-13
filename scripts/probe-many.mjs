// Dev helper: node scripts/probe-many.mjs cands.txt [depth]
// cands.txt lines:  id | fen [| expectSAN]   -> legality, loose pieces, top engine lines (side-to-move scores)
import { readFileSync } from 'node:fs';
import { Chess } from 'chess.js';
import { Pool } from './lib/pool.mjs';
import { hangingPieces } from '../lib/core.ts';
const [file, depth = '14'] = process.argv.slice(2);
const rows = readFileSync(file, 'utf8').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#')).map((l) => l.split('|').map((x) => x.trim()));
const pool = new Pool(); await pool.start();
const out = await Promise.all(rows.map(async ([id, fen, expect]) => {
  let c;
  try { c = new Chess(fen); } catch (e) { return `${id}: ILLEGAL ${e.message}`; }
  let lines; try { lines = await Promise.race([pool.analyse(fen, Number(depth), 3), new Promise((_, r) => setTimeout(() => r(new Error("timeout")), 60000))]); } catch (e) { return `${id}: ENGINE ERROR ${e.message}`; }
  const fmt = (l) => {
    const cc = new Chess(fen); const s = [];
    for (const u of l.pv.slice(0, 6)) { try { s.push(cc.move({ from: u.slice(0,2), to: u.slice(2,4), promotion: u[4] }).san); } catch { break; } }
    return (l.mate !== undefined ? `M${l.mate}` : l.cp) + ' ' + s.join(' ');
  };
  let loose = '';
  try { loose = ` loose w[${hangingPieces(fen, 'w').join(' ')}] b[${hangingPieces(fen, 'b').join(' ')}]`; } catch {}
  return `${id}: ${c.turn()} to move${expect ? ' expect ' + expect : ''}${loose}\n    ` + lines.map(fmt).join('\n    ');
}));
console.log(out.join('\n'));
await pool.stop(); process.exit(0);
