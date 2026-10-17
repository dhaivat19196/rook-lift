'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { nudge, praise } from '@/lib/learn/coach';
import { learnPlan, moveNumber, type Step } from '@/lib/openings/tree';
import { markLearned, type Recs } from '@/lib/openings/progress';
import type { CompiledChapter, CompiledCourse } from '@/lib/openings/types';
import Board from '../Board';
import { Button } from '../ui';
import { CoachNote } from '../learn/bits';
import { arrowsFor, MoveList, sanOfMove, strip } from './bits';

/** Guided walk through every branch: the coach explains each move, you play your side, the app plays the replies. */
export default function LearnMode({ course, chapter, recs }: { course: CompiledCourse; chapter: CompiledChapter; recs: Recs | undefined }) {
  const g = chapter.graph;
  const side = course.side;
  const plan = useMemo(() => learnPlan(g), [g]);
  const [li, setLi] = useState(0);
  const [i, setI] = useState(0); // steps of this line already played
  const [miss, setMiss] = useState(0);
  const [shown, setShown] = useState(false);
  const [msg, setMsg] = useState<{ tone: 'good' | 'bad' | 'plain'; lead?: string; body?: string } | null>(null);
  const [whyOpen, setWhyOpen] = useState(false);
  const [done, setDone] = useState(false);
  const learnedRef = useRef<Set<string>>(new Set());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const line = plan[li];
  const finishedLine = !!line && i >= line.steps.length;
  const prefixSteps: Step[] = line ? line.prefix : [];
  const played: Step[] = line ? [...prefixSteps, ...line.steps.slice(0, i)] : [];
  const keyNow = played.length ? played[played.length - 1].edge.to : g.root;
  const node = g.nodes[keyNow];
  const next = line && !finishedLine ? line.steps[i] : null;
  const last = played.length ? played[played.length - 1].edge : null;
  const studentToMove = !!next && node.turn === side;
  const nextEdge = next?.edge ?? null;

  useEffect(() => {
    setI(0);
    setMiss(0);
    setShown(false);
    setWhyOpen(false);
    setMsg(line && line.prefix.length ? { tone: 'plain', body: `We pick up the next branch after ${moveNumber(line.prefix.length - 1)}${line.prefix[line.prefix.length - 1].edge.san}.` } : null);
  }, [li, line]);

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  // the opponent's moves play themselves
  useEffect(() => {
    if (!next || studentToMove) return;
    timer.current = setTimeout(() => {
      setI((x) => x + 1);
      setMsg({ tone: 'plain', body: `${moveNumber(played.length)}${next.edge.san}: ${next.edge.idea}` });
      setMiss(0);
      setWhyOpen(false);
    }, played.length === (line?.prefix.length ?? 0) ? 900 : 700);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [next, studentToMove, i, li]);

  const learn = (key: string) => {
    if (learnedRef.current.has(key)) return;
    learnedRef.current.add(key);
    void markLearned(course.id, [key]);
  };

  const accept = (from: string) => {
    learn(from);
    setI((x) => x + 1);
    setMiss(0);
    setShown(false);
    setWhyOpen(false);
  };

  const onMove = (from: string, to: string, promo?: string): boolean => {
    if (!studentToMove || !next) return false;
    const san = sanOfMove(node.fen, from, to, promo);
    if (!san) return false;
    const ok = node.edges.find((e) => strip(e.san) === strip(san));
    if (ok) {
      if (ok.uci !== next.edge.uci) {
        // another accepted move of the course: follow it as the student chose
        setMsg({ tone: 'plain', body: `${san} is also in the course. We will follow ${next.edge.san} here, and you meet ${san} in the next branch.` });
        return false;
      }
      setMsg({ tone: 'good', lead: praise(next.from + next.edge.uci, { hinted: false, retried: miss > 0 }), body: `${moveNumber(played.length)}${next.edge.san}: ${next.edge.idea}` });
      accept(next.from);
      return true;
    }
    const m = miss + 1;
    setMiss(m);
    const why = node.whyNot?.[san];
    setMsg({
      tone: 'bad',
      lead: nudge(next.from + san, m),
      body: why ? `${san}: ${why} The line move is the one on the arrow.` : `${san} is not the move we are learning here. Follow the green arrow and read the idea.`,
    });
    return false;
  };

  const showMe = () => {
    if (!next) return;
    setMsg({ tone: 'good', body: `${moveNumber(played.length)}${next.edge.san}: ${next.edge.idea}` });
    accept(next.from);
  };

  const nextLine = () => {
    if (li + 1 >= plan.length) {
      setDone(true);
      return;
    }
    setLi(li + 1);
  };

  const totalDecisions = plan.reduce((n, l) => n + l.steps.filter((s) => g.nodes[s.from].turn === side).length, 0);

  if (done) {
    return (
      <div>
        <CoachNote tone="good" lead="That is the whole chapter." body={`You have walked every branch (${plan.length} lines, ${totalDecisions} decisions of your own). The positions are now in your Drill queue and will come back on a schedule. Drill is where it becomes automatic.`} />
        <div className="mt-4 grid gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              setDone(false);
              setLi(0);
            }}
          >
            Walk through it again
          </Button>
        </div>
      </div>
    );
  }
  if (!line) return <div className="text-muted">This chapter has no lines yet.</div>;

  const arrows = studentToMove && nextEdge ? arrowsFor({ ...nextEdge, arrows: undefined }) : last ? arrowsFor(last) : [];
  const lastMove = last ? { from: last.uci.slice(0, 2), to: last.uci.slice(2, 4) } : null;
  const whyNots = studentToMove ? Object.entries(node.whyNot ?? {}) : [];
  const sans = played.map((s) => s.edge.san);

  return (
    <div>
      <div className="flex items-baseline justify-between text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
        <span>
          Line {li + 1} of {plan.length}
        </span>
        <span>You are {side === 'w' ? 'White' : 'Black'}</span>
      </div>
      <div className="mt-3">
        <Board fen={node.fen} orientation={side} movable={side} onMove={studentToMove && !shown ? onMove : undefined} lastMove={lastMove} arrows={arrows} />
      </div>
      <MoveList sans={sans} className="mt-3" />

      <div className="mt-4 min-h-[96px] space-y-3">
        {msg ? <CoachNote tone={msg.tone} lead={msg.lead} body={msg.body} /> : li === 0 && i === 0 ? <CoachNote tone="plain" body={chapter.coach} /> : null}
        {studentToMove && nextEdge ? (
          <div className="rounded-2xl border border-border bg-subtle px-4 py-3">
            <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted">Your move</div>
            <p className="mt-1 text-[15px] leading-relaxed">
              <strong>{nextEdge.san}</strong> · {nextEdge.idea}
            </p>
            <p className="mt-1 text-[13px] text-muted">Play it on the board, following the arrow.</p>
          </div>
        ) : null}
        {whyNots.length ? (
          <div>
            <button onClick={() => setWhyOpen((o) => !o)} className="min-h-[44px] text-[14px] text-accent">
              {whyOpen ? 'Hide' : 'Why not another move?'}
            </button>
            {whyOpen ? (
              <ul className="mt-1 space-y-2">
                {whyNots.map(([san, why]) => (
                  <li key={san} className="text-[14px] leading-snug">
                    <strong>{san}?</strong> {why}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
        {finishedLine ? (
          <>
            <CoachNote
              tone="good"
              lead="Line done."
              body={
                (g.nodes[keyNow].dev ?? '') ||
                (line.transposes ? 'This runs into a position you have already learned.' : `Remember: ${chapter.tip}`)
              }
            />
            <Button onClick={nextLine}>{li + 1 >= plan.length ? 'Finish chapter' : 'Next line'}</Button>
          </>
        ) : studentToMove ? (
          <button onClick={showMe} className="min-h-[44px] text-[14px] text-muted">
            Show me and move on
          </button>
        ) : null}
      </div>
      <div className="mt-2 text-[12px] text-muted">{recs ? `${Object.keys(recs).length} positions on your schedule` : ''}</div>
    </div>
  );
}
