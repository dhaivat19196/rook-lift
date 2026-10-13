'use client';
import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/util';

export function Card({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div onClick={onClick} className={cn('rounded-2xl border border-border bg-surface p-5', className)}>
      {children}
    </div>
  );
}

export function Label({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('text-[11px] font-medium uppercase tracking-[0.08em] text-muted', className)}>{children}</div>;
}

export function PageTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <header className="px-5 pt-8 pb-5">
      <h1 className="text-[28px] font-semibold leading-tight tracking-tight">{title}</h1>
      {sub ? <p className="mt-1 text-[15px] text-muted">{sub}</p> : null}
    </header>
  );
}

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
const base =
  'inline-flex min-h-[52px] w-full items-center justify-center rounded-2xl px-5 text-[16px] font-medium transition active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none';
const variants: Record<Variant, string> = {
  primary: 'bg-accent text-accent-fg',
  secondary: 'border border-border bg-surface text-text',
  ghost: 'text-muted',
  danger: 'border border-danger/40 text-danger',
};

export function Button({
  variant = 'primary',
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button {...rest} className={cn(base, variants[variant], className)} />;
}

export function LinkButton({
  href,
  variant = 'primary',
  children,
  className,
  external,
  onClick,
}: {
  href: string;
  variant?: Variant;
  children: ReactNode;
  className?: string;
  external?: boolean;
  onClick?: () => void;
}) {
  if (external)
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick} className={cn(base, variants[variant], className)}>
        {children}
      </a>
    );
  return (
    <Link href={href} className={cn(base, variants[variant], className)}>
      {children}
    </Link>
  );
}

export function Bar({ value, className, tone = 'accent' }: { value: number; className?: string; tone?: 'accent' | 'danger' | 'muted' }) {
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-subtle', className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-500', tone === 'accent' ? 'bg-accent' : tone === 'danger' ? 'bg-danger' : 'bg-muted')}
        style={{ width: `${v * 100}%` }}
      />
    </div>
  );
}

export function Ring({
  value,
  label,
  sub,
  size = 112,
}: {
  value: number;
  label: string;
  sub: string;
  size?: number;
}) {
  const stroke = 7;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--subtle))" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgb(var(--accent))"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v)}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-[22px] font-semibold leading-none tabular">{label}</div>
        <div className="mt-1 text-[11px] text-muted">{sub}</div>
      </div>
    </div>
  );
}

export function Chip({
  children,
  active,
  onClick,
  className,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const cls = cn(
    'inline-flex min-h-[40px] items-center rounded-full border px-4 text-[14px] transition',
    active ? 'border-accent bg-accent/10 text-accent' : 'border-border text-text',
    className,
  );
  if (!onClick) return <span className={cls}>{children}</span>;
  return (
    <button onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

export function Empty({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-6 text-center">
      <div className="text-[16px] font-medium">{title}</div>
      <p className="mx-auto mt-1 max-w-xs text-[14px] text-muted">{body}</p>
      {action ? <div className="mx-auto mt-4 max-w-xs">{action}</div> : null}
    </div>
  );
}

export function CheckMark({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" className="anim-pop">
      <circle cx="28" cy="28" r="26" fill="none" stroke="rgb(var(--accent))" strokeWidth="2" />
      <path d="M17 29 l8 8 l15 -17" fill="none" stroke="rgb(var(--accent))" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="check-path" />
    </svg>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn('inline-block h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-transparent', className)}
      aria-label="Loading"
    />
  );
}

export function Row({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex items-center justify-between gap-3', className)}>{children}</div>;
}

export function BackBar({ title, href = '/train/', right }: { title: string; href?: string; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-3 pt-4 pb-2">
      <Link href={href} className="flex min-h-[44px] min-w-[44px] items-center gap-1 rounded-xl px-2 text-[15px] text-muted">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 3 5 9l6 6" />
        </svg>
        Back
      </Link>
      <div className="text-[15px] font-medium">{title}</div>
      <div className="min-w-[60px] text-right">{right}</div>
    </div>
  );
}

export function Toggle({ checked, onChange, label, sub }: { checked: boolean; onChange: (v: boolean) => void; label: string; sub?: string }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex min-h-[52px] w-full items-center justify-between gap-4 text-left" role="switch" aria-checked={checked}>
      <span>
        <span className="block text-[15px]">{label}</span>
        {sub ? <span className="block text-[12px] text-muted">{sub}</span> : null}
      </span>
      <span className={cn('relative h-7 w-12 shrink-0 rounded-full border transition', checked ? 'border-accent bg-accent' : 'border-border bg-subtle')}>
        <span className="absolute top-[2px] h-[22px] w-[22px] rounded-full bg-white shadow-sm transition-all" style={{ left: checked ? 22 : 2 }} />
      </span>
    </button>
  );
}

export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { id: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="flex rounded-xl border border-border bg-subtle p-1">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={cn('min-h-[40px] flex-1 rounded-lg text-[14px] transition', value === o.id ? 'bg-surface font-medium shadow-sm' : 'text-muted')}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Stepper({ value, onChange, min, max, step = 5, unit = 'min' }: { value: number; onChange: (v: number) => void; min: number; max: number; step?: number; unit?: string }) {
  return (
    <div className="flex items-center gap-1">
      <button onClick={() => onChange(Math.max(min, value - step))} className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-[20px]" aria-label="Decrease">
        -
      </button>
      <div className="w-16 text-center text-[15px] tabular">
        {value} {unit}
      </div>
      <button onClick={() => onChange(Math.min(max, value + step))} className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-[20px]" aria-label="Increase">
        +
      </button>
    </div>
  );
}
