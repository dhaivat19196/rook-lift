'use client';
import Link from 'next/link';
import { useMemo } from 'react';
import { compiled } from '@/lib/openings';
import { devBook, devMove, walkGame } from '@/lib/openings/games';
import { moveNumber } from '@/lib/openings/tree';
import { nodeHash } from '@/lib/openings/parse';
import { Card, Label } from '../ui';

/** Game review: where this game left your repertoire, with a jump into the drill at that position. */
export default function GameRepertoire({ gameId, pgn, myColor }: { gameId: string; pgn: string; myColor: 'w' | 'b' }) {
  const walk = useMemo(() => walkGame({ id: gameId, pgn, myColor }), [gameId, pgn, myColor]);
  if (!walk) return null;
  const course = compiled(walk.courseId);
  if (!course) return null;
  const d = walk.dev;
  const chapter = course.chapters.find((c) => c.id === (d?.chapterId ?? walk.chapterId));
  const node = d ? course.union.nodes[d.key] : null;
  const why = d && node ? (node.whyNot?.[d.played] ?? node.edges[0]?.idea ?? '') : '';
  const href = d && chapter ? `/learn/chapter/?course=${course.id}&ch=${chapter.id}&mode=drill&node=${nodeHash(d.key)}` : chapter ? `/learn/chapter/?course=${course.id}&ch=${chapter.id}` : `/learn/course/?id=${course.id}`;
  return (
    <Card className="mb-4">
      <Label>{course.title}: your repertoire</Label>
      {d && d.by === 'me' ? (
        <>
          <p className="mt-2 text-[15px] leading-relaxed">
            You left your repertoire on move <strong>{Math.floor(d.ply / 2) + 1}</strong>: played <strong>{devMove(d)}</strong>, repertoire move <strong>{devBook(d)}</strong>.
            {why ? <span className="text-muted"> {why}</span> : null}
          </p>
          <Link href={href} className="mt-1 inline-flex min-h-[44px] items-center text-[15px] text-accent">
            Drill that position
          </Link>
        </>
      ) : d ? (
        <>
          <p className="mt-2 text-[15px] leading-relaxed">
            {myColor === 'w' ? 'Black' : 'White'} left the book on move <strong>{Math.floor(d.ply / 2) + 1}</strong> with <strong>{moveNumber(d.ply)}{d.played}</strong>. That is not one of the lines in the course, so go back to the principle: {chapter?.tip ?? 'develop, castle and keep your pieces safe.'}
          </p>
          <Link href={href} className="mt-1 inline-flex min-h-[44px] items-center text-[15px] text-accent">
            Study this chapter
          </Link>
        </>
      ) : (
        <p className="mt-2 text-[15px] leading-relaxed text-muted">You stayed inside the course for the first {Math.ceil(walk.inBook / 2)} moves. That is the repertoire doing its job.</p>
      )}
    </Card>
  );
}
