// Personal repertoire, built from the student's own results:
//   White: the London System (they score 59% in Queen's Pawn games; 1.e4 scores far less)
//   Black vs 1.e4: 1...e5 (Italian / Two Knights, Scotch, Petrov, Four Knights)
//   Black vs 1.d4: the Queen's Gambit Declined set-up
// Every line is 14 plies; the validator plays it out and checks that the student's moves are sound.
import { Chess } from 'chess.js';
import { B, lesson, line as lineStep, mv, ph, pos, txt } from '../build.ts';
import type { LArrow, LineDef, Side, Unit } from '../types.ts';

type Spec = { id: string; title: string; side: Side; moves: string; ideas: string[]; arrows?: Record<number, LArrow[]> };

function L(s: Spec): LineDef {
  return { id: s.id, title: s.title, side: s.side, moves: s.moves.split(' '), ideas: s.ideas, arrows: s.arrows };
}

/** Quiz items drawn from the student's own moves in a line (verified by the engine like any other move). */
function quiz(l: LineDef, plies: number[]) {
  const out = [];
  const c = new Chess();
  const fens: string[] = [];
  for (const m of l.moves) {
    fens.push(c.fen());
    c.move(m);
  }
  for (const p of plies) {
    const san = l.moves[p - 1];
    out.push(mv(fens[p - 1], san, l.ideas[p - 1], { prompt: `${l.side === 'w' ? 'White' : 'Black'} to move in the ${l.title}. What is the line move?`, hint: 'Think about what the move is for: development, the centre or safety.', side: l.side }));
  }
  return out;
}

// ----------------------------------------------------------------------------------------- London
const LONDON_MAIN = L({
  id: 'london-main',
  title: 'London System: main set-up',
  side: 'w',
  moves: 'd4 d5 Bf4 Nf6 e3 e6 Nf3 Bd6 Bg3 O-O Nbd2 c5 c3 Nc6',
  ideas: [
    'Claim the centre with the queen\'s pawn.',
    'Black takes the centre too.',
    'The London bishop comes out before e3 closes the diagonal.',
    'Black develops a knight toward the centre.',
    'e3 supports d4 and frees the f1 bishop.',
    'Black opens the diagonal for his own bishop.',
    'The knight develops and protects d4.',
    'Black offers a bishop trade on f4.',
    'Keep the bishop with Bg3: it stays on the diagonal.',
    'Black castles; both kings are safe.',
    'Nbd2 supports the centre and e4 later.',
    'Black challenges d4 with ...c5.',
    'c3 holds d4 and gives the queen a diagonal.',
    'Black develops: the structure is solid and your plan is e4.',
  ],
  arrows: { 3: [{ from: 'f4', to: 'b8', c: 'b' }], 9: [{ from: 'g3', to: 'b8', c: 'b' }], 13: [{ from: 'e3', to: 'e4', c: 'b' }] },
});
const LONDON_C5 = L({
  id: 'london-c5',
  title: 'London System vs ...c5',
  side: 'w',
  moves: 'd4 d5 Bf4 c5 e3 Nc6 c3 Nf6 Nd2 e6 Ngf3 Bd6 Bg3 O-O',
  ideas: [
    'The centre pawn again.',
    'Black takes space in the centre.',
    'Bishop out before the pawn chain closes.',
    'Black attacks d4 at once.',
    'e3 supports d4 and prepares to develop.',
    'Black adds a second attacker on d4.',
    'c3 gives d4 a second defender.',
    'Black develops with a threat on the centre.',
    'The queen\'s knight goes to d2 to leave c3 for the pawn.',
    'Black solidifies the centre.',
    'The other knight comes out and covers d4.',
    'Black\'s bishop eyes your Bf4.',
    'Bg3 keeps your bishop: do not trade it.',
    'Black castles. Your plan: e4 or a minority-free solid game.',
  ],
});
const LONDON_BF5 = L({
  id: 'london-bf5',
  title: 'London System vs ...Bf5',
  side: 'w',
  moves: 'd4 d5 Bf4 Nf6 e3 Bf5 Nf3 e6 Nbd2 Nbd7 c3 c6 Qb3 Qb6',
  ideas: [
    'Claim the centre.',
    'Black does the same.',
    'Develop the bishop before e3.',
    'A natural developing move for Black.',
    'e3 supports the centre.',
    'Black also puts his bishop outside the chain.',
    'Develop the knight and control e5.',
    'Black supports d5 and opens the king bishop.',
    'Nbd2 prepares e4 and is flexible.',
    'Black develops the last knight.',
    'c3 secures d4 and prepares Qb3.',
    'Black makes sure of d5.',
    'Qb3 attacks the b7 pawn and develops the queen.',
    'Black defends with ...Qb6. A level, sound position.',
  ],
});
const LONDON_KID = L({
  id: 'london-kid',
  title: 'London System vs the King\'s Indian set-up',
  side: 'w',
  moves: 'd4 Nf6 Bf4 g6 e3 Bg7 Nf3 O-O h3 d6 Nbd2 Nbd7 c3 e5',
  ideas: [
    'Centre pawn again.',
    'Black develops and waits.',
    'The London bishop comes out.',
    'Black fianchettoes his king bishop.',
    'e3 supports d4 and lets the dark bishop breathe.',
    'The bishop eyes d4 along the long diagonal.',
    'Knight out; it defends d4.',
    'Black castles into the fianchetto.',
    'h3 gives your bishop a retreat on h2.',
    'Black prepares ...e5.',
    'Nbd2 develops and watches e4.',
    'Black supports ...e5.',
    'c3 holds the centre.',
    'Black plays ...e5. Take on e5 and keep a solid position.',
  ],
});

