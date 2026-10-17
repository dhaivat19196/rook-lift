// London System, chapters 3-4 (vs ...c5 and ...Qb6, vs ...Bf5).
import { avoid, chapter, opt, plan, win } from '../course.ts';
import { OPEN } from './london-a.ts';

export const ch3 = chapter({
  id: 'c5',
  title: 'Against ...c5 and the ...Qb6 hit on b2',
  blurb: 'Black pokes at d4 and b2. Support the pawn, protect b2 and keep developing.',
  coach: `When Black plays ...c5 he is asking whether your centre is solid. It is: c3 supports d4. The one thing to watch is the queen coming to b6 to hit b2, because the London bishop has left the queenside. We will meet that with Qb3 and Nc3, and you will never give b2 away for free.`,
  tip: 'Support d4 with c3 or e3, and before every move ask: is b2 attacked? If it is, Qb3, Nc3 or Qc1 deal with it.',
  src: `${OPEN}
 c5 {Black hits d4 before developing anything.}
 3.e3 {Solid. e3 supports d4, and the bishop is already outside the chain.}
 Nc6 {One more attacker on d4.}
 (Qb6 {Black hits b2 at once.}
  4.Nc3 {The gambit choice: let b2 go for activity. The knight eyes b5 and d5.}
  e6 {Black keeps his pawn and defends.}
  5.Nb5 {Now Nc7+ is a threat, and the queen on b6 has to think. @a g:b5c7}
  Na6 {Black covers c7.}
  6.a4 {Support the knight on b5 so that Nc7+ stays a threat. Black cannot take on b2 yet without trouble. @a g:a2a4 @x Qd2: Qd2 defends b2 but lets Black untangle with ...Nge7. a4 keeps the knight on its great square.})
 (Nf6 {Black develops the knight.}
  4.c3 {Support d4 first.}
  Nc6 {Another attacker on d4.}
  5.Nd2 {The knight goes to d2 so that the queen has b3 available.}
  Bf5 {Black develops the bishop outside his chain.}
  6.Ngf3 {Now the position is fully symmetrical except that it is your move.}
  e6 {Black solidifies.}
  7.Bb5 {Pin the knight and pressure d5.})
 (cxd4 {Black takes the pawn at once.}
  4.exd4 {Recapture with the pawn. Now you have an open e-file and a healthy centre.}
  Nc6 {Black develops.}
  5.c3 {Support d4 and keep the queen's diagonal open.}
  e6 {Black prepares ...Bd6.}
  6.Bd3 {The bishop aims at Black's kingside.}
  Bd6 {Black offers the bishop trade.}
  7.Bg3 {Keep the bishop. Black cannot take it without giving you the h-file.})
 (e6 {Black plays the Hedgehog-style ...e6 first.}
  4.c3 {Support d4 and keep everything protected.}
  Nc6 {Black develops.}
  5.Nd2 {The usual London development.}
  Nf6 {Black develops.}
  6.Ngf3 {All the pieces are placed.}
  Bd6 {Offering the trade.}
  7.Bg3 {Keep your bishop.}
  O-O {Black castles.}
  8.Bd3 {Complete development.})
 4.c3 {Support d4 with a pawn and give the queen the c2 square. Black cannot win d4.} @a g:c3d4
 Qb6 {Black attacks b2. The pawn is protected only by the queen, so look at this carefully.}
 5.Qb3 {The queen defends b2 and offers an exchange. If Black takes, axb3 gives you an open a-file. @a g:b3b6 @x Nd2: After Nd2 Qxb2 you have a rook lift Rb1 and Black keeps the pawn for a while. Qb3 simply keeps everything protected.}
 Nf6 {Black ignores the queen offer and develops.}
 (c4 {Black gains space and attacks the queen.}
  6.Qc2 {Step aside. The queen still guards b2 and eyes the h7 and f5 squares.}
  e5 {Black hits the centre.}
  7.dxe5 {Take. Black has no good way to recover the pawn.}
  Bf5 {Black develops with tempo on the queen.}
  8.Qc1 {Hold the b2 pawn and the bishop.})
 (Bf5 {Black develops the bishop and ignores the queen.}
  6.dxc5 {Take a pawn. Black's queen has to decide.}
  Qxb3 {Black trades.}
  7.axb3 {Recapture. The a-file is open for your rook.}
  e5 {Black grabs the centre.}
  8.Bg3 {The bishop keeps an eye on e5 and the diagonal.})
 (e6 {Black plays the solid move.}
  6.Nd2 {Develop.}
  Nf6 {Black develops.}
  7.Ngf3 {All your pieces are developed.}
  Bd7 {Black develops.}
  8.Be2 {Complete the development.})
 (cxd4 {Black takes at once.}
  6.exd4 {Recapture with the e-pawn and keep the c-pawn at home. The queen on b3 now eyes b6 and d5.}
  Qd8 {Black has to retreat the queen.}
  7.Nf3 {Develop. Black has lost time with the queen.}
  Nf6 {Black develops.}
  8.Nbd2 {Develop the knight where it supports e4.})
 6.Nd2 {Develop and keep b2 defended by the queen. Now Qxb6 axb6 is an option.}
 e6 {Black solidifies the centre.}
 7.Ngf3 {All your pieces are coming out naturally.}
 Be7 {Black develops.}
 8.Be2 {Develop the bishop and prepare to castle.}
 O-O {Black castles.}
 9.O-O {Castle. Your king is safe and your setup is complete. @d Against ...c5 the order is: support d4, watch b2, develop and castle.}`,
  plans: [
    plan('p1', 'd4 d5 Bf4 c5 e3 Nc6 c3 Qb6', 'Black attacks your b2 pawn. What do you do?', [
      opt('Qb3. It defends b2 and offers to trade queens', true, 'Yes. Qb3 protects b2 and gives Black a choice: trade queens on your terms or lose time.', 'Qb3', 'g:d1b3'),
      opt('Nd2. Develop and let him take b2', false, 'After Nd2 Qxb2 Black has a free pawn and a strong queen. Develop later: first make sure that nothing is hanging.'),
      opt('Bxb8 to remove a defender', false, 'Bxb8 does not make sense: it gives up your best bishop and does nothing about b2.'),
    ], 'Before you develop, check what Black attacks. Defend b2, then continue.'),
    plan('p2', 'd4 d5 Bf4 c5 e3 Nc6 c3 Qb6 Qb3 Nf6', 'What does the c3 pawn do for the e3 pawn and the queen?', [
      opt('It supports d4 and gives the queen the c2 square', true, 'c3 holds the d4 pawn and leaves the c2 square free, so the queen can step aside if it needs to.'),
      opt('It prepares c3-c4', false, 'c4 is a later idea. The point of c3 right now is the safety of d4.'),
      opt('It blocks the queen\'s diagonal', false, 'It does not: the queen stands on b3 and the pawn on c3 is in front of her diagonal to the king, but that is not the important job here. c3 protects d4.'),
    ], 'c3 is the pawn that protects d4 in the London.'),
    plan('p3', 'd4 d5 Bf4 c5 e3 Qb6', 'Black plays ...Qb6 on move three, before you can play c3. How do you answer?', [
      opt('Nc3. Offer the b2 pawn and attack with the knight', true, 'Yes. The knight comes out with a threat (Nb5 and Nc7+) and Black has to defend. Activity matters more than one pawn.', 'Nc3'),
      opt('Nbd2, defending b2 the lazy way', false, 'The knight on d2 does not guard b2. Nothing defends it, and you lose a pawn for no reason.'),
      opt('Bxb8', false, 'This takes a knight that is not on b8: the b8 square is empty. Be careful which pieces are actually there.'),
    ], 'If the queen attacks b2 and you cannot defend it easily, make a threat of your own.'),
    plan('p4', 'd4 d5 Bf4 c5 e3 cxd4', 'Black takes the d4 pawn immediately. What is the best way to recapture?', [
      opt('exd4. You keep a healthy centre and the e-file is open', true, 'Yes. The pawn on d4 is back, the e-file is open for your rooks, and your bishop is already outside.', 'exd4'),
      opt('Bxb8', false, 'This does not recapture the pawn. You must take back on d4.'),
      opt('Qxd4', false, 'The queen on d4 gets chased by ...Nc6 and loses time. Use the pawn.'),
    ], 'Recapture with the pawn if you can: it keeps the centre and builds your structure.'),
  ],
  traps: [],
});

