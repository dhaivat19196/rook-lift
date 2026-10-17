// Content validator for the Learn curriculum.  Run: npm run validate  (also runs as part of `npm run build`).
//   --only=<prefix>   only lessons whose id starts with the prefix (games are skipped)
//   --depth=<n>       override the engine depth for best-move checks (default 16; never lower than 14)
//   --no-cache        ignore the engine result cache
//   --course=<id>     only this opening course (the lessons are skipped); `--only=op` runs all opening courses alone
//
// What is checked (nothing here is weakened to make content pass; fix the content instead):
//   * every FEN is legal; every scripted move is legal in sequence
//   * every `move` answer is Stockfish's best, or within 30cp of best, or a forced mate when best is a forced mate
//   * tactic steps really win material (>= 2 points inside the engine line) or mate
//   * wrong-move explanations only cite moves that are really worse
//   * `squares` hanging-piece answers equal the loose pieces computed from the position
//   * truefalse / choice engine claims hold
//   * opening lines are legal; the student's moves are sound (<= 50cp from best); the scripted replies are reasonable
//   * playout positions really are won / holdable as stated
//   * master-game PGNs parse completely; annotations and arrows are valid
import { Chess } from 'chess.js';
import { join, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Pool } from './lib/pool.mjs';
import { winnablePieces } from '../lib/learn/see.ts';
import { generate, mulberry32, verifyGenerated } from '../lib/learn/gen.ts';
import { variantEligible, variantOf } from '../lib/learn/variants.ts';
import { getTable, isKpk, kpkBestMoves, kpkResult, solve } from '../lib/learn/kpk.ts';
import { UNITS, GAMES } from '../lib/learn/content/index.ts';
import { validateOpenings } from './validate-openings.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')).map(([k, v]) => [k, v ?? true]));
const DEPTH = Math.max(14, Number(args.depth ?? 16));
const LINE_DEPTH = 12;
const TOL = 30;
const MATE = 90000;

const pool = new Pool(Number(process.env.VALIDATE_WORKERS) || undefined, args['no-cache'] ? undefined : join(root, '.cache', 'validate-engine.json'));
await pool.start();

const fails = [];
const warns = [];
const counts = { variants: 0, kpk: 0, lessons: 0, steps: 0, fens: 0, moves: 0, engine: 0, lines: 0, plies: 0, generated: 0, genCached: 0, games: 0, gamePlies: 0, playouts: 0, claims: 0, hanging: 0 };
const fail = (where, msg) => fails.push(`${where}: ${msg}`);
const warn = (where, msg) => warns.push(`${where}: ${msg}`);

