'use client';
import { useLiveQuery } from 'dexie-react-hooks';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { evLabel, parseGame, TAG_INFO, WHY_OPTIONS, type GameAnalysis, type MistakeInfo } from '@/lib/core';
import { analysisQueue, useAnalysisQueue } from '@/lib/analysisQueue';
import { db } from '@/lib/db';
import { awardReview, awardXp, XP, bumpStat } from '@/lib/progress';
import { kvSet, useKV, useKVPrefix } from '@/lib/store';
import type { Game, Puzzle } from '@/lib/types';
import { gameTheme, type ThemeFacts } from '@/lib/learn/coach';
import { lessonsForTag } from '@/lib/learn/recommend';
import { BY_ID } from '@/lib/learn/registry';
import { cn, fmtDate, tcLabel } from '@/lib/util';
import Board from './Board';
import { EvalBar, EvalGraph } from './charts';
import PuzzleRunner from './PuzzleRunner';
import { Bar, Button, Card, CheckMark, Label, Spinner } from './ui';
import GameRepertoire from './openings/GameRepertoire';

const REASON: Record<string, string> = {
  checkmated: 'checkmated',
  timeout: 'timeout',
  resigned: 'resigned',
  abandoned: 'abandoned',
  agreed: 'agreed draw',
  repetition: 'repetition',
  stalemate: 'stalemate',
  insufficient: 'insufficient material',
  '50move': '50-move rule',
  timevsinsufficient: 'timeout vs insufficient',
};

const MARK: Record<string, string> = { b: '??', m: '?', i: '?!' };

export default function ReviewFlow({ gameId, onFinished }: { gameId: string; onFinished?: () => void }) {
  const game = useLiveQuery(() => db.games.get(gameId), [gameId]);
  const analysis = useKV<GameAnalysis | null>('analysis:' + gameId, null);
  const q = useAnalysisQueue();

  useEffect(() => {
    if (!analysis && game) analysisQueue.prioritize(gameId);
  }, [analysis, game, gameId]);

  if (game === undefined) return <div className="px-5 py-10 text-muted">Loading...</div>;
  if (!game) return <div className="px-5 py-10 text-muted">Game not found. Try re-importing.</div>;
  if (!analysis) {
    const frac = q.current === gameId && q.plyTotal ? q.plyDone / q.plyTotal : 0;
    return (
      <div className="px-5 py-10">
        <Card>
          <div className="flex items-center gap-3">
            <Spinner />
            <div className="text-[16px] font-medium">Analyzing your game</div>
          </div>
          <p className="mt-2 text-[14px] text-muted">The engine is checking every move on your device. This takes under a minute.</p>
          <Bar value={frac} className="mt-4" />
        </Card>
      </div>
    );
  }
  return <Review game={game} analysis={analysis} onFinished={onFinished} />;
}

