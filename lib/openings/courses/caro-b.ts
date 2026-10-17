// Caro-Kann, chapters 4-6: the Exchange and Panov, the Two Knights and Fantasy, then traps. Black.
import { avoid, chapter, opt, plan, win } from '../course.ts';
import { PRE } from './caro-a.ts';

export const ch4 = chapter({
  id: 'exchange',
  title: 'Exchange and Panov-Botvinnik: 3.exd5',
  blurb: 'White trades the centre. You recapture, develop the bishop to g4 and play for a comfortable position.',
  coach: `When White takes on d5 the game becomes symmetrical and calm, and your job is easy: develop quickly and keep the pawn on d5 safe. In the quiet Exchange, you play ...Nc6, ...Nf6, ...Bg4 and ...e6. The Panov-Botvinnik with c4 is sharper: you answer with ...Nf6, ...e6 and ...Be7, and recapture on d5 with the knight. Keep your pieces active and you will be fine.`,
  tip: 'Against the Exchange, develop with ...Nc6, ...Nf6, ...Bg4 and ...e6. Against the Panov, play ...Nf6, ...e6, ...Be7 and recapture on d5 with the knight.',
  src: `${PRE}
 3.exd5 {The Exchange Variation. White opens the e-file and aims for a symmetrical position.}
 cxd5 {Recapture with the pawn. You now have the same centre as White, and the c-file is half open.}
 4.Bd3 {The classical Exchange set-up. White develops the bishop and prepares c3.}
 (c4 {The Panov-Botvinnik Attack. White strikes at d5 at once.}
  Nf6 {Develop with pressure on d5 and e4.}
  5.Nc3 {Develop.}
  e6 {Solid. Support d5.}
  6.Nf3 {Develop.}
  Be7 {Develop and prepare to castle.}
  7.cxd5 {White takes.}
  (c5 {White grabs space on the queenside.}
   O-O {Castle: your king is safe.}
   8.b4 {Support the c5 pawn.}
   b6 {Challenge the c5 pawn at once.}
   9.Bd3 {Develop.}
   a5 {Undermine the b4 pawn.})
  Nxd5 {Recapture with the knight, which is placed in the centre.}
  8.Bd3 {Develop.}
  Nc6 {Develop.}
  9.O-O {Castle: your king is safe.}
  O-O {Castle: your king is safe.}
  10.Re1 {The rook takes the open file.}
  Bd7 {Develop the last minor piece.})
 (Nf3 {Develop first.}
  Nf6 {Develop.}
  5.Bb5+ {White gives a check.}
  Bd7 {Block with the bishop.}
  6.Bxd7+ {White trades.}
  Nbxd7 {Recapture with the knight.}
  7.Bf4 {Develop with pressure on b8.}
  Qb6 {Hit b2 and prepare ...e6.}
  8.b3 {Defend b2.}
  e6 {Solid and sensible.})
 Nc6 {Develop and add pressure to d4.}
 5.c3 {Support d4.}
 Nf6 {Develop and hit the centre.}
 6.Bf4 {The bishop eyes b8 and prepares Qb3.}
 Bg4 {Develop the bishop outside the chain.}
 7.Qb3 {White attacks the pawn on d5 and the pawn on b7.}
 Qd7 {Defend b7 and keep the structure.}
 8.Nd2 {White supports the queen and prepares Ngf3.}
 e6 {Solid. The pawn chain protects d5.}
 9.Ngf3 {Develop.}
 Bd6 {Challenge the bishop on f4.}
 10.Bxd6 {White trades the bishops.}
 Qxd6 {Recapture with the queen.}
 11.O-O {White castles.}
 O-O {Castle: your king is safe.}
 12.h3 {Ask the bishop a question.}
 Bh5 {Keep the pin.}
 13.Rfe1 {White places the rook on the open file.}
 Qc7 {The queen steps away from the pin. @d In the Exchange, develop your pieces, support d5 with ...e6, and keep an eye on b7.}`,
  plans: [
    plan('p1', 'e4 c6 d4 d5 exd5 cxd5 Bd3 Nc6 c3 Nf6 Bf4 Bg4 Qb3', 'White attacks b7 and d5 with his queen. What is the sound reply?', [
      opt('Qd7. Defend b7 and keep a solid structure', true, 'Yes. The queen on d7 protects b7 and connects the pieces. Then ...e6 and ...Bd6 give you a comfortable game.', 'Qd7', 'g:d8d7'),
      opt('Rb8, defending the pawn', false, 'It looks natural, but Bxb8 wins the exchange. The rook is not a good defender here.', 'Rb8'),
      opt('Qc8, hiding', false, 'It is playable, but gives up the bishop’s retreat square. Qd7 is more natural.'),
    ], 'Defend a pawn with the least valuable defender that works.'),
    plan('p2', 'e4 c6 d4 d5 exd5 cxd5 c4', 'White plays c4, the Panov-Botvinnik. What is your plan?', [
      opt('Nf6, then e6 and Be7. Recapture on d5 with the knight', true, 'Yes. The knight on d5 will be well placed in the centre, and you will castle quickly.', 'Nf6'),
      opt('dxc4, grabbing the pawn', false, 'It looks tempting, but you lose the centre and White gets a lead in development. Keep the structure.'),
      opt('e6, blocking the bishop', false, 'It works but ...Nf6 first creates pressure on d5. ...e6 comes next.'),
    ], 'Against the Panov, develop the knight first and recapture on d5 with the knight.'),
    plan('p3', 'e4 c6 d4 d5 exd5 cxd5 c4 Nf6 Nc3 e6 Nf3 Be7 cxd5', 'White takes on d5. How do you recapture?', [
      opt('Nxd5. The knight is perfectly placed in the centre', true, 'Yes. The knight on d5 hits c3 and b4, and after Bd3 Nc6 O-O O-O you have an easy game.', 'Nxd5', 'g:f6d5'),
      opt('exd5, building a pawn centre', false, 'It is playable, but you are left with an isolated pawn on d5. The knight recapture is more natural and keeps your structure healthier.'),
      opt('Qxd5, using the queen', false, 'The queen on d5 gets chased by Nc3 and Bb5+, so you lose time.'),
    ], 'Recapture in the centre with the piece that improves your position.'),
    plan('p4', 'e4 c6 d4 d5 exd5 cxd5 Bd3 Nc6 c3 Nf6 Bf4 Bg4 Qb3 Qd7 Nd2 e6 Ngf3 Bd6', 'White can trade bishops on d6. What is the idea?', [
      opt('Bxd6 Qxd6, then castle: equal and very comfortable', true, 'Yes. The queen recaptures and eyes the b-file. Both sides are solid, and you have no weaknesses.', 'Bxd6'),
      opt('Black’s bishop is trapped', false, 'The bishop on d6 is not trapped; it is simply trading with the bishop on f4.'),
      opt('White wins a pawn on b7', false, 'The pawn on b7 is defended by the queen on d7. Nothing falls.'),
    ], 'Understand why a trade leaves you comfortable: look at your structure first.'),
  ],
  traps: [
    avoid('a1', 'The shaky rook on b8', 'b', 'e4 c6 d4 d5 exd5 cxd5 Bd3 Nc6 c3 Nf6 Bf4 Bg4 Qb3', 'Rb8', 'Qd7', 'Bxb8 Qxb8 Nd2 e6 Ngf3', 'Defending b7 with the rook loses the exchange to Bxb8. Qd7 or Na5 solve the problem safely.', 'Check which enemy piece attacks the defender before you place a rook.', 'g:f4b8'),
  ],
});

