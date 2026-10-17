// Queen's Gambit Declined + anti-London, chapters 1-2: the main QGD set-up and the Exchange variation. Black.
import { chapter, opt, plan, win } from '../course.ts';

/** 1.d4 d5 2.c4 e6: shared text keeps the ideas identical in every chapter. */
export const QG = `1.d4 {White takes the centre with the queen’s pawn.}
 d5 {You take the centre too, and you share the fight for e4 and c4.}
 2.c4 {The Queen's Gambit. White offers a pawn to deflect your d-pawn from the centre. It is not a real gambit: if you take, you can't keep the pawn.}
 e6 {Decline the pawn and keep the centre solid. The d5 pawn is protected, and the bishop on f8 can come out.}`;

export const ch1 = chapter({
  id: 'qgd-main',
  title: 'Queen’s Gambit Declined: the main set-up',
  blurb: '...e6, ...Nf6, ...Be7, castle, ...Nbd7, ...c6 and then ...dxc4 and ...e5 to free your game.',
  coach: `The QGD is the sturdiest answer to 1.d4. You support your d5 pawn with ...e6, develop with ...Nf6, ...Be7 and castle, and then you solve your one problem, the bishop on c8, by taking on c4 at the right moment and freeing the position with ...e5 or ...c5. Everything in this chapter is about those two ideas: solid first, then break.`,
  tip: 'Solid set-up (...e6, ...Nf6, ...Be7, ...O-O, ...Nbd7, ...c6), then take on c4 when White’s bishop commits, and free your game with ...e5 or ...c5.',
  src: `${QG}
 3.Nc3 {White develops and puts more pressure on d5.}
 Nf6 {Develop and attack the centre.}
 4.Bg5 {The classical pin. White develops the bishop with a threat on the knight.}
 (Nf3 {White develops first.}
  Be7 {Develop and prepare to castle.}
  5.Bf4 {The bishop comes out.}
  O-O {Castle: your king is safe.}
  6.e3 {Solid and sensible, it supports d4.}
  Nbd7 {Develop.}
  7.c5 {White grabs space on the queenside.}
  Nh5 {Challenge the bishop.})
 Be7 {Break the pin and prepare to castle.}
 5.e3 {Support d4 and open the f1 bishop.}
 O-O {Castle: your king is safe.}
 6.Nf3 {White develops the last piece on the kingside.}
 (Bd3 {White develops with a plan of Nge2.}
  Nbd7 {Develop.})
 Nbd7 {Develop the knight and prepare ...c6. It also protects the knight on f6 against the pin.}
 (h6 {Ask the bishop a question, and you may trade the knight.}
  7.Bh4 {Keep the pin.}
  Ne4 {The Lasker Defence: trade pieces to relieve the cramp.}
  8.Bxe7 {White trades.}
  Qxe7 {Recapture.}
  9.cxd5 {White takes.}
  Nxc3 {Trade the knight.}
  10.bxc3 {White recaptures.}
  exd5 {Recapture; now ...c5 is a good freeing move.}
  11.Qb3 {White hits d5 and b7.}
  Rd8 {Defend d5.}
  12.Bd3 {Develop.}
  c5 {Strike in the centre. Your position is fine and the bishop on c8 is free.})
 7.Rc1 {The rook comes to the open c-file.}
 c6 {Support the d5 pawn and prepare ...dxc4 and ...e5.}
 8.Bd3 {White develops the bishop and eyes h7.}
 dxc4 {Take: White’s bishop has to spend a tempo recapturing.}
 9.Bxc4 {The bishop recaptures.}
 Nd5 {Trade the pieces that are cramping you.}
 10.Bxe7 {White trades.}
 Qxe7 {Recapture with the queen.}
 11.O-O {White castles.}
 Nxc3 {Trade a second pair.}
 12.Rxc3 {Recapture with the rook.}
 e5 {The freeing move. Your pieces are active and the centre is open.}
 13.Qc2 {White supports the rook and eyes e4.}
 exd4 {Take, and open the position.}
 14.exd4 {White recaptures.}
 Nb6 {The knight attacks the bishop and heads for d5. @d In the QGD: ...e6, ...Nf6, ...Be7, ...O-O, ...Nbd7, ...c6; take on c4 when the bishop commits; free your game with ...e5.}`,
  plans: [
    plan('p1', 'd4 d5 c4', 'White plays the Queen’s Gambit with 2.c4. Why is ...e6 a good reply?', [
      opt('It protects d5 and keeps a solid centre', true, 'Yes. The pawn on e6 defends d5 and leaves the bishop on f8 free to come out. This is the heart of the QGD.', 'e6', 'g:e7e6'),
      opt('It grabs the c4 pawn', false, 'The pawn on e6 does not take anything. You decline the gambit.'),
      opt('It prepares ...e5 at once', false, 'The pawn on e6 can later go to e5, but the main idea is to support d5.'),
    ], 'Decline the gambit with ...e6 and keep your centre.'),
    plan('p2', 'd4 d5 c4 e6 Nc3 Nf6 Bg5 Be7 e3 O-O Nf3', 'White has castled his pieces out. Where does the b8 knight go?', [
      opt('d7. It protects f6 and prepares ...c6', true, 'Yes. The knight on d7 guards the knight against the pin and clears the way for ...c6 and ...e5.', 'Nbd7', 'g:b8d7'),
      opt('c6, blocking the pawn', false, 'The knight on c6 blocks your pawn and does not cover f6. Nbd7 first.'),
      opt('a6, preparing b5', false, 'The pawn move is too slow. Develop first.'),
    ], 'Develop the b8 knight to d7 in the QGD.', { kind: 'square' }),
    plan('p3', 'd4 d5 c4 e6 Nc3 Nf6 Bg5 Be7 e3 O-O Nf3 Nbd7 Rc1 c6 Bd3', 'White’s bishop has come to d3. What is the thematic reply?', [
      opt('dxc4. White’s bishop has to spend a tempo recapturing', true, 'Yes. When White’s bishop is on d3, taking on c4 gains a tempo, because the bishop has to go back to c4. Then you free your game with ...Nd5 and ...e5.', 'dxc4', 'g:d5c4'),
      opt('Ne4, trading the bishop', false, 'It is playable but a move too early: dxc4 first is cleaner.'),
      opt('h6, asking the bishop', false, 'The bishop will happily retreat to h4. ...dxc4 is more purposeful.'),
    ], 'Take on c4 when White has committed his bishop to d3.', { kind: 'break' }),
    plan('p4', 'd4 d5 c4 e6 Nc3 Nf6 Bg5 Be7 e3 O-O Nf3 Nbd7 Rc1 c6 Bd3 dxc4 Bxc4 Nd5 Bxe7 Qxe7 O-O Nxc3 Rxc3', 'You are almost free. Which pawn move solves your last problem?', [
      opt('e5. Fight for the centre and free the pieces', true, 'Yes. The pawn on e5 opens your bishop on c8 and puts pressure on d4. This is the freeing break.', 'e5', 'g:e6e5'),
      opt('c5, striking at d4', false, 'It is also thematic, but the pawn on c6 is solid and the e5 break is more accurate.'),
      opt('b6, preparing Bb7', false, 'It solves the bishop problem in a slower way. ...e5 is more direct.'),
    ], 'Free your game with the central break.', { kind: 'break' }),
    plan('p5', 'd4 d5 c4 e6 Nc3 Nf6 Bg5 Be7 e3 O-O Nf3 h6 Bh4', 'White keeps the pin with Bh4. What is the simplest equalising idea?', [
      opt('Ne4. Trade the bishops and the knight, to relieve the cramp', true, 'Yes. The Lasker Defence: after Bxe7 Qxe7 cxd5 Nxc3 bxc3 exd5 you have an easy position.', 'Ne4', 'g:f6e4'),
      opt('g5, attacking the bishop', false, 'The pawn on g5 weakens your king too much. Trade pieces instead.'),
      opt('Be6, defending d5', false, 'It loses time and White gets the initiative with cxd5. ...Ne4 is better.'),
    ], 'When you are cramped, trade pieces.'),
  ],
  traps: [
    win('w1', 'The Elephant Trap', 'b', 'd4 d5 c4 e6 Nc3 Nf6 Bg5 Nbd7 cxd5 exd5 Nxd5', 'Nxd5', 'Bxd8 Bb4+ Qd2 Bxd2+ Kxd2 Kxd8', 'White grabbed a pawn on d5 and your knight takes his. If he takes the queen on d8, you check with the bishop, win his queen and recapture on d8. You end a piece up.', 'When a piece looks free, check what happens after the queen trade.', 'g:f6d5'),
  ],
});

