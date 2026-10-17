// London System, chapters 9-12 (early ...c5 and the ...e5 gambits, ...Nc6 and ...b6 set-ups, typical middlegames, traps).
import { avoid, chapter, opt, plan, win } from '../course.ts';
import { OPEN } from './london-a.ts';

export const ch9 = chapter({
  id: 'gambits',
  title: 'Against ...c5 at once and the ...e5 gambits',
  blurb: 'Benoni-style ...c5 first, plus the Budapest and Englund tricks. Know the answer before it happens.',
  coach: `Some opponents will not let you play your London. They hit with ...c5 on move one, or throw a pawn at you with ...e5. Neither is scary. Against ...c5 you simply take space with d5. Against the ...e5 gambits, you take the pawn and your bishop on f4 is fantastic, because it already covers e5.`,
  tip: 'Against an early ...c5 push d5. Against a gambit pawn on e5, take it, and use the London bishop on f4 to defend it.',
  src: `1.d4 {The London starts with the centre pawn.}
 c5 {Black hits the pawn at once with a Benoni-style ...c5.}
 2.d5 {Take space. The pawn on d5 cramps Black, and Black's pieces are short of squares. @a g:d5d6}
 e6 {Black attacks the pawn at once.}
 (Nf6 {Black develops and keeps the structure flexible.}
  3.Nc3 {Develop and prepare e4.}
  d6 {Black prepares ...g6.}
  4.e4 {Take the centre.}
  g6 {Black fianchettoes.}
  5.Nf3 {Develop.}
  Bg7 {Black develops.}
  6.Be2 {Develop and prepare to castle.}
  O-O {Black castles.}
  7.O-O {Castle: your king is safe and the centre is yours.})
 (g6 {Black fianchettoes at once.}
  3.e4 {Take the centre.}
  d6 {Black prepares ...Bg7.}
  4.Nc3 {Develop.}
  Bg7 {Black develops.}
  5.Nf3 {Develop.}
  Nf6 {Black develops.}
  6.Be2 {Develop and prepare to castle.}
  O-O {Black castles.}
  7.O-O {Castle: your king is safe and the centre is yours.})
 3.e4 {Take the centre. Black must decide whether to open the position.}
 exd5 {Black takes.}
 4.exd5 {Recapture with the pawn. The space on d5 is yours.}
 d6 {Black solidifies.}
 5.Nc3 {Develop.}
 g6 {Black fianchettoes.}
 6.Bb5+ {A check with a point: Black must block or move the king, and Black's king is stuck in the centre. @a g:f1b5}
 Bd7 {Black blocks.}
 (Nd7 {Black blocks with the knight.}
  7.Nf3 {Develop, and Black's knight is pinned to the king.}
  Bg7 {Black develops.}
  8.O-O {Castle: your king is safe and the pin stays.})
 7.Qe2+ {Another check, and Black cannot castle. The pieces come out with tempo.}
 Be7 {Black blocks again.}
 8.Bf4 {Develop with tempo. Black's d6 pawn is under pressure.}
 Kf8 {Black gives up castling to avoid the pin.}
 9.O-O-O {Castle long and bring the rook to the open d-file. @d Against an early ...c5, take space with d5 and use your pieces; the London bishop can wait.}`,
  plans: [
    plan('p1', 'd4 c5', 'Black hits d4 at once, before you have developed. What is the cleanest answer?', [
      opt('d5. Take space and cramp Black’s pieces', true, 'Yes. The pawn on d5 is safe, Black has no easy way to challenge it, and you get a comfortable space advantage.', 'd5', 'g:d4d5'),
      opt('e3, supporting d4', false, 'e3 is the London move, but after ...cxd4 exd4 you have given Black free development and the centre pawn is not worth much. d5 is stronger.'),
      opt('Bf4, ignoring ...c5', false, 'Then ...cxd4 Qxd4?? Nc6 wins a tempo on the queen. Respond to the pawn first.'),
    ], 'Against an early ...c5, push d5 and take space.'),
    plan('p2', 'd4 Nf6 Bf4 e5 dxe5 Ng4', 'Black plays the Budapest idea ...Ng4. How do you punish it?', [
      opt('h3. Kick the knight: Nxe5 loses a piece to Bxe5', true, 'Yes. The knight on g4 has nowhere good to go: ...Nxe5 Bxe5 loses a piece, and ...Nh6 leaves White a pawn up with a good position.', 'h3', 'g:h2h3'),
      opt('Bg3, hiding the bishop', false, 'The bishop is not in danger. h3 kicks the knight and you keep the pawn.'),
      opt('Qd2. Attack the knight with the queen', false, 'It also attacks the knight, but ...Nc6 gives Black time to bring his pieces. h3 wins more and keeps the queen at home.', 'Qd2'),
    ], 'In the Budapest, the pawn you grabbed is safe. Kick the knight with h3.'),
    plan('p3', 'd4 e5', 'Black offers a pawn with ...e5. Which move is wrong for a London player?', [
      opt('Bf4?? The bishop is simply taken by ...exf4', true, 'Yes! This is the classic London reflex mistake. The pawn on e5 attacks f4, so the bishop hangs. Take the pawn first with dxe5.', undefined, 'g:d4e5'),
      opt('dxe5. Take the pawn', false, 'Perfect: that is the right move, not a wrong one. After dxe5 your bishop can come to f4 safely.'),
      opt('Nf3, developing', false, 'That is also fine: ...exd4 Nxd4 gives you an open game. But dxe5 is simpler.'),
    ], 'Before you play Bf4, check whether Black has a pawn on e5 that can take it.'),
    plan('p4', 'd4 e5 dxe5 Nc6 Nf3 Qe7', 'The Englund Gambit. Black’s queen eyes b4 and your b2 pawn. What is the safest development?', [
      opt('Bf4. The bishop defends e5 and prepares Nbd2', true, 'Yes. Bf4 holds the extra pawn, and if ...Qb4+ you simply block and stay a pawn up.'),
      opt('Nc3, developing quickly', false, 'It is playable, but it allows ...Qb4 with threats against b2 and d4. The bishop is the most solid choice.'),
      opt('Qd5, defending with the queen', false, 'It can work, but the queen goes into the middle early. Keep it simple with Bf4.'),
    ], 'In a gambit, develop the piece that protects the pawn.'),
  ],
  traps: [
    win('w1', 'The Budapest knight grab', 'w', 'd4 Nf6 Bf4 e5 dxe5 Ng4 h3 Nxe5', 'Bxe5', 'Nc6 Bc3', 'After ...Nxe5? the knight is gone for nothing: Bxe5 wins a clean piece. The bishop on f4 was already pointing at e5, which is why the Budapest is so poor against it.', 'When a piece takes a pawn, count what recaptures. The bishop was the defender all along.', 'g:f4e5'),
    avoid('a1', 'The London reflex', 'w', 'd4 e5', 'Bf4', 'dxe5', 'exf4 Nh3', 'If you play the London bishop out on move two against ...e5, the pawn simply captures it. Take the gambit pawn first: dxe5.', 'Always ask what the opponent’s pawns attack before you move a bishop.', 'g:e5f4'),
  ],
});

