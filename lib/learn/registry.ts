import { GAMES, UNITS } from './content/index.ts';
import type { Lesson, MasterGame, Step, Unit } from './types.ts';

export interface StageInfo {
  id: number;
  name: string;
  band: string;
  blurb: string;
  /** minimum rapid rating at which this stage is "yours" */
  from: number;
}

export const STAGES: StageInfo[] = [
  { id: 0, name: 'Foundations', band: 'up to 650', blurb: 'Safe pieces, simple mates, a calm opening and a plan for the clock.', from: 0 },
  { id: 1, name: 'Knight', band: '650 to 900', blurb: 'Basic tactics, opening traps and your first endgames.', from: 650 },
  { id: 2, name: 'Bishop', band: '900 to 1200', blurb: 'Tactical motifs in depth and a simple repertoire.', from: 900 },
  { id: 3, name: 'Rook', band: '1200 to 1500', blurb: 'Calculation, middlegame plans and rook endgames.', from: 1200 },
  { id: 4, name: 'Queen', band: '1500 to 1800', blurb: 'Positional play, prophylaxis and full-game study.', from: 1500 },
  { id: 5, name: 'King', band: '1800 and up', blurb: 'Maintenance and review.', from: 1800 },
];

export interface LessonRef {
  lesson: Lesson;
  unit: Unit;
  stage: number;
  /** position along the whole path */
  index: number;
}

// The old repertoire units now live in the opening courses (lib/openings). Their lessons stay loadable by id
// (stored progress, review items) but they are no longer part of the path.
export const isOldRepertoire = (u: Unit) => u.id.startsWith('rep-');
const sortedUnits = UNITS.filter((u) => !isOldRepertoire(u)).map((u, i) => ({ u, i })).sort((a, b) => a.u.stage - b.u.stage || a.i - b.i).map((x) => x.u);

export const ALL: LessonRef[] = [];
for (const u of sortedUnits) for (const l of u.lessons) ALL.push({ lesson: l, unit: u, stage: u.stage, index: ALL.length });
export const BY_ID: Record<string, LessonRef> = Object.fromEntries(ALL.map((r) => [r.lesson.id, r]));
for (const u of UNITS.filter(isOldRepertoire)) for (const l of u.lessons) BY_ID[l.id] = { lesson: l, unit: u, stage: u.stage, index: -1 };
export const UNITS_SORTED = sortedUnits;

export function stageOfRating(rating: number | null | undefined): number {
  if (!rating) return 0;
  let s = 0;
  for (const st of STAGES) if (rating >= st.from) s = st.id;
  return s;
}

export function gamesPlayable(): MasterGame[] {
  return GAMES;
}
export function gameById(id: string): MasterGame | undefined {
  return GAMES.find((g) => g.id === id);
}

/** Steps that can be asked again later: scored practice items (never generated). */
export function scoredSteps(l: Lesson): Step[] {
  return l.steps.filter((s) => s.phase === 'practice' && ['move', 'choice', 'squares', 'truefalse'].includes(s.t) && !(s.t === 'move' && s.kind === 'cmd'));
}

export function findStep(lessonId: string, stepId: string): Step | undefined {
  return BY_ID[lessonId]?.lesson.steps.find((s) => s.id === stepId);
}

export { GAMES, UNITS };
