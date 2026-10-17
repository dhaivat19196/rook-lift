'use client';
import { db } from '../db';
import { awardBadge, awardXp, markActive } from '../progress';
import { INTERVAL_DAYS } from '../srs';
import { kvByPrefix, kvGet, kvSet, kvUpdate, useKVPrefix } from '../store';
import { ALL, BY_ID, findStep } from './registry';
import type { SkillId, Step } from './types';

const DAY = 86400000;

export interface LessonProg {
  id: string;
  stars: number;
  attempts: number;
  completedAt?: number;
  /** best first-try accuracy 0..1 */
  acc?: number;
  /** most recent first-try accuracy */
  last?: number;
  /** spaced review: stage 0 -> review in 1 day, 1 -> in 4 days, 2 -> mastered */
  rev?: { stage: 0 | 1 | 2; due: number };
  /** mini-game high score */
  hi?: number;
  hiB?: number;
}

export const lessonKey = (id: string) => 'learn:' + id;

export async function getProg(id: string): Promise<LessonProg | undefined> {
  return kvGet<LessonProg>(lessonKey(id));
}

export function useLearnProgress(): Record<string, LessonProg> | undefined {
  const rows = useKVPrefix<LessonProg>('learn:');
  if (!rows) return undefined;
  const out: Record<string, LessonProg> = {};
  for (const r of rows) if (r && r.id) out[r.id] = r;
  return out;
}

export type Mastery = 'new' | 'shaky' | 'learning' | 'review' | 'mastered';

export function masteryOf(p: LessonProg | undefined, now = Date.now()): Mastery {
  if (!p || !p.completedAt) return 'new';
  if (p.rev?.stage === 2) return 'mastered';
  if (p.rev) return p.rev.due <= now ? 'review' : 'learning';
  return (p.acc ?? 0) >= 0.8 ? 'learning' : 'shaky';
}

export const MASTERY_LABEL: Record<Mastery, string> = {
  new: 'New',
  shaky: 'Shaky',
  learning: 'Learned',
  review: 'Review due',
  mastered: 'Mastered',
};

export function starsFor(acc: number, scored: number): number {
  if (scored === 0) return 3;
  if (acc >= 0.9) return 3;
  if (acc >= 0.7) return 2;
  return 1;
}

export interface CompleteResult {
  stars: number;
  acc: number;
  xp: number;
  first: boolean;
  masteredNow: boolean;
}

export async function completeLesson(lessonId: string, correct: number, scored: number): Promise<CompleteResult> {
  const acc = scored ? correct / scored : 1;
  const stars = starsFor(acc, scored);
  const now = Date.now();
  let first = false;
  let prevStars = 0;
  await kvUpdate<LessonProg>(
    lessonKey(lessonId),
    () => ({ id: lessonId, stars: 0, attempts: 0 }),
    (p) => {
      first = !p.completedAt;
      prevStars = p.stars;
      p.attempts += 1;
      p.stars = Math.max(p.stars, stars);
      p.acc = Math.max(p.acc ?? 0, acc);
      p.last = acc;
      p.completedAt = p.completedAt ?? now;
      if (acc >= 0.8 && !p.rev) p.rev = { stage: 0, due: now + DAY };
    },
  );
  let xp = 0;
  if (first) xp = 20 + 5 * stars;
  else if (stars > prevStars) xp = 5 * (stars - prevStars);
  if (xp) await awardXp(xp, 'Lesson', { quiet: true });
  await markActive();
  void checkLearnBadges();
  return { stars, acc, xp, first, masteredNow: false };
}

/** Result of the 1-day / 4-day spaced check of a lesson. */
export async function reviewLesson(lessonId: string, passed: boolean): Promise<Mastery> {
  const now = Date.now();
  const out = await kvUpdate<LessonProg>(
    lessonKey(lessonId),
    () => ({ id: lessonId, stars: 0, attempts: 0 }),
    (p) => {
      if (!p.rev) p.rev = { stage: 0, due: now };
      if (passed) {
        if (p.rev.stage === 0) p.rev = { stage: 1, due: now + 4 * DAY };
        else if (p.rev.stage === 1) p.rev = { stage: 2, due: now + 30 * DAY };
      } else {
        p.rev = { stage: p.rev.stage, due: now + DAY };
      }
    },
  );
  if (passed) void awardXp(10, 'Review', { quiet: true });
  void checkLearnBadges();
  return masteryOf(out);
}

