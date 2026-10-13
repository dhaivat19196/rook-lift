// Dev helper: node scripts/probe.mjs "<fen>" [depth] [multipv]   -> legality, best lines
import { Chess } from 'chess.js';
import { SF, score } from './lib/sf.mjs';
const [fen, depth = '14', mpv = '3'] = process.argv.slice(2);
let c;
try { c = new Chess(fen); } catch (e) { console.log('ILLEGAL FEN', e.message); process.exit(1); }
const sf = new SF(); await sf.init();
const lines = await sf.analyse(fen, Number(depth), Number(mpv));
for (const l of lines) {
  const cc = new Chess(fen); const sans = [];
  for (const u of l.pv.slice(0, 8)) { try { sans.push(cc.move({ from: u.slice(0,2), to: u.slice(2,4), promotion: u[4] }).san); } catch { break; } }
  console.log((l.mate !== undefined ? 'M' + l.mate : l.cp), 'd' + l.depth, sans.join(' '));
}
sf.quit(); process.exit(0);
