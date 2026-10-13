export function localDay(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${da}`;
}

export function dayToDate(day: string): Date {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(day: string, n: number): string {
  const d = dayToDate(day);
  d.setDate(d.getDate() + n);
  return localDay(d);
}

export function daysBetween(a: string, b: string): number {
  return Math.round((dayToDate(b).getTime() - dayToDate(a).getTime()) / 86400000);
}

export function greeting(d: Date = new Date()): string {
  const h = d.getHours();
  if (h < 5) return 'Late night';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export function fmtClock(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function timeAgo(ts: number): string {
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 10) return 'just now';
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
}

export function fmtDate(sec: number): string {
  return new Date(sec * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function cn(...c: (string | false | null | undefined)[]): string {
  return c.filter(Boolean).join(' ');
}

export function shuffle<T>(a: T[]): T[] {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function tcLabel(g: { base: number; inc: number; timeControl: string }): string {
  if (!g.base) return g.timeControl;
  const m = g.base / 60;
  return `${Number.isInteger(m) ? m : m.toFixed(1)}+${g.inc}`;
}
