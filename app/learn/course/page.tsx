'use client';
import Link from 'next/link';
import { useMemo } from 'react';
import CourseInsights, { chapterCounts } from '@/components/openings/CourseInsights';
import { useCourseGames } from '@/lib/openings/useGames';
import { BackBar, Bar, Card, Label, LinkButton, Ring } from '@/components/ui';
import { useQueryParams } from '@/lib/hooks';
import { compiled } from '@/lib/openings';
import { chapterStats, courseStats, useCourseRecs } from '@/lib/openings/progress';

export default function CoursePage() {
  const q = useQueryParams();
  const id = q?.get('id') ?? '';
  const course = compiled(id);
  const recs = useCourseRecs(id);
  const games = useCourseGames(id);
  const st = useMemo(() => (course ? courseStats(course, recs) : null), [course, recs]);
  const counts = useMemo(() => (games ? chapterCounts(games) : {}), [games]);
  if (!q) return null;
  if (!course || !st) {
    return (
      <div>
        <BackBar title="Course" href="/learn/" />
        <div className="px-5 pt-6 text-muted">That course was not found.</div>
      </div>
    );
  }
  const learned = st.total ? st.learned / st.total : 0;
  const mastered = st.total ? st.mastered / st.total : 0;

  // suggested next chapter: the one you face most that is not yet learned, otherwise the first unfinished
  const rows = course.chapters.map((ch) => ({ ch, s: chapterStats(course, ch, recs) }));
  const unfinished = rows.filter((r) => r.s.learned < r.s.total);
  const byFaced = unfinished.slice().sort((a, b) => (counts[b.ch.id] ?? 0) - (counts[a.ch.id] ?? 0));
  const next = (byFaced[0] && (counts[byFaced[0].ch.id] ?? 0) > 0 ? byFaced[0] : unfinished[0]) ?? null;

  return (
    <div>
      <BackBar title="Opening course" href="/learn/" />
      <div className="px-5 pb-10">
        <h1 className="mt-2 text-[28px] font-semibold leading-tight tracking-tight">{course.title}</h1>
        <p className="mt-1 text-[15px] text-muted">{course.blurb}</p>

        <Card className="mt-5">
          <div className="flex items-center gap-5">
            <Ring value={learned} label={`${Math.round(learned * 100)}%`} sub="learned" size={96} />
            <div className="min-w-0 flex-1 text-[14px]">
              <div className="flex justify-between">
                <span className="text-muted">Mastered</span>
                <span className="tabular">{Math.round(mastered * 100)}%</span>
              </div>
              <Bar value={mastered} className="mt-1" />
              <div className="mt-3 flex justify-between">
                <span className="text-muted">Due now</span>
                <span className={st.due ? 'font-medium text-accent tabular' : 'tabular'}>{st.due}</span>
              </div>
              <div className="mt-1 flex justify-between">
                <span className="text-muted">Positions</span>
                <span className="tabular">{st.total}</span>
              </div>
            </div>
          </div>
          <p className="mt-4 text-[14px] leading-relaxed text-muted">{course.intro}</p>
          <div className="mt-4 space-y-2">
            {st.due > 0 ? <LinkButton href={`/learn/opening-review/?course=${course.id}`}>Review {Math.min(st.due, 10)} due {Math.min(st.due, 10) === 1 ? 'position' : 'positions'}</LinkButton> : null}
            {next ? (
              <LinkButton href={`/learn/chapter/?course=${course.id}&ch=${next.ch.id}`} variant={st.due > 0 ? 'secondary' : 'primary'}>
                {next.s.learned === 0 ? 'Start' : 'Continue'}: {next.ch.title}
              </LinkButton>
            ) : null}
          </div>
        </Card>

        <div className="mt-4">
          <CourseInsights course={course} games={games} />
        </div>

        <div className="mt-6">
          <Label className="px-1">Chapters</Label>
          <ul className="mt-2 space-y-2">
            {rows.map(({ ch, s }, i) => {
              const faced = counts[ch.id] ?? 0;
              return (
                <li key={ch.id}>
                  <Link href={`/learn/chapter/?course=${course.id}&ch=${ch.id}`} className="block min-h-[64px] rounded-2xl border border-border bg-surface px-4 py-3 active:bg-subtle">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[16px] font-medium leading-snug">
                          <span className="mr-1.5 text-muted tabular">{i + 1}.</span>
                          {ch.title}
                        </div>
                        <div className="mt-0.5 text-[13px] leading-snug text-muted">{ch.blurb}</div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1 text-[12px] tabular">
                        {s.due ? <span className="rounded-full bg-accent px-2 py-0.5 font-medium text-accent-fg">{s.due} due</span> : null}
                        <span className="text-muted">
                          {s.learned}/{s.total}
                        </span>
                      </div>
                    </div>
                    <Bar value={s.total ? s.learned / s.total : 0} className="mt-2.5" />
                    {faced ? <div className="mt-2 text-[12px] text-muted">You met this in {faced} of your games</div> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
