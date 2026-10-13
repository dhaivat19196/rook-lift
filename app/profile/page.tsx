'use client';
import { useState } from 'react';
import { analysisQueue, useAnalysisQueue } from '@/lib/analysisQueue';
import { importGames, type ImportProgress } from '@/lib/chesscom';
import { db } from '@/lib/db';
import { BADGES, dayTypeFor, rankInfo } from '@/lib/progress';
import { useGameCount } from '@/lib/queries';
import { patchSettings, useProgress, useSettings } from '@/lib/store';
import { signInWithGoogle, signOutUser, syncNow, useSyncState } from '@/lib/sync';
import { cn, localDay } from '@/lib/util';
import SyncBadge from '@/components/SyncBadge';
import { Bar, Button, Card, Label, PageTitle, Segmented, Stepper, Toggle } from '@/components/ui';

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 px-1 text-[13px] font-medium uppercase tracking-[0.08em] text-muted">{title}</h2>
      {children}
    </section>
  );
}

async function exportBackup() {
  const [kv, games, meta] = await Promise.all([db.kv.toArray(), db.games.toArray(), db.meta.toArray()]);
  const blob = new Blob([JSON.stringify({ app: 'chess-climb', version: 1, exportedAt: new Date().toISOString(), kv, games, meta })], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `chess-climb-backup-${localDay()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export default function ProfilePage() {
  const settings = useSettings();
  const progress = useProgress();
  const sync = useSyncState();
  const q = useAnalysisQueue();
  const count = useGameCount();
  const [busy, setBusy] = useState(false);
  const [prog, setProg] = useState<ImportProgress | null>(null);
  const [msg, setMsg] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const rank = rankInfo(progress.xp);
  const type = dayTypeFor(settings.anchorDate, settings.anchorType);

  const reimport = async (incremental: boolean) => {
    setBusy(true);
    setMsg('');
    try {
      const r = await importGames({
        username: settings.username,
        incremental,
        includeBlitz: settings.includeBlitz,
        includeDaily: settings.includeDaily,
        onProgress: setProg,
      });
      setMsg(r.added ? `${r.added} new games imported` : 'Already up to date');
      await analysisQueue.refreshCounts();
      if (settings.autoAnalyze) analysisQueue.start();
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy(false);
      setProg(null);
    }
  };

  const reset = async () => {
    analysisQueue.pause();
    await db.delete();
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      /* ignore */
    }
    window.location.href = '/';
  };

  return (
    <div className="pb-6">
      <PageTitle title="Profile" sub={`${settings.username || 'chessdh19'} · ${rank.name}`} />
      <div className="px-5">
        <Card>
          <Label>Account & sync</Label>
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="min-w-0 text-[14px]">
              {sync.user ? <span className="block truncate">{sync.user.email}</span> : <span className="text-muted">Not signed in. Everything is stored on this device.</span>}
            </div>
            <SyncBadge state={sync} />
          </div>
          {sync.error ? <p className="mt-2 text-[12px] text-danger">{sync.error}</p> : null}
          <div className="mt-4 space-y-2">
            {!sync.configured ? (
              <Button variant="secondary" disabled>
                Sync not configured
              </Button>
            ) : sync.user ? (
              <>
                <Button variant="secondary" onClick={() => void syncNow()}>
                  Sync now
                </Button>
                <Button variant="ghost" onClick={() => void signOutUser()}>
                  Sign out
                </Button>
              </>
            ) : (
              <Button onClick={() => void signInWithGoogle()}>Continue with Google</Button>
            )}
          </div>
        </Card>

        <Group title="Analysis">
          <Card>
            <div className="flex items-center justify-between text-[14px]">
              <span className="text-muted">
                {q.done >= q.total && q.total > 0 ? 'All games analyzed' : q.running && !q.paused ? 'Analyzing' : q.paused ? 'Paused' : 'Idle'}
              </span>
              <span className="tabular">
                Analyzed {q.done}/{q.total}
              </span>
            </div>
            <Bar value={q.total ? q.done / q.total : 0} className="mt-2" />
            {q.running && q.plyTotal ? (
              <div className="mt-2 text-[12px] text-muted tabular">
                Current game: move {q.plyDone}/{q.plyTotal}
              </div>
            ) : null}
            {q.error ? <div className="mt-2 text-[12px] text-danger">{q.error}</div> : null}
            <div className="mt-4">
              {q.running && !q.paused ? (
                <Button variant="secondary" onClick={() => analysisQueue.pause()}>
                  Pause
                </Button>
              ) : (
                <Button variant="secondary" disabled={q.total === 0 || q.done >= q.total} onClick={() => analysisQueue.start()}>
                  {q.paused ? 'Resume' : 'Start analysis'}
                </Button>
              )}
            </div>
            <div className="mt-4">
              <div className="mb-2 text-[13px] text-muted">Speed</div>
              <Segmented
                value={settings.speed}
                options={[
                  { id: 'fast', label: 'Fast (0.1s/move)' },
                  { id: 'deep', label: 'Deep (0.3s/move)' },
                ]}
                onChange={(v) => void patchSettings({ speed: v })}
              />
            </div>
            <div className="mt-2 border-t border-border pt-2">
              <Toggle label="Analyze automatically" sub="Runs while the app is open" checked={settings.autoAnalyze} onChange={(v) => void patchSettings({ autoAnalyze: v })} />
            </div>
          </Card>
        </Group>

        <Group title="Daily plan">
          <Card>
            <div className="flex items-center justify-between py-1">
              <span className="text-[15px]">Dedicated target</span>
              <Stepper value={settings.dedicatedTarget} min={5} max={90} onChange={(v) => void patchSettings({ dedicatedTarget: v })} />
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-[15px]">Sprinkle target</span>
              <Stepper value={settings.sprinkleTarget} min={5} max={60} onChange={(v) => void patchSettings({ sprinkleTarget: v })} />
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
              <span className="text-[15px]">
                Today is a <b className="font-medium">{type === 'match' ? 'match' : 'training'}</b> day
              </span>
              <button
                onClick={() => void patchSettings({ anchorDate: localDay(), anchorType: type === 'match' ? 'train' : 'match' })}
                className="min-h-[44px] rounded-xl border border-border px-4 text-[14px]"
              >
                Swap
              </button>
            </div>
          </Card>
        </Group>

        <Group title="Badges">
          <div className="grid grid-cols-3 gap-3">
            {BADGES.map((b) => {
              const got = !!progress.badges[b.id];
              return (
                <div key={b.id} className={cn('rounded-2xl border p-3 text-center', got ? 'border-accent/50 bg-surface' : 'border-border opacity-50')}>
                  <div className={cn('mx-auto flex h-9 w-9 items-center justify-center rounded-full border', got ? 'border-accent text-accent' : 'border-border text-muted')}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      {got ? <path d="m3.5 8.5 3 3 6-7" /> : <path d="M5 7V5a3 3 0 0 1 6 0v2M4 7h8v6H4z" />}
                    </svg>
                  </div>
                  <div className="mt-2 text-[12px] font-medium leading-tight">{b.label}</div>
                  <div className="mt-0.5 text-[10px] leading-tight text-muted">{b.desc}</div>
                </div>
              );
            })}
          </div>
        </Group>

        <Group title="Your games">
          <Card>
            <div className="text-[14px] text-muted">
              Chess.com user <span className="text-text">{settings.username}</span> · {count ?? 0} games stored
            </div>
            <div className="mt-2 border-t border-border pt-1">
              <Toggle label="Include blitz" sub="Takes effect on the next full re-import" checked={settings.includeBlitz} onChange={(v) => void patchSettings({ includeBlitz: v })} />
              <Toggle label="Include daily" checked={settings.includeDaily} onChange={(v) => void patchSettings({ includeDaily: v })} />
            </div>
            {busy && prog ? (
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-[12px] text-muted">
                  <span>{prog.phase === 'games' ? `Month ${prog.i + 1} of ${prog.n}` : prog.phase}</span>
                  <span className="tabular">{prog.games} games</span>
                </div>
                <Bar value={prog.n ? prog.i / prog.n : 0} />
              </div>
            ) : null}
            {msg ? <p className="mt-3 text-[13px] text-muted">{msg}</p> : null}
            <div className="mt-4 space-y-2">
              <Button variant="secondary" disabled={busy} onClick={() => void reimport(true)}>
                {busy ? 'Working...' : 'Sync new games'}
              </Button>
              <Button variant="ghost" disabled={busy} onClick={() => void reimport(false)}>
                Full re-import
              </Button>
            </div>
          </Card>
        </Group>

        <Group title="Data">
          <Card>
            <Button variant="secondary" onClick={() => void exportBackup()}>
              Export JSON backup
            </Button>
            {!confirmReset ? (
              <Button variant="danger" className="mt-2" onClick={() => setConfirmReset(true)}>
                Reset local data
              </Button>
            ) : (
              <div className="mt-3 rounded-xl border border-danger/40 p-3">
                <p className="text-[13px]">
                  This deletes games, analysis, puzzles and progress from this device. Synced data in your account is not deleted, but signing back in will restore it.
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button variant="secondary" className="min-h-[48px]" onClick={() => setConfirmReset(false)}>
                    Cancel
                  </Button>
                  <Button variant="danger" className="min-h-[48px]" onClick={() => void reset()}>
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </Group>

        <Group title="About">
          <Card>
            <div className="space-y-3 text-[13px] leading-relaxed text-muted">
              <p>
                <b className="font-medium text-text">Chess Climb</b> is a personal training tool. It runs entirely on your device: no accounts needed, no data leaves unless you sign in to sync.
              </p>
              <p>
                Analysis uses <b className="font-medium text-text">Stockfish</b> (via the stockfish.js WebAssembly port by Nathan Rugg), which is free software licensed under the GNU General Public License v3. Source:{' '}
                <a className="text-accent underline" href="https://github.com/official-stockfish/Stockfish" target="_blank" rel="noopener noreferrer">
                  github.com/official-stockfish/Stockfish
                </a>{' '}
                and{' '}
                <a className="text-accent underline" href="https://github.com/nmrugg/stockfish.js" target="_blank" rel="noopener noreferrer">
                  github.com/nmrugg/stockfish.js
                </a>
                . The license text ships at{' '}
                <a className="text-accent underline" href="/engine/COPYING.txt" target="_blank" rel="noopener noreferrer">
                  /engine/COPYING.txt
                </a>
                .
              </p>
              <p>Not affiliated with or endorsed by Chess.com. Game data is read from Chess.com&apos;s public API.</p>
              <p>
                Fair play: Chess Climb only analyzes games that have already finished. Never use an engine during a live game, and do not use this app while playing.
              </p>
            </div>
          </Card>
        </Group>
      </div>
    </div>
  );
}
