'use client';
import ChapterView from '@/components/openings/ChapterView';
import { BackBar } from '@/components/ui';
import { useQueryParams } from '@/lib/hooks';
import { compiled } from '@/lib/openings';

export default function ChapterPage() {
  const q = useQueryParams();
  if (!q) return null;
  const course = compiled(q.get('course') ?? '');
  const chapter = course?.chapters.find((c) => c.id === q.get('ch'));
  if (!course || !chapter) {
    return (
      <div>
        <BackBar title="Chapter" href="/learn/" />
        <div className="px-5 pt-6 text-muted">That chapter was not found.</div>
      </div>
    );
  }
  return <ChapterView key={course.id + chapter.id} course={course} chapter={chapter} initialMode={q.get('mode')} nodeParam={q.get('node')} />;
}
