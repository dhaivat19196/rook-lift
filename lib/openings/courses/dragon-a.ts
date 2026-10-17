// Sicilian Dragon, chapters 1-2. Black. Every move is checked by Stockfish in `npm run validate`.
import { avoid, chapter, opt, plan, win } from '../course.ts';

/** 1.e4 c5 ... 5...g6: the moves every Dragon starts with. Shared text keeps the ideas identical in every chapter. */
export const SETUP = `1.e4 {White takes the centre and opens lines for the queen and the f1-bishop.}
 c5 {The Sicilian. You fight for the centre from the side, with a pawn that White cannot easily trade for.}
 2.Nf3 {The most popular move. It attacks d4 and prepares d2-d4.}
 d6 {A flexible move: it guards e5, so e4-e5 is not a threat, and it prepares ...Nf6 and ...g6.}
 3.d4 {White opens the centre. He gives up a pawn for a lead in development.}
 cxd4 {Take. You swap your wing pawn for White's centre pawn, and you get a half-open c-file for your rooks.}
 4.Nxd4 {White recaptures and the knight stands in the centre.}
 Nf6 {Attack the e4 pawn and develop. White must react to the threat.}
 5.Nc3 {White defends e4 and develops a piece.}
 g6 {The Dragon. The bishop goes to g7 and aims along the long diagonal at White's queenside, and the pawns f7-g6-h7 look like the dragon's tail.}`;

