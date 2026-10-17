import type { Course } from '../types.ts';
import { ch1, ch2 } from './dragon-a.ts';
import { ch3, ch4 } from './dragon-b.ts';
import { ch5, ch6 } from './dragon-c.ts';
import { ch7, ch8 } from './dragon-d.ts';

export const sicilian: Course = {
  id: 'sicilian',
  title: 'Sicilian Dragon',
  blurb: 'Your Black repertoire against 1.e4: the Dragon, plus every anti-Sicilian.',
  side: 'b',
  gamesName: 'Sicilian',
  intro: 'The Dragon is sharp and rewarding. Learn the ideas first (the g7 bishop, the c-file and ...d5), then the lines. Against the anti-Sicilians, a few simple set-ups are all you need.',
  firstMoves: [['e4', 'c5']],
  chapters: [ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8],
};