// --------------------------------------------------------------------------------------------- 1...e5
const TWO = L({
  id: 'two-knights',
  title: 'Two Knights Defence vs 4.d3',
  side: 'b',
  moves: 'e4 e5 Nf3 Nc6 Bc4 Nf6 d3 Be7 O-O O-O Re1 d6 c3 Na5',
  ideas: [
    'White takes the centre.',
    'Black copies: the centre is shared.',
    'The knight attacks e5.',
    'Defend the pawn and develop.',
    'The bishop eyes f7.',
    'The Two Knights: develop and attack e4.',
    'A quiet move: d3 keeps e4 safe.',
    'Be7 prepares castling and is solid.',
    'White castles.',
    'You castle too: your king is safe.',
    'The rook supports e4.',
    'Protect e5 and free your bishop.',
    'White prepares d4.',
    'Hit the bishop and gain space on the queen side.',
  ],
});
const SCOTCH = L({
  id: 'scotch',
  title: 'Scotch Game',
  side: 'b',
  moves: 'e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Nf6 Nxc6 bxc6 e5 Qe7 Qe2 Nd5',
  ideas: [
    'White takes the centre.',
    'You copy.',
    'The knight attacks e5.',
    'Develop and defend.',
    'The Scotch: White opens the centre.',
    'Take the pawn.',
    'White recaptures with the knight.',
    'Attack the e4 pawn.',
    'Trade the knight for yours.',
    'Recapture with the pawn: you gain the b-file.',
    'The pawn pushes with a threat on your knight.',
    'The queen attacks e5 and pins e-file ideas.',
    'The queen protects e5 and defends e4 ideas.',
    'The knight comes to d5, a strong square: you are fine.',
  ],
});
const PETROV = L({
  id: 'petrov',
  title: 'Petrov Defence',
  side: 'b',
  moves: 'e4 e5 Nf3 Nf6 Nxe5 d6 Nf3 Nxe4 d4 d5 Bd3 Nc6 O-O Be7',
  ideas: [
    'White takes the centre.',
    'You copy.',
    'The knight attacks e5.',
    'The Petrov: counter-attack e4, do not defend e5.',
    'White takes the pawn.',
    'Kick the knight with ...d6 before taking e4.',
    'The knight retreats.',
    'Now take the pawn.',
    'White strikes at the centre.',
    'Support the knight and fix the centre.',
    'The bishop attacks your knight.',
    'Develop and defend.',
    'White castles.',
    'Be7 and ...O-O: a solid, equal position.',
  ],
});
const FOUR = L({
  id: 'four-knights',
  title: 'Four Knights Game (Rubinstein)',
  side: 'b',
  moves: 'e4 e5 Nf3 Nc6 Nc3 Nf6 Bb5 Bb4 O-O O-O d3 d6 Bg5 Bxc3',
  ideas: [
    'White takes the centre.',
    'You copy.',
    'The knight attacks e5.',
    'Defend it and develop.',
    'A second knight.',
    'Develop the other knight.',
    'The Spanish-style bishop pins your knight.',
    'Mirror the pin: ...Bb4.',
    'White castles.',
    'You castle too.',
    'White supports e4.',
    'Defend e5 and free the bishop.',
    'White pins your knight.',
    'Take the knight: your pin and the doubled pawns give you a healthy game.',
  ],
});

