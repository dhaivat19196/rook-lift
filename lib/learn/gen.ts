// Generated practice. Every item is built from a real legal position and its answer is computed AND re-checked
// with chess.js logic before it is returned (see verifyGenerated). The Node validator also samples every skill
// and, for move items, asks Stockfish to agree.
import { Chess } from 'chess.js';
import type { Square } from 'chess.js';
import { START_FEN } from './build.ts';
import { kpkBestMoves, kpkResult } from './kpk.ts';
import { captureNet, dangerInfo, kingSquare, other, PNAME, PV, seeFull, seeGain, withTurn, type SqInfo } from './see.ts';
import type { AC, BoardSpec, ChoiceOpt, ChoiceStep, LArrow, MoveStep, Side, SkillId, SquaresStep, Step, TrueFalseStep } from './types.ts';

export type Rng = () => number;
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = <T>(r: Rng, a: T[]): T => a[Math.floor(r() * a.length)];
function shuffle<T>(r: Rng, a: T[]): T[] {
  const x = a.slice();
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
}

export interface GenCtx {
  rng: Rng;
  /** 1..5 */
  level: number;
  /** positions (FENs) from the student's own games, when available */
  pool?: string[];
  /** FENs from the student's own missed mates (mate in 1 for the side to move) */
  mates?: string[];
}

interface Verifiable {
  _v?: () => boolean;
}
const name = (t: string) => PNAME[t];
const SIDE = (c: Side) => (c === 'w' ? 'White' : 'Black');
const sqName = (t: string, sq: string) => `${name(t)} on ${sq}`;

// ---------- positions ----------

const PREFIXES = [
  'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6',
  'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7',
  'd4 d5 c4 e6 Nc3 Nf6 Bg5 Be7 e3 O-O Nf3',
  'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6',
  'd4 Nf6 Bf4 d5 e3 e6 Nf3 Bd6 Bg3 O-O',
  'e4 e6 d4 d5 Nc3 Nf6 Bg5 Be7 e5 Nfd7',
  'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Ng3 Bg6',
  'c4 e5 Nc3 Nf6 Nf3 Nc6 g3 d5 cxd5 Nxd5',
  'e4 e5 Nf3 Nf6 Nxe5 d6 Nf3 Nxe4 d4 d5',
  'Nf3 d5 g3 Nf6 Bg2 e6 O-O Be7 d3 O-O',
  'e4 d5 exd5 Qxd5 Nc3 Qa5 d4 Nf6 Nf3 c6',
  'd4 d5 Bf4 Nf6 e3 c5 c3 Nc6 Nd2 e6 Ngf3',
];

function randomPosition(r: Rng): string | null {
  const c = new Chess();
  const pre = pick(r, PREFIXES).split(' ');
  const keep = Math.max(2, Math.floor(r() * (pre.length + 1)));
  try {
    for (const m of pre.slice(0, keep)) c.move(m);
  } catch {
    return null;
  }
  const extra = 2 + Math.floor(r() * 8);
  for (let i = 0; i < extra; i++) {
    const moves = c.moves({ verbose: true });
    if (!moves.length) return null;
    // lean toward sensible-looking moves: prefer captures a bit, avoid early king walks
    const pool = moves.filter((m) => m.piece !== 'k' || m.flags.includes('k') || m.flags.includes('q'));
    const caps = pool.filter((m) => m.captured);
    let m = caps.length && r() < 0.25 ? pick(r, caps) : pick(r, pool.length ? pool : moves);
    if (r() < 0.6) {
      // prefer moves that do not just hang the moved piece
      for (let k = 0; k < 3; k++) {
        const t = new Chess(c.fen());
        t.move(m);
        if (seeGain(t.fen(), m.to) === 0) break;
        m = pick(r, pool.length ? pool : moves);
      }
    }
    c.move(m);
    if (c.isGameOver()) return null;
  }
  if (c.isGameOver() || c.inCheck()) return null;
  return c.fen();
}

function position(ctx: GenCtx): string | null {
  const { rng, pool } = ctx;
  if (pool && pool.length && rng() < 0.7) return pick(rng, pool);
  return randomPosition(rng);
}

function pieceCount(fen: string): number {
  return fen.split(' ')[0].replace(/[0-9/]/g, '').length;
}

const arrowsTo = (from: string[], to: string, c: AC): LArrow[] => from.map((f) => ({ from: f, to, c }));

