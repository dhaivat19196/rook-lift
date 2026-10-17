// Sicilian Dragon, chapters 7-8: the anti-Sicilians, then traps and tricks.
import { avoid, chapter, opt, plan, win } from '../course.ts';
import { SETUP } from './dragon-a.ts';

export const ch7 = chapter({
  id: 'anti',
  title: 'Anti-Sicilians: Alapin, Morra, Grand Prix, Closed and the rest',
  blurb: 'Many club players avoid the open Sicilian. A simple answer to each, so you are never out of your depth.',
  coach: `Plenty of opponents will not play 2.Nf3 and 3.d4. They play 2.c3, 2.d4 with a gambit, 2.Nc3 with f4 or g3, 2.b4, or 2.Bc4. Each has a simple, solid answer, and several of them are actually bad for White. Learn the answer to each, and play it with confidence: the hardest part is not being surprised.`,
  tip: 'Against the Alapin play ...d5. Take the Morra pawn and develop. Against 2.Nc3 play ...Nc6 and ...g6. Against 3.Bb5+ trade the bishop with ...Bd7.',
  src: `1.e4 {White takes the centre and opens lines for the queen and the f1-bishop.}
 c5 {The Sicilian. You fight for the centre from the side.}
 2.c3 {The Alapin. White prepares d4 without allowing the open Sicilian knight trades.}
 (d4 {White offers a pawn: the Morra Gambit family.}
  cxd4 {Take the pawn.}
  3.c3 {The Smith-Morra Gambit. White offers another pawn for a lead in development.}
  dxc3 {Accept it. If you develop calmly, you stand well.}
  4.Nxc3 {White develops with threats.}
  Nc6 {Develop and put pressure on d4.}
  5.Nf3 {Develop.}
  d6 {Stay solid. The pawn on d6 blocks the bishop and prepares ...Nf6.}
  6.Bc4 {White eyes f7.}
  e6 {Close the diagonal and develop.}
  7.O-O {Castle: your king is safe.}
  Nf6 {Develop.}
  8.Qe2 {Prepare Rd1 and e5.}
  Be7 {Develop and prepare to castle.}
  9.Rd1 {The rook comes to the open file.}
  e5 {Take space and shut the bishop out.}
  10.b4 {White tries to open files.}
  O-O {Castle: your king is safe and you are a pawn up.}
  11.Be3 {Develop.}
  Bd7 {Develop. You are solid and a pawn up.})
 (Nc3 {The Closed and Grand Prix family.}
  Nc6 {Develop and keep the structure flexible.}
  3.f4 {The Grand Prix Attack. White grabs space and prepares Nf3 and Bc4.}
  (Nf3 {A calm developing move.}
   g6 {Fianchetto.}
   4.d4 {White opens the centre.}
   cxd4 {Take the pawn.}
   5.Nxd4 {Recapture.}
   Bg7 {The bishop comes out.}
   6.Be3 {Develop.}
   Nf6 {Develop and attack e4.}
   7.Bc4 {The Sozin set-up.}
   O-O {Castle: your king is safe.}
   8.Bb3 {Avoid the trade.}
   d6 {Play the Dragon structure: you are in a Dragon with an extra tempo.})
  g6 {Prepare the fianchetto. The bishop on g7 will be strong.}
  4.Nf3 {Develop.}
  Bg7 {The bishop comes out.}
  5.Bb5 {Pin the knight and prepare to double your pawns.}
  (Bc4 {A different plan: eye f7.}
   e6 {Close the diagonal.}
   6.f5 {Push at once.}
   gxf5 {Take the pawn: the f-file opens for you.}
   7.d3 {Support e4.}
   Nge7 {Develop and stay solid.}
   8.O-O {Castle: the king steps to safety.}
   O-O {Castle too: your king is safe.})
  Nd4 {Challenge the bishop's friend. The knight is protected by the c5 pawn.}
  6.Nxd4 {White trades the knight.}
  cxd4 {Recapture. The pawn on d4 cramps White.}
  7.Ne2 {The knight heads for the centre.}
  Nf6 {Develop and attack e4.}
  8.e5 {White pushes.}
  Nh5 {Dodge and attack the f4 pawn.}
  9.c3 {Undermine the pawn on d4.}
  O-O {Castle: your king is safe.}
  10.cxd4 {White takes.}
  d6 {Open the position for your bishop and pieces. You are fine.})
 (b4 {The Wing Gambit. White gives a pawn to open the b-file.}
  cxb4 {Take the pawn.}
  3.a3 {White offers a second pawn.}
  d5 {Strike in the centre at once.}
  4.exd5 {White takes.}
  Qxd5 {Recapture with the queen. It eyes g2 and a2.}
  5.Nf3 {Develop.}
  e5 {Take space and keep the pawn on b4 for now.}
  6.axb4 {White recaptures.}
  Bxb4 {Take the pawn back and develop.}
  7.c3 {Attack the bishop.}
  Be7 {Retreat. You are solid and up a pawn.}
  8.Na3 {Develop.}
  e4 {Gain space with tempo on the knight.})
 (Bc4 {The Bowdler Attack. The bishop eyes f7.}
  e6 {A solid move that blocks the bishop.}
  3.Nf3 {Develop.}
  a6 {Prepare ...b5 to kick the bishop.}
  4.O-O {Castle: your king is safe.}
  b5 {Gain space with tempo.}
  5.Be2 {Retreat.}
  Bb7 {Develop. You are comfortable.})
 (Nf3 {A calm second move, followed by Bb5+.}
  d6 {Your normal move.}
  3.Bb5+ {The Moscow Variation. White checks first.}
  Bd7 {Block with the bishop and offer a trade.}
  4.Bxd7+ {White trades.}
  Qxd7 {Recapture with the queen.}
  5.c4 {White grabs space.}
  Nc6 {Develop.}
  6.Nc3 {Develop.}
  g6 {Prepare the fianchetto.}
  7.d4 {Open the centre.}
  cxd4 {Take the pawn.}
  8.Nxd4 {Recapture.}
  Bg7 {The bishop comes out.}
  9.Be3 {Develop.}
  Nf6 {Develop and attack e4.}
  10.f3 {Support e4.}
  O-O {Castle: your king is safe.})
 d5 {The standard reply to the Alapin. You strike in the centre at once.}
 (Nf6 {The other good reply. It attacks e4.}
  3.e5 {White pushes.}
  Nd5 {The knight jumps to d5, an excellent square.}
  4.d4 {White takes the centre.}
  cxd4 {Take the pawn.}
  5.Nf3 {Develop.}
  Nc6 {Develop and pressure d4.}
  6.cxd4 {Recapture.}
  d6 {Hit the pawn on e5.}
  7.Bc4 {Hit the knight on d5.}
  Nb6 {Retreat and hit the bishop.}
  8.Bb5 {Pin the knight.}
  dxe5 {Take the pawn.}
  9.Nxe5 {Recapture.}
  Bd7 {Develop and unpin.}
  10.Nxc6 {Trade pieces.}
  Bxc6 {Recapture.}
  11.Bxc6+ {Trade pieces.}
  bxc6 {Recapture. The position is equal.})
 3.exd5 {White takes. He has to recapture or lose a pawn.}
 Qxd5 {Recapture with the queen. It is active in the centre.}
 4.d4 {White takes the centre.}
 Nf6 {Develop and attack e4.}
 5.Nf3 {Develop.}
 Bg4 {Pin the knight. This is the main line.}
 6.Be2 {White develops.}
 e6 {Support the centre and open the bishop.}
 7.h3 {Ask the bishop a question.}
 Bh5 {Keep the pin. The bishop is safe for now.}
 8.O-O {White castles.}
 Nc6 {Develop and pressure d4.}
 9.Be3 {Support d4.}
 cxd4 {Take the pawn.}
 10.cxd4 {Recapture.}
 Be7 {Develop. Your position is solid and equal. @d Against the Alapin, play ...d5 and develop; the position is equal.}`,
  plans: [
    plan('p1', 'e4 c5 c3', 'White plays the Alapin. What is the clearest reply?', [
      opt('d5. Strike in the centre at once', true, 'Yes. After exd5 Qxd5 d4 Nf6 you have a good position, with active pieces and no weaknesses.', 'd5', 'g:d7d5'),
      opt('e5, grabbing the centre', false, 'It is playable, but not better, and it gives White a comfortable game with d4. ...d5 is simpler.'),
      opt('Nf6, attacking e4', false, 'It is also good, but it leads to sharper play with e5 Nd5. ...d5 is more straightforward.'),
    ], 'Against the Alapin, ...d5!'),
    plan('p2', 'e4 c5 d4 cxd4 c3', 'White offers the Smith-Morra Gambit. What should you do?', [
      opt('Take the pawn: dxc3, then develop and castle', true, 'Yes. The Morra works best against players who are afraid of it. If you take, develop carefully and castle, you are a pawn up with a solid position.', 'dxc3', 'g:d4c3'),
      opt('Decline with ...d3', false, 'The d3 pawn is weak and White wins it back with Bxd3 with a good lead in development. Taking is better.', 'd3'),
      opt('Ignore it and play ...Nf6', false, 'It can work, but taking the pawn is simpler and objectively strong.'),
    ], 'Take the gambit pawn and develop with care.'),
    plan('p3', 'e4 c5 Nc3 Nc6 f4 g6 Nf3 Bg7 Bb5 Nd4 Nxd4 cxd4 Ne2', 'You are in the Grand Prix with the structure d4. What is the best way to develop?', [
      opt('Nf6, then Nh5 if White plays e5', true, 'Yes. The knight on f6 attacks e4, and if White pushes, ...Nh5 hits f4. You castle and open the centre with ...d6.', 'Nf6'),
      opt('e6, to block the bishop', false, 'The pawn on e6 is solid, but you lose your counter-attack on e4. The knight development is more active.'),
      opt('Qb6, going after the knight', false, 'The queen on b6 can be hit by Na4 or c3. It is too early.'),
    ], 'Develop the knight to f6 so that e4 is always under pressure.'),
    plan('p4', 'e4 c5 Nf3 d6 Bb5+', 'White gives a check on b5. How do you respond?', [
      opt('Bd7. Block and offer a trade', true, 'Yes. The bishop trade gives you a solid game. After Bxd7+ Qxd7 you are fine and ready to play ...Nc6 and ...g6.', 'Bd7', 'g:c8d7'),
      opt('Nbd7, blocking with the knight', false, 'It works, but it blocks your own bishop. The bishop block is more natural.'),
      opt('Kf8', false, 'You lose your right to castle for no reason.'),
    ], 'Answer a check on b5 with ...Bd7.'),
  ],
  traps: [],
});

