// Pure chess-analysis logic. Only depends on chess.js so it can be unit-checked from plain Node
// (see scripts/selftest.mjs). No engine, no DOM, no relative imports.
import { Chess } from 'chess.js';
import type { Move, Square } from 'chess.js';

export const VAL: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
export const MATE_BASE = 10000;

export type Col = 'w' | 'b';
export type Cls = 'b' | 'm' | 'i';
export type Phase = 'opening' | 'middlegame' | 'endgame';

export interface PosEval {
  /** White-perspective score. cp clamped to +-2500, mate encoded as +-(10000 - distance). */
  ev: number;
  best: string | null;
  pv: string[];
}

export interface MistakeInfo {
  ply: number; // 0-based index of the move in the game
  cls: Cls;
  loss: number; // win% lost (my perspective), 1 decimal
  wpBefore: number;
  played: string;
  playedSan: string;
  best: string;
  bestSan: string;
  pv: string[]; // up to 3 plies, uci, starting with best
  tags: string[];
  phase: Phase;
  clk?: number;
}

export interface GameAnalysis {
  v: 1;
  gameId: string;
  at: number;
  ms: number;
  ev: number[];
  cls: string;
  mistakes: MistakeInfo[];
  acc: number;
  nb: number;
  nm: number;
  ni: number;
  myMoves: number;
  conversion: boolean;
  maxWp: number;
  endClk?: number;
  tt: number;
}

// ---------- scores ----------

export function winPct(cp: number): number {
  return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * cp)) - 1);
}

export function isMateEv(ev: number): boolean {
  return Math.abs(ev) >= 9000;
}

/** White-perspective win% (0..100) for an encoded score. */
export function evWin(ev: number): number {
  if (isMateEv(ev)) return ev > 0 ? 100 : 0;
  return winPct(ev);
}

export function encodeScore(cp: number | undefined, mate: number | undefined): number {
  if (mate !== undefined) {
    if (mate === 0) return 0;
    return (mate > 0 ? 1 : -1) * (MATE_BASE - Math.abs(mate));
  }
  const c = cp ?? 0;
  return Math.max(-2500, Math.min(2500, Math.round(c)));
}

export function evLabel(ev: number): string {
  if (isMateEv(ev)) {
    const d = MATE_BASE - Math.abs(ev);
    return (ev > 0 ? '+' : '-') + 'M' + d;
  }
  const v = ev / 100;
  return (v > 0 ? '+' : '') + v.toFixed(1);
}

export function myWin(ev: number, color: Col): number {
  const w = evWin(ev);
  return color === 'w' ? w : 100 - w;
}

export function moveAccuracy(loss: number): number {
  const a = 103.1668 * Math.exp(-0.04354 * loss) - 3.1669;
  return Math.max(0, Math.min(100, a));
}

export function classify(loss: number): Cls | null {
  if (loss >= 20) return 'b';
  if (loss >= 10) return 'm';
  if (loss >= 5) return 'i';
  return null;
}

// ---------- helpers ----------

export function other(c: Col): Col {
  return c === 'w' ? 'b' : 'w';
}

export function tryUci(chess: Chess, uci: string): Move | null {
  if (!uci || uci.length < 4) return null;
  try {
    return chess.move({ from: uci.slice(0, 2) as Square, to: uci.slice(2, 4) as Square, promotion: uci[4] });
  } catch {
    return null;
  }
}

export function uciToSan(fen: string, uci: string): string {
  try {
    const m = tryUci(new Chess(fen), uci);
    return m ? m.san : uci;
  } catch {
    return uci;
  }
}

export function materialOf(chess: Chess, color: Col, pawns = true): number {
  let t = 0;
  for (const row of chess.board()) {
    for (const p of row) {
      if (p && p.color === color && (pawns || p.type !== 'p')) t += VAL[p.type];
    }
  }
  return t;
}

export function squaresOf(chess: Chess, color: Col): { sq: Square; type: string }[] {
  const out: { sq: Square; type: string }[] = [];
  for (const row of chess.board()) {
    for (const p of row) if (p && p.color === color) out.push({ sq: p.square, type: p.type });
  }
  return out;
}

