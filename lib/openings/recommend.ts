'use client';
import { useMemo } from 'react';
import { useAllCourseGames } from '@/lib/openings/useGames';
import { allCompiled } from './index.ts';
import { chapterStats, courseStats, useAllRecs } from './progress.ts';

export interface OpeningRec {
  kind: 'due' | 'chapter' | 'course';
  title: string;
  why: string;
  href: string;
  /** about how many minutes it takes */
  mins: number;
  due: number;
}

/**
 * Opening courses in the recommender. Due positions come first. Otherwise the next chapter of a course you have started,
 * preferring chapters your own games run into, and finally the first chapter of the course for the opening you play most.
 * undefined while loading.
 */
export function useOpeningRec(): OpeningRec | null | undefined {
  const all = useAllRecs();
  const games = useAllCourseGames();
  return useMemo(() => {
    if (!all || !games) return undefined;
    const courses = allCompiled();
    let due = 0;
    for (const c of courses) due += courseStats(c, all[c.id]).due;
    if (due > 0) {
      return {
        kind: 'due',
        title: 'Opening review',
        why: `${due} ${due === 1 ? 'position is' : 'positions are'} due. A few minutes now keeps your lines automatic.`,
        href: '/learn/opening-review/',
        mins: 5,
        due,
      };
    }
    // games per chapter
    const faced: Record<string, number> = {};
    const perCourse: Record<string, number> = {};
    for (const { walk } of games) {
      faced[walk.courseId + '/' + walk.chapterId] = (faced[walk.courseId + '/' + walk.chapterId] ?? 0) + 1;
      perCourse[walk.courseId] = (perCourse[walk.courseId] ?? 0) + 1;
    }
    const started = courses.filter((c) => Object.keys(all[c.id] ?? {}).length > 0);
    const pool = started.length ? started : courses.slice().sort((a, b) => (perCourse[b.id] ?? 0) - (perCourse[a.id] ?? 0)).slice(0, 1);
    let best: { c: (typeof courses)[number]; ch: (typeof courses)[number]['chapters'][number]; score: number } | null = null;
    for (const c of pool) {
      for (const [i, ch] of c.chapters.entries()) {
        const s = chapterStats(c, ch, all[c.id]);
        if (s.learned >= s.total) continue;
        const score = (faced[c.id + '/' + ch.id] ?? 0) * 3 - i * 0.1;
        if (!best || score > best.score) best = { c, ch, score };
      }
    }
    if (!best) return null;
    const isNew = !started.length;
    return {
      kind: isNew ? 'course' : 'chapter',
      title: isNew ? best.c.title : best.ch.title,
      why: isNew
        ? `${best.c.title} fits the games you actually play. Start with ${best.ch.title.toLowerCase()}.`
        : (faced[best.c.id + '/' + best.ch.id] ?? 0) > 0
          ? `${best.c.title}: you met this in ${faced[best.c.id + '/' + best.ch.id]} of your games, so it is the most useful next step.`
          : `${best.c.title}: the next chapter on your path.`,
      href: `/learn/chapter/?course=${best.c.id}&ch=${best.ch.id}`,
      mins: 10,
      due: 0,
    };
  }, [all, games]);
}
