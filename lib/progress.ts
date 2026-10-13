'use client';
import { db, metaGet } from './db';
import { defaultProgress, kvUpdate } from './store';
import { toast } from './toast';
import type { GameAnalysis } from './core';
import type { Progress } from './types';
import { addDays, localDay } from './util';

// ---------- ranks & ladder ----------

export const RANKS = ['Pawn', 'Knight', 'Bishop', 'Rook', 'Queen', 'King'] as const;
const XP_AT = [0, 400, 1200, 3000, 6000, 12000];

export interface RankInfo {
  index: number;
  name: string;
  next: string | null;
  frac: number; // progress to next rank 0..1
  toNext: number;
}

export function rankInfo(xp: number): RankInfo {
  let index = 0;
  for (let i = 0; i < XP_AT.length; i++) if (xp >= XP_AT[i]) index = i;
  const next = index < XP_AT.length - 1 ? XP_AT[index + 1] : null;
  const frac = next === null ? 1 : (xp - XP_AT[index]) / (next - XP_AT[index]);
  return { index, name: RANKS[index], next: next === null ? null : RANKS[index + 1], frac, toNext: next === null ? 0 : next - xp };
}

export const LADDER = [
  { rating: 650, rank: 'Knight' },
  { rating: 900, rank: 'Bishop' },
  { rating: 1200, rank: 'Rook' },
  { rating: 1500, rank: 'Queen' },
  { rating: 1800, rank: 'King' },
];

export function ratingRank(rating: number): string {
  let r = 'Pawn';
  for (const l of LADDER) if (rating >= l.rating) r = l.rank;
  return r;
}

export const BADGES: { id: string; label: string; desc: string }[] = [
  { id: 'first_import', label: 'First Import', desc: 'Import your games' },
  { id: 'first_review', label: 'First Review', desc: 'Review a game' },
  { id: 'streak7', label: '7-day streak', desc: 'Train 7 days in a row' },
  { id: 'streak30', label: '30-day streak', desc: 'Train 30 days in a row' },
  { id: 'puzzles100', label: '100 puzzles', desc: 'Solve 100 puzzles' },
  { id: 'blunder_free', label: 'Clean game', desc: 'A game with zero blunders' },
  { id: 'boss', label: 'Boss defeated', desc: 'Beat down a recurring weakness' },
  { id: 'r900', label: 'Rating 900', desc: 'Reach 900 rapid' },
  { id: 'r1200', label: 'Rating 1200', desc: 'Reach 1200 rapid' },
  { id: 'r1500', label: 'Rating 1500', desc: 'Reach 1500 rapid' },
  { id: 'r1800', label: 'Rating 1800', desc: 'Reach 1800 rapid' },
  { id: 'first_lesson', label: 'First lesson', desc: 'Finish a Learn lesson' },
  { id: 'notation_ninja', label: 'Notation Ninja', desc: 'Score 25 in Square Sprint' },
  { id: 'repertoire_ready', label: 'Repertoire Ready', desc: 'Every repertoire line at 2 stars or more' },
  { id: 'stage_found', label: 'Foundations done', desc: 'Finish every Foundations lesson' },
  { id: 'stage_knight', label: 'Knight stage done', desc: 'Finish every Knight lesson' },
  { id: 'stage_bishop', label: 'Bishop stage done', desc: 'Finish every Bishop lesson' },
  { id: 'stage_rook', label: 'Rook stage done', desc: 'Finish every Rook lesson' },
  { id: 'stage_queen', label: 'Queen stage done', desc: 'Finish every Queen lesson' },
  { id: 'first_master_game', label: 'Master class', desc: 'Study a master game' },
  { id: 'mastery_5', label: 'Five mastered', desc: 'Master five lessons' },
];

export const XP = {
  puzzleFirst: 10,
  puzzleSolved: 5,
  guard: 5,
  step: 20,
  fullSession: 50,
  review: 30,
  gameSynced: 25,
  assessment: 2,
};

// ---------- mutations ----------

function norm(p: Progress): Progress {
  const d = defaultProgress();
  return { ...d, ...p, stats: { ...d.stats, ...(p.stats ?? {}) }, streak: { ...d.streak, ...(p.streak ?? {}) } };
}

function day(p: Progress, d: string) {
  if (!p.days[d]) p.days[d] = { ded: 0, spr: 0, active: false, xp: 0 };
  return p.days[d];
}

export async function mutateProgress(fn: (p: Progress) => void): Promise<Progress> {
  return kvUpdate<Progress>('progress', defaultProgress, (cur) => {
    const p = norm(cur);
    fn(p);
    return p;
  });
}

function activate(p: Progress, today: string) {
  const dr = day(p, today);
  if (dr.active) return;
  dr.active = true;
  if (p.streak.last === today) return;
  p.streak.cur = p.streak.last === addDays(today, -1) ? p.streak.cur + 1 : 1;
  p.streak.last = today;
  p.streak.best = Math.max(p.streak.best, p.streak.cur);
}

