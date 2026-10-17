'use client';
// Spaced repetition per node, stored in the kv store (and so synced). Keys:
//   op:<courseId>:<node key>            NodeRec { b: box, d: due day, n: attempts, l: lapses }
//   opq:<courseId>:<chapterId>:<id>     plans quiz result  { ok: 0 | 1, n }
//   opt:<courseId>:<chapterId>:<id>     trap result        { ok: 0 | 1, n }
import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { db } from '../db';
import { INTERVAL_DAYS } from '../srs';
import { kvByPrefix, kvGet, kvSet, kvUpdate } from '../store';
import { decisionKeys } from './tree.ts';
import type { CompiledChapter, CompiledCourse, NodeRec, OGraph } from './types.ts';
import { allCompiled, compiled } from './index.ts';

export const MASTERED_BOX = 3;

/** Local day number (days since 1970 in the user's time zone). */
export function dayNum(now = Date.now()): number {
  return Math.floor((now - new Date(now).getTimezoneOffset() * 60000) / 86400000);
}

export const nodeKvKey = (courseId: string, key: string) => `op:${courseId}:${key}`;

export type Recs = Record<string, NodeRec>;

/** Next record after an answer. Pure. */
export function nextRec(cur: NodeRec | undefined, ok: boolean, today = dayNum()): NodeRec {
  if (!cur) return ok ? { b: 1, d: today + INTERVAL_DAYS[1], n: 1, l: 0 } : { b: 0, d: today, n: 1, l: 1 };
  if (!ok) return { b: 0, d: today, n: cur.n + 1, l: cur.l + 1 };
  // practising a node before it is due teaches, but does not move the box
  if (cur.b > 0 && cur.d > today) return { ...cur, n: cur.n + 1 };
  const b = Math.min(5, cur.b + 1);
  return { b, d: today + INTERVAL_DAYS[b], n: cur.n + 1, l: cur.l };
}

export async function recordNode(courseId: string, key: string, ok: boolean): Promise<NodeRec> {
  const k = nodeKvKey(courseId, key);
  const out = nextRec(await kvGet<NodeRec>(k), ok);
  await kvSet(k, out);
  return out;
}

/** Mark nodes as learned (box 1) without disturbing nodes that already have a record. */
export async function markLearned(courseId: string, keys: string[]): Promise<void> {
  for (const key of keys) {
    const k = nodeKvKey(courseId, key);
    const cur = await kvGet<NodeRec>(k);
    if (!cur) await kvSet(k, nextRec(undefined, true));
  }
}

function parseRows(courseId: string, rows: { key: string; value: unknown }[]): Recs {
  const out: Recs = {};
  const pre = `op:${courseId}:`;
  for (const r of rows) {
    const v = r.value as NodeRec | undefined;
    if (v && typeof v.b === 'number') out[r.key.slice(pre.length)] = v;
  }
  return out;
}

/** All records of one course (undefined while loading). */
export function useCourseRecs(courseId: string): Recs | undefined {
  const rows = useLiveQuery(() => db.kv.where('key').startsWith(`op:${courseId}:`).toArray(), [courseId]);
  return useMemo(() => (rows ? parseRows(courseId, rows) : undefined), [rows, courseId]);
}

/** Records of every course, keyed by course id. */
export function useAllRecs(): Record<string, Recs> | undefined {
  const rows = useLiveQuery(() => db.kv.where('key').startsWith('op:').toArray(), []);
  return useMemo(() => {
    if (!rows) return undefined;
    const out: Record<string, Recs> = {};
    for (const r of rows) {
      const m = /^op:([^:]+):/.exec(r.key);
      if (!m) continue;
      (out[m[1]] ??= {})[r.key.slice(m[0].length)] = r.value as NodeRec;
    }
    return out;
  }, [rows]);
}

export async function loadCourseRecs(courseId: string): Promise<Recs> {
  const rows = await db.kv.where('key').startsWith(`op:${courseId}:`).toArray();
  return parseRows(courseId, rows);
}

export interface Stats {
  total: number;
  learned: number;
  mastered: number;
  due: number;
  fresh: number;
}

export function graphStats(g: OGraph, side: 'w' | 'b', recs: Recs | undefined, today = dayNum()): Stats {
  const keys = decisionKeys(g, side);
  let learned = 0;
  let mastered = 0;
  let due = 0;
  for (const k of keys) {
    const r = recs?.[k];
    if (!r) continue;
    if (r.b >= 1) learned++;
    if (r.b >= MASTERED_BOX) mastered++;
    if (r.d <= today) due++;
  }
  return { total: keys.length, learned, mastered, due, fresh: keys.length - Object.keys(recs ?? {}).filter((k) => keys.includes(k)).length };
}

export const courseStats = (c: CompiledCourse, recs: Recs | undefined) => graphStats(c.union, c.side, recs);
export const chapterStats = (c: CompiledCourse, ch: CompiledChapter, recs: Recs | undefined) => graphStats(ch.graph, c.side, recs);