export async function saveMini(lessonId: string, patch: Partial<LessonProg>): Promise<LessonProg> {
  const out = await kvUpdate<LessonProg>(
    lessonKey(lessonId),
    () => ({ id: lessonId, stars: 0, attempts: 0 }),
    (p) => {
      p.attempts += 1;
      if (patch.hi !== undefined) p.hi = Math.max(p.hi ?? 0, patch.hi);
      if (patch.hiB !== undefined) p.hiB = Math.max(p.hiB ?? 0, patch.hiB);
      if (patch.acc !== undefined) p.acc = Math.max(p.acc ?? 0, patch.acc);
      if (patch.stars !== undefined) p.stars = Math.max(p.stars, patch.stars);
      p.completedAt = p.completedAt ?? Date.now();
    },
  );
  await markActive();
  void checkLearnBadges();
  return out;
}

// ---------- item-level spaced repetition (mistaken items) ----------

export interface ItemRev {
  id: string;
  lessonId: string;
  stepId: string;
  box: number;
  due: number;
  hist: { t: number; ok: boolean }[];
}
export const itemKey = (lessonId: string, stepId: string) => `learnrev:${lessonId}~${stepId}`;

export async function recordItem(lessonId: string, stepId: string, ok: boolean): Promise<void> {
  const key = itemKey(lessonId, stepId);
  const cur = await kvGet<ItemRev>(key);
  const now = Date.now();
  if (!cur) {
    if (ok) return;
    await kvSet(key, { id: lessonId + '~' + stepId, lessonId, stepId, box: 0, due: now + 4 * 3600000, hist: [{ t: now, ok: false }] } satisfies ItemRev);
    return;
  }
  const box = ok ? Math.min(5, cur.box + 1) : 0;
  await kvSet(key, { ...cur, box, due: now + (ok ? INTERVAL_DAYS[box] : 0.17) * DAY, hist: [...cur.hist, { t: now, ok }].slice(-10) });
}

export async function dueItems(limit = 20): Promise<ItemRev[]> {
  const all = await kvByPrefix<ItemRev>('learnrev:');
  const now = Date.now();
  return all.filter((i) => i && i.due <= now).sort((a, b) => a.due - b.due).slice(0, limit);
}

export function useDueItemCount(): number {
  const rows = useKVPrefix<ItemRev>('learnrev:');
  const now = Date.now();
  return rows ? rows.filter((i) => i && i.due <= now).length : 0;
}

export function stepOfItem(i: ItemRev): Step | undefined {
  return findStep(i.lessonId, i.stepId);
}

// ---------- adaptive difficulty per skill ----------

export interface SkillState {
  skill: string;
  lvl: number;
  streak: number;
  miss: number;
  n: number;
}
const skillKey = (s: string) => 'learnskill:' + s;

export async function getSkill(skill: SkillId | string): Promise<SkillState> {
  return (await kvGet<SkillState>(skillKey(skill))) ?? { skill, lvl: 1, streak: 0, miss: 0, n: 0 };
}
export async function saveSkill(s: SkillState): Promise<void> {
  await kvSet(skillKey(s.skill), s);
}

/** 3 first-try in a row -> up a level; 2 misses in a row -> down a level. */
export function adapt(s: SkillState, ok: boolean): { state: SkillState; moved: 'up' | 'down' | null } {
  const n = { ...s, n: s.n + 1 };
  let moved: 'up' | 'down' | null = null;
  if (ok) {
    n.streak += 1;
    n.miss = 0;
    if (n.streak >= 3 && n.lvl < 5) {
      n.lvl += 1;
      n.streak = 0;
      moved = 'up';
    }
  } else {
    n.miss += 1;
    n.streak = 0;
    if (n.miss >= 2 && n.lvl > 1) {
      n.lvl -= 1;
      n.miss = 0;
      moved = 'down';
    }
  }
  return { state: n, moved };
}

