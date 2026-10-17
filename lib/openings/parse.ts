// Tree format: a PGN-like movetext with variations and coach annotations.
//
//   e4 c5 {Black fights for d4 from the side.} Nf3 d6 (Nc6 {...}) d4 cxd4 Nxd4
//
//   - Moves are SAN; move numbers are optional. A trailing "?" marks an opponent mistake that the tree must punish.
//   - "( ... )" is an alternative to the move just before it (PGN rules). Transpositions merge: nodes are keyed by
//     the FEN without move counters, and edges are keyed by move.
//   - "{ ... }" after a move annotates that move. The first part is the idea. Tags start with "@":
//       @a g:f4b8 r:h2h4      arrows (g green, r red, b blue, y yellow)
//       @m y:e5               highlighted squares
//       @w 30                 popularity weight of this reply (default: by order, 55 25 12 6 4)
//       @x Nf3: text          "why not Nf3?" (stored on the position the move was played from)
//       @p                    student move that is sound only in a practical sense (sharp / gambit choice)
//       @d text               what to remember if the opponent leaves the book after this move
import { Chess } from 'chess.js';
import { A, M } from '../learn/build.ts';
import type { OEdge, OGraph, ONode, Side } from './types.ts';

export const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export const keyOf = (fen: string): string => fen.split(' ').slice(0, 4).join(' ');

/** Short stable id for a node key, used in URLs. */
export function nodeHash(key: string): string {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

const DEFAULT_W = [55, 25, 12, 6, 4];

interface Tok {
  t: 'move' | 'open' | 'close' | 'comment';
  v: string;
}

function tokenize(src: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/\s/.test(ch)) {
      i++;
    } else if (ch === '{') {
      const j = src.indexOf('}', i);
      if (j < 0) throw new Error('unterminated comment near: ' + src.slice(i, i + 40));
      out.push({ t: 'comment', v: src.slice(i + 1, j).trim() });
      i = j + 1;
    } else if (ch === '@') {
      // tags written after the closing brace run to the end of the line (any closing parentheses end the variation)
      let j = src.indexOf('\n', i);
      if (j < 0) j = src.length;
      let tail = src.slice(i, j).replace(/\s+$/, '');
      let closes = 0;
      while (tail.endsWith(')')) {
        tail = tail.slice(0, -1).replace(/\s+$/, '');
        closes++;
      }
      out.push({ t: 'comment', v: tail });
      for (let k = 0; k < closes; k++) out.push({ t: 'close', v: ')' });
      i = j;
    } else if (ch === '(') {
      out.push({ t: 'open', v: '(' });
      i++;
    } else if (ch === ')') {
      out.push({ t: 'close', v: ')' });
      i++;
    } else {
      let j = i;
      while (j < src.length && !/[\s{}()]/.test(src[j])) j++;
      const raw = src.slice(i, j);
      i = j;
      const v = raw.replace(/^\d+\.+/, '');
      if (!v || v === '*' || /^(1-0|0-1|1\/2-1\/2)$/.test(v)) continue;
      out.push({ t: 'move', v });
    }
  }
  return out;
}

interface Ann {
  idea: string;
  arrows?: ReturnType<typeof A>;
  marks?: ReturnType<typeof M>;
  w?: number;
  x: [string, string][];
  p: boolean;
  d?: string;
}

function parseAnn(text: string, where: string): Ann {
  const parts = text.split('@');
  const ann: Ann = { idea: parts[0].trim().replace(/\s+/g, ' '), x: [], p: false };
  for (const raw of parts.slice(1)) {
    const tag = raw[0];
    const body = raw.slice(1).trim().replace(/\s+/g, ' ');
    try {
      if (tag === 'a') ann.arrows = A(body);
      else if (tag === 'm') ann.marks = M(body);
      else if (tag === 'w') ann.w = Number(body);
      else if (tag === 'p') ann.p = true;
      else if (tag === 'd') ann.d = body;
      else if (tag === 'x') {
        const k = body.indexOf(':');
        if (k < 1) throw new Error('@x needs "SAN: text"');
        ann.x.push([body.slice(0, k).trim(), body.slice(k + 1).trim()]);
      } else throw new Error('unknown tag @' + tag);
    } catch (e) {
      throw new Error(`${where}: ${(e as Error).message} in "${text.slice(0, 60)}"`);
    }
  }
  return ann;
}

