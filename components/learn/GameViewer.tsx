'use client';
import { Chess, type Square } from 'chess.js';
import { useEffect, useMemo, useRef, useState } from 'react';
import { parseGame } from '@/lib/core';
import { getUiEngine } from '@/lib/engine';
import type { Annotation, LArrow, MasterGame } from '@/lib/learn/types';
import { cn } from '@/lib/util';
import Board from '../Board';
import { Button, Spinner } from '../ui';
import { CoachNote, Prose, toArrows, toMarks } from './bits';

const strip = (s: string) => s.replace(/[+#!?]/g, '');

export default function GameViewer({ game, mode: initialMode, onDone }: { game: MasterGame; mode: 'watch' | 'guess'; onDone: (ok: boolean) => void }) {
  const parsed = useMemo(() => parseGame(game.pgn), [game.pgn]);
  const [mode, setMode] = useState(initialMode);
  if (!parsed) return <div className="py-10 text-muted">This game could not be loaded.</div>;
  return (
    <div>
      <div className="mb-3">
        <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
          {game.year} · {game.event}
        </div>
        <h2 className="mt-1 text-[20px] font-semibold leading-snug tracking-tight">
          {game.white} vs {game.black}
        </h2>
        <div className="mt-2 flex rounded-xl border border-border bg-subtle p-1 text-[14px]">
          {(['watch', 'guess'] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)} className={cn('min-h-[40px] flex-1 rounded-lg transition', mode === m ? 'bg-surface font-medium shadow-sm' : 'text-muted')}>
              {m === 'watch' ? 'Watch' : 'Guess the move'}
            </button>
          ))}
        </div>
      </div>
      {mode === 'watch' ? <Watch key="w" game={game} parsed={parsed} onDone={onDone} /> : <Guess key="g" game={game} parsed={parsed} onDone={onDone} />}
    </div>
  );
}

type Parsed = NonNullable<ReturnType<typeof parseGame>>;

function moveLabel(parsed: Parsed, p: number): string {
  if (p === 0) return 'Start';
  const w = parsed.colors[p - 1] === 'w';
  return `${Math.floor((p - 1) / 2) + 1}${w ? '.' : '...'} ${parsed.sans[p - 1]}`;
}

function Watch({ game, parsed, onDone }: { game: MasterGame; parsed: Parsed; onDone: (ok: boolean) => void }) {
  const [p, setP] = useState(0);
  const n = parsed.ucis.length;
  const noteAt = (k: number): Annotation | undefined => game.notes.find((x) => x.ply === k);
  const note = noteAt(p);
  const keyPlies = game.notes.map((x) => x.ply).sort((a, b) => a - b);
  const nextKey = keyPlies.find((k) => k > p);
  const last = p > 0 ? { from: parsed.ucis[p - 1].slice(0, 2), to: parsed.ucis[p - 1].slice(2, 4) } : null;
  const seen = useRef(new Set<number>());
  useEffect(() => {
    if (note) seen.current.add(note.ply);
  }, [note]);
  return (
    <div>
      <Board fen={parsed.fens[p]} lastMove={last} orientation="w" arrows={toArrows(note?.arrows)} highlights={toMarks(note?.marks)} />
      <div className="mt-3 flex items-center justify-between">
        <div className="text-[16px] font-medium tabular">{moveLabel(parsed, p)}</div>
        <div className="text-[13px] text-muted tabular">
          {p}/{n}
        </div>
      </div>
      <div className="mt-3 min-h-[96px]">
        {note ? <Prose text={note.text} className="text-[15px]" /> : p === 0 ? <CoachNote tone="plain" body={game.blurb + ' What to look for: ' + game.theme} /> : <p className="text-[14px] text-muted">{p >= n ? 'The game is over.' : 'A quiet move. Step on, or jump to the next key moment.'}</p>}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Button variant="secondary" disabled={p === 0} onClick={() => setP(Math.max(0, p - 1))}>
          Back
        </Button>
        <Button variant="secondary" disabled={p >= n} onClick={() => setP(Math.min(n, p + 1))}>
          Next
        </Button>
        <Button variant="secondary" disabled={nextKey === undefined} onClick={() => nextKey !== undefined && setP(nextKey)}>
          Key moment
        </Button>
      </div>
      <Button className="mt-3" onClick={() => onDone(seen.current.size >= Math.ceil(game.notes.length * 0.6) || p >= n)}>
        {p >= n ? 'Finish' : 'Done watching'}
      </Button>
    </div>
  );
}

