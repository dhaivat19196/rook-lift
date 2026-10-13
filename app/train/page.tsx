'use client';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useAnalysisQueue } from '@/lib/analysisQueue';
import { duePuzzles } from '@/lib/srs';
import { usePuzzles } from '@/lib/store';
import { Bar, Card, PageTitle } from '@/components/ui';

function Tile({ href, title, sub, right }: { href: string; title: string; sub: string; right?: ReactNode }) {
  return (
    <Link href={href} className="block">
      <Card className="flex min-h-[76px] items-center justify-between gap-4 p-4 active:bg-subtle">
        <div>
          <div className="text-[17px] font-semibold tracking-tight">{title}</div>
          <div className="mt-0.5 text-[13px] text-muted">{sub}</div>
        </div>
        {right ?? (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="rgb(var(--muted))" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="m7 3 6 6-6 6" />
          </svg>
        )}
      </Card>
    </Link>
  );
}

export default function TrainPage() {
  const puzzles = usePuzzles();
  const q = useAnalysisQueue();
  const due = puzzles ? duePuzzles(puzzles).length : 0;
  return (
    <div>
      <PageTitle title="Train" sub="Fix the habits that cost you games." />
      <div className="space-y-3 px-5">
        <Tile href="/session/" title="Daily session" sub="Review · Blunder Bank · Endgame · about 30 min" />
        <Tile
          href="/puzzles/"
          title="Blunder Bank"
          sub={puzzles ? `${puzzles.length} positions from your own games` : 'Your own mistakes, repeated until fixed'}
          right={due > 0 ? <span className="whitespace-nowrap rounded-full bg-accent px-3 py-1 text-[13px] font-medium text-accent-fg tabular">{due} due</span> : undefined}
        />
        <Tile href="/guard/" title="Guard Duty" sub="Spot every hanging piece in positions from your games" />
        <Tile href="/endgames/" title="Endgames" sub="Practice the essentials against Stockfish" />
        <Tile href="/review/" title="Review a game" sub="Replay with eval, tag why you erred" />
        {q.total > 0 ? (
          <Card className="p-4">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-muted">{q.done >= q.total ? 'All games analyzed' : q.paused ? 'Analysis paused' : 'Analyzing games'}</span>
              <span className="tabular">
                {q.done}/{q.total}
              </span>
            </div>
            <Bar value={q.total ? q.done / q.total : 0} className="mt-2" />
          </Card>
        ) : null}
      </div>
    </div>
  );
}
