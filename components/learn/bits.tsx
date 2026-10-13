'use client';
import { Fragment, type ReactNode } from 'react';
import type { BoardSpec, LArrow, AC } from '@/lib/learn/types';
import type { BoardArrow } from '../Board';
import { cn } from '@/lib/util';

/** Paragraphs split on blank lines; **bold** inline. */
export function Prose({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn('space-y-3 text-[16px] leading-relaxed', className)}>
      {text.split(/\n\n+/).map((para, i) => (
        <p key={i}>
          {para.split('\n').map((line, j) => (
            <Fragment key={j}>
              {j > 0 ? <br /> : null}
              {line.split(/(\*\*[^*]+\*\*)/g).map((seg, k) => (seg.startsWith('**') ? <strong key={k}>{seg.slice(2, -2)}</strong> : <Fragment key={k}>{seg}</Fragment>))}
            </Fragment>
          ))}
        </p>
      ))}
    </div>
  );
}

export function toArrows(a?: LArrow[]): BoardArrow[] {
  return (a ?? []).map((x) => ({ from: x.from, to: x.to, color: x.c ?? 'g', n: x.n }));
}
export function toMarks(m?: Record<string, AC>): Record<string, string> {
  return { ...(m ?? {}) };
}
export function boardProps(b: BoardSpec) {
  return { fen: b.fen, arrows: toArrows(b.arrows), highlights: toMarks(b.marks), orientation: b.side };
}

const LABEL: Record<string, string> = { example: 'Watch first', guided: 'Try it with me', practice: 'Your turn', mixed: 'Mixed review' };
export function PhaseLabel({ phase, extra }: { phase?: string; extra?: string }) {
  const t = (phase && LABEL[phase]) || '';
  if (!t && !extra) return null;
  return (
    <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
      {t}
      {t && extra ? ' · ' : ''}
      {extra}
    </div>
  );
}

/** The coach's reply: a lead phrase, an explanation and, last, the takeaway rule. */
export function CoachNote({ tone, lead, body, rule }: { tone: 'good' | 'bad' | 'plain'; lead?: string; body?: ReactNode; rule?: string }) {
  return (
    <div className="space-y-2">
      {lead || body ? (
        <p className="text-[15px] leading-relaxed">
          {lead ? <span className={cn('font-semibold', tone === 'good' && 'text-accent', tone === 'bad' && 'text-danger')}>{lead} </span> : null}
          {body}
        </p>
      ) : null}
      {rule ? (
        <p className="rounded-xl border border-border bg-subtle px-3.5 py-2.5 text-[14px] leading-snug">
          <span className="mr-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-muted">Remember</span>
          {rule}
        </p>
      ) : null}
    </div>
  );
}

export function Stars({ n, size = 14, className }: { n: number; size?: number; className?: string }) {
  return (
    <span className={cn('inline-flex gap-0.5', className)} aria-label={`${n} of 3 stars`}>
      {[1, 2, 3].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 16 16" aria-hidden>
          <path
            d="M8 1.6l1.9 4 4.4.5-3.3 3 .9 4.3L8 11.2 4.1 13.4 5 9.1 1.7 6.1l4.4-.5z"
            fill={i <= n ? 'rgb(var(--accent))' : 'none'}
            stroke={i <= n ? 'rgb(var(--accent))' : 'rgb(var(--border))'}
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </span>
  );
}

export function Close({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} aria-label="Leave lesson" className="flex h-11 w-11 items-center justify-center rounded-xl text-muted">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M4 4l10 10M14 4 4 14" />
      </svg>
    </button>
  );
}