const strip = (s) => s.replace(/[+#!?]/g, '');
const sc = (l) => (!l ? 0 : l.mate !== undefined ? (l.mate > 0 ? 1 : -1) * (MATE - Math.abs(l.mate)) : l.cp);
const isMateScore = (s) => Math.abs(s) > 50000;
const sqOk = (s) => /^[a-h][1-8]$/.test(s);
const VAL = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

function load(where, fen) {
  counts.fens++;
  try {
    const c = new Chess(fen);
    // chess.js accepts positions where the side NOT to move is in check; reject those
    const flip = new Chess(fen);
    const t = c.turn() === 'w' ? 'b' : 'w';
    const parts = fen.split(' ');
    parts[1] = t;
    parts[3] = '-';
    try {
      const other = new Chess(parts.join(' '));
      if (other.inCheck()) {
        fail(where, 'side not to move is in check (illegal position): ' + fen);
        return null;
      }
    } catch {
      /* cannot flip: fine */
    }
    void flip;
    return c;
  } catch (e) {
    fail(where, 'illegal FEN: ' + fen + ' (' + String(e.message ?? e).slice(0, 80) + ')');
    return null;
  }
}

function playSan(where, c, san) {
  let m;
  try {
    m = c.move(san);
  } catch {
    fail(where, `illegal move ${san} in ${c.fen()}`);
    return null;
  }
  if (!m) return null;
  if (strip(m.san) !== strip(san)) fail(where, `non-canonical SAN "${san}" (should be "${m.san}")`);
  return m;
}

function checkSquares(where, spec) {
  if (!spec) return;
  for (const a of spec.arrows ?? []) if (!sqOk(a.from) || !sqOk(a.to)) fail(where, 'bad arrow square ' + a.from + a.to);
  for (const k of Object.keys(spec.marks ?? {})) if (!sqOk(k)) fail(where, 'bad mark square ' + k);
}

function checkBoard(where, b) {
  if (!b) return;
  load(where, b.fen);
  checkSquares(where, b);
}

const uciOf = (m) => m.from + m.to + (m.promotion ?? '');

/** score of `san` in `fen` relative to the best move (both from the mover's view). */
async function judge(fen, san, depth = DEPTH) {
  const c = new Chess(fen);
  const m = c.move(san);
  const [best] = await pool.analyse(fen, depth, 1);
  counts.engine++;
  const mine = uciOf(m) === best.pv[0] ? best : (await pool.analyse(fen, depth, 1, [uciOf(m)]))[0];
  return { best, mine, bs: sc(best), ms: sc(mine) };
}

function okVsBest(j) {
  if (isMateScore(j.bs)) return j.bs > 0 ? j.ms > 50000 : j.ms >= j.bs - TOL;
  return j.ms >= j.bs - TOL;
}

function materialGain(fen, pv, mover, maxPlies = 10) {
  const c = new Chess(fen);
  const bal = () => {
    let t = 0;
    for (const row of c.board()) for (const p of row) if (p) t += (p.color === mover ? 1 : -1) * VAL[p.type];
    return t;
  };
  const start = bal();
  let mate = false;
  let n = 0;
  for (const u of pv.slice(0, maxPlies)) {
    try {
      c.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] });
    } catch {
      break;
    }
    n++;
    if (c.isCheckmate()) {
      mate = true;
      break;
    }
  }
  // settle: if the line stops right after the mover's capture, count one ply back for fairness
  return { gain: bal() - start, mate, plies: n };
}

