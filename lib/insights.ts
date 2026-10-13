import { openingFamily, parseClocks, TAG_INFO, WHY_OPTIONS, type GameAnalysis } from './core';
import type { Game, Puzzle } from './types';

export interface WeaknessRow {
  tag: string;
  label: string;
  blurb: string;
  total: number; // win% lost
  count: number;
  recentFreq: number; // per game, last 30 analysed
  baseFreq: number;
  hp: number; // 0..100
  trend: 'up' | 'down' | 'flat';
  defeated: boolean;
}

export interface OpeningRow {
  name: string;
  n: number;
  score: number;
  w: { n: number; score: number };
  b: { n: number; score: number };
}

export interface TcRow {
  tc: string;
  n: number;
  w: number;
  d: number;
  l: number;
  score: number;
}

export interface Insights {
  totalGames: number;
  analyzed: number;
  weaknesses: WeaknessRow[];
  phases: { phase: string; count: number; loss: number }[];
  bpg: { t: number; v: number }[];
  time: {
    timeoutLosses: number;
    abandonedLosses: number;
    losses: number;
    ttPct: number | null;
    avgEndClock: number | null;
    lowClockGames: number;
    clockGames: number;
  };
  openings: OpeningRow[];
  byTc: TcRow[];
  rating: { t: number; v: number }[];
  why: { id: string; label: string; count: number; pct: number }[];
  whyTotal: number;
  avgAcc: number | null;
}

const score = (w: number, d: number, n: number) => (n ? (w + 0.5 * d) / n : 0);

function endClock(g: Game): number | null {
  const c = parseClocks(g.pgn);
  if (c.length < 4) return null;
  let i = c.length - 1;
  if ((i % 2 === 0) !== (g.myColor === 'w')) i--;
  return i >= 0 ? c[i] : null;
}

