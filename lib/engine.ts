import { ENGINE_URL } from './config';
import { encodeScore } from './core';

export interface EngineLine {
  cp?: number; // white perspective
  mate?: number; // white perspective (positive = white mates)
  ev: number; // encoded, white perspective
  pv: string[];
}

export interface EngineResult extends EngineLine {
  bestmove: string;
  depth: number;
  lines: EngineLine[];
}

export interface AnalyseOpts {
  movetime?: number;
  depth?: number;
  multipv?: number;
}

interface Task {
  fen: string;
  opts: AnalyseOpts;
  resolve: (r: EngineResult) => void;
  reject: (e: Error) => void;
  epoch: number;
}

/** UCI wrapper around the Stockfish web worker, with a serial promise queue. */
export class Engine {
  private worker: Worker | null = null;
  private ready: Promise<void> | null = null;
  private queue: Task[] = [];
  private busy = false;
  private epoch = 0;
  private multipv = 1;
  private handler: ((line: string) => void) | null = null;

  constructor(private url: string = ENGINE_URL) {}

  private boot(): Promise<void> {
    if (this.ready) return this.ready;
    this.ready = new Promise<void>((resolve, reject) => {
      try {
        const w = new Worker(this.url);
        this.worker = w;
        let stage = 0;
        w.onmessage = (ev: MessageEvent) => {
          const line = typeof ev.data === 'string' ? ev.data : String(ev.data);
          if (stage < 2) {
            if (line.startsWith('uciok') && stage === 0) {
              stage = 1;
              w.postMessage('setoption name Threads value 1');
              w.postMessage('setoption name Hash value 16');
              w.postMessage('isready');
            } else if (line.startsWith('readyok') && stage === 1) {
              stage = 2;
              resolve();
            }
            return;
          }
          this.handler?.(line);
        };
        w.onerror = (e) => {
          reject(new Error('Engine failed to load: ' + (e.message || 'worker error')));
          this.fail(new Error('Engine crashed'));
        };
        w.postMessage('uci');
      } catch (e) {
        reject(e as Error);
      }
    });
    return this.ready;
  }

  private fail(err: Error) {
    const q = this.queue;
    this.queue = [];
    this.busy = false;
    for (const t of q) t.reject(err);
    this.worker?.terminate();
    this.worker = null;
    this.ready = null;
  }

  analyse(fen: string, opts: AnalyseOpts = {}): Promise<EngineResult> {
    return new Promise<EngineResult>((resolve, reject) => {
      this.queue.push({ fen, opts, resolve, reject, epoch: this.epoch });
      void this.pump();
    });
  }

  /** Abort the running search and drop everything queued. */
  cancel() {
    this.epoch++;
    const q = this.queue;
    this.queue = [];
    for (const t of q) t.reject(new Error('cancelled'));
    if (this.busy) this.worker?.postMessage('stop');
  }

  terminate() {
    this.cancel();
    this.worker?.terminate();
    this.worker = null;
    this.ready = null;
    this.busy = false;
  }

  private async pump() {
    if (this.busy) return;
    const task = this.queue.shift();
    if (!task) return;
    this.busy = true;
    try {
      await this.boot();
      if (task.epoch !== this.epoch) throw new Error('cancelled');
      const res = await this.run(task);
      task.resolve(res);
    } catch (e) {
      task.reject(e as Error);
    } finally {
      this.busy = false;
      if (this.queue.length) void this.pump();
    }
  }

  private run(task: Task): Promise<EngineResult> {
    const w = this.worker;
    if (!w) return Promise.reject(new Error('no engine'));
    const { fen, opts } = task;
    const mpv = Math.max(1, opts.multipv ?? 1);
    const white = fen.split(' ')[1] !== 'b';
    const lines = new Map<number, EngineLine & { depth: number }>();
    return new Promise<EngineResult>((resolve) => {
      this.handler = (line: string) => {
        if (line.startsWith('info') && line.includes(' score ') && line.includes(' pv ')) {
          const idx = Number(/ multipv (\d+)/.exec(line)?.[1] ?? 1);
          const depth = Number(/ depth (\d+)/.exec(line)?.[1] ?? 0);
          const sc = / score (cp|mate) (-?\d+)/.exec(line);
          if (!sc) return;
          if (/ (lowerbound|upperbound)/.test(line)) return;
          const raw = Number(sc[2]);
          const val = white ? raw : -raw;
          const pv = line.split(' pv ')[1].trim().split(/\s+/);
          const l: EngineLine & { depth: number } =
            sc[1] === 'cp'
              ? { cp: val, ev: encodeScore(val, undefined), pv, depth }
              : { mate: val, ev: encodeScore(undefined, val), pv, depth };
          lines.set(idx, l);
        } else if (line.startsWith('bestmove')) {
          this.handler = null;
          const bm = line.split(/\s+/)[1] ?? '';
          const all = [...lines.entries()].sort((a, b) => a[0] - b[0]).map((e) => e[1]);
          const top = all[0] ?? { ev: 0, pv: bm ? [bm] : [], depth: 0 };
          resolve({
            ev: top.ev,
            cp: top.cp,
            mate: top.mate,
            pv: top.pv,
            bestmove: bm === '(none)' ? '' : bm,
            depth: 'depth' in top ? top.depth : 0,
            lines: all.map(({ depth: _d, ...rest }) => rest),
          });
        }
      };
      if (mpv !== this.multipv) {
        w.postMessage(`setoption name MultiPV value ${mpv}`);
        this.multipv = mpv;
      }
      w.postMessage(`position fen ${fen}`);
      if (opts.depth) w.postMessage(`go depth ${opts.depth}`);
      else w.postMessage(`go movetime ${opts.movetime ?? 200}`);
    });
  }
}

let ui: Engine | null = null;
let bg: Engine | null = null;
/** Engine for interactive use (puzzles, drills). */
export function getUiEngine(): Engine {
  if (!ui) ui = new Engine();
  return ui;
}
/** Separate engine for the background analysis queue so UI work never waits behind it. */
export function getBgEngine(): Engine {
  if (!bg) bg = new Engine();
  return bg;
}
