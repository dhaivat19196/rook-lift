import { B, choice, lesson, mv, o, ph, pos, shot, squares, think, tf, txt } from '../build.ts';
import type { Unit } from '../types.ts';
import { gameFen } from './games.ts';

// ----- seed positions (all verified by Stockfish when the app is built) -----
const FORK_RK = 'r3k3/pp3ppp/8/3N4/8/8/PPP2PPP/2R1K3 w - - 0 1'; // Nc7+
const FORK_QR = 'r6k/p4ppp/3q4/6N1/8/8/P3QPPP/R5K1 w - - 0 1'; // Nxf7+
const FORK_KQ = '2q3k1/5ppp/8/3N4/8/8/4QPPP/6K1 w - - 0 1'; // Ne7+
const FORK_PAWN = 'r3k2r/ppp2ppp/8/3N4/8/8/PPP2PPP/R3K2R w KQkq - 0 1'; // Nxc7+
const PETROV = pos('e4 e5 Nf3 Nf6 Nxe5 Nxe4 Qe2 Nf6'); // Nc6+
const PIN_N = '4k3/pp2nppp/8/6B1/8/8/PPP1R1PP/4K3 w - - 0 1'; // Rxe7+
const PIN_Q = '4k3/4q3/8/8/8/8/PP2R1PP/4K3 w - - 0 1'; // Rxe7+
const SK_RANK = '4k2r/1pp2ppp/8/8/8/8/1PP2PPP/R3K3 w - - 0 1'; // Ra8+
const SK_FILE = '4r3/8/8/4k3/8/8/6K1/7R w - - 0 1'; // Re1+
const SK_BISHOP = '3q4/4k1pp/8/8/8/8/PPP2PPP/2B1K3 w - - 0 1'; // Bg5+
const BR_DEFLECT = '2r3k1/5ppp/8/3Q4/8/8/5PPP/3R2K1 w - - 0 1'; // Qd8+
const BR_TRADE = '3r1rk1/5ppp/8/8/8/8/3Q1PPP/3R2K1 w - - 0 1'; // Qxd8
const BR_ONE = '6k1/5ppp/8/8/8/8/5PPP/3Q2K1 w - - 0 1'; // Qd8#

