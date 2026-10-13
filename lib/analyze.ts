'use client';
import { Chess } from 'chess.js';
import { classifyGame, MATE_BASE, parseGame, type GameAnalysis, type PosEval } from './core';
import { db } from './db';
import type { Engine } from './engine';
import { kvGet, kvSet } from './store';
import type { Game, Puzzle } from './types';

export class AbortedError extends Error {}

export function terminalEval(fen: string): PosEval | null {
  const c = new Chess(fen);
  if (c.isCheckmate()) return { ev: c.turn() === 'w' ? -MATE_BASE : MATE_BASE, best: null, pv: [] };
  if (c.isGameOver()) return { ev: 0, best: null, pv: [] };
  return null;
}

export async function analyzeGame(
  game: Game,
  engine: Engine,
  ms: number,
  shouldStop: () => boolean,
  onPly?: (done: number, total: number) => void,
): Promise<{ analysis: GameAnalysis; puzzles: Puzzle[] } | null> {
  const parsed = parseGame(game.pgn);
  if (!parsed) return null;
  const evals: PosEval[] = [];
  const total = parsed.fens.length;
  for (let i = 0; i < total; i++) {
    if (shouldStop()) throw new AbortedError('stopped');
    const fen = parsed.fens[i];
    const term = terminalEval(fen);
    if (term) {
      evals.push(term);
    } else {
      const r = await engine.analyse(fen, { movetime: ms });
      evals.push({ ev: r.ev, best: r.bestmove || null, pv: r.pv.slice(0, 4) });
    }
    onPly?.(i + 1, total);
  }
  const analysis = classifyGame({
    gameId: game.id,
    parsed,
    evals,
    myColor: game.myColor,
    base: game.base,
    result: game.result,
    ms,
  });
  const puzzles: Puzzle[] = [];
  for (const m of analysis.mistakes) {
    if (m.cls === 'i') continue;
    if (m.wpBefore < 10) continue; // already hopeless: not instructive
    if (!m.best || m.best === m.played) continue;
    puzzles.push({
      id: `${game.id}:${m.ply}`,
      gameId: game.id,
      ply: m.ply,
      fen: parsed.fens[m.ply],
      color: game.myColor,
      played: m.played,
      playedSan: m.playedSan,
      best: m.best,
      bestSan: m.bestSan,
      pv: m.pv,
      bestEv: evals[m.ply].ev,
      tags: m.tags,
      phase: m.phase,
      loss: m.loss,
      gameEnd: game.endTime,
      box: 0,
      due: Date.now(),
      hist: [],
      createdAt: Date.now(),
    });
  }
  return { analysis, puzzles };
}

export async function saveAnalysis(res: { analysis: GameAnalysis; puzzles: Puzzle[] }) {
  await kvSet('analysis:' + res.analysis.gameId, res.analysis);
  for (const p of res.puzzles) {
    const ex = await kvGet<Puzzle>('puzzle:' + p.id);
    if (!ex) await kvSet('puzzle:' + p.id, p);
  }
}

export async function analysedIds(): Promise<Set<string>> {
  const keys = await db.kv.where('key').startsWith('analysis:').primaryKeys();
  return new Set(keys.map((k) => String(k).slice('analysis:'.length)));
}
