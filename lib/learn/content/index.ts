import type { Unit } from '../types.ts';
import { notation } from './notation.ts';
import { cct, safety, values } from './found1.ts';
import { mates, openBasics } from './found2.ts';
import { clock, convert, endBasics } from './found3.ts';
import { GAMES, gameUnits } from './games.ts';
import { endBishop, endKnight } from './endgames.ts';
import { repE5, repLondon, repQgd } from './repertoire.ts';
import { traps } from './traps.ts';
import { tacticsBishop } from './tactics-b.ts';
import { matesBishop, matesKnight, tacticsKnight } from './tactics-a.ts';

export const UNITS: Unit[] = [notation, values, safety, cct, mates, openBasics, endBasics, convert, clock, tacticsKnight, traps, matesKnight, tacticsBishop, matesBishop, repLondon, repE5, repQgd, endKnight, endBishop, ...gameUnits];
export { GAMES };