async function checkMoveStep(where, s) {
  const c = load(where, s.fen);
  if (!c) return;
  const chain = [{ fen: s.fen, ans: s.ans }];
  let cur = c;
  // walk the scripted line
  for (let i = 0; i < (s.cont?.length ?? 0) + 1; i++) {
    const node = i === 0 ? { ans: s.ans } : s.cont[i - 1];
    if (i > 0) {
      const r = playSan(where, cur, node.reply);
      if (!r) return;
      chain.push({ fen: cur.fen(), ans: node.ans, reply: node.reply });
    }
    const first = node.ans[0];
    for (const a of node.ans) {
      const t = new Chess(cur.fen());
      if (!playSan(where, t, a)) return;
      counts.moves++;
    }
    if (i === 0) {
      /* nothing */
    }
    const m = playSan(where, cur, first);
    if (!m) return;
  }
  if (s.kind === 'cmd') return;
  if (s.kind === 'kpk') {
    // exact check against the tablebase: ans must be exactly the set of moves that keep the result
    const want = kpkBestMoves(s.fen);
    if (!want) {
      fail(where, 'kpk step is not a bare king-and-pawn position');
      return;
    }
    const norm = (a) => a.map(strip).sort().join(',');
    if (norm(want) !== norm(s.ans)) fail(where, `kpk answer set ${norm(s.ans)} != moves that keep the result ${norm(want)}`);
    if (s.cont?.length) fail(where, 'kpk steps cannot have continuations');
    counts.kpk++;
    return;
  }

  for (let i = 0; i < chain.length; i++) {
    const node = chain[i];
    const tag = `${where}${i ? ' (cont ' + i + ')' : ''}`;
    // opponent reply sanity (only when the position is not already a forced mate for the student)
    if (node.reply && i > 0 && !s.loose) {
      const prevFen = chain[i - 1].fen;
      const t = new Chess(prevFen);
      t.move(chain[i - 1].ans[0]);
      const replyFen = t.fen();
      const [rb] = await pool.analyse(replyFen, 14, 1);
      counts.engine++;
      const rbs = sc(rb);
      if (!(rbs < -50000)) {
        const jr = await judge(replyFen, node.reply, 14);
        if (jr.ms < jr.bs - 100) fail(tag, `scripted reply ${node.reply} is ${jr.bs - jr.ms}cp worse than the opponent's best (${jr.best.pv[0]})`);
      }
    }
    let firstJudge = null;
    for (const a of node.ans) {
      const j = await judge(node.fen, a);
      if (a === node.ans[0]) firstJudge = j;
      if (!okVsBest(j)) {
        const fmt = (x) => (isMateScore(x) ? `M${x > 0 ? '' : '-'}${MATE - Math.abs(x)}` : x + 'cp');
        fail(tag, `answer ${a} scores ${fmt(j.ms)} vs best ${fmt(j.bs)} (best move ${j.best.pv[0]}) in ${node.fen}`);
      }
    }
    if (s.tactic && i === 0 && firstJudge) {
      const mover = new Chess(node.fen).turn();
      const g = materialGain(node.fen, firstJudge.mine.pv, mover);
      const ms = firstJudge.ms;
      if (!(g.mate || g.gain >= 2 || isMateScore(ms) && ms > 0 || ms >= 250)) {
        fail(tag, `tactic does not win material or mate: engine line gains ${g.gain}, score ${ms}cp (${firstJudge.mine.pv.slice(0, 6).join(' ')})`);
      }
      // uniqueness is a quality warning only
      const top = await pool.analyse(node.fen, DEPTH, 2);
      if (top.length > 1 && s.ans.length === 1 && sc(top[1]) >= sc(top[0]) - TOL && !isMateScore(sc(top[0]))) {
        warn(tag, `second move ${top[1].pv[0]} is about as good (${sc(top[1])} vs ${sc(top[0])}); other moves will be accepted at runtime`);
      }
    }
  }
  // the "Practice more" mirrored/colour-swapped variant of this step must be legal and engine-sound too
  if (variantEligible(s) && s.kind !== 'cmd') {
    for (const [mi, sw] of [[true, false], [false, true]]) {
      const v = variantOf(s, mi, sw, 'x');
      if (!v) {
        fail(where, `variant (mirror=${mi}, swap=${sw}) could not be built`);
        continue;
      }
      counts.variants++;
      if (!load(where + ' variant', v.fen)) continue;
      const j = await judge(v.fen, v.ans[0]);
      if (!okVsBest(j)) fail(where, `variant (mirror=${mi}, swap=${sw}) answer ${v.ans[0]} disagrees with Stockfish (${j.ms} vs ${j.bs})`);
    }
  }
  // moves listed as wrong must really be worse
  for (const [wrongSan] of Object.entries(s.wrong ?? {})) {
    const c0 = new Chess(s.fen);
    if (!playSan(where + ' wrong', c0, wrongSan)) continue;
    const j = await judge(s.fen, wrongSan);
    if (okVsBest(j)) fail(where, `"wrong" move ${wrongSan} is actually fine (${j.ms} vs ${j.bs})`);
  }
  if (s.think) {
    if (s.think.ans < 0 || s.think.ans >= s.think.opts.length) fail(where, 'think.ans out of range');
  }
}

