// Caro-Kann, chapters 1-3: ideas, the Advance, the Classical. Black. Every move is checked by Stockfish in `npm run validate`.
import { chapter, opt, plan } from '../course.ts';

/** 1.e4 c6 2.d4 d5: shared text keeps the ideas identical in every chapter. */
export const PRE = `1.e4 {White takes the centre and opens lines for the queen and the f1-bishop.}
 c6 {The Caro-Kann. You prepare ...d5 with a solid pawn, and, unlike in the French, your light-squared bishop will not be locked in.}
 2.d4 {White builds a big pawn centre.}
 d5 {Now you challenge the centre, and your c6 pawn supports it.}`;

export const ch1 = chapter({
  id: 'ideas',
  title: 'Ideas: why the Caro-Kann is solid',
  blurb: 'The pawn structure, the bishop that gets out first, the ...c5 break and why endgames suit you.',
  coach: `The Caro-Kann is one of the easiest openings to play well. You build a solid pawn chain with ...c6 and ...d5, then you develop your light-squared bishop BEFORE you play ...e6. That one idea solves the old problem of the French Defence. After that you castle, develop calmly and strike with ...c5 or ...e5 when the time is right. Many Caro-Kann games reach good endgames, and that is where improving players score points, so this is a great opening for you.`,
  tip: 'Bishop out before ...e6, then castle, and strike with ...c5 or ...e5 once your pieces are developed.',
  src: `${PRE}
 3.Nc3 {White defends e4 and develops a piece. This is the Classical Caro-Kann.}
 dxe4 {Take. You give up the centre pawn in exchange for a solid structure and the freedom to develop the bishop.}
 4.Nxe4 {White recaptures and the knight is in the centre.}
 Bf5 {The key move. The bishop comes out before ...e6, which is why the Caro-Kann is such a solid opening.}
 5.Ng3 {The knight attacks the bishop.}
 Bg6 {The bishop retreats to a safe diagonal where it still looks at c2.}
 6.Bc4 {White aims at the e6 square and prepares Nf3.}
 e6 {Close the diagonal. The bishop on g6 is not locked in, and your pawn chain is healthy.}
 7.Nf3 {Develop.}
 Nd7 {Develop and prepare ...Ngf6.}
 8.O-O {Castle: your king is safe.}
 Ngf6 {The last knight comes out and your structure is rock solid.}
 9.Re1 {The rook comes to the e-file.}
 Be7 {Develop and prepare to castle.}
 10.Nh4 {White goes for the bishop pair.}
 O-O {Castle: your king is safe and your pieces are developed. @d In the Caro-Kann, develop sensibly, castle and strike with ...c5 or ...e5 once your pieces are out.}`,
  plans: [
    plan('p1', 'e4 c6 d4 d5 Nc3 dxe4 Nxe4', 'Why is the move ...Bf5 so important in the Caro-Kann?', [
      opt('The bishop gets out before ...e6 locks it in', true, 'Yes. In the French the light-squared bishop is stuck behind the e6 pawn. In the Caro-Kann you develop it first, then play ...e6.', 'Bf5', 'g:c8f5'),
      opt('It attacks the knight on e4 and wins it', false, 'The knight on e4 can simply retreat. The bishop does not win material. The point is development.'),
      opt('It prevents White from castling', false, 'The bishop does not stop castling. It is simply a good developing move.'),
    ], 'Develop the light-squared bishop first, then play ...e6.'),
    plan('p2', 'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Ng3', 'The knight attacks your bishop. Where does it go?', [
      opt('g6. It stays on the diagonal and out of reach', true, 'Yes. On g6 the bishop is safe, still eyes the white pawns and can be traded on d3 if White wants.', 'Bg6', 'g:f5g6'),
      opt('e6, hiding behind the pawn', false, 'The bishop on e6 blocks your own e-pawn, and White gets a free hand with Ne5 and Bc4.', 'Be6'),
      opt('c8, going back', false, 'You lose all your development time. Bg6 keeps the bishop active.', 'Bc8'),
    ], 'Keep the bishop outside the pawn chain and on a safe diagonal.', { kind: 'square' }),
    plan('p3', 'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Ng3 Bg6 Bc4', 'White eyes the e6 square. What is the most solid reply?', [
      opt('e6. Close the diagonal and build the chain', true, 'Yes. The pawn on e6 blocks the bishop on c4 and supports the pawn on d5 later. Your bishop on g6 stays outside the chain.', 'e6'),
      opt('Nf6, developing', false, 'It is also playable, but ...e6 comes first for safety: you remove White’s most dangerous idea.'),
      opt('e5, grabbing space', false, 'The pawn on e5 can be taken: dxe5 and the d-file opens for White. Stay solid.'),
    ], 'In the Caro-Kann, stay solid first: play ...e6 once the bishop is out.'),
    plan('p4', 'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Ng3 Bg6 Bc4 e6 Nf3 Nd7 O-O Ngf6 Re1 Be7 Nh4 O-O', 'You have a solid, developed position. What is the long-term plan?', [
      opt('...c5 or ...e5, striking at the centre at the right moment', true, 'Yes. The classic Caro-Kann break is ...c5, or ...e5 if your pieces are ready. Until then, you improve your pieces and wait.'),
      opt('...f5, starting a kingside attack', false, 'The pawn on f5 weakens your king and the diagonal a2-g8. Caro-Kann plans are central, not kingside.'),
      opt('...a5 and ...b5, a queenside pawn storm', false, 'The queenside storm is not the Caro-Kann plan. The centre is where you strike.'),
    ], 'Plan: improve your pieces, then strike with ...c5 or ...e5.', { kind: 'break' }),
    plan('p5', 'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5', 'Many Caro-Kann games end in an endgame. Why is that good news for you?', [
      opt('You rarely have weaknesses, so a calm endgame is easy to play and White has to find a plan', true, 'Right. A sound pawn structure means few tactics against you, and endgames reward patience and clear plans, which you can learn.'),
      opt('Because endgames are always drawn', false, 'Many are not drawn! But a solid structure gives you a safe path, with chances to outplay your opponent.'),
      opt('Because White always blunders in them', false, 'No guarantees. The good news is that you get a position without weaknesses.'),
    ], 'A solid structure turns the game into a long, safe fight, which suits the improving player.'),
  ],
  traps: [],
});

