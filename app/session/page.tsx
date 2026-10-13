'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { DRILLS } from '@/lib/endgames';
import { useActiveTimer } from '@/lib/hooks';
import { awardXp, bumpStat, markActive, XP } from '@/lib/progress';
import { useAnalysedIds, useRecentGames } from '@/lib/queries';
import { duePuzzles } from '@/lib/srs';
import { usePuzzles, useProgress } from '@/lib/store';
import type { Puzzle } from '@/lib/types';
import { cn, fmtClock } from '@/lib/util';
import EndgameDrill from '@/components/EndgameDrill';
import PuzzleRunner from '@/components/PuzzleRunner';
import ReviewFlow from '@/components/ReviewFlow';
import { Bar, Button, CheckMark, Empty } from '@/components/ui';
import { useAnalysisQueue } from '@/lib/analysisQueue';

const STEPS = [
  { id: 'review', title: 'Review your last game', mins: 10 },
  { id: 'bank', title: 'Blunder Bank', mins: 15 },
  { id: 'drill', title: 'Endgame drill', mins: 5 },
] as const;

export default function SessionPage() {
  const router = useRouter();
  const games = useRecentGames(40);
  const ids = useAnalysedIds();
  const progress = useProgress();
  const puzzles = usePuzzles();
  const q = useAnalysisQueue();

  const [step, setStep] = useState(0);
  const [results, setResults] = useState<(boolean | null)[]>([null, null, null]); // true done, false skipped
  const [finished, setFinished] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);
  const [target, setTarget] = useState<string | null | undefined>(undefined);
  const [bank, setBank] = useState<Puzzle[] | undefined>(undefined);
  const stepStart = useRef(0);

  const elapsed = useActiveTimer('ded', !finished);

  useEffect(() => {
    if (target === undefined && games && ids) {
      const g = games.find((x) => ids.has(x.id) && !progress.reviewed[x.id]);
      setTarget(g ? g.id : null);
    }
  }, [target, games, ids, progress.reviewed]);
  useEffect(() => {
    if (bank === undefined && puzzles) setBank(duePuzzles(puzzles).slice(0, 20));
  }, [bank, puzzles]);

  const drill = DRILLS[Math.floor(Date.now() / 86400000) % DRILLS.length];

  const advance = async (res: boolean, award: boolean) => {
    if (res && award) await awardXp(XP.step, 'Step complete');
    const next = results.slice();
    next[step] = res;
    setResults(next);
    stepStart.current = elapsed;
    if (step + 1 >= STEPS.length) {
      const all = next.every((r) => r === true);
      if (all) await awardXp(XP.fullSession, 'Full session');
      if (next.some((r) => r === true)) {
        await bumpStat('sessions');
        await markActive();
      }
      setFinished(true);
    } else {
      setStep(step + 1);
    }
  };

  if (finished) {
    const done = results.filter((r) => r === true).length;
    return (
      <div className="px-5 pt-16 text-center">
        <div className="flex justify-center">
          <CheckMark size={72} />
        </div>
        <h1 className="mt-6 text-[26px] font-semibold tracking-tight">{done === 3 ? 'Session complete' : 'Session saved'}</h1>
        <p className="mt-1 text-[15px] text-muted tabular">
          {done} of 3 steps · {Math.max(1, Math.round(elapsed / 60))} min
        </p>
        <div className="mx-auto mt-6 max-w-xs space-y-2 text-left">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-[14px]">
              <span>{s.title}</span>
              <span className={results[i] ? 'text-accent' : 'text-muted'}>{results[i] ? 'Done' : 'Skipped'}</span>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-8 max-w-xs">
          <Button onClick={() => router.replace('/')}>Back to Today</Button>
        </div>
      </div>
    );
  }

  const s = STEPS[step];
  const stepSecs = Math.max(0, elapsed - stepStart.current);
  const over = stepSecs > s.mins * 60;

  return (
    <div>
      <div className="px-5 pt-6">
        <div className="flex items-center justify-between">
          <div className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted">
            Step {step + 1} of {STEPS.length}
          </div>
          <div className={cn('text-[13px] tabular', over ? 'text-warn' : 'text-muted')}>
            {fmtClock(stepSecs)} / {s.mins}:00
          </div>
        </div>
        <h1 className="mt-1 text-[24px] font-semibold tracking-tight">{s.title}</h1>
        <div className="mt-3 flex gap-1.5">
          {STEPS.map((x, i) => (
            <Bar key={x.id} value={i < step ? 1 : i === step ? Math.min(1, stepSecs / (s.mins * 60)) : 0} className="flex-1" />
          ))}
        </div>
        <div className="mt-2 flex justify-between">
          <button onClick={() => router.push('/')} className="min-h-[44px] text-[13px] text-muted">
            Exit
          </button>
          <button onClick={() => void advance(false, false)} className="min-h-[44px] text-[13px] text-muted">
            Skip step
          </button>
        </div>
      </div>

      <div className="mt-2" key={s.id}>
        {s.id === 'review' ? (
          target === undefined ? (
            <div className="px-5 py-10 text-muted">Loading...</div>
          ) : target === null ? (
            <div className="px-5">
              <Empty
                title="Nothing to review"
                body={q.total > q.done ? 'Your games are still being analyzed. You can skip for now.' : 'You have reviewed every analyzed game.'}
                action={<Button onClick={() => void advance(true, false)}>Continue</Button>}
              />
            </div>
          ) : (
            <>
              <ReviewFlow gameId={target} onFinished={() => setReviewDone(true)} />
              {reviewDone ? (
                <div className="px-5 pt-3">
                  <Button onClick={() => void advance(true, true)}>Next step</Button>
                </div>
              ) : null}
            </>
          )
        ) : null}

        {s.id === 'bank' ? (
          bank === undefined ? (
            <div className="px-5 py-10 text-muted">Loading...</div>
          ) : bank.length === 0 ? (
            <div className="px-5">
              <Empty title="No puzzles due" body="Nothing is waiting in your Blunder Bank. Come back after your next game." action={<Button onClick={() => void advance(true, false)}>Continue</Button>} />
            </div>
          ) : (
            <PuzzleRunner puzzles={bank} doneLabel="Next step" onDone={(sum) => void advance(sum.attempted > 0, sum.attempted > 0)} />
          )
        ) : null}

        {s.id === 'drill' ? (
          <EndgameDrill drill={drill} doneLabel="Finish session" award={false} onDone={() => void advance(true, true)} />
        ) : null}
      </div>
    </div>
  );
}
