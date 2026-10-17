'use client';
import { useEffect, useMemo, useState } from 'react';
import { useActiveTimer } from '@/lib/hooks';
import { markActive } from '@/lib/progress';
import { nodeHash } from '@/lib/openings/parse';
import { chapterStats, useCourseRecs } from '@/lib/openings/progress';
import type { CompiledChapter, CompiledCourse } from '@/lib/openings/types';
import { BackBar, Bar, Segmented } from '../ui';
import DrillMode from './DrillMode';
import LearnMode from './LearnMode';
import PlansMode from './PlansMode';
import SparMode from './SparMode';
import TrapsMode from './TrapsMode';

export type Mode = 'learn' | 'drill' | 'plans' | 'traps' | 'spar';
const MODES: { id: Mode; label: string }[] = [
  { id: 'learn', label: 'Learn' },
  { id: 'drill', label: 'Drill' },
  { id: 'plans', label: 'Plans' },
  { id: 'traps', label: 'Traps' },
  { id: 'spar', label: 'Spar' },
];

export default function ChapterView({ course, chapter, initialMode, nodeParam }: { course: CompiledCourse; chapter: CompiledChapter; initialMode?: string | null; nodeParam?: string | null }) {
  const recs = useCourseRecs(course.id);
  const [mode, setMode] = useState<Mode>((MODES.find((m) => m.id === initialMode)?.id ?? 'learn') as Mode);
  useActiveTimer('spr', true);
  useEffect(() => {
    void markActive();
  }, []);
  const st = useMemo(() => chapterStats(course, chapter, recs), [course, chapter, recs]);
  // a link from a game review points at a position by hash
  const startNode = useMemo(() => {
    if (!nodeParam) return null;
    const hit = Object.keys(chapter.graph.nodes).find((k) => nodeHash(k) === nodeParam);
    return hit ?? null;
  }, [nodeParam, chapter.graph]);

  const learnedPct = st.total ? Math.round((st.learned / st.total) * 100) : 0;
  const masteredPct = st.total ? Math.round((st.mastered / st.total) * 100) : 0;

  return (
    <div>
      <BackBar title={course.title} href={`/learn/course/?id=${course.id}`} />
      <div className="px-5">
        <h1 className="mt-2 text-[26px] font-semibold leading-tight tracking-tight">{chapter.title}</h1>
        <p className="mt-1 text-[15px] text-muted">{chapter.blurb}</p>
        <div className="mt-4 grid grid-cols-3 gap-3 text-[13px]">
          <div>
            <div className="text-muted">Learned</div>
            <div className="text-[17px] font-semibold tabular">{learnedPct}%</div>
            <Bar value={st.total ? st.learned / st.total : 0} className="mt-1" />
          </div>
          <div>
            <div className="text-muted">Mastered</div>
            <div className="text-[17px] font-semibold tabular">{masteredPct}%</div>
            <Bar value={st.total ? st.mastered / st.total : 0} className="mt-1" />
          </div>
          <div>
            <div className="text-muted">Due</div>
            <div className={st.due ? 'text-[17px] font-semibold tabular text-accent' : 'text-[17px] font-semibold tabular'}>{st.due}</div>
            <div className="mt-1 text-[11px] text-muted">{st.total} positions</div>
          </div>
        </div>
        <div className="mt-5">
          <Segmented value={mode} options={MODES} onChange={setMode} />
        </div>
        <div className="mt-5 pb-10">
          {mode === 'learn' ? <LearnMode course={course} chapter={chapter} recs={recs} /> : null}
          {mode === 'drill' ? <DrillMode course={course} chapter={chapter} recs={recs} startNode={startNode} /> : null}
          {mode === 'plans' ? <PlansMode course={course} chapter={chapter} /> : null}
          {mode === 'traps' ? <TrapsMode course={course} chapter={chapter} /> : null}
          {mode === 'spar' ? <SparMode course={course} chapter={chapter} /> : null}
        </div>
      </div>
    </div>
  );
}
