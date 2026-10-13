// Static exchange evaluation on top of chess.js (real legal captures, so pins and x-rays are handled).
import { Chess } from 'chess.js';
import type { Square } from 'chess.js';
import type { Side } from './types.ts';

export const PV: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 };
export const PNAME: Record<string, string> = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };
export const other = (c: Side): Side => (c === 'w' ? 'b' : 'w');

/** Same position, different side to move (no en passant). Returns null when that is not a sane position. */
export function withTurn(fen: string, turn: Side): string | null {
  const p = fen.split(' ');
  p[1] = turn;
  p[3] = '-';
  const out = p.join(' ');
  try {
    const c = new Chess(out);
    // the side NOT to move must not be in check
    const idle = other(turn);
    const king = kingSquare(c, idle);
    if (!king) return null;
    if (c.isAttacked(king as Square, turn)) return null;
    return out;
  } catch {
    return null;
  }
}

export function kingSquare(c: Chess, color: Side): string | null {
  for (const row of c.board()) for (const p of row) if (p && p.type === 'k' && p.color === color) return p.square;
  return null;
}

/**
 * Material the side to move wins by starting a capture sequence on `sq` (>= 0: it may always decline).
 * Each side recaptures with its least valuable legal capturer.
 */
export function seeGain(fen: string, sq: string, depth = 0): number {
  if (depth > 14) return 0;
  const c = new Chess(fen);
  const victim = c.get(sq as Square);
  if (!victim || victim.color === c.turn()) return 0;
  const atts = c.attackers(sq as Square, c.turn()).sort((x, y) => PV[c.get(x as Square)?.type ?? 'k'] - PV[c.get(y as Square)?.type ?? 'k']);
  for (const from of atts) {
    let ok = false;
    try {
      c.move({ from: from as Square, to: sq as Square, promotion: 'q' });
      ok = true;
    } catch {
      /* pinned: try the next attacker */
    }
    if (!ok) continue;
    const back = seeGain(c.fen(), sq, depth + 1);
    return Math.max(0, PV[victim.type] - back);
  }
  return 0;
}

/** Net result of making this exact capture: victim value minus what the opponent wins back. */
export function captureNet(fen: string, uci: { from: string; to: string; promotion?: string }): number | null {
  try {
    const c = new Chess(fen);
    const m = c.move({ from: uci.from as Square, to: uci.to as Square, promotion: uci.promotion });
    if (!m.captured) return null;
    const val = PV[m.captured];
    const back = seeGain(c.fen(), m.to);
    return val - back;
  } catch {
    return null;
  }
}

export interface SqInfo {
  sq: string;
  type: string;
  color: Side;
  attackers: string[];
  defenders: string[];
  /** what the enemy wins by capturing here when it is the enemy's move (0 = nothing) */
  danger: number;
}

/** Info for every non-king piece of `color`, evaluated with the enemy to move. Null if that position is not sane. */
export function dangerInfo(fen: string, color: Side): SqInfo[] | null {
  const enemy = other(color);
  const f = withTurn(fen, enemy);
  if (!f) return null;
  const c = new Chess(f);
  if (c.inCheck()) return null;
  const out: SqInfo[] = [];
  for (const row of c.board()) {
    for (const p of row) {
      if (!p || p.color !== color || p.type === 'k') continue;
      out.push({
        sq: p.square,
        type: p.type,
        color,
        attackers: c.attackers(p.square, enemy),
        defenders: c.attackers(p.square, color),
        danger: seeGain(f, p.square),
      });
    }
  }
  return out;
}

/** Squares of `color` pieces the enemy (to move) can win material on. */
export function winnablePieces(fen: string, color: Side): string[] | null {
  const info = dangerInfo(fen, color);
  if (!info) return null;
  return info.filter((i) => i.danger > 0).map((i) => i.sq);
}

/**
 * Independent cross-check of seeGain: full minimax over EVERY legal capture on the square (not just the
 * cheapest capturer). Slower; used to verify generated items.
 */
export function seeFull(fen: string, sq: string, depth = 0): number {
  if (depth > 7) return 0;
  const c0 = new Chess(fen);
  const victim = c0.get(sq as Square);
  if (!victim || victim.color === c0.turn()) return 0;
  const seen = new Set<string>();
  let best = 0;
  for (const from of c0.attackers(sq as Square, c0.turn())) {
    const pt = c0.get(from as Square)?.type ?? 'k';
    if (seen.has(pt)) continue;
    const d = new Chess(fen);
    try {
      d.move({ from: from as Square, to: sq as Square, promotion: 'q' });
    } catch {
      continue;
    }
    seen.add(pt);
    best = Math.max(best, PV[victim.type] - seeFull(d.fen(), sq, depth + 1));
  }
  return best;
}
