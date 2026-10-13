'use client';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { useSyncExternalStore } from 'react';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, SYNC_CONFIGURED } from './config';
import { db, metaGet, metaSet } from './db';
import { onKvDirty } from './store';

export interface SyncState {
  configured: boolean;
  status: 'local' | 'idle' | 'syncing' | 'offline' | 'error';
  user: { id: string; email: string } | null;
  lastSync: number | null;
  error: string | null;
}

let state: SyncState = { configured: SYNC_CONFIGURED, status: 'local', user: null, lastSync: null, error: null };
const subs = new Set<() => void>();
function set(p: Partial<SyncState>) {
  state = { ...state, ...p };
  subs.forEach((f) => f());
}
const SERVER: SyncState = state;
export function useSyncState(): SyncState {
  return useSyncExternalStore(
    (fn) => {
      subs.add(fn);
      return () => {
        subs.delete(fn);
      };
    },
    () => state,
    () => SERVER,
  );
}

let client: SupabaseClient | null = null;
export function getSupabase(): SupabaseClient | null {
  if (!SYNC_CONFIGURED || typeof window === 'undefined') return null;
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { flowType: 'pkce', detectSessionInUrl: true, persistSession: true, autoRefreshToken: true },
    });
  }
  return client;
}

let inited = false;
let timer: ReturnType<typeof setTimeout> | null = null;
let running: Promise<void> | null = null;

export function initSync() {
  if (inited || typeof window === 'undefined') return;
  inited = true;
  onKvDirty(() => scheduleSync(8000));
  const sb = getSupabase();
  if (!sb) return;
  sb.auth.onAuthStateChange((_evt, session) => {
    if (session?.user) {
      set({ user: { id: session.user.id, email: session.user.email ?? '' }, status: state.status === 'local' ? 'idle' : state.status });
      scheduleSync(300);
    } else {
      set({ user: null, status: 'local', lastSync: null });
    }
  });
  void sb.auth.getSession().then(({ data }) => {
    if (data.session?.user) {
      set({ user: { id: data.session.user.id, email: data.session.user.email ?? '' }, status: 'idle' });
      scheduleSync(500);
    }
  });
  const kick = () => scheduleSync(500);
  window.addEventListener('online', kick);
  window.addEventListener('focus', kick);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') kick();
  });
  window.addEventListener('offline', () => {
    if (state.user) set({ status: 'offline' });
  });
  setInterval(() => scheduleSync(0), 3 * 60 * 1000);
}

function scheduleSync(delay: number) {
  if (!state.user) return;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    void syncNow();
  }, delay);
}

export async function signInWithGoogle(): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/' } });
}

export async function signOutUser(): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  await sb.auth.signOut();
  set({ user: null, status: 'local', lastSync: null });
}

export function syncNow(): Promise<void> {
  if (running) return running;
  running = doSync().finally(() => {
    running = null;
  });
  return running;
}

async function doSync(): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const { data } = await sb.auth.getSession();
  const user = data.session?.user;
  if (!user) {
    set({ status: 'local', user: null });
    return;
  }
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    set({ status: 'offline' });
    return;
  }
  set({ status: 'syncing', error: null, user: { id: user.id, email: user.email ?? '' } });
  try {
    // push
    const dirty = await db.kv.where('dirty').equals(1).toArray();
    for (let i = 0; i < dirty.length; i += 100) {
      const chunk = dirty.slice(i, i + 100);
      const rows = chunk.map((r) => ({
        user_id: user.id,
        key: r.key,
        value: r.value,
        updated_at: new Date(r.updatedAt).toISOString(),
      }));
      const { error } = await sb.from('chess_kv').upsert(rows, { onConflict: 'user_id,key' });
      if (error) throw new Error(error.message);
      await db.transaction('rw', db.kv, async () => {
        for (const r of chunk) {
          const cur = await db.kv.get(r.key);
          if (cur && cur.updatedAt === r.updatedAt) await db.kv.put({ ...cur, dirty: 0 });
        }
      });
    }
    // pull
    const pullKey = 'lastPull:' + user.id;
    const since = (await metaGet<string>(pullKey)) ?? '1970-01-01T00:00:00.000Z';
    let maxSeen = since;
    for (let from = 0; ; from += 500) {
      const { data: rows, error } = await sb
        .from('chess_kv')
        .select('key,value,updated_at')
        .gte('updated_at', since)
        .order('updated_at', { ascending: true })
        .order('key', { ascending: true })
        .range(from, from + 499);
      if (error) throw new Error(error.message);
      if (!rows || rows.length === 0) break;
      await db.transaction('rw', db.kv, async () => {
        for (const r of rows as { key: string; value: unknown; updated_at: string }[]) {
          const remoteMs = Date.parse(r.updated_at);
          const local = await db.kv.get(r.key);
          if (!local || remoteMs > local.updatedAt) {
            await db.kv.put({ key: r.key, value: r.value, updatedAt: remoteMs, dirty: 0 });
          }
          if (r.updated_at > maxSeen) maxSeen = r.updated_at;
        }
      });
      if (rows.length < 500) break;
    }
    await metaSet(pullKey, maxSeen);
    set({ status: 'idle', lastSync: Date.now(), error: null });
  } catch (e) {
    set({ status: navigator.onLine ? 'error' : 'offline', error: (e as Error).message });
  }
}