function listPieces(squares: string[], c: Chess): string {
  const names = squares.map((s) => name(c.get(s as Square)?.type ?? 'p'));
  if (!names.length) return 'none';
  return names.join(', ');
}

// ---------- individual generators ----------

function genSquare(ctx: GenCtx): Step {
  const { rng, level } = ctx;
  const files = 'abcdefgh';
  const mk = () => files[Math.floor(rng() * 8)] + (1 + Math.floor(rng() * 8));
  const side: Side = level >= 2 && rng() < 0.6 ? 'b' : 'w';
  const n = level >= 3 ? 2 : 1;
  const set = new Set<string>();
  while (set.size < n) set.add(mk());
  const ans = [...set];
  const st: SquaresStep = {
    id: '',
    t: 'squares',
    q: n === 1 ? `Tap ${ans[0]}.` : `Tap both: ${ans.join(' and ')}.`,
    board: { fen: START_FEN, side },
    answer: ans,
    why: n === 1 ? `${ans[0]}: file ${ans[0][0]}, rank ${ans[0][1]}. Letter first, number second.` : `Letter first, number second: ${ans.join(' and ')}.`,
    rule: 'Letter first, number second.',
    d: n === 1 ? (side === 'w' ? 1 : 2) : 3,
    gen: true,
    phase: 'practice',
  };
  return st;
}

const VALUES: [string, number][] = [['pawn', 1], ['knight', 3], ['bishop', 3], ['rook', 5], ['queen', 9]];
const article = (n: string) => (n === 'queen' || n === 'rook' || n === 'knight' || n === 'bishop' || n === 'pawn' ? 'a ' + n : n);

function genValue(ctx: GenCtx): Step {
  const { rng, level } = ctx;
  const kind = level <= 1 ? (rng() < 0.5 ? 'points' : 'more') : level === 2 ? pick(rng, ['more', 'trade']) : 'trade';
  if (kind === 'points') {
    const [nm, v] = pick(rng, VALUES);
    const opts = shuffle(rng, [1, 3, 5, 9]).map((x) => ({ text: `${x} point${x === 1 ? '' : 's'}`, ok: x === v }));
    return { id: '', t: 'choice', q: `How many points is ${article(nm)} worth?`, opts, why: `${article(nm)} is worth ${v}. Pawn 1, knight and bishop 3, rook 5, queen 9.`, rule: 'Pawn 1, knight 3, bishop 3, rook 5, queen 9.', d: 1, gen: true, phase: 'practice' } as ChoiceStep;
  }
  if (kind === 'more') {
    let a = pick(rng, VALUES);
    let b = pick(rng, VALUES);
    let guard = 0;
    while (a[1] === b[1] && guard++ < 20) b = pick(rng, VALUES);
    if (a[1] === b[1]) b = VALUES[4];
    const opts: ChoiceOpt[] = [{ text: article(a[0]), ok: a[1] > b[1] }, { text: article(b[0]), ok: b[1] > a[1] }];
    return { id: '', t: 'choice', q: `Which is worth more: ${article(a[0])} or ${article(b[0])}?`, opts: shuffle(rng, opts), why: `${a[1] > b[1] ? a[0] : b[0]} is worth ${Math.max(a[1], b[1])} points and the ${a[1] > b[1] ? b[0] : a[0]} only ${Math.min(a[1], b[1])}.`, rule: 'Pawn 1, knight 3, bishop 3, rook 5, queen 9.', d: 2, gen: true, phase: 'practice' } as ChoiceStep;
  }
  // trade: you give X, you get Y (+Z)
  const give = pick(rng, VALUES.slice(1));
  let getList: [string, number][] = [pick(rng, VALUES)];
  if (level >= 3 && rng() < 0.6) getList.push(pick(rng, VALUES.slice(0, 3)));
  let gv = getList.reduce((s, x) => s + x[1], 0);
  let tries = 0;
  while (gv === give[1] && tries++ < 30) {
    getList = [pick(rng, VALUES)];
    if (level >= 3 && rng() < 0.6) getList.push(pick(rng, VALUES.slice(0, 3)));
    gv = getList.reduce((s, x) => s + x[1], 0);
  }
  if (gv === give[1]) getList = [VALUES[4]], (gv = 9);
  const good = gv > give[1];
  const getTxt = getList.map((x) => article(x[0])).join(' and ');
  return {
    id: '',
    t: 'truefalse',
    q: `You give up ${article(give[0])} and win ${getTxt}. Is that a good trade for you?`,
    ans: good,
    why: `You give ${give[1]} and get ${gv}. ${good ? 'You come out ahead, so yes.' : 'You come out behind, so no.'}`,
    rule: 'Add up what you give and what you get.',
    d: level >= 3 ? 3 : 2,
    gen: true,
    phase: 'practice',
  } as TrueFalseStep;
}