export const ch2 = chapter({
  id: 'exchange',
  title: 'Exchange Variation: 4.cxd5',
  blurb: 'White trades on d5. Play for ...c6, ...Re8, and the Nbd7-f8 manoeuvre.',
  coach: `In the Exchange Variation, White takes on d5 and the pawn structure becomes fixed: White has a pawn on e3, and you have one on e6 and then d5. White’s plan is the minority attack (b4-b5). Your plan is simple: play ...c6, keep your pieces safe, put a rook on e8 and re-route the d7 knight to f8, where it protects h7 and heads for e6 or g6. Do not rush: this is a slow, strategic game.`,
  tip: 'Against the Exchange, play ...c6, ...Nbd7, ...Re8 and ...Nf8. Meet the minority attack with ...a5 or ...Nf8-e6 and counter-play in the centre.',
  src: `${QG}
 3.Nc3 {White develops and puts more pressure on d5.}
 Nf6 {Develop.}
 4.cxd5 {The Exchange Variation. White fixes the pawn structure.}
 exd5 {Recapture with the pawn. The e-file is half open for you, and your bishop on c8 is free.}
 5.Bg5 {The pin, as usual.}
 (Nf3 {A calmer way to develop.}
  c6 {Support d5 and prepare the bishop’s route.}
  6.Bf4 {The bishop comes out.}
  Bd6 {Challenge it.}
  7.Bxd6 {White trades.}
  Qxd6 {Recapture with the queen.}
  8.e3 {Solid and sensible, it supports d4.})
 Be7 {Break the pin and prepare to castle.}
 6.e3 {Support d4.}
 O-O {Castle: your king is safe.}
 7.Bd3 {The bishop eyes h7 and the kingside.}
 Nbd7 {Develop and protect the knight on f6.}
 8.Qc2 {White prepares to castle long or short and eyes h7.}
 c6 {Support d5 and give the queen a square.}
 9.Nge2 {White plans f3 and the minority attack.}
 Re8 {Take the open file and prepare ...Nf8.}
 10.O-O {White castles.}
 Nf8 {The knight reroutes to f8, where it defends h7 and heads to e6 or g6.}
 11.f3 {White prepares e4.}
 (Rab1 {The minority attack: b4-b5.}
  a5 {Stop the attack: the pawn on a5 prevents b4.}
  Rbe1 {White regroups.}
  Nh5 {Challenge the bishop.}
  13.Bxe7 {White trades.}
  Qxe7 {Recapture.})
 g6 {Make room for the bishop and keep the king safe.}
 12.Bh4 {The bishop keeps the pin.}
 Ne6 {The knight heads for the centre and blocks the e-file.}
 13.Bf2 {Retreat. @d Against the Exchange, put your pieces on f8, e6 and e8, and be ready for a central break with ...c5 or ...f6 when the moment comes.}`,
  plans: [
    plan('p1', 'd4 d5 c4 e6 Nc3 Nf6 cxd5 exd5 Bg5 Be7 e3 O-O Bd3 Nbd7 Qc2', 'White plays Qc2. Which pawn move supports d5 and gives you a plan?', [
      opt('c6. Support d5 and prepare ...Re8 and ...Nf8', true, 'Yes. The pawn on c6 supports d5, and the c8-bishop has the diagonal.', 'c6', 'g:c7c6'),
      opt('Re8, taking the file', false, 'It is useful, but ...c6 comes first, because the pawn on d5 needs support.'),
      opt('c5, breaking at once', false, 'The pawn on c5 would be loose; White’s bishop on g5 and knight on c3 are well placed.'),
    ], 'Solid structure first: ...c6 supports d5.'),
    plan('p2', 'd4 d5 c4 e6 Nc3 Nf6 cxd5 exd5 Bg5 Be7 e3 O-O Bd3 Nbd7 Qc2 c6 Nge2 Re8 O-O', 'What is the standard re-routing of the knight on d7?', [
      opt('Nf8, then ...Ne6 or ...Ng6', true, 'Right. On f8 the knight defends h7 and prepares to land on e6 or g6, where it is a great defender.', 'Nf8', 'g:d7f8'),
      opt('Nb6, then ...Ne4', false, 'The knight on b6 does not do much and can be hit by a pawn. f8 is better.'),
      opt('Nh5, attacking the bishop', false, 'The knight on h5 is exposed to Bxe7 and Bxh7+ ideas.'),
    ], 'Re-route the knight to f8, then e6.', { kind: 'square' }),
    plan('p3', 'd4 d5 c4 e6 Nc3 Nf6 cxd5 exd5 Bg5 Be7 e3 O-O Bd3 Nbd7 Qc2 c6 Nge2 Re8 O-O Nf8 Rab1', 'White starts the minority attack with Rab1. How do you react?', [
      opt('a5. Stop b4 and slow the attack down', true, 'Yes. After ...a5 White’s b4 push is not possible without giving you the b4 or c4 squares. You are in good shape.', 'a5', 'g:a7a5'),
      opt('Ignore it and play ...g6', false, 'It is also playable, but the minority attack gets going with b4 and b5. ...a5 is more precise.'),
      opt('b5, rushing to the queenside', false, 'The pawn on b5 gets hit by Nxb5 and you lose a pawn. Be careful.'),
    ], 'Meet the minority attack with ...a5 or a counter-attack in the centre.'),
    plan('p4', 'd4 d5 c4 e6 Nc3 Nf6 cxd5 exd5', 'What is the structure White is aiming for after 4.cxd5 exd5?', [
      opt('The minority attack: b4-b5 against your c6 pawn', true, 'Yes. White has two pawns on the queenside (a and b) against your three, and wants to push b4-b5 to create a weakness on c6.'),
      opt('A kingside pawn storm', false, 'White could do that, but the standard plan is the minority attack on the queenside.'),
      opt('A central pawn roller with e4', false, 'White can play e4, but that is rarely strong. The minority attack is the thematic plan.'),
    ], 'Know the pawn structure, and you will know the plan.'),
  ],
  traps: [],
});