// =====================================================================================================
// Knight stage: your first real tactics
// =====================================================================================================
export const tacticsKnight: Unit = {
  id: 'k-tactics',
  title: 'Basic tactics',
  blurb: 'Forks, pins, skewers and the back rank: the four tricks behind most won pieces.',
  track: 'tactics',
  cat: 'tactics',
  stage: 1,
  lessons: [
    lesson({
      id: 'tac-fork-n',
      title: 'Knight forks',
      blurb: 'One knight move, two targets.',
      mins: 9,
      tags: ['fork', 'missed_win'],
      intro: 'A fork is a move that attacks two things at once, and the knight is the best forker there is. It jumps in where the pieces it attacks cannot hit back. You will win a lot of material with this one.',
      rule: 'Look for the square where your knight hits two things at once.',
      habit: 'Every time you have a knight, ask: from which squares would it attack two of their pieces? Then check whether you can get there with check or a capture.',
      recap: 'A fork attacks two or more targets at once. | The knight is dangerous because the pieces it attacks cannot capture it back (they do not move like a knight). | Forks with check are the strongest: the king must move and you take the other piece.',
      steps: [
        ...ph(
          'example',
          txt(
            'Two targets, one jump',
            'Look at the white knight on d5. If it jumps to **c7**, it checks the king on e8 **and** attacks the rook on a8 at the same time. The king has to move, and then the knight takes the rook.\n\nThat is a knight fork: the knight hits two things, and neither of them can capture it.',
            B(FORK_RK, 'g:d5c7 r:c7e8 r:c7a8', 'y:c7'),
          ),
          txt(
            'Why the knight?',
            'Rooks, bishops and queens move in lines. A knight moves in an L, so it attacks squares that those pieces cannot attack back. A queen and a rook cannot take a knight that sits a knight\'s move away.\n\nThat is why a fork by a knight is so hard to stop: after it lands, the only reply is to move one target and lose the other.',
            B(FORK_QR, 'g:g5f7 r:f7h8 r:f7d6', 'y:f7'),
          ),
        ),
        ...ph(
          'guided',
          shot(FORK_RK, 'Nc7+', 'The knight checks the king and attacks the rook on a8. The king must move, and the rook falls.', {
            prompt: 'White to move. Where does the knight fork the king and the rook?',
            think: think('Which black pieces are on squares a knight could attack together?', ['The king on e8 and the rook on a8', 'The pawns on a7 and b7', 'Nothing yet'], 0, 'Right. A knight on c7 attacks both e8 and a8.'),
            hint: 'The king and the rook sit on squares that are a knight jump apart from the same square. Which square is that?',
            rule: 'Look for the square where your knight hits two things at once.',
          }),
        ),
        ...ph(
          'practice',
          shot(FORK_QR, 'Nxf7+', 'The knight captures a pawn with check and also attacks the queen on d6. The king moves, and the queen is gone.', { prompt: 'White to move. A capture can be a fork too.', hint: 'Look at the f7 square. What would a knight there attack?' }),
          shot(FORK_KQ, 'Ne7+', 'Check, and the knight also attacks the queen on c8. The king has to move and White takes the queen for a knight.', { prompt: 'White to move. Find the check that also hits the queen.', hint: 'Which squares check the king on g8? Which of those also attack the queen?' }),
          shot(FORK_PAWN, 'Nxc7+', 'Capture a pawn with check, and the rook on a8 is attacked too. A fork often comes with a free pawn.', { prompt: 'White to move. The pawn on c7 is the key.', hint: 'The pawn on c7 is the only thing between the knight and a fork.' }),
          shot(PETROV, 'Nc6+', 'A discovered check: the queen on e2 checks along the e-file when the knight moves, and the knight lands on c6 attacking the queen on d8. Black must answer the check, then White takes the queen.', { prompt: 'White to move. This is a famous trap in the Petrov Defence.', hint: 'The queen on e2 and the king on e8 face each other along the e-file, with only the knight in between.' }),
          choice('Why is a knight such a good forking piece?', [o('The pieces it attacks cannot capture it back', true, 'A queen or rook cannot hit a knight that stands a knight\'s move away, so the fork usually cannot be punished.'), o('It is worth more than a bishop', 'Knights and bishops are worth the same. The difference is how they move.'), o('It can move twice in a row', 'Pieces move once per turn.')], 'Think about how a knight moves compared with the pieces it attacks.', undefined, { reasoning: true }),
        ),
      ],
    }),

    lesson({
      id: 'tac-pin',
      title: 'Pins',
      blurb: 'A piece that cannot move because something more valuable stands behind it.',
      mins: 9,
      tags: ['missed_win'],
      intro: 'A pinned piece is stuck: if it moves, something more important behind it gets captured. That means you can attack it again and again without it escaping. Let me show you how to build on a pin.',
      rule: 'Attack the pinned piece again: it cannot run away.',
      habit: 'When you pin something, ask "what else can attack that piece?" before you do anything else.',
      recap: 'A pin freezes a piece because moving it would expose something behind it. | An absolute pin is against the king (the piece may not move at all); a relative pin is against another piece. | Pile up attackers on a pinned piece: it cannot escape.',
      steps: [
        ...ph(
          'example',
          txt(
            'The absolute pin',
            'The black knight on e7 stands between the white rook on e2 and the black king on e8. If it moves, the king would be in check, and that is illegal. So the knight is **pinned**.\n\nA pinned piece is a target: it cannot move, so attack it again with something else.',
            B(PIN_N, 'g:e2e7 r:e7e8 g:g5e7', 'y:e7'),
          ),
          txt(
            'Pin to a more valuable piece',
            'A pin does not have to be against the king. The black queen on e7 is pinned by the white rook because if she moves, the king would be attacked. In a relative pin the piece can move, but it would lose something bigger.\n\nBoth kinds work the same way: increase the pressure on the pinned piece.',
            B(PIN_Q, 'g:e2e7 r:e7e8', 'y:e7'),
          ),
        ),
        ...ph(
          'guided',
          shot(PIN_N, 'Rxe7+', 'The knight on e7 is pinned and attacked by the bishop and the rook. Rxe7+ takes it with check, protected by the bishop on g5. Two attackers beat one defender, and the knight could not run.', { prompt: 'White to move. The knight on e7 is pinned to the king.', hint: 'The knight is attacked twice and protected once. Count them.', rule: 'Attack the pinned piece again: it cannot run away.' }),
        ),
        ...ph(
          'practice',
          shot(PIN_Q, 'Rxe7+', 'The queen on e7 is pinned to her king. The rook takes her with check, and Kxe7 is the only recapture, so White gives a rook for a queen.', { prompt: 'White to move. Look at the black queen.', hint: 'Which black piece is stuck on the e-file?' }),
          shot(gameFen('opera', 21), 'Bxb5+', 'A check that wins a pawn and pins the knight on d7 to the king. In the next moves Morphy piles more pieces on the pinned knight.', { prompt: 'White to move. This is the Opera Game (Morphy, 1858).', hint: 'Which check also attacks something?' }),
          shot(gameFen('opera', 27), 'Rd1', 'Rd1 attacks the pinned rook on d7 again. Black is tied up: the queen on e7 and the pieces on d7 cannot move without losing something.', { prompt: 'White to move. The Opera Game again: Black\'s pieces are tied up. How do you keep the pressure on?', hint: 'Which Black piece is pinned and can be attacked once more?' }),
          squares('Which black piece is pinned to its king?', { fen: pos('e4 e5 Nf3 Nc6 Bb5 d6') }, 'c6', 'The bishop on b5 looks through c6 and d7 (the d-pawn moved) at the king on e8. The knight on c6 cannot move without exposing the king.', { hint: 'Follow the bishop\'s diagonal toward the black king.' }),
          tf('A pinned piece can still give check or capture the pinning piece along the pin line.', true, 'Yes: a pinned piece can move along the line of the pin (including capturing the pinning piece). What it cannot do is leave the line.', B(PIN_N, 'r:e7e2')),
        ),
      ],
    }),

    lesson({
      id: 'tac-skewer',
      title: 'Skewers',
      blurb: 'The reverse of a pin: the big piece has to move, and the one behind it falls.',
      mins: 8,
      tags: ['missed_win'],
      intro: 'A skewer is a pin turned around. You attack the more valuable piece first. It has to move out of the way, and you take what was standing behind it.',
      rule: 'Attack the valuable piece first, then take what stands behind it.',
      habit: 'Before you play a check with a rook, bishop or queen, look at what stands on the other side of the king.',
      recap: 'A skewer attacks a valuable piece, and when it moves a piece behind it is lost. | Checks along a line often skewer something behind the king. | The pieces must be on the same line: rank, file or diagonal.',
      steps: [
        ...ph(
          'example',
          txt(
            'King in front, rook behind',
            'Black\'s king on e8 and rook on h8 are on the same rank. The white rook gives check from a8. The king has to step out of the line and the rook on h8 is unprotected: Rxh8.\n\nThat is a skewer. Compare with a pin: in a pin the less valuable piece is in front; in a skewer it is behind.',
            B(SK_RANK, 'g:a1a8 r:a8e8 y:e8h8', 'y:h8'),
          ),
        ),
        ...ph(
          'guided',
          shot(SK_RANK, 'Ra8+', 'The check forces the king off the eighth rank, and the rook on h8 is left alone. Rxh8 wins a rook.', { prompt: 'White to move. Look at the black king and rook: what do they share?', hint: 'The king on e8 and the rook on h8 are on the same rank. Which square of that rank can your rook reach?' }),
        ),
        ...ph(
          'practice',
          mv(SK_FILE, 'Re1+', 'The king is on the e-file and the rook behind it too. After the king steps aside, Rxe8 wins the rook for nothing.', {
            prompt: 'White to move. Check, then take what is behind.',
            cont: [{ reply: 'Kd6', ans: ['Rxe8'] }],
            hint: 'The king and the rook stand on the same file.',
            tactic: true,
          }),
          shot(SK_BISHOP, 'Bg5+', 'The bishop checks the king on e7 and the queen on d8 is behind it on the same diagonal. The king must move, and Bxd8 wins the queen.', { prompt: 'White to move. Which check hits the queen behind the king?', hint: 'Draw a line from the bishop through the king. What is on the far side?' }),
          tf('In a skewer, the piece behind the first attacked piece is less valuable than the front piece.', true, 'Yes. The valuable piece (often the king) is in front, so it has to move, and the piece behind it is lost.', B(SK_RANK, 'g:a8h8')),
          choice('What is the difference between a pin and a skewer?', [o('In a skewer, the more valuable piece is in front', true, 'In a pin the more valuable piece is behind, so the front piece cannot move. In a skewer it is in front, so it moves and you take the one behind.'), o('A pin is only for rooks', 'Bishops, rooks and queens can all pin and skewer.'), o('They are the same thing', 'They work in opposite directions.')], 'Which piece is in front?', undefined, { reasoning: true }),
        ),
      ],
    }),

    lesson({
      id: 'tac-backrank',
      title: 'Back-rank tactics',
      blurb: 'Sacrifices that pull the back-rank guard away.',
      mins: 9,
      tags: ['missed_mate', 'allowed_mate'],
      intro: 'You already know the back-rank mate. The next step is the tactic that makes it happen: removing the one piece that guards the back rank. Often that is a queen sacrifice, and it is the most satisfying trick in this section.',
      rule: 'If one piece guards the back rank, remove it.',
      habit: 'When their king is boxed in behind pawns, ask "which piece guards the back rank?" and whether you can take or deflect it.',
      recap: 'If the back rank is guarded by one piece, take or deflect that piece. | A sacrifice that forces the guard away is usually worth a queen. | Check your own back rank for the same weakness.',
      steps: [
        ...ph(
          'example',
          txt(
            'Remove the guard',
            'Black\'s king is boxed in and only the rook on c8 guards the back rank. White plays **Qd8+!** and the rook has to take (it is check), which pulls it off the c-file, and then **Rxd8** is checkmate.\n\nThe queen was only a tool to drag the guard away.',
            B(BR_DEFLECT, 'g:d5d8 r:c8d8', 'r:g8'),
          ),
        ),
        ...ph(
          'guided',
          shot(BR_DEFLECT, 'Qd8+', 'The rook must capture the queen because of the check, and then Rxd8 is mate. The queen\'s sacrifice removes the only guard of the back rank.', { prompt: 'White to move. The black rook is doing all the guarding.', hint: 'What if the queen offered itself on the back rank, with check?', rule: 'If one piece guards the back rank, remove it.' }),
        ),
        ...ph(
          'practice',
          shot(BR_TRADE, 'Qxd8', 'Take the queen. Black has to recapture with the rook, and then the rook on d1 takes on d8 with checkmate.', { prompt: 'White to move. Can the guard be taken?', hint: 'After Qxd8 what must Black do, and what is left on the back rank?' }),
          shot(BR_ONE, 'Qd8#', 'The pawns on f7, g7 and h7 block the king in, so the queen alone mates it.', { prompt: 'White to move. One move wins.', hint: 'Which pawns box the king in?' }),
          mv(pos('e4 e5 Nf3 Nc6 Bb5 Nf6 O-O Nxe4 d4 Nd6 Bxc6 dxc6 dxe5 Nf5'), 'Qxd8+', 'Another queen trade with check. Notice how the queens leave the board with tempo, and it helps White.', { prompt: 'White to move. A check on the back rank.', hint: 'Both queens face each other on the d-file.' }),
          tf('To exploit a back-rank weakness you need a rook or queen to give the final check.', true, 'The checking piece must be a rook or queen on the back rank (or sometimes a bishop or knight). The pawns do the rest by blocking their own king.'),
        ),
      ],
    }),
  ],
};

