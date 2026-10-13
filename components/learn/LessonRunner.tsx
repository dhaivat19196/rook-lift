'use client';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fmtDate } from '@/lib/util';
import { finishLine, masteryNote } from '@/lib/learn/coach';
import { generate, makePool, mulberry32 } from '@/lib/learn/gen';
import { adapt, completeLesson, getSkill, recordItem, reviewLesson, saveSkill, type CompleteResult, type SkillState } from '@/lib/learn/progress';
import { BY_ID, gameById } from '@/lib/learn/registry';
import type { Lesson, SkillId, Step, TextStep } from '@/lib/learn/types';
import { usePuzzles } from '@/lib/store';
import type { Puzzle } from '@/lib/types';
import { TAG_INFO } from '@/lib/core';
import EndgameDrill from '../EndgameDrill';
import PuzzleRunner from '../PuzzleRunner';
import { Bar, Button, CheckMark, LinkButton, Spinner } from '../ui';
import { Close, CoachNote, Prose, Stars } from './bits';
import GameViewer from './GameViewer';
import LineDrill from './LineDrill';
import { ChoiceView, MoveView, SquaresView, TextView, TrueFalseView } from './StepViews';

type Entry = { kind: 'step'; step: Step; src?: string } | { kind: 'gen'; skill: SkillId } | { kind: 'worked'; from: Step };

export interface RunSummary {
  scored: number;
  correct: number;
  stars: number;
}

interface Props {
  lesson: Lesson;
  /** replace the lesson's own steps (practice rounds, spaced review) */
  steps?: Step[];
  mode?: 'lesson' | 'practice' | 'review';
  /** older practice items woven in at the end (interleaving) */
  mixed?: { lessonId: string; step: Step }[];
  /** FENs from the student's own games, used by generators */
  pool?: string[];
  /** the student's own missed mates-in-one */
  mates?: string[];
  /** called from the "Another round" button of a practice round */
  onAgain?: () => void;
  /** used inside the daily session: replaces the finish buttons with a single continue */
  embedded?: { doneLabel: string; onFinish: (s: RunSummary) => void };
  onExit: () => void;
  /** a link to the suggested next lesson */
  nextHref?: string;
  nextTitle?: string;
}

const SCORED = new Set(['move', 'choice', 'squares', 'truefalse', 'line', 'playout']);
const isScoredStep = (s: Step) => s.t !== 'text' && s.t !== 'game' && SCORED.has(s.t) && s.phase === 'practice';

function build(steps: Step[], mixed: { lessonId: string; step: Step }[]): Entry[] {
  const out: Entry[] = [];
  for (const s of steps) {
    if (s.t === 'gen') for (let i = 0; i < s.n; i++) out.push({ kind: 'gen', skill: s.skill });
    else out.push({ kind: 'step', step: s });
  }
  for (const m of mixed) out.push({ kind: 'step', step: { ...m.step, phase: 'mixed' } as Step, src: m.lessonId });
  return out;
}

function workedExample(from: Step): TextStep {
  const f = from as { q?: string; prompt?: string; why?: string; board?: { fen: string; side?: 'w' | 'b'; arrows?: never; marks?: never }; reveal?: { arrows?: never[]; marks?: never } };
  const g = from as unknown as { board?: TextStep['board']; reveal?: { arrows?: NonNullable<TextStep['board']>['arrows']; marks?: NonNullable<TextStep['board']>['marks'] }; fen?: string };
  const base = g.board;
  return {
    id: 'worked',
    t: 'text',
    phase: 'example',
    title: "Let's slow down and walk through one together",
    body: `${f.q ?? f.prompt ?? ''}\n\n${f.why ?? ''}\n\nTake your time with the next one. Count first, then decide.`,
    board: base ? { ...base, arrows: [...(base.arrows ?? []), ...(g.reveal?.arrows ?? [])], marks: { ...(base.marks ?? {}), ...(g.reveal?.marks ?? {}) } } : g.fen ? { fen: g.fen } : undefined,
  };
}

