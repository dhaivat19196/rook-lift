// Dev helper: finds plies in the master games where the played move is the engine's best by a clear margin.
// node scripts/mine-games.mjs [depth] [gap]
import { Chess } from 'chess.js';
import { Pool } from './lib/pool.mjs';
import { GAMES } from '../lib/learn/content/games.ts';

const depth = Number(process.argv[2] ?? 14);
const gap = Number(process.argv[3] ?? 150);
const pool = new Pool();
await pool.start();
const sc = (l) => (l.mate !== undefined ? (l.mate > 0 ? 1 : -1) * (100000 - Math.abs(l.mate)) : l.cp);
const jobs = [];
for (const g of GAMES) {
  const c = new Chess();
  c.loadPgn(g.pgn);
  const hist = c.history({ verbose: true });
  hist.forEach((m, i) => {
    jobs.push(
      (async () => {
        const lines = await pool.analyse(m.before, depth, 2);
        if (lines.length < 2) return null;
        const best = lines[0];
        const played = m.from + m.to + (m.promotion ?? '');
        if (best.pv[0] !== played) return null;
        const d = sc(best) - sc(lines[1]);
        if (d < gap) return null;
        return `${g.id} ply ${i + 1} ${Math.floor(i / 2) + 1}${i % 2 ? '...' : '.'}${m.san}  ${sc(best) > 50000 ? 'M' + best.mate : best.cp}  vs ${sc(lines[1]) > 50000 ? 'M' : lines[1].cp}  | ${m.before}`;
      })(),
    );
  });
}
const out = (await Promise.all(jobs)).filter(Boolean);
console.log(out.join('\n'));
await pool.stop();
process.exit(0);
