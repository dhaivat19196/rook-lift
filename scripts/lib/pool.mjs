// Pool of worker threads, each hosting its own Stockfish (lite single-threaded WASM, run in Node).
import { Worker, isMainThread, parentPort } from 'node:worker_threads';
import { cpus } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

const here = fileURLToPath(import.meta.url);

if (!isMainThread) {
  const { SF } = await import('./sf.mjs');
  const sf = new SF();
  await sf.init();
  parentPort.on('message', async (job) => {
    try {
      const lines = await sf.analyse(job.fen, job.depth, job.multipv, job.searchmoves);
      parentPort.postMessage({ id: job.id, lines });
    } catch (e) {
      parentPort.postMessage({ id: job.id, error: String(e) });
    }
  });
  parentPort.postMessage({ ready: true });
}

export class Pool {
  constructor(n = Math.max(1, Math.min(6, cpus().length - 1)), cacheFile) {
    this.n = n;
    this.workers = [];
    this.idle = [];
    this.queue = [];
    this.pending = new Map();
    this.seq = 0;
    this.cacheFile = cacheFile;
    this.cache = {};
    this.hits = 0;
    this.misses = 0;
    if (cacheFile && existsSync(cacheFile)) {
      try { this.cache = JSON.parse(readFileSync(cacheFile, 'utf8')); } catch { this.cache = {}; }
    }
  }
  async start() {
    await Promise.all(
      Array.from({ length: this.n }, () => new Promise((resolve, reject) => {
        const w = new Worker(here);
        w.on('error', reject);
        w.on('message', (m) => {
          if (m.ready) { this.idle.push(w); resolve(); this.pump(); return; }
          const p = this.pending.get(m.id);
          this.pending.delete(m.id);
          this.idle.push(w);
          if (m.error) p.reject(new Error(String(m.error))); else p.resolve(m.lines);
          this.pump();
        });
        this.workers.push(w);
      })),
    );
  }
  pump() {
    while (this.idle.length && this.queue.length) {
      const w = this.idle.pop();
      const job = this.queue.shift();
      this.pending.set(job.id, job);
      w.postMessage({ id: job.id, fen: job.fen, depth: job.depth, multipv: job.multipv, searchmoves: job.searchmoves });
    }
  }
  /** lines scored from the side to move */
  analyse(fen, depth = 14, multipv = 1, searchmoves) {
    const key = createHash('sha1').update([fen, depth, multipv, (searchmoves ?? []).join(',')].join('|')).digest('hex');
    if (this.cache[key]) { this.hits++; return Promise.resolve(this.cache[key]); }
    this.misses++;
    return new Promise((resolve, reject) => {
      const id = ++this.seq;
      this.queue.push({ id, fen, depth, multipv, searchmoves, resolve: (lines) => { this.cache[key] = lines; resolve(lines); }, reject });
      this.pump();
    });
  }
  save() {
    if (!this.cacheFile) return;
    mkdirSync(dirname(this.cacheFile), { recursive: true });
    writeFileSync(this.cacheFile, JSON.stringify(this.cache));
  }
  async stop() {
    this.save();
    await Promise.all(this.workers.map((w) => w.terminate()));
  }
}
