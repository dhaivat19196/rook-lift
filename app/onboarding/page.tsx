'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { analysisQueue } from '@/lib/analysisQueue';
import { importGames, type ImportProgress } from '@/lib/chesscom';
import { DEFAULT_USERNAME } from '@/lib/config';
import { patchSettings, useSettings } from '@/lib/store';
import { Bar, Button, Card, CheckMark, Label } from '@/components/ui';
import { cn } from '@/lib/util';

export default function Onboarding() {
  const router = useRouter();
  const settings = useSettings();
  const [name, setName] = useState(DEFAULT_USERNAME);
  const [blitz, setBlitz] = useState(false);
  const [busy, setBusy] = useState(false);
  const [prog, setProg] = useState<ImportProgress | null>(null);
  const [error, setError] = useState('');
  const [done, setDone] = useState<number | null>(null);

  useEffect(() => {
    if (settings.loaded && settings.username) setName(settings.username);
  }, [settings.loaded, settings.username]);

  const run = async () => {
    setBusy(true);
    setError('');
    try {
      await patchSettings({ username: name.trim().toLowerCase(), includeBlitz: blitz });
      const res = await importGames({
        username: name,
        incremental: false,
        includeBlitz: blitz,
        includeDaily: false,
        onProgress: setProg,
      });
      await patchSettings({ onboarded: true });
      await analysisQueue.refreshCounts();
      analysisQueue.start();
      setDone(res.total);
    } catch (e) {
      setError((e as Error).message || 'Import failed');
    } finally {
      setBusy(false);
    }
  };

  const skip = async () => {
    await patchSettings({ username: name.trim().toLowerCase(), onboarded: true });
    router.replace('/');
  };

  const pct = prog && prog.n ? prog.i / prog.n : 0;
  const phaseText =
    prog?.phase === 'archives'
      ? 'Finding your archives'
      : prog?.phase === 'games'
        ? `Reading month ${prog.i + 1} of ${prog.n}`
        : prog?.phase === 'stats'
          ? 'Fetching your rating'
          : '';

  return (
    <div className="px-5 pt-14">
      <Label>Welcome</Label>
      <h1 className="mt-2 text-[34px] font-semibold leading-[1.1] tracking-tight">Chess Climb</h1>
      <p className="mt-3 max-w-sm text-[16px] leading-relaxed text-muted">
        Find the habits that cost you games, then train them away. Everything runs on your device.
      </p>

      {done === null ? (
        <Card className="mt-8">
          <label className="text-[13px] text-muted" htmlFor="u">
            Chess.com username
          </label>
          <input
            id="u"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={busy}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className="mt-2 min-h-[52px] w-full rounded-xl border border-border bg-bg px-4 text-[17px] outline-none focus:border-accent"
          />
          <button
            type="button"
            onClick={() => setBlitz((b) => !b)}
            disabled={busy}
            className="mt-4 flex min-h-[48px] w-full items-center justify-between text-left text-[15px]"
          >
            <span>
              Include blitz games
              <span className="block text-[12px] text-muted">Rapid is always included</span>
            </span>
            <span className={cn('relative h-7 w-12 rounded-full border transition', blitz ? 'border-accent bg-accent' : 'border-border bg-subtle')}>
              <span className={cn('absolute top-0.5 h-5.5 w-5.5 rounded-full bg-white transition-all', blitz ? 'left-[22px]' : 'left-0.5')} style={{ height: 22, width: 22 }} />
            </span>
          </button>
          {busy ? (
            <div className="mt-4">
              <div className="mb-2 flex justify-between text-[13px] text-muted">
                <span>{phaseText}</span>
                <span className="tabular">{prog?.games ?? 0} games</span>
              </div>
              <Bar value={pct} />
            </div>
          ) : null}
          {error ? <p className="mt-3 text-[14px] text-danger">{error}</p> : null}
          <Button className="mt-5" onClick={() => void run()} disabled={busy || !name.trim()}>
            {busy ? 'Importing...' : 'Import my games'}
          </Button>
          <Button variant="ghost" className="mt-1" onClick={() => void skip()} disabled={busy}>
            Skip for now
          </Button>
        </Card>
      ) : (
        <Card className="mt-8 text-center">
          <div className="flex justify-center">
            <CheckMark size={56} />
          </div>
          <div className="mt-4 text-[20px] font-semibold">{done} games imported</div>
          <p className="mt-1 text-[14px] text-muted">
            The engine now analyzes them in the background, newest first. Keep the app open and your puzzles will appear as it goes.
          </p>
          <Button className="mt-5" onClick={() => router.replace('/')}>
            Continue
          </Button>
        </Card>
      )}
      <p className="mt-6 text-center text-[12px] text-muted">Not affiliated with Chess.com. Uses your public game data.</p>
    </div>
  );
}
