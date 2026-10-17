// Authoring helpers and course compilation. Used by the app and by the Node validator (relative .ts imports only).
import { A, M } from '../learn/build.ts';
import { parseTree, unionGraphs } from './parse.ts';
import type { Chapter, CompiledCourse, Course, PlanOpt, PlanQ, Side, Trap } from './types.ts';

/** A plan-quiz option. `san` makes it an engine-checked move at the question position. */
export function opt(t: string, ok: boolean, why: string, san?: string, arrows?: string): PlanOpt {
  const o: PlanOpt = { t, why };
  if (ok) o.ok = true;
  if (san) o.san = san;
  if (arrows) o.arrows = A(arrows);
  return o;
}

export function plan(id: string, at: string, q: string, opts: PlanOpt[], rule: string, o: { kind?: PlanQ['kind']; arrows?: string; marks?: string } = {}): PlanQ {
  const p: PlanQ = { id, at, kind: o.kind ?? 'plan', q, opts, rule };
  if (o.arrows) p.arrows = A(o.arrows);
  if (o.marks) p.marks = M(o.marks);
  return p;
}

/** The opponent has erred; find the punishing move. */
export function win(id: string, title: string, side: Side, at: string, ans: string, line: string, idea: string, rule: string, arrows?: string): Trap {
  return { id, title, kind: 'win', side, at, ans, line, idea, rule, arrows: arrows ? A(arrows) : undefined };
}

/** The natural move walks into a trick; find the safe move. */
export function avoid(id: string, title: string, side: Side, at: string, bait: string, ans: string, line: string, idea: string, rule: string, arrows?: string): Trap {
  return { id, title, kind: 'avoid', side, at, ans, bait, line, idea, rule, arrows: arrows ? A(arrows) : undefined };
}

export interface ChapterIn {
  id: string;
  title: string;
  blurb: string;
  coach: string;
  tip: string;
  src: string;
  plans: PlanQ[];
  traps?: Trap[];
}
export const chapter = (c: ChapterIn): Chapter => ({ ...c, traps: c.traps ?? [] });

const cache = new Map<string, CompiledCourse>();

export function compileCourse(c: Course): CompiledCourse {
  const hit = cache.get(c.id);
  if (hit) return hit;
  const chapters = c.chapters.map((ch) => ({ ...ch, graph: parseTree(ch.src, c.side, `${c.id}/${ch.id}`) }));
  const out: CompiledCourse = { ...c, chapters, union: unionGraphs(chapters.map((x) => x.graph)) };
  cache.set(c.id, out);
  return out;
}