export const ch10 = chapter({
  id: 'nc6-qid',
  title: 'Against ...Nc6 and Queen’s Indian set-ups',
  blurb: 'An early knight on c6, or ...e6 with ...b6. Same London, small adjustments.',
  coach: `Two more set-ups to meet. When Black puts a knight on c6, he hits d4 and sometimes jumps to b4. When he plays ...e6 with ...b6, he is aiming a bishop at your long diagonal and your kingside. Your London handles both: develop, protect d4, castle, and keep an eye on the squares the bishops watch.`,
  tip: 'Against ...Nc6 protect d4 and watch for ...Nb4 (a3 kicks it). Against ...b6 develop, castle and answer ...Bb4+ with Nbd2 or c3.',
  src: `${OPEN}
 Nc6 {Black develops the knight to attack d4.}
 3.e3 {Solid and sensible. If the knight jumps to b4, a3 kicks it.}
 Nf6 {Black develops.}
 4.Nf3 {Develop and guard d4.}
 e6 {Black prepares ...Bd6.}
 (Bg4 {Black pins the knight.}
  5.Nbd2 {Support the knight and be ready to meet ...Bxf3 with Nxf3.}
  e6 {Black solidifies.}
  6.h3 {Ask the bishop a question.}
  Bh5 {The bishop keeps the pin.}
  7.c3 {Support d4 and prepare Qb3.})
 (Nb4 {Black jumps to b4, but the knight is loose.}
  5.a3 {Kick the knight at once. It has no good square.}
  Nc6 {The knight returns.}
  6.c4 {Take space and attack d5.})
 5.Nbd2 {Develop with a plan. Bg3 is coming if Black offers a trade.}
 Bd6 {Black offers the bishop trade.}
 6.Bg3 {Keep the bishop.}
 O-O {Black castles.}
 7.Bd3 {Develop. All your pieces are now on good squares.}
 Qe7 {Black prepares ...e5 and eyes the e-file.}
 (b6 {Black prepares ...Bb7.}
  8.c3 {Support d4 and keep the queen's diagonal open.}
  Bb7 {Black develops.}
  9.Bh4 {Keep the bishop on the board; it eyes the queen's diagonal.})
 (Ne4? {Black jumps in with the knight, but it simply loses a pawn.}
  8.Nxe4 {Take the knight. Black cannot recapture well.}
  dxe4 {Black recaptures with the pawn.}
  9.Bxe4 {Win the pawn. @d When an opponent puts a piece on e4 and you can trade it, check whether the recapture loses a pawn.})
 8.Ne5 {Plant the knight before Black plays ...e5. @a g:f3e5}
 Nd7 {Black offers a trade.}
 9.Nxc6 {Trade the knight and wreck Black's pawns.}
 bxc6 {Black recaptures.}
 10.c4 {Take space and attack d5. You have a small, safe edge.}
`,
  plans: [
    plan('p1', 'd4 d5 Bf4 Nc6 e3 Nf6 Nf3 Nb4', 'Black’s knight jumps to b4, threatening Nc2+. What do you play?', [
      opt('a3. Kick the knight; it has no good square', true, 'Yes. The knight must retreat, and you have gained a tempo. Never let it sit on b4 and fork things.', 'a3', 'g:a2a3'),
      opt('Na3, blocking c2', false, 'The knight on a3 is badly placed and blocks the a-pawn. a3 itself solves the problem.'),
      opt('Bxb8, removing a piece', false, 'There is no piece to capture on b8, and your bishop would be in a strange place anyway.'),
    ], 'Kick a knight on b4 with a3.'),
    plan('p2', 'd4 Nf6 Bf4 e6 e3 b6', 'Black plays ...b6, aiming a bishop at the long diagonal. What is a good set-up?', [
      opt('Nf3, Bd3, castle and h3 if needed', true, 'Yes. You keep the London structure and answer ...Bb4+ with Nbd2 or c3. Nothing in your position is weak.', 'Nf3'),
      opt('Qf3, pressing b7', false, 'It is aggressive, but the queen comes out early and Black can gain time with ...d5 and ...Nc6. Develop first.'),
      opt('Bg5, pinning the knight', false, 'You trade your London bishop for nothing special. Keep it.'),
    ], 'Against a Queen’s Indian set-up, develop calmly: Nf3, Bd3 and castle.'),
    plan('p3', 'd4 Nf6 Bf4 e6 e3 b6 Nf3 Bb7 Bd3 Bb4+', 'Black checks on b4. How do you respond?', [
      opt('Nbd2. Develop with tempo: it blocks the check and develops a piece', true, 'Yes. Nbd2 blocks, develops and prepares c3 if needed. Black’s bishop is now facing a solid structure.', 'Nbd2'),
      opt('Kf1, avoiding the block', false, 'Giving up castling for no reason. Just block the check with a developing move.'),
      opt('c3, forcing the bishop away', false, 'It also works, but blocking with the knight develops a piece. Both are fine.'),
    ], 'Answer a check by blocking with a developing move whenever you can.'),
    plan('p4', 'd4 d5 Bf4 Nc6 e3 Nf6 Nf3 e6 Nbd2 Bd6 Bg3 O-O Bd3 Ne4', 'Black jumps in with ...Ne4. What is the right idea?', [
      opt('Nxe4 dxe4 Bxe4: take the knight and win the pawn on e4', true, 'Yes. After the trade the pawn on e4 is attacked by your bishop and cannot be defended well.', 'Nxe4', 'g:d2e4'),
      opt('Bxd6, giving up the London bishop', false, 'It is not wrong, but Nxe4 is simpler and wins a pawn.'),
      opt('Ignore it and play O-O', false, 'The knight on e4 attacks your bishop on g3. If you ignore it you lose a bishop for nothing.'),
    ], 'When a knight jumps into your territory, ask if you can win it or the pawn behind it.'),
  ],
  traps: [],
});

