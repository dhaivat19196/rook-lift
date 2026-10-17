// Traversal helpers over an opening graph. Pure: used by the app and by the Node validator.
import type { OEdge, OGraph, ONode, Side } from './types.ts';

export interface Step {
  from: string;
  edge: OEdge;
}

/** Student decision nodes: positions where the student is to move and the course has an answer. */
export function decisionKeys(g: OGraph, side: Side): string[] {
  return Object.values(g.nodes)
    .filter((n) => n.turn === side && n.edges.length > 0)
    .map((n) => n.key);
}

/** Shortest path (in moves) from the root to a node, following the first-written edge on ties. */
export function pathTo(g: OGraph, target: string): Step[] | null {
  if (target === g.root) return [];
  const prev = new Map<string, Step>();
  const seen = new Set<string>([g.root]);
  const q: string[] = [g.root];
  for (let i = 0; i < q.length; i++) {
    const n = g.nodes[q[i]];
    for (const e of n.edges) {
      if (seen.has(e.to)) continue;
      seen.add(e.to);
      prev.set(e.to, { from: n.key, edge: e });
      if (e.to === target) {
        const out: Step[] = [];
        let k = target;
        while (k !== g.root) {
          const s = prev.get(k)!;
          out.unshift(s);
          k = s.from;
        }
        return out;
      }
      q.push(e.to);
    }
  }
  return null;
}

/** SAN list with move numbers: "1.e4 c5 2.Nf3". */
export function sanLine(steps: { edge: { san: string } }[], startTurn: Side = 'w', startNo = 1): string {
  const out: string[] = [];
  steps.forEach((s, i) => {
    const ply = i + (startTurn === 'w' ? 0 : 1);
    const no = startNo + Math.floor(ply / 2);
    if (ply % 2 === 0) out.push(`${no}.${s.edge.san}`);
    else out.push(i === 0 ? `${no}...${s.edge.san}` : s.edge.san);
  });
  return out.join(' ');
}

/** "6." for a White move at this ply (0-based), "6..." for Black. */
export function moveNumber(ply: number): string {
  return `${Math.floor(ply / 2) + 1}${ply % 2 === 0 ? '.' : '...'}`;
}

export function pickWeighted<T>(items: T[], weight: (t: T) => number, rnd: () => number = Math.random): T {
  const ws = items.map((t) => Math.max(0, weight(t)));
  const total = ws.reduce((a, b) => a + b, 0);
  if (total <= 0) return items[Math.floor(rnd() * items.length)];
  let r = rnd() * total;
  for (let i = 0; i < items.length; i++) {
    r -= ws[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

/** Does anything at or below this node (a student decision) satisfy `want`? Memoised over the graph. */
export function makeReach(g: OGraph, side: Side, want: (key: string) => boolean) {
  const memo = new Map<string, boolean>();
  const visiting = new Set<string>();
  const f = (k: string): boolean => {
    const hit = memo.get(k);
    if (hit !== undefined) return hit;
    if (visiting.has(k)) return false;
    visiting.add(k);
    const n = g.nodes[k];
    let r = n.turn === side && n.edges.length > 0 && want(k);
    if (!r) {
      for (const e of n.edges) {
        if (f(e.to)) {
          r = true;
          break;
        }
      }
    }
    visiting.delete(k);
    memo.set(k, r);
    return r;
  };
  return f;
}

/** The opponent's reply: popularity-weighted, nudged toward branches that still hold nodes the student must practise. */
export function chooseReply(g: OGraph, node: ONode, side: Side, wantMore: (key: string) => boolean, rnd: () => number = Math.random, reach?: (k: string) => boolean): OEdge | null {
  if (!node.edges.length) return null;
  const r = reach ?? makeReach(g, side, wantMore);
  return pickWeighted(node.edges, (e) => e.w * (r(e.to) ? 4 : 1), rnd);
}

export interface LearnLine {
  /** moves from the root to where this line begins (replayed quickly) */
  prefix: Step[];
  /** the moves to learn in this line */
  steps: Step[];
  /** the position where the line starts */
  fromKey: string;
  /** the last step runs into a position taught in an earlier line */
  transposes: boolean;
}

/** Walk every branch of the tree once: the main line first, then the sidelines, nearest the root first. */
export function learnPlan(g: OGraph): LearnLine[] {
  const taught = new Set<string>();
  const seen = new Set<string>([g.root]);
  const lines: LearnLine[] = [];
  const pending: { prefix: Step[]; key: string }[] = [{ prefix: [], key: g.root }];
  while (pending.length) {
    pending.sort((a, b) => a.prefix.length - b.prefix.length);
    const start = pending.shift()!;
    const steps: Step[] = [];
    let key = start.key;
    let transposes = false;
    for (;;) {
      const n = g.nodes[key];
      const open = n.edges.filter((e) => !taught.has(n.key + '|' + e.uci));
      if (!open.length) break;
      if (open.length > 1) pending.push({ prefix: [...start.prefix, ...steps], key });
      const first = open[0];
      taught.add(n.key + '|' + first.uci);
      steps.push({ from: key, edge: first });
      if (seen.has(first.to)) {
        transposes = true;
        break;
      }
      seen.add(first.to);
      key = first.to;
    }
    if (steps.length) lines.push({ prefix: start.prefix, steps, fromKey: start.key, transposes });
  }
  return lines;
}

/** Leaves of the tree with their shortest paths, deepest first: starting points for Spar. */
export function leafPaths(g: OGraph, minPly = 8): { key: string; path: Step[] }[] {
  const out: { key: string; path: Step[] }[] = [];
  for (const n of Object.values(g.nodes)) {
    if (n.edges.length) continue;
    const p = pathTo(g, n.key);
    if (p && p.length >= minPly) out.push({ key: n.key, path: p });
  }
  return out.sort((a, b) => b.path.length - a.path.length);
}
