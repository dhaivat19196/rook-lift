// Black vs 1.e4 with 1...e5: the old repertoire lines (Italian and Two Knights, Scotch, Petrov, Four Knights), now as a small course.
import type { Course } from '../types.ts';
import { avoid, chapter, opt, plan, win } from '../course.ts';

const E4E5 = `1.e4 {White takes the centre and opens lines for the queen and the f1-bishop.}
 e5 {The most direct reply. You claim the centre and open lines for your bishop and queen.}
 2.Nf3 {White develops with an attack on e5.}`;

const italian = chapter({
  id: 'italian',
  title: 'Italian Game and Two Knights',
  blurb: 'Meet 3.Bc4 with ...Nf6. Castle, support e5 and be ready for ...d5.',
  coach: `The Italian is the opening you meet most after 1.e4 e5. White points the bishop at f7. You answer with ...Nf6 and a calm set-up: ...Be7, castle, ...d6. The sharp tries, Ng5 and d4, have simple answers, and you will learn them here.`,
  tip: 'Meet 3.Bc4 with ...Nf6, castle, support e5 with ...d6, and answer Ng5 with ...d5.',
  src: `${E4E5}
 Nc6 {Defend the pawn and develop with a purpose.}
 3.Bc4 {The Italian Game. The bishop eyes the weak f7 pawn.}
 Nf6 {The Two Knights Defence. You develop with a counter-attack on e4.}
 4.d3 {The quiet Giuoco Pianissimo: White supports e4 and prepares c3 and d4.}
 (Ng5 {The Fried Liver try. White attacks f7 at once.}
  d5 {The best reply: strike in the centre.}
  5.exd5 {White takes.}
  Na5 {Attack the bishop and keep your structure. Do not take on d5 with the knight, because Nxf7 comes.}
  6.Bb5+ {White checks.}
  c6 {Block and attack the bishop.}
  7.dxc6 {White takes.}
  bxc6 {Recapture and attack the bishop.}
  8.Be2 {The bishop retreats.}
  h6 {Kick the knight.}
  9.Nf3 {The knight retreats.}
  e4 {Gain space with tempo.}
  10.Ne5 {The knight lands on e5.}
  Bc5 {Develop with pressure on f2.}
  11.c3 {White supports d4.}
  O-O {Castle: your king is safe.}
  12.O-O {White castles too.}
  Qc7 {Develop the queen and attack the knight.})
 (Nc3 {White develops.}
  Bc5 {Develop the bishop with pressure on f2.}
  5.O-O {Castle: your king is safe.}
  d6 {Support e5.}
  6.d3 {Support e4.}
  O-O {Castle: your king is safe.}
  7.Bg5 {Pin the knight.}
  h6 {Ask the bishop a question.}
  8.Bh4 {Keep the pin.})
 (d4 {The sharper try.}
  exd4 {Take the pawn.}
  5.O-O {White castles and offers a pawn.}
  Nxe4 {Take it: it is perfectly safe.}
  6.Re1 {Attack the knight.}
  d5 {Defend the knight with a pawn.}
  7.Bxd5 {White takes.}
  Qxd5 {Recapture with the queen.}
  8.Nc3 {Attack the queen.}
  Qa5 {Move the queen and keep the extra pawn.})
 Be7 {A solid developing move.}
 5.O-O {White castles.}
 O-O {You castle too.}
 6.Re1 {The rook supports the e4 pawn.}
 d6 {Support e5 and open the bishop.}
 7.c3 {White prepares d4.}
 Na5 {Hit the bishop and gain space.}
 8.Bb3 {The bishop retreats.}
 Nxb3 {Trade the bishop for your knight.}
 9.axb3 {Recapture.}
 c6 {Prepare ...d5 and give the queen a square.}
 10.Nbd2 {Develop.}
 Re8 {Take the open file.}
 11.Nf1 {The knight heads for g3.}
 c5 {Gain space and fix the structure. @d After 3.Bc4 Nf6, you castle, play ...d6, and wait for the right moment for ...d5.}`,
  plans: [
    plan('p1', 'e4 e5 Nf3 Nc6 Bc4', 'White plays 3.Bc4. What is the best way to develop?', [
      opt('Nf6. The Two Knights Defence counter-attacks e4', true, 'Yes. The knight on f6 develops with a threat on e4, and you stay flexible. The quiet 4.d3 gives you an easy game.', 'Nf6', 'g:g8f6'),
      opt('Bc5, copying White', false, 'The Giuoco Piano is fine too, but ...Nf6 gives you the choice of how to answer d3 or d4.'),
      opt('d6, supporting e5', false, 'It is passive, and 4.Nc3 Bg4 5.h3 invites a nasty trick. ...Nf6 is more active.'),
    ], 'Meet 3.Bc4 with ...Nf6 and a counter-attack on e4.'),
    plan('p2', 'e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5', 'White attacks f7 and has taken on d5. Which recapture is correct?', [
      opt('Na5. Attack the bishop and keep the structure', true, 'Yes. ...Nxd5? allows Nxf7 with a dangerous attack (the Fried Liver). ...Na5 is the safe move.', 'Na5', 'g:c6a5'),
      opt('Nxd5, recapturing at once', false, 'It looks natural, but Nxf7! leaves your king exposed. Avoid this at 650: play Na5.'),
      opt('Qxd5, grabbing with the queen', false, 'The queen on d5 is hit by Nc3 and loses time.'),
    ], 'Against the Fried Liver, play ...Na5, not ...Nxd5.'),
    plan('p3', 'e4 e5 Nf3 Nc6 Bc4 Nf6 d3 Be7 O-O O-O Re1 d6 c3', 'White prepares d4. What is the move that gives you a good game?', [
      opt('Na5. Hit the bishop and gain space', true, 'Yes. The knight on a5 pushes the bishop back, and after Bb3 Nxb3 axb3 you have a solid position with the bishop pair gone.', 'Na5', 'g:c6a5'),
      opt('a6, a waiting move', false, 'It is playable, but after d4 White gets the centre. The knight jump is more precise.'),
      opt('Bg4, pinning the knight', false, 'The bishop on g4 is hit by h3 and does not achieve much. Stick to the plan.'),
    ], 'When White prepares d4, hit the bishop with ...Na5.'),
    plan('p4', 'e4 e5 Nf3 Nc6 Bc4 d6 Nc3 Bg4 h3', 'White asks the bishop a question. Which reply avoids a quick checkmate?', [
      opt('Bxf3. Take the knight and play on', true, 'Right. After Qxf3 you have an ordinary position. ...Bh5? allows Nxe5! Bxd1 Bxf7+ Ke7 Nd5#, Legal’s Mate.', 'Bxf3', 'g:g4f3'),
      opt('Bh5, keeping the pin', false, 'It loses to Legal’s Mate: Nxe5! Bxd1 Bxf7+ Ke7 Nd5#.', 'Bh5'),
      opt('Bd7, retreating', false, 'It is safe, but you lose time. The simplest is to take the knight.'),
    ], 'When a pin looks dangerous, check for sacrifices on e5 and f7.'),
  ],
  traps: [
    avoid('a1', 'Legal’s Mate', 'b', 'e4 e5 Nf3 Nc6 Bc4 d6 Nc3 Bg4 h3', 'Bh5', 'Bxf3', 'Nxe5 Bxd1 Bxf7+ Ke7 Nd5#', 'The bishop retreats to h5 to keep the pin, but White sacrifices the queen with Nxe5! and mates with the knight and bishop. Take on f3 instead.', 'When the opponent offers a queen, look for a forced mate before you take it.', 'g:f3e5'),
  ],
});

