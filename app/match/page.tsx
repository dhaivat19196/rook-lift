'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { analysisQueue } from '@/lib/analysisQueue';
import { importGames, type ImportProgress } from '@/lib/chesscom';
import { CHESSCOM_PLAY_URL } from '@/lib/config';
import { db } from '@/lib/db';
import { useActiveTimer } from '@/lib/hooks';
import { useSettings } from '@/lib/store';
import { cn } from '@/lib/util';
import ReviewFlow from '@/components/ReviewFlow';
import { BackBar, Bar, Button, Card, Label, LinkButton, Spinner } from '@/components/ui';

const CHECKS = [
  { t: 'Play 10+5 or longer', s: 'Time is your edge. Fast games reward habits you have not built yet.' },
  { t: 'Before every move: checks, captures, threats', s: 'Theirs and yours. Say them quietly in that order.' },
  { t: 'Is my piece safe after this move?', s: 'Look at the square you are moving to, and what you leave behind.' },
  { t: 'Use your time', s: 'If a move feels obvious, spend ten seconds proving it is not a blunder.' },
];

type Phase = 'checklist' | 'playing' | 'syncing' | 'review';

export default function MatchPage() {
  const router = useRouter();
  const settings = useSettings();
  const [phase, setPhase] = useState<Phase>('checklist');
  const [ticks, setTicks] = useState<boolean[]>(CHECKS.map(() => false));
  const [prog, setProg] = useState<ImportProgress | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  useActiveTimer('ded', phase === 'review');

  // resume "playing" state if the app was backgrounded while on Chess.com
  useEffect(() => {
    try {
      if (sessionStorage.getItem('cc-match-started')) setPhase('playing');
    } catch {
      /* ignore */
    }
  }, []);

  const open = () => {
    try {
      sessionStorage.setItem('cc-match-started', String(Date.now()));
    } catch {
      /* ignore */
    }
    setPhase('playing');
  };

  const finished = async () => {
    setPhase('syncing');
    setMsg('');
    try {
      let started = 0;
      try {
        started = Number(sessionStorage.getItem('cc-match-started') || 0);
      } catch {
        /* ignore */
      }
      const res = await importGames({
        username: settings.username,
        incremental: true,
        includeBlitz: settings.includeBlitz,
        includeDaily: settings.includeDaily,
        onProgress: setProg,
      });
      const newest = await db.games.orderBy('endTime').last();
      const fresh = newest ? (started ? newest.endTime * 1000 >= started - 60000 : res.added > 0) : false;
      if (!newest || !fresh) {
        setMsg('No new game found yet. Chess.com can take a minute to publish it.');
        setPhase('playing');
        return;
      }
      try {
        sessionStorage.removeItem('cc-match-started');
      } catch {
        /* ignore */
      }
      analysisQueue.prioritize(newest.id);
      setGameId(newest.id);
      setPhase('review');
    } catch (e) {
      setMsg((e as Error).message || 'Sync failed. Check your connection.');
      setPhase('playing');
    }
  };

  if (phase === 'review' && gameId) {
    return (
      <div>
        <BackBar title="Post-game review" href="/" />
        <ReviewFlow gameId={gameId} onFinished={() => {}} />
        <div className="px-5 pt-4">
          <Button variant="secondary" onClick={() => router.replace('/')}>
            Back to Today
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <BackBar title="Match day" href="/" />
      <div className="px-5">
        {phase === 'checklist' ? (
          <>
            <h1 className="mt-2 text-[28px] font-semibold tracking-tight">Before you play</h1>
            <p className="mt-1 text-[15px] text-muted">One game today, played slowly.</p>
            <div className="mt-6 space-y-3">
              {CHECKS.map((c, i) => (
                <button
                  key={c.t}
                  onClick={() => setTicks((t) => t.map((v, j) => (j === i ? !v : v)))}
                  className="flex w-full items-start gap-4 rounded-2xl border border-border bg-surface p-4 text-left"
                >
                  <span
                    className={cn(
                      'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border',
                      ticks[i] ? 'border-accent bg-accent text-accent-fg' : 'border-border',
                    )}
                  >
                    {ticks[i] ? (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m2 6.5 2.5 2.5L10 3.5" />
                      </svg>
                    ) : null}
                  </span>
                  <span>
                    <span className="block text-[16px] font-medium">{c.t}</span>
                    <span className="mt-0.5 block text-[13px] text-muted">{c.s}</span>
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-6">
              <LinkButton href={CHESSCOM_PLAY_URL} external onClick={open}>
                Open Chess.com
              </LinkButton>
              <button onClick={open} className="mt-2 min-h-[44px] w-full text-[13px] text-muted">
                I am already playing
              </button>
            </div>
          </>
        ) : null}

        {phase === 'playing' ? (
          <div className="pt-6">
            <Card>
              <Label>Game on</Label>
              <div className="mt-1 text-[20px] font-semibold tracking-tight">Play your game</div>
              <p className="mt-1 text-[14px] text-muted">Come back here when it ends. We will pull it in, analyze it, and walk through your mistakes.</p>
              {msg ? <p className="mt-3 text-[14px] text-warn">{msg}</p> : null}
              <Button className="mt-5" onClick={() => void finished()}>
                I finished my game
              </Button>
              <LinkButton href={CHESSCOM_PLAY_URL} external variant="secondary" className="mt-2">
                Open Chess.com again
              </LinkButton>
            </Card>
          </div>
        ) : null}

        {phase === 'syncing' ? (
          <div className="pt-10">
            <Card>
              <div className="flex items-center gap-3">
                <Spinner />
                <div className="text-[16px] font-medium">Fetching your game</div>
              </div>
              <Bar value={prog && prog.n ? prog.i / prog.n : 0} className="mt-4" />
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
}
