'use client';
import { parseHeaders, openingFromUrl, parseTimeControl } from './core';
import { db, metaGet, metaSet } from './db';
import { awardXp, checkBadges, mutateProgress, XP, type StatsMeta } from './progress';
import type { Game } from './types';
import { sleep } from './util';

const API = 'https://api.chess.com/pub/player';

interface CcSide {
  username: string;
  rating: number;
  result: string;
}
interface CcGame {
  url: string;
  uuid?: string;
  pgn?: string;
  time_control: string;
  time_class: string;
  rules: string;
  end_time: number;
  white: CcSide;
  black: CcSide;
}

const DRAWS = new Set(['agreed', 'repetition', 'stalemate', 'insufficient', '50move', 'timevsinsufficient']);

async function fetchJson<T>(url: string, tries = 3): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { headers: { Accept: 'application/json' } });
      if (r.status === 404) throw new Error('NOT_FOUND');
      if (r.status === 429 || r.status >= 500) {
        await sleep(1200 * (i + 1));
        lastErr = new Error('HTTP ' + r.status);
        continue;
      }
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return (await r.json()) as T;
    } catch (e) {
      if ((e as Error).message === 'NOT_FOUND') throw e;
      lastErr = e;
      await sleep(600);
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('Network error');
}

export function mapGame(g: CcGame, user: string): Game | null {
  if (g.rules !== 'chess' || !g.pgn) return null;
  const u = user.toLowerCase();
  const isWhite = g.white.username.toLowerCase() === u;
  const isBlack = g.black.username.toLowerCase() === u;
  if (!isWhite && !isBlack) return null;
  const me = isWhite ? g.white : g.black;
  const opp = isWhite ? g.black : g.white;
  const result: Game['result'] = me.result === 'win' ? 'win' : DRAWS.has(me.result) ? 'draw' : 'loss';
  const reason = result === 'win' ? opp.result : me.result;
  const h = parseHeaders(g.pgn);
  const { base, inc } = parseTimeControl(g.time_control);
  const id = g.uuid ?? g.url.split('/').pop() ?? g.url;
  const moveNums = [...g.pgn.matchAll(/(\d+)\.(?!\.)/g)];
  const last = moveNums.length ? Number(moveNums[moveNums.length - 1][1]) : 0;
  return {
    id,
    url: g.url,
    pgn: g.pgn,
    white: g.white.username,
    black: g.black.username,
    whiteRating: g.white.rating,
    blackRating: g.black.rating,
    myColor: isWhite ? 'w' : 'b',
    myRating: me.rating,
    oppRating: opp.rating,
    oppName: opp.username,
    result,
    reason,
    endTime: g.end_time,
    timeClass: g.time_class,
    timeControl: g.time_control,
    base,
    inc,
    eco: h.ECO ?? '',
    opening: openingFromUrl(h.ECOUrl),
    plies: last * 2,
  };
}

export interface ImportProgress {
  phase: 'archives' | 'games' | 'stats' | 'done';
  i: number;
  n: number;
  games: number;
}

export interface ImportOpts {
  username: string;
  incremental: boolean;
  includeBlitz: boolean;
  includeDaily: boolean;
  onProgress?: (p: ImportProgress) => void;
}

export interface ImportResult {
  added: number;
  newIds: string[];
  total: number;
}

export async function importGames(o: ImportOpts): Promise<ImportResult> {
  const user = o.username.trim().toLowerCase();
  if (!user) throw new Error('Enter a username');
  o.onProgress?.({ phase: 'archives', i: 0, n: 0, games: 0 });
  let archives: string[];
  try {
    archives = (await fetchJson<{ archives: string[] }>(`${API}/${user}/games/archives`)).archives ?? [];
  } catch (e) {
    if ((e as Error).message === 'NOT_FOUND') throw new Error(`No Chess.com user "${user}"`);
    throw e;
  }
  const fetched = (await metaGet<Record<string, number>>('archives:' + user)) ?? {};
  let todo = archives;
  if (o.incremental) {
    const lastTwo = new Set(archives.slice(-2));
    todo = archives.filter((a) => !fetched[a] || lastTwo.has(a));
  }
  // newest first so recent games show up quickly
  todo = todo.slice().reverse();
  const allowed = new Set(['rapid']);
  if (o.includeBlitz) allowed.add('blitz');
  if (o.includeDaily) allowed.add('daily');
  const newIds: string[] = [];
  let count = 0;
  for (let i = 0; i < todo.length; i++) {
    o.onProgress?.({ phase: 'games', i, n: todo.length, games: count });
    let data: { games: CcGame[] };
    try {
      data = await fetchJson<{ games: CcGame[] }>(todo[i]);
    } catch (e) {
      if (i === 0) throw e;
      continue;
    }
    const mapped = (data.games ?? [])
      .filter((g) => allowed.has(g.time_class))
      .map((g) => mapGame(g, user))
      .filter((g): g is Game => g !== null);
    if (mapped.length) {
      const ids = mapped.map((g) => g.id);
      const existing = new Set((await db.games.bulkGet(ids)).filter(Boolean).map((g) => g!.id));
      for (const id of ids) if (!existing.has(id)) newIds.push(id);
      await db.games.bulkPut(mapped);
      count += mapped.length;
    }
    fetched[todo[i]] = Date.now();
    await metaSet('archives:' + user, fetched);
  }
  o.onProgress?.({ phase: 'stats', i: todo.length, n: todo.length, games: count });
  try {
    const st = await fetchJson<{
      chess_rapid?: { last?: { rating: number }; best?: { rating: number } };
      tactics?: { highest?: { rating: number } };
    }>(`${API}/${user}/stats`);
    const meta: StatsMeta = {
      rapid: st.chess_rapid?.last?.rating,
      best: st.chess_rapid?.best?.rating,
      puzzle: st.tactics?.highest?.rating,
      fetchedAt: Date.now(),
    };
    await metaSet('stats', meta);
  } catch {
    /* stats are optional */
  }
  await rewardNewGames(newIds);
  void checkBadges();
  o.onProgress?.({ phase: 'done', i: todo.length, n: todo.length, games: count });
  return { added: newIds.length, newIds, total: await db.games.count() };
}

async function rewardNewGames(newIds: string[]) {
  if (!newIds.length) return;
  const games = (await db.games.bulkGet(newIds)).filter((g): g is Game => !!g);
  const maxEnd = Math.max(...games.map((g) => g.endTime));
  let reward = 0;
  await mutateProgress((p) => {
    if (p.rewardedEnd > 0) {
      reward = games.filter((g) => g.endTime > p.rewardedEnd).length;
      p.stats.games += reward;
    }
    p.rewardedEnd = Math.max(p.rewardedEnd, maxEnd);
  });
  if (reward > 0) await awardXp(reward * XP.gameSynced, reward === 1 ? 'Game synced' : `${reward} games synced`);
}
