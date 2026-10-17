// Sicilian Dragon, chapters 3-4: the Yugoslav Attack (9.Bc4 and 9.O-O-O).
import { avoid, chapter, opt, plan, win } from '../course.ts';
import { SETUP } from './dragon-a.ts';

const YUGO = `${SETUP}
 6.Be3 {White develops the bishop and prepares Qd2 and Bh6, the plan to trade your dragon bishop.}
 Bg7 {Your best piece. It eyes b2 and the whole long diagonal, and it guards the king.}
 7.f3 {White supports e4, prepares g4 and long castling. This is the Yugoslav Attack.}
 O-O {Castle. Your king is safe behind the g7 bishop, at least for now.}
 8.Qd2 {The queen lines up with the bishop on h6 to trade off your dragon bishop.}
 Nc6 {Pressure on d4. Every Dragon player wants to trade White's best centre knight.}`;

export const ch3 = chapter({
  id: 'yugo-bc4',
  title: 'Yugoslav Attack: 9.Bc4',
  blurb: 'The main line. Develop the bishop, take the c-file and strike with ...Ne5.',
  coach: `This is the line you will meet most. White puts the bishop on c4 and castles long, and you get ready for a race. The plan is calm and clear: ...Bd7 to develop, ...Rc8 for the file, ...Ne5 to hit c4, and ...h5 when White starts the h-pawn. If the game gets too sharp, the exchange sacrifice on c3 is always in your pocket.`,
  tip: 'Develop with ...Bd7 and ...Rc8, jump with ...Ne5, answer h4 with ...h5, and keep your pieces on the c-file.',
  src: `${YUGO}
 9.Bc4 {The bishop eyes f7 and prepares Bb3 and long castling.}
 Bd7 {Your queenside needs development. The bishop clears c8 for the rook and protects the knight on c6.}
 (Qa5 {Black develops the queen with pressure on a2 and the d2 queen.}
  10.Bb3 {The bishop retreats and keeps f7 under pressure.}
  Nxd4 {Trade the knight that blocks your queen's route.}
  11.Bxd4 {Recapture with the bishop. It controls the long diagonal against your king.}
  Be6 {Challenge the bishop on b3.}
  12.O-O-O {Castle long.}
  b5 {Start a pawn storm.})
 (Nxd4 {Trade at once.}
  10.Bxd4 {Recapture with the bishop.}
  Be6 {Challenge the bishop on c4.}
  11.Bb3 {Avoid the trade and keep the pressure on f7.}
  Qa5 {Develop the queen with threats.}
  12.O-O-O {Castle long.}
  b5 {Strike on the queenside.})
 10.O-O-O {White castles long, and both kings are on opposite sides. This is a race.}
 (h4 {White starts at once.}
  h5 {Stop the pawn.}
  11.Bb3 {Step out of the way.}
  Ne5 {Land on the monster square.}
  12.O-O-O {Castle long.}
  Rc8 {Take the file.})
 (Bb3 {White steps out of the way.}
  Nxd4 {Trade a knight.}
  11.Bxd4 {Recapture.}
  b5 {Start the queenside counter.})
 Rc8 {Your rook takes the c-file at once. Soon you will play ...Ne5 and ...Nc4, and the file leads to the king.}
 11.Bb3 {The bishop steps out of the way, and the f7 pawn is under long-term pressure.}
 Ne5 {The knight lands on a monster square. It eyes c4 and d3, and White's king is about to be bothered.}
 (Nxd4 {Trade the knight, the simplest idea.}
  12.Bxd4 {Recapture.}
  b5 {Strike with the pawn.})
 12.h4 {White starts the pawn storm on the h-file.}
 h5 {Stop the pawn. It leaves a dark-square weakness on g5, but you will use it as a post for your knight. @x Nc4: Nc4 Bxc4 Rxc4 h5 opens the h-file for White at once, and his attack is faster than yours. Stop the pawn first.}
 13.Bg5 {White pins the knight and eyes e7 and f6.}
 Rc5 {A rook lift to c5 so that the rook defends the knight on e5.}
 14.Kb1 {White moves the king out of the c-file, to be safe from knight tricks.}
 Nc4 {Now is the moment: the knight trades White's attacking bishop.}
 15.Bxc4 {White takes.}
 Rxc4 {Recapture with the rook. It is active on the fourth rank.}
 16.Nde2 {White brings a knight over to cover the king and the queen.}
 Rc5 {The rook retreats to c5 and keeps the pressure on the c3 knight.}
 17.Be3 {The bishop leaves the pin and heads for h6.}
 Rc6 {The rook swings over and guards the sixth rank. @d In the Yugoslav, every move is a race: hit the king first, or make sure that you are not too slow.}`,
  plans: [
    plan('p1', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7 f3 O-O Qd2 Nc6 Bc4', 'White has played Bc4. What is your most useful developing move?', [
      opt('Bd7. It develops the last minor piece and frees c8 for the rook', true, 'Yes. Next you play ...Rc8, with the knight jump ...Ne5 coming.', 'Bd7'),
      opt('Nxd4, trading at once', false, 'It is playable, but you spend a tempo, and Bxd4 lands on a perfect square. Develop first, then trade at the right moment.'),
      opt('e6, preparing ...d5', false, 'The pawn on e6 weakens d6 and blocks your bishop. Stay with the Dragon structure.'),
    ], 'Develop first: Bd7 then Rc8.'),
    plan('p2', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7 f3 O-O Qd2 Nc6 Bc4 Bd7 O-O-O Rc8 Bb3', 'What is the point of ...Ne5 here?', [
      opt('It hits the bishop (...Nc4) and eyes d3, f3 and g4', true, 'Yes. The knight on e5 is a monster: it threatens ...Nc4 to trade White’s best attacking bishop, and White must worry about d3 and f3.', 'Ne5', 'g:c6e5'),
      opt('It threatens to win the pawn on e4', false, 'There is no real threat on e4. The knight’s jumps are about c4 and d3.'),
      opt('It prepares to castle', false, 'You already castled. The knight is a tool for attack.'),
    ], 'The knight on e5 is the Dragon’s best attacker.', { kind: 'square' }),
    plan('p3', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7 f3 O-O Qd2 Nc6 Bc4 Bd7 O-O-O Rc8 Bb3 Ne5 h4', 'White pushes the h-pawn. What is Black’s best reply?', [
      opt('h5. Stop the pawn and keep the file closed', true, 'Yes. The pawn on h5 stops h4-h5. It creates a hole on g5, but White’s attack slows down and your knight on e5 stays strong.', 'h5', 'g:h7h5'),
      opt('Nc4. Strike at once', false, 'It looks active, but after Bxc4 Rxc4 h5 the h-pawn opens the file and White has a strong attack.', 'Nc4'),
      opt('Qa5, going for counterplay', false, 'The queen is not well placed on a5: Kb1 or Bxe5 and the h-pawn move on, with the attack going faster than yours.', 'Qa5'),
    ], 'Answer h4 with ...h5: stop the pawn before it opens the file.'),
    plan('p4', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7 f3 O-O Qd2 Nc6 Bc4 Bd7 O-O-O Rc8 Bb3 Ne5 h4 h5 Bg5', 'The white bishop pins your knight on f6 against the bishop on g7. What do you do?', [
      opt('Rc5. The rook defends the knight on e5 and swings across', true, 'Right. The rook defends e5, and it can later swing to a5, h5 or support ...Nc4 and ...Rxc3.', 'Rc5', 'g:c8c5'),
      opt('Ng6, retreating', false, 'The knight on g6 gives up the best square and White gets time for h5. You want to keep the e5 knight.'),
      opt('Ne8, running away', false, 'It loses time, and White’s Bxe7 or Bxg7 comes with tempo.'),
    ], 'Defend the e5 knight with the rook lift ...Rc5.'),
    plan('p5', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7 f3 O-O Qd2 Nc6 Bc4', 'If White castles long and pushes his h-pawn, what is the sacrifice that often decides the game for Black?', [
      opt('The exchange sacrifice ...Rxc3, ripping open the king’s cover', true, 'Yes. Giving a rook for a knight on c3 removes the king’s defenders and lets your queen and minor pieces rush in. Watch for it every game.'),
      opt('A queen sacrifice on d4', false, 'The queen sacrifice is far too expensive. The exchange sacrifice on c3 gets the same attack for less.'),
      opt('A bishop sacrifice on h3', false, 'The bishop sacrifice does not work: White’s king is far from h3. The weakness is on c3.'),
    ], 'In the Dragon, ...Rxc3 is a standard weapon against a long-castled king.'),
  ],
  traps: [],
});

