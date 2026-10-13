// Stockfish for Node: the npm package ships a CommonJS wrapper around the lite single-threaded WASM build.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

export class SF {
  constructor(kind = 'lite-single') {
    this.waiters = [];
    this.buf = [];
    this.sf = require('stockfish')(kind, (line) => {
      for (const w of this.waiters.slice()) w(String(line));
    });
  }
  send(cmd) {
    this.sf.processCommand(cmd);
  }
  async init() {
    await this.wait((l) => l.startsWith('uciok'), 'uci');
    this.send('setoption name Hash value 64');
    await this.wait((l) => l.startsWith('readyok'), 'isready');
  }
  wait(pred, cmd) {
    return new Promise((resolve) => {
      const w = (l) => {
        if (pred(l)) {
          this.waiters = this.waiters.filter((x) => x !== w);
          resolve(l);
        }
      };
      this.waiters.push(w);
      if (cmd) this.send(cmd);
    });
  }
  /** Analyse a FEN to a fixed depth with N principal variations. Scores are from the side to move. */
  async analyse(fen, depth = 14, multipv = 1, searchmoves) {
    // a clean slate for every search keeps results reproducible (no stale hash between unrelated positions)
    this.send('ucinewgame');
    await this.wait((l) => l.startsWith('readyok'), 'isready');
    this.send('setoption name MultiPV value ' + multipv);
    this.send('position fen ' + fen);
    const lines = new Map();
    const collect = (l) => {
      if (!l.startsWith('info') || !l.includes(' score ') || !l.includes(' pv ')) return;
      if (/ (lowerbound|upperbound)/.test(l)) return;
      const idx = Number(/ multipv (\d+)/.exec(l)?.[1] ?? 1);
      const d = Number(/ depth (\d+)/.exec(l)?.[1] ?? 0);
      const sc = / score (cp|mate) (-?\d+)/.exec(l);
      if (!sc) return;
      lines.set(idx, { depth: d, cp: sc[1] === 'cp' ? Number(sc[2]) : undefined, mate: sc[1] === 'mate' ? Number(sc[2]) : undefined, pv: l.split(' pv ')[1].trim().split(/\s+/) });
    };
    this.waiters.push(collect);
    await this.wait((l) => l.startsWith('bestmove'), `go depth ${depth}${searchmoves && searchmoves.length ? " searchmoves " + searchmoves.join(" ") : ""}`);
    this.waiters = this.waiters.filter((x) => x !== collect);
    return [...lines.entries()].sort((a, b) => a[0] - b[0]).map((e) => e[1]);
  }
  quit() {
    try {
      this.sf.terminate();
    } catch {
      /* ignore */
    }
  }
}

/** Convert to a single comparable number (centipawns, side to move); mates become +-(100000 - |n|). */
export function score(line) {
  if (!line) return 0;
  if (line.mate !== undefined) return (line.mate > 0 ? 1 : -1) * (100000 - Math.abs(line.mate));
  return line.cp;
}