export const ch8 = chapter({
  id: 'traps',
  title: 'Traps and tricks',
  blurb: 'Tactics Black can punish, and the traps to avoid yourself.',
  coach: `The Dragon is full of tactics, and most of them are good for Black if you know them. White often goes wrong with a greedy sacrifice, an early bishop move or a premature Bh6, and each mistake has a clean punishment. We also look at two tempting moves that lose for Black. Learn these, and you will win games by move fifteen.`,
  tip: 'Count what is attacked before you take, and punish greedy sacrifices: Bxf7+ loses to the king, and Bh6 loses to ...Bxh6 and ...Nxd4.',
  src: `${SETUP}
 6.Be3 {White develops the bishop and prepares Qd2 and Bh6.}
 Bg7 {Your best piece.}
 7.f3 {White supports e4.}
 O-O {Castle: your king is safe.}
 8.Qd2 {The queen lines up with the bishop.}
 Nc6 {Pressure on d4.}
 9.Bc4 {The normal move: the bishop eyes f7 and prepares Bb3 and long castling.}
 (Bh6? {A hasty trade of the dark bishops. It loses to a tactic.}
  Bxh6 {Take the bishop. You will win material.}
  10.Qxh6 {The queen recaptures.}
  Nxd4 {The key move. Your knight hits c2 and f3, and the white queen is out of play.}
  11.O-O-O {White castles.}
  e5 {Support the knight and open the diagonal. White is lost.}
  12.h4 {White tries for an attack.}
  Kh8 {Step aside: the queen on h6 has run out of squares.}
  13.h5 {White pushes on.}
  Ng8 {Trap the queen. @d Against a hasty Bh6 in the Yugoslav, take the bishop and then play ...Nxd4: the white queen is out of play.})
 Bd7 {Develop. The bishop frees c8 for the rook and protects the knight.}
 10.O-O-O {White castles long and the race begins.}
 Rc8 {Take the file.}
 11.Bb3 {Step out of the way.}
 Ne5 {The monster knight. @d Against the Yugoslav, the standard ideas are ...Bd7, ...Rc8 and ...Ne5.}`,
  plans: [
    plan('p1', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Bc4 Bg7 Be3 Ng4 Bb5+', 'White gives a check on b5 and your knight on g4 has no defender. Which move is safe?', [
      opt('Kf8. The king is safe, and the bishop on g7 covers it', true, 'Yes. After Kf8 the knight on g4 is protected by the pin on White’s own bishop. The king will not be attacked and you will play ...Be5.', 'Kf8', 'g:e8f8'),
      opt('Bd7, blocking with the bishop', false, 'The bishop blocks the check but the knight on g4 hangs: Qxg4 wins a piece, because the bishop on d7 is pinned to the king.', 'Bd7'),
      opt('Nc6, blocking with the knight', false, 'Nxc6 bxc6 Bxc6+ wins a pawn with check, and your knight on g4 is still loose.', 'Nc6'),
    ], 'Before you block a check, check what the block leaves undefended.'),
    plan('p2', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Bc4 Bg7 Be3 Ng4 Bxf7+', 'White sacrifices a bishop on f7. What do you do?', [
      opt('Kxf7. White has no attack, and you are a piece up', true, 'Right. The king takes the bishop, and White’s follow-up Nd5 is met by ...Nxe3. You are a clean piece up.', 'Kxf7', 'g:e8f7'),
      opt('Kf8, running away', false, 'You give White time and the bishop on f7 stays strong. Take the bishop.', 'Kf8'),
      opt('Kd7', false, 'Your king runs into the open and Qxg4+ follows. Take the bishop; it is safe.', 'Kd7'),
    ], 'Check whether a sacrifice has any follow-up. If not, take it.'),
    plan('p3', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7 f3 O-O Qd2 Nc6 Bh6', 'White offers a bishop trade with Bh6. What is the best reply?', [
      opt('Bxh6, then ...Nxd4 after Qxh6', true, 'Yes. After Qxh6 Nxd4 the white queen has no support and your knight attacks c2 and f3. You will win material.', 'Bxh6', 'g:g7h6'),
      opt('Nxd4, trading first', false, 'It works, but Bxg7 gives White a strong follow-up. The simplest and strongest is to take on h6 first.', 'Nxd4'),
      opt('Ignore it and play a quiet move', false, 'After Bxg7 Kxg7 White has the open h-file and a free attack. Take the bishop.'),
    ], 'When White trades your dragon bishop too early, take it and strike on d4.'),
    plan('p4', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7 f3 O-O Qd2 Nc6 O-O-O d5 exd5 Nxd5 Nxc6', 'White has taken on c6, and the knight attacks your queen. Which recapture is correct?', [
      opt('bxc6. The pawn recapture keeps your knight on d5 safe', true, 'Yes. The pawn recaptures and opens the b-file. The bishop on g7 and the knight on d5 stay protected.', 'bxc6', 'g:b7c6'),
      opt('Bxc3, hitting the queen', false, 'It looks clever, but Qxd5 takes your knight and you have lost a piece. After Qxd5 Qc7 Nd4 you are lost.', 'Bxc3'),
      opt('Qa5, moving the queen away', false, 'The knight on c6 attacks a5 and d8: you lose the queen for a knight.'),
    ], 'Before you capture, check what your capture leaves undefended.'),
  ],
  traps: [
    win('w1', 'The Sozin sacrifice', 'b', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Bc4 Bg7 Be3 Ng4 Bxf7+', 'Kxf7', 'Nd5 Nxe3 Nxe3 Qd7', 'Bxf7+ looks like a fork, but the king is safe on f7 and your knight takes the bishop on e3. You are a piece up.', 'Check whether a sacrifice has a follow-up. If it has none, take it.', 'g:e8f7'),
    win('w2', 'The hasty Bh6', 'b', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7 f3 O-O Qd2 Nc6 Bh6', 'Bxh6', 'Qxh6 Nxd4 O-O-O e5 h4', 'Once the queen has taken on h6, her support has gone and Nxd4 hits c2 and f3 with devastating effect.', 'Take the bishop first, and look for the knight jump.', 'g:g7h6'),
    win('w3', 'The loose knight on a4', 'b', 'e4 c5 Nc3 Nc6 f4 g6 Nf3 Bg7 Bb5 Nd4 Nxd4 cxd4 Na4', 'Qa5', 'c4 a6 b4 Qd8 c5 axb5', 'White’s knight on a4 and bishop on b5 are both loose, and the queen on a5 attacks them together.', 'Look for a fork on two undefended pieces.', 'g:d8a5'),
    avoid('a1', 'The blocked check', 'b', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Bc4 Bg7 Be3 Ng4 Bb5+', 'Bd7', 'Kf8', 'Qxg4 Bxb5 Ndxb5 Nc6', 'Blocking with the bishop leaves the knight on g4 hanging, and the bishop is pinned. Kf8 is the only safe move.', 'Before you block a check, check what the block leaves undefended.', 'g:d1g4'),
    avoid('a2', 'The wrong recapture', 'b', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7 f3 O-O Qd2 Nc6 O-O-O d5 exd5 Nxd5 Nxc6', 'Bxc3', 'bxc6', 'Qxd5 Qc7 Nd4', 'The knight on d5 is attacked by the queen once the bishop captures on c3. Recapture on c6 with the pawn.', 'Count your hanging pieces before you take.', 'g:d2d5'),
  ],
});
