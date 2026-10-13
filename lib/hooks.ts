'use client';
import { useEffect, useRef, useState } from 'react';
import { addTime } from './progress';

/** Reads window.location.search after mount (static-export safe, no Suspense needed). */
export function useQueryParams(): URLSearchParams | null {
  const [q, setQ] = useState<URLSearchParams | null>(null);
  useEffect(() => {
    setQ(new URLSearchParams(window.location.search));
  }, []);
  return q;
}

/**
 * Tracks active (visible) time and flushes it to today's progress record.
 * Returns elapsed seconds in this mount.
 */
export function useActiveTimer(kind: 'ded' | 'spr', enabled = true): number {
  const [elapsed, setElapsed] = useState(0);
  const pending = useRef(0);
  useEffect(() => {
    if (!enabled) return;
    const flush = () => {
      const s = pending.current;
      if (s > 0) {
        pending.current = 0;
        void addTime(kind, s);
      }
    };
    const t = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      pending.current += 1;
      setElapsed((e) => e + 1);
      if (pending.current >= 15) flush();
    }, 1000);
    const onHide = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    document.addEventListener('visibilitychange', onHide);
    return () => {
      clearInterval(t);
      document.removeEventListener('visibilitychange', onHide);
      flush();
    };
  }, [kind, enabled]);
  return elapsed;
}