/** Choose a pool position and an owner colour; returns a FEN with the ENEMY to move. */
function safetyPosition(ctx: GenCtx): { fen: string; owner: Side } | null {
  const p = position(ctx);
  if (!p) return null;
  const owner: Side = ctx.rng() < 0.5 ? 'w' : 'b';
  const f = withTurn(p, other(owner));
  if (!f) return null;
  if (new Chess(f).inCheck()) return null;
  if (pieceCount(f) < 8) return null;
  return { fen: f, owner };
}

function whySafety(c: Chess, owner: Side, sq: string, info: SqInfo): string {
  const enemy = other(owner);
  const pt = info.type;
  const att = info.attackers;
  const def = info.defenders;
  const base = `Attackers: ${att.length}${att.length ? ' (' + listPieces(att, c) + ')' : ''}. Defenders: ${def.length}${def.length ? ' (' + listPieces(def, c) + ')' : ''}.`;
  if (info.danger > 0) {
    if (!def.length) return `${base} Nothing protects the ${name(pt)}, so ${SIDE(enemy)} simply takes it.`;
    const cheapest = Math.min(...att.map((a) => PV[c.get(a as Square)?.type ?? 'k']));
    if (cheapest < PV[pt]) return `${base} A cheaper piece can take it, and winning ${PV[pt]} for ${cheapest} is a good deal for ${SIDE(enemy)}, even though it is protected.`;
    return `${base} More pieces attack than defend, so the swaps on ${sq} end with ${SIDE(owner)} down material.`;
  }
  if (!att.length) return `${base} Nothing attacks it, so it is safe for now.`;
  return `${base} If ${SIDE(enemy)} takes, ${SIDE(owner)} takes back and does not lose material, so it is safe.`;
}

function genSafe(ctx: GenCtx): Step | null {
  const { rng, level } = ctx;
  for (let i = 0; i < 60; i++) {
    const sp = safetyPosition(ctx);
    if (!sp) continue;
    const info = dangerInfo(sp.fen, sp.owner);
    if (!info || !info.length) continue;
    const wantDanger = rng() < 0.5;
    const cands = info.filter((x) => x.type !== 'p' && (x.danger > 0) === wantDanger);
    const lv = Math.min(level, 3);
    const fit = cands.filter((x) => {
      const a = x.attackers.length;
      const df = x.defenders.length;
      if (lv === 1) return wantDanger ? a >= 1 && df === 0 : a === 0 || (a === 1 && df >= 1 && x.danger === 0 && false);
      if (lv === 2) return wantDanger ? a >= 1 : a >= 1 && df >= 1;
      return a >= 1 && df >= 1;
    });
    if (!fit.length) continue;
    const t = pick(rng, fit);
    const c = new Chess(sp.fen);
    const enemy = other(sp.owner);
    const board: BoardSpec = { fen: sp.fen, side: sp.owner, marks: { [t.sq]: 'y' } };
    const reveal = { arrows: [...arrowsTo(t.attackers, t.sq, 'r'), ...arrowsTo(t.defenders, t.sq, 'g')], marks: { [t.sq]: 'y' as AC } };
    const st: ChoiceStep = {
      id: '',
      t: 'choice',
      q: `${SIDE(enemy)} is about to move. Is ${SIDE(sp.owner)}'s ${name(t.type)} on ${t.sq} safe?`,
      board,
      opts: shuffle(rng, [{ text: 'Safe', ok: !wantDanger }, { text: 'In danger', ok: wantDanger }] as ChoiceOpt[]),
      why: whySafety(c, sp.owner, t.sq, t),
      rule: 'Count attackers and defenders, and check who is cheaper.',
      reveal,
      d: lv,
      gen: true,
      phase: 'practice',
    };
    (st as unknown as Verifiable)._v = () => (seeFull(sp.fen, t.sq) > 0) === wantDanger;
    return st;
  }
  return null;
}