const scotch = chapter({
  id: 'scotch',
  title: 'Scotch Game',
  blurb: 'White opens the centre. Take the pawn, trade the knights and hit e4.',
  coach: `In the Scotch, White opens the centre at once with 3.d4. The right reply is simple: take the pawn, attack e4 with ...Nf6, and trade the knights. After Nxc6 bxc6 the b-file opens, and your pieces come out with tempo. Play it calmly and you will like the positions.`,
  tip: 'Take on d4, attack e4 with ...Nf6, and recapture on c6 with the b-pawn.',
  src: `${E4E5}
 Nc6 {Defend the pawn and develop with a purpose.}
 3.d4 {The Scotch Game. White opens the centre at once.}
 exd4 {Take. White cannot recapture with a pawn.}
 4.Nxd4 {White recaptures and centralises the knight.}
 (Bc4 {The Scotch Gambit.}
  Bc5 {Develop and take aim at f2.}
  5.c3 {White prepares to rebuild the centre.}
  Nf6 {Counter-attack e4.}
  6.e5 {White pushes.}
  d5 {Hit the bishop and defend your knight.}
  7.Bb5 {Pin the knight.}
  Ne4 {The knight jumps into the centre.}
  8.cxd4 {White takes.}
  Bb6 {Retreat the bishop and keep control of d4.})
 Nf6 {Attack e4 and develop.}
 (Bc5 {A more active choice.}
  5.Be3 {White defends the knight.}
  Qf6 {Add a second attacker to d4.}
  6.c3 {Support the knight.}
  Nge7 {Develop.}
  7.Bc4 {Develop.}
  Ne5 {Hit the bishop.})
 5.Nxc6 {White trades the knight.}
 bxc6 {Recapture with the b-pawn: the b-file opens and your centre is strong.}
 6.e5 {White attacks the knight.}
 Qe7 {Hit the pawn on e5 and the knight at once.}
 7.Qe2 {Defend the pawn.}
 Nd5 {The knight lands on the centre square.}
 8.c4 {Kick the knight.}
 Ba6 {Pin the queen to the king: the queen cannot leave the diagonal.}
 9.b3 {Defend the c4 pawn and the queen.}
 f6 {Undermine the pawn on e5 at once. @d After 3.d4 exd4 4.Nxd4 Nf6 5.Nxc6 bxc6 6.e5 Qe7, you hit e5 and gain time.}`,
  plans: [
    plan('p1', 'e4 e5 Nf3 Nc6 d4', 'White opens the centre with 3.d4. What do you do?', [
      opt('exd4. Take the pawn and play ...Nf6 next', true, 'Yes. White cannot recapture with a pawn, and you attack e4 with ...Nf6 next. The Scotch gives you easy development.', 'exd4', 'g:e5d4'),
      opt('d6, defending e5', false, 'It gives White a free hand in the centre with dxe5 and Bb5+ ideas. Taking is better.'),
      opt('Nxd4, trading at once', false, 'You cannot take with the knight, because the pawn on e5 is attacked and the other knight is not defended.'),
    ], 'Against the Scotch, take the d4 pawn.'),
    plan('p2', 'e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Nf6 Nxc6', 'White takes your knight. How do you recapture?', [
      opt('bxc6. The b-pawn recaptures and opens the b-file', true, 'Right. The b-pawn gives you a strong centre, and the open b-file points at White’s queenside.', 'bxc6', 'g:b7c6'),
      opt('dxc6, with the d-pawn', false, 'It opens the d-file and the queens come off: Qxd8+ Kxd8 leaves you with a loss of castling. bxc6 is better.'),
      opt('Nxe4, grabbing a pawn', false, 'The pawn on e4 is attacked by your knight, but you must recapture on c6 first.'),
    ], 'Recapture with the b-pawn: it keeps your centre and opens a file.'),
    plan('p3', 'e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Nf6 Nxc6 bxc6 e5', 'White attacks your knight with e5. What is the right reply?', [
      opt('Qe7. Hit the pawn and the knight at once', true, 'Yes. The queen on e7 attacks e5 and the knight on f6 is defended. After Qe2 Nd5 you are comfortable.', 'Qe7', 'g:d8e7'),
      opt('Nd5, moving the knight first', false, 'It is playable but loses the tempo. After c4 you lose the knight’s centre post. ...Qe7 first is more accurate.'),
      opt('Ng4, attacking the pawn', false, 'The knight on g4 can be hit by Qe2 and h3. The queen move is better.'),
    ], 'When a pawn attacks your knight, find the move that attacks something in return.'),
    plan('p4', 'e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Nf6 Nxc6 bxc6 e5 Qe7 Qe2 Nd5 c4', 'The knight on d5 is attacked. What do you do?', [
      opt('Ba6. Pin the queen and the c4 pawn', true, 'Yes. The bishop on a6 attacks the c4 pawn, which is pinned to the queen. White has to defend with b3.', 'Ba6', 'g:c8a6'),
      opt('Nb6, retreating', false, 'It is also playable, but the knight is passive. Ba6 is much more active.'),
      opt('Nb4, hitting a2', false, 'The knight on b4 can be hit by a3, and the queen on e2 looks at the knight. The bishop move is better.'),
    ], 'When the knight is attacked, look for a move that gains a tempo.'),
  ],
  traps: [],
});

