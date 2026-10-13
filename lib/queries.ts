'use client';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, metaGet } from './db';
import { currentRating, type StatsMeta } from './progress';
import type { Game } from './types';

export function useAnalysedIds(): Set<string> | undefined {
  return useLiveQuery(async () => {
    const keys = await db.kv.where('key').startsWith('analysis:').primaryKeys();
    return new Set(keys.map((k) => String(k).slice('analysis:'.length)));
  }, []);
}

export function useRecentGames(limit = 40): Game[] | undefined {
  return useLiveQuery(() => db.games.orderBy('endTime').reverse().limit(limit).toArray(), [limit]);
}

export function useGameCount(): number | undefined {
  return useLiveQuery(() => db.games.count(), []);
}

export function useRating(): number | null | undefined {
  return useLiveQuery(async () => {
    // depend on both tables so it refreshes after import
    await db.games.count();
    return currentRating();
  }, []);
}

export function useStatsMeta(): StatsMeta | undefined {
  return useLiveQuery(() => metaGet<StatsMeta>('stats'), []);
}
