'use client';
import { Chess, type Square } from 'chess.js';
import { useEffect, useMemo, useRef, useState } from 'react';
import { START_FEN } from '@/lib/learn/build';
import type { LArrow, LineDef } from '@/lib/learn/types';
import { cn } from '@/lib/util';
import Board from '../Board';
import { Button } from '../ui';
import { CoachNote, toArrows } from './bits';

const strip = (s: string) => s.replace(/[+#!?]/g, '');

interface Frame {
  fen: string;
  from: string;
  to: string;
  san: string;
}

/** Walk a repertoire line: first watch it with the idea behind every move, then play your side from memory. */
export default function LineDrill({
  line,
  startInDrill,
  onDone,
  doneLabel = 'Continue',
}: {
  line: LineDef;
  startInDrill?: boolean;
  onDone: (clean: boolean) => void;
  doneLabel?: string;
}) {
  const frames = useMemo(() => {
    const out: Frame[] = [];
    const c = new Chess(line.fen ?? START_FEN);
    for (const m of line.moves) {
      const r = c.move(m);
      out.push({ fen: c.fen(), from: r.from, to: r.to, san: r.san });
    }
    return out;
  }, [line]);
  const startFen = line.fen ?? START_FEN;
  const [mode, setMode] = useState<'learn' | 'drill'>(startInDrill ? 'drill' : 'learn');
  const [p, setP] = useState(0); // plies played
  const [slips, setSlips] = useState(0);
  const [miss, setMiss] = useState(0); // misses on the current ply
  const [msg, setMsg] = useState<{ tone: 'good' | 'bad' | 'plain'; lead?: string; body?: string } | null>(null);
  const [shown, setShown] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finished = p >= line.moves.length;
  const fen = p === 0 ? startFen : frames[p - 1].fen;
  const turn = new Chess(fen).turn();
  const last = p > 0 ? { from: frames[p - 1].from, to: frames[p - 1].to } : null;

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  // opponent replies in drill mode
  useEffect(() => {
    if (mode !== 'drill' || finished || turn === line.side) return;
    timer.current = setTimeout(() => {
      setP((x) => x + 1);
      setMsg({ tone: 'plain', body: `${frames[p].san}: ${line.ideas[p]}` });
      setMiss(0);
      setShown(null);
    }, 650);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [mode, p, finished, turn, line.side, frames, line.ideas]);

  const onMove = (from: string, to: string, promo?: string): boolean => {
    if (mode !== 'drill' || finished || turn !== line.side) return false;
    const c = new Chess(fen);
    let m;
    try {
      m = c.move({ from: from as Square, to: to as Square, promotion: promo });
    } catch {
      return false;
    }
    if (strip(m.san) === strip(frames[p].san)) {
      setP(p + 1);
      setMsg({ tone: 'good', lead: miss ? 'There it is.' : 'Yes.', body: `${frames[p].san}: ${line.ideas[p]}` });
      setMiss(0);
      setShown(null);
      return true;
    }
    const mm = miss + 1;
    setMiss(mm);
    if (mm === 1) setSlips((s) => s + 1);
    if (mm >= 2) {
      // show it and play it for them
      setMsg({ tone: 'bad', lead: 'Here is the line move.', body: `${frames[p].san}: ${line.ideas[p]}` });
      timer.current = setTimeout(() => {
        setP((x) => x + 1);
        setMiss(0);
        setShown(null);
      }, 1500);
      setShown(frames[p].from + frames[p].to);
      return false;
    }
    setMsg({ tone: 'bad', lead: 'Not the line move.', body: `${m.san} is a different move. Think about what the idea was here: ${line.ideas[p].split(/[.:,]/)[0].toLowerCase()}. Try again.` });
    setShown(null);
    return false;
  };

  const arrows: LArrow[] = [];
  if (mode === 'learn' && p > 0) {
    arrows.push({ from: frames[p - 1].from, to: frames[p - 1].to, c: 'g' });
    arrows.push(...(line.arrows?.[p] ?? []));
  }
  if (shown) arrows.push({ from: shown.slice(0, 2), to: shown.slice(2, 4), c: 'g' });
  const total = line.moves.length;
  const number = (i: number) => {
    const startTurn = new Chess(startFen).turn();
    const k = i + (startTurn === 'w' ? 0 : 1);
    return `${Math.floor(k / 2) + 1}${k % 2 === 0 ? '.' : '...'}`;
  };

  return (
    <div>
      <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
        {mode === 'learn' ? 'Learn the line' : 'Play your side from memory'} · you are {line.side === 'w' ? 'White' : 'Black'}
      </div>
      <h2 className="mt-1 text-[20px] font-semibold leading-snug tracking-tight">{line.title}</h2>
      <div className="mt-4">
        <Board fen={fen} orientation={line.side} movable={line.side} onMove={mode === 'drill' && !finished && turn === line.side && !shown ? onMove : undefined} lastMove={last} arrows={toArrows(arrows)} />
      </div>
      <div className="mt-3 flex flex-wrap gap-x-2 gap-y-1 text-[14px] tabular text-muted">
        {frames.slice(0, p).map((f, i) => (
          <span key={i} className={cn(i === p - 1 && 'font-semibold text-text')}>
            {i % 2 === (new Chess(startFen).turn() === 'w' ? 0 : 1) || i === 0 ? number(i) + ' ' : ''}
            {f.san}
          </span>
        ))}
        {p === 0 ? <span>{total} moves to learn</span> : null}
      </div>

      <div className="mt-4 min-h-[88px]">
        {mode === 'learn' ? (
          <>
            {p > 0 ? <CoachNote tone="plain" body={<><strong>{number(p - 1)} {frames[p - 1].san}</strong> · {line.ideas[p - 1]}</>} /> : <CoachNote tone="plain" body="Step through the line one move at a time. Each move comes with the idea behind it, so you learn the reason, not just the order." />}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button variant="secondary" disabled={p === 0} onClick={() => setP((x) => Math.max(0, x - 1))}>
                Back
              </Button>
              {finished ? (
                <Button
                  onClick={() => {
                    setMode('drill');
                    setP(0);
                    setMsg(null);
                  }}
                >
                  Now you play
                </Button>
              ) : (
                <Button onClick={() => setP((x) => x + 1)}>Next move</Button>
              )}
            </div>
          </>
        ) : finished ? (
          <>
            <CoachNote
              tone="good"
              lead={slips === 0 ? 'Clean run.' : 'Line complete.'}
              body={slips === 0 ? 'You played every move of your side without a slip.' : `${slips} slip${slips === 1 ? '' : 's'} along the way. The moves you missed will come back in your reviews.`}
            />
            <Button className="mt-4" onClick={() => onDone(slips === 0)}>
              {doneLabel}
            </Button>
          </>
        ) : (
          <>
            {msg ? <CoachNote tone={msg.tone} lead={msg.lead} body={msg.body} /> : <CoachNote tone="plain" body={turn === line.side ? 'Your move. Play the line from memory.' : 'Their move...'} />}
            <button
              onClick={() => {
                setMode('learn');
                setP(0);
                setMsg(null);
              }}
              className="mt-3 min-h-[44px] text-[13px] text-muted"
            >
              Watch the line again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
