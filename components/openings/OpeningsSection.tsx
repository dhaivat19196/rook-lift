'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { allCompiled } from '@/lib/openings';
import { courseStats, migrateOldRepertoire, useAllRecs } from '@/lib/openings/progress';
import { Label, LinkButton, Ring } from '../ui';

/** "Opening courses" on the Learn tab: one card per course with a progress ring (learned), mastered % and due count. */
export default function OpeningsSection() {
  const all = useAllRecs();
  useEffect(() => {
    void migrateOldRepertoire();
  }, []);
  const courses = allCompiled();
  const dueTotal = all ? courses.reduce((n, c) => n + courseStats(c, all[c.id]).due, 0) : 0;
  return (
    <section>
      <div className="flex items-baseline justify-between px-1">
        <Label>Opening courses</Label>
        <Link href="/learn/repertoire/" className="text-[12px] text-muted">
          Your openings
        </Link>
      </div>
      {dueTotal > 0 ? (
        <div className="mt-2">
          <LinkButton href="/learn/opening-review/" variant="secondary" className="min-h-[48px]">
            Opening review · {Math.min(dueTotal, 10)} of {dueTotal} due
          </LinkButton>
        </div>
      ) : null}
      <ul className="mt-2 space-y-2">
        {courses.map((c) => {
          const s = courseStats(c, all?.[c.id]);
          const learned = s.total ? s.learned / s.total : 0;
          const mastered = s.total ? Math.round((s.mastered / s.total) * 100) : 0;
          return (
            <li key={c.id}>
              <Link href={`/learn/course/?id=${c.id}`} className="flex min-h-[80px] items-center gap-4 rounded-2xl border border-border bg-surface px-4 py-3 active:bg-subtle">
                <Ring value={learned} label={`${Math.round(learned * 100)}%`} sub="learned" size={64} />
                <div className="min-w-0 flex-1">
                  <div className="text-[16px] font-medium leading-snug">{c.title}</div>
                  <div className="mt-0.5 text-[13px] leading-snug text-muted">{c.blurb}</div>
                  <div className="mt-1 text-[12px] text-muted tabular">
                    {c.side === 'w' ? 'White' : 'Black'} · {c.chapters.length} chapters · {mastered}% mastered
                    {s.due ? <span className="text-accent"> · {s.due} due</span> : null}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