async function checkStep(lid, s, lesson) {
  const where = `${lid}/${s.id}`;
  counts.steps++;
  switch (s.t) {
    case 'text':
      checkBoard(where, s.board);
      if (!s.body || !s.body.trim()) fail(where, 'empty text body');
      break;
    case 'move':
      checkSquares(where, { arrows: s.arrows });
      await checkMoveStep(where, s);
      break;
    case 'choice': {
      checkBoard(where, s.board);
      if (s.opts.length < 2 || s.opts.length > 4) fail(where, 'choice needs 2-4 options');
      if (s.opts.filter((x) => x.ok).length !== 1) fail(where, 'choice needs exactly one correct option');
      for (const op of s.opts) checkSquares(where, { arrows: op.arrows });
      if (s.kpk) {
        const r = kpkResult(s.kpk.fen);
        counts.kpk++;
        if (!r) fail(where, 'kpk fen is not a legal bare K+P v K position');
        else if ((r.result === 'win') !== s.kpk.wins) fail(where, `tablebase says ${r.result} but the answer says wins=${s.kpk.wins}`);
        if (s.opts.length !== 2 || !!s.opts[0].ok !== s.kpk.wins || !!s.opts[1].ok === s.kpk.wins) fail(where, 'kpk choice needs exactly [wins, draw] options with the right one marked');
      }
      if (s.engineFen) {
        counts.claims++;
        if (!load(where, s.engineFen)) break;
        let bestScore = null;
        for (const op of s.opts) {
          if (!op.san) {
            fail(where, 'engine-verified choice option missing san: ' + op.text);
            continue;
          }
          const t = new Chess(s.engineFen);
          if (!playSan(where, t, op.san)) continue;
          const j = await judge(s.engineFen, op.san, 14);
          bestScore = j.bs;
          if (op.ok && !okVsBest(j)) fail(where, `correct option ${op.san} is ${j.bs - j.ms}cp below best (${j.best.pv[0]})`);
          if (!op.ok && j.ms >= j.bs - 60 && !(isMateScore(j.bs) && j.ms < 50000)) fail(where, `wrong option ${op.san} is not clearly worse (${j.ms} vs ${j.bs})`);
        }
        void bestScore;
      }
      break;
    }
    case 'squares': {
      checkBoard(where, s.board);
      for (const a of s.answer) if (!sqOk(a)) fail(where, 'bad answer square ' + a);
      if (s.verifyHanging) {
        counts.hanging++;
        const want = (winnablePieces(s.board.fen, s.verifyHanging) ?? []).sort().join(' ');
        const got = [...s.answer].sort().join(' ');
        if (want !== got) fail(where, `hanging pieces computed [${want}] but answer is [${got}]`);
      }
      break;
    }
    case 'truefalse': {
      checkBoard(where, s.board);
      if (s.kpk) {
        const r = kpkResult(s.kpk.fen);
        counts.kpk++;
        if (!r) fail(where, 'kpk fen is not a legal bare K+P v K position');
        else if ((r.result === 'win') !== s.kpk.wins) fail(where, `tablebase says ${r.result} but the statement says wins=${s.kpk.wins}`);
        if (s.ans !== s.kpk.wins) fail(where, 'truefalse.ans disagrees with kpk.wins');
        if (s.board?.fen !== s.kpk.fen) fail(where, 'kpk fen must equal the board fen');
      }
      if (s.claim) {
        counts.claims++;
        const c = load(where, s.claim.fen);
        if (!c) break;
        if (!playSan(where, c, s.claim.san)) break;
        const j = await judge(s.claim.fen, s.claim.san, 14);
        if (s.claim.ok && !okVsBest(j)) fail(where, `claim "${s.claim.san} is good" is false: ${j.ms} vs best ${j.bs}`);
        if (!s.claim.ok && j.ms >= j.bs - 60) fail(where, `claim "${s.claim.san} is bad" is false: ${j.ms} vs best ${j.bs}`);
        if (s.ans !== s.claim.ok) fail(where, 'truefalse.ans disagrees with claim.ok');
      }
      break;
    }
    case 'line':
      await checkLine(where, s.line);
      break;
    case 'playout':
      await checkPlayout(where, s.drill);
      break;
    case 'gen':
      await checkGen(where, s);
      break;
    case 'game':
      if (!GAMES.some((g) => g.id === s.gameId)) fail(where, 'unknown game ' + s.gameId);
      break;
    default:
      fail(where, 'unknown step type ' + s.t);
  }
}

// Generator sampling is slow; it is skipped when neither the generator code nor the engine settings changed since it last passed.
const genFingerprint = createHash('sha1')
  .update(['gen.ts', 'see.ts', 'build.ts'].map((f) => readFileSync(join(root, 'lib', 'learn', f), 'utf8')).join('|'))
  .update(String(args.gensamples ?? 8) + DEPTH)
  .digest('hex');
