import { compileCourse } from './course.ts';
import { london } from './courses/london.ts';
import type { CompiledChapter, CompiledCourse, Course } from './types.ts';

export const COURSES: Course[] = [london];

export function courseById(id: string): Course | undefined {
  return COURSES.find((c) => c.id === id);
}

/** Parsed trees (cached). */
export function compiled(id: string): CompiledCourse | undefined {
  const c = courseById(id);
  return c ? compileCourse(c) : undefined;
}

export function allCompiled(): CompiledCourse[] {
  return COURSES.map((c) => compileCourse(c));
}

export function chapterOf(courseId: string, chapterId: string): CompiledChapter | undefined {
  return compiled(courseId)?.chapters.find((c) => c.id === chapterId);
}
