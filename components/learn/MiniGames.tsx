'use client';
import { Chess, type Square } from 'chess.js';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { makePool, mulberry32 } from '@/lib/learn/gen';
import { getProg, saveMini, starsFor, type LessonProg } from '@/lib/learn/progress';
import { cn } from '@/lib/util';
import Board from '../Board';
import { Button, CheckMark } from '../ui';
import { CoachNote, Stars } from './bits';

const EMPTY = '8/8/8/8/8/8/8/8 w - - 0 1';
const ROUND = 30;

// ---------------------------------------------------------------------------------------------------------

export function SquareSprint({ lessonId, onExit }: { lessonId: string; onExit: () => void }) {
  const [side, setSide] = useState<'w' | 'b'>('w');
  const [hide, setHide] = useState(false);
  const [state, setState] = useState<'idle' | 'run' | 'over'>('idle');
  const [left, setLeft] = useState(ROUND);
  const [score, setScore] = useState(0);
  const [target, setTarget] = useState('e4');
  const [flash, setFlash] = useState<string | null>(null);
  const [prog, setProg] = useState<LessonProg | undefined>();
  const [wrong, setWrong] = useState(0);
  const scoreRef = useRef(0);
  const endAt = useRef(0);

  useEffect(() => {
    void getProg(lessonId).then(setProg);
  }, [lessonId]);

  const pick = useCallback(() => {
    const f = 'abcdefgh'[Math.floor(Math.random() * 8)];
    const r = 1 + Math.floor(Math.random() * 8);
    return f + r;
  }, []);

  const start = () => {
    scoreRef.current = 0;
    setScore(0);
    setWrong(0);
    setLeft(ROUND);
    setTarget(pick());
    endAt.current = Date.now() + ROUND * 1000;
    setState('run');
  };

  useEffect(() => {
    if (state !== 'run') return;
    const t = setInterval(() => {
      const l = Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000));
      setLeft(l);
      if (l <= 0) {
        clearInterval(t);
        setState('over');
        void saveMini(lessonId, side === 'w' ? { hi: scoreRef.current, stars: scoreRef.current >= 25 ? 3 : scoreRef.current >= 15 ? 2 : 1 } : { hiB: scoreRef.current, stars: scoreRef.current >= 25 ? 3 : scoreRef.current >= 15 ? 2 : 1 }).then(setProg);
      }
    }, 150);
    return () => clearInterval(t);
  }, [state, lessonId, side]);

  const tap = (sq: string) => {
    if (state !== 'run') return;
    if (sq === target) {
      scoreRef.current += 1;
      setScore(scoreRef.current);
      setFlash(sq);
      let n = pick();
      while (n === target) n = pick();
      setTarget(n);
    } else {
      setWrong((w) => w + 1);
      setFlash('x' + sq);
    }
    setTimeout(() => setFlash(null), 200);
  };

  const best = side === 'w' ? (prog?.hi ?? 0) : (prog?.hiB ?? 0);
  const hl: Record<string, string> = {};
  if (flash) {
    if (flash.startsWith('x')) hl[flash.slice(1)] = 'r';
    else hl[flash] = 'g';
  }

  return (
    <div className="px-5 pb-6">
      <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted">Mini-game</div>
      <h1 className="mt-1 text-[24px] font-semibold tracking-tight">Square Sprint</h1>
      <p className="mt-1 text-[14px] text-muted">Tap the square named. {ROUND} seconds. Score 25 for the Notation Ninja badge.</p>

      {state === 'idle' ? (
        <div className="mt-5 space-y-3">
          <div className="flex rounded-xl border border-border bg-subtle p-1 text-[14px]">
            {(['w', 'b'] as const).map((s) => (
              <button key={s} onClick={() => setSide(s)} className={cn('min-h-[44px] flex-1 rounded-lg', side === s ? 'bg-surface font-medium shadow-sm' : 'text-muted')}>
                {s === 'w' ? 'As White' : 'As Black'}
              </button>
            ))}
          </div>
          <button onClick={() => setHide((h) => !h)} className="min-h-[44px] w-full rounded-xl border border-border text-[14px]">
            Coordinates on the board: {hide ? 'hidden (harder)' : 'shown'}
          </button>
          <p className="text-[13px] text-muted tabular">
            Best as {side === 'w' ? 'White' : 'Black'}: {best}
          </p>
          <Button onClick={start}>Start</Button>
        </div>
      ) : null}

      {state !== 'idle' ? (
        <>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <div className="text-[12px] text-muted">Find</div>
              <div className="text-[44px] font-semibold leading-none tracking-tight tabular">{state === 'run' ? target : '-'}</div>
            </div>
            <div className="text-right">
              <div className="text-[28px] font-semibold leading-none tabular">{score}</div>
              <div className={cn('mt-1 text-[13px] tabular', left <= 5 ? 'text-danger' : 'text-muted')}>{left}s</div>
            </div>
          </div>
          <div className="mt-3">
            <Board fen={EMPTY} orientation={side} onSquareTap={tap} highlights={hl} showNotation={!hide} />
          </div>
        </>
      ) : null}

      {state === 'over' ? (
        <div className="mt-5 text-center">
          <CheckMark size={48} />
          <h2 className="mt-3 text-[22px] font-semibold">
            {score} square{score === 1 ? '' : 's'}
          </h2>
          <p className="mt-1 text-[14px] text-muted tabular">
            {score >= best && score > 0 ? 'A new best.' : `Your best is ${best}.`} {wrong ? `${wrong} wrong taps.` : ''}
          </p>
          <div className="mt-5 space-y-2">
            <Button onClick={start}>Go again</Button>
            <Button variant="ghost" onClick={onExit}>
              Back to the path
            </Button>
          </div>
        </div>
      ) : null}
      {state === 'idle' ? (
        <Button variant="ghost" className="mt-2" onClick={onExit}>
          Back to the path
        </Button>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------

interface Pos {
  fen: string;
  san: string;
  from: string;
  to: string;
  options: string[];
}

function makeRounds(n: number, seed: number): Pos[] {
  const rng = mulberry32(seed);
  const out: Pos[] = [];
  let guard = 0;
  while (out.length < n && guard++ < 200) {
    const [fen] = makePool(rng, 1);
    if (!fen) continue;
    const c = new Chess(fen);
    const moves = c.moves({ verbose: true });
    if (moves.length < 6) continue;
    // prefer interesting moves: captures, checks, castling, disambiguation
    const pool = moves.filter((m) => m.captured || m.san.includes('+') || m.flags.includes('k') || m.flags.includes('q') || m.piece !== 'p');
    const m = pool[Math.floor(rng() * pool.length)] ?? moves[0];
    const sameDest = moves.filter((x) => x.san !== m.san && (x.to === m.to || x.piece === m.piece));
    const others = moves.filter((x) => x.san !== m.san);
    const pickFrom = [...sameDest, ...others];
    const opts = new Set<string>([m.san]);
    for (const x of pickFrom) {
      if (opts.size >= 4) break;
      opts.add(x.san);
    }
    if (opts.size < 4) continue;
    const arr = [...opts].sort(() => rng() - 0.5);
    out.push({ fen, san: m.san, from: m.from, to: m.to, options: arr });
  }
  return out;
}

function Rounds({ lessonId, kind, onExit }: { lessonId: string; kind: 'name' | 'notation'; onExit: () => void }) {
  const N = 10;
  const [seed, setSeed] = useState(() => Date.now() & 0xffffff);
  const rounds = useMemo(() => makeRounds(N, seed), [seed]);
  const [i, setI] = useState(0);
  const [ok, setOk] = useState(0);
  const [tried, setTried] = useState(false);
  const [msg, setMsg] = useState<{ tone: 'good' | 'bad'; lead: string; body: string } | null>(null);
  const [fen, setFen] = useState(rounds[0]?.fen ?? '');
  const [over, setOver] = useState(false);
  const [prog, setProg] = useState<LessonProg | undefined>();

  useEffect(() => {
    setI(0);
    setOk(0);
    setTried(false);
    setMsg(null);
    setOver(false);
    setFen(rounds[0]?.fen ?? '');
  }, [rounds]);

  const r = rounds[i];
  const turn = r ? new Chess(r.fen).turn() : 'w';

  const finish = async (good: number) => {
    setOver(true);
    const acc = good / N;
    const p = await saveMini(lessonId, { acc, stars: starsFor(acc, N) });
    setProg(p);
  };

  const resolve = (right: boolean, san: string) => {
    if (!tried) {
      if (right) setOk((x) => x + 1);
      setTried(true);
    }
    setMsg(
      right
        ? { tone: 'good', lead: 'Yes.', body: `${san} it is.` }
        : { tone: 'bad', lead: 'Not that one.', body: `It was ${san}. Look at the piece, then where it landed.` },
    );
  };

  const next = () => {
    if (i + 1 >= N) {
      void finish(ok);
      return;
    }
    setI(i + 1);
    setTried(false);
    setMsg(null);
    setFen(rounds[i + 1].fen);
  };

  if (!r) return <div className="px-5 py-10 text-muted">Setting up...</div>;
  if (over) {
    const acc = ok / N;
    return (
      <div className="px-5 pt-8 text-center">
        <CheckMark size={52} />
        <h1 className="mt-4 text-[24px] font-semibold tracking-tight">
          {ok} of {N} first time
        </h1>
        <Stars n={starsFor(acc, N)} size={22} className="mt-3" />
        <p className="mx-auto mt-3 max-w-sm text-[15px] text-muted">{acc >= 0.8 ? 'Reading the board like a book.' : 'Every miss here is a free lesson in how moves are written. Another round will help.'}</p>
        <p className="mt-1 text-[12px] text-muted tabular">Best: {Math.round((prog?.acc ?? acc) * 100)}%</p>
        <div className="mt-6 space-y-2">
          <Button onClick={() => setSeed(Date.now() & 0xffffff)}>Another round</Button>
          <Button variant="ghost" onClick={onExit}>
            Back to the path
          </Button>
        </div>
      </div>
    );
  }

  const arrows = kind === 'name' && !tried ? [{ from: r.from, to: r.to, color: 'g' as const }] : kind === 'name' || (kind === 'notation' && msg) ? [{ from: r.from, to: r.to, color: 'g' as const }] : [];
  const onMove = (from: string, to: string, promo?: string): boolean => {
    if (kind !== 'notation' || msg?.tone === 'good') return false;
    const c = new Chess(r.fen);
    let m;
    try {
      m = c.move({ from: from as Square, to: to as Square, promotion: promo });
    } catch {
      return false;
    }
    const right = m.san.replace(/[+#]/g, '') === r.san.replace(/[+#]/g, '');
    setFen(right ? c.fen() : r.fen);
    resolve(right, r.san);
    return right;
  };

  return (
    <div className="px-5 pb-6">
      <div className="flex items-center justify-between text-[13px] text-muted tabular">
        <span>
          {i + 1} / {N}
        </span>
        <span>{ok} right</span>
      </div>
      <h2 className="mt-2 text-[20px] font-semibold leading-snug tracking-tight">{kind === 'name' ? 'Which notation describes the move shown?' : <>Make this move: <span className="text-accent">{r.san}</span></>}</h2>
      <div className="mt-4">
        <Board fen={fen || r.fen} orientation={turn} movable={turn} arrows={arrows} onMove={kind === 'notation' && msg?.tone !== 'good' ? onMove : undefined} />
      </div>
      {kind === 'name' ? (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {r.options.map((o) => (
            <button
              key={o}
              disabled={!!msg && msg.tone === 'good'}
              onClick={() => resolve(o === r.san, r.san)}
              className="min-h-[56px] rounded-2xl border border-border text-[18px] font-medium tabular active:bg-subtle"
            >
              {o}
            </button>
          ))}
        </div>
      ) : null}
      <div className="mt-4">
        {msg ? <CoachNote tone={msg.tone} lead={msg.lead} body={msg.body} /> : null}
        {msg && (msg.tone === 'good' || kind === 'notation' || tried) ? (
          <Button className="mt-4" onClick={next}>
            {i + 1 >= N ? 'See my result' : 'Next'}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export default function MiniGame({ kind, lessonId, onExit }: { kind: 'sprint' | 'name' | 'notation'; lessonId: string; onExit: () => void }) {
  if (kind === 'sprint') return <SquareSprint lessonId={lessonId} onExit={onExit} />;
  return <Rounds lessonId={lessonId} kind={kind} onExit={onExit} />;
}
