'use client';
import { Chess } from 'chess.js';
import { useEffect, useMemo, useRef, useState } from 'react';
import { recordQuiz, useQuizRes } from '@/lib/openings/progress';
import type { CompiledChapter, CompiledCourse, Trap } from '@/lib/openings/types';
import Board from '../Board';
import { Button } from '../ui';
import { CoachNote, toArrows } from '../learn/bits';
import { fenAt, MoveList, sanOfMove, strip } from './bits';

type Phase = 'ask' | 'playing' | 'done';

function TrapView({ course, chapter, trap, index, count, onNext, last }: { course: CompiledCourse; chapter: CompiledChapter; trap: Trap; index: number; count: number; onNext: () => void; last: boolean }) {
  const baseFen = useMemo(() => fenAt(trap.at), [trap.at]);
  const [phase, setPhase] = useState<Phase>('ask');
  const [fen, setFen] = useState(baseFen);
  const [played, setPlayed] = useState<string[]>([]);
  const [miss, setMiss] = useState(0);
  const [result, setResult] = useState<'win' | 'fell' | 'shown' | null>(null);
  const [msg, setMsg] = useState<{ tone: 'good' | 'bad' | 'plain'; lead?: string; body?: string } | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const resolved = useRef(false);
  const atSans = useMemo(() => trap.at.trim().split(/\s+/).filter(Boolean).map((t) => t.replace(/^\d+\.+/, '')), [trap.at]);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
    },
    [],
  );

  const resolve = (ok: boolean) => {
    if (resolved.current) return;
    resolved.current = true;
    void recordQuiz('opt', course.id, chapter.id, trap.id, ok);
  };

  /** Play the first move, then the demonstration line, ply by ply. */
  const demo = (first: string) => {
    const c = new Chess(baseFen);
    const sans: string[] = [first, ...trap.line.trim().split(/\s+/).filter(Boolean).map((t) => t.replace(/^\d+\.+/, ''))];
    const seq: { fen: string; san: string }[] = [];
    for (const s of sans) {
      const m = c.move(s);
      seq.push({ fen: c.fen(), san: m.san });
    }
    setPhase('playing');
    seq.forEach((st, k) => {
      timers.current.push(
        setTimeout(() => {
          setFen(st.fen);
          setPlayed(seq.slice(0, k + 1).map((x) => x.san));
          if (k === seq.length - 1) setPhase('done');
        }, 700 * k),
      );
    });
  };

  const onMove = (from: string, to: string, promo?: string): boolean => {
    if (phase !== 'ask') return false;
    const san = sanOfMove(baseFen, from, to, promo);
    if (!san) return false;
    if (trap.kind === 'win') {
      if (strip(san) === strip(trap.ans)) {
        resolve(miss === 0);
        setResult('win');
        setMsg({ tone: 'good', lead: 'That is the punishment.', body: trap.idea });
        demo(trap.ans);
        return true;
      }
      const m = miss + 1;
      setMiss(m);
      if (m === 1) resolve(false);
      if (m >= 2) {
        setResult('shown');
        setMsg({ tone: 'bad', lead: 'Here is the move.', body: `${trap.ans}. ${trap.idea}` });
        demo(trap.ans);
        return false;
      }
      setMsg({ tone: 'bad', lead: 'Not quite.', body: `${san} lets Black off. Look for a move that wins material or attacks something that is not defended.` });
      return false;
    }
    // avoid
    if (strip(san) === strip(trap.bait ?? '')) {
      resolve(false);
      setResult('fell');
      setMsg({ tone: 'bad', lead: 'That is the trap.', body: trap.idea });
      demo(trap.bait ?? san);
      return true;
    }
    resolve(true);
    setResult('win');
    setMsg({ tone: 'good', lead: strip(san) === strip(trap.ans) ? 'Safe, and the right move.' : 'You avoided the trap.', body: `${strip(san) === strip(trap.ans) ? '' : `The course move is ${trap.ans}. `}The tempting move was ${trap.bait}: ${trap.idea}` });
    setPhase('done');
    return true;
  };

  const arrows = phase === 'done' || phase === 'playing' ? toArrows(trap.arrows) : [];

  return (
    <div>
      <div className="flex items-baseline justify-between text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
        <span>{trap.kind === 'win' ? 'Punish the mistake' : 'Avoid the trap'}</span>
        <span>
          {index + 1} of {count}
        </span>
      </div>
      <h2 className="mt-2 text-[20px] font-semibold leading-snug tracking-tight">
        {phase === 'ask' ? (trap.kind === 'win' ? 'Your opponent just made a mistake. What do you play?' : 'A natural-looking move here walks into a trick. Which move is safe?') : trap.title}
      </h2>
      <div className="mt-4">
        <Board fen={fen} orientation={trap.side} movable={trap.side} onMove={phase === 'ask' ? onMove : undefined} arrows={arrows} />
      </div>
      <MoveList sans={phase === 'ask' ? atSans.slice(-4) : [...atSans.slice(-2), ...played]} startPly={phase === 'ask' ? Math.max(0, atSans.length - 4) : Math.max(0, atSans.length - 2)} className="mt-3" />
      <div className="mt-4 space-y-3">
        {msg ? <CoachNote tone={msg.tone} lead={msg.lead} body={msg.body} rule={phase === 'done' ? trap.rule : undefined} /> : null}
        {phase === 'done' ? <Button onClick={onNext}>{last ? 'Finish' : 'Next trap'}</Button> : null}
        {phase === 'ask' && trap.kind === 'win' && miss > 0 ? <p className="text-[13px] text-muted">One more try, then I will show you.</p> : null}
        {result === 'fell' ? <p className="text-[13px] text-muted">You will see this one again. That is how traps stop working on you.</p> : null}
      </div>
    </div>
  );
}

/** Positions where the opponent commonly errs, and tricks to avoid. */
export default function TrapsMode({ course, chapter }: { course: CompiledCourse; chapter: CompiledChapter }) {
  const res = useQuizRes('opt', course.id, chapter.id);
  const traps = chapter.traps;
  const [i, setI] = useState(0);
  const [done, setDone] = useState(false);
  if (!traps.length) return <div className="text-[15px] text-muted">There are no traps in this chapter. The traps for this course live in its last chapter.</div>;
  if (done) {
    const solved = traps.filter((t) => res?.[t.id]?.ok).length;
    return (
      <div>
        <CoachNote tone="good" lead="Traps done." body={`${solved} of ${traps.length} handled cleanly so far. The ones that fooled you will come back: knowing a trap is the best way to stop falling for it, and to win games when the other side walks in.`} />
        <Button
          className="mt-4"
          onClick={() => {
            setI(0);
            setDone(false);
          }}
        >
          Go again
        </Button>
      </div>
    );
  }
  return <TrapView key={traps[i].id} course={course} chapter={chapter} trap={traps[i]} index={i} count={traps.length} last={i + 1 >= traps.length} onNext={() => (i + 1 >= traps.length ? setDone(true) : setI(i + 1))} />;
}
