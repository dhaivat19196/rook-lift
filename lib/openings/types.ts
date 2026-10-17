// Opening courses: pure types (erased at runtime so the Node validator can load the content directly).
import type { AC, LArrow } from '../learn/types.ts';

export type Side = 'w' | 'b';

/** One move out of a position. Annotation lives on the edge (position + move). */
export interface OEdge {
  san: string;
  uci: string;
  /** node key of the position after this move */
  to: string;
  /** relative popularity at amateur level, used to pick the opponent's reply (author estimate) */
  w: number;
  /** coach-voice one-line idea */
  idea: string;
  arrows?: LArrow[];
  marks?: Record<string, AC>;
  /** an opponent error (authored as "Qxd4?"); the reply in the tree must punish it */
  mistake?: boolean;
  /** a student move flagged sound:'practical' (sharp or gambit choice, between -60 and -35 cp is tolerated) */
  practical?: boolean;
}

export interface ONode {
  /** FEN without move counters */
  key: string;
  fen: string;
  turn: Side;
  /** distance from the root along the path that created this node first */
  ply: number;
  edges: OEdge[];
  /** "why not X?" notes for common alternatives, SAN -> explanation */
  whyNot?: Record<string, string>;
  /** the principle to remember if the opponent leaves the book here (shown on leaf nodes) */
  dev?: string;
}

export interface OGraph {
  root: string;
  nodes: Record<string, ONode>;
}

/** A "what is the plan?" style question at a typical position out of the opening. */
export interface PlanOpt {
  t: string;
  ok?: boolean;
  why: string;
  /** option stands for this move at the question position (engine-checked) */
  san?: string;
  arrows?: LArrow[];
}
export interface PlanQ {
  id: string;
  /** SAN moves from the start position */
  at: string;
  kind: 'plan' | 'square' | 'break';
  q: string;
  opts: PlanOpt[];
  /** the takeaway */
  rule: string;
  arrows?: LArrow[];
  marks?: Record<string, AC>;
}

/** A trap. kind 'win': the opponent has erred and the student finds the punishing move. kind 'avoid': the natural move loses to a trick. */
export interface Trap {
  id: string;
  title: string;
  kind: 'win' | 'avoid';
  /** the student's colour */
  side: Side;
  /** SAN moves from the start position to the question position */
  at: string;
  /** the correct move (the punishing move, or the safe move to avoid the trap) */
  ans: string;
  /** avoid-traps only: the tempting move that loses */
  bait?: string;
  /** SAN continuation after `ans` (win) or after `bait` (avoid) that shows the point */
  line: string;
  /** 'win': at the end of `line` the student's side is clearly winning (engine) or mated the opponent; 'avoid': the opponent is */
  idea: string;
  rule: string;
  arrows?: LArrow[];
}

export interface Chapter {
  id: string;
  title: string;
  blurb: string;
  /** the coach's opening words */
  coach: string;
  /** tree source (see parse.ts) */
  src: string;
  plans: PlanQ[];
  traps: Trap[];
  /** a one-line plan reminder used in the Spar summary */
  tip: string;
}

export interface Course {
  id: string;
  title: string;
  /** one line for cards */
  blurb: string;
  side: Side;
  /** the coach's welcome */
  intro: string;
  chapters: Chapter[];
  /** does a game that starts with these SAN moves (played by `side`) belong to this course? */
  firstMoves: string[][];
  /** name used in sentences: "your London games" */
  gamesName: string;
}

export interface CompiledChapter extends Chapter {
  graph: OGraph;
}
export interface CompiledCourse extends Omit<Course, 'chapters'> {
  chapters: CompiledChapter[];
  /** union of all chapter graphs (positions shared across chapters merge) */
  union: OGraph;
}

/** SRS record for one node: compact on purpose (syncs through the kv store). */
export interface NodeRec {
  /** box 0..5 */
  b: number;
  /** due day (days since 1970, local) */
  d: number;
  /** attempts */
  n: number;
  /** lapses */
  l: number;
}
