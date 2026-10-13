// Lesson schema. Pure types (erased at runtime) so the Node validator can load content directly.
export type Side = 'w' | 'b';
export type AC = 'g' | 'r' | 'b' | 'y';

export interface LArrow {
  from: string;
  to: string;
  c?: AC;
  n?: number;
}

export interface BoardSpec {
  fen: string;
  /** orientation; defaults to the side to move */
  side?: Side;
  arrows?: LArrow[];
  /** highlighted squares, square -> colour */
  marks?: Record<string, AC>;
}

/** The pedagogical phase of a step: watch it done, do it with help, do it alone, mixed review. */
export type Phase = 'example' | 'guided' | 'practice' | 'mixed';

interface Base {
  id: string;
  phase?: Phase;
  /** difficulty 1 (very clear) to 5 */
  d?: number;
  /** produced by a generator (not hand-written) */
  gen?: boolean;
}

export interface TextStep extends Base {
  t: 'text';
  title?: string;
  /** paragraphs separated by a blank line */
  body: string;
  board?: BoardSpec;
}

/** Optional "what's going on here?" question that comes before the board is unlocked. */
export interface ThinkQ {
  q: string;
  opts: string[];
  ans: number;
  why: string;
}

export interface MoveStep extends Base {
  t: 'move';
  fen: string;
  /** coach prompt shown above the board, e.g. "White to move. What does the knight attack?" */
  prompt?: string;
  think?: ThinkQ;
  /** accepted first moves in SAN (each is engine-checked unless cmd) */
  ans: string[];
  /** later user moves, each preceded by the scripted opponent reply */
  cont?: { reply: string; ans: string[] }[];
  /** 'cmd' = the lesson commands a specific move (notation drills): legality only, no engine check.
   *  'kpk' = a bare king-and-pawn ending, verified exactly by the built-in tablebase (ans must list EVERY move that keeps the result) */
  kind?: 'best' | 'cmd' | 'kpk';
  /** the scripted replies come from a famous greedy line (a trap): legal, but not the opponent's best defence */
  loose?: boolean;
  /** this is a tactical shot: the validator also checks that it wins material or mates */
  tactic?: boolean;
  /** hint 1: a guiding question; hint 2 highlights the piece; hint 3 draws the arrow */
  hint?: string;
  /** one or two sentences explaining why it works */
  why: string;
  /** takeaway principle, one line; falls back to the lesson rule */
  rule?: string;
  /** SAN -> why that move fails */
  wrong?: Record<string, string>;
  /** arrows drawn when the answer is shown (otherwise the played line is drawn) */
  arrows?: LArrow[];
  side?: Side;
}

export interface Reveal {
  arrows?: LArrow[];
  marks?: Record<string, AC>;
}

export type SkillId = 'square' | 'value' | 'safe' | 'loose' | 'count' | 'capture' | 'free' | 'mate1' | 'checks' | 'trade' | 'mobility' | 'kpk';

export interface ChoiceOpt {
  text: string;
  ok?: boolean;
  /** why this option is right or wrong (shown after choosing) */
  why?: string;
  /** preview arrows while this option is selected */
  arrows?: LArrow[];
  /** when engine-verified: the SAN this option stands for */
  san?: string;
}

export interface ChoiceStep extends Base {
  t: 'choice';
  q: string;
  board?: BoardSpec;
  opts: ChoiceOpt[];
  why: string;
  rule?: string;
  /** drawn on the board after answering (e.g. attackers red, defenders green) */
  reveal?: Reveal;
  /** teach-back: asks for the reasoning, not the move */
  reasoning?: boolean;
  /** options carry SANs for this FEN and are verified by the engine (right one best, wrong ones clearly worse) */
  engineFen?: string;
  /** bare king-and-pawn position: options are [pawn side wins, it is a draw] and are checked against the tablebase */
  kpk?: { fen: string; wins: boolean };
}

export interface SquaresStep extends Base {
  t: 'squares';
  q: string;
  board: BoardSpec;
  /** squares to tap */
  answer: string[];
  hint?: string;
  why: string;
  rule?: string;
  reveal?: Reveal;
  /** validator checks the answer equals the pieces of this colour that can be won */
  verifyHanging?: Side;
}

