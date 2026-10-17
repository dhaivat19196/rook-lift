// London System, chapters 1-4. White. Every move is checked by Stockfish in `npm run validate`.
import { chapter, opt, plan } from '../course.ts';

// the first two moves, shared by many chapters (identical text keeps the ideas consistent)
export const OPEN = `1.d4 {The London starts with the centre pawn. It grabs space and frees both of your bishops.}
 d5 {Black takes the centre too. This is the most common reply at club level.}
 2.Bf4 {The London bishop comes out BEFORE e3, so it is never locked in behind its own pawn. @a g:f4b8 @x e3: Playing e3 first locks the c1-bishop in. Get the bishop out, then close the door.}`;

export const ch1 = chapter({
  id: 'setup',
  title: 'The setup and its plans',
  blurb: 'Your pieces, your pawns and what they are for.',
  coach: `The London is a system, not a memory test. You put the same pieces on the same squares almost every game, so you can spend your thinking on the middlegame. In this chapter we build the setup once, slowly, and I will tell you what every piece is for.`,
  tip: 'Bishop out first, then e3, Nf3, c3, Bd3, Nbd2 and castle. Then look for Ne5, a pawn push on the kingside, or the e4 break.',
  src: `${OPEN}
 Nf6 {Black develops and looks at e4.}
 3.e3 {Now the chain d4-e3 is solid and the f1-bishop is free. @a g:f1b5}
 e6 {Black builds a solid centre of his own.}
 4.Nf3 {The knight guards d4 and eyes e5, the square your whole plan is built around. @a g:f3e5}
 Be7 {A calm developing move.}
 (Bd6 {Black offers to swap your London bishop. The next chapter is all about this move.}
  5.Bg3 {Keep the bishop. It stays on the big diagonal, and if Black takes it you get a free open h-file.}
  O-O {Black castles.}
  6.Nbd2 {Same plan: the knight supports e4 and leaves the c-pawn free.}
  c5 {Black hits d4.}
  7.c3 {Support d4 with a pawn.}
  Nc6 {Another attacker on d4.}
  8.Bd3 {Develop the bishop. Black cannot win d4: c3, e3 and the knight on f3 all guard it.}
  b6 {Black prepares ...Bb7.}
  9.Qe2 {The queen watches e4, and e3-e4 is coming. @a g:e3e4})
 (c5 {Black hits d4 early.}
  5.c3 {Support d4 with a pawn first. Black cannot win it. @a g:c3d4}
  Nc6 {Another attacker on d4.}
  6.Nbd2 {Same plan: Nbd2, Bd3 and castle.}
  Bd6 {Offering the bishop trade.}
  7.Bg3 {Offered a trade? Keep the bishop.}
  O-O {Black castles.}
  8.Bd3 {Develop. Your pieces all point at the centre and the kingside.}
  b6 {Black plans ...Bb7.}
  9.Qe2 {This is the London structure in one picture: pawns on c3, d4 and e3, bishops on g3 and d3, and e4 ready to come. @a g:e3e4})
 (Nbd7 {Black puts the knight on d7, ready for ...c5 or ...e5.}
  5.c3 {Solid. It also takes the b4 square away from Black's bishop.}
  Bd6 {The bishop trade offer again.}
  6.Bg3 {Keep the bishop.}
  O-O {Black castles.}
  7.Nbd2 {Same set-up, same plan. @d Whatever Black does, your set-up stays the same: bishop out, e3, Nf3, c3, Bd3, Nbd2 and castle.})
 5.Bd3 {The bishop aims at Black's kingside. With a knight on f3 it also eyes h7. @a g:d3h7}
 O-O {Black castles. Both kings are safe for now.}
 6.Nbd2 {This knight supports e4 and leaves the c-pawn free for c3. @a g:d2e4 @x Nc3: Nc3 blocks the c-pawn, and c3 is exactly where you want your pawn to support d4.}
 c5 {Black hits d4 straight away.}
 7.c3 {Support d4 with a pawn so Black cannot win it. Your good bishop is already outside the chain. @a g:c3d4}
 Nc6 {One more attacker on d4, and the knight is developed.}
 8.Ne5 {The outpost. The knight hits c6 and f7, and Black has no easy way to kick it. @a g:e5c6 g:e5f7}
 Nd7 {Black offers a knight trade.}
 (Nxe5 {Black takes your strong knight.}
  9.dxe5 {Recapture with the pawn, not the bishop. The e5 pawn cramps Black, and the d-file and the h7-square are yours to attack.}
  Nd7 {The knight retreats.}
  10.Qh5 {The queen and the bishop both aim at h7. Black has to be careful with his king. @a g:h5h7 g:d3h7}
  g6 {Black stops the threat.}
  11.Qh6 {The queen sits on h6, and Black's king has weakened light squares around it. @d If Black takes your knight on e5, recapture with the d-pawn and aim your queen and bishop at the kingside.})
 (Qb6 {Black hits b2.}
  9.Qc2 {Defend calmly. The queen also eyes h7 behind the d3-bishop. @a g:c2h7 @d If Black hits b2, defend it. Never leave b2 hanging for a developing move.})
 9.Nxd7 {Trade a knight when it helps you: Black's pieces get tangled and your pawns stay healthy.}
 Bxd7 {Black recaptures and develops.}
 10.Nf3 {Back to the natural square. You are a little ahead in space, with a safe king and no weaknesses.}
 f6 {Black stops any thought of Ne5 again.}
 11.Qc2 {Queen to c2: it eyes h7 and keeps b2 covered. You are comfortable. @d You are comfortable: castle, then look for e4 or a kingside pawn push.}`,
  plans: [
    plan('p1', 'd4 d5 Bf4 Nf6 e3 e6 Nf3 Be7 Bd3 O-O', 'White to move. Where does the b1-knight belong in the London?', [
      opt('d2, behind the pawn chain, supporting e4 and leaving c3 free for the pawn', true, 'Yes. From d2 the knight supports the e4 break, and the c-pawn can still go to c3 to guard d4.', 'Nbd2', 'g:b1d2'),
      opt('c3, the classical square', false, 'The knight on c3 blocks the c-pawn, and that c-pawn on c3 is what holds your d4 pawn. You also lose the e4 support.'),
      opt('a3, to get out of the way', false, 'That wastes a tempo and does nothing for the centre. Your knights should work in the middle of the board.'),
    ], 'In the London the b1-knight goes to d2, and the c-pawn goes to c3.', { kind: 'square', marks: 'y:d2' }),
    plan('p2', 'd4 d5 Bf4 Nf6 e3 e6 Nf3 Be7 Bd3 O-O Nbd2 c5 c3 Nc6', 'The knight on f3 can jump to a great square. Which one, and why?', [
      opt('e5, an outpost that Black cannot kick with a pawn', true, 'Right. From e5 the knight attacks c6 and f7, and a Black pawn on d6 or f6 would cost him time and loosen his position.', 'Ne5', 'g:f3e5'),
      opt('g5, to hit the h7 pawn', false, 'A lone knight on g5 does little: Black plays ...Bxg5 or ...h6 and you have lost the bishop pair or a tempo for nothing.'),
      opt('h4, to hit the g6 square', false, 'The knight on the rim is out of play and leaves d4 and e5 short of pieces.'),
    ], 'Look for a knight outpost on e5 before you start a plan.', { kind: 'square' }),
    plan('p3', 'd4 d5 Bf4 Nf6 e3 e6 Nf3 Be7 Bd3 O-O Nbd2 c5 c3 Nc6 Ne5 Nd7 Nxd7 Bxd7 Nf3 f6', 'You are comfortable. Which pawn break is the London built for?', [
      opt('e3-e4, opening the centre when you are better developed', true, 'Yes. The pieces behind the pawns (Bd3, Nd2, Nf3) all support e4. When it comes, your pieces are ready.', undefined, 'g:e3e4'),
      opt('b2-b4, grabbing space on the queenside', false, 'It is playable later, but it does not use the pieces you have placed. Your pieces point at the centre and the kingside.'),
      opt('a2-a4, stopping everything', false, 'This slow pawn move does nothing about the centre. Use your pieces, not the rim pawns.'),
    ], 'The London break is e3-e4. Get the pieces ready, then push.', { kind: 'break' }),
    plan('p4', 'd4 d5 Bf4 Nf6 e3 e6 Nf3 Be7', 'White to move. Which of these is the sign that you got the London bishop right?', [
      opt('It is outside the pawn chain, on the b8-h2 diagonal, so e3 does not lock it in', true, 'Exactly. That is the whole reason for playing Bf4 before e3. The bishop does its job and the pawn chain stays healthy.'),
      opt('It sits on g5, pinning the knight', false, 'That is a different opening (the Torre). In the London the bishop stays on the f4-g3 diagonal.'),
      opt('It is still on c1, waiting', false, 'A bishop locked behind e3 is the classic problem of other queen-pawn openings. The London solves it.'),
    ], 'Bishop out first, then e3.'),
    plan('p5', 'd4 d5 Bf4 Nf6 e3 e6 Nf3 Bd6', 'Black offers to trade your bishop. What do you do?', [
      opt('Bg3. Keep the bishop. If Black takes, hxg3 gives you a free open h-file', true, 'Yes. You keep the good bishop and, if Black captures, the h-file becomes a highway for your rook.', 'Bg3', 'g:f4g3'),
      opt('Bxd6, trade the bishops', false, 'It is not terrible, but you give up your best piece and hand Black a healthy pawn on d6. Keep the bishop.'),
      opt('Ignore it and develop with Nc3', false, 'Then you have simply lost a bishop for nothing. Always look at what has just been captured.'),
    ], 'Offered a trade? Retreat to g3 and keep your good bishop.'),
  ],
  traps: [],
});

