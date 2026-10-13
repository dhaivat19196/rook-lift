'use client';
import { Chess, type Move } from 'chess.js';
import { useCallback, useEffect, useRef, useState } from 'react';
import { tryUci } from '@/lib/core';
import type { Drill } from '@/lib/endgames';
import { getUiEngine } from '@/lib/engine';
import { awardXp } from '@/lib/progress';
import Board from './Board';
import { Bar, Button, CheckMark, Spinner } from './ui';

type Status = 'playing' | 'thinking' | 'won' | 'lost';

export default function EndgameDrill({
  drill,
  onDone,
  doneLabel = 'Done',
  award = true,
}: {
  drill: Drill;
  onDone: (success: boolean) => void;
  doneLabel?: string;
  award?: boolean;
}) {
  const chess = useRef(new Chess(drill.fen));
  const [fen, setFen] = useState(drill.fen);
  const [status, setStatus] = useState<Status>('playing');
  const [msg, setMsg] = useState('');
  const [moves, setMoves] = useState(0);
  const [hint, setHint] = useState<{ from: string; to: string } | null>(null);
  const [last, setLast] = useState<{ from: string; to: string } | null>(null);
  const [showTip, setShowTip] = useState(false);
  const alive = useRef(true);
  const userMoves = useRef(0);
  const run = useRef(0);
  const sign = drill.user === 'w' ? 1 : -1;

  const end = useCallback(
    async (won: boolean, text: string) => {
      setStatus(won ? 'won' : 'lost');
      setMsg(text);
      if (won && award) await awardXp(15, 'Drill complete');
    },
    [award],
  );

  const judge = useCallback(
    async (by: Move | null): Promise<boolean> => {
      const c = chess.current;
      if (c.isCheckmate()) {
        const winner = c.turn() === 'w' ? 'b' : 'w';
        if (winner === drill.user) await end(true, 'Checkmate. Well done.');
        else await end(false, 'You were checkmated.');
        return true;
      }
      if (c.isDraw()) {
        if (drill.goal === 'draw') await end(true, 'Draw secured.');
        else await end(false, 'That is a draw. Try to keep the win.');
        return true;
      }
      const evalNow = async () => {
        const r = await getUiEngine().analyse(c.fen(), { movetime: 300 });
        return r.ev * sign;
      };
      try {
        if (drill.success === 'promote' && by?.promotion) {
          const e = await evalNow();
          if (e >= 400) {
            await end(true, 'Promoted with a winning position.');
            return true;
          }
        }
        if (drill.success === 'survive' && userMoves.current >= drill.maxMoves) {
          const e = await evalNow();
          if (e >= -150) await end(true, `You held for ${drill.maxMoves} moves.`);
          else await end(false, 'The position was lost.');
          return true;
        }
      } catch {
        /* engine unavailable: fall through */
      }
      if (drill.goal === 'win' && userMoves.current >= drill.maxMoves) {
        await end(false, `Out of moves (${drill.maxMoves}). Be more direct.`);
        return true;
      }
      return false;
    },
    [drill, end, sign],
  );

  const engineMove = useCallback(async () => {
    const id = run.current;
    setStatus('thinking');
    try {
      const r = await getUiEngine().analyse(chess.current.fen(), { movetime: 250 });
      if (!alive.current || id !== run.current) return;
      const mv = tryUci(chess.current, r.bestmove);
      if (!mv) {
        setStatus('playing');
        return;
      }
      setFen(chess.current.fen());
      setLast({ from: mv.from, to: mv.to });
      const over = await judge(null);
      if (!over && alive.current && id === run.current) setStatus('playing');
    } catch {
      if (alive.current && id === run.current) {
        setStatus('playing');
        setMsg('Engine unavailable');
      }
    }
  }, [judge]);

  useEffect(() => {
    alive.current = true;
    const runRef = run;
    if (chess.current.turn() !== drill.user) void engineMove();
    return () => {
      alive.current = false;
      runRef.current++;
      getUiEngine().cancel();
    };
  }, [drill.user, engineMove]);

  const onMove = (from: string, to: string, promo?: string): boolean => {
    if (status !== 'playing') return false;
    const mv = tryUci(chess.current, from + to + (promo ?? ''));
    if (!mv) return false;
    userMoves.current += 1;
    setMoves(userMoves.current);
    setHint(null);
    setMsg('');
    setFen(chess.current.fen());
    setLast({ from, to });
    void (async () => {
      const over = await judge(mv);
      if (!over && alive.current) await engineMove();
    })();
    return true;
  };

  const restart = () => {
    run.current++;
    getUiEngine().cancel();
    chess.current = new Chess(drill.fen);
    userMoves.current = 0;
    setMoves(0);
    setFen(drill.fen);
    setStatus('playing');
    setMsg('');
    setHint(null);
    setLast(null);
    if (chess.current.turn() !== drill.user) void engineMove();
  };

  const getHint = async () => {
    if (status !== 'playing') return;
    try {
      const r = await getUiEngine().analyse(chess.current.fen(), { movetime: 300 });
      if (r.bestmove) setHint({ from: r.bestmove.slice(0, 2), to: r.bestmove.slice(2, 4) });
    } catch {
      /* ignore */
    }
  };

  const goalText =
    drill.success === 'mate' ? 'Checkmate' : drill.success === 'promote' ? 'Promote and keep the win' : `Hold the draw (${drill.maxMoves} moves)`;

  return (
    <div className="px-5">
      <div className="mb-3">
        <div className="text-[19px] font-semibold tracking-tight">{drill.title}</div>
        <div className="mt-0.5 text-[13px] text-muted">
          You are {drill.user === 'w' ? 'White' : 'Black'} · Goal: {goalText}
        </div>
      </div>
      <div className="mb-3 flex items-center gap-3">
        <div className="text-[13px] text-muted tabular">
          Move {moves}/{drill.maxMoves}
        </div>
        <Bar value={moves / drill.maxMoves} className="flex-1" tone={moves > drill.maxMoves * 0.8 ? 'danger' : 'accent'} />
      </div>
      <Board
        fen={fen}
        orientation={drill.user}
        movable={drill.user}
        onMove={status === 'playing' ? onMove : undefined}
        lastMove={last}
        arrows={hint ? [hint] : []}
      />
      <div className="mt-4 min-h-[96px]">
        {status === 'thinking' ? (
          <div className="flex items-center gap-2 text-[15px] text-muted">
            <Spinner /> Opponent is thinking
          </div>
        ) : null}
        {status === 'playing' ? (
          <div>
            {msg ? <div className="mb-2 text-[14px] text-muted">{msg}</div> : null}
            <div className="grid grid-cols-3 gap-2">
              <Button variant="secondary" className="min-h-[48px] text-[14px]" onClick={() => void getHint()}>
                Hint
              </Button>
              <Button variant="secondary" className="min-h-[48px] text-[14px]" onClick={() => setShowTip((s) => !s)}>
                Idea
              </Button>
              <Button variant="secondary" className="min-h-[48px] text-[14px]" onClick={restart}>
                Restart
              </Button>
            </div>
            {showTip ? <p className="mt-3 text-[14px] leading-relaxed text-muted">{drill.tip}</p> : null}
          </div>
        ) : null}
        {status === 'won' ? (
          <div className="flex flex-col items-center gap-3">
            <CheckMark size={44} />
            <div className="text-[15px]">{msg}</div>
            <Button onClick={() => onDone(true)}>{doneLabel}</Button>
          </div>
        ) : null}
        {status === 'lost' ? (
          <div className="flex flex-col gap-3">
            <div className="text-[15px] font-medium text-danger">{msg}</div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={restart}>
                Try again
              </Button>
              <Button variant="ghost" onClick={() => onDone(false)}>
                {doneLabel}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