export const ch4 = chapter({
  id: 'bf5',
  title: 'Against ...Bf5: the mirror London',
  blurb: 'Black copies your bishop. Stay calm, trade on d3 if you like, and aim at b7.',
  coach: `When Black develops his bishop to f5 he is playing your London against you. That is fine: you move first. Your trump is that you have the tempo, and you can aim at b7 with the queen or trade the light-squared bishops and keep a small edge.`,
  tip: 'Against ...Bf5 develop with e3, Nf3 and Bd3, and look for Qb3 or c4 to attack b7 and d5.',
  src: `${OPEN}
 Bf5 {Black copies your bishop.}
 3.e3 {Solid, and it prepares Bd3 to challenge Black's bishop.}
 e6 {Black solidifies.}
 (Nf6 {Black develops the knight first.}
  4.Nf3 {Develop and guard d4.}
  e6 {Black plays the usual move.}
  5.Bd3 {Challenge his bishop. If he trades, you recapture with the queen.}
  Bxd3 {Black takes.}
  6.Qxd3 {The queen recaptures and eyes b5 and the a6-f1 diagonal. @a g:d3b5}
  Bd6 {Black offers a bishop trade.}
  7.Bxd6 {Trade now. You keep a slightly better structure.}
  cxd6 {Black recaptures.}
  8.O-O {Castle: your king is safe and the rooks are ready.}
  O-O {Black castles.}
  9.Nbd2 {Develop.})
 (c6 {Black builds the Slav-style structure.}
  4.c4 {Hit the centre at once. Black's queen can come to b6, but you are ready.}
  Qb6 {Black attacks b2.}
  5.Qd2 {Defend b2 along the second rank and keep an eye on the d-file.}
  Nd7 {Black develops.}
  6.Nc3 {Develop and increase the pressure on d5.})
 (Nc6 {Black develops the knight and eyes d4.}
  4.c4 {Strike at d5 before Black is ready.}
  e6 {Black supports d5.}
  5.Nc3 {Develop with pressure on d5.}
  Nf6 {Black develops.}
  6.Nf3 {Complete the knights.})
 4.Nf3 {Develop and guard d4.}
 Nf6 {Black develops.}
 5.Bd3 {Challenge his bishop. If it takes, you recapture with the queen and nothing is hanging.}
 Bxd3 {Black takes.}
 6.Qxd3 {The queen recaptures and eyes b5 and the a6-f1 diagonal. @a g:d3b5}
 Bd6 {Black offers a bishop trade.}
 7.Bxd6 {Trade now. You keep a slightly better structure.}
 cxd6 {Black recaptures.}
 8.O-O {Castle: your king is safe and the rooks are ready.}
 O-O {Black castles.}
 9.Nbd2 {Develop. Black has no weaknesses, but you have a small, safe edge. @d Against ...Bf5 the position is equal but easy for you: develop, castle and use the tempo.}`,
  plans: [
    plan('p1', 'd4 d5 Bf4 Bf5 e3 e6 Nf3 Nf6', 'Black mirrors your setup. What is your most natural developing move?', [
      opt('Bd3. Challenge his bishop and develop at the same time', true, 'Yes. If he trades, you recapture with the queen and nothing in your position is weak.', 'Bd3', 'g:f1d3'),
      opt('h3. Make a little room for the bishop', false, 'It is not wrong, but it does not develop a piece. Develop first, make luft later.'),
      opt('Ne5. Plant the knight at once', false, 'The knight on e5 can be hit by ...Bd6 or ...Nbd7, and you will have spent time without developing a new piece. Develop the bishop first.'),
    ], 'Develop first. A bishop that challenges his bishop is a developing move with a purpose.'),
    plan('p2', 'd4 d5 Bf4 Bf5 e3 e6 Nf3 Nf6 Bd3 Bxd3', 'Black has taken on d3. How do you recapture?', [
      opt('Qxd3. The queen develops and your pawn structure stays healthy', true, 'Yes. The queen recapture keeps the pawns intact and puts the queen on a useful diagonal, with ideas of Qb5+ and Qb3.', 'Qxd3', 'g:d1d3'),
      opt('cxd3, to keep the queen at home', false, 'It is playable, but it doubles your pawns on the d-file and shuts in your own queen’s bishop... not what the London wants. Keep the structure and recapture with the queen.'),
      opt('Do not recapture; play Ne5', false, 'You would simply be a bishop down. Always recapture when something has been taken.'),
    ], 'When a trade is offered, recapture in the way that keeps your pawn structure healthy.'),
    plan('p3', 'd4 d5 Bf4 Bf5 e3 e6 Nf3 Nf6 Bd3 Bxd3 Qxd3 Bd6', 'Black offers to trade the dark-squared bishops. Your move.', [
      opt('Bxd6. Take it: the light-squared bishops are gone, so the trade is safe and slightly favourable', true, 'Right. With the light bishops gone, trading the other pair keeps your structure better and Black has nothing to attack. Calmly play on.', 'Bxd6'),
      opt('Bg3, keeping the bishop', false, 'It is a fine move, but here Black’s bishop is a strong piece and trading it keeps things simpler. Keeping the bishop is a matter of taste.'),
      opt('Be5, to dodge the trade', false, 'Be5 loses a tempo after ...Bxe5 Nxe5 and you have made the trade anyway, only on his terms.'),
    ], 'In the mirror London the bishops often come off. Simple, solid trades are fine: you are slightly better with no risk.'),
    plan('p4', 'd4 d5 Bf4 Bf5 e3 e6 Nf3 Nf6 Bd3 Bxd3 Qxd3 Bd6 Bxd6 cxd6', 'The bishops are off. Which of Black’s pawns is the natural target of your queen?', [
      opt('b7, along the a6-f1 and b-file lines (Qb5+ and Qb3 ideas)', true, 'Yes. Without his light bishop, b7 is a soft target. You can also play Qb5+ to force a concession.'),
      opt('h7, with a Greek gift', false, 'No bishop on d3 any more and Black has a knight guarding h7. There is no attack on h7 here.'),
      opt('f7, with the knight', false, 'Black’s king is castled on g8 behind f7, which is well protected. The b-pawn is the more realistic target.'),
    ], 'When bishops come off, look for pawns that lost their guardian.'),
  ],
  traps: [],
});