export const ch4 = chapter({
  id: 'yugo-oo',
  title: 'Yugoslav Attack: 9.O-O-O and ...d5!',
  blurb: 'White castles at once. You answer with the central break and equalise.',
  coach: `When White castles long before Bc4, you can strike in the centre right away. The move ...d5! is the key: it opens the g7 bishop's diagonal and hits e4, and after the trades your pieces are active and your king is safe. The line is easy to remember once you see why: you hit the centre before White's attack starts.`,
  tip: 'Against 9.O-O-O play ...d5 at once. After exd5 Nxd5 and Nxc6 bxc6, your bishop and pawn centre are fine.',
  src: `${YUGO}
 9.O-O-O {White castles long at once. Both kings are on opposite sides, and White hopes to attack first.}
 d5 {The key break. It opens the diagonal for your bishop and hits e4 at once.}
 10.exd5 {White takes. He opens the centre and the e-file.}
 (Nxc6 {White trades first.}
  bxc6 {Recapture with the pawn.}
  11.exd5 {White opens the centre.}
  cxd5 {Recapture, and your centre pawn is back.}
  12.Bd4 {The bishop eyes your king.}
  Rb8 {Use the open b-file against the white king.})
 (g4 {White starts a pawn storm at once.}
  dxe4 {Take. White's king is in trouble if he opens the centre.}
  11.Nxc6 {White trades knights, hoping to win a tempo.}
  Qxd2+ {Trade queens: his attack is much weaker without the queen.}
  12.Bxd2 {Recapture.}
  bxc6 {Recapture, and you are fine.}
  13.g5 {Chase the knight.}
  Nd5 {The knight jumps to a lovely square.}
  14.Nxe4 {White wins the pawn back.}
  Rb8 {Use the b-file.})
 (Kb1 {White keeps the tension and tucks the king away first.}
  Nxd4 {Trade the knight that pressures d4.}
  11.Bxd4 {Recapture with the bishop.}
  dxe4 {Take the centre pawn. The bishop on d4 now has to watch its step.}
  12.fxe4 {White recaptures.}
  Be6 {Develop with pressure on a2 and c4.}
  13.Be2 {A solid developing move.}
  Rc8 {Take the c-file. The position is level.})
 Nxd5 {Recapture with the knight, which centralises and keeps your pawn structure healthy.}
 11.Nxc6 {White trades the knight that put pressure on d4.}
 bxc6 {Recapture with the pawn. It opens the b-file and keeps the knight on d5 safe.}
 12.Bd4 {The bishop eyes your king and your pawn on e5.}
 e5 {Challenge the bishop. It cannot stay on d4 without trouble.}
 13.Bc5 {The bishop moves away but stays on the board.}
 Re8 {The rook hits the e-pawn and the pawn centre. The knight on d5 and the pawn on e5 are a good duo.}
 14.Ne4 {The knight jumps in and eyes the squares d6 and f6.}
 Be6 {Develop and look after c4 and the d5 knight.}
 15.h4 {White begins the attack in the usual way.}
 h5 {Stop the pawn and keep the king safe.}
 16.Bc4 {Offer a trade of the light bishops.}
 Nf4 {The knight jumps in with a threat on d3 and a trade of queens.}
 17.Qxd8 {White trades queens to take the sting out.}
 Rexd8 {Recapture. Your pieces are very active. @d Against 9.O-O-O, play ...d5. If White does not take, take on d4 and develop.}
`,
  plans: [
    plan('p1', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7 f3 O-O Qd2 Nc6 O-O-O', 'White has castled long at once. What is the strongest reply?', [
      opt('d5. Break in the centre before the attack starts', true, 'Yes. The central strike opens the long diagonal and takes the initiative. After exd5 Nxd5 you are very comfortable.', 'd5', 'g:d6d5'),
      opt('Bd7, a calm developing move', false, 'It is playable, but it lets White start the attack with Kb1 and h4. The break ...d5 is better here.'),
      opt('h5, starting your own storm', false, 'It looks active, but White is faster: Kb1 and Bh6 are coming and the rook on h1 will help.'),
    ], 'Against fast long castling, hit the centre with ...d5.', { kind: 'break' }),
    plan('p2', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7 f3 O-O Qd2 Nc6 O-O-O d5 exd5 Nxd5 Nxc6', 'White has taken on c6. How do you recapture?', [
      opt('bxc6. The pawn recapture keeps your knight safe and opens the b-file', true, 'Yes. The pawn recapture gives you a solid centre and open b-file. The bishop pair is still yours.', 'bxc6', 'g:b7c6'),
      opt('Bxc3, hitting the queen', false, 'This looks tempting, but White just plays Qxd5 and wins. After Bxc3?? you are in trouble because the knight on d5 is attacked. Recapture with the pawn.', 'Bxc3'),
      opt('Nxc3, going for the queen', false, 'Nxc3 is met by Nxd8. You lose the queen.'),
    ], 'When White trades a knight, recapture in the way that keeps your pieces safe.'),
    plan('p4', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7 f3 O-O Qd2 Nc6 O-O-O d5 g4', 'White ignores the centre and storms with g4. What now?', [
      opt('dxe4. Take the pawn and open the d-file against his king', true, 'Yes. After Nxc6 Qxd2+ Bxd2 bxc6 you are comfortable: the queens are off and White’s attack has disappeared.', 'dxe4'),
      opt('Nxd4, starting trades', false, 'It is fine, but you lose the chance to open the centre while his king is on c1.'),
      opt('e5, grabbing space', false, 'e5 weakens the d5 square and your pieces are not ready. Take the e-pawn instead.'),
    ], 'If White attacks the king instead of defending e4, take the pawn and open the centre.', { kind: 'break' }),
    plan('p3', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7 f3 O-O Qd2 Nc6 O-O-O d5 exd5 Nxd5 Nxc6 bxc6 Bd4', 'The bishop on d4 hits your king. What is the standard answer?', [
      opt('e5. Challenge the bishop and take space', true, 'Yes. The pawn on e5 hits the bishop and builds a strong centre.', 'e5', 'g:e7e5'),
      opt('Nxc3, trading', false, 'It trades the knight that guards your centre. Bxg7 Kxg7 Qxc3+ is fine for White. The pawn move e5 is better.'),
      opt('Bxd4, trading bishops', false, 'It gives White the central file and lets him bring the queen with tempo. The pawn challenge is better.'),
    ], 'Challenge an active bishop with a pawn.', { kind: 'break' }),
  ],
  traps: [],
});