// =====================================================================================================
// Mating patterns
// =====================================================================================================
export const matesKnight: Unit = {
  id: 'k-mates',
  title: 'Mating patterns I',
  blurb: 'Two patterns every player should recognise on sight.',
  track: 'tactics',
  cat: 'tactics',
  stage: 1,
  lessons: [
    lesson({
      id: 'tac-mate-1',
      title: 'The ladder and the queen with her king',
      blurb: 'Two rooks that walk the king to the edge, and a queen the king protects.',
      mins: 9,
      tags: ['missed_mate'],
      intro: 'Some mates are patterns you learn once and see forever. Here are two simple ones: two rooks working like a ladder, and the queen supported by her king.',
      rule: 'Two rooks on adjacent lines are a ladder; the queen next to her king is a hammer.',
      habit: 'With two rooks against a king, put one on the seventh rank and the other next to it, and walk the king to the edge.',
      recap: 'The ladder (lawnmower) mate: two rooks take turns checking so the king is pushed rank by rank to the edge. | The queen protected by her king cannot be captured. | Look for a check that cannot be taken or blocked and whose escape squares are covered.',
      steps: [
        ...ph(
          'example',
          txt(
            'The ladder',
            'Two rooks side by side on adjacent ranks make a net. One covers a rank and the other gives check on the next rank, forcing the king one rank closer to the edge, again and again, until the checks run out of ranks.\n\nHere White plays **Ra7** and then **Rb8#**: the rook on a7 covers the whole seventh rank while the other checks on the eighth.',
            B('6k1/8/8/8/8/8/R7/1R4K1 w - - 0 1', 'g:a2a7 g:b1b8', 'r:g8'),
          ),
          txt(
            'The queen and her king',
            'A queen next to the enemy king is protected by her own king, so the king cannot capture her. Put the queen on a square next to the king that is also protected by your king and it is mate if the escape squares are covered.',
            B('7k/8/6K1/8/8/8/8/1Q6 w - - 0 1', 'g:b1b8 y:g6g7', 'r:h8'),
          ),
        ),
        ...ph(
          'guided',
          mv('6k1/8/8/8/8/8/R7/1R4K1 w - - 0 1', 'Ra7', 'The rook on a7 covers the whole seventh rank. The king can only go to f8 or h8, and Rb8 is checkmate on the next move.', {
            prompt: 'White to move. Mate in two with the ladder.',
            cont: [{ reply: 'Kf8', ans: ['Rb8#'] }],
            hint: 'One rook controls a rank. Where does the king have to go?',
            tactic: true,
          }),
        ),
        ...ph(
          'practice',
          shot('7k/8/6K1/8/8/8/8/1Q6 w - - 0 1', 'Qb8#', 'The queen checks along the back rank, the king on g6 covers g7 and h7, and the king has nowhere to go.', { prompt: 'White to move. Mate in one.', hint: 'The white king takes care of two escape squares. Which line does the queen need?' }),
          shot('7k/5Q2/6K1/8/8/8/8/8 w - - 0 1', 'Qg7#', 'The queen is protected by the king, so it cannot be captured, and nothing else escapes. The queen and king together are the strongest team.', { prompt: 'White to move. Mate in one.', hint: 'Which square next to the king is protected by your own king?' }),
          tf('A queen can give mate next to the enemy king if her own king protects the square.', true, 'Yes. The enemy king cannot capture a protected piece, so it is a mate if the king has no other squares.', B('7k/5Q2/6K1/8/8/8/8/8 w - - 0 1', 'g:f7g7')),
          choice('Two rooks against a lone king: what is the best way to start?', [o('Put one rook on a rank beyond the king and use the other to check', true, 'The first rook fences the king in, and the other checks along the next line. Repeat.'), o('Chase the king with both rooks on the same file', 'Rooks on the same line get in each other\'s way. Use two different lines.'), o('Bring your king to the middle first', 'It is unnecessary, you can mate with two rooks alone.')], 'What does the first rook do?'),
        ),
      ],
    }),
  ],
};

