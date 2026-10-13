'use client';
import { useMemo, useState } from 'react';
import { useGamePool } from '@/lib/learn/pool';
import { useLearnProgress } from '@/lib/learn/progress';
import { dailyCats, recommend, useWeaknesses } from '@/lib/learn/recommend';
import { BY_ID, scoredSteps } from '@/lib/learn/registry';
import type { Step } from '@/lib/learn/types';
import { useRating } from '@/lib/queries';
import { localDay, shuffle } from '@/lib/util';
import { Button, Card, Empty, Label } from '../ui';
import LessonRunner, { type RunSummary } from './LessonRunner';

export interface LessonFacts {
  title: string;
  acc: number | null;
  lessonId: string;
}

/** The "Lesson" step of the daily session: today's pick from the daily mix, introduced by the coach. */
export default function DailyLesson({ onDone, onSkip }: { onDone: (f: LessonFacts | null) => void; onSkip: () => void }) {
  const progress = useLearnProgress();
  const weaknesses = useWeaknesses();
  const rating = useRating();
  const pool = useGamePool();
  const [started, setStarted] = useState(false);
  const cats = useMemo(() => dailyCats(localDay()), []);
  const rec = useMemo(() => {
    if (!progress || !weaknesses || rating === undefined) return undefined;
    return recommend({ progress, weaknesses, rating, cats }) ?? recommend({ progress, weaknesses, rating });
  }, [progress, weaknesses, rating, cats]);

  const ref = rec ? BY_ID[rec.lessonId] : null;
  const reviewSteps = useMemo<Step[] | undefined>(() => {
    if (!ref || rec?.kind !== 'review') return undefined;
    const own = shuffle(scoredSteps(ref.lesson)).slice(0, 3);
    if (own.length >= 3) return own;
    return ref.lesson.skill ? [{ id: 'rv', t: 'gen', skill: ref.lesson.skill, n: 3, phase: 'practice' }] : own;
  }, [ref, rec?.kind]);

  if (rec === undefined) return <div className="px-5 py-10 text-muted">Picking today&apos;s lesson...</div>;
  if (!ref || !rec) {
    return (
      <div className="px-5">
        <Empty title="Nothing to learn right now" body="You are up to date with the path. Carry on." action={<Button onClick={onSkip}>Continue</Button>} />
      </div>
    );
  }
  if (!started) {
    return (
      <div className="px-5">
        <Card>
          <Label>{rec.kind === 'review' ? 'A quick check' : "Today's lesson"}</Label>
          <div className="mt-1 text-[22px] font-semibold leading-snug tracking-tight">{ref.lesson.title}</div>
          <p className="mt-2 text-[15px] leading-relaxed">{rec.kind === 'review' ? 'Three questions from a lesson you did a few days ago, to lock it in.' : ref.lesson.intro}</p>
          <p className="mt-2 text-[13px] text-muted">{rec.why}</p>
          <Button className="mt-4" onClick={() => setStarted(true)}>
            Start
          </Button>
        </Card>
      </div>
    );
  }
  return (
    <LessonRunner
      lesson={ref.lesson}
      mode={rec.kind === 'review' ? 'review' : 'lesson'}
      steps={reviewSteps}
      pool={pool?.fens}
      mates={pool?.mates}
      onExit={onSkip}
      embedded={{
        doneLabel: 'Next step',
        onFinish: (s: RunSummary) => onDone({ title: ref.lesson.title, acc: s.scored ? s.correct / s.scored : null, lessonId: ref.lesson.id }),
      }}
    />
  );
}