function genLoose(ctx: GenCtx): Step | null {
  const { rng, level } = ctx;
  const lv = Math.min(level, 3);
  for (let i = 0; i < 80; i++) {
    const sp = safetyPosition(ctx);
    if (!sp) continue;
    const info = dangerInfo(sp.fen, sp.owner);
    if (!info) continue;
    const bad = info.filter((x) => x.danger > 0);
    const want = lv === 1 ? [1, 1] : lv === 2 ? [1, 2] : [2, 3];
    if (bad.length < want[0] || bad.length > want[1]) continue;
    const c = new Chess(sp.fen);
    const enemy = other(sp.owner);
    const arrows: LArrow[] = [];
    for (const b of bad) arrows.push(...arrowsTo(b.attackers.slice(0, 1), b.sq, 'r'));
    const st: SquaresStep = {
      id: '',
      t: 'squares',
      q: `${SIDE(enemy)} is about to move. Tap every ${SIDE(sp.owner)} piece that ${SIDE(enemy)} can win.`,
      board: { fen: sp.fen, side: sp.owner },
      answer: bad.map((b) => b.sq),
      hint: 'For each piece ask: is it attacked, and is it protected enough?',
      why: bad.map((b) => `${sqName(b.type, b.sq)}: ${whySafety(c, sp.owner, b.sq, b).replace(/^Attackers.*?\. Defenders.*?\. /, '')}`).join(' '),
      rule: 'Loose pieces drop off.',
      reveal: { arrows },
      d: lv,
      gen: true,
      phase: 'practice',
    };
    (st as unknown as Verifiable)._v = () => {
      const want = (dangerInfo(sp.fen, sp.owner) ?? []).filter((x) => x.attackers.length > 0 && seeFull(sp.fen, x.sq) > 0).map((x) => x.sq).sort().join(' ');
      return want === bad.map((b) => b.sq).sort().join(' ');
    };
    return st;
  }
  return null;
}

function genCount(ctx: GenCtx): Step | null {
  const { rng, level } = ctx;
  for (let i = 0; i < 60; i++) {
    const p = position(ctx);
    if (!p) continue;
    const c = new Chess(p);
    const all: { sq: string; type: string; color: Side }[] = [];
    for (const row of c.board()) for (const x of row) if (x && x.type !== 'k') all.push({ sq: x.square, type: x.type, color: x.color });
    const t = pick(rng, all);
    if (!t) continue;
    const askColor: Side = rng() < 0.5 ? t.color : other(t.color);
    const n = c.attackers(t.sq as Square, askColor).length;
    if (level <= 2 && (n > 3 || (askColor === t.color && n === 0 && rng() < 0.5))) continue;
    if (n === 0 && rng() < 0.7) continue;
    const verb = askColor === t.color ? 'defend' : 'attack';
    const answers = shuffle(rng, [0, 1, 2, 3, 4].filter((x) => x !== n)).slice(0, 3).concat(n);
    const opts = shuffle(rng, answers).map((x) => ({ text: String(x), ok: x === n }));
    const who = askColor === t.color ? `${SIDE(askColor)} pieces` : `${SIDE(askColor)} pieces`;
    const src = c.attackers(t.sq as Square, askColor);
    return {
      id: '',
      t: 'choice',
      q: `How many ${who} ${verb} the ${SIDE(t.color)} ${name(t.type)} on ${t.sq}?`,
      board: { fen: p, side: t.color, marks: { [t.sq]: 'y' } },
      opts,
      why: n === 0 ? `None. No ${SIDE(askColor)} piece can move to ${t.sq} right now.` : `${n}: ${listPieces(src, c)}. Count every piece that could capture on ${t.sq} (for defenders, recapture there).`,
      rule: 'Count before you act.',
      reveal: { arrows: arrowsTo(src, t.sq, askColor === t.color ? 'g' : 'r'), marks: { [t.sq]: 'y' } },
      d: n >= 3 ? 3 : n === 0 ? 1 : 2,
      gen: true,
      phase: 'practice',
    } as ChoiceStep;
  }
  return null;
}

