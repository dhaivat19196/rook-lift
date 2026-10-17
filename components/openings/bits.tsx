'use client';
import { Chess } from 'chess.js';
import { useMemo } from 'react';
import { PNAME } from '@/lib/learn/see';
import type { LArrow } from '@/lib/learn/types';
import type { OEdge, OGraph, Side } from '@/lib/openings/types';
import { cn } from '@/lib/util';
import type { BoardArrow } from '../Board';
import { toArrows } from '../learn/bits';

export const strip = (s: string) => s.replace(/[+#!?]/g, '');

/** "1.d4 d5 2.Bf4" built from a list of SANs that starts at move 1 for White. */
export function MoveList({ sans, className, startPly = 0 }: { sans: string[]; className?: string; startPly?: number }) {
  if (!sans.length) return <div className={cn('text-[14px] text-muted', className)}>Start position</div>;
  return (
    <div className={cn('flex flex-wrap gap-x-2 gap-y-1 text-[14px] tabular text-muted', className)} aria-label="Moves so far">
      {sans.map((s, i) => {
        const ply = startPly + i;
        const white = ply % 2 === 0;
        const no = Math.floor(ply / 2) + 1;
        return (
          <span key={i} className={cn(i === sans.length - 1 && 'font-semibold text-text')}>
            {white ? `${no}.` : i === 0 ? `${no}...` : ''}
            {s}
          </span>
        );
      })}
    </div>
  );
}

export function sansOf(graph: OGraph, steps: { edge: OEdge }[]): string[] {
  void graph;
  return steps.map((s) => s.edge.san);
}

export function turnOf(fen: string): Side {
  return fen.split(' ')[1] as Side;
}

export function arrowsFor(edge: OEdge | undefined, extra: LArrow[] = []): BoardArrow[] {
  if (!edge) return toArrows(extra);
  const own = [{ from: edge.uci.slice(0, 2), to: edge.uci.slice(2, 4), c: 'g' as const }, ...(edge.arrows ?? [])];
  return toArrows([...own, ...extra]);
}

/** Which piece a SAN moves, in words ("the knight"), for hints. */
export function pieceWord(san: string): string {
  if (san.startsWith('O-O')) return 'the king (castle)';
  const c = san[0];
  const t = /[NBRQK]/.test(c) ? c.toLowerCase() : 'p';
  return 'the ' + (PNAME[t] ?? 'piece');
}

/** Try the student's move against a position; returns the SAN or null if illegal. */
export function sanOfMove(fen: string, from: string, to: string, promo?: string): string | null {
  try {
    const c = new Chess(fen);
    const m = c.move({ from, to, promotion: promo });
    return m.san;
  } catch {
    return null;
  }
}

export function useFenAfter(fen: string, uci: string | null): string {
  return useMemo(() => {
    if (!uci) return fen;
    try {
      const c = new Chess(fen);
      c.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] });
      return c.fen();
    } catch {
      return fen;
    }
  }, [fen, uci]);
}

/** Small stat line: "12 learned · 4 mastered · 3 due". */
export function StatLine({ learned, mastered, due, total, className }: { learned: number; mastered: number; due: number; total: number; className?: string }) {
  return (
    <div className={cn('text-[13px] text-muted tabular', className)}>
      {learned}/{total} learned · {mastered} mastered{due ? <span className="text-accent"> · {due} due</span> : null}
    </div>
  );
}

/** FEN after SAN moves from the start position. */
export function fenAt(moves: string): string {
  const c = new Chess();
  for (const t of moves.trim().split(/\s+/).filter(Boolean)) c.move(t.replace(/^\d+\.+/, ''));
  return c.fen();
}

/** Deterministic shuffle so the right option is not always first. */
export function seededShuffle<T>(items: T[], seed: string): T[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const rnd = () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 100000) / 100000;
  };
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
