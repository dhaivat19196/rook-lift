// Sicilian Dragon, chapters 5-6: the Classical 6.Be2 and 6.Be3 without f3, then 6.f4, 6.Bc4, 6.g3, 6.Bg5 and 6.f3.
import { chapter, opt, plan } from '../course.ts';
import { SETUP } from './dragon-a.ts';

export const ch5 = chapter({
  id: 'classical',
  title: 'Classical Dragon: 6.Be2 and 6.Be3 without f3',
  blurb: 'White develops quietly. You castle, develop and wait for ...d5 or ...Be6.',
  coach: `When White does not go for the Yugoslav attack, your life is easier. There is no pawn storm coming, so you can castle, develop with ...Nc6 and ...Be6, and use the c-file and the long diagonal calmly. Your plan is simple: get castled, put the bishop on e6 or d7, bring the queen to c8 or a5, and look for ...d5.`,
  tip: 'Without the f3 and Qd2 attack, castle, develop with ...Nc6, ...Be6 and ...Qc8, and look for ...d5 to equalise.',
  src: `${SETUP}
 6.Be2 {The Classical set-up. White develops simply and keeps the option of castling short.}
 Bg7 {Your best piece comes out at once.}
 (Nc6 {Another good move that develops with pressure on d4.}
  7.Be3 {White supports d4.}
  Bg7 {Now the bishop comes out.}
  8.O-O {White castles short.}
  O-O {You castle too.})
 7.Be3 {White supports d4 and prepares Qd2.}
 (O-O {White castles first and keeps Be3 for later.}
  O-O {Castle too.}
  8.Nb3 {White steps away from the pin along the diagonal.}
  Nc6 {Pressure on d4 and the centre.}
  9.Be3 {Now the bishop supports the knight on b3.}
  Be6 {Develop with pressure on b3 and c4.})
 Nc6 {Pressure on d4.}
 8.O-O {White castles short.}
 O-O {You castle too. Both kings are safe, and the game is about the centre.}
 9.Nb3 {White steps away from the pin and prepares f4 and the bishop on f3.}
 (Qd2 {White lines up the queen with the bishop on e3.}
  d5 {Strike in the centre before he is ready.}
  10.exd5 {White takes.}
  Nxd5 {Recapture with the knight, which centralises.}
  11.Nxd5 {White trades knights.}
  Nxd4 {Take the knight that pressures you. The queen on d5 is protected.}
  12.Bxd4 {Recapture with the bishop.}
  Qxd5 {Recapture with the queen. It eyes a2 and g2, and White cannot take on g7 yet.}
  13.Rfd1 {White attacks the queen.}
  Rd8 {Hit back along the d-file.}
  14.c3 {Support the bishop on d4.}
  Bxd4 {Trade the bishops.}
  15.cxd4 {Recapture. The position is level and you have no problems.})
 Be6 {Develop the bishop with pressure on c4 and b3.}
 10.f4 {White grabs space in the centre and prepares f5.}
 Qc8 {The queen eyes h3 and c4 and clears d8 for a rook.}
 11.Kh1 {White steps off the g1-a7 diagonal.}
 Bg4 {Hit the bishop on e2, which defends so much of White's centre.}
 12.a4 {White starts to expand on the queenside.}
 b6 {Give the bishop a safe route and keep control of the long diagonal.}
 13.Bg1 {The bishop retreats to a safe square, and White has a normal position. @d In the Classical lines, develop with ...Nc6, ...Be6 and ...Qc8, and look for the central break ...d5.}`,
  plans: [
    plan('p1', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be2 Bg7 Be3 Nc6 O-O O-O Nb3', 'The white knight has retreated to b3. What is your most natural developing move?', [
      opt('Be6. The bishop eyes the knight on b3 and the c4 square', true, 'Yes. The bishop on e6 is active, hits the knight on b3 and prepares ...Qc8 or ...Rc8.', 'Be6', 'g:c8e6'),
      opt('Nd7, to prepare ...Ne5', false, 'It is passive, and the knight on f6 is useful to hit e4. Develop the bishop first.'),
      opt('a6, to prepare ...b5', false, 'The pawn move is too slow while your bishop is still on c8. Develop the bishop first.'),
    ], 'Develop the last minor piece to its best square before starting pawn moves.', { kind: 'square' }),
    plan('p2', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be2 Bg7 Be3 Nc6 O-O O-O Nb3 Be6 f4', 'White gains space with f4. Where does the queen belong?', [
      opt('c8. It eyes h3 and c4 and connects with the bishop on e6', true, 'Right. The queen on c8 helps against Nd4 or f5, eyes c4 and h3, and leaves d8 for a rook.', 'Qc8', 'g:d8c8'),
      opt('a5, going for the e1 square', false, 'The queen on a5 is exposed to Nb3 and Bd2. It is better on c8 here.'),
      opt('d7, to defend the bishop', false, 'The queen on d7 gets in the way of the rooks and the knight on c6. c8 is more flexible.'),
    ], 'Find the queen a square where it eyes useful diagonals and does not block your rooks.', { kind: 'square' }),
    plan('p3', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be2 Bg7 Be3 Nc6 O-O O-O Qd2', 'White puts the queen on d2 instead of Nb3. What is Black’s freeing move?', [
      opt('d5. Strike at once before White consolidates', true, 'Yes. After exd5 Nxd5 the position opens and your pieces are active. The queen on d2 is on a slightly awkward square.', 'd5', 'g:d6d5'),
      opt('Bd7, a slow developing move', false, 'It is fine, but allows f3 and Rad1, and White takes control of the centre. ...d5 is better.'),
      opt('Nxd4, trading the knight', false, 'It is playable, but you spend a tempo; ...d5 is more accurate.'),
    ], 'In the Classical Dragon, ...d5 is the standard way to equalise.', { kind: 'break' }),
    plan('p4', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be2 Bg7', 'White has played quiet moves. How does that change your plans compared with the Yugoslav?', [
      opt('There is no attack coming, so you can develop calmly and aim for ...d5 or ...Be6', true, 'Right. Without f3 and Qd2, your king is not in danger. The game is a normal fight for the centre.'),
      opt('You must attack at once with ...h5', false, 'The h-pawn attack is for the Yugoslav, where White wants to castle long. Here ...h5 just weakens your king.'),
      opt('You should trade your dragon bishop', false, 'The g7 bishop is your best piece. Do not trade it.'),
    ], 'Know which plan matches White’s set-up before you move.'),
  ],
  traps: [],
});