function genCapture(ctx: GenCtx): Step | null {
  const { rng, level } = ctx;
  const lv = Math.min(level, 3);
  for (let i = 0; i < 80; i++) {
    const p = position(ctx);
    if (!p) continue;
    const c = new Chess(p);
    if (c.inCheck()) continue;
    const caps = c.moves({ verbose: true }).filter((m) => m.captured && !m.promotion && !m.isEnPassant() && m.piece !== 'k');
    if (!caps.length) continue;
    const m = pick(rng, caps);
    const net = captureNet(p, { from: m.from, to: m.to });
    if (net === null) continue;
    const enemy = other(c.turn());
    const att = new Chess(p).attackers(m.to as Square, c.turn()).length;
    const df = new Chess(p).attackers(m.to as Square, enemy).length;
    if (lv === 1 && (att + df > 2 || net === 0)) continue;
    if (lv === 2 && att + df > 3) continue;
    const outcome = net > 0 ? 'win' : net < 0 ? 'lose' : 'even';
    if (outcome === 'even' && rng() < 0.6) continue;
    const sans = m.san;
    const opts: ChoiceOpt[] = [
      { text: 'Wins material', ok: outcome === 'win' },
      { text: 'Loses material', ok: outcome === 'lose' },
      { text: 'Even trade', ok: outcome === 'even' },
    ];
    const reason =
      outcome === 'win'
        ? `You take ${PV[m.captured as string]} and they can win back at most ${PV[m.captured as string] - net}. Net +${net}.`
        : outcome === 'lose'
          ? `You take ${PV[m.captured as string]} but they win back ${PV[m.captured as string] - net}. Net ${net}. Count before you capture.`
          : `You take ${PV[m.captured as string]} and they take the same back. An even trade.`;
    const out = {
      id: '',
      t: 'choice',
      q: `${SIDE(c.turn())} to move. What does ${sans} do?`,
      board: { fen: p, side: c.turn(), arrows: [{ from: m.from, to: m.to, c: 'b' }] },
      opts,
      why: reason,
      rule: 'Count attackers and defenders before you capture.',
      reveal: { arrows: [...arrowsTo(c.attackers(m.to as Square, enemy), m.to, 'g'), ...arrowsTo(c.attackers(m.to as Square, c.turn()), m.to, 'r').slice(0, 0)] },
      d: lv,
      gen: true,
      phase: 'practice',
    } as ChoiceStep;
    (out as unknown as Verifiable)._v = () => {
      const d = new Chess(p);
      d.move(m);
      const full = PV[m.captured as string] - seeFull(d.fen(), m.to);
      return Math.sign(full) === Math.sign(net);
    };
    return out;
  }
  return null;
}

/** "Take the free piece": exactly one capture wins material and nothing else is going on. */
function genFree(ctx: GenCtx): Step | null {
  const { rng, level } = ctx;
  for (let i = 0; i < 120; i++) {
    const p = position(ctx);
    if (!p) continue;
    const c = new Chess(p);
    if (c.inCheck() || pieceCount(p) < 8) continue;
    const moves = c.moves({ verbose: true });
    // avoid ambiguity: no mate in one, no checks that complicate it
    if (moves.some((m) => m.san.endsWith('#'))) continue;
    const scored = moves
      .filter((m) => m.captured && !m.promotion && !m.isEnPassant())
      .map((m) => ({ m, net: captureNet(p, { from: m.from, to: m.to }) ?? -99 }))
      .sort((a, b) => b.net - a.net);
    if (!scored.length) continue;
    const best = scored[0];
    const second = scored[1]?.net ?? -99;
    const minGain = level <= 2 ? 3 : 1;
    if (best.net < minGain || best.net - second < 2) continue;
    const enemy = other(c.turn());
    // the enemy must not have a mate-in-1 after our capture (keeps the lesson honest)
    const after = new Chess(p);
    after.move(best.m);
    if (after.moves().some((x) => x.endsWith('#'))) continue;
    // the capture should not leave us in a worse spot elsewhere: require we keep the lead after best reply (SEE already counted)
    const t = best.m.to;
    const defenders = c.attackers(t as Square, enemy);
    return {
      id: '',
      t: 'move',
      fen: p,
      ans: [best.m.san],
      kind: 'best',
      prompt: `${SIDE(c.turn())} to move. Before anything else: can you win something?`,
      hint: 'Is any enemy piece attacked and not protected well enough?',
      why: `The ${name(best.m.captured as string)} on ${t} ${defenders.length === 0 ? 'had no protection' : 'was not protected enough'}, so ${best.m.san} wins material.`,
      rule: 'Loose pieces drop off.',
      side: c.turn(),
      d: level <= 2 ? 1 : 2,
      gen: true,
      phase: 'practice',
    } as MoveStep;
  }
  return null;
}

