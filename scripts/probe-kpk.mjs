// Dev helper: node scripts/probe-kpk.mjs file     lines: label | fen     -> exact K+P v K result and the moves that keep it
import { readFileSync } from 'node:fs';
import { kpkBestMoves, kpkResult } from '../lib/learn/kpk.ts';

const rows = readFileSync(process.argv[2], 'utf8')
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith('#'))
  .map((l) => l.split('|').map((x) => x.trim()));
for (const [label, fen] of rows) {
  const r = kpkResult(fen);
  if (!r) {
    console.log(label + ': not a legal K+P v K position');
    continue;
  }
  console.log(`${label}: ${r.turn} to move, pawn side (${r.pawn}) ${r.result.toUpperCase()}; moves keeping it: ${(kpkBestMoves(fen) ?? []).join(' ')}`);
}