// ------------------------------------------------------------------------------------------- QGD
const QGD = L({
  id: 'qgd',
  title: 'Queen\'s Gambit Declined: main line',
  side: 'b',
  moves: 'd4 d5 c4 e6 Nc3 Nf6 Bg5 Be7 e3 O-O Nf3 h6 Bh4 b6',
  ideas: [
    'White takes the centre.',
    'You take it too.',
    'The Queen\'s Gambit: White offers a pawn.',
    'Decline it: ...e6 supports d5.',
    'Develop the knight and press on d5.',
    'Develop and hit d4 and e4.',
    'Pin the knight on f6.',
    'Unpin by developing the bishop.',
    'White opens the bishop and supports the centre.',
    'You castle; your king is safe.',
    'The knight develops.',
    'Ask the bishop what it wants.',
    'It retreats to h4.',
    'The Tartakower: fianchetto the queen\'s bishop.',
  ],
});
const QGD_EX = L({
  id: 'qgd-exchange',
  title: 'Queen\'s Gambit Declined: Exchange variation',
  side: 'b',
  moves: 'd4 d5 c4 e6 Nc3 Nf6 cxd5 exd5 Bg5 c6 e3 Be7 Bd3 Nbd7',
  ideas: [
    'White takes the centre.',
    'You take it too.',
    'The Queen\'s Gambit.',
    'Decline with ...e6.',
    'Develop the knight.',
    'Develop the knight.',
    'White exchanges on d5.',
    'Recapture with the pawn: you have an open e-file.',
    'The bishop pins your knight.',
    'c6 supports d5 and gives the queen a square.',
    'White supports the centre.',
    'Develop and unpin.',
    'The bishop aims at your king side.',
    'The last knight develops: a solid structure.',
  ],
});
const QGD_LON = L({
  id: 'qgd-london',
  title: 'Meeting the London with ...c5',
  side: 'b',
  moves: 'd4 d5 Bf4 c5 e3 Nc6 c3 Nf6 Nd2 e6 Ngf3 Bd6 Bg3 O-O',
  ideas: [
    'White takes the centre.',
    'You take it too.',
    'The London bishop.',
    'Strike at d4 at once.',
    'e3 supports d4.',
    'Add a second attacker on d4.',
    'c3 supports d4.',
    'Develop with pressure.',
    'The knight goes to d2.',
    'Solid: ...e6 backs d5 and frees the bishop.',
    'White develops the other knight.',
    'Challenge the London bishop.',
    'It keeps itself with Bg3.',
    'You castle: a comfortable game.',
  ],
});

