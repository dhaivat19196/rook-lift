'use client';
import { useMemo, useState } from 'react';
import { nudge, praise } from '@/lib/learn/coach';
import { recordQuiz, useQuizRes } from '@/lib/openings/progress';
import type { CompiledChapter, CompiledCourse } from '@/lib/openings/types';
import { cn } from '@/lib/util';
import Board from '../Board';
import { Button } from '../ui';
import { CoachNote, toArrows, toMarks } from '../learn/bits';
import { fenAt, seededShuffle } from './bits';

const KIND: Record<string, string> = { plan: 'What is the plan?', square: 'Where does it go?', break: 'Which pawn break?' };

/** "What is the plan here?" questions at typical positions out of the opening. */
export default function PlansMode({ course, chapter }: { course: CompiledCourse; chapter: CompiledChapter }) {
  const res = useQuizRes('opq', course.id, chapter.id);
  const qs = chapter.plans;
  const [i, setI] = useState(0);
  const [tried, setTried] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const [cur, setCur] = useState<number | null>(null);
  const [firstTry, setFirstTry] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = qs[i];
  const opts = useMemo(() => (q ? seededShuffle(q.opts, q.id + chapter.id) : []), [q, chapter.id]);
  const fen = useMemo(() => (q ? fenAt(q.at) : ''), [q]);

  if (!qs.length) return <div className="text-muted">No questions in this chapter yet.</div>;

  if (finished) {
    const right = qs.filter((x) => res?.[x.id]?.ok).length;
    return (
      <div>
        <CoachNote
          tone="good"
          lead={`${firstTry} of ${qs.length} first try.`}
          body={
            firstTry === qs.length
              ? 'That is the thinking behind the moves, and you have got it. Now it is about playing it in real games.'
              : `The ones you missed are where the learning is. You have ${right} of ${qs.length} marked right so far; go again whenever you like.`
          }
        />
        <div className="mt-4 grid gap-2">
          <Button
            onClick={() => {
              setI(0);
              setTried([]);
              setSolved(false);
              setCur(null);
              setFirstTry(0);
              setFinished(false);
            }}
          >
            Go again
          </Button>
        </div>
      </div>
    );
  }

  const correct = opts.findIndex((o) => o.ok);
  const o = cur !== null ? opts[cur] : null;
  const pick = (idx: number) => {
    if (solved || tried.includes(idx)) return;
    setCur(idx);
    if (opts[idx].ok) {
      setSolved(true);
      const first = tried.length === 0;
      if (first) setFirstTry((n) => n + 1);
      void recordQuiz('opq', course.id, chapter.id, q.id, first);
    } else {
      const t = [...tried, idx];
      setTried(t);
      if (t.length === 1) void recordQuiz('opq', course.id, chapter.id, q.id, false);
      if (t.length >= 2) {
        setSolved(true);
        setCur(correct);
      }
    }
  };

  const preview = o && !solved ? o.arrows : solved ? opts[correct].arrows : undefined;
  const arrows = toArrows([...(q.arrows ?? []), ...(preview ?? [])]);
  const wrongShown = o && !o.ok && !solved;

  return (
    <div>
      <div className="flex items-baseline justify-between text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
        <span>{KIND[q.kind]}</span>
        <span>
          {i + 1} of {qs.length}
        </span>
      </div>
      <h2 className="mt-2 text-[20px] font-semibold leading-snug tracking-tight">{q.q}</h2>
      <div className="mt-4">
        <Board fen={fen} orientation={course.side} arrows={arrows} highlights={toMarks(q.marks)} />
      </div>
      <div className="mt-4 space-y-2">
        {opts.map((opt, k) => {
          const isTried = tried.includes(k);
          const isRight = solved && opt.ok;
          return (
            <button
              key={k}
              onClick={() => pick(k)}
              disabled={solved || isTried}
              className={cn(
                'min-h-[52px] w-full rounded-2xl border px-4 py-2.5 text-left text-[16px] leading-snug transition',
                isRight ? 'border-accent bg-accent/10' : isTried ? 'border-danger/40 text-muted line-through decoration-danger/40' : 'border-border active:bg-subtle',
              )}
            >
              {opt.t}
            </button>
          );
        })}
      </div>
      <div className="mt-4 space-y-3">
        {wrongShown ? <CoachNote tone="bad" lead={nudge(q.id, tried.length - 1)} body={(o?.why ?? 'That is not it.') + ' Have another look.'} /> : null}
        {solved ? (
          <>
            <CoachNote tone="good" lead={tried.length ? 'Here is the answer.' : praise(q.id, { hinted: false, retried: false })} body={opts[correct].why} rule={q.rule} />
            <Button
              onClick={() => {
                if (i + 1 >= qs.length) setFinished(true);
                else {
                  setI(i + 1);
                  setTried([]);
                  setSolved(false);
                  setCur(null);
                }
              }}
            >
              {i + 1 >= qs.length ? 'Finish' : 'Next question'}
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}