// ---------- due lists for sessions ----------

export interface DueNode {
  courseId: string;
  key: string;
  rec: NodeRec;
}

/** Due nodes across all courses, oldest first (then the shakiest). Only nodes that exist in the current trees. */
export async function dueNodes(limit = 12, courseId?: string): Promise<DueNode[]> {
  const today = dayNum();
  const out: DueNode[] = [];
  for (const c of allCompiled()) {
    if (courseId && c.id !== courseId) continue;
    const recs = await loadCourseRecs(c.id);
    for (const [key, rec] of Object.entries(recs)) {
      const n = c.union.nodes[key];
      if (!n || n.turn !== c.side || !n.edges.length) continue;
      if (rec.d <= today) out.push({ courseId: c.id, key, rec });
    }
  }
  out.sort((a, b) => a.rec.d - b.rec.d || a.rec.b - b.rec.b);
  return out.slice(0, limit);
}

export function useDueCount(): number | undefined {
  const all = useAllRecs();
  return useMemo(() => {
    if (!all) return undefined;
    const today = dayNum();
    let n = 0;
    for (const c of allCompiled()) {
      for (const [key, rec] of Object.entries(all[c.id] ?? {})) {
        const node = c.union.nodes[key];
        if (node && node.turn === c.side && node.edges.length && rec.d <= today) n++;
      }
    }
    return n;
  }, [all]);
}

// ---------- plans quiz and traps ----------

export interface QRes {
  ok: 0 | 1;
  n: number;
}
export const quizKey = (kind: 'opq' | 'opt', courseId: string, chapterId: string, id: string) => `${kind}:${courseId}:${chapterId}:${id}`;

export async function recordQuiz(kind: 'opq' | 'opt', courseId: string, chapterId: string, id: string, ok: boolean): Promise<void> {
  await kvUpdate<QRes>(
    quizKey(kind, courseId, chapterId, id),
    () => ({ ok: 0, n: 0 }),
    (r) => {
      r.n += 1;
      r.ok = ok ? 1 : 0;
    },
  );
}

/** Results of one chapter's quizzes or traps, keyed by item id. */
export function useQuizRes(kind: 'opq' | 'opt', courseId: string, chapterId: string): Record<string, QRes> | undefined {
  const pre = `${kind}:${courseId}:${chapterId}:`;
  const rows = useLiveQuery(() => db.kv.where('key').startsWith(pre).toArray(), [pre]);
  return useMemo(() => {
    if (!rows) return undefined;
    const out: Record<string, QRes> = {};
    for (const r of rows) out[r.key.slice(pre.length)] = r.value as QRes;
    return out;
  }, [rows, pre]);
}

export async function quizByPrefix(kind: 'opq' | 'opt', courseId: string): Promise<QRes[]> {
  return kvByPrefix<QRes>(`${kind}:${courseId}:`);
}

// ---------- migration of the old repertoire lessons ----------

/** old lesson id -> [course, chapter] */
export const OLD_LESSONS: Record<string, [string, string]> = {
  'rep-london-main': ['london', 'setup'],
  'rep-london-c5': ['london', 'c5'],
  'rep-london-bf5': ['london', 'bf5'],
  'rep-london-kid': ['london', 'kid'],
  'rep-two-knights': ['e5', 'italian'],
  'rep-scotch': ['e5', 'scotch'],
  'rep-petrov': ['e5', 'petrov'],
  'rep-four-knights': ['e5', 'fourknights'],
  'rep-qgd': ['qgd', 'qgd-main'],
  'rep-qgd-exchange': ['qgd', 'exchange'],
  'rep-qgd-london': ['qgd', 'antilondon'],
};

export function redirectForOldLesson(id: string): string | null {
  const m = OLD_LESSONS[id];
  return m ? `/learn/chapter/?course=${m[0]}&ch=${m[1]}` : null;
}

/** One-time: lessons the student had already completed count as learned in the matching chapter. */
export async function migrateOldRepertoire(): Promise<void> {
  if (await kvGet<number>('op:migrated')) return;
  const done: string[] = [];
  for (const [oldId, [cid, chid]] of Object.entries(OLD_LESSONS)) {
    const prog = await kvGet<{ completedAt?: number }>('learn:' + oldId);
    if (!prog?.completedAt) continue;
    const c = compiled(cid);
    const ch = c?.chapters.find((x) => x.id === chid);
    if (!c || !ch) continue;
    // the first main line of the chapter, student decisions only
    const keys: string[] = [];
    let k = ch.graph.root;
    for (let i = 0; i < 40; i++) {
      const n = ch.graph.nodes[k];
      if (!n.edges.length) break;
      if (n.turn === c.side) keys.push(k);
      k = n.edges[0].to;
    }
    await markLearned(cid, keys);
    done.push(oldId);
  }
  await kvSet('op:migrated', 1);
  void done;
}