const rep = (l: LineDef, title: string, blurb: string, intro: string, rule: string, habit: string, recap: string, quizPlies: number[]) =>
  lesson({
    id: 'rep-' + l.id,
    title,
    blurb,
    mins: 10,
    tags: ['hung_piece'],
    intro,
    rule,
    habit,
    recap,
    steps: [
      ...ph('example', txt(title, `${blurb}\n\nWe will learn the line one move at a time, with the idea behind each move, and then you will play it from memory. Do not worry about memorising the moves. Understand the ideas and the moves follow.`, B(pos(l.moves.slice(0, 4).join(' ')), undefined, undefined, l.side))),
      ...ph('practice', lineStep(l), ...quiz(l, quizPlies)),
    ],
  });

export const repLondon: Unit = {
  id: 'rep-london',
  title: 'White: the London System',
  blurb: 'A solid set-up you can play against almost anything, built around a bishop on f4 and a pawn chain on d4/e3/c3.',
  track: 'openings',
  cat: 'opening',
  stage: 2,
  lessons: [
    rep(LONDON_MAIN, 'London System: the main set-up', 'The model set-up against 1...d5 and ...Nf6.', 'The London is your Queen\'s Pawn opening. The structure is almost the same every game, so you spend your energy on the middlegame instead of memorising.', 'Develop the bishop first, then play e3.', 'In your next game as White, play 1.d4 and 2.Bf4, and play e3 only after the bishop is out.', 'The bishop on f4 comes out before e3 closes the diagonal. | The structure d4, e3, c3 with knights on f3 and d2 is solid against nearly anything. | Keep your bishop with Bg3 when Black offers a trade.', [3, 5, 7, 9, 11]),
    rep(LONDON_C5, 'London System against ...c5', 'Black hits d4 early: hold it and keep developing.', 'Black\'s ...c5 puts pressure on d4 straight away. The answer is simple: support the pawn and keep your pieces calm.', 'Support d4 with e3 and c3.', 'When Black pressures d4, count its attackers and defenders (you know how).', 'The d4 pawn is protected by e3, c3, and the knight on f3. | Develop the queen\'s knight to d2 so the c-pawn can support d4. | Keep the bishop on the b8-h2 diagonal with Bg3.', [3, 5, 7, 9, 11]),
    rep(LONDON_BF5, 'London System against ...Bf5', 'Black copies your bishop: stay solid and use Qb3.', 'When Black develops his bishop outside the chain too, the game is balanced. Your trump is the b7 pawn.', 'Use Qb3 to hit b7 once your pieces are developed.', 'Use the same structure and look for Qb3 when the b7 pawn is loose.', 'A mirror set-up is fine for White: you move first. | c3 secures d4 and prepares Qb3. | Qb3 attacks the b7 pawn and develops the queen at once.', [3, 5, 7, 11, 13]),
    rep(LONDON_KID, 'London System against the King\'s Indian set-up', 'The same structure against ...g6 and ...Bg7.', 'Against the fianchetto the London stays almost the same. The new idea is h3, giving your bishop a retreat square.', 'h3 gives the bishop a safe retreat.', 'Play h3 once Black fianchettoes: it is cheap and useful.', 'The London works against ...g6 and ...Bg7 too. | h3 gives your bishop a retreat square on h2. | Hold the centre with c3 and e3, and take on e5 when Black pushes.', [3, 5, 7, 9, 11]),
  ],
};