export const ch6 = chapter({
  id: 'sidelines',
  title: 'Other sixth moves: 6.Bc4, 6.f4, 6.g3, 6.Bg5 and 6.f3',
  blurb: 'Five less common set-ups. Each has a clear answer, and one comes with a pretty trick.',
  coach: `Not everyone plays the Yugoslav. At the club you will also meet 6.Bc4 (the Sozin), 6.f4, 6.g3, 6.Bg5 and 6.f3. They all have simple answers, and in two of them Black has a strong tactical reply that White often misses. Learn the sixth move and the one idea that goes with it.`,
  tip: 'Against 6.Bc4 and 7.Be3, play ...Ng4! Against 6.f4, ...Nc6. Against 6.g3, trade on c6 and play ...Bg7. Against 6.Bg5, ...Bg7 and ...h6.',
  src: `${SETUP}
 6.Bc4 {The Sozin attack: White eyes f7 and prepares Be3, Qd2 and long castling.}
 (f4 {White goes for space. It prepares e5, but it also weakens e4 and the king.}
  Nc6 {Strike at the knight on d4 at once.}
  7.Be2 {A quiet reply.}
  (Nxc6 {White trades the knight first.}
   bxc6 {Recapture with the pawn. Your pawn centre is fine.}
   8.e5 {White pushes and attacks your knight.}
   Nd7 {The knight retreats to d7 and attacks the pawn on e5.}
   9.Qf3 {Defend e5 and prepare to attack.}
   d5 {Take space in the centre and release the pressure.})
  Bg7 {The bishop comes out.}
  8.Be3 {Develop.}
  O-O {Castle: your king is safe.}
  9.O-O {White castles too.})
 (g3 {White fianchettoes the bishop.}
  Nc6 {Pressure on d4.}
  7.Nxc6 {White trades the knight first.}
  bxc6 {Recapture with the pawn. The b-file opens for your rook.}
  8.Bg2 {Develop.}
  Qc7 {The queen protects the c6 pawn and eyes the c-file.}
  9.b3 {Prepare Bb2 and the long diagonal.}
  Bg7 {The bishop comes out.}
  10.Bb2 {The bishop eyes your centre.}
  O-O {Castle: your king is safe.}
  11.O-O {White castles too.}
  e5 {Strike in the centre. Your pawn structure is strong and your pieces are active.})
 (Bg5 {White pins the knight on f6.}
  Bg7 {The bishop comes out.}
  7.Qd2 {The queen connects with the bishop on g5.}
  h6 {Challenge the bishop at once.}
  8.Bh4 {Keep the pin.}
  Nc6 {Develop with pressure on d4.}
  9.Nb3 {Avoid the trade of knights.})
 (f3 {White heads for the Yugoslav.}
  Bg7 {The bishop comes out.}
  7.Be3 {Develop.}
  O-O {Castle: your king is safe.}
  8.Qd2 {The Yugoslav set-up. You know this one.}
  Nc6 {Pressure on d4.})
 Bg7 {The bishop comes out as usual.}
 7.Be3 {White supports d4 and prepares Qd2, f3 and long castling.}
 (Bb3 {White retreats the bishop to avoid exchanges.}
  Nc6 {Pressure on d4.}
  8.Nxc6 {White trades first.}
  bxc6 {Recapture with the pawn.}
  9.O-O {Castle short.}
  O-O {Castle too.})
 Ng4 {The key move. The knight attacks the bishop on e3, and the bishop on c4 and the pawn on f7 are suddenly loose.}
 8.Bb5+ {White gives a check to gain a tempo before he moves the bishop.}
 (Qd2 {White defends the bishop with the queen.}
  Nxe3 {Take the bishop. You get the bishop pair.}
  9.Qxe3 {Recapture.}
  Nc6 {Develop with pressure on d4.}
  10.Nf3 {White develops.}
  O-O {Castle: your king is safe and you stand slightly better.}
  11.h3 {Give the king a flight square.}
  a6 {Stop Bb5 and prepare ...b5.})
 (Bxf7+? {A greedy sacrifice that does not work.}
  Kxf7 {The king takes the bishop. White has lost a piece for a pawn.}
  9.Nd5 {White hopes for a quick attack on the king.}
  Nc6 {Develop with tempo on the knight on d4. Your extra piece will decide the game.})
 Kf8 {The only good move. The king is safe on f8 because the bishop on g7 covers it, and ...Be5 is coming.}
 9.O-O {White castles.}
 Be5 {The bishop eyes the knight on c3 and the rook on a1.}
 10.Nd5 {The knight jumps into the middle, supported by the bishop on b5.}
 Bxh2+ {Take the pawn with check: it was loose, and the king must step aside.}
 11.Kh1 {The king steps aside.}
 Be5 {Return to the long diagonal. You are a pawn up. @d Against the Sozin Dragon, ...Ng4! is the answer when the bishop comes to e3.}`,
  plans: [
    plan('p1', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Bc4 Bg7 Be3', 'White’s bishop is on c4 and the other on e3. What is the strong reply?', [
      opt('Ng4. Attack the bishop on e3 and open a tactical fight', true, 'Yes. The knight hits the bishop on e3 and a pawn trade follows. Bb5+ is the main reply and ...Kf8 is safe.', 'Ng4', 'g:f6g4'),
      opt('O-O, the natural castle', false, 'It is playable, but after f3 Nc6 Qd2 you have fallen into a very dangerous Yugoslav attack with Bc4 already in. ...Ng4 is much better.', 'O-O'),
      opt('Nc6, developing', false, 'It is fine but leaves White with a free hand: Bb3 and f3 are coming. Strike first with ...Ng4.'),
    ], 'Against the Sozin, the knight jump ...Ng4 is the key idea.'),
    plan('p2', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Bc4 Bg7 Be3 Ng4 Bb5+', 'White checks on b5. How do you answer?', [
      opt('Kf8. The king is safe there and the bishop on g7 will cover it', true, 'Yes. The bishop on g7 guards the king and your knight is safe. The next move is ...Be5, and Black stands well.', 'Kf8', 'g:e8f8'),
      opt('Bd7, blocking the check', false, 'It loses at once to Qxg4: the knight on g4 is not protected and the bishop on d7 is pinned.', 'Bd7'),
      opt('Nc6, blocking with the knight', false, 'After Nxc6 bxc6 Bxc6+ White wins a pawn with check. Kf8 is the only move.', 'Nc6'),
    ], 'Know the only move in the Sozin check: ...Kf8.'),
    plan('p3', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 f4', 'White plays f4 on move six. What is the clearest reply?', [
      opt('Nc6. Hit the knight on d4 immediately', true, 'Yes. The knight on c6 attacks d4, and after Nxc6 bxc6 e5 Nd7 you are fine.'),
      opt('Bg7, as always', false, 'It is not wrong, but ...Nc6 first is more accurate: White’s next move may be Nf3 and e5.'),
      opt('e5, grabbing space', false, 'The pawn on e5 undermines your own d6 pawn, and the knight on d4 is not hit.'),
    ], 'Against f4, hit the central knight at once.'),
    plan('p4', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 g3 Nc6 Nxc6', 'White offers a trade of knights on c6. How do you recapture?', [
      opt('bxc6. The pawn recapture opens the b-file', true, 'Yes. The pawn recapture gives you the half-open b-file and a solid pawn centre.', 'bxc6'),
      opt('Qb6, hitting the knight', false, 'Qb6 loses a piece after Ndb5 or Nd4, since the other knight is hanging. Recapture first.', 'Qb6'),
      opt('Nxe4, a pawn grab', false, 'The pawn on e4 is protected, and your own knight on c6 is attacked. Recapture first.'),
    ], 'When a knight on c6 is traded, take back with the pawn if it opens a file you want.'),
    plan('p5', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Bg5 Bg7 Qd2', 'White pins the knight with Bg5 and brings the queen out. What is a useful move?', [
      opt('h6. Ask the bishop a question', true, 'Yes. After Bh4 Nc6 your position is comfortable, and the bishop has to decide.', 'h6'),
      opt('Nxe4, grabbing a pawn', false, 'Nxe4 Nxe4 loses a piece because the queen on d2 attacks the bishop on g5. Look at what is pinned.'),
      opt('O-O, castling straight away', false, 'It is playable, but you are leaving the pinned knight alone. ...h6 comes with tempo.'),
    ], 'When a bishop pins your knight, ask it a question with a pawn.'),
  ],
  traps: [],
});