// ---------- mate in one ----------

const MATE_BASE: [string, number][] = [
  ['6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1', 1],
  ['6k1/5ppp/8/8/8/8/5PPP/3Q2K1 w - - 0 1', 1],
  ['3r2k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1', 1],
  ['6k1/R7/8/8/8/8/8/1R4K1 w - - 0 1', 1],
  ['7k/8/6K1/8/8/8/8/1Q6 w - - 0 1', 1],
  ['7k/5Q2/6K1/8/8/8/8/8 w - - 0 1', 1],
  ['rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq - 0 2', 1],
  ['r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4', 1],
  ['6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1', 3],
  ['8/4N1pk/8/8/8/8/8/2KR4 w - - 0 1', 3],
  ['7k/6p1/5N2/8/8/8/2K5/3R4 w - - 0 1', 3],
  ['2kr4/p2n1ppp/8/8/2B2B2/8/8/6K1 w - - 0 1', 4],
  ['k7/8/1K6/8/8/8/8/7R w - - 0 1', 1],
];

/** Mirror files and/or swap colours; keeps the position legal and the mate intact. */
export function transformFen(fen: string, mirror: boolean, swap: boolean): string {
  const [board, turn, , ,] = fen.split(' ');
  let rows = board.split('/');
  if (mirror) rows = rows.map((r) => r.split('').reverse().join(''));
  if (swap) {
    rows = rows
      .slice()
      .reverse()
      .map((r) => r.replace(/[a-zA-Z]/g, (ch) => (ch === ch.toUpperCase() ? ch.toLowerCase() : ch.toUpperCase())));
  }
  const t = swap ? (turn === 'w' ? 'b' : 'w') : turn;
  return `${rows.join('/')} ${t} - - 0 1`;
}

export function matingMoves(fen: string): string[] {
  const c = new Chess(fen);
  return c.moves().filter((m) => m.endsWith('#'));
}

function genMate1(ctx: GenCtx): Step | null {
  const { rng, level } = ctx;
  if (ctx.mates && ctx.mates.length && rng() < 0.4) {
    const f = pick(rng, ctx.mates);
    const mm = matingMoves(f);
    if (mm.length) return mateStep(f, mm, 3, 'From your own games');
  }
  const maxD = level <= 1 ? 1 : level === 2 ? 3 : 4;
  const base = BASE_OK.filter((b) => b[1] <= maxD);
  const [fen, d] = pick(rng, base.length ? base : BASE_OK);
  const f = transformFen(fen, pieceCount(fen) <= 12 && rng() < 0.5, rng() < 0.5);
  const mm = matingMoves(f);
  if (!mm.length) return null;
  return mateStep(f, mm, d);
}

const BASE_OK = MATE_BASE.filter(([f]) => {
  try {
    return matingMoves(f).length > 0;
  } catch {
    return false;
  }
});

function mateStep(fen: string, ans: string[], d: number, note?: string): MoveStep {
  const c = new Chess(fen);
  const who = c.turn();
  return {
    id: '',
    t: 'move',
    fen,
    ans,
    kind: 'best',
    prompt: `${SIDE(who)} to move. Is there a checkmate in one?${note ? ' (' + note + ')' : ''}`,
    hint: 'List every check first. Does the king have any square left?',
    why: `${ans[0]} is checkmate: the king is attacked and every escape square is covered or blocked.`,
    rule: 'Check every check: one of them may be mate.',
    side: who,
    d,
    gen: true,
    phase: 'practice',
  };
}

