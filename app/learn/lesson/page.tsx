'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import LessonRunner from '@/components/learn/LessonRunner';
import MiniGame from '@/components/learn/MiniGames';
import { Stars } from '@/components/learn/bits';
import { BackBar, Button, Card, Label } from '@/components/ui';
import { useActiveTimer, useQueryParams } from '@/lib/hooks';
import { useGamePool } from '@/lib/learn/pool';
import { MASTERY_LABEL, masteryOf, useLearnProgress } from '@/lib/learn/progress';
import { recommend, useWeaknesses } from '@/lib/learn/recommend';
import { BY_ID, scoredSteps } from '@/lib/learn/registry';
import type { Step } from '@/lib/learn/types';
import { redirectForOldLesson } from '@/lib/openings/progress';
import { useRating } from '@/lib/queries';
import { shuffle } from '@/lib/util';

export default function LessonPage() {
  const q = useQueryParams();
  const router = useRouter();
  const id = q?.get('id') ?? '';
  const review = q?.get('review') === '1';
  const ref = BY_ID[id];
  const progress = useLearnProgress();
  const weaknesses = useWeaknesses();
  const rating = useRating();
  const pool = useGamePool();
  const [started, setStarted] = useState(false);
  useActiveTimer('ded', started || !!ref?.lesson.mini);

  const nextRec = useMemo(() => {
    if (!progress || !weaknesses || rating === undefined) return null;
    return recommend({ progress, weaknesses, rating, skip: [id] });
  }, [progress, weaknesses, rating, id]);

  // a short spaced check: three of the lesson's own questions (or three generated ones)
  const reviewSteps = useMemo<Step[] | undefined>(() => {
    if (!ref || !review) return undefined;
    const own = shuffle(scoredSteps(ref.lesson)).slice(0, 3);
    if (own.length >= 3) return own;
    const sk = ref.lesson.skill;
    return sk ? [{ id: 'rv', t: 'gen', skill: sk, n: 3, phase: 'practice' }] : own;
  }, [ref, review]);

  // interleaving: two earlier practice questions, preferring lessons that are still shaky
  const mixed = useMemo(() => {
    if (review || !progress || !started) return [];
    const earlier = Object.values(progress)
      .filter((p) => p.completedAt && p.id !== id && BY_ID[p.id])
      .sort((a, b) => (a.acc ?? 1) - (b.acc ?? 1))
      .slice(0, 6);
    const out: { lessonId: string; step: Step }[] = [];
    for (const p of shuffle(earlier)) {
      const s = scoredSteps(BY_ID[p.id].lesson);
      if (s.length) out.push({ lessonId: p.id, step: s[Math.floor(Math.random() * s.length)] });
      if (out.length >= 2) break;
    }
    return out;
    // only decided once, when the lesson starts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started]);

  const moved = redirectForOldLesson(id);
  useEffect(() => {
    if (moved) router.replace(moved);
  }, [moved, router]);
  if (!q) return null;
  if (moved) return <div className="px-5 pt-10 text-muted">This lesson is now part of an opening course. Taking you there...</div>;
  if (!ref) {
    return (
      <div>
        <BackBar title="Lesson" href="/learn/" />
        <div className="px-5 pt-6 text-muted">That lesson was not found.</div>
      </div>
    );
  }
  const { lesson } = ref;
  const prog = progress?.[id];
  const exit = () => router.push('/learn/');

  if (lesson.mini) {
    return (
      <div>
        <BackBar title={lesson.title} href="/learn/" />
        <MiniGame kind={lesson.mini} lessonId={lesson.id} onExit={exit} />
      </div>
    );
  }

  if (!started) {
    const m = masteryOf(prog);
    return (
      <div>
        <BackBar title="" href="/learn/" />
        <div className="px-5">
          <Label>{ref.unit.title}</Label>
          <h1 className="mt-1 text-[28px] font-semibold leading-tight tracking-tight">{lesson.title}</h1>
          <p className="mt-2 text-[15px] text-muted">
            About {lesson.mins} minutes{prog?.completedAt ? ` · ${MASTERY_LABEL[m]}` : ''}
          </p>
          {prog?.stars ? <Stars n={prog.stars} size={18} className="mt-2" /> : null}
          <Card className="mt-6">
            <Label>Your coach</Label>
            <p className="mt-2 text-[16px] leading-relaxed">{review ? "Let's see what stuck. Three quick questions from this lesson, no pressure." : lesson.intro}</p>
          </Card>
          <div className="mt-6 space-y-2">
            <Button onClick={() => setStarted(true)}>{review ? 'Start the check' : prog?.completedAt ? 'Go through it again' : 'Start'}</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <LessonRunner
        lesson={lesson}
        mode={review ? 'review' : 'lesson'}
        steps={reviewSteps}
        mixed={mixed}
        pool={pool?.fens}
        mates={pool?.mates}
        onExit={exit}
        nextHref={nextRec ? `/learn/lesson/?id=${nextRec.lessonId}` : undefined}
        nextTitle={nextRec ? BY_ID[nextRec.lessonId]?.lesson.title : undefined}
      />
    </div>
  );
}
