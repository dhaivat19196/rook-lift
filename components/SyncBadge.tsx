'use client';
import { useEffect, useState } from 'react';
import type { SyncState } from '@/lib/sync';
import { cn, timeAgo } from '@/lib/util';

export default function SyncBadge({ state, compact }: { state: SyncState; compact?: boolean }) {
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 30000);
    return () => clearInterval(t);
  }, []);
  let text = 'Local only';
  let dot = 'bg-muted';
  if (state.user) {
    if (state.status === 'syncing') {
      text = 'Syncing';
      dot = 'bg-accent animate-pulse';
    } else if (state.status === 'offline') {
      text = 'Offline';
      dot = 'bg-warn';
    } else if (state.status === 'error') {
      text = 'Sync error';
      dot = 'bg-danger';
    } else {
      text = state.lastSync ? `Synced ${timeAgo(state.lastSync)}` : 'Signed in';
      dot = 'bg-accent';
    }
  }
  if (compact && !state.user) return null;
  return (
    <div className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-border px-3 py-1.5 text-[12px] text-muted" title={state.error ?? undefined}>
      <span className={cn('h-1.5 w-1.5 rounded-full', dot)} />
      {text}
    </div>
  );
}