export default function LessonRunner({ lesson, steps, mode = 'lesson', mixed = [], pool, mates, onAgain, embedded, onExit, nextHref, nextTitle }: Props) {
  const [entries, setEntries] = useState<Entry[]>(() => build(steps ?? lesson.steps, mixed));
  const [idx, setIdx] = useState(0);
  const [cur, setCur] = useState<Step | null>(null);
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);
  const [summary, setSummary] = useState<(RunSummary & { complete?: CompleteResult; passed?: boolean }) | null>(null);
  const results = useRef<{ ok: boolean }[]>([]);
  const skills = useRef<Record<string, SkillState>>({});
  const bank = useRef<string[]>([]);
  const rng = useRef(mulberry32((Date.now() ^ 0x9e3779b9) >>> 0));
  const saved = useRef(false);

  // load adaptive skill levels, then start
  useEffect(() => {
    let live = true;
    void (async () => {
      const sk = new Set<string>();
      for (const e of entries) if (e.kind === 'gen') sk.add(e.skill);
      for (const k of sk) skills.current[k] = await getSkill(k);
      if (live) setReady(true);
    })();
    // a small bank of random positions, built a few at a time so the page stays responsive
    let n = 0;
    const tick = () => {
      if (!live || n >= 24) return;
      bank.current.push(...makePool(rng.current, 3));
      n += 3;
      setTimeout(tick, 40);
    };
    if (entries.some((e) => e.kind === 'gen')) setTimeout(tick, 200);
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const entry = entries[idx];

  // produce the current step
  useEffect(() => {
    if (!ready || !entry) return;
    if (entry.kind === 'step') {
      setCur(entry.step);
      return;
    }
    if (entry.kind === 'worked') {
      setCur(workedExample(entry.from));
      return;
    }
    setCur(null);
    const id = setTimeout(() => {
      const level = skills.current[entry.skill]?.lvl ?? 1;
      const all = [...(pool ?? []), ...bank.current];
      let step: Step | null = null;
      for (let i = 0; i < 6 && !step; i++) step = generate(entry.skill, { rng: rng.current, level, pool: all.length ? all : undefined, mates });
      if (!step) {
        // generator could not make an item right now: skip it
        setIdx((x) => x + 1);
        return;
      }
      setCur(step);
    }, 20);
    return () => clearTimeout(id);
  }, [ready, idx, entry, pool, mates]);

  const finish = useCallback(async () => {
    if (saved.current) return;
    saved.current = true;
    const r = results.current;
    const scored = r.length;
    const correct = r.filter((x) => x.ok).length;
    if (mode === 'lesson') {
      const c = await completeLesson(lesson.id, correct, scored);
      setSummary({ scored, correct, stars: c.stars, complete: c });
    } else if (mode === 'review') {
      const passed = scored === 0 || correct / scored >= 0.67;
      await reviewLesson(lesson.id, passed);
      setSummary({ scored, correct, stars: 0, passed });
    } else setSummary({ scored, correct, stars: 0 });
    for (const s of Object.values(skills.current)) await saveSkill(s);
    setDone(true);
  }, [lesson.id, mode]);

  const onResolved = (e: Entry, step: Step, ok: boolean) => {
    const scored = e.kind === 'gen' || (e.kind === 'step' && (isScoredStep(step) || (e.step.phase === 'mixed' && SCORED.has(step.t))));
    if (e.kind === 'gen') {
      results.current.push({ ok });
      const st = skills.current[e.skill] ?? { skill: e.skill, lvl: 1, streak: 0, miss: 0, n: 0 };
      const { state, moved } = adapt(st, ok);
      skills.current[e.skill] = state;
      void saveSkill(state);
      if (moved === 'down') {
        setEntries((es) => {
          const copy = es.slice();
          copy.splice(idx + 1, 0, { kind: 'worked', from: step });
          return copy;
        });
      }
      return;
    }
    if (e.kind !== 'step') return;
    if (scored && (e.step.phase !== 'mixed' || mode !== 'lesson')) results.current.push({ ok });
    if (SCORED.has(step.t) && step.t !== 'playout') void recordItem(e.src ?? lesson.id, step.id, ok);
  };

  const next = () => {
    if (idx + 1 >= entries.length) void finish();
    else setIdx(idx + 1);
  };

  if (done && summary) return <DoneScreen lesson={lesson} mode={mode} summary={summary} embedded={embedded} onExit={onExit} onAgain={onAgain} nextHref={nextHref} nextTitle={nextTitle} />;

  if (!entry) {
    // nothing to do
    return (
      <div className="px-5 pt-10">
        <Button onClick={() => void finish()}>Finish</Button>
      </div>
    );
  }

  const key = `${idx}-${cur?.id ?? 'x'}`;
  const isLast = idx + 1 >= entries.length;
  const common = (step: Step) => ({
    rule: lesson.rule,
    seed: `${lesson.id}:${step.id}:${idx}`,
    onResolved: (ok: boolean) => onResolved(entry, step, ok),
    onNext: next,
    isLast,
  });

  return (
    <div className="px-5 pb-6">
      <div className="flex items-center gap-2 pt-2">
        <div className="min-w-0 flex-1">
          <Bar value={idx / entries.length} />
        </div>
        <div className="text-[12px] text-muted tabular">
          {idx + 1}/{entries.length}
        </div>
        <Close onClick={onExit} />
      </div>
      <div className="mt-2" key={key}>
        {!cur ? (
          <div className="flex items-center gap-2 py-10 text-[15px] text-muted">
            <Spinner /> Setting up a position...
          </div>
        ) : (
          <StepSwitch step={cur} props={common(cur)} onResolvedDirect={(ok) => onResolved(entry, cur, ok)} next={next} isLast={isLast} />
        )}
      </div>
    </div>
  );
}

interface CommonProps {
  rule: string;
  seed: string;
  onResolved: (ok: boolean) => void;
  onNext: () => void;
  isLast: boolean;
}

function StepSwitch({ step, props, onResolvedDirect, next, isLast }: { step: Step; props: CommonProps; onResolvedDirect: (ok: boolean) => void; next: () => void; isLast: boolean }) {
  switch (step.t) {
    case 'text':
      return <TextView step={step} {...props} />;
    case 'move':
      return <MoveView step={step} {...props} />;
    case 'choice':
      return <ChoiceView step={step} {...props} />;
    case 'squares':
      return <SquaresView step={step} {...props} />;
    case 'truefalse':
      return <TrueFalseView step={step} {...props} />;
    case 'line':
      return (
        <LineDrill
          line={step.line}
          doneLabel={isLast ? 'Finish' : 'Continue'}
          onDone={(clean) => {
            onResolvedDirect(clean);
            next();
          }}
        />
      );
    case 'playout':
      return (
        <div>
          {step.intro ? <Prose text={step.intro} className="mb-3 px-5 text-muted" /> : null}
          <div className="-mx-5">
            <EndgameDrill
              drill={step.drill}
              award={false}
              doneLabel={isLast ? 'Finish' : 'Continue'}
              onDone={(ok) => {
                onResolvedDirect(ok);
                next();
              }}
            />
          </div>
        </div>
      );
    case 'game': {
      const g = gameById(step.gameId);
      return g ? (
        <GameViewer
          game={g}
          mode={step.mode}
          onDone={(ok) => {
            onResolvedDirect(ok);
            next();
          }}
        />
      ) : (
        <div className="py-10 text-muted">This game is not available.</div>
      );
    }
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------------------------------------

function DoneScreen({ lesson, mode, summary, embedded, onExit, onAgain, nextHref, nextTitle }: { onAgain?: () => void; lesson: Lesson; mode: 'lesson' | 'practice' | 'review'; summary: RunSummary & { complete?: CompleteResult; passed?: boolean }; embedded?: Props['embedded']; onExit: () => void; nextHref?: string; nextTitle?: string }) {
  const puzzles = usePuzzles();
  const [fromGames, setFromGames] = useState(false);
  const acc = summary.scored ? summary.correct / summary.scored : 1;
  const mine = useMemo(() => {
    if (!puzzles || !lesson.tags?.length) return [] as Puzzle[];
    return puzzles
      .filter((p) => p.tags.some((t) => lesson.tags!.includes(t)))
      .sort((a, b) => b.gameEnd - a.gameEnd)
      .slice(0, 3);
  }, [puzzles, lesson.tags]);
  const ref = BY_ID[lesson.id];
  const tagLabel = lesson.tags?.length ? TAG_INFO[lesson.tags[0]]?.label?.toLowerCase() : null;

  if (fromGames) {
    return (
      <div>
        <PuzzleRunner
          puzzles={mine}
          noSrs
          doneLabel="Done"
          caption="From your games"
          captionFor={(p) => `This came from your game on ${fmtDate(p.gameEnd)}. Same idea: find it.`}
          onDone={() => setFromGames(false)}
        />
      </div>
    );
  }

  const title = mode === 'lesson' ? 'Lesson complete' : mode === 'review' ? (summary.passed ? 'Review passed' : 'Review: not quite yet') : 'Round done';
  const mn = summary.complete ? masteryNote(acc) : null;

  return (
    <div className="px-5 pt-8">
      <div className="flex flex-col items-center text-center">
        <CheckMark size={60} />
        <h1 className="mt-5 text-[26px] font-semibold tracking-tight">{title}</h1>
        {mode === 'lesson' ? <Stars n={summary.stars} size={22} className="mt-3" /> : null}
        {summary.scored ? (
          <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-muted">
            {mode === 'lesson' ? finishLine(summary.stars, acc, lesson.id) : `${summary.correct} of ${summary.scored} right first time.`}
          </p>
        ) : null}
        {mode === 'review' ? <p className="mt-2 max-w-sm text-[15px] text-muted">{summary.passed ? 'That is a good sign it has stuck. I will check again later.' : 'A few slipped. No problem: I will ask again tomorrow.'}</p> : null}
        {summary.complete && summary.complete.xp > 0 ? <p className="mt-1 text-[12px] text-muted tabular">+{summary.complete.xp} XP</p> : null}
      </div>

      {mode === 'lesson' ? (
        <div className="mt-6 space-y-3">
          {mn ? <CoachNote tone="plain" body={mn.text} /> : null}
          <div className="rounded-2xl border border-border p-4">
            <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted">What to remember</div>
            <ul className="mt-2 space-y-1.5 text-[15px] leading-snug">
              {lesson.recap.map((r, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-accent" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border p-4">
            <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted">Use it in your next game</div>
            <p className="mt-2 text-[15px] leading-snug">{lesson.habit}</p>
          </div>
        </div>
      ) : null}

      <div className="mt-6 space-y-2">
        {mine.length ? (
          <Button variant="secondary" onClick={() => setFromGames(true)}>
            From your games ({mine.length}){tagLabel ? ` · ${tagLabel}` : ''}
          </Button>
        ) : null}
        {embedded ? (
          <Button onClick={() => embedded.onFinish(summary)}>{embedded.doneLabel}</Button>
        ) : (
          <>
            {mode === 'lesson' && nextHref ? <LinkButton href={nextHref}>{nextTitle ? `Next: ${nextTitle}` : 'Next lesson'}</LinkButton> : null}
            {mode === 'practice' && onAgain ? <Button onClick={onAgain}>Another round</Button> : null}
            {mode === 'lesson' && (lesson.skill || ref) ? (
              <LinkButton href={`/learn/practice/?lesson=${lesson.id}`} variant="secondary">
                Practice more
              </LinkButton>
            ) : null}
            <Button variant="ghost" onClick={onExit}>
              Back to the path
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