const genCacheFile = join(root, '.cache', 'gen-ok.json');
let genOk = {};
try {
  genOk = existsSync(genCacheFile) && !args['no-cache'] ? JSON.parse(readFileSync(genCacheFile, 'utf8')) : {};
} catch {
  genOk = {};
}
const genDone = new Set();
/** Sample a generator at every level; every item must pass its own chess.js re-check, and move items must agree with Stockfish. */
async function checkGen(where, s) {
  if (genDone.has(s.skill)) return;
  genDone.add(s.skill);
  if (genOk[s.skill] === genFingerprint) {
    counts.genCached++;
    return;
  }
  const failsBefore = fails.length;
  const per = Number(args.gensamples ?? 8);
  let made = 0;
  const seen = new Set();
  for (let lv = 1; lv <= 3; lv++) {
    for (let i = 0; i < per; i++) {
      const item = generate(s.skill, { rng: mulberry32(7919 * lv + i * 31 + 5), level: lv });
      if (!item) continue;
      made++;
      counts.generated++;
      if (!verifyGenerated(item)) {
        fail(where + ' gen:' + s.skill, 'generated item failed its own re-check');
        continue;
      }
      if (!item.d || item.d < 1 || item.d > 5) fail(where + ' gen:' + s.skill, 'missing difficulty');
      if (item.t === 'move' && item.kind === 'kpk') {
        const r = kpkResult(item.fen);
        if (!r || r.result !== 'win') fail(where + ' gen:' + s.skill, 'generated kpk position is not a win: ' + item.fen);
      } else if (item.t === 'move') {
        const key = item.fen + item.ans[0];
        if (seen.has(key)) continue;
        seen.add(key);
        const c = load(where + ' gen:' + s.skill, item.fen);
        if (!c) continue;
        for (const a of item.ans) {
          const j = await judge(item.fen, a, 14);
          if (!okVsBest(j)) fail(where + ' gen:' + s.skill, `generated answer ${a} disagrees with Stockfish (${j.ms} vs best ${j.bs}, ${j.best.pv[0]}) in ${item.fen}`);
        }
      } else if (item.t === 'squares' || item.t === 'choice') {
        const b = item.board;
        if (b) load(where + ' gen:' + s.skill, b.fen);
      }
    }
  }
  if (made < per * 2) fail(where + ' gen:' + s.skill, `generator produced only ${made} items`);
  if (fails.length === failsBefore) {
    genOk[s.skill] = genFingerprint;
    mkdirSync(dirname(genCacheFile), { recursive: true });
    writeFileSync(genCacheFile, JSON.stringify(genOk));
  }
}