/** Parse tree source into a graph. `side` is the student's colour (decides which nodes get popularity weights). */
export function parseTree(src: string, side: Side, where = 'tree', startFen: string = START): OGraph {
  const nodes: Record<string, ONode> = {};
  const explicit = new WeakMap<OEdge, boolean>();
  const mk = (fen: string, ply: number): ONode => {
    const key = keyOf(fen);
    return (nodes[key] ??= { key, fen, turn: fen.split(' ')[1] as Side, ply, edges: [] });
  };
  const root = mk(startFen, 0);
  let cur = root.key;
  let before: string | null = null;
  let last: OEdge | null = null;
  const stack: { cur: string; before: string | null; last: OEdge | null }[] = [];
  let path: string[] = [];
  const pathStack: string[][] = [];

  for (const tok of tokenize(src)) {
    if (tok.t === 'open') {
      if (before === null) throw new Error(`${where}: "(" with no move before it`);
      stack.push({ cur, before, last });
      pathStack.push(path);
      path = path.slice(0, -1);
      cur = before;
      before = null;
      last = null;
    } else if (tok.t === 'close') {
      const s = stack.pop();
      if (!s) throw new Error(`${where}: unbalanced ")"`);
      cur = s.cur;
      before = s.before;
      last = s.last;
      path = pathStack.pop() ?? path;
    } else if (tok.t === 'move') {
      const mistake = /\?+$/.test(tok.v);
      const san = tok.v.replace(/[?!]+$/, '');
      const node = nodes[cur];
      let m;
      const c = new Chess(node.fen);
      try {
        m = c.move(san);
      } catch {
        throw new Error(`${where}: illegal move ${san} after "${path.join(' ')}"`);
      }
      const uci = m.from + m.to + (m.promotion ?? '');
      const toNode = mk(c.fen(), node.ply + 1);
      let e = node.edges.find((x) => x.uci === uci);
      if (!e) {
        e = { san: m.san, uci, to: toNode.key, w: 0, idea: '' };
        node.edges.push(e);
      }
      if (mistake) e.mistake = true;
      before = cur;
      cur = toNode.key;
      last = e;
      path = [...path, m.san];
    } else {
      if (!last || before === null) throw new Error(`${where}: comment before any move: "${tok.v.slice(0, 40)}"`);
      const ann = parseAnn(tok.v, `${where} after "${path.join(' ')}"`);
      const e = last;
      if (ann.idea && !e.idea) e.idea = ann.idea;
      if (ann.arrows && !e.arrows) e.arrows = ann.arrows;
      if (ann.marks && !e.marks) e.marks = ann.marks;
      if (ann.w !== undefined) {
        e.w = ann.w;
        explicit.set(e, true);
      }
      if (ann.p) e.practical = true;
      if (ann.d) nodes[e.to].dev = ann.d;
      for (const [s, t] of ann.x) {
        const parent = nodes[before];
        (parent.whyNot ??= {})[s] = t;
      }
    }
  }
  if (stack.length) throw new Error(`${where}: unbalanced "("`);

  // popularity weights: explicit ones are kept; the others follow the order the moves were written in
  for (const n of Object.values(nodes)) {
    if (n.turn === side) {
      for (const e of n.edges) e.w = 100;
      continue;
    }
    let i = 0;
    for (const e of n.edges) {
      if (explicit.get(e)) continue;
      e.w = e.mistake ? 6 : (DEFAULT_W[i] ?? 3);
      i++;
    }
  }
  return { root: root.key, nodes };
}

/** Merge several graphs (same root) into one: edges are unioned by move, first annotation wins. */
export function unionGraphs(gs: OGraph[]): OGraph {
  const nodes: Record<string, ONode> = {};
  for (const g of gs) {
    for (const n of Object.values(g.nodes)) {
      const t = (nodes[n.key] ??= { key: n.key, fen: n.fen, turn: n.turn, ply: n.ply, edges: [] });
      t.ply = Math.min(t.ply, n.ply);
      for (const e of n.edges) {
        const ex = t.edges.find((x) => x.uci === e.uci);
        if (!ex) t.edges.push({ ...e });
        else {
          if (!ex.idea && e.idea) ex.idea = e.idea;
          if (!ex.arrows && e.arrows) ex.arrows = e.arrows;
          if (e.mistake) ex.mistake = true;
          ex.w = Math.max(ex.w, e.w);
        }
      }
      if (n.whyNot) t.whyNot = { ...n.whyNot, ...(t.whyNot ?? {}) };
      if (n.dev && !t.dev) t.dev = n.dev;
    }
  }
  return { root: gs[0].root, nodes };
}