function Review({ game, analysis, onFinished }: { game: Game; analysis: GameAnalysis; onFinished?: () => void }) {
  const parsed = useMemo(() => parseGame(game.pgn), [game.pgn]);
  const puzzles = useKVPrefix<Puzzle>('puzzle:' + game.id + ':');
  const keyMistakes = useMemo(() => analysis.mistakes.filter((m) => m.cls !== 'i'), [analysis]);
  const [pos, setPos] = useState(() => (keyMistakes.length ? keyMistakes[0].ply + 1 : 0));
  const [showBest, setShowBest] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);
  const [retry, setRetry] = useState<Puzzle | null>(null);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    // on a real mistake, show the engine's move (green) and yours (red) straight away
    const m = analysis.mistakes.find((x) => x.ply === pos - 1);
    setShowBest(!!m && m.cls !== 'i');
    setWhyOpen(false);
  }, [pos, analysis.mistakes]);

  const themes = useMemo(() => {
    const by: Record<string, { count: number; loss: number }> = {};
    for (const m of analysis.mistakes) {
      if (m.cls === 'i') continue;
      for (const t of m.tags) {
        if (!TAG_INFO[t]) continue;
        const e = (by[t] ??= { count: 0, loss: 0 });
        e.count += 1;
        e.loss += m.loss;
      }
    }
    return Object.entries(by)
      .sort((a, b) => b[1].loss - a[1].loss)
      .slice(0, 3)
      .map(([tag, v]): ThemeFacts => {
        const id = lessonsForTag(tag)[0] ?? null;
        return { tag, label: TAG_INFO[tag].label, count: v.count, loss: v.loss, lessonId: id, lessonTitle: id ? (BY_ID[id]?.lesson.title ?? null) : null };
      });
  }, [analysis.mistakes]);

  if (!parsed) return <div className="px-5 py-10 text-muted">Could not read this game&apos;s moves.</div>;
  const n = parsed.ucis.length;
  const mistakeHere: MistakeInfo | undefined = analysis.mistakes.find((m) => m.ply === pos - 1);
  const puzzle = mistakeHere ? puzzles?.find((p) => p.ply === mistakeHere.ply) : undefined;
  const lastUci = pos > 0 ? parsed.ucis[pos - 1] : null;
  const lastMove = lastUci ? { from: lastUci.slice(0, 2), to: lastUci.slice(2, 4) } : null;
  const ev = analysis.ev[pos] ?? 0;
  const moveLabel =
    pos === 0
      ? 'Start'
      : `${Math.floor((pos - 1) / 2) + 1}${parsed.colors[pos - 1] === 'w' ? '.' : '...'} ${parsed.sans[pos - 1]}${
          mistakeHere ? MARK[mistakeHere.cls] : ''
        }`;
  const nextMistake = () => {
    const nx = keyMistakes.find((m) => m.ply + 1 > pos);
    if (nx) setPos(nx.ply + 1);
    else if (keyMistakes.length) setPos(keyMistakes[0].ply + 1);
  };
  // green = what the engine wanted, red = what was played; drawn on the position BEFORE the move
  const showing = showBest && mistakeHere && mistakeHere.cls !== 'i';
  const arrows = showing
    ? [
        { from: mistakeHere.best.slice(0, 2), to: mistakeHere.best.slice(2, 4), color: 'g' },
        { from: mistakeHere.played.slice(0, 2), to: mistakeHere.played.slice(2, 4), color: 'r' },
      ]
    : [];

  const choose = async (id: string) => {
    if (!puzzle) return;
    const first = !puzzle.why;
    await kvSet('puzzle:' + puzzle.id, { ...puzzle, why: id });
    setWhyOpen(false);
    if (first) {
      await bumpStat('assessments');
      await awardXp(XP.assessment, undefined, { quiet: true });
    }
  };

  const finish = async () => {
    await awardReview(game.id);
    setFinished(true);
    onFinished?.();
  };

  if (retry) {
    return (
      <div>
        <PuzzleRunner puzzles={[retry]} caption="Retry" doneLabel="Back to review" onDone={() => setRetry(null)} />
      </div>
    );
  }

  const whyLabel = puzzle?.why ? WHY_OPTIONS.find((w) => w.id === puzzle.why)?.label : null;
  const outcome = game.result === 'win' ? 'Won' : game.result === 'draw' ? 'Drew' : 'Lost';

  return (
    <div className="px-5">
      <div className="mb-4">
        <div className="text-[19px] font-semibold tracking-tight">
          {outcome} vs {game.oppName} <span className="font-normal text-muted">({game.oppRating})</span>
        </div>
        <div className="mt-0.5 text-[13px] text-muted">
          {fmtDate(game.endTime)} · {tcLabel(game)} · {REASON[game.reason] ?? game.reason}
          {game.opening ? ` · ${game.opening}` : ''}
        </div>
        <div className="mt-3 flex gap-5 text-[13px]">
          <Stat label="Blunders" v={analysis.nb} />
          <Stat label="Mistakes" v={analysis.nm} />
          <Stat label="Inaccuracies" v={analysis.ni} />
          <Stat label="Accuracy" v={Math.round(analysis.acc) + '%'} />
        </div>
      </div>

      <GameRepertoire gameId={game.id} pgn={game.pgn} myColor={game.myColor} />

      {themes.length ? (
        <Card className="mb-4">
          <Label>Coach&apos;s view</Label>
          <p className="mt-1 text-[14px] text-muted">Do not try to fix everything. These are the {themes.length === 1 ? 'one thing' : `${themes.length} things`} worth your attention from this game.</p>
          <ul className="mt-3 space-y-3">
            {themes.map((t) => (
              <li key={t.tag} className="text-[15px] leading-snug">
                {gameTheme(t, game.id)}
                {t.lessonId ? (
                  <Link href={`/learn/lesson/?id=${t.lessonId}`} className="ml-2 whitespace-nowrap text-accent">
                    Open lesson
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        </Card>
      ) : analysis.nb + analysis.nm === 0 ? (
        <Card className="mb-4">
          <Label>Coach&apos;s view</Label>
          <p className="mt-1 text-[15px] leading-snug">No real mistakes in this game. That is the habit working: keep running the blunder check and keep doing exactly this.</p>
        </Card>
      ) : null}

      <div className="flex gap-2">
        <EvalBar ev={ev} orientation={game.myColor} />
        <div className="min-w-0 flex-1">
          <Board fen={showing && mistakeHere ? parsed.fens[mistakeHere.ply] : parsed.fens[pos]} orientation={game.myColor} lastMove={showing ? null : lastMove} arrows={arrows} />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-[16px] font-medium tabular">{moveLabel}</div>
        <div className="text-[14px] text-muted tabular">{evLabel(ev)}</div>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2">
        <NavBtn label="First" onClick={() => setPos(0)} d="M6 5v14M18 6l-8 6 8 6z" />
        <NavBtn label="Previous" onClick={() => setPos(Math.max(0, pos - 1))} d="M16 6l-8 6 8 6z" />
        <NavBtn label="Next" onClick={() => setPos(Math.min(n, pos + 1))} d="M8 6l8 6-8 6z" />
        <NavBtn label="Last" onClick={() => setPos(n)} d="M18 5v14M6 6l8 6-8 6z" />
      </div>

      <div className="mt-4">
        <EvalGraph ev={analysis.ev} cls={analysis.cls} myColor={game.myColor} current={pos} onSelect={setPos} />
      </div>

      {keyMistakes.length ? (
        <Button variant="secondary" className="mt-4" onClick={nextMistake}>
          Next mistake ({keyMistakes.length})
        </Button>
      ) : (
        <div className="mt-4 rounded-2xl border border-border p-4 text-[14px] text-muted">No blunders or mistakes found in this game. Nicely played.</div>
      )}

      {mistakeHere && mistakeHere.cls !== 'i' ? (
        <Card className="mt-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Label>{mistakeHere.cls === 'b' ? 'Blunder' : 'Mistake'}</Label>
              <div className="mt-1 text-[17px] font-semibold">
                You played {mistakeHere.playedSan}
                <span className="ml-2 text-[14px] font-normal text-danger">-{Math.round(mistakeHere.loss)}%</span>
              </div>
              <div className="mt-0.5 text-[14px] text-muted">
                Better was <span className="text-text">{mistakeHere.bestSan}</span>
              </div>
            </div>
          </div>
          {mistakeHere.tags.length ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {mistakeHere.tags.map((t) => (
                <span key={t} className="rounded-full border border-border px-2.5 py-1 text-[12px] text-muted">
                  {TAG_INFO[t]?.label ?? t}
                </span>
              ))}
            </div>
          ) : null}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button variant="secondary" className="min-h-[48px]" onClick={() => setShowBest((s) => !s)}>
              {showBest ? 'Hide arrows' : 'Show best'}
            </Button>
            {puzzle ? (
              <Button variant="secondary" className="min-h-[48px]" onClick={() => setRetry(puzzle)}>
                Retry position
              </Button>
            ) : (
              <div />
            )}
          </div>
          {puzzle ? (
            <div className="mt-3">
              {!whyOpen ? (
                <button onClick={() => setWhyOpen(true)} className="min-h-[44px] w-full rounded-2xl border border-border px-4 text-left text-[15px]">
                  <span className="font-medium">Why?</span>
                  <span className="ml-2 text-muted">{whyLabel ?? 'What went wrong here'}</span>
                </button>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {WHY_OPTIONS.map((w) => (
                    <button
                      key={w.id}
                      onClick={() => void choose(w.id)}
                      className={cn(
                        'min-h-[44px] rounded-full border px-4 text-[14px]',
                        puzzle.why === w.id ? 'border-accent bg-accent/10 text-accent' : 'border-border',
                      )}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </Card>
      ) : null}

      <div className="mt-6">
        {finished ? (
          <div className="flex items-center justify-center gap-3 py-2">
            <CheckMark size={36} />
            <span className="text-[16px] font-medium">Review complete</span>
          </div>
        ) : (
          <Button onClick={() => void finish()}>Finish review</Button>
        )}
      </div>
    </div>
  );
}

function Stat({ label, v }: { label: string; v: number | string }) {
  return (
    <div>
      <div className="text-[17px] font-semibold tabular">{v}</div>
      <div className="text-[11px] text-muted">{label}</div>
    </div>
  );
}

function NavBtn({ label, onClick, d }: { label: string; onClick: () => void; d: string }) {
  return (
    <button onClick={onClick} aria-label={label} className="flex min-h-[52px] items-center justify-center rounded-2xl border border-border bg-surface active:bg-subtle">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
        <path d={d} />
      </svg>
    </button>
  );
}
