import type { Course } from '../types.ts';
import { ch1, ch2 } from './london-a.ts';
import { ch3, ch4 } from './london-b.ts';
import { ch5, ch6, ch7, ch8 } from './london-c.ts';
import { ch10, ch11, ch12, ch9 } from './london-d.ts';

export const london: Course = {
  id: 'london',
  title: 'London System',
  blurb: 'Your White repertoire: d4, Bf4, e3, Nf3 against everything.',
  side: 'w',
  gamesName: 'London',
  intro: 'The London is a system you can play against almost anything. Learn the setup once and spend your energy on the middlegame.',
  firstMoves: [['d4']],
  chapters: [ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8, ch9, ch10, ch11, ch12],
};
