// Validation of the opening courses (lib/openings/**). Called from validate-content.mjs, sharing its engine pool.
//
// Strict by design; fix the content, do not loosen the checks:
//   * every move in every tree is legal (parse errors fail); every node has an idea; arrows/marks use real squares
//   * every repertoire-side move is within 35 cp of Stockfish's best at depth >= 16
//     (a move flagged @p / sound:'practical' may be down to 60 cp, and is listed in the report so the flag stays rare)
//   * opponent replies must be believable (<= 150 cp worse than best) unless authored as a mistake ("?"), which must
//     really cost >= 50 cp and be answered by a punishing reply within 30 cp of best
//   * main branches are at least 10 plies deep
//   * plan quizzes: 4-8 per chapter, one right answer, every option explained; options that stand for a move are checked
//     by the engine (right one within 30 cp of best, wrong ones at least 50 cp worse)
//   * traps: the opponent's error really is an error (>= 100 cp), the punishing move is within 30 cp of best and the line
//     ends in mate or a clearly won position that has won material; "avoid" traps: the bait really loses
import { Chess } from 'chess.js';
import { COURSES } from '../lib/openings/index.ts';
import { compileCourse } from '../lib/openings/course.ts';
import { decisionKeys } from '../lib/openings/tree.ts';

const MATE = 90000;
const VAL = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
const sqOk = (s) => /^[a-h][1-8]$/.test(s);
const strip = (s) => s.replace(/[+#!?]/g, '');
const sc = (l) => (!l ? 0 : l.mate !== undefined ? (l.mate > 0 ? 1 : -1) * (MATE - Math.abs(l.mate)) : l.cp);
const isMate = (s) => Math.abs(s) > 50000;

export async function validateOpenings({ pool, fail, warn, depth, only, course }) {
  const stats = { courses: 0, chapters: 0, edges: 0, decisions: 0, engine: 0, plans: 0, traps: 0, practical: [], mistakes: 0 };
  const per = [];
  const memo = new Map();

  async function judge(fen, uci) {
    const k = fen + '|' + uci;
    if (memo.has(k)) return memo.get(k);
    const p = (async () => {
      const [best] = await pool.analyse(fen, depth, 1);
      stats.engine++;
      const mine = uci === best.pv[0] ? best : (await pool.analyse(fen, depth, 1, [uci]))[0];
      return { best, mine, bs: sc(best), ms: sc(mine) };
    })();
    memo.set(k, p);
    return p;
  }
  const uciOf = (m) => m.from + m.to + (m.promotion ?? '');
  const loss = (j) => (isMate(j.bs) && j.bs > 0 ? (j.ms > 50000 ? 0 : 5000) : j.bs - j.ms);

  function replay(where, moves, from) {
    const c = new Chess(from);
    for (const t of moves.trim().split(/\s+/).filter(Boolean)) {
      const v = t.replace(/^\d+\.+/, '');
      try {
        c.move(v);
      } catch {
        fail(where, `illegal move ${v} in "${moves}"`);
        return null;
      }
    }
    return c;
  }

  function matBal(c, mover) {
    let t = 0;
    for (const row of c.board()) for (const p of row) if (p) t += (p.color === mover ? 1 : -1) * VAL[p.type];
    return t;
  }

  const jobs = [];
  for (const raw of COURSES) {
    if (course && raw.id !== course) continue;
    const where0 = 'course/' + raw.id;
    let cc;
    try {
      cc = compileCourse(raw);
    } catch (e) {
      fail(where0, 'tree does not parse: ' + String(e.message ?? e));
      continue;
    }
    stats.courses++;
    const row = { id: raw.id, chapters: 0, decisions: 0, edges: 0, plans: 0, traps: 0 };
    per.push(row);
    const side = cc.side;
    const seenCh = new Set();
    for (const f of cc.firstMoves) {
      if (!replay(where0, f.join(' '), 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')) continue;
    }
    for (const ch of cc.chapters) {
      const where = `${raw.id}/${ch.id}`;
      stats.chapters++;
      row.chapters++;
      if (seenCh.has(ch.id)) fail(where, 'duplicate chapter id');
      seenCh.add(ch.id);
      if (!ch.title || !ch.blurb || !ch.coach || !ch.tip) fail(where, 'missing title/blurb/coach/tip');
      const g = ch.graph;
      const nodes = Object.values(g.nodes);
      const edgeCount = nodes.reduce((n, x) => n + x.edges.length, 0);
      stats.edges += edgeCount;
      row.edges += edgeCount;
      const dec = decisionKeys(g, side);
      stats.decisions += dec.length;
      row.decisions += dec.length;

      // main line depth
      let depthMain = 0;
      for (let k = g.root; ; ) {
        const e = g.nodes[k].edges[0];
        if (!e) break;
        depthMain++;
        k = e.to;
        if (depthMain > 80) break;
      }
      if (depthMain < 10) fail(where, `main line is only ${depthMain} plies deep (want >= 10)`);

      for (const n of nodes) {
        const wn = `${where} @${n.key.split(' ')[0].slice(0, 24)}`;
        const mine = n.turn === side;
        if (n.whyNot) {
          for (const san of Object.keys(n.whyNot)) {
            try {
              const c = new Chess(n.fen);
              const m = c.move(san);
              if (n.edges.some((e) => e.uci === uciOf(m))) fail(wn, `"why not ${san}" describes a move that is in the tree`);
            } catch {
              fail(wn, `"why not ${san}": illegal move here`);
            }
            if (n.whyNot[san].length < 12) fail(wn, `"why not ${san}": explanation too short`);
          }
        }
        if (n.edges.length && !mine && n.edges.every((e) => e.mistake)) fail(wn, 'opponent node has only mistake replies');
        for (const e of n.edges) {
          const ew = `${wn} ${e.san}`;
          if (!e.idea || e.idea.length < 8) fail(ew, 'missing idea');
          if (e.idea.length > 260) warn(ew, `idea is ${e.idea.length} chars; keep it to one line`);
          for (const a of e.arrows ?? []) if (!sqOk(a.from) || !sqOk(a.to)) fail(ew, 'bad arrow square');
          for (const k of Object.keys(e.marks ?? {})) if (!sqOk(k)) fail(ew, 'bad mark square');
          if (e.practical && !mine) fail(ew, '@p on an opponent move');
          if (e.mistake && mine) fail(ew, 'student move marked as a mistake');
          if (e.mistake) stats.mistakes++;
          const child = g.nodes[e.to];
          if (e.mistake) {
            if (child.turn !== side || !child.edges.length) fail(ew, 'mistake has no punishing reply in the tree');
          }
          if (mine) {
            jobs.push(
              (async () => {
                const j = await judge(n.fen, e.uci);
                const l = loss(j);
                const lim = e.practical ? 60 : 35;
                // the punishing reply to an opponent mistake must be tighter
                const afterMistake = nodes.some((p) => p.edges.some((pe) => pe.mistake && pe.to === n.key));
                if (afterMistake && l > 30) fail(ew, `punishing move is ${l}cp worse than ${j.best.pv[0]} (needs <= 30)`);
                if (l > lim) fail(ew, `repertoire move is ${l}cp worse than best ${j.best.pv[0]}${e.practical ? ' (even for a practical choice)' : ''}`);
                if (e.practical) {
                  stats.practical.push(`${ew}: ${l}cp`);
                  if (l <= 35) warn(ew, `@p flag not needed (${l}cp)`);
                }
              })(),
            );
          } else {
            jobs.push(
              (async () => {
                const j = await judge(n.fen, e.uci);
                const l = loss(j);
                if (e.mistake) {
                  if (l < 50) fail(ew, `marked as a mistake but costs only ${l}cp`);
                } else if (l > 150) fail(ew, `opponent reply is ${l}cp worse than best ${j.best.pv[0]}; mark it "?" and punish it, or drop it`);
              })(),
            );
          }
        }
      }

      // plans
      const pids = new Set();
      if (ch.plans.length < 4 || ch.plans.length > 8) fail(where, `${ch.plans.length} plan questions (want 4-8)`);
      for (const q of ch.plans) {
        stats.plans++;
        row.plans++;
        const pw = `${where} plan ${q.id}`;
        if (pids.has(q.id)) fail(pw, 'duplicate id');
        pids.add(q.id);
        const c = replay(pw, q.at, 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
        if (!c) continue;
        if (q.opts.length < 3 || q.opts.length > 4) fail(pw, `${q.opts.length} options (want 3-4)`);
        const oks = q.opts.filter((o) => o.ok).length;
        if (oks !== 1) fail(pw, `${oks} correct options (want exactly 1)`);
        if (!q.q || !q.rule) fail(pw, 'missing question or rule');
        for (const a of [...(q.arrows ?? []), ...q.opts.flatMap((o) => o.arrows ?? [])]) if (!sqOk(a.from) || !sqOk(a.to)) fail(pw, 'bad arrow square');
        for (const o of q.opts) {
          if (!o.t || !o.why || o.why.length < 10) fail(pw, `option "${o.t}" needs an explanation`);
          if (!o.san) continue;
          let m;
          try {
            m = new Chess(c.fen()).move(o.san);
          } catch {
            fail(pw, `option move ${o.san} is illegal here`);
            continue;
          }
          const uci = uciOf(m);
          jobs.push(
            (async () => {
              const j = await judge(c.fen(), uci);
              const l = loss(j);
              if (o.ok && l > 30) fail(pw, `right answer ${o.san} is ${l}cp worse than ${j.best.pv[0]}`);
              if (!o.ok && l < 50) fail(pw, `wrong option ${o.san} is only ${l}cp worse than best; it is not clearly wrong`);
            })(),
          );
        }
      }

      // traps
      const tids = new Set();
      for (const t of ch.traps) {
        stats.traps++;
        row.traps++;
        const tw = `${where} trap ${t.id}`;
        if (tids.has(t.id)) fail(tw, 'duplicate id');
        tids.add(t.id);
        if (!t.idea || !t.rule || !t.title) fail(tw, 'missing title/idea/rule');
        const start = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
        const c = replay(tw, t.at, start);
        if (!c) continue;
        if (c.turn() !== t.side) {
          fail(tw, `student (${t.side}) is not to move at the question position`);
          continue;
        }
        const fen = c.fen();
        let ansM;
        try {
          ansM = new Chess(fen).move(t.ans);
        } catch {
          fail(tw, `answer ${t.ans} is illegal`);
          continue;
        }
        jobs.push(
          (async () => {
            const j = await judge(fen, uciOf(ansM));
            const l = loss(j);
            if (l > 30) fail(tw, `answer ${t.ans} is ${l}cp worse than best ${j.best.pv[0]}`);
          })(),
        );
        if (t.kind === 'win') {
          // the opponent's last move really was an error
          const toks = t.at.trim().split(/\s+/).filter(Boolean);
          if (toks.length < 2) {
            fail(tw, 'win trap needs the opponent error as the last move of `at`');
            continue;
          }
          const prev = replay(tw, toks.slice(0, -1).join(' '), start);
          const lastM = new Chess(prev.fen()).move(toks[toks.length - 1].replace(/^\d+\.+/, ''));
          jobs.push(
            (async () => {
              const j = await judge(prev.fen(), uciOf(lastM));
              const l = loss(j);
              if (l < 100) fail(tw, `the opponent's move ${toks[toks.length - 1]} costs only ${l}cp; it is not a clear error`);
            })(),
          );
          const before = matBal(c, t.side);
          const e = new Chess(fen);
          e.move(t.ans);
          let ok = true;
          for (const m of t.line.trim().split(/\s+/).filter(Boolean)) {
            try {
              e.move(m.replace(/^\d+\.+/, ''));
            } catch {
              fail(tw, `illegal move ${m} in line`);
              ok = false;
              break;
            }
          }
          if (!ok) continue;
          const mate = e.isCheckmate() && e.turn() !== t.side;
          const gain = matBal(e, t.side) - before;
          const efen = e.fen();
          jobs.push(
            (async () => {
              if (mate) return;
              if (gain < 2) fail(tw, `the line wins only ${gain} points of material and does not mate`);
              const [r] = await pool.analyse(efen, depth, 1);
              stats.engine++;
              const s = sc(r) * (e.turn() === t.side ? 1 : -1);
              if (s < 200) fail(tw, `at the end of the line the student is only ${s}cp up`);
            })(),
          );
        } else {
          if (!t.bait) {
            fail(tw, 'avoid trap needs a bait move');
            continue;
          }
          let baitM;
          try {
            baitM = new Chess(fen).move(t.bait);
          } catch {
            fail(tw, `bait ${t.bait} is illegal`);
            continue;
          }
          jobs.push(
            (async () => {
              const j = await judge(fen, uciOf(baitM));
              const l = loss(j);
              if (l < 150) fail(tw, `the bait ${t.bait} costs only ${l}cp; it is not a real trap`);
            })(),
          );
          const e = new Chess(fen);
          e.move(t.bait);
          let ok = true;
          for (const m of t.line.trim().split(/\s+/).filter(Boolean)) {
            try {
              e.move(m.replace(/^\d+\.+/, ''));
            } catch {
              fail(tw, `illegal move ${m} in line`);
              ok = false;
              break;
            }
          }
          if (!ok) continue;
          const efen = e.fen();
          const mated = e.isCheckmate() && e.turn() === t.side;
          jobs.push(
            (async () => {
              if (mated) return;
              const [r] = await pool.analyse(efen, depth, 1);
              stats.engine++;
              const s = sc(r) * (e.turn() === t.side ? 1 : -1);
              if (s > -200) fail(tw, `at the end of the line the student is only ${s}cp down; the bait is not punished enough`);
            })(),
          );
        }
      }
    }
  }
  await Promise.all(jobs);
  return { stats, per };
}
