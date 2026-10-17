import type { Course } from '../types.ts';
import { ch1, ch2, ch3 } from './caro-a.ts';
import { ch4, ch5, ch6 } from './caro-b.ts';

export const caro: Course = {
  id: 'caro',
  title: 'Caro-Kann',
  blurb: 'A solid second weapon against 1.e4: ...c6, ...d5 and a bishop that gets out first.',
  side: 'b',
  gamesName: 'Caro-Kann',
  intro: 'The Caro-Kann is as solid as an opening gets. You get a healthy pawn structure, a bishop that is not locked in, and comfortable endgames. The lines are short and logical.',
  firstMoves: [['e4', 'c6']],
  chapters: [ch1, ch2, ch3, ch4, ch5, ch6],
};
