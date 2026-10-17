'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TAG_INFO } from '@/lib/core';
import { useActiveTimer, useQueryParams } from '@/lib/hooks';
import { markActive } from '@/lib/progress';
import { dueLearnPuzzles } from '@/lib/learn/progress';
import { boxCounts, duePuzzles, NEW_PER_DAY, sortForPractice, unseenCount } from '@/lib/srs';
import { usePuzzles } from '@/lib/store';
import type { Puzzle } from '@/lib/types';
import { cn } from '@/lib/util';
import PuzzleRunner, { type PuzzleSummary } from '@/components/PuzzleRunner';
import OpeningBlock from '@/components/openings/OpeningBlock';
import { BackBar, Bar, Button, Card, Chip, CheckMark, Empty, Label, LinkButton } from '@/components/ui';

function Runner({ list, kind, onAgain }: { list: Puzzle[]; kind: string; onAgain?: () => void }) {
  const router = useRouter();
  const [summary, setSummary] = useState<PuzzleSummary | null>(null);
  useActiveTimer('spr', !summary);
  if (summary) {
    return (
      <div className="px-5 pt-10 text-center">
        <div className="flex justify-center">
          <CheckMark size={64} />
        </div>
        <h2 className="mt-5 text-[24px] font-semibold tracking-tight">{kind} done</h2>
        <p className="mt-1 text-[15px] text-muted tabular">
          {summary.solved} solved · {summary.firstTry} first try · {summary.attempted} attempted
        </p>
        {kind === 'Quick bites' ? <OpeningBlock /> : null}
        <div className="mx-auto mt-8 max-w-xs space-y-2">
          {onAgain ? <Button onClick={onAgain}>Another 5</Button> : null}
          <Button variant="secondary" onClick={() => router.push('/')}>
            Home
          </Button>
        </div>
      </div>
    );
  }
  return (
    <PuzzleRunner
      puzzles={list}
      onDone={(s) => {
        if (s.attempted > 0) void markActive();
        setSummary(s);
      }}
    />
  );
}

export default function PuzzlesPage() {
  const q = useQueryParams();
  const all = usePuzzles();
  const [tag, setTag] = useState<string | null>(null);
  const [started, setStarted] = useState<Puzzle[] | null>(null);
  const [round, setRound] = useState(0);
  const [extra, setExtra] = useState<{ round: number; list: Puzzle[] } | null>(null);
  useEffect(() => {
    // missed lesson questions that are due are mixed into Quick bites
    let live = true;
    void dueLearnPuzzles(2).then((l) => live && setExtra({ round, list: l }));
    return () => {
      live = false;
    };
  }, [round]);
  useEffect(() => {
    const t = q?.get('tag');
    if (t) setTag(t);
  }, [q]);

  if (!q || all === undefined) return null;
  const mode = q.get('mode');

  if (mode === 'quick') {
    const due = duePuzzles(all);
    const pool = due.length ? due : sortForPractice(all);
    if (!extra || extra.round !== round) return null;
    const list = [...pool.slice(0, 5), ...extra.list];
    return (
      <div>
        <BackBar title="Quick bites" href="/" />
        {list.length ? (
          <Runner key={"quick" + round} list={list} kind="Quick bites" onAgain={() => setRound((r) => r + 1)} />
        ) : (
          <div className="px-5">
            <Empty title="No puzzles yet" body="Puzzles come from the blunders found in your analyzed games. Check back after analysis runs." action={<LinkButton href="/profile/" variant="secondary">See analysis</LinkButton>} />
            <OpeningBlock />
          </div>
        )}
      </div>
    );
  }

  if (started) {
    return (
      <div>
        <BackBar title="Blunder Bank" href="/puzzles/" />
        <Runner key="bank" list={started} kind="Practice" />
      </div>
    );
  }

  const due = duePuzzles(all, tag);
  const counts = boxCounts(all);
  const maxC = Math.max(1, ...counts);
  const tagCounts: Record<string, number> = {};
  for (const p of all) for (const t of p.tags) tagCounts[t] = (tagCounts[t] ?? 0) + 1;
  const tags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]);

  return (
    <div>
      <BackBar title="Blunder Bank" href="/train/" />
      <div className="px-5">
        <h1 className="mt-2 text-[28px] font-semibold tracking-tight">Blunder Bank</h1>
        <p className="mt-1 text-[15px] text-muted">Your own mistakes, repeated on a schedule until they stick.</p>

        {all.length === 0 ? (
          <div className="mt-6">
            <Empty title="Nothing here yet" body="Once your games are analyzed, every blunder and mistake becomes a puzzle." />
          </div>
        ) : (
          <>
            <Card className="mt-6">
              <div className="flex items-end justify-between">
                <div>
                  <Label>Due now</Label>
                  <div className="mt-1 text-[34px] font-semibold leading-none tabular">{due.length}</div>
                </div>
                <div className="text-right text-[13px] text-muted tabular">
                  {all.length} in bank
                  <div>{unseenCount(all)} queued · {NEW_PER_DAY} new/day</div>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Chip active={tag === null} onClick={() => setTag(null)}>
                  All
                </Chip>
                {tags.map((t) => (
                  <Chip key={t} active={tag === t} onClick={() => setTag(tag === t ? null : t)}>
                    {TAG_INFO[t]?.label ?? t} · {tagCounts[t]}
                  </Chip>
                ))}
              </div>
              <Button className="mt-5" disabled={due.length === 0} onClick={() => setStarted(due.slice(0, 15))}>
                {due.length ? `Practice ${Math.min(15, due.length)}` : 'All caught up'}
              </Button>
              {due.length === 0 ? (
                <Button
                  variant="ghost"
                  onClick={() => setStarted(sortForPractice(all.filter((p) => !tag || p.tags.includes(tag))).slice(0, 10))}
                >
                  Practice anyway
                </Button>
              ) : null}
            </Card>

            <Card className="mt-4">
              <Label>Leitner boxes</Label>
              <div className="mt-4 space-y-3">
                {counts.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 text-[13px]">
                    <div className="w-14 text-muted">Box {i}</div>
                    <Bar value={c / maxC} className={cn('flex-1')} />
                    <div className="w-8 text-right tabular">{c}</div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[12px] text-muted">Wrong answers go back to box 0. Right answers move up: 1, 3, 7, 14, 30 days.</p>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
