'use client';
import type { Puzzle } from './types';
import { kvSet } from './store';

export const INTERVAL_DAYS = [0, 1, 3, 7, 14, 30];
const DAY = 86400000;

export function applySrs(p: Puzzle, ok: boolean, now = Date.now()): Puzzle {
  const box = ok ? Math.min(5, p.box + 1) : 0;
  return {
    ...p,
    box,
    due: now + INTERVAL_DAYS[box] * DAY,
    hist: [...p.hist, { t: now, ok }].slice(-12),
  };
}

export async function savePuzzle(p: Puzzle) {
  await kvSet('puzzle:' + p.id, p);
}

export function isDue(p: Puzzle, now = Date.now()): boolean {
  return p.due <= now;
}

/** Lowest box first, then most recent game first. */
export function sortForPractice(list: Puzzle[]): Puzzle[] {
  return list.slice().sort((a, b) => a.box - b.box || b.gameEnd - a.gameEnd || b.loss - a.loss);
}

/** New (never attempted) puzzles introduced per day, so the bank feeds in gradually. */
export const NEW_PER_DAY = 10;

function startOfToday(now: number): number {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * Reviews that are due, plus up to NEW_PER_DAY unseen puzzles (minus those already started today).
 * New ones are picked from the most recent games first, worst mistakes first — current habits matter most.
 */
export function duePuzzles(all: Puzzle[], tag?: string | null, now = Date.now()): Puzzle[] {
  const pool = all.filter((p) => !tag || p.tags.includes(tag));
  const reviews = pool.filter((p) => p.hist.length > 0 && isDue(p, now));
  const dayStart = startOfToday(now);
  const startedToday = all.filter((p) => p.hist.length > 0 && p.hist[0].t >= dayStart).length;
  const slots = Math.max(0, NEW_PER_DAY - startedToday);
  const fresh = pool
    .filter((p) => p.hist.length === 0)
    .sort((a, b) => b.gameEnd - a.gameEnd || b.loss - a.loss)
    .slice(0, slots);
  return [...sortForPractice(reviews), ...fresh];
}

export function unseenCount(all: Puzzle[]): number {
  return all.filter((p) => p.hist.length === 0).length;
}

export function boxCounts(all: Puzzle[]): number[] {
  const c = [0, 0, 0, 0, 0, 0];
  for (const p of all) c[p.box]++;
  return c;
}
