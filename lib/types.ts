import type { Col, Phase } from './core';

export interface Game {
  id: string;
  url: string;
  pgn: string;
  white: string;
  black: string;
  whiteRating: number;
  blackRating: number;
  myColor: Col;
  myRating: number;
  oppRating: number;
  oppName: string;
  result: 'win' | 'loss' | 'draw';
  reason: string; // checkmated, timeout, resigned, abandoned, agreed, ...
  endTime: number; // unix seconds
  timeClass: string;
  timeControl: string;
  base: number;
  inc: number;
  eco: string;
  opening: string;
  plies: number;
}

export interface Puzzle {
  id: string; // gameId:ply
  gameId: string;
  ply: number;
  fen: string;
  color: Col;
  played: string;
  playedSan: string;
  best: string;
  bestSan: string;
  pv: string[];
  bestEv: number; // white-perspective encoded eval of the position (best play)
  tags: string[];
  phase: Phase;
  loss: number;
  gameEnd: number;
  box: number;
  due: number; // ms
  hist: { t: number; ok: boolean }[];
  why?: string;
  createdAt: number;
  /** set for review items that come from a Learn lesson instead of one of the student's games */
  src?: 'learn';
  /** the lesson's explanation, shown instead of the game text for learn items */
  note?: string;
}

export interface Settings {
  username: string;
  onboarded: boolean;
  includeBlitz: boolean;
  includeDaily: boolean;
  speed: 'fast' | 'deep';
  autoAnalyze: boolean;
  dedicatedTarget: number; // minutes
  sprinkleTarget: number;
  anchorDate: string;
  anchorType: 'match' | 'train';
}

export interface DayRec {
  ded: number; // seconds
  spr: number; // seconds
  active: boolean;
  xp: number;
}

export interface Progress {
  xp: number;
  streak: { cur: number; best: number; last: string };
  days: Record<string, DayRec>;
  stats: {
    puzzles: number;
    firstTry: number;
    guard: number;
    reviews: number;
    sessions: number;
    games: number;
    assessments: number;
  };
  badges: Record<string, number>;
  reviewed: Record<string, number>;
  rewardedEnd: number;
  bosses: string[];
}

export interface Meta {
  key: string;
  value: unknown;
}