export const repE5: Unit = {
  id: 'rep-e5',
  title: 'Black vs 1.e4: 1...e5',
  blurb: 'The most direct reply. These lines cover what you actually face: Italian and Two Knights, Scotch, Petrov-style positions and the Four Knights.',
  track: 'openings',
  cat: 'opening',
  stage: 2,
  lessons: [
    rep(TWO, 'Italian and Two Knights: a solid set-up', 'Meet 3.Bc4 with ...Nf6 and a calm plan.', 'The Italian is the opening you meet most. After 3.Bc4 the move ...Nf6 gives you an active, reliable position.', 'Develop quickly, castle and challenge the centre.', 'After 3.Bc4 Nf6, if White plays d3, castle quickly and use ...d6 and ...Na5 to gain space.', 'Answer 1.e4 with ...e5 and 2.Nf3 with ...Nc6. | Meet 3.Bc4 with ...Nf6 (not ...Bc5 if you want maximum safety). | Castle early and support e5 with ...d6.', [4, 6, 8, 10, 12]),
    rep(SCOTCH, 'Scotch Game', 'White opens the centre. Take the pawn and trade the knights.', 'The Scotch Game is a straightforward line. After the exchanges your pieces come out with tempo.', 'Take on d4 and recapture with the pawn on c6.', 'In the Scotch, take the d4 pawn and play ...Nf6 at once.', 'After 4.d4, take the pawn: ...exd4. | Attack e4 with ...Nf6. | After Nxc6 recapture with the b-pawn: it opens the b-file.', [4, 6, 8, 12, 14]),
    rep(PETROV, 'Petrov Defence', 'Counter-attack e4 instead of defending e5.', 'The Petrov is a great way to meet 1.e4. After 3.Nxe5 do not take the pawn immediately: first kick the knight with ...d6. You scored well with these positions.', 'Kick the knight with ...d6 before taking on e4.', 'Remember the order: ...d6 first, then ...Nxe4.', 'After 3.Nxe5 play ...d6 first. | Take e4 only after the knight has retreated. | Solid pieces and a healthy centre give you a comfortable game.', [4, 6, 8, 10, 12]),
    rep(FOUR, 'Four Knights Game', 'Mirror White\'s pin and take the knight.', 'When White plays quiet knights, you can mirror him. The key idea is to meet 4.Bb5 with ...Bb4.', 'Mirror the pin with ...Bb4.', 'Against quiet Four Knights set-ups, develop symmetrically and do not rush.', 'Develop knights on f6 and c6. | Meet the pin with ...Bb4. | Take on c3 when White pins your knight.', [4, 8, 10, 12, 14]),
  ],
};

export const repQgd: Unit = {
  id: 'rep-qgd',
  title: 'Black vs 1.d4: Queen\'s Gambit Declined',
  blurb: 'Solid, sensible and easy to learn: pawns on d5 and e6, a knight on f6, castle and wait.',
  track: 'openings',
  cat: 'opening',
  stage: 3,
  lessons: [
    rep(QGD, 'Queen\'s Gambit Declined: main line', 'The set-up that stays the same in almost every game.', 'The Queen\'s Gambit is not a real gambit: you can take the pawn, but the solid way is to decline with ...e6.', 'Keep d5 supported with ...e6, develop and castle.', 'Against 1.d4 d5 2.c4, play ...e6 and ...Nf6, then castle.', 'Decline the gambit with ...e6. | Develop the knights, the bishop and castle. | Use ...h6 and ...b6 to solve your queen-side bishop.', [4, 6, 8, 10, 12]),
    rep(QGD_EX, 'Queen\'s Gambit Declined: Exchange variation', 'White trades on d5: recapture and keep your solid pawn.', 'If White takes on d5, recapture with the e-pawn. You get an open e-file and a healthy structure.', 'Recapture with the e-pawn and support d5 with ...c6.', 'In the Exchange variation, use ...c6 and develop calmly.', 'Recapture with ...exd5. | Support d5 with ...c6. | Develop ...Be7 and ...Nbd7 and castle.', [6, 8, 10, 12, 14]),
    rep(QGD_LON, 'Meeting the London with ...c5', 'You will face the London from other players: here is your plan.', 'Black has a good answer to the London too: strike at d4 immediately.', 'Hit d4 with ...c5 and ...Nc6.', 'Against the London, play ...c5 and ...Nc6, and challenge the bishop with ...Bd6.', 'Strike at d4 with ...c5 and ...Nc6. | Develop ...Nf6, ...e6 and ...Bd6. | Challenge the London bishop and castle.', [4, 6, 8, 10, 12]),
  ],
};

