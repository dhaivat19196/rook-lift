'use client';
import Link from 'next/link';
import { useMemo } from 'react';
import { moveNumber } from '@/lib/openings/tree';
import { nodeHash } from '@/lib/openings/parse';
import { topSlips } from '@/lib/openings/games';
import type { CompiledCourse } from '@/lib/openings/types';
import { Card, Label } from '../ui';
import type { CourseGame } from '@/lib/openings/useGames';

export function recordOf(games: CourseGame[]) {
  let w = 0;
  let d = 0;
  let l = 0;
  for (const { game } of games) {
    if (game.result === 'win') w++;
    else if (game.result === 'draw') d++;
    else l++;
  }
  return { w, d, l, n: games.length, pct: games.length ? Math.round(((w + d / 2) / games.length) * 100) : 0 };
}

/** Counts by chapter (the chapter where each game stayed in the book longest). */
export function chapterCounts(games: CourseGame[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const { walk } of games) out[walk.chapterId] = (out[walk.chapterId] ?? 0) + 1;
  return out;
}

/** "Your games vs your repertoire": record, the chapters you face, and the slip you repeat most. */
export default function CourseInsights({ course, games }: { course: CompiledCourse; games: CourseGame[] | undefined }) {
  const rec = useMemo(() => (games ? recordOf(games) : null), [games]);
  const recent = useMemo(() => (games ?? []).slice(0, 10), [games]);
  const slips = useMemo(() => topSlips(recent.map((x) => x.walk)), [recent]);
  const counts = useMemo(() => (games ? chapterCounts(games) : {}), [games]);
  const faced = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  const inBookAvg = recent.length ? recent.reduce((s, x) => s + x.walk.inBook, 0) / recent.length : 0;

  if (!games) return null;
  if (!games.length) {
    return (
      <Card>
        <Label>Your games</Label>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">I have not found any of your imported games in this course yet. Once you play it and sync your games, this is where I will show what you score and where you left the book.</p>
      </Card>
    );
  }
  const top = slips[0];
  const bookNode = top ? course.union.nodes[top.key] : null;
  const bookEdge = bookNode?.edges[0];
  const why = top && bookNode ? (bookNode.whyNot?.[top.played] ?? bookEdge?.idea ?? '') : '';
  const ch = top ? course.chapters.find((c) => c.id === top.chapterId) : null;

  return (
    <Card>
      <Label>Your games vs your repertoire</Label>
      {rec ? (
        <div className="mt-3 flex items-end justify-between">
          <div>
            <div className="text-[34px] font-semibold leading-none tabular">{rec.pct}%</div>
            <div className="mt-1 text-[13px] text-muted tabular">
              {rec.w}W {rec.d}D {rec.l}L · {rec.n} {rec.n === 1 ? 'game' : 'games'}
            </div>
          </div>
          <div className="text-right text-[13px] text-muted">
            In the book for
            <div className="text-[17px] font-semibold text-text tabular">{(inBookAvg / 2).toFixed(1)} moves</div>
            on average
          </div>
        </div>
      ) : null}

      {top && top.count >= 2 && ch ? (
        <div className="mt-4 rounded-xl border border-border bg-subtle p-3.5">
          <p className="text-[15px] leading-relaxed">
            In <strong>{top.count}</strong> of your last {recent.length} {course.gamesName} games you played <strong>{moveNumber(top.ply)}{top.played}</strong> at the same spot. The course plays <strong>{moveNumber(top.ply)}{top.book}</strong>.
            {why ? <span className="text-muted"> {why}</span> : null}
          </p>
          <Link href={`/learn/chapter/?course=${course.id}&ch=${ch.id}&mode=drill&node=${nodeHash(top.key)}`} className="mt-1 inline-flex min-h-[44px] items-center text-[15px] text-accent">
            Drill that position
          </Link>
        </div>
      ) : top ? (
        <div className="mt-4 rounded-xl border border-border bg-subtle p-3.5">
          <p className="text-[15px] leading-relaxed">
            In one of your recent games you played <strong>{moveNumber(top.ply)}{top.played}</strong> where the course plays <strong>{moveNumber(top.ply)}{top.book}</strong>.
            {why ? <span className="text-muted"> {why}</span> : null}
          </p>
          {ch ? (
            <Link href={`/learn/chapter/?course=${course.id}&ch=${ch.id}&mode=drill&node=${nodeHash(top.key)}`} className="mt-1 inline-flex min-h-[44px] items-center text-[15px] text-accent">
              Drill that position
            </Link>
          ) : null}
        </div>
      ) : (
        <p className="mt-4 text-[15px] leading-relaxed text-muted">In your recent games you stayed on the course whenever the course had an answer. That is the habit.</p>
      )}

      {faced.length ? (
        <div className="mt-4">
          <div className="text-[12px] text-muted">What you face most</div>
          <ul className="mt-1 divide-y divide-border">
            {faced.map(([id, n]) => {
              const c = course.chapters.find((x) => x.id === id);
              if (!c) return null;
              return (
                <li key={id}>
                  <Link href={`/learn/chapter/?course=${course.id}&ch=${id}`} className="flex min-h-[44px] items-center justify-between gap-3 py-2 text-[14px]">
                    <span>{c.title}</span>
                    <span className="shrink-0 text-muted tabular">
                      {n} {n === 1 ? 'game' : 'games'}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </Card>
  );
}
