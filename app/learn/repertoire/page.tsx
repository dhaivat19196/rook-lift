'use client';
import { useLiveQuery } from 'dexie-react-hooks';
import Link from 'next/link';
import { useMemo } from 'react';
import { chapterCounts, recordOf } from '@/components/openings/CourseInsights';
import { useAllCourseGames } from '@/lib/openings/useGames';
import { BackBar, Card, Label } from '@/components/ui';
import { openingFamily } from '@/lib/core';
import { db } from '@/lib/db';
import { allCompiled } from '@/lib/openings';
import { courseStats, useAllRecs } from '@/lib/openings/progress';

interface Stat {
  n: number;
  pts: number;
}
const pct = (s: Stat) => (s.n ? Math.round((s.pts / s.n) * 100) : 0);
const pts = (r: string) => (r === 'win' ? 1 : r === 'draw' ? 0.5 : 0);

/** Opening stats: your real results per course and the chapters that come up most, next to what is covered. */
export default function RepertoirePage() {
  const all = useAllCourseGames();
  const games = useLiveQuery(() => db.games.toArray(), []);
  const recs = useAllRecs();
  const courses = allCompiled();

  const uncovered = useMemo(() => {
    if (!games || !all) return null;
    const covered = new Set(all.map((x) => x.game.id));
    const fam: Record<string, Stat> = {};
    for (const g of games) {
      if (covered.has(g.id)) continue;
      const key = `${g.myColor === 'w' ? 'As White' : 'As Black'}: ${openingFamily(g.opening || g.eco)}`;
      const s = (fam[key] ??= { n: 0, pts: 0 });
      s.n += 1;
      s.pts += pts(g.result);
    }
    return Object.entries(fam)
      .sort((a, b) => b[1].n - a[1].n)
      .slice(0, 5);
  }, [games, all]);

  return (
    <div>
      <BackBar title="Openings" href="/learn/" />
      <div className="px-5 pb-10">
        <h1 className="mt-2 text-[28px] font-semibold tracking-tight">Your openings</h1>
        <p className="mt-1 text-[15px] text-muted">What you score with each course in your real games, and which chapters come up most, so you study what you actually face.</p>

        <div className="mt-6 space-y-4">
          {courses.map((c) => {
            const mine = all?.filter((x) => x.walk.courseId === c.id) ?? [];
            const rec = recordOf(mine);
            const counts = chapterCounts(mine);
            const top = Object.entries(counts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3);
            const s = courseStats(c, recs?.[c.id]);
            return (
              <Card key={c.id} className="p-0">
                <Link href={`/learn/course/?id=${c.id}`} className="block px-5 pt-4 active:bg-subtle">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[18px] font-semibold tracking-tight">{c.title}</div>
                      <div className="mt-0.5 text-[13px] text-muted">
                        {c.side === 'w' ? 'As White' : 'As Black'} · {s.total ? Math.round((s.learned / s.total) * 100) : 0}% learned
                      </div>
                    </div>
                    <div className="text-right tabular">
                      {rec.n ? (
                        <>
                          <div className="text-[20px] font-semibold leading-none">{rec.pct}%</div>
                          <div className="mt-1 text-[12px] text-muted">
                            {rec.w}W {rec.d}D {rec.l}L
                          </div>
                        </>
                      ) : (
                        <div className="text-[13px] text-muted">no games yet</div>
                      )}
                    </div>
                  </div>
                </Link>
                <div className="mt-3 border-t border-border px-5 py-3">
                  {top.length ? (
                    <ul className="space-y-1">
                      {top.map(([id, n]) => (
                        <li key={id} className="flex items-baseline justify-between gap-3 text-[14px]">
                          <Link href={`/learn/chapter/?course=${c.id}&ch=${id}`} className="min-h-[36px] py-1.5">
                            {c.chapters.find((x) => x.id === id)?.title}
                          </Link>
                          <span className="shrink-0 text-muted tabular">{n} {n === 1 ? 'game' : 'games'}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[13px] text-muted">Play this opening, sync your games, and the chapters you face will appear here.</p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {uncovered && uncovered.length ? (
          <Card className="mt-6">
            <Label>Not covered by a course</Label>
            <ul className="mt-2 space-y-1.5">
              {uncovered.map(([name, s]) => (
                <li key={name} className="text-[14px] leading-snug">
                  <span>{name}</span>
                  <span className="text-muted tabular"> {pct(s)}% · {s.n}</span>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
