'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LessonRunner from '@/components/learn/LessonRunner';
import { BackBar, Empty, LinkButton } from '@/components/ui';
import { useActiveTimer } from '@/lib/hooks';
import { dueItems, stepOfItem } from '@/lib/learn/progress';
import type { Lesson, Step } from '@/lib/learn/types';

const REVIEW: Lesson = {
  id: 'review',
  title: 'Review',
  blurb: 'Questions you missed before.',
  mins: 5,
  intro: '',
  steps: [],
  recap: ['a', 'b'],
  habit: '',
  rule: 'Slow down and count: the second time is where it sticks.',
};

/** Questions the student missed in earlier lessons, asked again on a spaced schedule. */
export default function ReviewPage() {
  const router = useRouter();
  const [items, setItems] = useState<{ lessonId: string; step: Step }[] | null>(null);
  useActiveTimer('spr', !!items?.length);
  useEffect(() => {
    void dueItems(12).then((rows) => {
      const out: { lessonId: string; step: Step }[] = [];
      for (const r of rows) {
        const s = stepOfItem(r);
        if (s) out.push({ lessonId: r.lessonId, step: s });
      }
      setItems(out);
    });
  }, []);
  if (!items) return null;
  if (!items.length) {
    return (
      <div>
        <BackBar title="Review" href="/learn/" />
        <div className="px-5">
          <Empty title="Nothing to review" body="No missed questions are due. They come back here a few hours or days after you miss them." action={<LinkButton href="/learn/">Back to Learn</LinkButton>} />
        </div>
      </div>
    );
  }
  return (
    <div>
      <LessonRunner lesson={REVIEW} steps={[]} mixed={items} mode="practice" onExit={() => router.push('/learn/')} />
    </div>
  );
}
