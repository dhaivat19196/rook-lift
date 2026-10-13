// Authoring helpers for lesson content. Used by both the app and the Node validator
// (so: no path aliases, no TS-only runtime features).
import { Chess } from 'chess.js';
import type { AC, BoardSpec, ChoiceOpt, ChoiceStep, GenStep, Lesson, SkillId, LArrow, LineDef, LineStep, MoveStep, Phase, PlayoutDef, PlayoutStep, Side, SquaresStep, Step, TextStep, ThinkQ, TrueFalseStep } from './types.ts';

export const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

/** FEN after playing SAN moves ("e4 e5 Nf3") from the start position (or `from`). Throws on an illegal move. */
export function pos(moves: string, from: string = START_FEN): string {
  const c = new Chess(from);
  for (const m of moves.trim().split(/\s+/).filter(Boolean)) {
    if (/^\d+\.+$/.test(m)) continue;
    c.move(m.replace(/^\d+\.+/, ''));
  }
  return c.fen();
}

/** "g:e2e4 r:d8h4" -> arrows. Colour letters g r b y; an optional #n suffix numbers the arrow ("g:e2e4#1"). */
export function A(spec: string): LArrow[] {
  return spec
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((tok) => {
      const m = /^([grby]):([a-h][1-8])([a-h][1-8])(?:#(\d))?$/.exec(tok);
      if (!m) throw new Error('bad arrow ' + tok);
      const a: LArrow = { from: m[2], to: m[3], c: m[1] as AC };
      if (m[4]) a.n = Number(m[4]);
      return a;
    });
}

/** "y:f7 r:e8" -> square marks. */
export function M(spec: string): Record<string, AC> {
  const out: Record<string, AC> = {};
  for (const tok of spec.trim().split(/\s+/).filter(Boolean)) {
    const m = /^([grby]):([a-h][1-8])$/.exec(tok);
    if (!m) throw new Error('bad mark ' + tok);
    out[m[2]] = m[1] as AC;
  }
  return out;
}

export function B(fen: string, arrows?: string, marks?: string, side?: Side): BoardSpec {
  const b: BoardSpec = { fen };
  if (arrows) b.arrows = A(arrows);
  if (marks) b.marks = M(marks);
  if (side) b.side = side;
  return b;
}

/** Split "a | b | c" into a list. */
export const L = (s: string): string[] => s.split('|').map((x) => x.trim());

// ---------- step constructors (ids are assigned by lesson()) ----------

type NoId<T> = T extends unknown ? Omit<T, 'id'> & { id?: string } : never;
const arr = <T>(x: T | T[]): T[] => (Array.isArray(x) ? x : [x]);

export function txt(title: string, body: string, board?: BoardSpec): NoId<TextStep> {
  return { t: 'text', title, body, board };
}

export type MoveOpts = Partial<Omit<MoveStep, 't' | 'fen' | 'ans' | 'why'>>;
export function mv(fen: string, ans: string | string[], why: string, o: MoveOpts = {}): NoId<MoveStep> {
  return { t: 'move', fen, ans: arr(ans), why, ...o };
}
/** A tactical shot (validator also checks it wins material or mates). */
export function shot(fen: string, ans: string | string[], why: string, o: MoveOpts = {}): NoId<MoveStep> {
  return { t: 'move', fen, ans: arr(ans), why, tactic: true, ...o };
}
/** A commanded move (notation drills): legality only. */
export function cmd(fen: string, ans: string, why: string, o: MoveOpts = {}): NoId<MoveStep> {
  return { t: 'move', fen, ans: [ans], why, kind: 'cmd', ...o };
}
export function think(q: string, opts: string[], ans: number, why: string): ThinkQ {
  return { q, opts, ans, why };
}
/** choice option: text, ok (true) and why */
export function o(text: string, ok?: boolean | string, why?: string, arrows?: string): ChoiceOpt {
  const r: ChoiceOpt = { text };
  if (ok === true) r.ok = true;
  if (typeof ok === 'string') r.why = ok;
  if (why) r.why = why;
  if (arrows) r.arrows = A(arrows);
  return r;
}
export function choice(q: string, opts: ChoiceOpt[], why: string, board?: BoardSpec, extra: Partial<ChoiceStep> = {}): NoId<ChoiceStep> {
  return { t: 'choice', q, board, opts, why, ...extra };
}
export function squares(q: string, board: BoardSpec, answer: string, why: string, extra: Partial<SquaresStep> = {}): NoId<SquaresStep> {
  return { t: 'squares', q, board, answer: answer.trim().split(/\s+/), why, ...extra };
}
export function kpkTf(q: string, fen: string, wins: boolean, why: string, arrows?: string, marks?: string): NoId<TrueFalseStep> {
  return { t: 'truefalse', q, board: B(fen, arrows, marks), ans: wins, why, kpk: { fen, wins } };
}
export function tf(q: string, ans: boolean, why: string, board?: BoardSpec, extra: Partial<TrueFalseStep> = {}): NoId<TrueFalseStep> {
  return { t: 'truefalse', q, board, ans, why, ...extra };
}
export function line(l: LineDef): NoId<LineStep> {
  return { t: 'line', line: l };
}
export function playout(drill: PlayoutDef, intro?: string): NoId<PlayoutStep> {
  return { t: 'playout', drill, intro };
}

/** n freshly generated practice items for a skill (served at the student's level). */
export function gen(skill: SkillId, n: number): NoId<GenStep> {
  return { t: 'gen', skill, n, phase: 'practice' };
}

/** Tag steps with a teaching phase. */
export function ph(phase: Phase, ...steps: NoId<Step>[]): NoId<Step>[] {
  return steps.map((s) => ({ ...s, phase }));
}

export interface LessonIn extends Omit<Lesson, 'steps' | 'recap' | 'intro'> {
  steps: NoId<Step>[];
  recap: string;
  intro: string;
}

/** Assign step ids (s1, s2, ...) and split the recap ("a | b | c"). */
export function lesson(l: LessonIn): Lesson {
  return {
    ...l,
    recap: L(l.recap),
    steps: l.steps.map((s, i) => ({ ...s, id: s.id ?? 's' + (i + 1) }) as Step),
  };
}
