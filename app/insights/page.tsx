'use client';
import Link from 'next/link';
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useMemo } from 'react';
import { useAnalysisQueue } from '@/lib/analysisQueue';
import type { GameAnalysis } from '@/lib/core';
import { db } from '@/lib/db';
import { computeInsights, type WeaknessRow } from '@/lib/insights';
import { checkBadges, mutateProgress } from '@/lib/progress';
import { usePuzzles, useProgress } from '@/lib/store';
import { cn, fmtClock } from '@/lib/util';
import { LineChart } from '@/components/charts';
import { Bar, Card, Empty, Label, PageTitle } from '@/components/ui';

function Section({ title, children, note }: { title: string; children: React.ReactNode; note?: string }) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 px-1 text-[13px] font-medium uppercase tracking-[0.08em] text-muted">{title}</h2>
      {children}
      {note ? <p className="mt-2 px-1 text-[12px] text-muted">{note}</p> : null}
    </section>
  );
}

function Trend({ t }: { t: WeaknessRow['trend'] }) {
  if (t === 'flat') return <span className="text-[12px] text-muted">steady</span>;
  const better = t === 'down';
  return (
    <span className={cn('flex items-center gap-1 text-[12px]', better ? 'text-accent' : 'text-danger')}>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d={t === 'up' ? 'M5 9V1M1.5 4.5 5 1l3.5 3.5' : 'M5 1v8M1.5 5.5 5 9l3.5-3.5'} />
      </svg>
      {better ? 'improving' : 'getting worse'}
    </span>
  );
}

function Boss({ w }: { w: WeaknessRow }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="text-[16px] font-semibold tracking-tight">{w.label}</div>
            {w.defeated ? <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[11px] text-accent">defeated</span> : null}
          </div>
          <div className="mt-0.5 text-[13px] text-muted">{w.blurb}</div>
        </div>
        <Trend t={w.trend} />
      </div>
      <Bar value={w.hp / 100} tone="danger" className="mt-4" />
      <div className="mt-2 flex items-center justify-between text-[12px] text-muted tabular">
        <span>
          HP {Math.round(w.hp)}% · {w.recentFreq.toFixed(2)}/game recently vs {w.baseFreq.toFixed(2)} overall
        </span>
        <Link href={`/puzzles/?tag=${w.tag}`} className="text-accent">
          Drill
        </Link>
      </div>
      <div className="mt-1 text-[12px] text-muted tabular">
        Cost about {(w.total / 100).toFixed(1)} games&apos; worth of win chances across {w.count} moments
      </div>
    </Card>
  );
}