// ---------- badges ----------

export async function checkLearnBadges(): Promise<void> {
  const rows = await db.kv.where('key').startsWith('learn:').toArray();
  const progs: Record<string, LessonProg> = {};
  for (const r of rows) {
    const v = r.value as LessonProg;
    if (v && v.id) progs[v.id] = v;
  }
  const done = (id: string, min = 1) => (progs[id]?.stars ?? 0) >= min && !!progs[id]?.completedAt;
  const want: string[] = [];
  if (Object.values(progs).some((p) => p.completedAt)) want.push('first_lesson');
  if ((progs['mg-sprint']?.hi ?? 0) >= 25 || (progs['mg-sprint']?.hiB ?? 0) >= 25) want.push('notation_ninja');
  if (await repertoireReady()) want.push('repertoire_ready');
  const stageBadge = ['stage_found', 'stage_knight', 'stage_bishop', 'stage_rook', 'stage_queen'];
  for (let s = 0; s < stageBadge.length; s++) {
    const ls = ALL.filter((r) => r.stage === s && r.unit.track !== 'games' && !r.lesson.mini);
    if (ls.length && ls.every((r) => done(r.lesson.id))) want.push(stageBadge[s]);
  }
  if (ALL.some((r) => r.unit.track === 'games' && done(r.lesson.id))) want.push('first_master_game');
  if (Object.values(progs).filter((p) => p.rev?.stage === 2).length >= 5) want.push('mastery_5');
  for (const id of want) await awardBadge(id);
}

export { BY_ID };

/** London learned (80%+) and one Black course learned (80%+). */
async function repertoireReady(): Promise<boolean> {
  const { allCompiled } = await import('../openings/index.ts');
  const { courseStats, loadCourseRecs } = await import('../openings/progress.ts');
  const learned = async (id: string) => {
    const c = allCompiled().find((x) => x.id === id);
    if (!c) return false;
    const s = courseStats(c, await loadCourseRecs(id));
    return s.total > 0 && s.learned / s.total >= 0.8;
  };
  if (!(await learned('london'))) return false;
  for (const id of ['sicilian', 'caro', 'qgd', 'e5']) if (await learned(id)) return true;
  return false;
}

/** Due missed lesson questions as puzzles, so Quick bites can mix them in with the Blunder Bank. Move questions only. */
export async function dueLearnPuzzles(max = 2): Promise<import('../types').Puzzle[]> {
  const { Chess } = await import('chess.js');
  const items = await dueItems(30);
  const out: import('../types').Puzzle[] = [];
  for (const it of items) {
    const s = stepOfItem(it);
    if (!s || s.t !== 'move' || s.kind === 'cmd' || s.kind === 'kpk') continue;
    try {
      const c = new Chess(s.fen);
      const color = c.turn();
      const first = c.move(s.ans[0]);
      const pv = [first.from + first.to + (first.promotion ?? '')];
      const k = s.cont?.[0];
      if (k) {
        const r = c.move(k.reply);
        const m2 = c.move(k.ans[0]);
        pv.push(r.from + r.to + (r.promotion ?? ''), m2.from + m2.to + (m2.promotion ?? ''));
      }
      out.push({
        id: `learn:${it.lessonId}~${it.stepId}`,
        gameId: it.lessonId,
        ply: 0,
        fen: s.fen,
        color,
        played: '',
        playedSan: '',
        best: pv[0],
        bestSan: first.san,
        pv,
        bestEv: 0,
        tags: [],
        phase: 'middlegame',
        loss: 0,
        gameEnd: 0,
        box: it.box,
        due: it.due,
        hist: [],
        createdAt: 0,
        src: 'learn',
        note: s.why,
      });
    } catch {
      /* skip */
    }
    if (out.length >= max) break;
  }
  return out;
}