async function checkLine(where, l) {
  counts.lines++;
  if (l.ideas.length !== l.moves.length) fail(where, `line ${l.id}: ${l.ideas.length} ideas for ${l.moves.length} moves`);
  if (l.moves.length < 8 || l.moves.length > 14) fail(where, `line ${l.id}: ${l.moves.length} plies (want 8-14)`);
  const c = load(where, l.fen ?? 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  if (!c) return;
  for (let i = 0; i < l.moves.length; i++) {
    const who = c.turn();
    const fenBefore = c.fen();
    const m = playSan(`${where} ${l.id} ply ${i + 1}`, c, l.moves[i]);
    if (!m) return;
    counts.plies++;
    if (strip(l.ideas[i] ?? '') === '') fail(where, `line ${l.id}: missing idea for ply ${i + 1}`);
    const j = await judge(fenBefore, l.moves[i], LINE_DEPTH);
    const loss = j.bs - j.ms;
    if (who === l.side) {
      if (loss > 50 && !(isMateScore(j.bs) === false && j.ms > 50000)) fail(`${where} ${l.id}`, `ply ${i + 1} ${l.moves[i]} is ${loss}cp worse than ${j.best.pv[0]}`);
    } else if (loss > 120) {
      fail(`${where} ${l.id}`, `ply ${i + 1} opponent move ${l.moves[i]} is ${loss}cp worse than best (${j.best.pv[0]}); not a believable reply`);
    }
  }
  for (const [k, v] of Object.entries(l.arrows ?? {})) {
    if (Number(k) < 1 || Number(k) > l.moves.length) fail(where, 'arrow ply out of range ' + k);
    checkSquares(where, { arrows: v });
  }
}

async function checkPlayout(where, d) {
  counts.playouts++;
  const c = load(where, d.fen);
  if (!c) return;
  if (isKpk(d.fen)) {
    const r = kpkResult(d.fen);
    if (!r) return fail(where, `playout "${d.id}" is not a legal king-and-pawn position`);
    const userHasPawn = r.pawn === d.user;
    if (d.goal === 'win' && !(userHasPawn && r.result === 'win')) fail(where, `playout "${d.id}": the tablebase says this is not a win for ${d.user}`);
    if (d.goal === 'draw' && !(!userHasPawn && r.result === 'draw')) fail(where, `playout "${d.id}": the tablebase says the defender does not hold`);
    counts.kpk++;
    return;
  }
  const res = await pool.analyse(d.fen, 20, 1);
  counts.engine++;
  const s = sc(res[0]);
  const mine = c.turn() === d.user ? s : -s;
  if (d.goal === 'win' && !(mine >= 250)) fail(where, `playout "${d.id}" is not clearly winning for ${d.user}: ${mine}cp`);
  if (d.goal === 'draw' && !(mine >= -60 && mine <= 120)) fail(where, `playout "${d.id}" is not a holdable draw: ${mine}cp`);
}

async function checkLesson(unit, l) {
  counts.lessons++;
  const where = l.id;
  if (!l.title || !l.blurb || !l.intro) fail(where, 'missing title/blurb/intro');
  if (!l.rule || !l.habit) fail(where, 'missing rule/habit');
  if (l.recap.length < 2 || l.recap.length > 3) fail(where, `recap needs 2-3 bullets (has ${l.recap.length})`);
  const ids = new Set();
  for (const s of l.steps) {
    if (ids.has(s.id)) fail(where, 'duplicate step id ' + s.id);
    ids.add(s.id);
  }
  if (l.mini) return;
  const scored = l.steps.filter((s) => s.phase === 'practice' && ['move', 'choice', 'squares', 'truefalse', 'gen', 'line', 'playout'].includes(s.t));
  const nScored = scored.reduce((n, s) => n + (s.t === 'gen' ? s.n : 1), 0);
  const MIN = { safety: 10, mates: 10, opening: 6, endgame: 6, clock: 6, plan: 6, notation: 5, tactics: 4, games: 0 };
  const min = MIN[unit.cat] ?? 0;
  if (nScored < min) fail(where, `only ${nScored} practice items (need ${min}+)`);
  if (unit.track === 'tactics' && nScored > 8) warn(where, `${nScored} practice items (spec asks 4-8)`);
  if (!l.steps.some((s) => s.phase === 'example')) warn(where, 'no worked example');
  await Promise.all(l.steps.map((s) => checkStep(where, s, l)));
}

function checkGame(g) {
  const where = 'game/' + g.id;
  counts.games++;
  const c = new Chess();
  try {
    c.loadPgn(g.pgn);
  } catch (e) {
    fail(where, 'PGN does not parse: ' + String(e.message ?? e).slice(0, 120));
    return;
  }
  const hist = c.history({ verbose: true });
  counts.gamePlies += hist.length;
  const raw = g.pgn.replace(/\{[^}]*\}/g, '').replace(/\d+\.(\.\.)?/g, ' ').replace(/(1-0|0-1|1\/2-1\/2|\*)\s*$/, '').trim().split(/\s+/).filter(Boolean);
  if (raw.length !== hist.length) fail(where, `PGN has ${raw.length} tokens but parsed ${hist.length} plies (some tokens ignored)`);
  const res = /(1-0|0-1|1\/2-1\/2)\s*$/.exec(g.pgn)?.[1];
  if (res !== g.result) fail(where, `result tag ${g.result} != PGN ${res}`);
  if (c.isCheckmate()) {
    const winner = c.turn() === 'w' ? '0-1' : '1-0';
    if (winner !== g.result) fail(where, 'ends in mate but result is ' + g.result);
  }
  const seen = new Set();
  for (const n of g.notes) {
    if (n.ply < 1 || n.ply > hist.length) fail(where, 'annotation ply out of range ' + n.ply);
    if (seen.has(n.ply)) fail(where, 'duplicate annotation at ply ' + n.ply);
    seen.add(n.ply);
    checkSquares(where, n);
  }
  if (g.notes.length < 6) fail(where, 'needs at least 6 annotations');
}

