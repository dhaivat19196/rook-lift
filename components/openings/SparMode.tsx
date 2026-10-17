'use client';
import { Chess } from 'chess.js';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { myWin } from '@/lib/core';
import { Engine, getUiEngine } from '@/lib/engine';
import { hash } from '@/lib/learn/coach';
import { leafPaths, sanLine } from '@/lib/openings/tree';
import type { CompiledChapter, CompiledCourse } from '@/lib/openings/types';
import Board from '../Board';
import { Button, Segmented, Spinner } from '../ui';
import { CoachNote } from '../learn/bits';
import { MoveList, sanOfMove } from './bits';

/** About-right strengths for Stockfish's weaker settings. Skill Level handles the low end; UCI_Elo bottoms out near 1320. */
export const LEVELS = {
  '1000': { label: '~1000', skill: 0, depth: 4, elo: undefined as number | undefined, blurb: 'Friendly: it still blunders pieces.' },
  '1200': { label: '~1200', skill: 3, depth: 7, elo: undefined as number | undefined, blurb: 'Club player: sensible, but it misses tactics.' },
  '1400': { label: '~1400', skill: 20, depth: 9, elo: 1400 as number | undefined, blurb: 'Tougher: it punishes loose pieces.' },
} as const;
type LevelId = keyof typeof LEVELS;

export interface SparSummary {
  result: 'win' | 'loss' | 'draw' | 'stopped';
  moves: number;
  worst: { move: number; san: string; loss: number } | null;
  blunders: number;
}

/** Templated, warm and short. Judgement only from numbers we measured. */
export function sparNote(s: SparSummary, tip: string, seed: string): string {
  const out: string[] = [];
  const pick = (a: string[]) => a[hash(seed) % a.length];
  if (s.result === 'win') out.push(pick(['You won. Good.', 'You converted it and won.']));
  else if (s.result === 'loss') out.push(pick(['You lost this one, and that is fine: it is practice, and the position is what matters.', 'This one went against you. Let us see why.']));
  else if (s.result === 'draw') out.push('A draw. Check whether you had more than that.');
  else out.push(`You stopped after ${s.moves} moves.`);
  if (s.worst && s.worst.loss >= 18) {
    out.push(`The turning point was move ${s.worst.move}, where ${s.worst.san} cost you about ${Math.round(s.worst.loss)}% of your winning chances. Replay it and ask what that move allowed.`);
    if (s.blunders >= 2) out.push(`There were ${s.blunders} moves like that in total. Slow down on the move before you play it: checks, captures, threats.`);
  } else {
    out.push('No big swings against you. You kept control of the position, which is exactly the skill.');
  }
  out.push(`Back in the opening, the thing to carry with you: ${tip}`);
  return out.join(' ');
}