export const ch2 = chapter({
  id: 'advance',
  title: 'The Advance Variation: 3.e5',
  blurb: 'White grabs space. You develop the bishop, play ...e6 and attack the chain with ...c5.',
  coach: `When White pushes 3.e5 he gains space but closes the centre, and your bishop gets out to f5 at once. That is the point of the Caro-Kann: you play 3...Bf5 first, then ...e6 and ...c5 to break the chain at its base. Do not be afraid of the space. Your pieces are well placed, and the c5 break always puts pressure on d4.`,
  tip: 'Bishop to f5 before e6, then ...c5 to hit the base of the pawn chain. Keep your pieces active.',
  src: `${PRE}
 3.e5 {The Advance Variation. White grabs space and closes the centre.}
 Bf5 {The bishop gets out before ...e6 closes it in. This is the whole point of the Caro-Kann.}
 4.Nf3 {The most popular move. White develops and prepares Be2 and c3.}
 (Nc3 {White develops and prepares g4.}
  e6 {Support d5 and open the bishop's retreat.}
  5.g4 {White attacks the bishop.}
  Bg6 {The bishop retreats.}
  6.Nge2 {White develops.}
  c5 {Strike at the base of the pawn chain.}
  7.h4 {White continues the pawn storm.}
  cxd4 {Take the pawn and open the c-file.}
  8.Nxd4 {White recaptures.}
  h5 {Stop the h-pawn. Your bishop stays safe.}
  9.Bb5+ {White gives a check to gain time.}
  Nd7 {Block with the knight.})
 (h4 {White attacks the bishop with a pawn.}
  h5 {Stop the pawn. The bishop is now safe on f5.}
  5.c4 {White strikes at d5.}
  e6 {Support d5 and open the bishop.}
  6.Nc3 {Develop.}
  Ne7 {Prepare ...Nd7 and ...Ng6.}
  7.Nge2 {Develop.}
  Nd7 {Develop the other knight.}
  8.cxd5 {White opens the position.}
  Nxd5 {Recapture with the knight, which is well placed in the centre.}
  9.Ng3 {Hit the bishop.}
  Bg6 {The bishop retreats.}
  10.Be2 {Develop.}
  Qa5 {Develop the queen with pressure on c3 and e5.})
 (Bd3 {White offers a trade of the light bishops.}
  Bxd3 {Take the bishop.}
  5.Qxd3 {Recapture with the queen.}
  e6 {Solid and sensible.}
  6.Nf3 {Develop.}
  c5 {Strike at the pawn chain.}
  7.dxc5 {White takes the pawn.}
  Bxc5 {Recapture and develop.}
  8.c4 {Strike at d5.}
  Ne7 {Develop.})
 e6 {Support the pawn on d5 and prepare ...c5.}
 5.Be2 {Develop and prepare to castle.}
 c5 {Strike at the base of the pawn chain at once.}
 6.Be3 {Support d4.}
 cxd4 {Take, because d4 is attacked twice and you want to open the c-file.}
 7.Nxd4 {Recapture with the knight.}
 Ne7 {Develop the knight without blocking the bishop, and prepare ...Nbc6.}
 8.c4 {White takes space and attacks d5.}
 Nbc6 {Develop with pressure on d4.}
 9.Qa4 {White attacks the knight on c6 and prepares to trade.}
 dxc4 {Take: this gives your knight the d5 square. @d Against the Advance, play ...Bf5, ...e6 and ...c5. Do not be afraid of the space.}`,
  plans: [
    plan('p1', 'e4 c6 d4 d5 e5', 'White has pushed the pawn to e5. What is the best way to develop?', [
      opt('Bf5. Get the bishop out before closing it in with ...e6', true, 'Yes. The pawn on e5 means White cannot easily harass the bishop on f5, and ...e6 comes next.', 'Bf5', 'g:c8f5'),
      opt('e6, supporting d5 first', false, 'It locks your light-squared bishop behind the pawn. That is the French Defence problem the Caro-Kann avoids.'),
      opt('c5, striking at once', false, 'It is playable, but ...Bf5 first is more accurate and costs nothing.'),
    ], 'Against the Advance, the bishop goes out first.'),
    plan('p2', 'e4 c6 d4 d5 e5 Bf5 Nf3 e6 Be2', 'White has built a space advantage. What is the main plan?', [
      opt('...c5, attacking the base of the pawn chain on d4', true, 'Yes. In the Advance the base of White’s chain is d4, and ...c5 attacks it. Your bishop on f5 supports the break.', 'c5', 'g:c6c5'),
      opt('...Nd7 and ...f6 to attack e5', false, 'It is also a plan, but ...c5 is the main idea. Attack the chain at its base first.'),
      opt('...Bg6 and ...Nd7, waiting', false, 'Waiting lets White consolidate his space. The c5 break is the main active plan.'),
    ], 'Attack a pawn chain at its base: ...c5 hits d4.', { kind: 'break' }),
    plan('p3', 'e4 c6 d4 d5 e5 Bf5 Nf3 e6 Be2 c5 Be3', 'Black has played ...c5 and White supports d4. How do you proceed?', [
      opt('cxd4 followed by Nxd4 Ne7: develop with pressure', true, 'Yes. Open the c-file and bring the knight to e7, where it does not block your bishop. You have equal chances.', 'cxd4', 'g:c5d4'),
      opt('Nc6, adding a second attacker', false, 'It is fine, but ...cxd4 first keeps things simple. Exchange pawns before developing the knight.'),
      opt('Qb6, going after b2', false, 'The queen on b6 is a good idea, but it needs preparation. Here ...cxd4 comes first.'),
    ], 'Exchange pawns on d4 to open lines for your pieces.'),
    plan('p4', 'e4 c6 d4 d5 e5 Bf5 h4', 'White threatens h5 and g4 to trap your bishop. What do you do?', [
      opt('h5. Stop the pawn: the bishop has a safe diagonal', true, 'Right. ...h5 stops h4-h5 and g4. The bishop on f5 is safe, and you will play ...e6.', 'h5'),
      opt('h6, making luft', false, 'After g4 Bg6 h5 the bishop is trapped. ...h5 is a necessary stopper.'),
      opt('e6, ignoring the threat', false, 'After g4 Bg6 h5 the bishop is trapped. Stop the pawn first with ...h5.'),
    ], 'When a pawn storm threatens your bishop, stop the pawn before it advances.'),
    plan('p5', 'e4 c6 d4 d5 e5 Bf5 Nc3 e6 g4', 'The pawn on g4 attacks the bishop. Where does the bishop go?', [
      opt('g6. It is safe there', true, 'Yes. The bishop on g6 is solid. After Nge2 c5 h4 you play ...cxd4 and hit the centre.', 'Bg6', 'g:f5g6'),
      opt('e4, offering a trade', false, 'After Nxe4 dxe4 you lose a pawn on e4 for no compensation. The retreat to g6 is safer.', 'Be4'),
      opt('c8, retreating all the way', false, 'It loses a lot of time, and you have already spent time with your bishop. g6 is better.'),
    ], 'Retreat the bishop to g6, where it is safe and still active.', { kind: 'square' }),
  ],
  traps: [],
});

