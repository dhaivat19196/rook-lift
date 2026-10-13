'use client';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type KV } from './db';
import type { Progress, Puzzle, Settings } from './types';
import { localDay } from './util';

let dirtyListener: (() => void) | null = null;
export function onKvDirty(fn: () => void) {
  dirtyListener = fn;
}

export async function kvGet<T>(key: string): Promise<T | undefined> {
  const r = await db.kv.get(key);
  return r?.value as T | undefined;
}

export async function kvSet(key: string, value: unknown): Promise<void> {
  await db.kv.put({ key, value, updatedAt: Date.now(), dirty: 1 });
  dirtyListener?.();
}

export async function kvUpdate<T>(key: string, def: () => T, fn: (v: T) => T | void): Promise<T> {
  const out = await db.transaction('rw', db.kv, async () => {
    const r = await db.kv.get(key);
    const cur = (r?.value as T | undefined) ?? def();
    const next = fn(cur) ?? cur;
    await db.kv.put({ key, value: next, updatedAt: Date.now(), dirty: 1 });
    return next;
  });
  dirtyListener?.();
  return out;
}

export async function kvByPrefix<T>(prefix: string): Promise<T[]> {
  const rows = await db.kv.where('key').startsWith(prefix).toArray();
  return rows.map((r: KV) => r.value as T);
}

export function useKV<T>(key: string, def: T): T {
  const row = useLiveQuery(() => db.kv.get(key), [key]);
  return (row?.value as T | undefined) ?? def;
}

export function useKVPrefix<T>(prefix: string): T[] | undefined {
  const rows = useLiveQuery(() => db.kv.where('key').startsWith(prefix).toArray(), [prefix]);
  return rows?.map((r) => r.value as T);
}

export const defaultSettings = (): Settings => ({
  username: 'chessdh19',
  onboarded: false,
  includeBlitz: false,
  includeDaily: false,
  speed: 'fast',
  autoAnalyze: true,
  dedicatedTarget: 25,
  sprinkleTarget: 15,
  anchorDate: localDay(),
  anchorType: 'train',
});

export function useSettings(): Settings & { loaded: boolean } {
  const row = useLiveQuery(async () => ({ r: await db.kv.get('profile') }), []);
  const s = (row?.r?.value as Partial<Settings> | undefined) ?? {};
  return { ...defaultSettings(), ...s, loaded: row !== undefined };
}

export async function getSettings(): Promise<Settings> {
  const s = await kvGet<Partial<Settings>>('profile');
  return { ...defaultSettings(), ...(s ?? {}) };
}

export async function patchSettings(p: Partial<Settings>): Promise<void> {
  await kvUpdate<Partial<Settings>>(
    'profile',
    () => ({}),
    (cur) => ({ ...cur, ...p }),
  );
}

export const defaultProgress = (): Progress => ({
  xp: 0,
  streak: { cur: 0, best: 0, last: '' },
  days: {},
  stats: { puzzles: 0, firstTry: 0, guard: 0, reviews: 0, sessions: 0, games: 0, assessments: 0 },
  badges: {},
  reviewed: {},
  rewardedEnd: 0,
  bosses: [],
});

const DEF_PROGRESS = defaultProgress();
export function useProgress(): Progress {
  const p = useKV<Progress>('progress', DEF_PROGRESS);
  return { ...DEF_PROGRESS, ...p, stats: { ...DEF_PROGRESS.stats, ...(p.stats ?? {}) } };
}

export function usePuzzles(): Puzzle[] | undefined {
  return useKVPrefix<Puzzle>('puzzle:');
}
