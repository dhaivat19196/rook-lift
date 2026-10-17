'use client';
import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { db } from '../db';
import { walkGame, type GameWalk } from './games.ts';
import type { Game } from '../types';

export interface CourseGame {
  game: Game;
  walk: GameWalk;
}

/** The student's imported games, newest first, each walked through its course tree. undefined while loading. */
export function useAllCourseGames(): CourseGame[] | undefined {
  const games = useLiveQuery(() => db.games.toArray(), []);
  return useMemo(() => {
    if (!games) return undefined;
    return games
      .slice()
      .sort((a, b) => b.endTime - a.endTime)
      .map((game) => ({ game, walk: walkGame({ id: game.id, pgn: game.pgn, myColor: game.myColor }) }))
      .filter((x): x is CourseGame => !!x.walk);
  }, [games]);
}

export function useCourseGames(courseId: string): CourseGame[] | undefined {
  const all = useAllCourseGames();
  return useMemo(() => all?.filter((x) => x.walk.courseId === courseId), [all, courseId]);
}