export const ch1 = chapter({
  id: 'ideas',
  title: 'Ideas: why the Dragon works',
  blurb: 'The g7 bishop, the c-file, the ...d5 break and the exchange sacrifice on c3.',
  coach: `The Dragon is a sharp opening, and it is easy to feel lost in the first few games. Do not memorise first. Learn five ideas: the bishop on g7 is your best piece, the c-file belongs to your rooks, ...d5 breaks the centre, ...Ne5 and ...Nc4 hit White's bishop, and when it gets dangerous, a rook on c3 can wreck White's king. Everything else grows from these.`,
  tip: 'The g7-bishop and the c-file are yours. Strike with ...d5 when White castles long, and keep your own pieces coordinated.',
  src: `${SETUP}
 6.Be3 {White develops the bishop and prepares Qd2 and Bh6, the plan to trade your dragon bishop.}
 Bg7 {Your best piece. It eyes b2 and the whole long diagonal, and it guards the king.}
 7.f3 {White supports e4, prepares g4 and long castling. This is the Yugoslav Attack.}
 O-O {Castle. Your king is safe behind the g7 bishop, at least for now.}
 8.Qd2 {The queen lines up with the bishop on h6 to trade off your dragon bishop.}
 Nc6 {Pressure on d4. Every Dragon player wants to trade White's best centre knight.}
 9.Bc4 {The bishop eyes f7 and prepares Bb3 and long castling.}
 Bd7 {Your queenside needs development. The bishop clears the c8 square for the rook and protects the knight on c6.}
 10.O-O-O {White castles long, and both kings are on opposite sides. This is a race.}
 Rc8 {Your rook takes the c-file at once. You will play ...Ne5 and ...Nc4 and use the file to attack the white king.}
 11.Bb3 {The bishop steps out of the way, and White has a pin on the f7 pawn in the long term.}
 Ne5 {The knight lands on a monster square. It eyes c4 and d3, and White's king is about to be bothered.}
 12.h4 {White starts the pawn storm on the h-file.}
 h5 {Stop the pawn. It leaves a dark-square weakness on g5, but you will use it as a post for your knight.}
 13.Bg5 {White pins the knight and eyes e7 and f6.}
 Rc5 {A rook lift to c5 so the rook defends the knight on e5, from where it can also join the king's defence.}
 14.Kb1 {White moves the king out of the c-file, to be safe from knight tricks.}
 Re8 {Reposition the other rook. In the Dragon, rooks go to c8, c5 and e8, according to what White does.}
 (a6 {Black prepares ...b5.}
  15.Bh6 {The bishop trades off your bishop.})
 15.Bxf6 {White trades his bishop for your key defender on f6. @a g:g5f6}
 Bxf6 {Take back. The bishop pair is gone, but your g7 bishop has left the diagonal for f6.}
 16.g4 {Open the h-file. White attacks with all he has.}
 hxg4 {Take. The file opens for both sides.}
 17.f4 {White chases the knight. Your pieces must keep coordinated.}
 Nc4 {The knight jumps to c4 with threats on d2 and b2. @d In the Dragon every move is a race: hit the king first, or make sure that you are not too slow.}
`,
  plans: [
    plan('p1', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6', 'Why does the Dragon plan ...g6 and ...Bg7?', [
      opt('The bishop on g7 controls the long diagonal and protects the king', true, 'Yes. The g7 bishop is your best piece: it pressures the queenside and is the defensive wall in front of your king. This is why White always tries to trade it.'),
      opt('To protect the pawn on e5', false, 'There is no pawn on e5. Your pawn on d6 stops White’s e4-e5. The g7 bishop does a different job.'),
      opt('To prepare an attack on White’s king', false, 'You do not attack White’s king with the bishop on g7. The bishop pressures the queenside and defends your king.'),
    ], 'In the Dragon the g7 bishop is the heart of your position.'),
    plan('p2', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7 f3 O-O Qd2 Nc6 Bc4 Bd7 O-O-O', 'White has castled long. Where do you put your rook?', [
      opt('c8, on the half-open c-file', true, 'Yes. The c-file runs straight to White’s king on c1. Your rook there and your knight on e5 create threats against c2 and c3.', 'Rc8', 'g:a8c8'),
      opt('e8, behind the e-pawn', false, 'A rook on e8 does little yet: the open file is the c-file. Place your rook where it pressures the white king.'),
      opt('b8, ready for ...b5', false, 'The rook on b8 supports ...b5, but in this position the c-file is more urgent: the rook belongs on c8.'),
    ], 'Rooks go where the open files point at the enemy king.', { kind: 'square' }),
    plan('p3', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7 f3 O-O Qd2 Nc6 O-O-O', 'White has castled long right away, before Bc4. What is Black’s most important freeing move?', [
      opt('d5. Strike in the centre before White’s attack starts', true, 'Yes. ...d5 breaks the centre open, opens the diagonal for your bishop, and is the best reply to quick long castling.', 'd5', 'g:d6d5'),
      opt('h5, starting your own pawn storm', false, 'The h-pawn is a move too slow here. White’s pieces are better placed to attack, and ...d5 solves your problems much faster.'),
      opt('a6, to prepare ...b5', false, 'The queenside pawn storm is too slow while White’s pieces are aimed at your king. First open the centre.'),
    ], 'When White castles long fast, break with ...d5.', { kind: 'break' }),
    plan('p4', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7 f3 O-O Qd2 Nc6', 'What is White’s main idea with Bh6?', [
      opt('Trade your dragon bishop so your king loses its protector', true, 'Right. Once the g7 bishop is gone, the h-pawn and the queen have an open road to your king. You may take on h6, or often play ...Nxd4 first.'),
      opt('Pin the knight on f6', false, 'Bh6 does not pin anything: the bishop attacks your bishop on g7.'),
      opt('Win the pawn on h7', false, 'The pawn on h7 is not attacked by the bishop on h6; the bishop attacks g7.'),
    ], 'Know why White wants to trade your bishop, and you will know when to avoid it.'),
    plan('p5', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7 f3 O-O Qd2 Nc6 Bc4 Bd7 O-O-O Rc8 Bb3 Ne5 h4 h5 Bg5', 'The white bishop on g5 pins your knight. What is the most natural rook move?', [
      opt('Rc5. The rook defends the knight on e5 and swings across', true, 'Yes. The rook on c5 protects the knight and still keeps the c-file. The rook lift is a standard Dragon manoeuvre.', 'Rc5', 'g:c8c5'),
      opt('Rb8, away from the action', false, 'The rook on b8 leaves the c-file, and White’s Bxf6 followed by Nd5 becomes very dangerous.'),
      opt('Qa5, attacking the knight', false, 'The queen on a5 does not help: White’s Bxf6 Bxf6 Nd5 hits the queen with tempo. The rook lift is more useful.'),
    ], 'Use the rooks actively: lift one to c5 when it defends something important.', { kind: 'square' }),
    plan('p6', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7 f3 O-O Qd2 Nc6 O-O-O d5', 'White takes on d5. What is the idea behind your last move, ...d5?', [
      opt('It opens the centre while your pieces are ready, and it frees the g7 bishop', true, 'Yes. ...d5 gives the bishop on g7 the long diagonal and the knights lots of squares. When White takes, you recapture with the knight and keep everything protected.'),
      opt('It threatens to win a pawn on e4 by force', false, 'It attacks the e4 pawn, but White can simply take on d5. The real idea is to open the position favourably for you.'),
      opt('It prepares ...Qa5', false, 'The queen move is possible later, but the point of ...d5 is the centre.'),
    ], '...d5 is the freeing move of the Dragon.'),
  ],
  traps: [],
});