export default function SparMode({ course, chapter }: { course: CompiledCourse; chapter: CompiledChapter }) {
  const side = course.side;
  const starts = useMemo(() => leafPaths(chapter.graph, 6), [chapter.graph]);
  const [level, setLevel] = useState<LevelId>('1200');
  const [pick, setPick] = useState(() => (starts.length ? Math.floor(Math.random() * starts.length) : 0));
  const [phase, setPhase] = useState<'setup' | 'play' | 'over'>('setup');
  const [fen, setFen] = useState('');
  const [sans, setSans] = useState<string[]>([]);
  const [startLen, setStartLen] = useState(0);
  const [thinking, setThinking] = useState(false);
  const [last, setLast] = useState<{ from: string; to: string } | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [summary, setSummary] = useState<SparSummary | null>(null);
  const chessRef = useRef<Chess | null>(null);
  const engRef = useRef<Engine | null>(null);
  const alive = useRef(true);
  const cfg = LEVELS[level];

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      engRef.current?.terminate();
      engRef.current = null;
    };
  }, []);

  const eng = () => (engRef.current ??= new Engine());

  const start = () => {
    const sp = starts[pick];
    if (!sp) return;
    const c = new Chess(chapter.graph.nodes[sp.key].fen);
    chessRef.current = c;
    const seq = sp.path.map((s) => s.edge.san);
    setSans(seq);
    setStartLen(seq.length);
    setFen(c.fen());
    setLast(null);
    setNote(null);
    setSummary(null);
    setPhase('play');
    if (c.turn() !== side) void engineMove(seq);
  };

  const finish = useCallback(
    async (result: SparSummary['result'], list: string[]) => {
      setPhase('over');
      setThinking(true);
      // look back at the game with the full-strength engine, a few moves deep
      const c = new Chess();
      const fens = [c.fen()];
      for (const s of list) {
        c.move(s);
        fens.push(c.fen());
      }
      const evs: number[] = [];
      const e = getUiEngine();
      try {
        for (const f of fens.slice(0, 70)) {
          if (!alive.current) return;
          const r = await e.analyse(f, { depth: 8 });
          evs.push(r.ev);
        }
      } catch {
        /* engine busy or gone: a summary without the turning point */
      }
      let worst: SparSummary['worst'] = null;
      let blunders = 0;
      for (let j = Math.max(startLen, 0); j < evs.length - 1; j++) {
        const mover = j % 2 === 0 ? 'w' : 'b';
        if (mover !== side) continue;
        const loss = myWin(evs[j], side) - myWin(evs[j + 1], side);
        if (loss >= 18) blunders++;
        if (loss > (worst?.loss ?? 0)) worst = { move: Math.floor(j / 2) + 1, san: list[j], loss };
      }
      if (!alive.current) return;
      const s: SparSummary = { result, moves: Math.ceil(list.length / 2), worst, blunders };
      setSummary(s);
      setNote(sparNote(s, chapter.tip, list.join('')));
      setThinking(false);
    },
    [side, startLen, chapter.tip],
  );

  const checkOver = (c: Chess, list: string[]): boolean => {
    if (!c.isGameOver()) return false;
    let r: SparSummary['result'] = 'draw';
    if (c.isCheckmate()) r = c.turn() === side ? 'loss' : 'win';
    void finish(r, list);
    return true;
  };

  const engineMove = async (list: string[]) => {
    const c = chessRef.current;
    if (!c) return;
    setThinking(true);
    try {
      const r = await eng().analyse(c.fen(), { depth: cfg.depth, skill: cfg.skill, elo: cfg.elo });
      if (!alive.current || !r.bestmove) return;
      const m = c.move({ from: r.bestmove.slice(0, 2), to: r.bestmove.slice(2, 4), promotion: r.bestmove[4] });
      const next = [...list, m.san];
      setSans(next);
      setFen(c.fen());
      setLast({ from: m.from, to: m.to });
      setThinking(false);
      checkOver(c, next);
    } catch {
      setThinking(false);
    }
  };

  const onMove = (from: string, to: string, promo?: string): boolean => {
    const c = chessRef.current;
    if (!c || phase !== 'play' || thinking || c.turn() !== side) return false;
    const san = sanOfMove(c.fen(), from, to, promo);
    if (!san) return false;
    const m = c.move({ from, to, promotion: promo });
    const next = [...sans, m.san];
    setSans(next);
    setFen(c.fen());
    setLast({ from: m.from, to: m.to });
    if (!checkOver(c, next)) void engineMove(next);
    return true;
  };

  if (!starts.length) return <div className="text-muted">This chapter has no line long enough to play on from.</div>;

  if (phase === 'setup') {
    const sp = starts[pick];
    const line = sanLine(sp.path);
    return (
      <div>
        <p className="text-[15px] leading-relaxed text-muted">Play on from the end of a line against Stockfish at a reduced strength. Use what you learned, then see where the game turned.</p>
        <div className="mt-4">
          <Segmented value={level} options={(Object.keys(LEVELS) as LevelId[]).map((k) => ({ id: k, label: LEVELS[k].label }))} onChange={setLevel} />
          <p className="mt-2 text-[13px] text-muted">{cfg.blurb} Strength is approximate.</p>
        </div>
        <div className="mt-4 rounded-2xl border border-border bg-surface p-4">
          <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted">Starting from</div>
          <p className="mt-1 text-[15px] leading-relaxed tabular">{line}</p>
          <p className="mt-1 text-[13px] text-muted">
            You are {side === 'w' ? 'White' : 'Black'}.
          </p>
          <button onClick={() => setPick((pick + 1 + Math.floor(Math.random() * Math.max(1, starts.length - 1))) % starts.length)} className="mt-1 min-h-[44px] text-[14px] text-accent">
            Another starting line
          </button>
        </div>
        <Button className="mt-4" onClick={start}>
          Start sparring
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-baseline justify-between text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
        <span>Spar {cfg.label}</span>
        <span>{phase === 'over' ? 'Game over' : thinking ? 'Thinking...' : 'Your move'}</span>
      </div>
      <div className="mt-3">
        <Board fen={fen} orientation={side} movable={side} onMove={phase === 'play' && !thinking ? onMove : undefined} lastMove={last} />
      </div>
      <MoveList sans={sans.slice(-8)} startPly={Math.max(0, sans.length - 8)} className="mt-3" />
      <div className="mt-4 space-y-3">
        {phase === 'play' ? (
          <Button
            variant="ghost"
            onClick={() => {
              engRef.current?.cancel();
              void finish('stopped', sans);
            }}
          >
            End the game here
          </Button>
        ) : null}
        {phase === 'over' && thinking ? (
          <div className="flex items-center gap-2 text-[14px] text-muted">
            <Spinner /> The coach is looking at your game...
          </div>
        ) : null}
        {phase === 'over' && note ? (
          <>
            <CoachNote tone="plain" lead="Coach's summary." body={note} />
            <Button onClick={() => setPhase('setup')}>Spar again</Button>
          </>
        ) : null}
      </div>
    </div>
  );
}