export const ch3 = chapter({
  id: 'classical',
  title: 'Classical Caro-Kann: 3.Nc3 dxe4 4.Nxe4 Bf5',
  blurb: 'The main line. Develop the bishop first, answer h4 with ...h6, and solve everything with ...e6.',
  coach: `This is the main line of the Caro-Kann and you will meet it more than any other. Take on e4, play ...Bf5, retreat to g6, and answer White's h4 with ...h6. Then you play ...Nd7, trade the light-squared bishops on d3 and play ...e6. Your pieces are happy and your structure is perfect.`,
  tip: 'After 4.Nxe4 Bf5 5.Ng3 Bg6 6.h4, play ...h6. Trade the light bishops on d3, play ...e6, and castle with a comfortable position.',
  src: `${PRE}
 3.Nc3 {The Classical set-up: White defends e4 and develops a piece.}
 dxe4 {Take. You give up the centre pawn for a solid structure.}
 4.Nxe4 {White recaptures and the knight is in the centre.}
 Bf5 {The key move: the bishop comes out before ...e6.}
 (Nf6 {Another good move that develops with tempo.}
  5.Nxf6+ {White trades.}
  exf6 {Recapture with the pawn. The structure is a little different but solid.}
  6.c3 {Support d4.}
  Bd6 {Develop.}
  7.Bd3 {Develop.}
  O-O {Castle: your king is safe.}
  8.Ne2 {Develop.}
  Re8 {Take the open file.})
 (Nd7 {The Smyslov Variation.}
  5.Qe2 {White sets a nasty trap, so be careful.}
  Ndf6 {The only good move. Not ...Ngf6??, which loses to a mate.}
  6.Nf3 {Develop.}
  Bg4 {Pin the knight.}
  7.c3 {Support d4.}
  e6 {Solid and sensible.})
 5.Ng3 {The knight attacks the bishop.}
 Bg6 {The bishop retreats to a safe diagonal.}
 6.h4 {White threatens h5 and the bishop is under threat.}
 (Bc4 {A calmer development.}
  e6 {Close the diagonal.}
  7.Nf3 {Develop.}
  Nd7 {Develop.}
  8.O-O {Castle: your king is safe.}
  Ngf6 {The last knight comes out.})
 (Nf3 {Develop first.}
  Nd7 {Develop.}
  7.h4 {Now the pawn goes.}
  h6 {Make room for the bishop.})
 h6 {Make a safe square on h7 for the bishop and stop h5.}
 7.Nf3 {White develops.}
 Nd7 {Develop, and prepare ...Ngf6.}
 8.h5 {White chases the bishop.}
 Bh7 {The bishop retreats to a safe square.}
 9.Bd3 {Offer the trade of bishops.}
 Bxd3 {Take the piece.}
 10.Qxd3 {Recapture with the queen.}
 e6 {Solid. Your pawn chain is perfect and all your pieces can develop.}
 11.Bf4 {White develops with ideas against your queenside.}
 Ngf6 {Develop the last piece.}
 12.O-O-O {White castles long, and the kings are on opposite sides.}
 Be7 {Develop and prepare to castle.}
 13.Kb1 {White steps out of the c-file.}
 O-O {Castle: your king is safe and your position is solid.}
 14.Ne4 {White offers a trade.}
 Nxe4 {Take the piece.}
 15.Qxe4 {Recapture.}
 Nf6 {The knight attacks the queen and heads for d5. @d In the Classical Caro-Kann, you want ...Bf5, ...e6, ...Nd7 and ...Ngf6: your pieces will be well placed.}`,
  plans: [
    plan('p1', 'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Ng3 Bg6 h4', 'White threatens h5 to trap your bishop. What is the right reply?', [
      opt('h6. Make a flight square on h7', true, 'Yes. After h5 the bishop goes to h7 and stays on the diagonal. You then trade it with ...Bxd3.', 'h6'),
      opt('h5, stopping the pawn', false, 'It works in theory, but your bishop gets stuck and White gains time with Ne5 and Bd3. ...h6 is the main line.'),
      opt('Nf6, developing', false, 'After h5 the bishop is attacked and has to run. Make the flight square first.'),
    ], 'Keep a flight square for the bishop before the pawn arrives.'),
    plan('p2', 'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Ng3 Bg6 h4 h6 Nf3 Nd7 h5 Bh7 Bd3', 'White offers a bishop trade on d3. What do you do?', [
      opt('Bxd3. Trade the light-squared bishops', true, 'Right. Your bishop on h7 would otherwise be stuck behind the h5 pawn. The trade solves your last problem piece.', 'Bxd3', 'g:h7d3'),
      opt('Bg8, avoiding the trade', false, 'It is terribly passive. The bishop is your opening problem and trading it solves everything.'),
      opt('Ngf6, developing', false, 'Bxh7 and you have lost your bishop for a knight trade you did not want. Take on d3 first.'),
    ], 'Trade off the bishop that has the least future.'),
    plan('p3', 'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Nd7 Qe2', 'You played the Smyslov ...Nd7 and White plays Qe2. Which move avoids a catastrophe?', [
      opt('Ndf6. The d7-knight goes to f6 so that Nd6+ is not mate', true, 'Yes. After ...Ngf6?? Nd6# is checkmate. The knight from d7 should recapture, so that the knight on g8 stays home.', 'Ndf6'),
      opt('Ngf6', false, 'This walks into a mate: Nd6#. The queen on e2 backs up the knight on d6.', 'Ngf6'),
      opt('e6, solid', false, 'It also works, but gives White more time. The main line is ...Ndf6.'),
    ], 'Before you develop, ask whether the e8 king is exposed.'),
    plan('p4', 'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Ng3 Bg6 h4 h6 Nf3 Nd7 h5 Bh7 Bd3 Bxd3 Qxd3 e6', 'Black has finished the bishop manoeuvre, and White is to move. How should you assess the position?', [
      opt('Solid and equal; your structure is healthy and you only need to develop the rest', true, 'Yes. You are a few moves from completing development, and you have no weaknesses. That is the Caro-Kann promise.'),
      opt('Black is in trouble because of the h-pawn', false, 'The h5 pawn has cost White time, and the bishop is traded. You are fine.'),
      opt('Black has an advantage already', false, 'Be realistic: it is roughly equal. But equal with no weaknesses is good for you.'),
    ], 'A healthy structure is worth a lot.'),
  ],
  traps: [],
});