export const ch11 = chapter({
  id: 'middlegames',
  title: 'Typical middlegames',
  blurb: 'Ne5 and the kingside, the e3-e4 break, and what to do after ...cxd4.',
  coach: `Once the opening is done, the London becomes a middlegame with three common plans. One: plant a knight on e5, trade off Black's best defender, and play on the kingside. Two: break in the centre with e3-e4 when your pieces are ready. Three: if Black takes ...cxd4, recapture and use the open files. We walk through a model line for each.`,
  tip: 'Pick one plan for the position: a knight on e5 plus an attack, the e4 break, or play on the files after ...cxd4.',
  src: `${OPEN}
 Nf6 {Black develops the knight.}
 3.e3 {Solid and ready for Bd3.}
 e6 {Black solidifies.}
 4.Nf3 {Develop and eye e5.}
 Bd6 {Black offers the bishop trade.}
 5.Bg3 {Keep the bishop.}
 O-O {Black castles.}
 6.Nbd2 {Develop with a plan.}
 c5 {Black strikes at d4.}
 7.c3 {Support d4.}
 Nc6 {Another attacker on d4.}
 8.Bd3 {Develop. Now Ne5 is the idea.}
 Qe7 {Black prepares ...e5.}
 (cxd4 {Black takes at once.}
  9.cxd4 {Recapture with the c-pawn and open the c-file. The pawn on d4 is safe.}
  h6 {Black makes luft.}
  10.a3 {Stop ...Bb4 tricks and keep the bishop on b5 under control.}
  Bxg3 {Black trades the bishops.}
  11.hxg3 {Recapture with the h-pawn; the h-file is open for your rook.}
  Qd6 {Black eyes g3.}
  12.O-O {Castle and bring the rooks to the c-file.})
 9.Ne5 {Plant the knight before Black plays ...e5. @a g:e5c6}
 Nd7 {Black offers a trade.}
 10.Ndf3 {Keep a knight on e5 and bring another piece to the party.}
 f6 {Black kicks the knight.}
 11.Nxc6 {Take the c6 knight so that ...f6 loses time.}
 bxc6 {Black recaptures.}
 12.Qc2 {Fight for the e4 square and eye h7: now Bxh7+ is a threat. @a g:c2h7}
 g6 {Black stops the Bxh7+ threat and closes the diagonal.}
 13.O-O {Castle. The queen and bishop stay aimed at the kingside.}
 a5 {Black grabs some queenside space.}
 14.Rfe1 {Bring the last piece into play.}
 a4 {Black pushes on.}
 15.Be2 {Retreat and keep an eye on the centre and the b-pawn.}
 Bxg3 {Black trades off the bishop.}
 16.hxg3 {The h-file is open for your rook, and you have a small edge. @d When the knight on e5 is kicked by ...f6, trade it on c6 and keep your pieces coordinated.}`,
  plans: [
    plan('p1', 'd4 d5 Bf4 Nf6 e3 e6 Nf3 Bd6 Bg3 O-O Nbd2 c5 c3 Nc6 Bd3 Qe7', 'Black prepares ...e5. What is your most important job?', [
      opt('Ne5. Take the key square before Black does', true, 'Yes. The knight on e5 blocks his central pawn break, hits c6 and f7, and cannot be driven away cheaply.', 'Ne5', 'g:f3e5'),
      opt('h4, chasing the king', false, 'The attack comes later. If Black plays ...e5 first you have lost the key square.'),
      opt('a3, preparing b4', false, 'A slow queenside plan that gives Black time for ...e5.'),
    ], 'If your opponent is about to take a key square, take it first.'),
    plan('p2', 'd4 d5 Bf4 Nf6 e3 e6 Nf3 Be7 Bd3 O-O Nbd2 c5 c3 Nc6 Ne5 Nxe5 dxe5 Nd7', 'You have won e5 with a pawn. Which plan is the most natural?', [
      opt('Qh5, with Bd3 and the queen aiming at the king', true, 'Yes. Black’s knight left f6, so h7 is under pressure. The queen on h5 and the bishop on d3 are a strong team.', 'Qh5', 'g:d1h5'),
      opt('Bg3, hiding', false, 'You wasted your attacking chance. The bishop is already safe on f4.'),
      opt('b3, solving your queenside', false, 'This is slow, and you give Black time to rearrange his pieces. Attack while the knight is away.'),
    ], 'When the defender leaves the kingside, bring the queen and the bishop to attack.'),
    plan('p3', 'd4 d5 Bf4 Nf6 e3 e6 Nf3 Bd6 Bg3 O-O Nbd2 c5 c3 Nc6 Bd3 cxd4', 'Black takes ...cxd4. How do you recapture?', [
      opt('cxd4. Open the c-file for your rook and keep the e-pawn', true, 'Yes. The c-file becomes your highway, your pawn on d4 is protected by the knight and the e3 pawn, and your structure stays healthy.', 'cxd4'),
      opt('exd4. Open the e-file', false, 'It is playable, but you lose the e3 pawn’s support for the centre and the bishop on g3 has less to look at. cxd4 is more natural here.'),
      opt('Nxd4, trading pieces', false, 'The knight on f3 is needed to defend d4. Capturing with the pawn keeps things in order.'),
    ], 'After ...cxd4, think about which pawn recapture gives you the open file you want.'),
    plan('p4', 'd4 d5 Bf4 Nf6 e3 e6 Nf3 Bd6 Bg3 O-O Nbd2 c5 c3 Nc6 Bd3 b6 Qe2 Bb7', 'All of your pieces are ready. Which break is thematic?', [
      opt('e4. The queen, the bishop and the knight all support it', true, 'Yes. The break opens the centre while your pieces are better developed.', 'e4', 'g:e3e4'),
      opt('g4, starting a pawn storm', false, 'It weakens your own king with nothing yet attacking Black’s. First open the centre.'),
      opt('a4, stopping everything', false, 'Slow and aimless. Strike in the centre.'),
    ], 'When all your pieces support the central break, play it.'),
    plan('p5', 'd4 d5 Bf4 Nf6 e3 e6 Nf3 Bd6 Bg3 O-O Nbd2 c5 c3 Nc6 Bd3 Qe7 Ne5 Nd7 Ndf3 f6', 'Black kicks your knight with ...f6. What is the sensible reply?', [
      opt('Nxc6. Trade the knight so ...f6 has weakened Black’s own king', true, 'Yes. After ...bxc6 Black has weak pawns and the f6 push has left his king diagonal open.', 'Nxc6'),
      opt('Nxd7, keeping the pawn structure', false, 'Hmm, possible, but the knight on c6 is the more dangerous piece to remove, and the recapture on c6 damages his pawns.'),
      opt('Ng4, retreating to the rim', false, 'The knight on the rim is out of play and Black simply plays ...Qxe3 or ...h5. Trade it.'),
    ], 'When your outpost piece is attacked, trade it for something useful.'),
  ],
  traps: [],
});

