// Where did a game leave the course? Used by the course page insights and by game review.
import { Chess } from 'chess.js';
import { allCompiled } from './index.ts';
import { moveNumber } from './tree.ts';
import type { CompiledCourse, Side } from './types.ts';

export interface Deviation {
  /** 0-based ply of the move that left the tree */
  ply: number;
  /** who left the tree */
  by: 'me' | 'opp';
  played: string;
  playedUci: string;
  /** node key of the position before the move */
  key: string;
  /** the course's moves in that position (SAN), the main one first */
  book: string[];
  /** the chapter that holds that position */
  chapterId: string;
}

export interface GameWalk {
  courseId: string;
  /** the chapter that held the game the longest */
  chapterId: string;
  /** plies still inside the tree */
  inBook: number;
  dev: Deviation | null;
}

interface GameLike {
  id?: string;
  pgn: string;
  myColor: Side;
}

const memo = new Map<string, GameWalk | null>();

export function courseForMoves(sans: string[], side: Side): CompiledCourse | null {
  for (const c of allCompiled()) {
    if (c.side !== side) continue;
    if (c.firstMoves.some((p) => p.every((m, i) => sans[i] === m))) return c;
  }
  return null;
}

/** Walk a game through the union tree of its course. null when no course covers the game. */
export function walkGame(g: GameLike): GameWalk | null {
  const mk = g.id ? `${g.id}|${allCompiled().length}` : '';
  if (mk && memo.has(mk)) return memo.get(mk) ?? null;
  const res = walk(g);
  if (mk) memo.set(mk, res);
  return res;
}

function walk(g: GameLike): GameWalk | null {
  let hist;
  try {
    const c = new Chess();
    c.loadPgn(g.pgn);
    hist = c.history({ verbose: true });
  } catch {
    return null;
  }
  if (!hist.length) return null;
  const sans = hist.map((m) => m.san);
  const course = courseForMoves(sans, g.myColor);
  if (!course) return null;
  const u = course.union;
  let key = u.root;
  let inBook = 0;
  let dev: Deviation | null = null;
  let lastKnown = key;
  for (let i = 0; i < hist.length; i++) {
    const node = u.nodes[key];
    const m = hist[i];
    const uci = m.from + m.to + (m.promotion ?? '');
    const e = node.edges.find((x) => x.uci === uci);
    if (!e) {
      // the tree stops here (a leaf) or the move is new
      if (node.edges.length) {
        const chapter = course.chapters.find((c) => c.graph.nodes[key]?.edges.length);
        dev = {
          ply: i,
          by: node.turn === course.side ? 'me' : 'opp',
          played: m.san,
          playedUci: uci,
          key,
          book: node.edges.map((x) => x.san),
          chapterId: chapter?.id ?? course.chapters[0].id,
        };
      }
      break;
    }
    key = e.to;
    inBook++;
    lastKnown = key;
  }
  const chapter = course.chapters.find((c) => c.graph.nodes[lastKnown]) ?? course.chapters[0];
  return { courseId: course.id, chapterId: dev ? dev.chapterId : chapter.id, inBook, dev };
}

/** "6." or "6..." plus the SAN, for a deviation. */
export function devMove(d: Deviation): string {
  return `${moveNumber(d.ply)}${d.played}`;
}

export function devBook(d: Deviation): string {
  const n = moveNumber(d.ply);
  return d.book.slice(0, 2).map((s) => `${n}${s}`).join(' or ');
}

export interface Group {
  key: string;
  played: string;
  book: string;
  ply: number;
  count: number;
  chapterId: string;
}

/** The most repeated slips: the same position, the same wrong move. */
export function topSlips(walks: GameWalk[]): Group[] {
  const by = new Map<string, Group>();
  for (const w of walks) {
    const d = w.dev;
    if (!d || d.by !== 'me') continue;
    const k = d.key + '|' + d.playedUci;
    const cur = by.get(k) ?? { key: d.key, played: d.played, book: d.book[0], ply: d.ply, count: 0, chapterId: d.chapterId };
    cur.count++;
    by.set(k, cur);
  }
  return [...by.values()].sort((a, b) => b.count - a.count);
}