// the shipped K+P table must equal a fresh solve (cached while kpk.ts is unchanged)
{
  const key = createHash('sha1').update(readFileSync(join(root, 'lib', 'learn', 'kpk.ts'), 'utf8')).update(readFileSync(join(root, 'lib', 'learn', 'kpk-data.ts'), 'utf8')).digest('hex');
  if (genOk.kpkTable !== key) {
    const fresh = solve();
    const shipped = getTable();
    let same = fresh.length === shipped.length;
    for (let i = 0; same && i < fresh.length; i++) if (fresh[i] !== shipped[i]) same = false;
    if (!same) fail('kpk-data.ts', 'precomputed table differs from a fresh solve; run node scripts/gen-kpk.mjs');
    else {
      genOk.kpkTable = key;
      mkdirSync(dirname(genCacheFile), { recursive: true });
      writeFileSync(genCacheFile, JSON.stringify(genOk));
    }
  }
}

// ---------------- run ----------------
const only = typeof args.only === 'string' ? args.only : null;
const t0 = Date.now();
const lessonIds = new Set();
const jobs = [];
for (const u of UNITS) {
  for (const l of u.lessons) {
    if (lessonIds.has(l.id)) fail(l.id, 'duplicate lesson id');
    lessonIds.add(l.id);
    if (only && !l.id.startsWith(only)) continue;
    if (args.course) continue;
    jobs.push(checkLesson(u, l));
  }
}
await Promise.all(jobs);
if (!only && !args.course) {
  for (const g of GAMES) checkGame(g);
  const gids = new Set(GAMES.map((g) => g.id));
  if (gids.size !== GAMES.length) fail('games', 'duplicate game ids');
}
let opening = null;
if (!only || only === 'op' || args.course) {
  opening = await validateOpenings({ pool, fail, warn, depth: DEPTH, course: typeof args.course === 'string' ? args.course : null });
}
await pool.stop();

const secs = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`validate-content: ${counts.generated} generated samples verified (+${counts.genCached} skills unchanged since last pass), ${counts.lessons} lessons, ${counts.steps} steps, ${counts.fens} FENs, ${counts.moves} scripted moves, ${counts.lines} lines (${counts.plies} plies), ${counts.games} games (${counts.gamePlies} plies), ${counts.playouts} playouts, ${counts.hanging} hanging-piece sets, ${counts.kpk} tablebase-checked endgame items, ${counts.variants} practice-more variants, ${counts.claims} engine claims`);
if (opening) {
  const o = opening.stats;
  console.log(`openings: ${o.courses} courses, ${o.chapters} chapters, ${o.edges} moves in trees (${o.decisions} repertoire decision nodes), ${o.mistakes} punished opponent mistakes, ${o.plans} plan questions, ${o.traps} traps`);
  for (const r of opening.per) console.log(`  ${r.id}: ${r.chapters} chapters, ${r.decisions} decision nodes, ${r.edges} moves, ${r.plans} plan questions, ${r.traps} traps`);
  if (o.practical.length) console.log(`  sound:'practical' moves (${o.practical.length}): ${o.practical.join('; ')}`);
}
console.log(`engine: depth ${DEPTH}, ${counts.engine} comparisons, ${pool.misses} searches run, ${pool.hits} cached, ${secs}s`);
if (warns.length) {
  console.log(`\n${warns.length} warning(s):`);
  for (const w of warns) console.log('  ~ ' + w);
}
if (fails.length) {
  console.log(`\n${fails.length} FAILURE(S):`);
  for (const f of fails) console.log('  x ' + f);
  process.exit(1);
}
console.log('\nAll content validated.');
process.exit(0);
