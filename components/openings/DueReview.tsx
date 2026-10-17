'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { nudge, praise } from '@/lib/learn/coach';
import { compiled } from '@/lib/openings';
import { dueNodes, recordNode, type DueNode } from '@/lib/openings/progress';
import { pathTo } from '@/lib/openings/tree';
import Board from '../Board';
import { Button, Empty, LinkButton, Spinner } from '../ui';
import { CoachNote } from '../learn/bits';
import { MoveList, pieceWord, sanOfMove, strip } from './bits';

export interface ReviewSummary {
  asked: number;
  firstTry: number;
}

/** The "Opening review" block: due positions from every course, one at a time (about five minutes). */
export default function DueReview({ courseId, limit = 10, onDone, doneLabel = 'Done', emptyAction }: { courseId?: string; limit?: number; onDone?: (s: ReviewSummary) => void; doneLabel?: string; emptyAction?: () => void }) {
  const [items, setItems] = useState<DueNode[] | null>(null);
  const [i, setI] = useState(0);
  const [miss, setMiss] = useState(0);
  const [hint, setHint] = useState(0);
  const [solved, setSolved] = useState(false);
  const [msg, setMsg] = useState<{ tone: 'good' | 'bad' | 'plain'; lead?: string; body?: string } | null>(null);
  const [stats, setStats] = useState<ReviewSummary>({ asked: 0, firstTry: 0 });
  const [finished, setFinished] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    void dueNodes(limit, courseId).then(setItems);
  }, [limit, courseId]);

  const item = items?.[i];
  const course = item ? compiled(item.courseId) : undefined;
  const node = item && course ? course.union.nodes[item.key] : undefined;
  const path = useMemo(() => (item && course ? pathTo(course.union, item.key) : null), [item, course]);
  const chapter = useMemo(() => (item && course ? course.chapters.find((c) => c.graph.nodes[item.key]) : undefined), [item, course]);

  if (!items) {
    return (
      <div className="flex items-center gap-2 px-5 py-10 text-muted">
        <Spinner /> Finding your positions...
      </div>
    );
  }
  if (!items.length || !item || !course || !node) {
    return (
      <div className="px-5">
        <Empty
          title="No openings due"
          body="Every position you have learned is on schedule. Learn a new chapter or come back tomorrow."
          action={
            emptyAction ? (
              <Button onClick={emptyAction}>Continue</Button>
            ) : (
              <LinkButton href="/learn/" variant="secondary">
                Back to Learn
              </LinkButton>
            )
          }
        />
      </div>
    );
  }
  if (finished) {
    return (
      <div className="px-5">
        <CoachNote tone="good" lead="Opening review done." body={`${stats.firstTry} of ${stats.asked} first try. The ones you missed are due again soon, and that is how they stick.`} />
        <Button className="mt-4" onClick={() => onDone?.(stats)}>
          {doneLabel}
        </Button>
      </div>
    );
  }

  const main = node.edges[0];
  const sans = (path ?? []).map((s) => s.edge.san);
  const lastEdge = path && path.length ? path[path.length - 1].edge : null;
  const lastMove = lastEdge ? { from: lastEdge.uci.slice(0, 2), to: lastEdge.uci.slice(2, 4) } : null;
  const showArrow = solved || hint >= 3 || miss >= 2;

  const next = () => {
    if (i + 1 >= items.length) {
      setFinished(true);
      return;
    }
    setI(i + 1);
    setMiss(0);
    setHint(0);
    setSolved(false);
    setMsg(null);
  };

  const onMove = (from: string, to: string, promo?: string): boolean => {
    if (solved || miss >= 2) return false;
    const san = sanOfMove(node.fen, from, to, promo);
    if (!san) return false;
    const e = node.edges.find((x) => strip(x.san) === strip(san));
    if (e) {
      if (miss === 0) void recordNode(item.courseId, item.key, hint < 3);
      setStats((s) => ({ asked: s.asked + 1, firstTry: s.firstTry + (miss === 0 && hint < 2 ? 1 : 0) }));
      setSolved(true);
      setMsg({ tone: 'good', lead: praise(item.key + san, { hinted: hint > 0, retried: miss > 0 }), body: `${e.san}: ${e.idea}` });
      return true;
    }
    const m = miss + 1;
    setMiss(m);
    if (m === 1) void recordNode(item.courseId, item.key, false);
    const why = node.whyNot?.[san];
    if (m >= 2) {
      setStats((s) => ({ asked: s.asked + 1, firstTry: s.firstTry }));
      setMsg({ tone: 'bad', lead: 'Here is the move.', body: `${main.san}: ${main.idea}` });
      return false;
    }
    setMsg({ tone: 'bad', lead: m === 1 && !why ? nudge(item.key, 1) : 'Not in your repertoire.', body: why ? `${san}: ${why} Try again.` : `${san} is not what the course plays here. Try again.` });
    return false;
  };

  const giveHint = () => {
    const h = hint + 1;
    setHint(h);
    setMsg({ tone: 'plain', body: h === 1 ? `Think about ${pieceWord(main.san)}. What does your plan ask for here?` : h === 2 ? `It is ${pieceWord(main.san)}: look at the highlighted piece.` : `${main.san} is the move.` });
  };

  return (
    <div className="px-5">
      <div className="flex items-baseline justify-between text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
        <span>
          {course.title}
          {chapter ? ` · ${chapter.title}` : ''}
        </span>
        <span className="shrink-0 pl-2">
          {i + 1} of {items.length}
        </span>
      </div>
      <div className="mt-3">
        <Board
          fen={node.fen}
          orientation={course.side}
          movable={course.side}
          onMove={!solved && miss < 2 ? onMove : undefined}
          lastMove={lastMove}
          arrows={showArrow ? [{ from: main.uci.slice(0, 2), to: main.uci.slice(2, 4), color: 'g' }] : []}
          highlights={hint >= 2 && !solved ? { [main.uci.slice(0, 2)]: 'y' } : {}}
        />
      </div>
      <MoveList sans={sans.slice(-8)} startPly={Math.max(0, sans.length - 8)} className="mt-3" />
      <div className="mt-4 min-h-[88px] space-y-3">
        {msg ? <CoachNote tone={msg.tone} lead={msg.lead} body={msg.body} /> : <CoachNote tone="plain" body={`Your move as ${course.side === 'w' ? 'White' : 'Black'}. Play the repertoire move from memory.`} />}
        {!solved && miss < 2 ? (
          <button onClick={giveHint} disabled={hint >= 3} className="min-h-[44px] text-[14px] text-muted disabled:opacity-40">
            {hint === 0 ? 'Give me a hint' : hint < 3 ? 'Another hint' : 'Hint used'}
          </button>
        ) : (
          <Button onClick={next}>{i + 1 >= items.length ? 'Finish' : 'Next position'}</Button>
        )}
      </div>
    </div>
  );
}