/** Net material the mover wins with a move (victim - mover value if recapturable). Chess is the position BEFORE the move. */
export function captureGain(fenBefore: string, uci: string): number {
  try {
    const c = new Chess(fenBefore);
    const m = tryUci(c, uci);
    if (!m || !m.captured) return 0;
    const victim = VAL[m.captured];
    const recapt = c.attackers(m.to, c.turn()).length > 0; // c.turn() is now the opponent
    const mover = m.promotion ? VAL.p : VAL[m.piece];
    return victim - (recapt ? mover : 0);
  } catch {
    return 0;
  }
}

/** Material swing (for `color`) after playing up to `n` plies of a pv from fen. */
export function pvMaterialGain(fen: string, pv: string[], color: Col, n = 3): number {
  try {
    const c = new Chess(fen);
    const before = materialOf(c, color) - materialOf(c, other(color));
    let played = 0;
    for (const u of pv.slice(0, n)) {
      if (!tryUci(c, u)) break;
      played++;
    }
    if (played === 0) return 0;
    // settle on an even number of plies from mover's perspective: only count if it ended on mover's reply
    return materialOf(c, color) - materialOf(c, other(color)) - before;
  } catch {
    return 0;
  }
}

/** Is the piece that just moved (to square `to`, owned by `mover`) forking two valuable targets? Chess is after the move. */
export function isForkAfter(chess: Chess, mover: Col, to: Square): boolean {
  const piece = chess.get(to);
  if (!piece || piece.color !== mover) return false;
  const enemy = other(mover);
  let targets = 0;
  for (const t of squaresOf(chess, enemy)) {
    if (t.type === 'p') continue;
    if (!chess.attackers(t.sq, mover).includes(to)) continue;
    const defended = chess.attackers(t.sq, enemy).length > 0;
    if (t.type === 'k' || VAL[t.type] > VAL[piece.type] || !defended) targets++;
  }
  return targets >= 2;
}

/** Fork test for a (not-yet-played) move. */
export function moveForks(fenBefore: string, uci: string): boolean {
  try {
    const c = new Chess(fenBefore);
    const mover = c.turn();
    const m = tryUci(c, uci);
    if (!m) return false;
    return isForkAfter(c, mover, m.to);
  } catch {
    return false;
  }
}

/** My pieces that are "en prise": attacked and either undefended or attacked by something cheaper. */
export function hangingPieces(fen: string, color: Col): Square[] {
  const c = new Chess(fen);
  const enemy = other(color);
  const res: Square[] = [];
  for (const p of squaresOf(c, color)) {
    if (p.type === 'k') continue;
    const att = c.attackers(p.sq, enemy);
    if (att.length === 0) continue;
    const defenders = c.attackers(p.sq, color).length;
    let minAtt = 99;
    for (const a of att) {
      const pc = c.get(a);
      if (pc) minAtt = Math.min(minAtt, pc.type === 'k' ? 100 : VAL[pc.type]);
    }
    // a king can only capture an undefended piece
    const onlyKing = att.every((a) => c.get(a)?.type === 'k');
    if (defenders === 0 || (!onlyKing && minAtt < VAL[p.type])) res.push(p.sq);
  }
  return res;
}

export function phaseAt(ply: number, fen: string): Phase {
  if (ply < 20) return 'opening';
  try {
    const c = new Chess(fen);
    if (materialOf(c, 'w', false) <= 13 && materialOf(c, 'b', false) <= 13) return 'endgame';
  } catch {
    /* ignore */
  }
  return 'middlegame';
}

// ---------- PGN ----------

export interface ParsedGame {
  fens: string[]; // n+1 positions
  ucis: string[];
  sans: string[];
  colors: Col[];
  clocks: (number | null)[]; // seconds remaining after each ply
  headers: Record<string, string>;
}

export function parseHeaders(pgn: string): Record<string, string> {
  const h: Record<string, string> = {};
  const re = /^\[(\w+)\s+"(.*)"\]\s*$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(pgn))) h[m[1]] = m[2];
  return h;
}