export function computeInsights(games: Game[], analyses: GameAnalysis[], puzzles: Puzzle[]): Insights {
  const gm = new Map(games.map((g) => [g.id, g]));
  const an = analyses.filter((a) => gm.has(a.gameId)).sort((a, b) => gm.get(a.gameId)!.endTime - gm.get(b.gameId)!.endTime);
  const n = an.length;
  const recent = an.slice(-30);
  const prev = an.slice(-60, -30);

  const freq = (list: GameAnalysis[], tag: string) =>
    list.length ? list.reduce((s, a) => s + a.mistakes.filter((m) => m.cls !== 'i' && m.tags.includes(tag)).length, 0) / list.length : 0;

  const weaknesses: WeaknessRow[] = [];
  for (const tag of Object.keys(TAG_INFO)) {
    let total = 0;
    let count = 0;
    for (const a of an) {
      for (const m of a.mistakes) {
        if (m.cls !== 'i' && m.tags.includes(tag)) {
          total += m.loss;
          count++;
        }
      }
    }
    if (count === 0) continue;
    const base = freq(an, tag);
    const rec = freq(recent, tag);
    const pf = freq(prev, tag);
    let hp = 100;
    if (n >= 10 && base > 0) hp = Math.max(0, Math.min(100, (rec / base) * 100));
    let trend: WeaknessRow['trend'] = 'flat';
    if (prev.length >= 10) {
      if (rec > pf * 1.2) trend = 'up';
      else if (rec < pf * 0.8) trend = 'down';
    }
    const last20 = an.slice(-20);
    const defeated = n >= 40 && count >= 8 && freq(last20, tag) <= 0.25 * base;
    weaknesses.push({
      tag,
      label: TAG_INFO[tag].label,
      blurb: TAG_INFO[tag].blurb,
      total: Math.round(total),
      count,
      recentFreq: rec,
      baseFreq: base,
      hp,
      trend,
      defeated,
    });
  }
  weaknesses.sort((a, b) => b.total - a.total);

  const ph: Record<string, { count: number; loss: number }> = {
    opening: { count: 0, loss: 0 },
    middlegame: { count: 0, loss: 0 },
    endgame: { count: 0, loss: 0 },
  };
  for (const a of an) for (const m of a.mistakes) if (m.cls !== 'i') {
    ph[m.phase].count++;
    ph[m.phase].loss += m.loss;
  }

  // rolling blunders per game
  const bpg: { t: number; v: number }[] = [];
  const W = 10;
  for (let i = 0; i < an.length; i++) {
    const win = an.slice(Math.max(0, i - W + 1), i + 1);
    bpg.push({ t: gm.get(an[i].gameId)!.endTime, v: win.reduce((s, a) => s + a.nb, 0) / win.length });
  }

  // time management
  const losses = games.filter((g) => g.result === 'loss');
  const timeoutLosses = losses.filter((g) => g.reason === 'timeout').length;
  const abandonedLosses = losses.filter((g) => g.reason === 'abandoned').length;
  const mistakesTotal = an.reduce((s, a) => s + a.nb + a.nm, 0);
  const tt = an.reduce((s, a) => s + a.tt, 0);
  const clocks = games.map(endClock).filter((c): c is number => c !== null);
  const avgEndClock = clocks.length ? clocks.reduce((s, c) => s + c, 0) / clocks.length : null;

  // openings
  const om = new Map<string, { n: number; pts: number; wn: number; wp: number; bn: number; bp: number }>();
  for (const g of games) {
    const name = openingFamily(g.opening || g.eco);
    const o = om.get(name) ?? { n: 0, pts: 0, wn: 0, wp: 0, bn: 0, bp: 0 };
    const pt = g.result === 'win' ? 1 : g.result === 'draw' ? 0.5 : 0;
    o.n++;
    o.pts += pt;
    if (g.myColor === 'w') {
      o.wn++;
      o.wp += pt;
    } else {
      o.bn++;
      o.bp += pt;
    }
    om.set(name, o);
  }
  const openings: OpeningRow[] = [...om.entries()]
    .map(([name, o]) => ({
      name,
      n: o.n,
      score: o.pts / o.n,
      w: { n: o.wn, score: o.wn ? o.wp / o.wn : 0 },
      b: { n: o.bn, score: o.bn ? o.bp / o.bn : 0 },
    }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 8);

  // time controls
  const tm = new Map<string, { n: number; w: number; d: number; l: number }>();
  for (const g of games) {
    const label = g.base ? `${g.base / 60}+${g.inc}` : g.timeControl;
    const t = tm.get(label) ?? { n: 0, w: 0, d: 0, l: 0 };
    t.n++;
    if (g.result === 'win') t.w++;
    else if (g.result === 'draw') t.d++;
    else t.l++;
    tm.set(label, t);
  }
  const byTc: TcRow[] = [...tm.entries()]
    .map(([tc, t]) => ({ tc, ...t, score: score(t.w, t.d, t.n) }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 6);

  const rating = games
    .filter((g) => g.timeClass === 'rapid' && g.myRating > 0)
    .sort((a, b) => a.endTime - b.endTime)
    .map((g) => ({ t: g.endTime, v: g.myRating }));

  const whyMap = new Map<string, number>();
  for (const p of puzzles) if (p.why) whyMap.set(p.why, (whyMap.get(p.why) ?? 0) + 1);
  const whyTotal = [...whyMap.values()].reduce((s, v) => s + v, 0);
  const why = WHY_OPTIONS.map((o) => ({
    id: o.id,
    label: o.label,
    count: whyMap.get(o.id) ?? 0,
    pct: whyTotal ? ((whyMap.get(o.id) ?? 0) / whyTotal) * 100 : 0,
  })).sort((a, b) => b.count - a.count);

  return {
    totalGames: games.length,
    analyzed: n,
    weaknesses,
    phases: Object.entries(ph).map(([phase, v]) => ({ phase, ...v })),
    bpg,
    time: {
      timeoutLosses,
      abandonedLosses,
      losses: losses.length,
      ttPct: mistakesTotal ? (tt / mistakesTotal) * 100 : null,
      avgEndClock,
      lowClockGames: clocks.filter((c) => c < 30).length,
      clockGames: clocks.length,
    },
    openings,
    byTc,
    rating,
    why,
    whyTotal,
    avgAcc: n ? an.reduce((s, a) => s + a.acc, 0) / n : null,
  };
}
