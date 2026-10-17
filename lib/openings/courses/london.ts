import type { Course } from '../types.ts';
import { ch1, ch2 } from './london-a.ts';

export const london: Course = {
  id: 'london',
  title: 'London System',
  blurb: 'Your White repertoire: d4, Bf4, e3, Nf3 against everything.',
  side: 'w',
  gamesName: 'London',
  intro: 'The London is a system you can play against almost anything. Learn the setup once and spend your energy on the middlegame.',
  firstMoves: [['d4']],
  chapters: [ch1, ch2],
};