const petrov = chapter({
  id: 'petrov',
  title: 'Petrov Defence',
  blurb: 'Counter-attack e4. Kick the knight with ...d6 before taking the pawn.',
  coach: `The Petrov is a great way to meet 1.e4. After 3.Nxe5 do not take the pawn at once: kick the knight with ...d6 first, then take on e4. The order matters. After that, White's best tries lead to equal, easy positions, and the traps are mostly White's.`,
  tip: 'After 3.Nxe5 play ...d6 first and take on e4 only after the knight retreats.',
  src: `${E4E5}
 Nf6 {The Petrov Defence. You counter-attack the e4 pawn at once.}
 3.Nxe5 {White takes the pawn. Do not take on e4 yet.}
 d6 {Kick the knight first.}
 4.Nf3 {The knight retreats.}
 Nxe4 {Now you take the pawn.}
 5.d4 {White takes the centre.}
 (Nc3 {White attacks the knight.}
  Nxc3 {Trade the pieces.}
  6.dxc3 {White recaptures.}
  Be7 {Develop.}
  7.Bf4 {Develop with a plan of Qd2 and long castling.}
  O-O {Castle: your king is safe.}
  8.Qd2 {Connect the pieces.}
  Nc6 {Develop.}
  9.O-O-O {White castles long.}
  Bf6 {Develop with pressure on c3.})
 (Qe2 {White tries a trap.}
  Qe7 {Develop with a pin on the e-file.}
  6.Nc3 {Attack the knight.}
  (Qxe4? {A blunder.}
   Qxe4+ {The queen takes the queen with check.}
   7.Kd1 {The king has to move.}
   Qg6 {Escape. You are a queen up.})
  Nxc3 {Trade the knights.}
  7.dxc3 {Recapture.}
  Qxe2+ {Trade the queens.}
  8.Bxe2 {Recapture.})
 d5 {Take the centre and support the knight on e4.}
 6.Bd3 {Develop.}
 Nc6 {Develop and pressure d4.}
 7.O-O {Castle: your king is safe.}
 Be7 {Develop.}
 8.c4 {White attacks d5.}
 Nb4 {Hit the bishop and hit c2.}
 9.Be2 {The bishop retreats.}
 O-O {Castle: your king is safe.}
 10.Nc3 {White attacks the knight on e4.}
 Bf5 {Develop and support the knight. @d In the Petrov, kick the knight with ...d6, take on e4, and hold the centre with ...d5.}`,
  plans: [
    plan('p1', 'e4 e5 Nf3 Nf6 Nxe5', 'White has taken on e5. What is the key move?', [
      opt('d6. Kick the knight first', true, 'Yes. If you take on e4 at once, White plays Qe2 and wins a pawn. First ...d6.', 'd6', 'g:d7d6'),
      opt('Nxe4, grabbing the pawn', false, 'It looks natural, but Qe2 wins material back and gives White the initiative. Play ...d6 first.'),
      opt('Qe7, attacking the knight', false, 'The queen on e7 is awkward, and Nxf7 or d4 gets White a nice game. ...d6 is the move.'),
    ], 'In the Petrov, the order matters: ...d6 first, then ...Nxe4.'),
    plan('p2', 'e4 e5 Nf3 Nf6 Nxe5 d6 Nf3 Nxe4 d4', 'White takes the centre with d4. What is the right way to hold your knight?', [
      opt('d5. Support the knight with a pawn', true, 'Yes. The pawn on d5 holds the knight on e4, and your position is solid.', 'd5', 'g:d6d5'),
      opt('Nf6, retreating', false, 'You have wasted two moves with the knight. ...d5 is a fine setup.'),
      opt('f5, supporting the knight', false, 'It weakens your king and e6. ...d5 is cleaner.'),
    ], 'Support the knight with the d-pawn.'),
    plan('p3', 'e4 e5 Nf3 Nf6 Nxe5 d6 Nf3 Nxe4 Qe2 Qe7 Qxe4', 'You have developed the queen to e7. White has just taken on e4. What do you do?', [
      opt('Qxe4+. The queen takes the queen with check', true, 'Right. The white queen has no protection, so you win it for free. A pretty trap for the careless.', 'Qxe4+'),
      opt('d5, defending', false, 'After Qxe4 you have lost the queen’s trade for no reason. Take the queen!'),
      opt('Nf6, retreating', false, 'You can, but the free queen is better.'),
    ], 'When your opponent captures with an unprotected piece, take it.'),
    plan('p4', 'e4 e5 Nf3 Nf6 Nxe5 d6 Nf3 Nxe4 d4 d5 Bd3', 'White develops the bishop to d3. What is a sensible development?', [
      opt('Nc6. Pressure d4 and develop', true, 'Yes. The knight on c6 attacks d4 and prepares ...Be7 and castling. You have an easy, solid game.', 'Nc6', 'g:b8c6'),
      opt('Bd6, developing the bishop', false, 'The bishop on d6 is exposed to Nc3. ...Nc6 is more natural.'),
      opt('f5, supporting the knight', false, 'It weakens your king. Stay solid.'),
    ], 'Develop knights before bishops, and aim at the centre.'),
  ],
  traps: [
    win('w1', 'The greedy queen', 'b', 'e4 e5 Nf3 Nf6 Nxe5 d6 Nf3 Nxe4 Qe2 Qe7 Qxe4', 'Qxe4+', 'Kd1 Qg6', 'The white queen took on e4 with nothing behind it, and your queen recaptures with check. You win the queen for a knight.', 'Before you capture, check whether the capturing piece will be taken.', 'g:e7e4'),
  ],
});

