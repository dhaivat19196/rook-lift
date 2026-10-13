import type { Col } from './core';

export interface Drill {
  id: string;
  title: string;
  blurb: string;
  fen: string;
  user: Col;
  goal: 'win' | 'draw';
  /** mate = checkmate; promote = promote with a winning eval; survive = reach a draw or last N moves not losing */
  success: 'mate' | 'promote' | 'survive';
  maxMoves: number;
  tip: string;
}

export const DRILLS: Drill[] = [
  {
    id: 'kq',
    title: 'King + Queen vs King',
    blurb: 'Mate before move 30. Do not stalemate.',
    fen: '4k3/8/8/8/8/8/8/3QK3 w - - 0 1',
    user: 'w',
    goal: 'win',
    success: 'mate',
    maxMoves: 30,
    tip: 'Take away squares one ring at a time with the queen a knight-move away, then bring the king. Before every move: does it leave the enemy king a legal move?',
  },
  {
    id: 'kr',
    title: 'King + Rook vs King',
    blurb: 'Cut the king off, shrink the box, mate.',
    fen: '8/8/8/4k3/8/8/8/R3K3 w - - 0 1',
    user: 'w',
    goal: 'win',
    success: 'mate',
    maxMoves: 45,
    tip: 'Rook cuts the king along a file or rank. Walk your king up to the opposition, then give a rook check to push it back.',
  },
  {
    id: 'kp-opp',
    title: 'King + Pawn: the opposition',
    blurb: 'Promote the pawn. Keep your king in front of it.',
    fen: '8/8/8/3k4/8/3K4/3P4/8 b - - 0 1',
    user: 'w',
    goal: 'win',
    success: 'promote',
    maxMoves: 40,
    tip: 'Your king leads, the pawn follows. Win the opposition (kings facing with one square between) when the enemy king is in front.',
  },
  {
    id: 'kp-key',
    title: 'King + Pawn: key squares',
    blurb: 'Get your king to a key square and the pawn queens.',
    fen: '8/8/8/8/k7/2K5/1P6/8 w - - 0 1',
    user: 'w',
    goal: 'win',
    success: 'promote',
    maxMoves: 40,
    tip: 'If your king reaches a key square (two ranks ahead of the pawn, beside it), the pawn promotes by force.',
  },
  {
    id: 'kp-def',
    title: 'Hold the draw: K+P vs K',
    blurb: 'You defend. Take the opposition, reach a draw.',
    fen: '8/8/8/8/3k4/8/3P4/3K4 b - - 0 1',
    user: 'b',
    goal: 'draw',
    success: 'survive',
    maxMoves: 30,
    tip: 'Stay in front of the pawn and keep the opposition. If their king steps aside, step opposite.',
  },
  {
    id: 'lucena',
    title: 'Lucena position',
    blurb: 'Rook + pawn: build the bridge and promote.',
    fen: '3K4/3P1k2/8/8/8/8/r7/4R3 w - - 0 1',
    user: 'w',
    goal: 'win',
    success: 'promote',
    maxMoves: 40,
    tip: 'Rook to the 4th rank (Rf1+ then Re4), step your king out, then use the rook as a shield to block checks.',
  },
  {
    id: 'philidor',
    title: 'Philidor defence',
    blurb: 'Rook + pawn vs rook: hold the draw.',
    fen: '4k3/8/r7/3PK3/8/8/8/7R b - - 0 1',
    user: 'b',
    goal: 'draw',
    success: 'survive',
    maxMoves: 30,
    tip: 'Keep your rook on the 6th rank until the pawn advances, then go behind and check from the rear.',
  },
  {
    id: 'rook-up',
    title: 'Rook up: convert',
    blurb: 'Basic rook endgame. Push a pawn to promotion safely.',
    fen: '6k1/5pp1/7p/8/8/5P2/5KPP/3R4 w - - 0 1',
    user: 'w',
    goal: 'win',
    success: 'promote',
    maxMoves: 50,
    tip: 'Activate the king, cut off the enemy king with the rook, then create a passed pawn. Trade pawns, not rooks, if you can avoid it.',
  },
];