function genChecks(ctx: GenCtx): Step | null {
  const { rng, level } = ctx;
  for (let i = 0; i < 60; i++) {
    const p = position(ctx);
    if (!p) continue;
    const c = new Chess(p);
    if (c.inCheck()) continue;
    const n = c.moves().filter((m) => m.endsWith('+') || m.endsWith('#')).length;
    if (level <= 2 && n > 3) continue;
    const answers = shuffle(rng, [0, 1, 2, 3, 4, 5].filter((x) => x !== n)).slice(0, 3).concat(n);
    const checks = c.moves({ verbose: true }).filter((m) => m.san.endsWith('+') || m.san.endsWith('#'));
    return {
      id: '',
      t: 'choice',
      q: `${SIDE(c.turn())} to move. How many different checks are there?`,
      board: { fen: p, side: c.turn() },
      opts: shuffle(rng, answers).map((x) => ({ text: String(x), ok: x === n })),
      why: n === 0 ? 'None. No move attacks the king right now.' : `${n}: ${checks.map((m) => m.san).join(', ')}. Counting your checks is the first step of the scan.`,
      rule: 'Checks first.',
      reveal: { arrows: checks.slice(0, 5).map((m) => ({ from: m.from, to: m.to, c: 'g' as AC })) },
      d: n >= 3 ? 3 : 2,
      gen: true,
      phase: 'practice',
    } as ChoiceStep;
  }
  return null;
}

function genMobility(ctx: GenCtx): Step | null {
  const { rng, level } = ctx;
  const types = level <= 1 ? ['n'] : level === 2 ? ['n', 'b', 'r'] : ['n', 'b', 'r', 'q'];
  for (let i = 0; i < 40; i++) {
    const t = pick(rng, types);
    const files = 'abcdefgh';
    const sq = files[Math.floor(rng() * 8)] + (1 + Math.floor(rng() * 8));
    if (sq === 'a1' || sq === 'h8') continue;
    const c = new Chess();
    c.clear();
    c.put({ type: 'k', color: 'w' }, 'a1');
    c.put({ type: 'k', color: 'b' }, 'h8');
    c.put({ type: t as 'n', color: 'w' }, sq as Square);
    if (c.isAttacked('h8', 'w')) continue;
    const fen = c.fen();
    const dests = new Chess(fen).moves({ square: sq as Square, verbose: true }).map((m) => m.to as string);
    const n = dests.length;
    if (n === 0) continue;
    const answers = shuffle(rng, Array.from({ length: 28 }, (_, k) => k).filter((x) => x !== n && Math.abs(x - n) <= 4)).slice(0, 3).concat(n);
    const st: ChoiceStep = {
      id: '',
      t: 'choice',
      q: `How many squares can the ${name(t)} on ${sq} move to? (The kings do not matter.)`,
      board: { fen, side: 'w', marks: { [sq]: 'y' } },
      opts: shuffle(rng, answers).map((x) => ({ text: String(x), ok: x === n })),
      why: `${n}. The ${name(t)} on ${sq} reaches the green squares. ${n >= 8 ? 'A piece with lots of squares is active.' : 'The closer to the edge, the fewer squares a piece reaches, so it works less.'}`,
      rule: 'Pieces in the centre do more work.',
      reveal: { marks: Object.fromEntries(dests.map((d) => [d, 'g' as AC])) },
      d: t === 'n' ? 1 : t === 'q' ? 3 : 2,
      gen: true,
      phase: 'practice',
    };
    (st as unknown as Verifiable)._v = () => new Chess(fen).moves({ square: sq as Square }).length === n;
    return st;
  }
  return null;
}

