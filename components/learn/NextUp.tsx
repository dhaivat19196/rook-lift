'use client';
import Link from 'next/link';
import { Card, Label, LinkButton } from '@/components/ui';
import { useDueItemCount } from '@/lib/learn/progress';
import { useRecommendation } from '@/lib/learn/recommend';
import { BY_ID } from '@/lib/learn/registry';

export default function NextUpCard({ compact }: { compact?: boolean }) {
  const rec = useRecommendation();
  const due = useDueItemCount();
  if (rec === undefined) return null;
  const ref = rec ? BY_ID[rec.lessonId] : null;
  const kindLabel = rec?.kind === 'review' ? 'Quick review' : rec?.kind === 'retry' ? 'Try again' : rec?.kind === 'start' ? 'Start here' : 'Next up';
  return (
    <Card>
      <Label>{kindLabel}</Label>
      {ref && rec ? (
        <>
          <div className="mt-1 text-[20px] font-semibold leading-snug tracking-tight">{ref.lesson.title}</div>
          <p className="mt-1 text-[14px] leading-snug text-muted">{ref.lesson.blurb}</p>
          <p className="mt-2 text-[13px] leading-snug text-muted">{rec.why}</p>
          <div className="mt-4 flex items-center gap-3">
            <LinkButton href={`/learn/lesson/?id=${ref.lesson.id}${rec.kind === 'review' ? '&review=1' : ''}`} className="flex-1">
              {rec.kind === 'review' ? 'Start review' : 'Start lesson'}
            </LinkButton>
            <span className="whitespace-nowrap text-[13px] text-muted tabular">{ref.lesson.mins} min</span>
          </div>
        </>
      ) : (
        <p className="mt-1 text-[15px] text-muted">You are all caught up. Browse the path below, or practise a skill again.</p>
      )}
      {!compact && due > 0 ? (
        <Link href="/learn/review/" className="mt-3 block min-h-[44px] rounded-xl border border-border px-4 py-3 text-[14px] active:bg-subtle">
          {due} {due === 1 ? 'question' : 'questions'} to review <span className="text-muted">· ones you missed</span>
        </Link>
      ) : null}
    </Card>
  );
}

