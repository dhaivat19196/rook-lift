'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { nudge, praise } from '@/lib/learn/coach';
import { chooseReply, moveNumber, pathTo } from '@/lib/openings/tree';
import { dayNum, recordNode, type Recs } from '@/lib/openings/progress';
import type { CompiledChapter, CompiledCourse, OEdge, OGraph } from '@/lib/openings/types';
import Board from '../Board';
import { Button, Spinner } from '../ui';
import { CoachNote } from '../learn/bits';
import { MoveList, pieceWord, sanOfMove, strip } from './bits';
import { useRefutation } from './useRefutation';

interface Msg {
  tone: 'good' | 'bad' | 'plain';
  lead?: string;
  body?: string;
}

/**
 * Move trainer. The opponent plays popularity-weighted replies (leaning toward branches with positions that are due);
 * you must find the repertoire move. Each node has its own box: 1, 3, 7, 14, 30 days.
 */
export default function DrillMode({
  course,
  chapter,
  graph,
  recs,
  startNode,
  onRunEnd,
}: {
  course: CompiledCourse;
  chapter: CompiledChapter;
  graph?: OGraph;
  recs: Recs | undefined;
  startNode?: string | null;
  onRunEnd?: () => void;
}) {
  const g = graph ?? chapter.graph;
  const side = course.side;
  const recsRef = useRef<Recs>({});
  useEffect(() => {
    recsRef.current = recs ?? {};
  }, [recs]);

  const [hist, setHist] = useState<OEdge[]>([]);
  const [key, setKey] = useState(g.root);
  const [run, setRun] = useState(0);
  const [miss, setMiss] = useState(0);
  const [hint, setHint] = useState(0);
  const [msg, setMsg] = useState<Msg | null>(null);
  const [shown, setShown] = useState<string | null>(null);
  const [wrong, setWrong] = useState<{ fen: string; uci: string } | null>(null);
  const [stats, setStats] = useState({ asked: 0, clean: 0 });
  const [totals, setTotals] = useState({ runs: 0, asked: 0, clean: 0 });
  const [anyway, setAnyway] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startRef = useRef(startNode ?? null);

  const node = g.nodes[key];
  const ended = node.edges.length === 0;
  const myTurn = node.turn === side && !ended;
  const last = hist.length ? hist[hist.length - 1] : null;

  const wantMore = useCallback(
    (k: string) => {
      if (anyway) return true;
      const r = recsRef.current[k];
      return !r || r.d <= dayNum();
    },
    [anyway],
  );

  // start (or restart) a run
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    let h: OEdge[] = [];
    let k = g.root;
    const target = startRef.current;
    if (target && g.nodes[target]) {
      const p = pathTo(g, target);
      if (p) {
        h = p.map((s) => s.edge);
        k = target;
      }
      startRef.current = null;
    }
    setHist(h);
    setKey(k);
    setMiss(0);
    setHint(0);
    setShown(null);
    setWrong(null);
    setStats({ asked: 0, clean: 0 });
    setMsg(h.length ? { tone: 'plain', body: 'We start from the position you asked about. Find the repertoire move.' } : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, g]);

  // opponent replies
  useEffect(() => {
    if (ended || myTurn) return;
    timer.current = setTimeout(() => {
      const e = chooseReply(g, node, side, wantMore);
      if (!e) return;
      setHist((h) => [...h, e]);
      setKey(e.to);
      setMiss(0);
      setHint(0);
      setWrong(null);
      setMsg({ tone: 'plain', lead: e.mistake ? 'That is a mistake.' : undefined, body: `${moveNumber(hist.length)}${e.san}: ${e.idea}${e.mistake ? ' Punish it.' : ''}` });
    }, 650);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, ended, myTurn]);

  const play = (e: OEdge) => {
    setHist((h) => [...h, e]);
    setKey(e.to);
    setMiss(0);
    setHint(0);
    setShown(null);
    setWrong(null);
  };

  const onMove = (from: string, to: string, promo?: string): boolean => {
    if (!myTurn || shown) return false;
    const san = sanOfMove(node.fen, from, to, promo);
    if (!san) return false;
    const e = node.edges.find((x) => strip(x.san) === strip(san));
    if (e) {
      const clean = miss === 0 && hint < 2;
      if (miss === 0) void recordNode(course.id, key, hint < 3);
      setStats((s) => ({ asked: s.asked + 1, clean: s.clean + (clean ? 1 : 0) }));
      setMsg({ tone: 'good', lead: praise(key + san, { hinted: hint > 0, retried: miss > 0 }), body: `${moveNumber(hist.length)}${e.san}: ${e.idea}` });
      play(e);
      return true;
    }
    const m = miss + 1;
    setMiss(m);
    if (m === 1) void recordNode(course.id, key, false);
    const why = node.whyNot?.[san];
    const uci = from + to + (promo ?? '');
    setWrong({ fen: node.fen, uci });
    const main = node.edges[0];
    if (m >= 2) {
      setShown(main.uci);
      setMsg({ tone: 'bad', lead: 'Here is the repertoire move.', body: `${main.san}: ${main.idea}` });
      timer.current = setTimeout(() => {
        setStats((s) => ({ asked: s.asked + 1, clean: s.clean }));
        play(main);
      }, 1800);
      return false;
    }
    setMsg({
      tone: 'bad',
      lead: 'Not in your repertoire.',
      body: why ? `${san}: ${why} Try again.` : `${san} is not what the course plays here. Think about the plan: ${chapter.tip}`,
    });
    return false;
  };

  const giveHint = () => {
    const main = node.edges[0];
    const h = hint + 1;
    setHint(h);
    if (h === 1) setMsg({ tone: 'plain', body: `Think about ${pieceWord(main.san)}. What does your plan ask for here?` });
    else if (h === 2) setMsg({ tone: 'plain', body: `It is ${pieceWord(main.san)}, the one I have highlighted.` });
    else setMsg({ tone: 'plain', body: `${main.san} is the move. Play it, and read the idea.` });
  };

  const refu = useRefutation(wrong && miss === 1 ? wrong.fen : null, wrong && miss === 1 ? wrong.uci : null, side);

  const sans = hist.map((e) => e.san);
  const main = node.edges[0];
  const arrows = [
    ...(shown || hint >= 3 ? [{ from: main.uci.slice(0, 2), to: main.uci.slice(2, 4), color: 'g' }] : []),
    ...(refu && refu !== 'loading' && refu.loss >= 12 && refu.reply ? [{ from: refu.reply.slice(0, 2), to: refu.reply.slice(2, 4), color: 'r' }] : []),
  ];
  const highlights: Record<string, string> = hint >= 2 && myTurn ? { [main.uci.slice(0, 2)]: 'y' } : {};
  const lastMove = last ? { from: last.uci.slice(0, 2), to: last.uci.slice(2, 4) } : null;

  const dueNow = useMemo(() => {
    const t = dayNum();
    return Object.values(g.nodes).filter((n) => n.turn === side && n.edges.length && recs?.[n.key] && recs[n.key].d <= t).length;
  }, [g, side, recs]);

  const endRun = () => {
    setTotals((t) => ({ runs: t.runs + 1, asked: t.asked + stats.asked, clean: t.clean + stats.clean }));
    onRunEnd?.();
    setRun((r) => r + 1);
  };

  return (
    <div>
      <div className="flex items-baseline justify-between text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
        <span>Play your side from memory</span>
        <span>{anyway ? 'Practising anyway' : dueNow ? `${dueNow} due` : 'Nothing due'}</span>
      </div>
      <div className="mt-3">
        <Board fen={node.fen} orientation={side} movable={side} onMove={myTurn && !shown ? onMove : undefined} lastMove={lastMove} arrows={arrows} highlights={highlights} />
      </div>
      <MoveList sans={sans} className="mt-3" />
      <div className="mt-4 min-h-[96px] space-y-3">
        {msg ? <CoachNote tone={msg.tone} lead={msg.lead} body={msg.body} /> : <CoachNote tone="plain" body={myTurn ? 'Your move. Play it from memory.' : 'Their move...'} />}
        {wrong && miss === 1 && refu === 'loading' ? (
          <div className="flex items-center gap-2 text-[13px] text-muted">
            <Spinner /> Checking what that move allows...
          </div>
        ) : null}
        {wrong && miss === 1 && refu && refu !== 'loading' && refu.loss >= 12 && refu.replySan ? (
          <p className="rounded-xl border border-border bg-subtle px-3.5 py-2.5 text-[14px] leading-snug">
            <span className="mr-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-muted">Refutation</span>
            That move actually costs you: the reply <strong>{refu.replySan}</strong> (red arrow) punishes it.
          </p>
        ) : null}
        {myTurn && !shown ? (
          <button onClick={giveHint} disabled={hint >= 3} className="min-h-[44px] text-[14px] text-muted disabled:opacity-40">
            {hint === 0 ? 'Give me a hint' : hint < 3 ? 'Another hint' : 'Hint used'}
          </button>
        ) : null}
        {ended ? (
          <>
            <CoachNote
              tone="good"
              lead={stats.asked === 0 ? 'Line complete.' : stats.clean === stats.asked ? 'Clean run.' : 'Line complete.'}
              body={`${stats.clean} of ${stats.asked} moves first try. ${node.dev ?? `Remember: ${chapter.tip}`}`}
            />
            <Button onClick={endRun}>Another line</Button>
            {!anyway && dueNow === 0 ? (
              <Button variant="ghost" onClick={() => setAnyway(true)}>
                Nothing due: practise anyway
              </Button>
            ) : null}
          </>
        ) : null}
      </div>
      {totals.runs ? (
        <div className="mt-2 text-[12px] text-muted tabular">
          This session: {totals.runs} {totals.runs === 1 ? 'line' : 'lines'}, {totals.clean}/{totals.asked} first try
        </div>
      ) : null}
    </div>
  );
}
