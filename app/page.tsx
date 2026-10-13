'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAnalysisQueue } from '@/lib/analysisQueue';
import { DISPLAY_NAME } from '@/lib/config';
import { dayTypeFor, LADDER, rankInfo, ratingRank, shownStreak } from '@/lib/progress';
import { useGameCount, useRating } from '@/lib/queries';
import { patchSettings, useProgress, useSettings } from '@/lib/store';
import { useSyncState } from '@/lib/sync';
import { addDays, cn, greeting, localDay } from '@/lib/util';
import { Bar, Card, Label, LinkButton, Ring } from '@/components/ui';
import SyncBadge from '@/components/SyncBadge';
import NextUpCard from '@/components/learn/NextUp';

function RatingLadder({ rating }: { rating: number | null | undefined }) {
  const nodes = [400, ...LADDER.map((l) => l.rating)];
  const names = ['Pawn', ...LADDER.map((l) => l.rank)];
  const r = rating ?? 0;
  let pos = 0;
  for (let i = 0; i < nodes.length - 1; i++) {
    if (r >= nodes[i + 1]) pos = i + 1;
    else if (r > nodes[i]) pos = i + (r - nodes[i]) / (nodes[i + 1] - nodes[i]);
  }
  const frac = pos / (nodes.length - 1);
  const nextIdx = nodes.findIndex((n) => n > r);
  const next = nextIdx >= 0 ? nodes[nextIdx] : null;
  return (
    <Card>
      <div className="flex items-end justify-between">
        <div>
          <Label>Rapid rating</Label>
          <div className="mt-1 text-[34px] font-semibold leading-none tabular">{rating ?? '-'}</div>
        </div>
        <div className="text-right">
          <div className="text-[15px] font-medium">{rating ? ratingRank(r) : 'Pawn'}</div>
          <div className="text-[12px] text-muted">
            {!rating ? 'Import games to place you' : next ? `${next - r} to ${names[nextIdx]}` : 'Top of the ladder'}
          </div>
        </div>
      </div>
      <div className="relative mt-6 mb-7 h-px bg-border">
        <div className="absolute left-0 top-0 h-px bg-accent" style={{ width: `${frac * 100}%` }} />
        {nodes.map((n, i) => {
          const reached = r >= n;
          return (
            <div key={n} className="absolute -translate-x-1/2" style={{ left: `${(i / (nodes.length - 1)) * 100}%`, top: -5 }}>
              <div className={cn('h-[11px] w-[11px] rounded-full border', reached ? 'border-accent bg-accent' : 'border-border bg-surface')} />
              <div className="absolute left-1/2 top-4 -translate-x-1/2 text-center">
                <div className={cn('text-[10px] leading-tight', reached ? 'text-text' : 'text-muted')}>{names[i]}</div>
                <div className="text-[10px] leading-tight text-muted tabular">{i === 0 ? '' : n}</div>
              </div>
            </div>
          );
        })}
        <div
          className="absolute -translate-x-1/2 rounded-full border-2 border-bg bg-text"
          style={{ left: `${frac * 100}%`, top: -4, width: 9, height: 9 }}
          aria-hidden
        />
      </div>
    </Card>
  );
}

export default function TodayPage() {
  const settings = useSettings();
  const progress = useProgress();
  const rating = useRating();
  const gameCount = useGameCount();
  const q = useAnalysisQueue();
  const sync = useSyncState();
  const [today, setToday] = useState('');
  useEffect(() => setToday(localDay()), []);

  const rec = progress.days[today];
  const dedMin = (rec?.ded ?? 0) / 60;
  const sprMin = (rec?.spr ?? 0) / 60;
  const type = today ? dayTypeFor(settings.anchorDate, settings.anchorType, today) : 'train';
  const streak = shownStreak(progress);
  const rank = rankInfo(progress.xp);
  const week = today ? Array.from({ length: 7 }, (_, i) => addDays(today, i - 6)) : [];

  const swap = () => void patchSettings({ anchorDate: today, anchorType: type === 'match' ? 'train' : 'match' });
  const needsImport = gameCount === 0;

  return (
    <div>
      <header className="flex items-start justify-between px-5 pt-8 pb-5">
        <div>
          <div className="text-[14px] text-muted">{greeting()}</div>
          <h1 className="text-[28px] font-semibold leading-tight tracking-tight">{DISPLAY_NAME}</h1>
        </div>
        <SyncBadge state={sync} compact />
      </header>

      <div className="space-y-4 px-5">
        {needsImport ? (
          <Card>
            <div className="text-[17px] font-semibold">Import your games</div>
            <p className="mt-1 text-[14px] text-muted">Rook Lift learns from your own Chess.com games. It takes about a minute.</p>
            <LinkButton href="/onboarding/" className="mt-4">
              Get started
            </LinkButton>
          </Card>
        ) : null}

        <NextUpCard compact />

        <Card className="p-0">
          <div className="flex items-center justify-between px-5 pt-4">
            <div>
              <Label>Today</Label>
              <div className="mt-0.5 text-[20px] font-semibold tracking-tight">{type === 'match' ? 'Match day' : 'Training day'}</div>
            </div>
            <button onClick={swap} className="min-h-[44px] rounded-xl px-3 text-[13px] text-muted">
              Swap
            </button>
          </div>
          <div className="flex justify-around px-3 py-5">
            <Ring value={dedMin / settings.dedicatedTarget} label={`${Math.floor(dedMin)}m`} sub={`of ${settings.dedicatedTarget} dedicated`} />
            <Ring value={sprMin / settings.sprinkleTarget} label={`${Math.floor(sprMin)}m`} sub={`of ${settings.sprinkleTarget} sprinkle`} size={112} />
          </div>
          <div className="space-y-2 border-t border-border p-4">
            {type === 'match' ? (
              <LinkButton href="/match/">Start today&apos;s session</LinkButton>
            ) : (
              <LinkButton href="/session/">Start today&apos;s session</LinkButton>
            )}
            <LinkButton href="/puzzles/?mode=quick" variant="secondary">
              Quick bites · 5 puzzles
            </LinkButton>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <Label>Streak</Label>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-[30px] font-semibold leading-none tabular">{streak}</span>
              <span className="text-[13px] text-muted">{streak === 1 ? 'day' : 'days'}</span>
            </div>
            <div className="mt-3 flex gap-1.5">
              {week.map((d) => (
                <div key={d} className={cn('h-2 flex-1 rounded-full', progress.days[d]?.active ? 'bg-accent' : 'bg-subtle')} title={d} />
              ))}
            </div>
          </Card>
          <Card className="p-4">
            <Label>Rank</Label>
            <div className="mt-1 text-[22px] font-semibold leading-none">{rank.name}</div>
            <Bar value={rank.frac} className="mt-3" />
            <div className="mt-2 text-[12px] text-muted tabular">
              {progress.xp} XP{rank.next ? ` · ${rank.toNext} to ${rank.next}` : ''}
            </div>
          </Card>
        </div>

        <RatingLadder rating={rating} />

        {q.total > 0 && q.done < q.total ? (
          <Link href="/profile/" className="block">
            <Card className="p-4">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-muted">{q.paused ? 'Analysis paused' : 'Analyzing your games'}</span>
                <span className="tabular">
                  {q.done}/{q.total}
                </span>
              </div>
              <Bar value={q.total ? q.done / q.total : 0} className="mt-2" />
            </Card>
          </Link>
        ) : null}
      </div>
    </div>
  );
}
