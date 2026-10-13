// The coach's voice. All copy is deterministic: phrases rotate on a seed, so the same moment always reads
// the same way but a session does not feel like a robot repeating itself. No network, no LLM.
import { Chess } from 'chess.js';
import type { Square } from 'chess.js';
import { PNAME } from './see.ts';

export function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
const pickBy = <T>(seed: string | number, a: T[]): T => a[(typeof seed === 'number' ? seed : hash(seed)) % a.length];

/** Opening words after a correct answer. */
export function praise(seed: string, how: { hinted: boolean; retried: boolean }): string {
  if (how.hinted) return pickBy(seed, ['You got there, and that is exactly what hints are for.', 'Good, you worked it out with a little help.', 'There it is. The hint did its job.']);
  if (how.retried) return pickBy(seed, ['That is it. The second look found it.', 'Yes, you got it after a second look, and that counts.', 'Right. Looking again is a real skill.']);
  return pickBy(seed, ['Yes.', 'That is it.', 'Exactly.', 'Right, you saw it.', 'Good eye.', 'Spot on.']);
}

/** Opening words after a wrong answer. Never shaming. */
export function nudge(seed: string, tries: number): string {
  if (tries >= 2) return pickBy(seed, ['Still not it, and that is fine. Look at what I have drawn.', 'Not yet. Take your time.', 'This one is tricky. Try the hint if you want it.']);
  return pickBy(seed, ['Not quite.', 'Close, but not that one.', 'Hmm, look again.', 'Almost.', 'Not that one, but good thinking.']);
}

export function describePiece(t: string): string {
  return PNAME[t] ?? 'piece';
}

const SIDE = (c: string) => (c === 'w' ? 'White' : 'Black');

/** One honest sentence about what a reply move does ("Black takes your knight with check"). */
export function describeReply(fenAfterMyMove: string, uci: string): string {
  try {
    const c = new Chess(fenAfterMyMove);
    const mover = c.turn();
    const m = c.move({ from: uci.slice(0, 2) as Square, to: uci.slice(2, 4) as Square, promotion: uci[4] });
    if (!m) return '';
    const who = SIDE(mover);
    if (m.san.endsWith('#')) return `${who} replies ${m.san}, and that is checkmate.`;
    if (m.captured) return `${who} replies ${m.san} and takes your ${PNAME[m.captured]}${m.san.endsWith('+') ? ' with check' : ''}.`;
    if (m.san.endsWith('+')) return `${who} replies ${m.san} with check.`;
    return `${who} replies ${m.san}, and the idea does not work.`;
  } catch {
    return '';
  }
}

// ---------- finishing a lesson ----------

export function finishLine(stars: number, acc: number, seed: string): string {
  const pct = Math.round(acc * 100);
  if (stars >= 3) return pickBy(seed, [`${pct}% first try. That is solid, and you can trust this now.`, `${pct}% on the first try. Clean work.`]);
  if (stars === 2) return pickBy(seed, [`${pct}% first try. Good. A little more practice and it will be automatic.`, `${pct}% first try, with a few to tidy up. You are close.`]);
  return pickBy(seed, [`${pct}% first try. This is a new skill, and the misses are exactly where you learn. Come back to it tomorrow.`, `${pct}% first try. Nothing wrong with that on a first pass. The ones you missed will come back, and that is the point.`]);
}

export interface MasteryNote {
  state: 'learned' | 'shaky';
  text: string;
}

export function masteryNote(acc: number): MasteryNote {
  if (acc >= 0.8) return { state: 'learned', text: 'I will bring this back tomorrow and again in a few days. Pass both and it counts as mastered.' };
  return { state: 'shaky', text: 'Mastery means 80% on the first try. You are not there yet, so I will keep this lesson near the top of your list. Practise more and try again.' };
}

// ---------- session note ----------

export interface SessionFacts {
  reviewed?: boolean;
  puzzlesAttempted?: number;
  puzzlesFirstTry?: number;
  lessonTitle?: string;
  lessonAcc?: number | null;
  drillWon?: boolean | null;
  weakTag?: string | null;
  weakLabel?: string | null;
  skipped: string[];
  seed: string;
}

/** A short, specific note at the end of a daily session. */
export function sessionNote(f: SessionFacts): string {
  const good: string[] = [];
  const watch: string[] = [];
  if (f.reviewed) good.push(pickBy(f.seed + 'r', ['You went back through your last game, which is how improvement actually happens.', 'You reviewed your last game honestly.']));
  if (f.puzzlesAttempted && f.puzzlesAttempted > 0) {
    const r = (f.puzzlesFirstTry ?? 0) / f.puzzlesAttempted;
    if (r >= 0.6) good.push(`You got ${f.puzzlesFirstTry} of ${f.puzzlesAttempted} of your own old mistakes right first time.`);
    else watch.push(`Only ${f.puzzlesFirstTry ?? 0} of ${f.puzzlesAttempted} of your own mistakes went right first time, so they will come back for another go.`);
  }
  if (f.lessonTitle && f.lessonAcc != null) {
    if (f.lessonAcc >= 0.8) good.push(`"${f.lessonTitle}" went well at ${Math.round(f.lessonAcc * 100)}% first try.`);
    else watch.push(`"${f.lessonTitle}" is still shaky at ${Math.round(f.lessonAcc * 100)}%. Go over it once more soon.`);
  }
  if (f.drillWon === true) good.push('You finished the endgame drill.');
  if (f.drillWon === false) watch.push('The endgame drill got away from you. Try it again tomorrow.');
  const parts: string[] = [];
  if (good.length) parts.push(good.slice(0, 2).join(' '));
  if (watch.length) parts.push('Watch: ' + watch[0]);
  if (f.weakLabel) parts.push(`Next: ${f.weakLabel.toLowerCase()} is where most of your lost points come from, so that is where I will keep pointing you.`);
  else parts.push('Next: keep the habit going. A short session every day beats a long one once a week.');
  if (!parts.length) parts.push('A short session is still a session. Come back tomorrow.');
  return parts.join(' ');
}

// ---------- post-game coaching ----------

export interface ThemeFacts {
  tag: string;
  label: string;
  count: number;
  loss: number;
  lessonId: string | null;
  lessonTitle: string | null;
}

/** The top 1-3 lessons of a game, framed as a coach would. */
export function gameTheme(t: ThemeFacts, seed: string): string {
  const times = t.count === 1 ? 'once' : t.count === 2 ? 'twice' : `${t.count} times`;
  const open: Record<string, string[]> = {
    hung_piece: [`You left a piece loose ${times} in this game.`, `Pieces dropped off ${times} here.`],
    missed_win: [`You had a win available ${times} and played something else.`, `A free gain was on the board ${times}.`],
    missed_mate: [`A checkmate was on the board ${times}.`],
    allowed_mate: [`Your king ran into a mating attack ${times}.`],
    fork: [`A fork (given or missed) showed up ${times}.`],
    time_trouble: [`${times === 'once' ? 'One mistake' : 'Several mistakes'} came with little time on the clock.`],
    conversion: [`You had a winning position and let it slip ${times}.`],
  };
  const lead = pickBy(seed + t.tag, open[t.tag] ?? [`${t.label} came up ${times}.`]);
  return t.lessonTitle ? `${lead} Revisit "${t.lessonTitle}".` : lead;
}
