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

export function duePuzzles(all: Puzzle[], tag?: string | null, now = Date.now()): Puzzle[] {
  return sortForPractice(all.filter((p) => isDue(p, now) && (!tag || p.tags.includes(tag))));
}

export function boxCounts(all: Puzzle[]): number[] {
  const c = [0, 0, 0, 0, 0, 0];
  for (const p of all) c[p.box]++;
  return c;
}