export function parseClocks(pgn: string): number[] {
  const out: number[] = [];
  const re = /\[%clk\s+(\d+):(\d+):(\d+(?:\.\d+)?)\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(pgn))) out.push(Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]));
  return out;
}

export function parseGame(pgn: string): ParsedGame | null {
  try {
    const c = new Chess();
    c.loadPgn(pgn);
    const hist = c.history({ verbose: true });
    if (hist.length === 0) return null;
    const clocksAll = parseClocks(pgn);
    const clocks = hist.map((_, i) => (clocksAll.length === hist.length ? clocksAll[i] : null));
    const fens = [hist[0].before, ...hist.map((m) => m.after)];
    return {
      fens,
      ucis: hist.map((m) => m.from + m.to + (m.promotion ?? '')),
      sans: hist.map((m) => m.san),
      colors: hist.map((m) => m.color),
      clocks,
      headers: parseHeaders(pgn),
    };
  } catch {
    return null;
  }
}

export function parseTimeControl(tc: string | undefined): { base: number; inc: number } {
  if (!tc) return { base: 0, inc: 0 };
  const m = tc.match(/^(\d+)(?:\+(\d+))?$/);
  if (m) return { base: Number(m[1]), inc: Number(m[2] ?? 0) };
  return { base: 0, inc: 0 };
}

export function openingFromUrl(url: string | undefined): string {
  if (!url) return '';
  const slug = url.split('/').pop() ?? '';
  const toks = slug.split('-');
  const keep: string[] = [];
  for (const t of toks) {
    if (/^\d/.test(t)) break;
    keep.push(t);
  }
  return keep.join(' ');
}

export function openingFamily(name: string): string {
  if (!name) return 'Unknown';
  const toks = name.split(' ');
  const i = toks.findIndex((t) => /^(Defense|Defence|Opening|Game|Gambit|Attack|System)$/.test(t));
  if (i >= 0) return toks.slice(0, i + 1).join(' ');
  return toks.slice(0, 3).join(' ');
}

// ---------- classification ----------

export interface ClassifyInput {
  gameId: string;
  parsed: ParsedGame;
  evals: PosEval[]; // n+1
  myColor: Col;
  base: number;
  result: 'win' | 'loss' | 'draw';
  ms: number;
}

export function classifyGame(inp: ClassifyInput): GameAnalysis {
  const { parsed, evals, myColor, base } = inp;
  const n = parsed.ucis.length;
  const sign = myColor === 'w' ? 1 : -1;
  let cls = '';
  const mistakes: MistakeInfo[] = [];
  let accSum = 0;
  let myMoves = 0;
  let nb = 0;
  let nm = 0;
  let ni = 0;
  let tt = 0;
  let maxWp = 0;
  let endClk: number | undefined;

  for (let i = 0; i <= n; i++) maxWp = i >= 8 ? Math.max(maxWp, myWin(evals[i].ev, myColor)) : maxWp;

  for (let i = 0; i < n; i++) {
    if (parsed.colors[i] !== myColor) {
      cls += '.';
      continue;
    }
    myMoves++;
    const clk = parsed.clocks[i];
    if (clk !== null) endClk = clk;
    const e0 = evals[i];
    const e1 = evals[i + 1];
    const wpB = myWin(e0.ev, myColor);
    const wpA = myWin(e1.ev, myColor);
    const played = parsed.ucis[i];
    let loss = Math.max(0, wpB - wpA);
    if (e0.best && played === e0.best) loss = 0;
    accSum += moveAccuracy(loss);
    const k = classify(loss);
    if (!k) {
      cls += '.';
      continue;
    }
    cls += k;
    if (k === 'b') nb++;
    else if (k === 'm') nm++;
    else ni++;
    const fen0 = parsed.fens[i];
    const phase = phaseAt(i, fen0);
    const best = e0.best ?? played;
    const info: MistakeInfo = {
      ply: i,
      cls: k,
      loss: Math.round(loss * 10) / 10,
      wpBefore: Math.round(wpB * 10) / 10,
      played,
      playedSan: parsed.sans[i],
      best,
      bestSan: uciToSan(fen0, best),
      pv: e0.pv.slice(0, 3),
      tags: [],
      phase,
    };
    if (clk !== null) info.clk = Math.round(clk);
    if (k !== 'i') {
      info.tags = tagMistake({
        fen0,
        fen1: parsed.fens[i + 1],
        e0,
        e1,
        played,
        myColor,
        sign,
        wpB,
        clk,
        base,
      });
      if (info.tags.includes('time_trouble')) tt++;
    }
    mistakes.push(info);
  }

  return {
    v: 1,
    gameId: inp.gameId,
    at: Date.now(),
    ms: inp.ms,
    ev: evals.map((e) => e.ev),
    cls,
    mistakes,
    acc: myMoves ? Math.round((accSum / myMoves) * 10) / 10 : 0,
    nb,
    nm,
    ni,
    myMoves,
    conversion: maxWp >= 85 && inp.result !== 'win',
    maxWp: Math.round(maxWp),
    endClk: endClk !== undefined ? Math.round(endClk) : undefined,
    tt,
  };
}