export const ch5 = chapter({
  id: 'twok',
  title: 'Two Knights, Fantasy and the rest: 2.Nc3, 3.f3, 2.c4, 2.Nf3',
  blurb: 'When White avoids the main lines. Develop calmly and take the centre pawn if it is offered.',
  coach: `Some opponents will not play 2.d4. They play 2.Nc3, 2.c4 or 2.Nf3, or after 2.d4 d5 they play the Fantasy Variation with 3.f3. All of these have simple answers: play ...d5 whenever you can, develop the bishop outside the chain, and if White offers a centre pawn, take it and develop. The Fantasy is very easy to play against when you know the plan.`,
  tip: 'Always play ...d5, develop the bishop outside the chain, and if White offers a pawn, take it and develop.',
  src: `1.e4 {White takes the centre and opens lines for the queen and the f1-bishop.}
 c6 {The Caro-Kann. You prepare ...d5 with a solid pawn.}
 2.Nc3 {The Two Knights Variation. White develops a piece and keeps his pawn structure flexible.}
 (d4 {The usual move.}
  d5 {Challenge the centre.}
  3.f3 {The Fantasy Variation. White supports e4 and keeps the pawn structure flexible.}
  (e5 {The Advance, which we cover in another chapter.}
   Bf5 {Bishop out first.})
  e6 {Solid. Support d5 and open the bishop.}
  (dxe4 {Take the centre pawn and open the position.}
   4.fxe4 {White recaptures.}
   e5 {Strike in the centre.}
   5.Nf3 {Develop and attack the pawn.}
   (dxe5 {White tries to win a pawn.}
    Qh4+ {A check that wins the initiative: the king cannot castle, and the rook on h1 and the pawn on e4 are loose.}
    6.Kd2 {The king runs.}
    (g3? {A blunder that overlooks a fork.}
     Qxe4+ {The queen forks the king and the rook on h1.}
     7.Qe2 {White blocks the check.}
     Qxh1 {The queen takes the rook.})
    Qf4+ {Another check.}
    7.Ke1 {The king goes back.}
    Qxe4+ {Take the pawn with check.}
    8.Qe2 {White blocks.}
    Bf5 {Develop with tempo.})
   exd4 {Take. You have won a centre pawn.}
   6.Bc4 {White eyes f7 and develops.}
   Nf6 {Develop and attack e4.}
   7.O-O {Castle: your king is safe.}
   Nbd7 {Develop.})
  4.Nc3 {Develop.}
  Nf6 {Develop and attack e4.}
  5.e5 {White pushes.}
  Nfd7 {The knight retreats to d7.}
  6.f4 {Support e5.}
  c5 {Strike at the base of the chain.}
  7.Nf3 {Develop.}
  Nc6 {Develop with pressure on d4.}
  8.Be3 {Support d4.}
  cxd4 {Take the piece.}
  9.Nxd4 {Recapture.}
  Bc5 {Develop with pressure on d4.})
 (c4 {The English-style Caro-Kann.}
  d5 {Strike in the centre at once.}
  3.exd5 {White takes.}
  cxd5 {Recapture with the pawn.}
  4.cxd5 {White takes again.}
  Nf6 {Develop and hit d5.}
  5.Nc3 {Develop.}
  Nxd5 {Recapture with the knight.}
  6.Nf3 {Develop.}
  Nc6 {Develop.}
  7.Bb5 {Pin the knight.}
  g6 {Prepare the fianchetto.})
 (Nf3 {A calm second move.}
  d5 {Strike at once.}
  3.e5 {White pushes.}
  Bg4 {Develop the bishop outside the chain.}
  4.d4 {White takes the centre.}
  e6 {Solid and sensible.}
  5.c3 {Support d4.}
  c5 {Strike at the base of the chain.}
  6.Be3 {Support d4.})
 d5 {Strike at the centre at once.}
 3.Nf3 {White develops the second knight.}
 (g3 {White fianchettoes.}
  dxe4 {Take the pawn.}
  4.Nxe4 {Recapture.}
  Nf6 {Develop with tempo.}
  5.Nxf6+ {White trades.}
  exf6 {Recapture with the pawn.}
  6.Bg2 {Develop.})
 Bg4 {Develop the bishop outside the chain, and pin the knight to the queen.}
 4.h3 {Ask the bishop a question.}
 Bxf3 {Take. The pawn structure of White will be a little ragged.}
 5.Qxf3 {Recapture with the queen.}
 e6 {Solid. Support d5 and open the bishop on f8.}
 6.d3 {White supports e4.}
 Nf6 {Develop.}
 7.g3 {Prepare the bishop on g2.}
 Bb4 {Pin the knight on c3.}
 8.Bd2 {Unpin the knight and keep developing.}
 Nbd7 {Develop.}
 9.a3 {Ask the bishop a question.}
 Ba5 {Keep the bishop on the diagonal.}
 10.Bg2 {Develop.}
 O-O {Castle: your king is safe.}
 11.O-O {White castles. @d Against the unusual second moves, play ...d5, develop the bishop outside the chain, and take free pawns.}`,
  plans: [
    plan('p1', 'e4 c6 Nc3', 'White plays 2.Nc3. What is the natural reply?', [
      opt('d5. Strike in the centre as usual', true, 'Yes. The Caro-Kann plan is always the same: ...d5. After Nf3 Bg4 you develop the bishop outside the chain.', 'd5', 'g:d7d5'),
      opt('e5, grabbing space', false, 'The pawn on e5 can be chased and does not follow the Caro-Kann plan.'),
      opt('g6, preparing a fianchetto', false, 'The fianchetto is a different opening. The Caro-Kann is about ...d5.'),
    ], 'Whatever White plays, ...d5 is the Caro-Kann move.'),
    plan('p2', 'e4 c6 d4 d5 f3 dxe4 fxe4 e5 Nf3', 'In the Fantasy, White offers a centre pawn. What do you do?', [
      opt('exd4. Take the pawn: you are a pawn up and the position is open', true, 'Yes. After Bc4 Nf6 O-O Nbd7 you are fine and have won a centre pawn.', 'exd4', 'g:e5d4'),
      opt('Bd6, defending', false, 'After dxe5 Bb4+ c3 Qxd1+ Kxd1 White gets a nice position. Taking the pawn is simplest.'),
      opt('Nf6, developing', false, 'After Nxe5 White has won a pawn back. Take on d4 first.'),
    ], 'In the Fantasy, take the pawn that is offered.'),
    plan('p3', 'e4 c6 Nc3 d5 Nf3', 'Which move develops the bishop outside the pawn chain?', [
      opt('Bg4. Pin the knight on f3 and develop with a threat', true, 'Yes. The bishop on g4 attacks the knight. After h3 Bxf3 Qxf3 e6 you have a solid, comfortable game.', 'Bg4', 'g:c8g4'),
      opt('Bf5, leaving the knight alone', false, 'It is playable. But dxe4 Nxe4 and the bishop is hit by Ng3. ...Bg4 is more direct.'),
      opt('e6, blocking the bishop', false, 'The pawn on e6 locks the bishop in. Keep the bishop free.'),
    ], 'Develop the light-squared bishop before closing the pawn chain.'),
    plan('p4', 'e4 c6 Nc3 d5 Nf3 Bg4 h3', 'The bishop on g4 is asked a question. What do you do?', [
      opt('Bxf3. Take the knight and recapture on e6', true, 'Right. After Qxf3 e6 White has a wrecked pawn structure and you have a very comfortable position.', 'Bxf3', 'g:g4f3'),
      opt('Bh5, keeping the pin', false, 'It is playable, but after g4 Bg6 you run out of room and e5 comes. The trade is simpler.'),
      opt('Bf5, retreating', false, 'It works, but White has gained time with h3 and you have not done anything. The trade is more useful.'),
    ], 'When the bishop is asked to decide, trade it for a knight if the structure favours you.'),
  ],
  traps: [
    win('w1', 'The Fantasy fork', 'b', 'e4 c6 d4 d5 f3 dxe4 fxe4 e5 dxe5 Qh4+ g3', 'Qxe4+', 'Qe2 Qxh1', 'After dxe5 the checking queen on h4 makes g3 impossible: Qxe4+ forks the king and the rook on h1, and the rook falls.', 'When a king is exposed, look for checks that also attack a loose rook.', 'g:h4e4'),
  ],
});

