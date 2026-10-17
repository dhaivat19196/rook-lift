// Queen's Gambit Declined + anti-London course (Black vs 1.d4).
import type { Course } from '../types.ts';
import { ch1, ch2 } from './qgd-a.ts';
import { ch3, ch4 } from './qgd-b.ts';

export const qgd: Course = {
  id: 'qgd',
  title: 'Queen’s Gambit Declined + anti-London',
  blurb: 'Black vs 1.d4: a solid QGD, the Exchange, and a clear plan against the London and other quiet systems.',
  side: 'b',
  gamesName: '1.d4 d5',
  intro: 'A sturdy answer to 1.d4. You meet the Queen’s Gambit with ...e6 and a solid set-up, and you know how to handle the London, Colle and other quiet systems.',
  firstMoves: [['d4', 'd5']],
  chapters: [ch1, ch2, ch3, ch4],
};