export default function InsightsPage() {
  const games = useLiveQuery(() => db.games.toArray(), []);
  const analyses = useLiveQuery(async () => (await db.kv.where('key').startsWith('analysis:').toArray()).map((r) => r.value as GameAnalysis), []);
  const puzzles = usePuzzles();
  const progress = useProgress();
  const q = useAnalysisQueue();

  const ins = useMemo(() => (games && analyses && puzzles ? computeInsights(games, analyses, puzzles) : null), [games, analyses, puzzles]);

  useEffect(() => {
    if (!ins) return;
    const defeated = ins.weaknesses.filter((w) => w.defeated).map((w) => w.tag);
    const fresh = defeated.filter((t) => !progress.bosses.includes(t));
    if (fresh.length) {
      void mutateProgress((p) => {
        for (const t of fresh) if (!p.bosses.includes(t)) p.bosses.push(t);
      }).then(() => checkBadges());
    }
  }, [ins, progress.bosses]);

  if (!ins) return <PageTitle title="Chess DNA" />;

  if (ins.totalGames === 0) {
    return (
      <div>
        <PageTitle title="Chess DNA" sub="Your habits, measured." />
        <div className="px-5">
          <Empty title="No games yet" body="Import your Chess.com games from the Profile tab to see what costs you points." />
        </div>
      </div>
    );
  }

  const pct = ins.totalGames ? Math.round((ins.analyzed / ins.totalGames) * 100) : 0;
  const maxPhase = Math.max(1, ...ins.phases.map((p) => p.loss));
  const totalPhaseLoss = Math.max(1, ins.phases.reduce((s, p) => s + p.loss, 0));
  const bosses = ins.weaknesses.filter((w) => w.count >= 3);
  const rare = ins.weaknesses.filter((w) => w.count < 3);
  const t = ins.time;

  return (
    <div className="pb-6">
      <PageTitle title="Chess DNA" sub={`${ins.analyzed} of ${ins.totalGames} games analyzed`} />
      <div className="px-5">
        {ins.analyzed < ins.totalGames ? (
          <Card className="p-4">
            <div className="flex justify-between text-[13px]">
              <span className="text-muted">{q.running && !q.paused ? 'Analysis running' : 'Analysis incomplete'}</span>
              <span className="tabular">{pct}%</span>
            </div>
            <Bar value={ins.analyzed / ins.totalGames} className="mt-2" />
            <p className="mt-3 text-[13px] text-muted">
              Numbers below only reflect analyzed games, newest first. Keep the app open to finish.
              {ins.analyzed < 10 ? ' With under 10 games, trends are not reliable yet.' : ''}
            </p>
          </Card>
        ) : null}

        <Section title="Weak spots, ranked by points lost">
          {bosses.length === 0 ? (
            <Empty title="No patterns yet" body="Once a few games are analyzed, your recurring mistakes show up here as bosses to beat." />
          ) : (
            <div className="space-y-3">
              {bosses.map((w) => (
                <Boss key={w.tag} w={w} />
              ))}
            </div>
          )}
          {rare.length ? (
            <p className="mt-3 px-1 text-[12px] text-muted">Too rare to call a pattern yet: {rare.map((w) => `${w.label} (${w.count})`).join(', ')}.</p>
          ) : null}
        </Section>

        {ins.analyzed > 0 ? (
          <>
            <Section title="Where it goes wrong" note="Share of win% lost to blunders and mistakes, by game phase.">
              <Card>
                <div className="space-y-4">
                  {ins.phases.map((p) => (
                    <div key={p.phase}>
                      <div className="flex justify-between text-[14px]">
                        <span className="capitalize">{p.phase}</span>
                        <span className="text-muted tabular">
                          {p.count} errors · {Math.round((p.loss / totalPhaseLoss) * 100)}% of the damage
                        </span>
                      </div>
                      <Bar value={p.loss / maxPhase} className="mt-2" />
                    </div>
                  ))}
                </div>
              </Card>
            </Section>

            <Section title="Blunders per game" note="Rolling average over 10 games. Lower is better.">
              <Card>
                <LineChart points={ins.bpg} format={(v) => v.toFixed(1)} minSpan={1} />
                {ins.avgAcc !== null ? <div className="mt-2 text-[13px] text-muted">Average accuracy {ins.avgAcc.toFixed(0)}%</div> : null}
              </Card>
            </Section>
          </>
        ) : null}

        <Section title="Time management">
          <Card>
            <div className="grid grid-cols-2 gap-5">
              <Fact label="Lost on time" v={`${t.timeoutLosses}`} sub={t.losses ? `${Math.round((t.timeoutLosses / t.losses) * 100)}% of losses` : ''} />
              <Fact label="Abandoned" v={`${t.abandonedLosses}`} sub={t.losses ? `${Math.round((t.abandonedLosses / t.losses) * 100)}% of losses` : ''} />
              <Fact label="Avg clock left" v={t.avgEndClock !== null ? fmtClock(t.avgEndClock) : '-'} sub={t.clockGames ? `${t.lowClockGames} games under 30s` : 'no clock data'} />
              <Fact label="Errors in time trouble" v={t.ttPct !== null ? `${Math.round(t.ttPct)}%` : '-'} sub={ins.analyzed ? 'of blunders and mistakes' : 'needs analysis'} />
            </div>
          </Card>
        </Section>

        <Section title="Openings" note="Score is wins plus half draws.">
          <Card className="p-0">
            {ins.openings.map((o, i) => (
              <div key={o.name} className={cn('flex items-center justify-between gap-3 px-4 py-3', i > 0 && 'border-t border-border')}>
                <div className="min-w-0">
                  <div className="truncate text-[14px]">{o.name}</div>
                  <div className="text-[12px] text-muted tabular">
                    {o.n} games · W {o.w.n ? Math.round(o.w.score * 100) + '%' : '-'} · B {o.b.n ? Math.round(o.b.score * 100) + '%' : '-'}
                  </div>
                </div>
                <div className={cn('text-[15px] font-medium tabular', o.score >= 0.5 ? 'text-accent' : 'text-text')}>{Math.round(o.score * 100)}%</div>
              </div>
            ))}
          </Card>
        </Section>

        <Section title="By time control">
          <Card className="p-0">
            {ins.byTc.map((r, i) => (
              <div key={r.tc} className={cn('flex items-center justify-between px-4 py-3', i > 0 && 'border-t border-border')}>
                <div>
                  <div className="text-[14px] tabular">{r.tc}</div>
                  <div className="text-[12px] text-muted tabular">
                    {r.w}W · {r.d}D · {r.l}L
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[15px] font-medium tabular">{Math.round(r.score * 100)}%</div>
                  <div className="text-[12px] text-muted tabular">{r.n} games</div>
                </div>
              </div>
            ))}
          </Card>
        </Section>

        <Section title="Rapid rating over time">
          <Card>
            <LineChart points={ins.rating} minSpan={50} />
          </Card>
        </Section>

        <Section title="Your own diagnosis" note="From the Why? you tag in post-game reviews.">
          <Card>
            {ins.whyTotal === 0 ? (
              <div className="text-[14px] text-muted">Nothing tagged yet. After a review, tap Why? on each blunder. Honest answers make this chart useful.</div>
            ) : (
              <div className="space-y-4">
                <Label>Your blunders</Label>
                {ins.why
                  .filter((w) => w.count > 0)
                  .map((w) => (
                    <div key={w.id}>
                      <div className="flex justify-between text-[14px]">
                        <span>{w.label}</span>
                        <span className="text-muted tabular">{Math.round(w.pct)}%</span>
                      </div>
                      <Bar value={w.pct / 100} className="mt-2" />
                    </div>
                  ))}
              </div>
            )}
          </Card>
        </Section>
      </div>
    </div>
  );
}

function Fact({ label, v, sub }: { label: string; v: string; sub?: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.08em] text-muted">{label}</div>
      <div className="mt-1 text-[24px] font-semibold leading-none tabular">{v}</div>
      {sub ? <div className="mt-1 text-[12px] text-muted">{sub}</div> : null}
    </div>
  );
}
