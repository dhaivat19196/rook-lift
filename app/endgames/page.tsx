'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DRILLS } from '@/lib/endgames';
import { useActiveTimer, useQueryParams } from '@/lib/hooks';
import { markActive } from '@/lib/progress';
import EndgameDrill from '@/components/EndgameDrill';
import { BackBar, Card, PageTitle } from '@/components/ui';

export default function EndgamesPage() {
  const q = useQueryParams();
  const router = useRouter();
  const id = q?.get('d');
  const drill = DRILLS.find((d) => d.id === id);
  useActiveTimer('spr', !!drill);
  if (!q) return null;

  if (drill) {
    return (
      <div>
        <BackBar title="Endgames" href="/endgames/" />
        <EndgameDrill
          key={drill.id}
          drill={drill}
          doneLabel="Back to drills"
          onDone={(ok) => {
            if (ok) void markActive();
            router.push('/endgames/');
          }}
        />
      </div>
    );
  }
  return (
    <div>
      <BackBar title="" href="/train/" />
      <PageTitle title="Endgames" sub="Play it out against Stockfish at full strength." />
      <div className="space-y-3 px-5">
        {DRILLS.map((d) => (
          <Link key={d.id} href={`/endgames/?d=${d.id}`} className="block">
            <Card className="p-4 active:bg-subtle">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[17px] font-semibold tracking-tight">{d.title}</div>
                  <div className="mt-0.5 text-[13px] text-muted">{d.blurb}</div>
                </div>
                <span className="shrink-0 rounded-full border border-border px-3 py-1 text-[12px] text-muted">{d.goal === 'win' ? 'Win' : 'Draw'}</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