export const matesBishop: Unit = {
  id: 'b-mates',
  title: 'Mating patterns II',
  blurb: 'Smothered, Arabian, Anastasia and Boden: the classics, with the famous game finishes.',
  track: 'tactics',
  cat: 'tactics',
  stage: 2,
  lessons: [
    lesson({
      id: 'tac-mate-2',
      title: 'Smothered mate and the Arabian mate',
      blurb: 'A knight that mates a king hemmed in by its own pieces, and a knight with a rook.',
      mins: 10,
      tags: ['missed_mate', 'allowed_mate'],
      intro: 'In both of these mates the knight does the final job, because a knight jumps over blockers. The king\'s own pieces can be its worst enemy.',
      rule: 'A knight check cannot be blocked: look for it when the king is hemmed in.',
      habit: 'When the enemy king has no free squares, scan for knight checks first.',
      recap: 'Smothered mate: a knight checks a king that is boxed in by its own pieces. | Often a queen sacrifice drags a defender onto the square next to the king. | Arabian mate: a knight and a rook mate the king in the corner.',
      steps: [
        ...ph(
          'example',
          txt(
            'The smothered mate',
            'The black king on h8 is hemmed in by its own rook on g8 and pawns on g7 and h7. A knight check from f7 cannot be blocked and nothing can capture the knight. The king is smothered by its own pieces.\n\nIt often starts with a queen sacrifice that forces a rook onto g8 first.',
            B('6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1', 'g:g5f7', 'r:h8 y:g8 y:g7 y:h7'),
          ),
          txt(
            'The Arabian mate',
            'A knight on f6 and a rook arriving on h7 or h1 mate a king in the h8 corner. The knight protects the rook and takes the g8 and h7 squares away. The pawn on g7 blocks the last escape.',
            B('7k/6p1/5N2/8/8/8/2K5/3R4 w - - 0 1', 'g:d1h1 y:f6h7', 'r:h8'),
          ),
        ),
        ...ph(
          'guided',
          shot('6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1', 'Nf7#', 'The knight checks from f7 and every escape square is blocked by Black\'s own pieces. That is a smothered mate.', { prompt: 'White to move. Mate in one.', hint: 'Which squares does the king have? Who is standing on them?' }),
        ),
        ...ph(
          'practice',
          mv('5r1k/6pp/7N/8/8/1Q6/8/6K1 w - - 0 1', 'Qg8+', 'The queen sacrifice forces the rook to take on g8, and then Nf7 is smothered mate. The rook was dragged onto the very square that smothers its own king.', {
            prompt: 'White to move. Mate in two: what do you give up first?',
            cont: [{ reply: 'Rxg8', ans: ['Nf7#'] }],
            hint: 'The king needs the g8 square to be blocked by its own piece. How could you force that?',
            tactic: true,
          }),
          shot('7k/6p1/5N2/8/8/8/2K5/3R4 w - - 0 1', 'Rh1#', 'The rook checks along the h-file and the knight on f6 protects it. The knight also covers g8 and h7, and the pawn on g7 blocks the last square.', { prompt: 'White to move. Mate in one.', hint: 'Which file leads to the king, and what protects the rook there?' }),
          tf('In a smothered mate the checking piece is always a knight.', true, 'Yes. A knight check cannot be blocked, and the king\'s own pieces take away every escape square.'),
          choice('Why is a knight check so dangerous against a boxed-in king?', [o('It cannot be blocked, and the king has no free squares', true, 'A knight jumps over pieces, so there is nothing to block, and a boxed-in king cannot step away.'), o('Knights are worth more than rooks', 'They are not. They are worth 3 points.'), o('It always wins the queen', 'Not always, but it often forces mate.')], 'What can a king do against a knight check?', undefined, { reasoning: true }),
        ),
      ],
    }),

    lesson({
      id: 'tac-mate-3',
      title: 'Anastasia\'s mate and Boden\'s mate',
      blurb: 'A knight and a rook on the edge, and two bishops crossing.',
      mins: 10,
      tags: ['missed_mate', 'allowed_mate'],
      intro: 'Two more classics. One uses a knight and a rook on the edge of the board, the other two bishops on crossing diagonals. Learn the pictures and you will spot them in your games.',
      rule: 'Know the picture of the mate and look for it when pieces line up.',
      habit: 'Draw the mating picture in your head when you see a king with no space on the edge of the board.',
      recap: 'Anastasia\'s mate: a knight on e7 and a rook on the h-file against a king on h7 with a pawn on g7. | Boden\'s mate: two bishops on crossing diagonals mate a king on c8 hemmed in by its own pieces. | Both need the king\'s own pieces to block its escape squares.',
      steps: [
        ...ph(
          'example',
          txt(
            'Anastasia\'s mate',
            'The knight on e7 covers g8 and g6. The black pawn on g7 blocks the king from the g-file. The rook comes to the h-file and gives check: the king has no way out. Knight and rook on the edge: Anastasia\'s mate.',
            B('8/4N1pk/8/8/8/8/8/2KR4 w - - 0 1', 'g:d1h1 y:e7g8 y:e7g6', 'r:h7'),
          ),
          txt(
            'Boden\'s mate',
            'The bishop on a6 gives check along the diagonal to c8 and the bishop on f4 covers the b8 and c7 squares. The king\'s own pieces block d8 and d7. Two bishops crossing: Boden\'s mate.',
            B('2kr4/p2n1ppp/8/8/2B2B2/8/8/6K1 w - - 0 1', 'g:c4a6 g:f4b8', 'r:c8'),
          ),
        ),
        ...ph(
          'guided',
          shot('8/4N1pk/8/8/8/8/8/2KR4 w - - 0 1', 'Rh1#', 'The rook checks down the h-file, the knight covers g6 and g8, and the pawn on g7 blocks the last square. Anastasia\'s mate.', { prompt: 'White to move. Mate in one.', hint: 'The knight is doing two jobs. Where does the rook need to go?' }),
        ),
        ...ph(
          'practice',
          shot('2kr4/p2n1ppp/8/8/2B2B2/8/8/6K1 w - - 0 1', 'Ba6#', 'The bishop checks the king on c8 through b7. The other bishop on f4 covers b8 and c7, and the king\'s own pieces block d8 and d7. Boden\'s mate.', { prompt: 'White to move. Mate in one.', hint: 'Which bishop can check along the diagonal to c8?' }),
          tf('Boden\'s mate needs the enemy king\'s own pieces to block its escape squares.', true, 'Yes. The king is boxed in by its own pieces on d8 and d7, and the bishops do the rest.'),
          choice('In Anastasia\'s mate, what stops the black king stepping to g7?', [o('Its own pawn on g7', true, 'The king\'s own pawn blocks the g7 square. The knight covers g8 and g6.'), o('The white rook', 'The rook gives the check along the file. The pawn is what blocks g7.'), o('The white king', 'The white king is far away.')], 'Look at what stands on g7.'),
          choice('In Boden\'s mate, which pieces cover the squares next to the king?', [o('Two bishops on crossing diagonals', true, 'One checks and covers b7, the other covers b8 and c7.'), o('A queen and a rook', 'That is a different pattern.'), o('Two knights', 'Knights do not make this pattern.')], 'What does the name "crossing" suggest?'),
        ),
      ],
    }),

    lesson({
      id: 'tac-mate-4',
      title: 'Famous mates from real games',
      blurb: 'Légal, Morphy, Réti and Anderssen: four finishes worth recognising.',
      mins: 10,
      tags: ['missed_mate', 'allowed_mate'],
      intro: 'The best way to remember a mating pattern is to see it in a game that made it famous. Here are four finishes. Notice how the same ideas keep coming back.',
      rule: 'Recognise the pattern, then count the escape squares.',
      habit: 'When you review a game that ends in mate, name the pattern: it will start to jump out in your own games.',
      recap: 'Légal\'s mate: a knight check supported by a bishop, after a queen sacrifice. | The Opera mate: a rook on the open file with a bishop covering the escape square. | Réti\'s and Anderssen\'s mates use bishops and rooks with the king\'s own pieces in the way.',
      steps: [
        ...ph(
          'example',
          txt(
            'Légal\'s mate',
            'In this famous finish White has given up the queen and ends with **Nd5#**. The bishop on f7 and the knight on e5 cover the squares next to the king on e7, and the knight on d5 gives the check that cannot be answered.',
            B(gameFen('legal', 13), 'g:c3d5 y:f7e8 y:e5d7', 'r:e7'),
          ),
        ),
        ...ph(
          'guided',
          shot(gameFen('legal', 13), 'Nd5#', 'The knight checks the king on e7. The bishop on f7 covers e8 and e6, the knight on e5 covers d7, and the king\'s own pieces block the rest. A mate with three minor pieces.', { prompt: 'White to move. Légal\'s mate (1750).', hint: 'Which piece gives a check that cannot be blocked?' }),
        ),
        ...ph(
          'practice',
          shot(gameFen('opera', 33), 'Rd8#', 'The rook checks along the back rank, protected by the bishop on g5, and the king cannot go anywhere. The finish of the Opera Game.', { prompt: 'White to move. The Opera Game (1858).', hint: 'Which line is open to the king, and what protects the checking piece?' }),
          shot(gameFen('reti', 21), 'Bd8#', 'The bishop checks the king on c7, the rook on d1 covers d7 and d6, and the king\'s own pieces block the rest. Réti\'s finish.', { prompt: 'White to move. Réti against Tartakower (1910).', hint: 'The king has no squares. Which piece can give a check it cannot escape?' }),
          shot(gameFen('evergreen', 47), 'Bxe7#', 'The bishop takes on e7 with check; the pawn on f6 protects it, so the king cannot capture, and every other square is covered. The finish of the Evergreen Game.', { prompt: 'White to move. The Evergreen Game (1852).', hint: 'Which capture is protected by a pawn?' }),
          shot(gameFen('lasker', 35), 'Kd2#', 'The king move uncovers the rook on h1, which checks along the first rank. Even a king can deliver a discovered check.', { prompt: 'White to move. Lasker against Thomas (1912): a king hunt that ends on g1.', hint: 'Which piece is waiting behind the king?' }),
        ),
      ],
    }),
  ],
};
