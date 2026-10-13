'use client';
import { Chess } from 'chess.js';
import { hangingPieces, parseGame, tryUci, type Col } from './core';
import { db } from './db';
import { kvByPrefix } from './store';
import type { Puzzle } from './types';
import { shuffle } from './util';

export interface GuardPos {
  fen: string; // position after MY move, opponent to move
  color: Col;
  hanging: string[];
  gameId: string;
}

export async function buildGuardSet(count = 10): Promise<GuardPos[]> {
  const out: GuardPos[] = [];
  const positives: GuardPos[] = [];
  const negatives: GuardPos[] = [];
  // 1) positions from my own real hanging-piece mistakes
  try {
    const puz = (await kvByPrefix<Puzzle>('puzzle:')).filter((p) => p.tags.includes('hung_piece'));
    for (const p of shuffle(puz).slice(0, 4)) {
      const c = new Chess(p.fen);
      if (!tryUci(c, p.played)) continue;
      const h = hangingPieces(c.fen(), p.color);
      if (h.length) positives.push({ fen: c.fen(), color: p.color, hanging: h, gameId: p.gameId });
    }
  } catch {
    /* ignore */
  }
  // 2) random positions from recent games
  const games = shuffle(await db.games.orderBy('endTime').reverse().limit(60).toArray()).slice(0, 25);
  for (const g of games) {
    if (positives.length >= 6 && negatives.length >= 5) break;
    const parsed = parseGame(g.pgn);
    if (!parsed) continue;
    const plies: number[] = [];
    for (let i = 8; i < parsed.ucis.length - 1; i++) if (parsed.colors[i] === g.myColor) plies.push(i);
    for (const i of shuffle(plies).slice(0, 5)) {
      const fen = parsed.fens[i + 1];
      const h = hangingPieces(fen, g.myColor);
      const pos = { fen, color: g.myColor, hanging: h, gameId: g.id };
      if (h.length > 0 && positives.length < 6) positives.push(pos);
      else if (h.length === 0 && negatives.length < 5) negatives.push(pos);
    }
  }
  out.push(...positives.slice(0, Math.ceil(count * 0.6)));
  out.push(...negatives.slice(0, count - out.length));
  // top up with whatever is left
  const rest = shuffle([...positives.slice(Math.ceil(count * 0.6)), ...negatives.slice(count - out.length)]);
  while (out.length < count && rest.length) out.push(rest.pop()!);
  return shuffle(out).slice(0, count);
}
