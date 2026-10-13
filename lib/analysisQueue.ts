'use client';
import { useSyncExternalStore } from 'react';
import { AbortedError, analysedIds, analyzeGame, saveAnalysis } from './analyze';
import { db } from './db';
import { getBgEngine } from './engine';
import { checkBadges } from './progress';
import { getSettings } from './store';
import type { Game } from './types';

export interface QueueState {
  running: boolean;
  paused: boolean;
  done: number;
  total: number;
  current: string | null;
  plyDone: number;
  plyTotal: number;
  error: string | null;
}

const SPEED_MS = { fast: 100, deep: 300 } as const;

class AnalysisQueue {
  state: QueueState = {
    running: false,
    paused: false,
    done: 0,
    total: 0,
    current: null,
    plyDone: 0,
    plyTotal: 0,
    error: null,
  };
  private subs = new Set<() => void>();
  private stopFlag = false;
  private priority: string[] = [];
  private loopPromise: Promise<void> | null = null;

  subscribe = (fn: () => void) => {
    this.subs.add(fn);
    return () => {
      this.subs.delete(fn);
    };
  };
  getState = () => this.state;
  private set(p: Partial<QueueState>) {
    this.state = { ...this.state, ...p };
    this.subs.forEach((f) => f());
  }

  async refreshCounts() {
    const [total, ids] = await Promise.all([db.games.count(), analysedIds()]);
    this.set({ total, done: Math.min(ids.size, total) });
  }

  /** Analyse this game next. */
  prioritize(id: string) {
    this.priority = [id, ...this.priority.filter((x) => x !== id)];
    if (!this.state.running) this.start();
  }

  start() {
    this.set({ paused: false, error: null });
    if (this.loopPromise) {
      // a previous loop is still winding down after pause(); restart when it ends
      if (this.stopFlag) void this.loopPromise.then(() => this.start());
      return;
    }
    this.stopFlag = false;
    this.loopPromise = this.loop().finally(() => {
      this.loopPromise = null;
      this.set({ running: false, current: null, plyDone: 0, plyTotal: 0 });
    });
  }

  pause() {
    this.stopFlag = true;
    this.set({ paused: true });
    getBgEngine().cancel();
  }

  private async nextGame(done: Set<string>): Promise<Game | null> {
    while (this.priority.length) {
      const id = this.priority.shift()!;
      if (done.has(id)) continue;
      const g = await db.games.get(id);
      if (g) return g;
    }
    const g = await db.games
      .orderBy('endTime')
      .reverse()
      .filter((x) => !done.has(x.id))
      .first();
    return g ?? null;
  }

  private async loop() {
    this.set({ running: true });
    const engine = getBgEngine();
    const done = await analysedIds();
    await this.refreshCounts();
    // skip games too short to analyse after one failed attempt
    const skip = new Set<string>();
    for (;;) {
      if (this.stopFlag) return;
      const all = new Set([...done, ...skip]);
      const g = await this.nextGame(all);
      if (!g) return;
      const settings = await getSettings();
      this.set({ current: g.id, plyDone: 0, plyTotal: 0 });
      try {
        const res = await analyzeGame(
          g,
          engine,
          SPEED_MS[settings.speed],
          () => this.stopFlag,
          (d, t) => this.set({ plyDone: d, plyTotal: t }),
        );
        if (!res) {
          skip.add(g.id);
          continue;
        }
        await saveAnalysis(res);
        done.add(g.id);
        this.set({ done: Math.min(done.size, this.state.total) });
        void checkBadges();
      } catch (e) {
        if (e instanceof AbortedError || (e as Error).message === 'cancelled') return;
        skip.add(g.id);
        this.set({ error: (e as Error).message });
        if (/Engine/.test((e as Error).message)) return;
      }
    }
  }
}

export const analysisQueue = new AnalysisQueue();

const SERVER_STATE: QueueState = {
  running: false,
  paused: false,
  done: 0,
  total: 0,
  current: null,
  plyDone: 0,
  plyTotal: 0,
  error: null,
};

export function useAnalysisQueue(): QueueState {
  return useSyncExternalStore(analysisQueue.subscribe, analysisQueue.getState, () => SERVER_STATE);
}
