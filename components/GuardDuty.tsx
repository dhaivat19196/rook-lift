'use client';
import { Chess, type Square } from 'chess.js';
import { useEffect, useState } from 'react';
import { buildGuardSet, type GuardPos } from '@/lib/guard';
import { awardXp, bumpStat, XP } from '@/lib/progress';
import Board from './Board';
import { Bar, Button, CheckMark, Spinner } from './ui';

export interface GuardSummary {
  total: number;
  correct: number;
}

export default function GuardDuty({ onDone, count = 10 }: { onDone: (s: GuardSummary) => void; count?: number }) {
  const [set, setSet] = useState<GuardPos[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(0);

  useEffect(() => {
    void buildGuardSet(count).then(setSet);
  }, [count]);

  if (!set) {
    return (
      <div className="flex items-center gap-2 px-5 py-10 text-muted">
        <Spinner /> Building positions from your games
      </div>
    );
  }
  if (set.length === 0) {
    return (
      <div className="px-5 py-10 text-center text-muted">
        Import some games first. Guard Duty uses positions from your own games.
        <div className="mt-4">
          <Button onClick={() => onDone({ total: 0, correct: 0 })}>Back</Button>
        </div>
      </div>
    );
  }

  const pos = set[idx];
  const hangSet = new Set(pos.hanging);
  const chess = new Chess(pos.fen);

  const tap = (sq: string) => {
    if (revealed) return;
    const piece = chess.get(sq as Square);
    if (!piece || piece.color !== pos.color || piece.type === 'k') return;
    setPicked((s) => {
      const n = new Set(s);
      if (n.has(sq)) n.delete(sq);
      else n.add(sq);
      return n;
    });
  };

  const check = async () => {
    const ok = picked.size === hangSet.size && [...picked].every((s) => hangSet.has(s));
    setRevealed(true);
    if (ok) {
      setCorrect((c) => c + 1);
      await bumpStat('guard');
      await awardXp(XP.guard, undefined, { quiet: true });
    }
  };

  const next = () => {
    if (idx + 1 >= set.length) {
      onDone({ total: set.length, correct });
      return;
    }
    setIdx(idx + 1);
    setPicked(new Set());
    setRevealed(false);
  };

  const hl: Record<string, string> = {};
  if (!revealed) {
    for (const s of picked) hl[s] = 'rgb(var(--accent) / 0.5)';
  } else {
    for (const s of picked) hl[s] = hangSet.has(s) ? 'rgb(var(--accent) / 0.6)' : 'rgb(var(--warn) / 0.6)';
    for (const s of hangSet) if (!picked.has(s)) hl[s] = 'rgb(var(--danger) / 0.6)';
  }
  const isOk = revealed && picked.size === hangSet.size && [...picked].every((s) => hangSet.has(s));

  return (
    <div className="px-5">
      <div className="mb-3 flex items-center gap-3">
        <div className="text-[13px] text-muted tabular">
          {idx + 1} / {set.length}
        </div>
        <Bar value={(idx + (revealed ? 1 : 0)) / set.length} className="flex-1" />
        <button onClick={() => onDone({ total: idx + (revealed ? 1 : 0), correct })} className="min-h-[40px] px-1 text-[13px] text-muted">
          Finish
        </button>
      </div>
      <div className="mb-3">
        <div className="text-[19px] font-semibold tracking-tight">Tap your hanging pieces</div>
        <div className="mt-0.5 text-[13px] text-muted">
          You just moved. Which of your pieces can be won for free or traded up? It may be none.
        </div>
      </div>
      <Board fen={pos.fen} orientation={pos.color} highlights={hl} onSquareTap={tap} />
      <div className="mt-4 min-h-[96px]">
        {!revealed ? (
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => void check()} disabled={picked.size > 0}>
              Nothing hanging
            </Button>
            <Button onClick={() => void check()} disabled={picked.size === 0}>
              Check ({picked.size})
            </Button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3">
              {isOk ? <CheckMark size={36} /> : null}
              <div className="text-[15px]">
                {isOk
                  ? hangSet.size === 0
                    ? 'Correct. Everything was safe.'
                    : 'Correct. Those pieces were en prise.'
                  : hangSet.size === 0
                    ? 'Nothing was hanging here.'
                    : `Hanging: ${[...hangSet].join(', ')}. Red = missed, amber = not actually hanging.`}
              </div>
            </div>
            <Button className="mt-4" onClick={next}>
              {idx + 1 >= set.length ? 'Finish' : 'Next'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
