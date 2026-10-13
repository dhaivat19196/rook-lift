'use client';
import Link from 'next/link';
import { Stars } from '@/components/learn/bits';
import { BackBar, Card } from '@/components/ui';
import { MASTERY_LABEL, masteryOf, useLearnProgress } from '@/lib/learn/progress';
import { GAMES, STAGES } from '@/lib/learn/registry';

/** Library of annotated master games: watch with comments, or guess the master's move. */
export default function GamesPage() {
  const progress = useLearnProgress();
  const games = GAMES.slice().sort((a, b) => a.level - b.level || a.year - b.year);
  return (
    <div>
      <BackBar title="Master games" href="/learn/" />
      <div className="px-5">
        <h1 className="mt-2 text-[28px] font-semibold tracking-tight">Master games</h1>
        <p className="mt-1 text-[15px] text-muted">Classic games with comments on the key moments. Watch one through, then try to guess the moves.</p>
        <div className="mt-6 space-y-3">
          {games.map((g) => {
            const p = progress?.[`game-${g.id}`];
            return (
              <Link key={g.id} href={`/learn/lesson/?id=game-${g.id}`} className="block">
                <Card className="p-4 active:bg-subtle">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[17px] font-semibold leading-snug tracking-tight">
                        {g.white} vs {g.black}
                      </div>
                      <div className="mt-0.5 text-[13px] text-muted">
                        {g.year} · {g.event}
                      </div>
                      <p className="mt-2 text-[14px] leading-snug">{g.blurb}</p>
                      <p className="mt-1.5 text-[13px] leading-snug text-muted">Look for: {g.theme}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <Stars n={p?.stars ?? 0} />
                      <span className="text-[11px] text-muted">{p?.completedAt ? MASTERY_LABEL[masteryOf(p)] : STAGES[g.level]?.name}</span>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
          {!games.length ? <p className="text-muted">Games are on their way.</p> : null}
        </div>
      </div>
    </div>
  );
}
