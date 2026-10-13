// Dev helper: node scripts/check-lines.mjs file [depth]    lines: id | w|b | SAN SAN SAN ...
// Reports plies where the student's move is >50cp below best, or an opponent reply is >120cp below best.
import { readFileSync } from 'node:fs';
import { Chess } from 'chess.js';
import { Pool } from './lib/pool.mjs';

const [file, depth = '12'] = process.argv.slice(2);
const rows = readFileSync(file, 'utf8').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#')).map((l) => l.split('|').map((x) => x.trim()));
const pool = new Pool();
await pool.start();
const sc = (l) => (l.mate !== undefined ? (l.mate > 0 ? 1 : -1) * (100000 - Math.abs(l.mate)) : l.cp);
const out = await Promise.all(
  rows.map(async ([id, side, line]) => {
    const moves = line.split(/\s+/).filter((m) => !/^\d+\.+$/.test(m));
    const c = new Chess();
    const probs = [];
    for (let i = 0; i < moves.length; i++) {
      const who = c.turn();
      const fen = c.fen();
      let m;
      try {
        m = c.move(moves[i]);
      } catch {
        probs.push(`ply ${i + 1} ${moves[i]} ILLEGAL`);
        break;
      }
      const u = m.from + m.to + (m.promotion ?? '');
      const [best] = await pool.analyse(fen, Number(depth), 1);
      const mine = u === best.pv[0] ? best : (await pool.analyse(fen, Number(depth), 1, [u]))[0];
      const loss = sc(best) - sc(mine);
      const lim = who === side ? 50 : 120;
      if (loss > lim) probs.push(`ply ${i + 1} ${moves[i]} is ${loss}cp below best (${best.pv[0]})`);
    }
    return `${id} (${moves.length} plies): ${probs.length ? probs.join('; ') : 'OK'}`;
  }),
);
console.log(out.join('\n'));
await pool.stop();
process.exit(0);