export function tagMistake(a: {
  fen0: string;
  fen1: string;
  e0: PosEval;
  e1: PosEval;
  played: string;
  myColor: Col;
  sign: number;
  wpB: number;
  clk: number | null;
  base: number;
}): string[] {
  const tags: string[] = [];
  const { e0, e1, myColor, sign } = a;
  const best = e0.best;
  // mates
  if (e0.ev * sign >= 9000 && e1.ev * sign < 9000) tags.push('missed_mate');
  if (e1.ev * sign <= -9000 && e0.ev * sign > -9000) tags.push('allowed_mate');
  // hung piece: the opponent's best reply wins material outright
  const reply = e1.best;
  if (reply && captureGain(a.fen1, reply) >= 1) tags.push('hung_piece');
  // missed win of material
  if (best && best !== a.played) {
    const gain = pvMaterialGain(a.fen0, e0.pv, myColor, 3);
    if (gain >= 2 || captureGain(a.fen0, best) >= 2) tags.push('missed_win');
  }
  // forks (allowed or missed)
  let fork = false;
  if (reply) {
    try {
      const c = new Chess(a.fen1);
      const m = tryUci(c, reply);
      if (m && isForkAfter(c, other(myColor), m.to)) fork = true;
    } catch {
      /* ignore */
    }
  }
  if (!fork && best && best !== a.played && moveForks(a.fen0, best)) fork = true;
  if (fork) tags.push('fork');
  // time trouble
  if (a.clk !== null && a.base > 0 && (a.clk < 0.15 * a.base || a.clk < 60)) tags.push('time_trouble');
  // squandered a winning position
  if (a.wpB >= 85) tags.push('conversion');
  return tags;
}

export const TAG_INFO: Record<string, { label: string; blurb: string }> = {
  hung_piece: { label: 'Hanging pieces', blurb: 'Leaving a piece to be captured for free.' },
  missed_win: { label: 'Missed wins', blurb: 'Not taking material or a tactic that was there.' },
  missed_mate: { label: 'Missed mates', blurb: 'A checkmate was on the board.' },
  allowed_mate: { label: 'Allowed mates', blurb: 'Moves that let the opponent mate you.' },
  fork: { label: 'Forks', blurb: 'Double attacks - given or missed.' },
  time_trouble: { label: 'Time trouble', blurb: 'Mistakes made on a low clock.' },
  conversion: { label: 'Converting wins', blurb: 'Throwing away a winning position.' },
};

export const WHY_OPTIONS: { id: string; label: string }[] = [
  { id: 'rushed', label: 'Rushed' },
  { id: 'threat', label: "Didn't see their threat" },
  { id: 'tactic', label: "Didn't see my tactic" },
  { id: 'misjudged', label: 'Misjudged position' },
  { id: 'time', label: 'Low on time' },
];