const fourknights = chapter({
  id: 'fourknights',
  title: 'Four Knights Game',
  blurb: 'Mirror White’s pin with ...Bb4, castle and play ...d6.',
  coach: `In the Four Knights both sides develop their knights. When White pins your knight with Bb5, you pin his with ...Bb4. After castling, ...d6 and ...Bxc3 you reach a comfortable, equal position. Do not rush: simple development wins this opening.`,
  tip: 'Mirror the pin with ...Bb4, castle and play ...d6. If White plays Nd5, trade it off.',
  src: `${E4E5}
 Nc6 {Defend the pawn and develop with a purpose.}
 3.Nc3 {White develops the second knight.}
 Nf6 {The Four Knights. You develop with symmetry.}
 4.Bb5 {The Spanish Four Knights. White pins the knight.}
 (Bc4 {A calmer Italian-style move.}
  Bc5 {Develop symmetrically.}
  5.O-O {Castle: your king is safe.}
  d6 {Support e5.}
  6.d3 {Support e4.}
  O-O {Castle: your king is safe.}
  7.Bg5 {Pin the knight.}
  h6 {Ask the question.}
  8.Bxf6 {Trade the pieces.}
  Qxf6 {Recapture.}
  9.Nd5 {Hit the queen.}
  Qd8 {Retreat. A balanced position.})
 Bb4 {Mirror the pin.}
 (Nd4 {The Rubinstein Variation: hit the bishop at once.}
  5.Nxd4 {White trades.}
  exd4 {Recapture.}
  6.e5 {White attacks the knight.}
  dxc3 {Take the knight.}
  7.exf6 {White takes.}
  Qxf6 {Recapture.}
  8.dxc3 {White recaptures.}
  Bc5 {Develop with check threats.})
 5.O-O {Castle: your king is safe.}
 O-O {You castle too.}
 6.d3 {Support e4.}
 d6 {Support e5 and open the bishop.}
 7.Bg5 {Pin the knight on f6.}
 Bxc3 {Trade the bishop for the knight, and double White's pawns.}
 8.bxc3 {White recaptures.}
 Qe7 {Unpin the knight and eye e4.}
 9.Re1 {The rook attacks e5.}
 Nd8 {Reroute the knight.}
 10.d4 {White opens the centre.}
 Ne6 {Develop with tempo on the bishop.}
 11.Bc1 {The bishop retreats.}
 Nd7 {Make room and unblock the f-pawn. @d In the Four Knights, mirror the pin with ...Bb4, castle, and trade on c3 to double White's pawns.}`,
  plans: [
    plan('p1', 'e4 e5 Nf3 Nc6 Nc3 Nf6 Bb5', 'White pins your knight with Bb5. What is the best reply?', [
      opt('Bb4. Mirror the pin', true, 'Yes. Your bishop pins the knight on c3 in the same way. After castling and ...d6 you are completely equal.', 'Bb4', 'g:f8b4'),
      opt('Bc5, copying the Italian', false, 'It is playable but the knight on f6 stays pinned to the c6 knight and White gets Nxe5 tricks.'),
      opt('Nd4, attacking the bishop', false, 'The Rubinstein is fine, but it needs precise play after Nxd4 exd4 e5. ...Bb4 is simpler.'),
    ], 'When your opponent pins a piece, find a way to pin back.'),
    plan('p2', 'e4 e5 Nf3 Nc6 Nc3 Nf6 Bb5 Bb4 O-O O-O d3 d6 Bg5', 'The bishop pins your knight against the queen. What do you do?', [
      opt('Bxc3, doubling White’s pawns, and then ...Qe7', true, 'Right. After bxc3 the pin is less dangerous, White has doubled pawns, and ...Qe7 unpins.', 'Bxc3', 'g:b4c3'),
      opt('h6, asking the bishop', false, 'Bh4 g5 loosens your king. Trade on c3 first.'),
      opt('Be6, defending', false, 'The bishop on e6 does nothing about the pin, and White plays Nd5.'),
    ], 'Break an annoying pin by trading the pinning piece’s support.'),
    plan('p3', 'e4 e5 Nf3 Nc6 Nc3 Nf6 Bb5 Nd4 Nxd4 exd4 e5 dxc3 exf6 Qxf6 dxc3', 'White has recaptured on c3. Which move is dangerous?', [
      opt('Qxf2+?? loses the queen to Kxf2 and Bc5+ ideas', true, 'Yes. Grabbing f2 with the queen leaves her attacked by the king, and White wins the queen for a pawn.', undefined, 'g:f6f2'),
      opt('Bc5, developing', false, 'This is the right move, not the dangerous one. After Qe2+ Qe7 you are fine.'),
      opt('c6, kicking the bishop', false, 'This is also good. The danger is the queen sacrifice.'),
    ], 'Before you take a pawn with the queen, ask who can take her.'),
    plan('p4', 'e4 e5 Nf3 Nc6 Nc3 Nf6 Bb5 Bb4 O-O O-O d3 d6 Bg5 Bxc3 bxc3 Qe7', 'You have unpinned the knight. What is White’s plan, and yours?', [
      opt('White opens the centre with d4; you keep the pieces safe and respond with ...Nd8-e6', true, 'Right. White has the bishop pair but doubled pawns. You re-route the knight to e6 and keep the position solid.'),
      opt('White attacks your king with h4', false, 'The attack on the king comes later, if at all. White’s main idea is to open the centre.'),
      opt('Black must attack on the queenside', false, 'The weaknesses are White’s doubled pawns. You attack them slowly.'),
    ], 'Keep your pieces compact, and aim at the doubled pawns.'),
  ],
  traps: [],
});
export const e5: Course = {
  id: 'e5',
  title: '1...e5 (the old repertoire)',
  blurb: 'Black vs 1.e4 with 1...e5: Italian, Scotch, Petrov and the Four Knights.',
  side: 'b',
  gamesName: '1...e5',
  intro: 'These are the lines you learned first. They stay here so your progress is kept and you have a solid alternative to the Sicilian and the Caro-Kann.',
  firstMoves: [['e4', 'e5']],
  chapters: [italian, scotch, petrov, fourknights],
};