export const ch12 = chapter({
  id: 'traps',
  title: 'Traps and tricks',
  blurb: 'Two directions: tricks that win material when Black errs, and tricks to avoid yourself.',
  coach: `The best way to stop falling for traps is to learn them from both sides. In this chapter you will meet positions where Black has just made a natural-looking mistake, and positions where the natural London move is a blunder. Take your time on each one, and read the explanation. A trap you know is a trap you will never fall for.`,
  tip: 'Before you move, ask what the opponent threatens, and before you capture, count what recaptures.',
  src: `${OPEN}
 Nf6 {Black develops.}
 3.e3 {Solid and sensible.}
 e6 {Black solidifies.}
 4.Nf3 {Develop.}
 Be7 {Black develops.}
 5.Bd3 {Develop. The bishop eyes h7.}
 O-O {Black castles.}
 6.Nbd2 {Develop.}
 c5 {Black hits d4.}
 (Ne4? {Black jumps in, but loses a pawn to a simple trade.}
  7.Nxe4 {Take the knight.}
  dxe4 {Black recaptures.}
  8.Bxe4 {Win the pawn: the bishop takes e4 and the pawn cannot be protected. @d When a knight jumps to e4 and you can take it, check whether Black can recapture without losing a pawn.}
  f5 {Black attacks the bishop.}
  9.Bd3 {Retreat and keep the extra pawn.})
 7.c3 {Support d4 with a pawn.}
 Nc6 {Black develops.}
 8.Ne5 {Plant the knight on the outpost.}
 Nd7 {Black offers a trade.}
 9.O-O {Castle: your king is safe and the knight stays on e5.}
 a5 {Black grabs some queenside space.}
 10.a4 {Stop ...a4 and keep the queenside under control.}
 Ncxe5 {Black takes the knight.}
 11.dxe5 {Recapture with the pawn: e5 cramps Black.}`,
  plans: [
    plan('p1', 'd4 e5', 'Black offers the gambit pawn. Why is Bf4 a blunder here?', [
      opt('The pawn on e5 attacks f4, so ...exf4 wins the bishop', true, 'Exactly. London players who play Bf4 on autopilot lose a bishop for nothing. Take with dxe5 first.'),
      opt('The bishop is pinned to the queen', false, 'There is no pin. The reason is much simpler: the pawn captures the bishop.'),
      opt('It blocks the c-pawn', false, 'It does not. The problem is an attack on the bishop by a pawn.'),
    ], 'Before you develop a piece, check which enemy pawns attack its destination square.'),
    plan('p2', 'd4 d5 Bf4 Nf6 e3 e6 Nf3 Be7 Bd3 Nh5', 'Black attacks your bishop on f4 with ...Nh5. Is Bxh7 a good idea?', [
      opt('No. After ...Nxf4 exf4 Rxh7 you have lost a piece', true, 'Correct. The knight takes the bishop first and the rook takes the bishop on h7. Greedy and wrong. Be5 or Bg3 is the safe reply.'),
      opt('Yes, Greek gift! Always win the pawn', false, 'The Greek gift needs your attackers to arrive first. Here Black simply trades the bishop on f4 and wins on h7.'),
      opt('Only if the queen supports it', false, 'Even with the queen on d1, the knight on h5 takes the f4 bishop before your attack starts.'),
    ], 'Do not play a Greek gift without counting who is still defending.'),
    plan('p3', 'd4 e5 dxe5 Nc6 Nf3 Qe7 Bf4 Qb4+ Bd2 Qxb2', 'Black has grabbed b2 in the Englund Gambit. Which reply wins?', [
      opt('Nc3. Threaten Rb1 and trap the queen', true, 'Yes. Nc3 threatens Rb1, and the queen on b2 has few squares. Black’s bishop on b4 is the only defence, and you win material.', 'Nc3', 'g:b1c3'),
      opt('Bc3, hitting the queen', false, 'It looks natural but ...Bb4! pins the bishop and the queen cannot be trapped: Black wins material. Nc3 is the move.', 'Bc3'),
      opt('Qc1, protecting the rook', false, 'Too slow. The queen on b2 is already attacking your rook and your bishop.'),
    ], 'Look at the trap before you play the "natural" move.'),
    plan('p4', 'd4 d5 Bf4 Nf6 e3 c5 c3 Qb6 Qb3 c4 Qc2 Bf5', 'Black has just played ...Bf5, attacking your queen on c2. What do you do?', [
      opt('Qxf5. The bishop is undefended', true, 'Yes. The bishop moved to f5 without protection, and the queen simply takes it.', 'Qxf5', 'g:c2f5'),
      opt('Qd2, to avoid the attack', false, 'You do not have to avoid it: the bishop is loose. Just capture it.'),
      opt('Nbd2, developing', false, 'The bishop would take your queen. Capture it first.'),
    ], 'Look for undefended pieces after every opponent move.'),
  ],
  traps: [
    avoid('a1', 'The London reflex vs ...e5', 'w', 'd4 e5', 'Bf4', 'dxe5', 'exf4 Nh3', 'The pawn takes the bishop. Always check what enemy pawns attack before you place a bishop.', 'Pawns capture. Before a bishop move, check which pawns attack the square.', 'g:e5f4'),
    avoid('a2', 'The greedy Greek gift', 'w', 'd4 d5 Bf4 Nf6 e3 e6 Nf3 Be7 Bd3 Nh5', 'Bxh7', 'Be5', 'Nxf4 exf4 Rxh7', 'Black’s knight takes your bishop on f4 first, and then the rook takes on h7. Without Ng5 and the queen in place, Bxh7 simply loses a piece.', 'A Greek gift needs your pieces in place first.', 'g:d3h7'),
    avoid('a3', 'The Englund trap', 'w', 'd4 e5 dxe5 Nc6 Nf3 Qe7 Bf4 Qb4+ Bd2 Qxb2', 'Bc3', 'Nc3', 'Bb4 Qd2 Bxc3 Nxc3 Qxa1+ Nd1', 'The famous Englund trap: Bc3 attacks the queen, but ...Bb4! pins the bishop and wins material for Black. Nc3 threatens Rb1 and wins the queen’s freedom.', 'The obvious attacking move can be the losing one. Look at the reply first.', 'g:b1c3'),
    win('w1', 'The loose bishop', 'w', 'd4 d5 Bf4 Nf6 e3 c5 c3 Qb6 Qb3 c4 Qc2 Bf5', 'Qxf5', 'e5 dxe5 Ne4', 'Black’s ...Bf5 offers a free bishop. The queen on c2 takes it, and ...e5 does not bring enough compensation. Always check if a piece is hanging.', 'Check what has become loose after the opponent’s last move.', 'g:c2f5'),
    win('w2', 'The knight jump', 'w', 'd4 d5 Bf4 Nf6 e3 e6 Nf3 Be7 Bd3 O-O Nbd2 Ne4', 'Nxe4', 'dxe4 Bxe4 f5 Bd3', 'The knight on e4 is trading itself away, and the e4 pawn cannot be held. Take, recapture, and take the pawn.', 'Count the trade to the end. Here it nets a pawn.', 'g:d2e4'),
    win('w3', 'The ...Bxg3 mistake', 'w', 'd4 d5 Bf4 Nf6 e3 e6 Nf3 Bd6 Bg3 Ne4 Nbd2 Nxg3 hxg3 Bxg3', 'fxg3', 'Qd6 Kf2', 'Black’s bishop captures a pawn that is poisoned: fxg3 wins the bishop, because after the recapture the g3 bishop is simply gone.', 'Poisoned pawns: always look at what recaptures.', 'g:f2g3'),
    win('w4', 'The b2 grab backfires', 'w', 'd4 d5 Bf4 c5 e3 Nc6 Nf3 Qb6', 'Nc3', 'Qxb2 Nxd5 Bf5 Rb1 Qxa2 Nc7+ Kd8 Nxa8', 'The queen goes for b2 but the knight arrives with threats against d5 and c7. Black’s king and pieces cannot hold everything together.', 'A queen that grabs a pawn can become the target.', 'g:b1c3'),
  ],
});
