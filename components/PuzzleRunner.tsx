'use client';
import { Chess } from 'chess.js';
import { useEffect, useRef, useState } from 'react';
import { TAG_INFO, tryUci } from '@/lib/core';
import { getUiEngine } from '@/lib/engine';
import { recordPuzzleResult } from '@/lib/progress';
import { applySrs, savePuzzle } from '@/lib/srs';
import type { Puzzle } from '@/lib/types';
import { cn } from '@/lib/util';
import Board from './Board';
import { Bar, Button, Chip, CheckMark, Spinner } from './ui';

export interface PuzzleSummary {
  total: number;
  attempted: number;
  firstTry: number;
  solved: number;
}

type Phase = 'think' | 'checking' | 'wrong' | 'waiting' | 'solved' | 'revealed';

interface Props {
  puzzles: Puzzle[];
  onDone: (s: PuzzleSummary) => void;
  doneLabel?: string;
  /** shown above the board, e.g. "From your game" */
  caption?: string;
  /** don't touch SRS (used for one-off retries) */
  noSrs?: boolean;
}

const WRONG_MS = 900;

export default function PuzzleRunner({ puzzles, onDone, doneLabel = 'Finish', caption, noSrs }: Props) {
  const [list] = useState(puzzles);
  const [idx, setIdx] = useState(0);
  const p = list[idx];
  const [fen, setFen] = useState(p?.fen ?? '');
  const [phase, setPhase] = useState<Phase>('think');
  const [stage, setStage] = useState<'first' | 'second'>('first');
  const [msg, setMsg] = useState<string>('');
  const [hint, setHint] = useState(false);
  const [showSol, setShowSol] = useState(false);
  const [last, setLast] = useState<{ from: string; to: string } | null>(null);
  const [shake, setShake] = useState(false);
  const failed = useRef(false);
  const hinted = useRef(false);
  const results = useRef<{ firstTry: boolean; solved: boolean }[]>([]);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      getUiEngine().cancel();
    };
  }, []);

  const resetFor = (pz: Puzzle) => {
    setFen(pz.fen);
    setPhase('think');
    setStage('first');
    setMsg('');
    setHint(false);
    setShowSol(false);
    setLast(null);
    failed.current = false;
    hinted.current = false;
  };

  const finalize = async (firstTry: boolean, solved: boolean) => {
    results.current.push({ firstTry, solved });
    if (!noSrs) await savePuzzle(applySrs(p, firstTry));
    await recordPuzzleResult(firstTry, solved);
  };

  const solvedNow = async () => {
    const firstTry = !failed.current && !hinted.current;
    setPhase('solved');
    setMsg(firstTry ? 'Correct' : 'Solved');
    await finalize(firstTry, true);
  };

  const fail = (text: string, revertFen: string) => {
    failed.current = true;
    setPhase('wrong');
    setMsg(text);
    setShake(true);
    setTimeout(() => {
      if (!alive.current) return;
      setShake(false);
      setFen(revertFen);
      setLast(null);
      setPhase('think');
    }, WRONG_MS);
  };

  const onMove = (from: string, to: string, promo?: string): boolean => {
    if (!p || phase !== 'think') return false;
    const uci = from + to + (promo ?? '');
    const chess = new Chess(fen);
    const mv = tryUci(chess, uci);
    if (!mv) return false;
    const before = fen;
    const after = chess.fen();
    setFen(after);
    setLast({ from, to });
    const expected = stage === 'first' ? p.best : p.pv[2];
    if (stage === 'second') {
      if (uci === expected) {
        void solvedNow();
      } else {
        setPhase('wrong');
        setMsg('Not that one');
        setShake(true);
        setTimeout(() => {
          if (!alive.current) return;
          setShake(false);
          setFen(before);
          setLast(null);
          setPhase('think');
        }, WRONG_MS);
      }
      return true;
    }
    // first move
    if (uci === p.played) {
      fail('That is the move from your game', before);
      return true;
    }
    if (uci === p.best) {
      afterBest(after, true);
      return true;
    }
    setPhase('checking');
    setMsg('Checking...');
    void (async () => {
      try {
        const r = await getUiEngine().analyse(after, { movetime: 350 });
        if (!alive.current) return;
        const sign = p.color === 'w' ? 1 : -1;
        const mine = r.ev * sign;
        const bestMine = p.bestEv * sign;
        const ok = bestMine >= 9000 ? mine >= 9000 : mine >= bestMine - 30;
        if (ok) afterBest(after, false);
        else fail('Not the best move', before);
      } catch {
        if (alive.current) fail('Could not check that move', before);
      }
    })();
    return true;
  };

  const afterBest = (after: string, exact: boolean) => {
    if (exact && p.pv.length >= 3) {
      setPhase('waiting');
      setMsg('Correct. Keep going');
      setTimeout(() => {
        if (!alive.current) return;
        const c = new Chess(after);
        const reply = tryUci(c, p.pv[1]);
        if (!reply) {
          void solvedNow();
          return;
        }
        setFen(c.fen());
        setLast({ from: reply.from, to: reply.to });
        setStage('second');
        setMsg('Find the follow-up');
        setPhase('think');
      }, 550);
    } else {
      void solvedNow();
    }
  };

  const reveal = async () => {
    if (phase === 'solved' || phase === 'revealed') return;
    setShowSol(true);
    setPhase('revealed');
    setMsg('');
    failed.current = true;
    await finalize(false, false);
  };

  const next = () => {
    if (idx + 1 >= list.length) {
      finish();
      return;
    }
    const n = list[idx + 1];
    setIdx(idx + 1);
    resetFor(n);
  };

  const finish = () => {
    const r = results.current;
    onDone({
      total: list.length,
      attempted: r.length,
      firstTry: r.filter((x) => x.firstTry).length,
      solved: r.filter((x) => x.solved).length,
    });
  };

  if (!p) {
    return (
      <div className="px-5 py-10 text-center text-muted">
        Nothing to practise yet.
        <div className="mt-4">
          <Button onClick={() => onDone({ total: 0, attempted: 0, firstTry: 0, solved: 0 })}>{doneLabel}</Button>
        </div>
      </div>
    );
  }

  const side = p.color === 'w' ? 'White' : 'Black';
  const moveNo = Math.floor(p.ply / 2) + 1;
  const bestFrom = p.best.slice(0, 2);
  const hintHL = hint && phase === 'think' ? { [stage === 'first' ? bestFrom : (p.pv[2] ?? '').slice(0, 2)]: 'rgb(var(--accent) / 0.5)' } : undefined;
  const arrows = showSol ? [{ from: p.best.slice(0, 2), to: p.best.slice(2, 4) }] : [];
  const done = phase === 'solved' || phase === 'revealed';

  return (
    <div className="px-5">
      <div className="mb-3 flex items-center gap-3">
        <div className="text-[13px] text-muted tabular">
          {idx + 1} / {list.length}
        </div>
        <Bar value={(idx + (done ? 1 : 0)) / list.length} className="flex-1" />
        <button onClick={finish} className="min-h-[40px] px-1 text-[13px] text-muted">
          {doneLabel}
        </button>
      </div>

      <div className="mb-3">
        <div className="text-[19px] font-semibold tracking-tight">Find the best move for {side}</div>
        <div className="mt-0.5 text-[13px] text-muted">
          {caption ? caption + ' · ' : ''}Move {moveNo}
          {p.color === 'b' ? '...' : ''} · {p.phase}
        </div>
      </div>

      <div className={cn(shake && 'anim-shake')}>
        <Board
          fen={fen}
          orientation={p.color}
          movable={p.color}
          onMove={phase === 'think' ? onMove : undefined}
          lastMove={last}
          arrows={arrows}
          highlights={hintHL}
        />
      </div>

      <div className="mt-4 min-h-[88px]">
        {phase === 'checking' || phase === 'waiting' ? (
          <div className="flex items-center gap-2 text-[15px] text-muted">
            <Spinner /> {msg}
          </div>
        ) : null}
        {phase === 'wrong' ? <div className="text-[15px] font-medium text-danger">{msg}</div> : null}
        {phase === 'think' ? (
          <div className="flex items-center justify-between gap-3">
            <div className="text-[15px] text-muted">{msg || 'Your move'}</div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  hinted.current = true;
                  setHint(true);
                }}
                className="min-h-[44px] rounded-xl border border-border px-4 text-[14px]"
              >
                Hint
              </button>
              <button onClick={() => void reveal()} className="min-h-[44px] rounded-xl border border-border px-4 text-[14px] text-muted">
                Show
              </button>
            </div>
          </div>
        ) : null}
        {done ? (
          <div>
            <div className="flex items-center gap-3">
              {phase === 'solved' ? <CheckMark size={36} /> : null}
              <div>
                <div className="text-[16px] font-medium">
                  {phase === 'solved' ? (msg === 'Correct' ? 'Correct' : 'Solved') : 'Solution'}
                </div>
                <div className="text-[13px] text-muted">
                  Best was <span className="text-text">{p.bestSan}</span>. In the game you played{' '}
                  <span className="text-text">{p.playedSan}</span> (lost {Math.round(p.loss)}%).
                </div>
              </div>
            </div>
            {p.tags.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {p.tags.map((t) => (
                  <Chip key={t} className="min-h-[30px] px-3 text-[12px]">
                    {TAG_INFO[t]?.label ?? t}
                  </Chip>
                ))}
              </div>
            ) : null}
            <Button className="mt-4" onClick={next}>
              {idx + 1 >= list.length ? doneLabel : 'Next'}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
