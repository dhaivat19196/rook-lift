'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActiveTimer, useQueryParams } from '@/lib/hooks';
import { useAnalysedIds, useRecentGames } from '@/lib/queries';
import { fmtDate, tcLabel } from '@/lib/util';
import { BackBar, Card, Empty, PageTitle } from '@/components/ui';
import ReviewFlow from '@/components/ReviewFlow';

function GameList() {
  const games = useRecentGames(60);
  const ids = useAnalysedIds();
  return (
    <div>
      <PageTitle title="Games" sub="Pick a game to review." />
      <div className="space-y-2 px-5">
        {games && games.length === 0 ? <Empty title="No games yet" body="Import your Chess.com games from the Profile tab." /> : null}
        {games?.map((g) => (
          <Link key={g.id} href={`/review/?id=${encodeURIComponent(g.id)}`} className="block">
            <Card className="flex min-h-[64px] items-center justify-between p-4 active:bg-subtle">
              <div>
                <div className="text-[15px] font-medium">
                  <span className={g.result === 'win' ? 'text-accent' : g.result === 'loss' ? 'text-danger' : 'text-muted'}>
                    {g.result === 'win' ? 'W' : g.result === 'loss' ? 'L' : 'D'}
                  </span>{' '}
                  vs {g.oppName} <span className="text-muted">({g.oppRating})</span>
                </div>
                <div className="mt-0.5 text-[12px] text-muted">
                  {fmtDate(g.endTime)} · {tcLabel(g)} · {g.reason}
                </div>
              </div>
              <div className="text-[12px] text-muted">{ids?.has(g.id) ? 'Analyzed' : 'Queued'}</div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function ReviewPage() {
  const q = useQueryParams();
  const router = useRouter();
  const id = q?.get('id');
  useActiveTimer('spr', !!id);
  if (!q) return null;
  if (!id) {
    return (
      <div>
        <BackBar title="" href="/train/" />
        <GameList />
      </div>
    );
  }
  return (
    <div>
      <BackBar title="Review" href="/review/" right={<button onClick={() => router.push('/')} className="min-h-[44px] text-[13px] text-muted">Home</button>} />
      <ReviewFlow gameId={id} />
    </div>
  );
}