export interface TrueFalseStep extends Base {
  t: 'truefalse';
  q: string;
  board?: BoardSpec;
  ans: boolean;
  why: string;
  rule?: string;
  reveal?: Reveal;
  /** bare king-and-pawn position: the statement is "the side with the pawn wins" and is checked against the tablebase */
  kpk?: { fen: string; wins: boolean };
  /** engine claim: playing `san` in `fen` is (ok) / is not (!ok) a good move */
  claim?: { fen: string; san: string; ok: boolean };
}

export interface LineDef {
  id: string;
  title: string;
  /** which side the student plays */
  side: Side;
  /** SAN from the start position (or fen) */
  moves: string[];
  fen?: string;
  /** one-line idea per ply (same length as moves) */
  ideas: string[];
  /** extra arrows per ply (the move itself is drawn automatically) */
  arrows?: Record<number, LArrow[]>;
  /** engine sanity check depth for the student's moves (default 12) */
  note?: string;
}

export interface LineStep extends Base {
  t: 'line';
  line: LineDef;
}

export interface PlayoutDef {
  id: string;
  title: string;
  blurb: string;
  fen: string;
  user: Side;
  goal: 'win' | 'draw';
  success: 'mate' | 'promote' | 'survive';
  maxMoves: number;
  tip: string;
}

export interface PlayoutStep extends Base {
  t: 'playout';
  intro?: string;
  drill: PlayoutDef;
}

export interface GameStep extends Base {
  t: 'game';
  gameId: string;
  mode: 'watch' | 'guess';
}

/** Fresh generated items for a skill, served one at a time at the student's current level. */
export interface GenStep extends Base {
  t: 'gen';
  skill: SkillId;
  /** how many items */
  n: number;
}

export type Step = GenStep | TextStep | MoveStep | ChoiceStep | SquaresStep | TrueFalseStep | LineStep | PlayoutStep | GameStep;

export type Track = 'foundations' | 'notation' | 'tactics' | 'openings' | 'middlegame' | 'endgames' | 'games';

export interface Lesson {
  id: string;
  title: string;
  /** one friendly line shown on the path */
  blurb: string;
  mins: number;
  /** coach's opening line */
  intro: string;
  /** weakness tags (see TAG_INFO in lib/core) this lesson helps with */
  tags?: string[];
  steps: Step[];
  /** "What to remember" - 2 or 3 bullets */
  recap: string[];
  /** "Use it in your next game" habit */
  habit: string;
  /** the one-line principle used after answers */
  rule: string;
  /** generated-practice skill used by "Practice more" */
  skill?: SkillId;
  /** minigame lessons don't have scored steps */
  mini?: 'sprint' | 'name' | 'notation';
}

export type Cat = 'safety' | 'tactics' | 'mates' | 'endgame' | 'opening' | 'plan' | 'clock' | 'notation' | 'games';

export interface Unit {
  id: string;
  title: string;
  blurb: string;
  track: Track;
  /** 0 Foundations, 1 Knight, 2 Bishop, 3 Rook, 4 Queen, 5 King */
  stage: number;
  /** daily-mix category */
  cat: Cat;
  lessons: Lesson[];
}

export interface Annotation {
  /** 1-based ply after which the comment applies (1 = after White's first move) */
  ply: number;
  text: string;
  arrows?: LArrow[];
  marks?: Record<string, AC>;
}

export interface MasterGame {
  id: string;
  title: string;
  white: string;
  black: string;
  year: number;
  event: string;
  result: string;
  blurb: string;
  /** what to look for */
  theme: string;
  /** movetext, SAN with move numbers */
  pgn: string;
  notes: Annotation[];
  /** stage index (1 Knight .. 5 King) where it sits on the path */
  level: number;
  /** a teach-back question after the game: the right answer, the wrong ones, and why */
  ask: { q: string; ok: string; wrong: string[]; why: string };
  recap: string;
  habit: string;
  rule: string;
}