export async function markActive(): Promise<void> {
  const today = localDay();
  await mutateProgress((p) => activate(p, today));
  void checkBadges();
}

export async function awardXp(amount: number, label?: string, opts: { quiet?: boolean } = {}): Promise<void> {
  if (amount <= 0) return;
  const today = localDay();
  let before = 0;
  let after = 0;
  await mutateProgress((p) => {
    before = rankInfo(p.xp).index;
    p.xp += amount;
    day(p, today).xp += amount;
    after = rankInfo(p.xp).index;
  });
  if (!opts.quiet) toast(`+${amount} XP${label ? ' · ' + label : ''}`, 'xp');
  if (after > before) setTimeout(() => toast(`Rank up: ${RANKS[after]}`, 'badge'), 900);
}

export async function addTime(kind: 'ded' | 'spr', secs: number): Promise<void> {
  if (secs <= 0) return;
  const today = localDay();
  await mutateProgress((p) => {
    day(p, today)[kind] += secs;
  });
}

export async function bumpStat(k: keyof Progress['stats'], n = 1): Promise<void> {
  await mutateProgress((p) => {
    p.stats[k] += n;
  });
}

export async function recordPuzzleResult(firstTry: boolean, solved: boolean): Promise<void> {
  await mutateProgress((p) => {
    if (solved) p.stats.puzzles += 1;
    if (firstTry) p.stats.firstTry += 1;
  });
  if (solved) await awardXp(firstTry ? XP.puzzleFirst : XP.puzzleSolved);
}

export async function awardReview(gameId: string): Promise<boolean> {
  let first = false;
  const today = localDay();
  await mutateProgress((p) => {
    if (!p.reviewed[gameId]) {
      p.reviewed[gameId] = Date.now();
      p.stats.reviews += 1;
      first = true;
    }
    activate(p, today);
  });
  if (first) await awardXp(XP.review, 'Game reviewed');
  void checkBadges();
  return first;
}

export async function awardBadge(id: string): Promise<void> {
  let isNew = false;
  await mutateProgress((p) => {
    if (!p.badges[id]) {
      p.badges[id] = Date.now();
      isNew = true;
    }
  });
  if (isNew) {
    const b = BADGES.find((x) => x.id === id);
    toast(`Badge: ${b?.label ?? id}`, 'badge');
  }
}

// ---------- rating & badges ----------

export interface StatsMeta {
  rapid?: number;
  best?: number;
  puzzle?: number;
  fetchedAt: number;
}

export async function currentRating(): Promise<number | null> {
  const s = await metaGet<StatsMeta>('stats');
  if (s?.rapid) return s.rapid;
  const g = await db.games.orderBy('endTime').last();
  return g?.myRating ?? null;
}

let badgeRun: Promise<void> | null = null;
export function checkBadges(): Promise<void> {
  if (badgeRun) return badgeRun;
  badgeRun = (async () => {
    try {
      const row = await db.kv.get('progress');
      const p = norm((row?.value as Progress | undefined) ?? defaultProgress());
      const have = p.badges;
      const want: string[] = [];
      if ((await db.games.count()) > 0) want.push('first_import');
      if (p.stats.reviews > 0) want.push('first_review');
      if (p.streak.best >= 7) want.push('streak7');
      if (p.streak.best >= 30) want.push('streak30');
      if (p.stats.puzzles >= 100) want.push('puzzles100');
      if (p.bosses.length > 0) want.push('boss');
      const r = await currentRating();
      if (r) for (const m of [900, 1200, 1500, 1800]) if (r >= m) want.push('r' + m);
      if (!have.blunder_free) {
        const rows = await db.kv.where('key').startsWith('analysis:').toArray();
        if (rows.some((x) => {
          const a = x.value as GameAnalysis;
          return a.nb === 0 && a.myMoves >= 15;
        })) want.push('blunder_free');
      }
      for (const id of want) if (!have[id]) await awardBadge(id);
      try {
        await (await import('./learn/progress')).checkLearnBadges();
      } catch {
        /* learn content unavailable: ignore */
      }
    } finally {
      badgeRun = null;
    }
  })();
  return badgeRun;
}

// ---------- derived ----------

export function shownStreak(p: Progress): number {
  const today = localDay();
  if (p.streak.last === today || p.streak.last === addDays(today, -1)) return p.streak.cur;
  return 0;
}

// ---------- day type ----------

export function dayTypeFor(anchorDate: string, anchorType: 'match' | 'train', date = localDay()): 'match' | 'train' {
  const [y1, m1, d1] = anchorDate.split('-').map(Number);
  const [y2, m2, d2] = date.split('-').map(Number);
  const diff = Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
  const even = ((diff % 2) + 2) % 2 === 0;
  return even ? anchorType : anchorType === 'match' ? 'train' : 'match';
}