function Guess({ game, parsed, onDone }: { game: MasterGame; parsed: Parsed; onDone: (ok: boolean) => void }) {
  const points = useMemo(() => game.notes.filter((x) => x.ply >= 1 && x.ply <= parsed.ucis.length).map((x) => x.ply).sort((a, b) => a - b), [game.notes, parsed]);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<'ask' | 'busy' | 'reveal' | 'end'>('ask');
  const [msg, setMsg] = useState<{ tone: 'good' | 'bad' | 'plain'; lead: string; body: string } | null>(null);
  const [fen, setFen] = useState(() => parsed.fens[Math.max(0, (points[0] ?? 1) - 1)]);
  const [arrows, setArrows] = useState<LArrow[]>([]);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      getUiEngine().cancel();
    };
  }, []);
  const ply = points[i];
  const mover = ply ? parsed.colors[ply - 1] : 'w';
  const noteHere = game.notes.find((x) => x.ply === ply);
  const masterUci = ply ? parsed.ucis[ply - 1] : '';

  const reveal = (pts: number, lead: string, tone: 'good' | 'bad' | 'plain', extra = '') => {
    setScore((s) => s + pts);
    setFen(parsed.fens[ply]);
    setArrows([{ from: masterUci.slice(0, 2), to: masterUci.slice(2, 4), c: 'g' }, ...(noteHere?.arrows ?? [])]);
    setMsg({ tone, lead, body: `${extra}${extra ? ' ' : ''}${noteHere?.text ?? ''}` });
    setPhase('reveal');
  };

  const onMove = (from: string, to: string, promo?: string): boolean => {
    if (phase !== 'ask') return false;
    const before = parsed.fens[ply - 1];
    const c = new Chess(before);
    let m;
    try {
      m = c.move({ from: from as Square, to: to as Square, promotion: promo });
    } catch {
      return false;
    }
    if (from + to + (promo ?? '') === masterUci || strip(m.san) === strip(parsed.sans[ply - 1])) {
      reveal(10, 'The master played the same move.', 'good', `${parsed.sans[ply - 1]}.`);
      return true;
    }
    setFen(c.fen());
    setPhase('busy');
    void (async () => {
      try {
        const eng = getUiEngine();
        const b = await eng.analyse(before, { movetime: 300 });
        const a = await eng.analyse(c.fen(), { movetime: 300 });
        if (!alive.current) return;
        const sign = mover === 'w' ? 1 : -1;
        const ok = b.ev * sign >= 9000 ? a.ev * sign >= 9000 : a.ev * sign >= b.ev * sign - 40;
        if (ok) reveal(5, `${m.san} is a good move too.`, 'good', `The master chose ${parsed.sans[ply - 1]}.`);
        else reveal(0, `${m.san} is not the move.`, 'bad', `The master played ${parsed.sans[ply - 1]}.`);
      } catch {
        if (alive.current) reveal(0, `The master played ${parsed.sans[ply - 1]}.`, 'plain');
      }
    })();
    return true;
  };

  const advance = () => {
    if (i + 1 >= points.length) {
      setPhase('end');
      return;
    }
    const nx = points[i + 1];
    setI(i + 1);
    setFen(parsed.fens[nx - 1]);
    setArrows([]);
    setMsg(null);
    setPhase('ask');
  };

  if (!points.length) return <p className="py-8 text-muted">This game has no key moments to guess.</p>;
  const max = points.length * 10;
  if (phase === 'end') {
    const pct = score / max;
    return (
      <div className="text-center">
        <h3 className="mt-6 text-[22px] font-semibold tracking-tight">
          {score} of {max} points
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-[15px] text-muted">{pct >= 0.6 ? 'You think a lot like the master here. Nicely done.' : 'The master saw things you will start to see too. Watch the game again, then come back to guess.'}</p>
        <Button className="mt-6" onClick={() => onDone(pct >= 0.6)}>
          Finish
        </Button>
      </div>
    );
  }
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-[13px] text-muted tabular">
        <span>
          Key moment {i + 1} of {points.length}
        </span>
        <span>{score} pts</span>
      </div>
      <Board fen={fen} orientation={mover} movable={mover} onMove={phase === 'ask' ? onMove : undefined} arrows={toArrows(arrows)} />
      <div className="mt-4 min-h-[88px]">
        {phase === 'ask' ? <p className="text-[16px] font-medium">{mover === 'w' ? 'White' : 'Black'} to move. What would you play?</p> : null}
        {phase === 'busy' ? (
          <div className="flex items-center gap-2 text-[15px] text-muted">
            <Spinner /> Checking...
          </div>
        ) : null}
        {msg ? <CoachNote tone={msg.tone} lead={msg.lead} body={msg.body} /> : null}
        {phase === 'reveal' ? (
          <Button className="mt-4" onClick={advance}>
            {i + 1 >= points.length ? 'See my score' : 'Next key moment'}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
