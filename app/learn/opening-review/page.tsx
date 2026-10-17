'use client';
import { useRouter } from 'next/navigation';
import DueReview from '@/components/openings/DueReview';
import { BackBar } from '@/components/ui';
import { useActiveTimer, useQueryParams } from '@/lib/hooks';
import { markActive } from '@/lib/progress';

export default function OpeningReviewPage() {
  const q = useQueryParams();
  const router = useRouter();
  useActiveTimer('spr', true);
  if (!q) return null;
  const course = q.get('course') ?? undefined;
  return (
    <div>
      <BackBar title="Opening review" href={course ? `/learn/course/?id=${course}` : '/learn/'} />
      <DueReview
        courseId={course}
        limit={10}
        doneLabel="Back to Learn"
        onDone={() => {
          void markActive();
          router.push(course ? `/learn/course/?id=${course}` : '/learn/');
        }}
      />
    </div>
  );
}