export const ch6 = chapter({
  id: 'traps',
  title: 'Traps and tricks',
  blurb: 'Tactics for both sides: avoid the mate on d6, and punish the careless.',
  coach: `The Caro-Kann is solid, but it has a handful of traps. The most famous is the Nd6# trick against the Smyslov, which catches players who develop the wrong knight. There are others, and some of them catch White: if you know them, you will win games by move ten. Learn them from both sides, and you will never fall for them.`,
  tip: 'Before you develop a knight, check that the other knight is not needed to cover d6 and f6. Count loose pieces before captures.',
  src: `${PRE}
 3.Nc3 {The Classical set-up: White defends e4 and develops a piece.}
 dxe4 {Take. You give up the centre pawn for a solid structure.}
 4.Nxe4 {White recaptures and the knight is in the centre.}
 Nd7 {The Smyslov Variation. It prepares ...Ngf6 and keeps the bishop for later.}
 5.Qe2 {A trap move. White threatens Nd6 mate if you play the wrong knight to f6.}
 Ndf6 {The only move. The knight from d7 goes to f6, so that Nd6+ is not checkmate.}
 6.Nf3 {Develop.}
 Bg4 {Develop the bishop and pin the knight.}
 7.c3 {Support d4.}
 e6 {Solid. Your pieces are well developed. @d In the Smyslov, always develop with ...Ndf6, never with the knight from g8.}`,
  plans: [
    plan('p1', 'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Nd7 Qe2', 'White plays Qe2. Which knight goes to f6?', [
      opt('The knight from d7: ...Ndf6', true, 'Yes. The knight from d7 recaptures on e4 later and covers d6. The other way loses to Nd6#.', 'Ndf6', 'g:d7f6'),
      opt('The knight from g8: ...Ngf6', false, 'After Ngf6?? Nd6# is checkmate. The queen on e2 supports the knight, and the king on e8 has no flight.', 'Ngf6'),
      opt('Neither: ...e6', false, 'It is playable but passive. The best is ...Ndf6.'),
    ], 'In the Smyslov, develop the d7 knight to f6, not the g8 knight.'),
    plan('p2', 'e4 c6 d4 d5 exd5 cxd5 Bd3 Nc6 c3 Nf6 Bf4 Bg4 Qb3', 'White’s queen hits b7. Which defence loses material?', [
      opt('Rb8, because Bxb8 wins the exchange', true, 'Yes. The bishop on f4 takes the rook on b8, and the queen recaptures. You lose an exchange. Qd7 and Na5 are safe.', undefined, 'g:f4b8'),
      opt('Qd7', false, 'This is the right move, not the losing one. The queen defends b7 and the bishop on f4 attacks nothing.'),
      opt('Na5', false, 'This is the engine’s choice: the knight attacks the queen. It does not lose anything.'),
    ], 'Before you defend with a rook, check which enemy piece can attack it.'),
    plan('p3', 'e4 c6 d4 d5 e5 Bf5 Nf3 e6 Be2 c5 Be3 cxd4 Nxd4 Nc6 Nxc6', 'White has taken on c6 in the Advance. Which recapture is correct?', [
      opt('bxc6. The pawn recaptures, and the bishop on f5 stays safe', true, 'Yes. The pawn recapture keeps your queen and bishop safe. Other moves lose material to Qa4+ or Bb5.', 'bxc6'),
      opt('Bxc2, grabbing a pawn', false, 'After Qxc2 you have lost a bishop for a pawn. Always recapture the knight first.', 'Bxc2'),
      opt('Qc7, attacking the knight', false, 'After Nd4 White has won a tempo and your bishop is hanging to Nxf5. Recapture the knight.', 'Qc7'),
    ], 'When the knight takes on c6, recapture on c6 before looking at anything else.'),
    plan('p4', 'e4 c6 d4 d5 f3 dxe4 fxe4 e5 dxe5', 'In the Fantasy, White has taken on e5. What is the strongest reply?', [
      opt('Qh4+. The check wins the initiative, because g3 loses a rook', true, 'Yes. The king cannot castle, and g3 is met by Qxe4+ forking the king and the rook on h1. After Kd2 Qf4+ Ke1 Qxe4+ you are better.', 'Qh4+', 'g:d8h4'),
      opt('Qxd1+, trading queens', false, 'It is safe but gives away your advantage; Qh4+ is much stronger.', 'Qxd1+'),
      opt('Bb4+, checking with the bishop', false, 'It also checks but lets White block with c3, and the queen check is more effective.', 'Bb4+'),
    ], 'When the opponent’s king cannot castle, look for the checks that gain time.'),
  ],
  traps: [
    avoid('a1', 'The Smyslov mate', 'b', 'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Nd7 Qe2', 'Ngf6', 'Ndf6', 'Nd6#', 'The knight on e4 jumps to d6 with check, and the queen on e2 supports it. The king on e8 has no square: checkmate in six moves.', 'Before you develop a knight, check what the other one is guarding.', 'g:e4d6'),
    avoid('a2', 'The poisoned pawn on c2', 'b', 'e4 c6 d4 d5 e5 Bf5 Nf3 e6 Be2 c5 Be3 cxd4 Nxd4 Nc6 Nxc6', 'Bxc2', 'bxc6', 'Qxc2 Rc8 Bb5', 'The bishop takes a pawn that is protected by the queen, and the knight on c6 is still attacking things. Recapture the knight first.', 'Count the defenders before you grab a pawn.', 'g:d1c2'),
  ],
});
