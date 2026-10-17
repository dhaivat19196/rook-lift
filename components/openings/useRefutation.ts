'use client';
import { Chess } from 'chess.js';
import { useEffect, useState } from 'react';
import { myWin } from '@/lib/core';
import { getUiEngine } from '@/lib/engine';
import type { Side } from '@/lib/openings/types';

export interface Refutation {
  /** win-percentage points the student's move gives up compared with the best move (0..100) */
  loss: number;
  /** the engine's best reply to the move, as UCI */
  reply: string | null;
  replySan: string | null;
}

/**
 * Quick engine look at a wrong move: how much does it cost, and what is the reply that punishes it?
 * `null` while there is nothing to look at, 'loading' while the engine thinks.
 */
export function useRefutation(fenBefore: string | null, wrongUci: string | null, side: Side): Refutation | 'loading' | null {
  const [res, setRes] = useState<Refutation | 'loading' | null>(null);
  useEffect(() => {
    if (!fenBefore || !wrongUci) {
      setRes(null);
      return;
    }
    let live = true;
    setRes('loading');
    void (async () => {
      try {
        const eng = getUiEngine();
        const c = new Chess(fenBefore);
        const m = c.move({ from: wrongUci.slice(0, 2), to: wrongUci.slice(2, 4), promotion: wrongUci[4] });
        const afterFen = c.fen();
        const before = await eng.analyse(fenBefore, { depth: 11 });
        const after = await eng.analyse(afterFen, { depth: 11 });
        if (!live) return;
        const loss = Math.max(0, myWin(before.ev, side) - myWin(after.ev, side));
        const best = after.pv[0] ?? null;
        let san: string | null = null;
        if (best) {
          try {
            san = new Chess(afterFen).move({ from: best.slice(0, 2), to: best.slice(2, 4), promotion: best[4] }).san;
          } catch {
            san = null;
          }
        }
        void m;
        setRes({ loss, reply: best, replySan: san });
      } catch {
        if (live) setRes(null);
      }
    })();
    return () => {
      live = false;
    };
  }, [fenBefore, wrongUci, side]);
  return res;
}