export const ch2 = chapter({
  id: 'bd6',
  title: 'Against ...Bd6: keep your bishop',
  blurb: 'Black offers to swap your London bishop. You keep it, or take on h-file chances.',
  coach: `Black's ...Bd6 asks a question: will you trade your London bishop? The answer is almost always no. Bg3 keeps the bishop alive, and if Black takes it, the h-pawn recaptures and you get an open file for free.`,
  tip: 'Keep your bishop with Bg3. If Black trades, recapture with the h-pawn and use the open file.',
  src: `${OPEN}
 Nf6 {Black develops.}
 3.e3 {The pawn chain is built and the f1-bishop is free.}
 e6 {The usual solid set-up.}
 4.Nf3 {Develop and guard d4.}
 Bd6 {The bishop trade offer.}
 5.Bg3 {Keep your bishop. This is the move that gives the London its staying power. @a g:g3d6 @x Bxd6: After Bxd6 cxd6 (or Qxd6) Black gets a healthy centre and your best piece is gone. Keep it.}
 O-O {Black castles.}
 (Bxg3 {Black takes your bishop.}
  6.hxg3 {Recapture with the h-pawn. Your rook now looks down the h-file, and the g-pawn can go to g4 later. @a g:h1h7 @x fxg3: fxg3 opens the f-file for Black and weakens e3. hxg3 is the right pawn.}
  c5 {Black hits d4.}
  7.c3 {Support d4.}
  Nc6 {Another attacker on d4.}
  8.Nbd2 {Develop with a plan: Ne5 and Qc2 are coming.}
  Qe7 {Black develops the queen.}
  9.Ne5 {The outpost again. The knight eyes c6 and f7. @a g:e5c6}
  Bd7 {Black unpins and develops.}
  10.Ndf3 {Add a second piece to the centre. @d After the exchange on g3, your open h-file is a long-term asset. Castle short or long and aim the rook at Black's king.})
 (Ne4 {Black jumps in with the knight to attack your bishop.}
  6.Bxd6 {Now the trade is good for you: it removes the knight's protection and gets your development moving.}
  cxd6 {Recapture with the pawn.}
  7.Bd3 {Challenge the knight. It cannot stay on e4. @a g:d3e4}
  Nf6 {The knight retreats.}
  8.O-O {Castle and keep it simple.}
  O-O {Black castles.}
  9.c4 {Now you have a good centre and more space.})
 6.Nbd2 {The knight supports e4 and keeps the pawn centre intact.}
 c5 {Black hits d4.}
 (Nbd7 {Black develops the other knight.}
  7.Bd3 {Develop. Black can't do much about the e4 break.}
  b6 {Black prepares ...Bb7.}
  8.e4 {Open the centre while Black's pieces are still undeveloped.})
 (b6 {Black plans ...Bb7.}
  7.Bd3 {Develop and keep the bishop on the attacking diagonal.}
  Bb7 {Black develops.}
  8.Ne5 {Plant the knight. Black must now think about how to challenge it.}
  c5 {Black hits d4.}
  9.c3 {Support d4.}
  Nc6 {Another attacker on d4.}
  10.Nxc6 {Trade the knight for the one that hits d4.}
  Bxc6 {Black recaptures with the bishop.}
  11.O-O {Castle. You are comfortable and have more space.})
 (Qe7 {Black develops the queen.}
  7.Bd3 {Develop and keep an eye on e4.}
  c5 {Black hits d4.}
  8.c3 {Support d4.}
  Nc6 {Another attacker on d4.}
  9.Ne5 {The outpost.}
  Nd7 {Black offers a knight trade.}
  10.f4 {Support the knight on e5 and build a Stonewall-like formation.})
 7.c3 {Support d4 with a pawn.}
 Nc6 {Another attacker on d4.}
 8.Bd3 {Develop the bishop. Black cannot win d4: c3, e3 and the knight on f3 all guard it.}
 b6 {Black prepares ...Bb7.}
 (g6 {Black prepares ...Nh5 to hit your bishop.}
  9.Qe2 {Watch the e4 square and keep the queen near the kingside.}
  Nh5 {Black attacks the bishop on g3.}
  10.Bh4 {Do not allow ...Nxg3. Bh4 keeps the bishop on the board and eyes e7. @a g:h4d8}
  Be7 {Black offers a trade.}
  11.Bxe7 {Trade only when it helps you. Now the knight on h5 is short of squares.}
  Qxe7 {Black recaptures.}
  12.g4 {The knight on h5 has no good retreat. Black must give up a pawn or play ...Nf6 and allow the attack. @a g:g4h5 @d Always check that your bishop is safe. When Black's knight comes to h5, retreat the bishop to h4 and do not allow the trade on g3 unless you want it.})
 9.Qe2 {The queen supports e4, and Black has not solved the problem of the bishop on d6. @a g:e2e4}
 Bb7 {Black develops.}
 10.e4 {The central break. Black cannot ignore it. @a g:e3e4}
 dxe4 {Black takes.}
 11.Nxe4 {Recapture with the knight, which now hits Black's king and e5. @a g:e4f6}
 Nxe4 {Black trades.}
 12.Bxe4 {Recapture with the bishop. Your pieces now point at Black's king, so look for Qd3 and Rd1.}
 cxd4 {Black takes the pawn first.}
 13.O-O-O {Castle long; the d4 pawn is weak and your rooks are ready. @d After e4 and the knight trade, your bishops point at Black's king. Look for a rook on d1.}`,
  plans: [
    plan('p1', 'd4 d5 Bf4 Nf6 e3 e6 Nf3 Bd6 Bg3 Bxg3', 'Black took your bishop. How do you recapture, and why?', [
      opt('hxg3. The h-file opens for your rook and your pawn centre stays intact', true, 'Right. The doubled-looking g3 pawn is not a weakness, and the open h-file is a gift for a London player who attacks on the kingside.', 'hxg3', 'g:h2g3'),
      opt('fxg3. It gives you a central pawn', false, 'The f-pawn is part of your king shelter and e3 loses its pawn support. You also lose the possibility of a proper e3-e4.'),
      opt('Ignore it and play Nc3', false, 'Then you are simply a bishop down. Always look at what has just been captured.'),
    ], 'After Bxg3, recapture with the h-pawn.'),
    plan('p2', 'd4 d5 Bf4 Nf6 e3 e6 Nf3 Bd6 Bg3 O-O Nbd2 c5 c3 Nc6', 'What is the most important job of the c3 pawn here?', [
      opt('It guards d4 so Black cannot win the centre pawn', true, 'Yes. d4 is attacked twice (c5 and Nc6) and defended by e3, c3 and the Nf3. That is why Black cannot make progress.'),
      opt('It prepares b4', false, 'b4 is possible, but the first job of the c-pawn is to guard d4. Safety first.'),
      opt('It gives the queen the c2 square', false, 'That is a side effect. The priority is that d4 never hangs.'),
    ], 'Count attackers and defenders on d4. Keep it defended.'),
    plan('p3', 'd4 d5 Bf4 Nf6 e3 e6 Nf3 Bd6 Bg3 O-O Nbd2 c5 c3 Nc6 Bd3 b6 Qe2 Bb7', 'Which move breaks open the centre now?', [
      opt('e4. All your pieces are ready for it', true, 'Yes. The queen, the Bd3 and the Nd2 all support e4. Black has to take, and your pieces flood out.', 'e4', 'g:e3e4'),
      opt('h4, going after the king', false, 'The kingside pawn attack is a different plan, and Black has not weakened his king. Stay central.'),
      opt('a3, preventing ...Bb4', false, 'There is no ...Bb4 here (the bishop is on d6). The move wastes a tempo.'),
    ], 'When your pieces all support e4, play e4.', { kind: 'break' }),
    plan('p4', 'd4 d5 Bf4 Nf6 e3 e6 Nf3 Bd6 Bg3 O-O Nbd2 c5 c3 Nc6 Bd3 g6', 'Black prepares ...Nh5. Which reply keeps your bishop?', [
      opt('Qe2. Then after ...Nh5, Bh4', true, 'Yes. The queen is useful anyway, and Bh4 keeps the bishop from being traded on g3 when you do not want it.', 'Qe2'),
      opt('Bh4 right now', false, 'It works but wastes a tempo before Black has even played ...Nh5. Make a useful move first.'),
      opt('Be5, pinning the knight to nothing', false, 'Be5 can be answered by ...Bxe5 and ...Nxe5, and you have lost your bishop pair for nothing.'),
    ], 'When the knight comes to h5, the bishop goes to h4.'),
  ],
  traps: [],
});