export const ch2 = chapter({
  id: 'open',
  title: 'The Open Sicilian: reaching the Dragon',
  blurb: 'Your first five moves, and what to do when White deviates at moves 3, 4 or 6.',
  coach: `You reach the Dragon after 1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 g6. At each step White can deviate, and we will cover the most common deviations. The moves are simple; the point is to know why you play each one and to recognise the sixth move White chooses: Be3, Be2, Bc4, f4, g3, or Bg5. Each one has its own chapter.`,
  tip: 'Keep to the Dragon set-up: ...d6, ...Nf6, ...g6, ...Bg7, ...O-O, and react to White’s sixth move.',
  src: `1.e4 {White takes the centre and opens lines for the queen and the f1-bishop.}
 c5 {The Sicilian. You fight for the centre from the side.}
 2.Nf3 {The most popular move. It attacks d4 and prepares d2-d4.}
 d6 {A flexible move: it guards e5 and prepares ...Nf6 and ...g6.}
 3.d4 {White opens the centre. He gives up a pawn for a lead in development.}
 cxd4 {Take. You swap your wing pawn for White's centre pawn.}
 4.Nxd4 {White recaptures and the knight stands in the centre.}
 Nf6 {Attack the e4 pawn and develop. White must react to the threat.}
 5.Nc3 {White defends e4 and develops a piece.}
 g6 {The Dragon. The bishop goes to g7 and aims along the long diagonal at White's queenside.}
 6.Be3 {The most popular move. White prepares Qd2, f3 and long castling.}
 Bg7 {Your best piece. It eyes b2 and the whole long diagonal.}
 (Nc6 {Another good move that develops with pressure on d4.}
  7.f3 {White supports e4.}
  Bg7 {Now the bishop comes out.}
  8.Qd2 {The queen lines up with the bishop on h6.}
  O-O {Castle: your king is safe for now.}
  9.O-O-O {White castles long.}
  d5 {The freeing break. @d Whatever White plays, the key points of your set-up are the g7 bishop, the c-file and the ...d5 break.})
 7.f3 {White supports e4 and prepares g4. This is the Yugoslav Attack.}
 O-O {Castle. Your king is safe for now.}
 (Nc6 {Another useful developing move.}
  8.Qd2 {The queen lines up with Bh6.}
  O-O {Castle: your king is safe for now.}
  9.Bc4 {The bishop eyes f7 and prepares Bb3.}
  Bd7 {Prepare the rook to c8.})
 8.Qd2 {The queen lines up with the bishop on h6 to trade off your dragon bishop.}
 Nc6 {Pressure on d4. This is the main line of the Yugoslav Attack.}
 9.Bc4 {The bishop eyes f7 and prepares Bb3 and long castling.}
 Bd7 {Your queenside needs development. The bishop clears c8 for the rook and protects the knight on c6.}
 10.O-O-O {White castles long, and both kings are on opposite sides. This is a race.}
 Rc8 {Your rook takes the c-file at once.}
 11.Bb3 {The bishop steps out of the way.}
 Ne5 {The knight lands on a monster square. It eyes c4 and d3.}
 12.h4 {White starts the pawn storm.}
 h5 {Stop the pawn.}`,
  plans: [
    plan('p1', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3', 'Why do we take on d4 with ...cxd4 at move three?', [
      opt('It trades your wing pawn for White’s centre pawn and gives you the half-open c-file', true, 'Yes. That is the heart of the Sicilian: you exchange a flank pawn for a central pawn, and the c-file becomes your highway.'),
      opt('It wins a pawn', false, 'White recaptures at once. The point is not material but structure: a half-open file for you.'),
      opt('It stops White from playing Nc3', false, 'White can still play Nc3. The point of the exchange is the c-file.'),
    ], 'In the Sicilian you give up a flank pawn for a centre pawn.'),
    plan('p2', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3', 'Why is ...g6 the Dragon move and ...a6 the Najdorf?', [
      opt('...g6 fianchettoes the bishop to g7, aiming at the queenside along the long diagonal', true, 'Right. The Dragon bishop is the key piece. The Najdorf ...a6 is a different, more complicated set-up, which we are not playing.'),
      opt('...g6 attacks the knight on d4', false, 'The pawn on g6 attacks h5 and f5, not d4. The bishop on g7 will put pressure on d4 later.'),
      opt('...g6 prepares ...e5', false, 'The pawn on g6 has nothing to do with ...e5. Your Dragon structure is about the diagonal.'),
    ], 'The Dragon is built around the bishop on g7.'),
    plan('p3', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7', 'White plays f3 and Qd2. What does that tell you about his plan?', [
      opt('He wants to castle long and attack your king with g4 and h4', true, 'Yes. This is the Yugoslav Attack, the most dangerous plan against the Dragon. It is a race, so plan your counter-play.'),
      opt('He wants to castle short', false, 'Long castling is the idea: the bishop on e3, the queen on d2 and the f3 pawn all support a pawn storm against your king.'),
      opt('He wants to avoid exchanges', false, 'On the contrary, White wants to trade off the bishop on g7 and open the h-file.'),
    ], 'When White plays f3 and Qd2, expect long castling and a pawn storm.'),
    plan('p4', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7 f3 O-O Qd2 Nc6 Bc4 Bd7', 'Why does Black play ...Bd7 here?', [
      opt('It develops, clears c8 for the rook and protects the knight on c6', true, 'Yes. The bishop on d7 supports the c6 knight and frees c8 for your rook, which is the right post.'),
      opt('To prepare ...Bxh3', false, 'There is no pawn on h3 and the bishop belongs on d7 for the reasons above.'),
      opt('To attack the bishop on c4', false, 'The bishop on d7 does not attack c4. It does a defensive job.'),
    ], 'Develop the pieces that support your plan: Bd7, Rc8, Ne5.'),
  ],
  traps: [],
});
