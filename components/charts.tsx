'use client';
import type { MouseEvent } from 'react';
import { evWin, type Col } from '@/lib/core';

export function EvalBar({ ev, orientation }: { ev: number; orientation: Col }) {
  const white = evWin(ev);
  const mine = orientation === 'w' ? white : 100 - white;
  // fill shows "my side" at the bottom
  return (
    <div className="relative w-2.5 self-stretch overflow-hidden rounded-full border border-border bg-subtle">
      <div
        className="absolute inset-x-0 bottom-0 bg-text/80 transition-all duration-300"
        style={{ height: `${mine}%`, opacity: 0.85 }}
        aria-hidden
      />
      <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
    </div>
  );
}

export function EvalGraph({
  ev,
  cls,
  myColor,
  current,
  onSelect,
}: {
  ev: number[];
  cls: string;
  myColor: Col;
  current: number;
  onSelect: (posIndex: number) => void;
}) {
  const W = 320;
  const H = 72;
  const n = ev.length;
  if (n < 2) return null;
  const x = (i: number) => (i / (n - 1)) * W;
  const y = (v: number) => H - (v / 100) * H;
  const pts = ev.map((e, i) => `${x(i).toFixed(1)},${y(myColorWin(e, myColor)).toFixed(1)}`);
  const line = 'M' + pts.join(' L');
  const area = `${line} L${W},${H} L0,${H} Z`;
  const click = (e: MouseEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const f = (e.clientX - r.left) / r.width;
    onSelect(Math.max(0, Math.min(n - 1, Math.round(f * (n - 1)))));
  };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full cursor-pointer rounded-xl border border-border bg-surface" onClick={click} role="img" aria-label="Evaluation graph">
      <line x1="0" x2={W} y1={H / 2} y2={H / 2} stroke="rgb(var(--border))" strokeWidth="1" />
      <path d={area} fill="rgb(var(--accent) / 0.12)" />
      <path d={line} fill="none" stroke="rgb(var(--accent))" strokeWidth="1.6" strokeLinejoin="round" />
      {[...cls].map((c, i) =>
        c === 'b' || c === 'm' ? (
          <circle key={i} cx={x(i + 1)} cy={y(myColorWin(ev[i + 1], myColor))} r={c === 'b' ? 3.4 : 2.6} fill={c === 'b' ? 'rgb(var(--danger))' : 'rgb(var(--warn))'} />
        ) : null,
      )}
      <line x1={x(current)} x2={x(current)} y1="0" y2={H} stroke="rgb(var(--text))" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

function myColorWin(e: number, c: Col): number {
  const w = evWin(e);
  return c === 'w' ? w : 100 - w;
}

export function LineChart({
  points,
  height = 120,
  format = (v: number) => String(Math.round(v)),
  baseline,
  minSpan = 1,
}: {
  points: { t: number; v: number }[];
  height?: number;
  format?: (v: number) => string;
  baseline?: number;
  minSpan?: number;
}) {
  const W = 320;
  if (points.length < 2) return <div className="py-6 text-center text-[13px] text-muted">Not enough data yet.</div>;
  const vs = points.map((p) => p.v);
  let min = Math.min(...vs, baseline ?? Infinity);
  let max = Math.max(...vs, baseline ?? -Infinity);
  if (max - min < minSpan) {
    const mid = (max + min) / 2;
    min = mid - minSpan / 2;
    max = mid + minSpan / 2;
  }
  const pad = 14;
  const t0 = points[0].t;
  const t1 = points[points.length - 1].t;
  const x = (t: number) => (t1 === t0 ? 0 : ((t - t0) / (t1 - t0)) * (W - 8) + 4);
  const y = (v: number) => pad + (1 - (v - min) / (max - min)) * (height - pad * 2);
  // downsample to <= 160 points
  const step = Math.max(1, Math.ceil(points.length / 160));
  const pp = points.filter((_, i) => i % step === 0 || i === points.length - 1);
  const d = 'M' + pp.map((p) => `${x(p.t).toFixed(1)},${y(p.v).toFixed(1)}`).join(' L');
  const last = points[points.length - 1];
  const peak = points.reduce((a, b) => (b.v > a.v ? b : a));
  return (
    <svg viewBox={`0 0 ${W} ${height}`} className="w-full" role="img">
      {baseline !== undefined ? (
        <line x1="0" x2={W} y1={y(baseline)} y2={y(baseline)} stroke="rgb(var(--border))" strokeDasharray="3 3" />
      ) : null}
      <path d={d} fill="none" stroke="rgb(var(--accent))" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(last.t)} cy={y(last.v)} r="3.5" fill="rgb(var(--accent))" />
      <text x={Math.min(W - 2, x(last.t) + 0)} y={Math.max(10, y(last.v) - 8)} textAnchor="end" fontSize="10" fill="rgb(var(--text))">
        {format(last.v)}
      </text>
      {peak.v !== last.v ? (
        <>
          <circle cx={x(peak.t)} cy={y(peak.v)} r="2.5" fill="rgb(var(--muted))" />
          <text x={x(peak.t)} y={Math.max(10, y(peak.v) - 7)} textAnchor="middle" fontSize="10" fill="rgb(var(--muted))">
            {format(peak.v)}
          </text>
        </>
      ) : null}
    </svg>
  );
}
