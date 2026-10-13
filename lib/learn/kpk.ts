// An exact king-and-pawn-versus-king "tablebase", solved by retrograde analysis on first use (about 100 ms).
// The Learn content uses it to verify opposition, key-square and rule-of-the-square questions exactly:
// Stockfish at modest depth cannot be trusted on those.
import { Chess } from 'chess.js';
import { KPK_B64 } from './kpk-data.ts';

const fileOf = (s: number) => s & 7;
const rankOf = (s: number) => s >> 3;
const adj = (a: number, b: number) => Math.max(Math.abs(fileOf(a) - fileOf(b)), Math.abs(rankOf(a) - rankOf(b))) <= 1;
const KING_STEPS = [-9, -8, -7, -1, 1, 7, 8, 9];
function kingMoves(from: number): number[] {
  const out: number[] = [];
  for (const d of KING_STEPS) {
    const to = from + d;
    if (to < 0 || to > 63) continue;
    if (Math.abs(fileOf(to) - fileOf(from)) > 1) continue;
    out.push(to);
  }
  return out;
}
/** squares a white pawn on `p` attacks */
function pawnAttacks(p: number): number[] {
  const out: number[] = [];
  if (rankOf(p) >= 7) return out;
  if (fileOf(p) > 0) out.push(p + 7);
  if (fileOf(p) < 7) out.push(p + 9);
  return out;
}

// index = ((wk*64 + wp)*64 + bk)*2 + stm   (stm 0 = white to move)
const idx = (wk: number, wp: number, bk: number, stm: number) => ((wk * 64 + wp) * 64 + bk) * 2 + stm;

function legal(wk: number, wp: number, bk: number, stm: number): boolean {
  if (wk === wp || wk === bk || wp === bk) return false;
  if (rankOf(wp) < 1 || rankOf(wp) > 6) return false;
  if (adj(wk, bk)) return false;
  if (stm === 0 && pawnAttacks(wp).includes(bk)) return false; // black in check with white to move
  return true;
}

function sliderAttacks(sq: number, dirs: number[][], blockers: Set<number>): Set<number> {
  const out = new Set<number>();
  for (const [df, dr] of dirs) {
    let f = fileOf(sq) + df;
    let r = rankOf(sq) + dr;
    while (f >= 0 && f < 8 && r >= 0 && r < 8) {
      const s = f + 8 * r;
      out.add(s);
      if (blockers.has(s)) break;
      f += df;
      r += dr;
    }
  }
  return out;
}
const ROOK = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const QUEEN = [...ROOK, [1, 1], [1, -1], [-1, 1], [-1, -1]];

/** After promoting on `q`, black to move: can white still win (queen, or a rook if the queen would stalemate)? */
function promotionWins(wk: number, q: number, bk: number): boolean {
  if (q === bk || q === wk) return false;
  if (adj(bk, q) && !adj(wk, q)) return false; // the new piece just gets captured
  for (const dirs of [QUEEN, ROOK]) {
    const blockers = new Set([wk, bk === -1 ? -1 : -2]);
    blockers.delete(-2);
    const att = sliderAttacks(q, dirs, new Set([wk]));
    const inCheck = att.has(bk);
    let hasMove = false;
    // attack map with the black king removed from the board (it cannot hide behind itself)
    for (const to of kingMoves(bk)) {
      if (adj(wk, to)) continue;
      if (to === wk) continue;
      if (to === q) {
        if (!adj(wk, q)) hasMove = true;
        continue;
      }
      if (att.has(to)) continue;
      hasMove = true;
      break;
    }
    // x-ray: squares behind the king on the checking line are also attacked
    if (inCheck) {
      const xr = sliderAttacks(q, dirs, new Set([wk, bk]));
      hasMove = false;
      for (const to of kingMoves(bk)) {
        if (adj(wk, to) || to === wk) continue;
        if (to === q) {
          if (!adj(wk, q)) hasMove = true;
          continue;
        }
        if (xr.has(to)) continue;
        hasMove = true;
        break;
      }
    }
    void blockers;
    if (hasMove || inCheck) return true;
  }
  return false;
}

let table: Uint8Array | null = null;

/** Retrograde analysis from scratch (a few seconds). The app ships a precomputed copy (kpk-data.ts). */
export function solve(): Uint8Array {
  const win = new Uint8Array(64 * 64 * 64 * 2);
  let changed = true;
  while (changed) {
    changed = false;
    for (let wk = 0; wk < 64; wk++) {
      for (let wp = 8; wp < 56; wp++) {
        for (let bk = 0; bk < 64; bk++) {
          // white to move
          if (legal(wk, wp, bk, 0) && !win[idx(wk, wp, bk, 0)]) {
            let w = false;
            for (const to of kingMoves(wk)) {
              if (to === wp || adj(to, bk) || to === bk) continue;
              if (win[idx(to, wp, bk, 1)]) {
                w = true;
                break;
              }
            }
            if (!w) {
              const push = wp + 8;
              if (push !== wk && push !== bk) {
                if (rankOf(push) === 7) w = promotionWins(wk, push, bk);
                else if (legal(wk, push, bk, 1) && win[idx(wk, push, bk, 1)]) w = true;
                if (!w && rankOf(wp) === 1) {
                  const p2 = wp + 16;
                  if (p2 !== wk && p2 !== bk && legal(wk, p2, bk, 1) && win[idx(wk, p2, bk, 1)]) w = true;
                }
              }
            }
            if (w) {
              win[idx(wk, wp, bk, 0)] = 1;
              changed = true;
            }
          }
          // black to move
          if (legal(wk, wp, bk, 1) && !win[idx(wk, wp, bk, 1)]) {
            const att = new Set(pawnAttacks(wp));
            const inCheck = att.has(bk);
            let anyMove = false;
            let allWin = true;
            for (const to of kingMoves(bk)) {
              if (adj(to, wk) || to === wk) continue;
              if (att.has(to)) continue;
              if (to === wp) {
                if (adj(wp, wk)) continue; // protected pawn cannot be taken
                anyMove = true;
                allWin = false; // captures the pawn: draw
                break;
              }
              anyMove = true;
              if (!win[idx(wk, wp, to, 0)]) {
                allWin = false;
                break;
              }
            }
            const v = anyMove ? allWin : inCheck;
            if (v) {
              win[idx(wk, wp, bk, 1)] = 1;
              changed = true;
            }
          }
        }
      }
    }
  }
  return win;
}

