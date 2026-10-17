'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Stars } from '@/components/learn/bits';
import NextUpCard from '@/components/learn/NextUp';
import OpeningsSection from '@/components/openings/OpeningsSection';
import { Bar, PageTitle } from '@/components/ui';
import { MASTERY_LABEL, masteryOf, useLearnProgress, type LessonProg, type Mastery } from '@/lib/learn/progress';
import { allowedStage, useRecommendation } from '@/lib/learn/recommend';
import { ALL, BY_ID, STAGES, UNITS_SORTED } from '@/lib/learn/registry';
import { useRating } from '@/lib/queries';
import { cn } from '@/lib/util';

const CHIP: Record<Mastery, string> = {
  new: 'text-muted',
  shaky: 'text-warn',
  learning: 'text-text',
  review: 'text-accent',
  mastered: 'text-accent',
};

function Node({ id, prog, next, last }: { id: string; prog?: LessonProg; next: boolean; last: boolean }) {
  const ref = BY_ID[id];
  const m = masteryOf(prog);
  const done = !!prog?.completedAt;
  return (
    <li className="relative flex gap-3">
      <div className="relative flex w-6 shrink-0 flex-col items-center">
        <span className={cn('mt-5 h-[11px] w-[11px] shrink-0 rounded-full border', done ? 'border-accent bg-accent' : next ? 'border-accent bg-surface' : 'border-border bg-surface')} />
        {!last ? <span className="w-px flex-1 bg-border" /> : null}
      </div>
      <Link href={`/learn/lesson/?id=${id}`} className={cn('mb-2 block min-h-[56px] flex-1 rounded-2xl border px-4 py-3 active:bg-subtle', next ? 'border-accent' : 'border-border')}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[16px] font-medium leading-snug">{ref.lesson.title}</div>
            <div className="mt-0.5 text-[13px] leading-snug text-muted">{ref.lesson.blurb}</div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <Stars n={prog?.stars ?? 0} />
            <span className={cn('text-[11px]', CHIP[m])}>{next && m === 'new' ? 'Next up' : MASTERY_LABEL[m]}</span>
          </div>
        </div>
      </Link>
    </li>
  );
}

export default function LearnPage() {
  const progress = useLearnProgress();
  const rating = useRating();
  const rec = useRecommendation();
  const allowed = progress && rating !== undefined ? allowedStage(progress, rating) : 0;
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const stageOpen = (id: number) => open[id] ?? id === allowed;

  const stats = useMemo(
    () =>
      STAGES.map((st) => {
        const ls = ALL.filter((r) => r.stage === st.id);
        const done = ls.filter((r) => progress?.[r.lesson.id]?.completedAt).length;
        return { st, total: ls.length, done };
      }),
    [progress],
  );

  return (
    <div>
      <PageTitle title="Learn" sub="One step at a time, from the first move to 1800." />
      <div className="space-y-4 px-5">
        <NextUpCard />

        <div className="grid grid-cols-3 gap-3">
          {[
            { href: '/learn/repertoire/', t: 'Openings', s: 'Your results' },
            { href: '/learn/games/', t: 'Master games', s: 'Study the greats' },
            { href: '/learn/lesson/?id=mg-sprint', t: 'Sprint', s: 'Square names' },
          ].map((x) => (
            <Link key={x.href} href={x.href} className="block rounded-2xl border border-border px-3 py-3 text-center active:bg-subtle">
              <div className="text-[15px] font-medium">{x.t}</div>
              <div className="mt-0.5 text-[12px] text-muted">{x.s}</div>
            </Link>
          ))}
        </div>

        <OpeningsSection />

        <div className="space-y-3 pt-2">
          {stats.map(({ st, total, done }) => {
            const later = st.id > allowed;
            const isOpen = stageOpen(st.id);
            const units = UNITS_SORTED.filter((u) => u.stage === st.id);
            if (!units.length) return null;
            return (
              <section key={st.id} className="rounded-2xl border border-border bg-surface">
                <button onClick={() => setOpen((o) => ({ ...o, [st.id]: !isOpen }))} className="flex min-h-[64px] w-full items-center justify-between gap-3 px-5 py-4 text-left">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[18px] font-semibold tracking-tight">{st.name}</span>
                      <span className="text-[12px] text-muted tabular">{st.band}</span>
                    </div>
                    <div className="mt-0.5 text-[13px] leading-snug text-muted">{later ? 'Later: after you master the basics' : st.blurb}</div>
                    <Bar value={total ? done / total : 0} className="mt-2.5" />
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-[13px] tabular">
                      {done}/{total}
                    </span>
                    <svg width="16" height="16" viewBox="0 0 16 16" className={cn('text-muted transition', isOpen && 'rotate-180')} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m4 6 4 4 4-4" />
                    </svg>
                  </div>
                </button>
                {isOpen ? (
                  <div className="space-y-5 border-t border-border px-4 pb-3 pt-4">
                    {units.map((u) => (
                      <div key={u.id}>
                        <div className="px-1">
                          <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted">{u.title}</div>
                          <div className="mt-0.5 text-[13px] leading-snug text-muted">{u.blurb}</div>
                        </div>
                        <ul className="mt-2">
                          {u.lessons.map((l, i) => (
                            <Node key={l.id} id={l.id} prog={progress?.[l.id]} next={rec?.lessonId === l.id} last={i === u.lessons.length - 1} />
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
