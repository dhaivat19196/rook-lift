'use client';
import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { TAG_INFO, type GameAnalysis } from '../core';
import { db } from '../db';
import { useRating } from '../queries';
import { hash } from './coach';
import { masteryOf, useLearnProgress, type LessonProg } from './progress';
import { ALL, BY_ID, STAGES, stageOfRating } from './registry';
import type { Cat } from './types';

export interface Weakness {
  tag: string;
  label: string;
  count: number;
  loss: number;
}

/** Cost of each weakness tag in the student's analysed games (win% lost on blunders and mistakes). */
export function useWeaknesses(): Weakness[] | undefined {
  const rows = useLiveQuery(async () => (await db.kv.where('key').startsWith('analysis:').toArray()).map((r) => r.value as GameAnalysis), []);
  return useMemo(() => {
    if (!rows) return undefined;
    const m: Record<string, Weakness> = {};
    for (const a of rows) {
      for (const x of a.mistakes) {
        if (x.cls === 'i') continue;
        for (const t of x.tags) {
          if (!TAG_INFO[t]) continue;
          const w = (m[t] ??= { tag: t, label: TAG_INFO[t].label, count: 0, loss: 0 });
          w.count += 1;
          w.loss += x.loss;
        }
      }
    }
    return Object.values(m).sort((a, b) => b.loss - a.loss);
  }, [rows]);
}

export type RecKind = 'start' | 'review' | 'retry' | 'weakness' | 'path';
export interface Rec {
  lessonId: string;
  kind: RecKind;
  why: string;
}

/** The highest stage the student is "in": driven by mastery, nudged up by their real rating. */
export function allowedStage(progress: Record<string, LessonProg>, rating: number | null | undefined, now = Date.now()): number {
  let progressStage = 0;
  for (const st of STAGES.slice(0, 5)) {
    const ls = ALL.filter((r) => r.stage === st.id && !r.lesson.mini && r.unit.track !== 'games');
    if (!ls.length) {
      progressStage = st.id + 1;
      continue;
    }
    const learned = ls.filter((r) => {
      const m = masteryOf(progress[r.lesson.id], now);
      return m === 'learning' || m === 'review' || m === 'mastered';
    }).length;
    if (learned / ls.length >= 0.75) progressStage = st.id + 1;
    else break;
  }
  return Math.min(5, Math.max(progressStage, stageOfRating(rating)));
}

/** Daily mix: ~60% piece safety and tactics, ~20% mates and endgames, ~20% openings. */
export function dailyCats(day: string): Cat[] {
  const r = hash(day) % 10;
  if (r < 6) return ['safety', 'tactics', 'mates', 'opening', 'endgame', 'plan', 'clock'];
  if (r < 8) return ['mates', 'endgame', 'safety', 'tactics', 'opening', 'plan', 'clock'];
  return ['opening', 'safety', 'tactics', 'mates', 'endgame', 'plan', 'clock'];
}

export interface RecOpts {
  progress: Record<string, LessonProg>;
  weaknesses: Weakness[];
  rating: number | null | undefined;
  now?: number;
  /** restrict to these unit categories, in preference order */
  cats?: Cat[];
  /** skip these lesson ids */
  skip?: string[];
}

export function recommend(o: RecOpts): Rec | null {
  const now = o.now ?? Date.now();
  const { progress } = o;
  const skip = new Set(o.skip ?? []);
  const allowed = allowedStage(progress, o.rating, now);
  // master games and mini-games are enrichment: never recommended as "next up"
  const playable = ALL.filter((r) => !r.lesson.mini && r.unit.track !== 'games' && !skip.has(r.lesson.id));
  const anyDone = Object.values(progress).some((p) => p.completedAt);
  if (!anyDone && !o.cats) {
    const first = playable[0];
    if (first) return { lessonId: first.lesson.id, kind: 'start', why: 'A good place to start: the board and the notation, so every other lesson makes sense.' };
  }
  const catOk = (u: { cat: Cat }) => !o.cats || o.cats.includes(u.cat);
  const byCat = (a: (typeof ALL)[number], b: (typeof ALL)[number]) => (o.cats ? o.cats.indexOf(a.unit.cat) - o.cats.indexOf(b.unit.cat) : 0);

  // 1. spaced review that is due
  const due = playable
    .filter((r) => masteryOf(progress[r.lesson.id], now) === 'review' && catOk(r.unit))
    .sort((a, b) => (progress[a.lesson.id].rev?.due ?? 0) - (progress[b.lesson.id].rev?.due ?? 0));
  if (due.length) return { lessonId: due[0].lesson.id, kind: 'review', why: 'A quick check on something you learned a few days ago, to lock it in.' };

  // 2. shaky material before anything new
  const shaky = playable
    .filter((r) => r.stage <= allowed && masteryOf(progress[r.lesson.id], now) === 'shaky' && catOk(r.unit))
    .sort((a, b) => byCat(a, b) || a.index - b.index);
  if (shaky.length) {
    const p = progress[shaky[0].lesson.id];
    return { lessonId: shaky[0].lesson.id, kind: 'retry', why: `You got ${Math.round((p.acc ?? 0) * 100)}% first try last time. One more go will make it stick.` };
  }

  // 3. new lessons, weakest area first, then path order
  const total = o.weaknesses.reduce((s, w) => s + w.loss, 0) || 1;
  const share: Record<string, number> = {};
  for (const w of o.weaknesses) share[w.tag] = w.loss / total;
  const fresh = playable
    .filter((r) => r.stage <= allowed && masteryOf(progress[r.lesson.id], now) === 'new' && catOk(r.unit))
    .map((r) => {
      const hit = (r.lesson.tags ?? []).reduce((s, t) => s + (share[t] ?? 0), 0);
      return { r, hit, score: hit * 10 - r.index * 0.06 - (o.cats ? o.cats.indexOf(r.unit.cat) * 0.4 : 0) };
    })
    .sort((a, b) => b.score - a.score);
  if (fresh.length) {
    const top = fresh[0];
    const tag = (top.r.lesson.tags ?? []).map((t) => o.weaknesses.find((w) => w.tag === t)).filter(Boolean)[0];
    if (top.hit > 0.05 && tag) return { lessonId: top.r.lesson.id, kind: 'weakness', why: `${tag.label} cost you the most in your recent games, so this is where I would start.` };
    return { lessonId: top.r.lesson.id, kind: 'path', why: 'Next on your path.' };
  }
  // 4. nothing new in range: freshest review of anything learned
  const next = playable.find((r) => masteryOf(progress[r.lesson.id], now) !== 'mastered' && r.stage <= allowed);
  return next ? { lessonId: next.lesson.id, kind: 'path', why: 'Another pass keeps it sharp.' } : null;
}

/** The "Next up" lesson for the current student. undefined while loading. */
export function useRecommendation(cats?: Cat[]): Rec | null | undefined {
  const progress = useLearnProgress();
  const weaknesses = useWeaknesses();
  const rating = useRating();
  return useMemo(() => {
    if (!progress || !weaknesses || rating === undefined) return undefined;
    return recommend({ progress, weaknesses, rating, cats });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, weaknesses, rating, cats?.join(',')]);
}

export function lessonsForTag(tag: string): string[] {
  return ALL.filter((r) => r.lesson.tags?.includes(tag)).map((r) => r.lesson.id);
}

export function lessonTitle(id: string): string {
  return BY_ID[id]?.lesson.title ?? id;
}