/** Precomputed table (bit-packed, base64) so that no solving happens on the phone. */
export function getTable(): Uint8Array {
  if (table) return table;
  if (KPK_B64) {
    const bin = atob(KPK_B64);
    const t = new Uint8Array(64 * 64 * 64 * 2);
    for (let i = 0; i < t.length; i++) t[i] = (bin.charCodeAt(i >> 3) >> (i & 7)) & 1;
    table = t;
    return t;
  }
  table = solve();
  return table;
}

export function packTable(t: Uint8Array): string {
  const bytes = new Uint8Array(t.length >> 3);
  for (let i = 0; i < t.length; i++) if (t[i]) bytes[i >> 3] |= 1 << (i & 7);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

const SQ = (s: string) => s.charCodeAt(0) - 97 + 8 * (Number(s[1]) - 1);

export interface Kpk {
  /** colour of the pawn */
  pawn: 'w' | 'b';
  /** the side that has the pawn gets 'win' with best play, else 'draw' */
  result: 'win' | 'draw';
  /** side to move */
  turn: 'w' | 'b';
}

/** Is this a bare K+P vs K position? */
export function isKpk(fen: string): boolean {
  const pieces = fen.split(' ')[0].replace(/[0-9/]/g, '');
  return pieces.length === 3 && /p/i.test(pieces) && (pieces.match(/k/gi) ?? []).length === 2;
}

/** Exact result of a K+P vs K position for the side with the pawn. Null when it is not such a position. */
export function kpkResult(fen: string): Kpk | null {
  if (!isKpk(fen)) return null;
  const c = new Chess(fen);
  const sq: { wk?: number; bk?: number; p?: number; pc?: 'w' | 'b' } = {};
  for (const row of c.board())
    for (const x of row) {
      if (!x) continue;
      const s = SQ(x.square);
      if (x.type === 'k') (x.color === 'w' ? (sq.wk = s) : (sq.bk = s));
      else {
        sq.p = s;
        sq.pc = x.color;
      }
    }
  if (sq.wk === undefined || sq.bk === undefined || sq.p === undefined || !sq.pc) return null;
  if (!table) table = getTable();
  // normalise so that the pawn side is "white" (flip ranks for a black pawn)
  const flip = (s: number) => fileOf(s) + 8 * (7 - rankOf(s));
  let atk = sq.pc === 'w' ? sq.wk : sq.bk; // king of the pawn side
  let def = sq.pc === 'w' ? sq.bk : sq.wk;
  let p = sq.p;
  if (sq.pc === 'b') {
    atk = flip(atk);
    def = flip(def);
    p = flip(p);
  }
  const stm = c.turn() === sq.pc ? 0 : 1;
  if (!legal(atk, p, def, stm)) return null;
  return { pawn: sq.pc, result: table[idx(atk, p, def, stm)] ? 'win' : 'draw', turn: c.turn() };
}

/** Result of the K+P vs K position after playing `san` (for the pawn side), or null. */
export function kpkAfter(fen: string, san: string): Kpk | null {
  try {
    const c = new Chess(fen);
    const m = c.move(san);
    if (m.promotion) return { pawn: m.color, result: 'win', turn: c.turn() };
    if (c.isStalemate()) return { pawn: c.turn() === 'w' ? 'b' : 'w', result: 'draw', turn: c.turn() };
    // the pawn can be captured: only K vs K is left
    if (!isKpk(c.fen())) return { pawn: m.color, result: 'draw', turn: c.turn() };
    return kpkResult(c.fen());
  } catch {
    return null;
  }
}

/** A reply by the defending side that keeps the draw after `fen` (the pawn side has just moved), as UCI. */
export function kpkDrawingReply(fen: string): string | null {
  try {
    const c = new Chess(fen);
    for (const m of c.moves({ verbose: true })) {
      const d = new Chess(fen);
      d.move(m);
      if (d.isStalemate()) return m.from + m.to;
      if (!isKpk(d.fen())) return m.from + m.to; // captured the pawn
      const r = kpkResult(d.fen());
      if (r && r.result === 'draw') return m.from + m.to;
    }
  } catch {
    /* ignore */
  }
  return null;
}

/** All SAN moves for the side to move that keep its best possible result (win for the pawn side if it wins, else draw). */
export function kpkBestMoves(fen: string): string[] | null {
  const here = kpkResult(fen);
  if (!here) return null;
  const c = new Chess(fen);
  const mover = c.turn();
  const pawnSide = here.pawn;
  const out: string[] = [];
  for (const m of c.moves({ verbose: true })) {
    const r = kpkAfter(fen, m.san);
    if (!r) continue;
    const keeps = mover === pawnSide ? (here.result === 'win' ? r.result === 'win' : true) : r.result === 'draw' || here.result === 'win';
    if (keeps) out.push(m.san);
  }
  return out;
}
