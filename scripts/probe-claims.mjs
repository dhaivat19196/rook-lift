// Dev helper: node scripts/probe-claims.mjs file [depth]
// lines: label | seq-of-SAN-from-start (or FEN) | san to test    ->  best line, score of san, gap
import { readFileSync } from 'node:fs';
import { Chess } from 'chess.js';
import { Pool } from './lib/pool.mjs';
import { pos } from '../lib/learn/build.ts';
const [file, depth = '14'] = process.argv.slice(2);
const rows = readFileSync(file, 'utf8').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#')).map((l) => l.split('|').map((x) => x.trim()));
const pool = new Pool(); await pool.start();
const sc = (l) => l.mate !== undefined ? (l.mate > 0 ? 1 : -1) * (100000 - Math.abs(l.mate)) : l.cp;
const out = await Promise.all(rows.map(async ([label, src, san]) => {
  let fen; try { fen = src.includes('/') ? src : pos(src); new Chess(fen); } catch (e) { return `${label}: BAD ${e.message}`; }
  const c = new Chess(fen);
  { const p = fen.split(' '); p[1] = p[1] === 'w' ? 'b' : 'w'; p[3] = '-'; try { if (new Chess(p.join(' ')).inCheck()) return `${label}: ILLEGAL (side not to move is in check)`; } catch {} }
  const [best] = await pool.analyse(fen, Number(depth), 1);
  const bc = new Chess(fen); const bm = bc.move({ from: best.pv[0].slice(0,2), to: best.pv[0].slice(2,4), promotion: best.pv[0][4] }).san;
  if (!san) return `${label}: ${c.turn()} best ${bm} ${sc(best)}`;
  let m; try { m = c.move(san); } catch { return `${label}: ILLEGAL ${san}`; }
  const u = m.from + m.to + (m.promotion ?? '');
  const mine = u === best.pv[0] ? best : (await pool.analyse(fen, Number(depth), 1, [u]))[0];
  return `${label}: best ${bm} ${sc(best)} | ${san} ${sc(mine)} gap ${sc(best) - sc(mine)}`;
}));
console.log(out.join('\n'));
await pool.stop(); process.exit(0);
