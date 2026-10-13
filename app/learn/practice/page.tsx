'use client';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import LessonRunner from '@/components/learn/LessonRunner';
import { BackBar, Empty, LinkButton } from '@/components/ui';
import { TAG_INFO } from '@/lib/core';
import { useActiveTimer, useQueryParams } from '@/lib/hooks';
import { useGamePool } from '@/lib/learn/pool';
import { BY_ID, scoredSteps } from '@/lib/learn/registry';
import type { Step } from '@/lib/learn/types';
import { shuffle } from '@/lib/util';

/** Endless fresh practice for one lesson's skill: generated items at the student's level, or the lesson's own questions shuffled. */
export default function PracticePage() {
  const q = useQueryParams();
  const router = useRouter();
  const [round, setRound] = useState(0);
  const pool = useGamePool();
  const id = q?.get('lesson') ?? '';
  const ref = BY_ID[id];
  useActiveTimer('spr', !!ref);

  const steps = useMemo<Step[]>(() => {
    if (!ref) return [];
    if (ref.lesson.skill) return [{ id: 'pm', t: 'gen', skill: ref.lesson.skill, n: 10, phase: 'practice' }];
    return shuffle(scoredSteps(ref.lesson)).slice(0, 8);
    // a new set each round
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, round]);

  if (!q) return null;
  if (!ref) {
    return (
      <div>
        <BackBar title="Practice" href="/learn/" />
        <div className="px-5 pt-6 text-muted">That lesson was not found.</div>
      </div>
    );
  }
  if (!steps.length) {
    const tag = ref.lesson.tags?.[0];
    return (
      <div>
        <BackBar title="Practice" href="/learn/" />
        <div className="px-5">
          <Empty
            title="Practise this from your own games"
            body="This lesson has no extra drills, but your Blunder Bank has positions with the same idea."
            action={<LinkButton href={tag ? `/puzzles/?tag=${tag}` : '/puzzles/'}>{tag ? `Open ${TAG_INFO[tag]?.label ?? 'Blunder Bank'}` : 'Open Blunder Bank'}</LinkButton>}
          />
        </div>
      </div>
    );
  }
  return (
    <div>
      <LessonRunner key={round} lesson={ref.lesson} steps={steps} mode="practice" pool={pool?.fens} mates={pool?.mates} onAgain={() => setRound((r) => r + 1)} onExit={() => router.push('/learn/')} />
    </div>
  );
}
