'use client';
import { Chess } from 'chess.js';
import { useEffect, useState } from 'react';
import { db } from '../db';
import type { Puzzle } from '../types';

export interface GamePool {
  fens: string[];
  /** positions from the student's own games where the side to move had mate in one */
  mates: string[];
}

/** Positions from the student's own recent games (a few per game), plus their missed mates. Loaded once. */
export async function loadGamePool(limit = 30, perGame = 4): Promise<GamePool> {
  const games = await db.games.orderBy('endTime').reverse().limit(limit).toArray();
  const fens: string[] = [];
  for (const g of games) {
    try {
      const c = new Chess();
      c.loadPgn(g.pgn);
      const h = c.history({ verbose: true });
      if (h.length < 14) continue;
      for (let k = 0; k < perGame; k++) {
        const i = 8 + Math.floor(((h.length - 12) * (k + 0.5)) / perGame);
        if (h[i]) fens.push(h[i].before);
      }
    } catch {
      /* skip unreadable game */
    }
  }
  const rows = await db.kv.where('key').startsWith('puzzle:').toArray();
  const mates: string[] = [];
  for (const r of rows) {
    const p = r.value as Puzzle;
    if (p && p.tags?.includes('missed_mate') && p.bestSan?.endsWith('#')) mates.push(p.fen);
  }
  return { fens, mates };
}

export function useGamePool(): GamePool | null {
  const [pool, setPool] = useState<GamePool | null>(null);
  useEffect(() => {
    let live = true;
    void loadGamePool()
      .then((p) => live && setPool(p))
      .catch(() => live && setPool({ fens: [], mates: [] }));
    return () => {
      live = false;
    };
  }, []);
  return pool;
}
