'use client';
import { Chess, type Square } from 'chess.js';
import { useEffect, useMemo, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import type { Col } from '@/lib/core';

/** Named arrow colours: g green = idea/best, r red = threat/bad, b blue = alternative, y yellow = attention. */
export type ArrowColor = 'g' | 'r' | 'b' | 'y';

export const ARROW_RGB: Record<ArrowColor, string> = {
  g: 'rgb(61 143 106 / 0.85)',
  r: 'rgb(196 72 60 / 0.85)',
  b: 'rgb(66 120 190 / 0.85)',
  y: 'rgb(214 164 30 / 0.9)',
};
export const MARK_RGB: Record<ArrowColor, string> = {
  g: 'rgb(61 143 106 / 0.45)',
  r: 'rgb(196 72 60 / 0.42)',
  b: 'rgb(66 120 190 / 0.42)',
  y: 'rgb(214 164 30 / 0.5)',
};

export interface BoardArrow {
  from: string;
  to: string;
  /** a named colour (g/r/b/y) or any CSS colour */
  color?: ArrowColor | string;
  /** draws a numbered badge (1, 2, 3...) at the arrow tip, for principal variations */
  n?: number;
}

const arrowCss = (c?: string) => (c && c in ARROW_RGB ? ARROW_RGB[c as ArrowColor] : (c ?? ARROW_RGB.g));
export const markCss = (c?: string) => (c && c in MARK_RGB ? MARK_RGB[c as ArrowColor] : (c ?? MARK_RGB.y));

function sqCenter(sq: string, orientation: Col): [number, number] {
  const f = sq.charCodeAt(0) - 97;
  const r = Number(sq[1]) - 1;
  return orientation === 'w' ? [f + 0.5, 7 - r + 0.5] : [7 - f + 0.5, r + 0.5];
}

/** Numbered badges drawn over the board for principal-variation arrows. */
function PvBadges({ arrows, orientation }: { arrows: BoardArrow[]; orientation: Col }) {
  const nums = arrows.filter((a) => a.n !== undefined);
  if (!nums.length) return null;
  return (
    <svg viewBox="0 0 8 8" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
      {nums.map((a) => {
        const [x, y] = sqCenter(a.to, orientation);
        return (
          <g key={a.from + a.to + a.n}>
            <circle cx={x + 0.28} cy={y - 0.28} r={0.25} fill="rgb(var(--surface))" stroke={arrowCss(a.color)} strokeWidth={0.06} />
            <text x={x + 0.28} y={y - 0.28} fontSize={0.3} fontWeight={600} textAnchor="middle" dominantBaseline="central" fill="rgb(var(--text))">
              {a.n}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

interface Props {
  fen: string;
  orientation?: Col;
  /** Enables moving. Return false to reject the move (piece snaps back). */
  onMove?: (from: string, to: string, promotion?: string) => boolean | void;
  /** Which colour may be moved; defaults to side to move. */
  movable?: Col;
  lastMove?: { from: string; to: string } | null;
  arrows?: BoardArrow[];
  /** square -> CSS background (e.g. rgba) or a named colour g/r/b/y */
  highlights?: Record<string, string>;
  /** Raw tap handler (disables piece movement). */
  onSquareTap?: (sq: string) => void;
  showNotation?: boolean;
}

const ACCENT = 'rgb(var(--accent) / 0.38)';

export default function Board({
  fen,
  orientation = 'w',
  onMove,
  movable,
  lastMove,
  arrows,
  highlights,
  onSquareTap,
  showNotation = true,
}: Props) {
  const [sel, setSel] = useState<string | null>(null);
  const chess = useMemo(() => {
    try {
      return new Chess(fen);
    } catch {
      return new Chess();
    }
  }, [fen]);
  const mover: Col = movable ?? chess.turn();
  const canMove = !!onMove && chess.turn() === mover;

  useEffect(() => {
    setSel(null);
  }, [fen]);

  const targets = useMemo(() => {
    if (!sel || !canMove) return [] as string[];
    try {
      return chess.moves({ square: sel as Square, verbose: true }).map((m) => m.to as string);
    } catch {
      return [];
    }
  }, [sel, chess, canMove]);

  const squareStyles = useMemo(() => {
    const s: Record<string, React.CSSProperties> = {};
    if (lastMove) {
      s[lastMove.from] = { background: 'rgb(var(--accent) / 0.22)' };
      s[lastMove.to] = { background: 'rgb(var(--accent) / 0.32)' };
    }
    if (highlights) for (const [sq, bg] of Object.entries(highlights)) s[sq] = { ...s[sq], background: markCss(bg) };
    if (sel) s[sel] = { ...s[sel], background: ACCENT };
    for (const t of targets) {
      const occupied = !!chess.get(t as Square);
      s[t] = {
        ...s[t],
        backgroundImage: occupied
          ? 'radial-gradient(circle, transparent 58%, rgb(var(--accent) / 0.55) 60%, rgb(var(--accent) / 0.55) 72%, transparent 74%)'
          : 'radial-gradient(circle, rgb(var(--accent) / 0.55) 0, rgb(var(--accent) / 0.55) 17%, transparent 19%)',
      };
    }
    return s;
  }, [lastMove, highlights, sel, targets, chess]);

  const attempt = (from: string, to: string): boolean => {
    if (!onMove) return false;
    let promotion: string | undefined;
    const legal = chess.moves({ square: from as Square, verbose: true }).find((m) => m.to === to);
    if (!legal) return false;
    if (legal.promotion) promotion = 'q';
    const res = onMove(from, to, promotion);
    return res !== false;
  };

  return (
    <div className="relative w-full select-none" style={{ touchAction: 'manipulation' }}>
      <Chessboard
        options={{
          id: 'board',
          position: fen,
          boardOrientation: orientation === 'w' ? 'white' : 'black',
          allowDragging: canMove && !onSquareTap,
          canDragPiece: ({ piece }) => canMove && piece.pieceType[0] === mover,
          showAnimations: true,
          animationDurationInMs: 160,
          showNotation,
          allowDrawingArrows: false,
          squareStyles,
          arrows: (arrows ?? []).map((a) => ({ startSquare: a.from, endSquare: a.to, color: arrowCss(a.color) })),
          lightSquareNotationStyle: { color: 'rgb(var(--sq-dark))' },
          darkSquareNotationStyle: { color: 'rgb(var(--sq-light))' },
          alphaNotationStyle: { fontSize: 10 },
          numericNotationStyle: { fontSize: 10 },
          lightSquareStyle: { backgroundColor: 'rgb(var(--sq-light))' },
          darkSquareStyle: { backgroundColor: 'rgb(var(--sq-dark))' },
          boardStyle: { borderRadius: 10, overflow: 'hidden', border: '1px solid rgb(var(--border))' },
          onPieceDrop: ({ sourceSquare, targetSquare }) => {
            if (!targetSquare || !canMove) return false;
            setSel(null);
            return attempt(sourceSquare, targetSquare);
          },
          onSquareClick: ({ piece, square }) => {
            if (onSquareTap) {
              onSquareTap(square);
              return;
            }
            if (!canMove) return;
            if (sel && targets.includes(square)) {
              const from = sel;
              setSel(null);
              attempt(from, square);
              return;
            }
            if (piece && piece.pieceType[0] === mover) setSel(sel === square ? null : square);
            else setSel(null);
          },
        }}
      />
      <PvBadges arrows={arrows ?? []} orientation={orientation} />
    </div>
  );
}