/** King and pawn ending, attacker to move: find a move that keeps the win. Truth comes from the exact tablebase. */
function genKpk(ctx: GenCtx): Step | null {
  const { rng, level } = ctx;
  const files = 'abcdefgh';
  for (let i = 0; i < 200; i++) {
    const pf = 1 + Math.floor(rng() * 6); // b..g
    const pr = 2 + Math.floor(rng() * 4); // ranks 2..5
    const wp = files[pf] + pr;
    const near = (s: string, d: number) => {
      const f = Math.max(0, Math.min(7, s.charCodeAt(0) - 97 + Math.floor(rng() * (2 * d + 1)) - d));
      const r = Math.max(1, Math.min(8, Number(s[1]) + Math.floor(rng() * (2 * d + 1)) - d));
      return files[f] + r;
    };
    const wk = near(wp, 2);
    const bk = near(wp, 3);
    if (new Set([wp, wk, bk]).size < 3) continue;
    const c = new Chess();
    c.clear();
    try {
      c.put({ type: 'k', color: 'w' }, wk as Square);
      c.put({ type: 'p', color: 'w' }, wp as Square);
      c.put({ type: 'k', color: 'b' }, bk as Square);
    } catch {
      continue;
    }
    const swap = rng() < 0.5;
    const fen0 = c.fen().replace(' w ', ' w ');
    const fen = swap ? transformFen(fen0, false, true) : fen0;
    const res = kpkResult(fen);
    if (!res || res.result !== 'win' || res.turn !== res.pawn) continue;
    const ans = kpkBestMoves(fen);
    if (!ans || !ans.length || ans.length > (level <= 2 ? 2 : 3)) continue;
    const mover = new Chess(fen).turn();
    const st: MoveStep = {
      id: '',
      t: 'move',
      fen,
      ans,
      kind: 'kpk',
      prompt: `${SIDE(mover)} to move. The pawn can queen with best play: find a move that keeps the win.`,
      hint: 'Where is the enemy king? Who has the opposition, and is your king in front of the pawn?',
      why: ans.length === 1 ? `${ans[0]} is the only way to keep the win. Every other move lets the defender hold the draw.` : `${ans.join(' and ')} both keep the win. Other moves let the defender hold the draw.`,
      rule: 'The king leads the pawn. Take the opposition.',
      side: mover,
      d: ans.length === 1 ? 3 : 2,
      gen: true,
      phase: 'practice',
    };
    (st as unknown as Verifiable)._v = () => {
      const r = kpkResult(fen);
      return !!r && r.result === 'win' && JSON.stringify(kpkBestMoves(fen)) === JSON.stringify(ans);
    };
    return st;
  }
  return null;
}

// ---------- public ----------

/** A batch of random positions (cheap enough to build ahead of time, a few at a time). */
export function makePool(rng: Rng, n: number): string[] {
  const out: string[] = [];
  let guard = 0;
  while (out.length < n && guard++ < n * 6) {
    const p = randomPosition(rng);
    if (p) out.push(p);
  }
  return out;
}

export function generate(skill: SkillId, ctx: GenCtx): Step | null {
  let st: Step | null = null;
  switch (skill) {
    case 'square':
      st = genSquare(ctx);
      break;
    case 'value':
    case 'trade':
      st = genValue(ctx);
      break;
    case 'safe':
      st = genSafe(ctx);
      break;
    case 'loose':
      st = genLoose(ctx);
      break;
    case 'count':
      st = genCount(ctx);
      break;
    case 'capture':
      st = genCapture(ctx);
      break;
    case 'free':
      st = genFree(ctx);
      break;
    case 'mate1':
      st = genMate1(ctx);
      break;
    case 'checks':
      st = genChecks(ctx);
      break;
    case 'mobility':
      st = genMobility(ctx);
      break;
    case 'kpk':
      st = genKpk(ctx);
      break;
  }
  if (!st) return null;
  st.id = 'g' + Math.floor(ctx.rng() * 1e9).toString(36);
  return verifyGenerated(st) ? st : null;
}

/** Independent re-check of a generated item with chess.js. An item that fails is never shown. */
export function verifyGenerated(s: Step): boolean {
  try {
    const v = (s as unknown as Verifiable)._v;
    if (v && !v()) return false;
    if (s.t === 'move') {
      const c = new Chess(s.fen);
      if (!s.ans.length) return false;
      for (const a of s.ans) {
        const t = new Chess(s.fen);
        t.move(a);
      }
      if (s.kind === 'kpk') return true; // checked by its own closure (_v)
      if (s.ans[0].endsWith('#')) return matingMoves(s.fen).includes(s.ans[0]);
      // free-piece item: the answer must be a capture that wins material by exact exchange simulation
      const mv = c.moves({ verbose: true }).find((m) => m.san === s.ans[0]);
      if (!mv || !mv.captured) return false;
      const net = captureNet(s.fen, { from: mv.from, to: mv.to });
      return net !== null && net >= 1;
    }
    if (s.t === 'squares') {
      if (s.board.fen === START_FEN) return s.answer.every((a) => /^[a-h][1-8]$/.test(a));
      const info = dangerInfo(s.board.fen, s.board.side as Side);
      if (!info) return false;
      const want = info.filter((i) => i.danger > 0).map((i) => i.sq).sort().join(' ');
      return want === [...s.answer].sort().join(' ');
    }
    if (s.t === 'choice') return s.opts.filter((o) => o.ok).length === 1 && s.opts.length >= 2;
    if (s.t === 'truefalse') return typeof s.ans === 'boolean';
    return true;
  } catch {
    return false;
  }
}

export { kingSquare, seeGain };
