import { B, choice, cmd, lesson, o, ph, pos, squares, START_FEN, tf, txt } from '../build.ts';
import type { Unit } from '../types.ts';

const S = START_FEN;

export const notation: Unit = {
  id: 'notation',
  title: 'Notation',
  blurb: 'Read and write the language of chess, so every book, video and game score makes sense.',
  track: 'notation',
  cat: 'notation',
  stage: 0,
  lessons: [
    lesson({
      id: 'not-1',
      title: 'Files, ranks and squares',
      blurb: 'Give every square its name.',
      mins: 5,
      intro: "Let's start with the address system. Once you can find any square in a second, everything else in chess gets easier to read.",
      rule: 'Letter first, number second: file, then rank.',
      habit: 'Next game, say the square names quietly to yourself when you plan a move: "knight to f5".',
      recap: 'A square is a letter (file, a to h) plus a number (rank, 1 to 8). | White is at the bottom: a1 is the bottom-left corner, always a dark square. | The four centre squares are d4, e4, d5 and e5.',
      steps: [
        ...ph(
          'example',
          txt(
            'Every square has an address',
            'The columns are called **files** and are named a to h, left to right from White\'s side. The rows are **ranks**, numbered 1 to 8 from White\'s side up.\n\nPut them together, letter first and number second. White\'s king starts on **e1**: the e-file, rank 1.',
            B(S, undefined, 'y:e1'),
          ),
          txt(
            'Start with the centre',
            'If you only learn four squares today, learn these: **d4, e4, d5, e5**. Nearly every opening is a fight for them, so you will hear their names constantly.',
            B(S, undefined, 'g:d4 g:e4 g:d5 g:e5'),
          ),
        ),
        ...ph('guided', squares('Your turn. Tap the square e4.', B(S), 'e4', 'e4 is the e-file, fourth rank. It is the square the king\'s pawn jumps to in the most common first move in chess.', { hint: 'Find the e-file first (fifth column from the left), then count up four ranks.' })),
        ...ph(
          'practice',
          squares('Where does the black queen start? Tap her square.', B(S), 'd8', 'The queens start on their own colour: White\'s on d1, Black\'s on d8. Black\'s queen is on the d-file, rank 8.', { hint: 'Black\'s pieces are on the top rank. Which file is the queen on, next to the king?' }),
          squares('Tap both squares: g1 and c8.', B(S), 'g1 c8', 'g1 is White\'s king-side knight; c8 is Black\'s queen-side bishop. Letter first, number second, every time.'),
          squares('Same board, but you are Black now, so it is flipped. Tap h1.', B(S, undefined, undefined, 'b'), 'h1', 'Squares never change names when the board flips. h1 is still White\'s king-side rook corner; it is just at the top-left for you.', { hint: 'a1 and h1 are always on White\'s back rank. Look for the rank-1 corner farthest from the a-file.' }),
          choice('Which square is highlighted?', [o('f6', true, 'f-file, sixth rank: the square in front of Black\'s knight on g8.'), o('e6'), o('f3'), o('g6')], 'Count the file from the left (a b c d e f), then the rank from your own side.', B(S, undefined, 'y:f6')),
          squares('Tap the four central squares.', B(S), 'd4 e4 d5 e5', 'The centre is d4, e4, d5, e5. Pieces placed there reach the most squares, which is why we fight for them.'),
          tf('a1 is a dark square.', true, 'Rule of thumb: the bottom-left corner a1 is dark, and the bottom-right h1 is light. "Light square on the right" gets your board set up correctly every time.', B(S, undefined, 'y:a1')),
        ),
      ],
    }),

    lesson({
      id: 'not-2',
      title: 'Piece letters and plain moves',
      blurb: 'N for knight, K for king, and no letter at all for pawns.',
      mins: 6,
      intro: 'A written move is a tiny sentence: the piece, then where it goes. Let\'s learn the six words.',
      rule: 'Piece letter, then destination square. Pawns skip the letter.',
      habit: 'When you read a move in a book or video, find the piece first, then the square. Do it out loud once.',
      recap: 'K king, Q queen, R rook, B bishop, N knight (K is taken, so knight is N). | Pawns have no letter: "e4" is a pawn move to e4. | "Nf3" means the knight goes to f3.',
      steps: [
        ...ph(
          'example',
          txt(
            'The six words',
            '**K** king, **Q** queen, **R** rook, **B** bishop, **N** knight. The knight takes N because K is already the king.\n\nPawns get no letter at all. So **e4** is a pawn going to e4, and **Nf3** is a knight going to f3.',
            B(S, 'g:g1f3'),
          ),
          txt(
            'Read it like a sentence',
            '"Bc4" is the bishop to c4. "Qd1" is the queen on (or to) d1. "d4" is a pawn to d4. There is no "from" square, because usually only one piece of that kind can reach the square.',
            B(pos('e4 e5'), 'g:f1c4'),
          ),
        ),
        ...ph('guided', cmd(S, 'e4', 'e4 has no letter, so it is a pawn move. The pawn from e2 jumps two squares to e4.', { prompt: 'Play e4.', hint: 'No letter means pawn. Which pawn can reach e4?' })),
        ...ph(
          'practice',
          cmd(S, 'Nf3', 'N for knight, f3 for the square. The knight hops from g1 over its own pawns.', { prompt: 'Play Nf3.', hint: 'N is the knight. Which knight can reach f3?' }),
          cmd(pos('e4 e5 Nf3 Nc6'), 'Bc4', 'B is the bishop. From f1 it slides along the diagonal to c4, aiming at the f7 square.', { prompt: 'Play Bc4.' }),
          cmd(pos('d4 d5'), 'c4', 'No letter: a pawn move. This is the Queen\'s Gambit; you will meet it in the openings.', { prompt: 'Play c4.' }),
          choice('Which of these means "knight to c3"?', [o('Nc3', true, 'N then the square.'), o('Kc3', 'K is the king.'), o('c3', 'No letter means a pawn move.'), o('3Nc', 'Square names are always letter first, then number.')], 'The first character tells you the piece; the last two tell you the square.'),
          choice('What does "Qd1" tell you?', [o('The queen is on d1 (or goes there)', true, 'Q is the queen and d1 the square.'), o('A pawn moves to d1', 'Pawns have no letter.'), o('The king moves to d1', 'K is the king.')], 'Letter = piece, then square.'),
        ),
      ],
    }),

    lesson({
      id: 'not-3',
      title: 'Captures, checks and checkmate',
      blurb: 'x for capture, + for check, # for mate.',
      mins: 6,
      intro: 'Three little symbols carry a lot of news: something got taken, the king is attacked, or the game is over.',
      rule: 'x means takes, + means check, # means checkmate.',
      habit: 'When you scan a game score, circle every "+" and "x" first. Those are the moves where something happened.',
      recap: 'x means capture: "Nxe5" is a knight taking on e5. | A pawn capture names the file it came from: "exd5". | + is check, # is checkmate (the game ends).',
      steps: [
        ...ph(
          'example',
          txt(
            'x marks a capture',
            'Put an **x** between the piece and the square. "Nxe5": the knight takes whatever stands on e5. For a pawn we show where it started: **exd5** means the pawn from the e-file captures on d5.',
            B(pos('e4 e5 Nf3 Nc6 d4 exd4'), 'g:f3d4'),
          ),
          txt(
            'Check and checkmate',
            'A **+** after a move means it gives check. A **#** means checkmate: the game is over. The famous Scholar\'s Mate ends with **Qxf7#**: the queen takes on f7, check, and there is no way out.',
            B(pos('e4 e5 Bc4 Nc6 Qh5 Nf6'), 'g:h5f7', 'r:e8'),
          ),
        ),
        ...ph('guided', cmd(pos('e4 e5 Nf3 Nc6 d4 exd4'), 'Nxd4', 'The x tells you it is a capture. Your knight takes the pawn on d4 and the centre is yours.', { prompt: 'Play Nxd4.', hint: 'N is the knight and x means it captures on d4. Which knight can reach d4?' })),
        ...ph(
          'practice',
          cmd(pos('e4 d5'), 'exd5', 'A pawn capture starts with the file the pawn leaves: "exd5". It means the e-pawn takes on d5.', { prompt: 'Play exd5.' }),
          cmd(pos('e4 e5 Bc4 Nc6 Qh5 Nf6'), 'Qxf7#', 'The # says it all: the queen takes f7, the bishop on c4 protects her, and the king has no escape.', { prompt: 'Play Qxf7#. Look at the end of the notation: what is it announcing?' }),
          cmd(pos('e4 e5 Nf3 d6 Bc4 Bg4 Nc3 g6 Nxe5 Bxd1'), 'Bxf7+', 'The + means check. The bishop takes f7 and gives check at the same time.', { prompt: 'Play Bxf7+.' }),
          choice('What does "Rxa8+" describe?', [o('A rook captures on a8 and gives check', true, 'x is a capture, + is check.'), o('A rook moves to a8, no capture', 'The x says something was taken.'), o('A rook captures on a8 and it is checkmate', 'Checkmate would be # instead of +.')], 'Read the symbols from left to right: piece, takes, square, check.'),
          tf('"exd5" means the e-pawn captured on d5.', true, 'For pawn captures the first letter is the file the pawn came from. That is the one place a pawn move starts with a letter and has an x.', B(pos('e4 d5'), 'g:e4d5')),
        ),
      ],
    }),

    lesson({
      id: 'not-4',
      title: 'Castling, promotion and "which knight?"',
      blurb: 'The special cases that trip everybody up at first.',
      mins: 7,
      intro: 'A few moves have their own spelling. They look odd the first time, so let\'s meet them one by one.',
      rule: 'When two pieces can go to the same square, say which one by adding its file or rank.',
      habit: 'In your next game, castle by thinking "O-O short, O-O-O long" so you can read both at a glance.',
      recap: 'O-O is castling on the king side (short); O-O-O is on the queen side (long). | e8=Q means a pawn promotes to a queen. | "Nbd2" means the knight from the b-file goes to d2.',
      steps: [
        ...ph(
          'example',
          txt(
            'Castling and promotion',
            'Castling king side is **O-O** (letter O, not zero); queen side is **O-O-O**. Promotion adds an equals sign and the new piece: **e8=Q** is a pawn reaching e8 and becoming a queen.',
            B(pos('e4 e5 Nf3 Nc6 Bc4 Bc5'), 'g:e1g1'),
          ),
          txt(
            'Two knights, one square',
            'Sometimes both knights can reach the same square. Then we add the file the mover starts on: **Nbd2** is the knight from b1; **Nfd2** would be the one from f3. If the files match, we use the rank instead: **R1e2**.',
            B('rnbqkb1r/pppppppp/5n2/8/3P4/5N2/PPP1PPPP/RNBQKB1R w KQkq - 0 1', 'g:b1d2 b:f3d2'),
          ),
        ),
        ...ph('guided', cmd(pos('e4 e5 Nf3 Nc6 Bc4 Bc5'), 'O-O', 'Short castling: king two squares toward the h-file, rook jumps over. Letter O, not a zero.', { prompt: 'Castle on the king side.', hint: 'King side is short. The notation is O-O.' })),
        ...ph(
          'practice',
          cmd('r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1', 'O-O', 'You castled short. King safer, rook toward the centre, in one move.', { prompt: 'Play O-O.' }),
          cmd('r3k2r/pppqbppp/2np1n2/4p1B1/2B1P3/2NP1N2/PPP2PPP/R2QK2R b KQkq - 0 1', 'O-O-O', 'Queen-side castling passes over three squares, so it is written with three O\'s.', { prompt: 'Castle queen side as Black.' }),
          cmd('8/4P3/8/8/8/8/k7/4K3 w - - 0 1', 'e8=Q', 'The equals sign shows what the pawn becomes. Here: a queen.', { prompt: 'Play e8=Q.' }),
          cmd('rnbqkb1r/pppppppp/5n2/8/3P4/5N2/PPP1PPPP/RNBQKB1R w KQkq - 0 1', 'Nbd2', 'Both knights could reach d2, so the "b" says which one: the knight from b1.', { prompt: 'Play Nbd2.' }),
          choice('Both White knights can go to d2. What does "Nfd2" mean?', [o('The knight from the f-file moves to d2', true, 'The extra letter is where the piece starts.'), o('Knight to f, then d2', 'Think of it as a "from" letter.'), o('Knight takes on d2', 'A capture would have an x.')], 'The extra file or rank tells you which piece.'),
        ),
      ],
    }),

    lesson({
      id: 'not-5',
      title: 'Reading a whole game',
      blurb: 'Put it all together and follow a real opening move by move.',
      mins: 7,
      intro: 'Now you can read every symbol. Let\'s play through a real opening from nothing but the notation.',
      rule: 'Read every move in order: number, White\'s move, Black\'s move.',
      habit: 'Pick one game from a book or video this week and play it through on a board, move by move.',
      recap: 'A game score is a list of numbered pairs: "1. e4 e5" is move 1 for both sides. | Each pair is White then Black. | Playing a game through from notation is the best way to learn it.',
      steps: [
        ...ph(
          'example',
          txt(
            'A game is a list of pairs',
            '"1. e4 e5 2. Nf3 Nc6 3. Bb5 a6" reads: on move 1 White played e4 and Black replied e5; on move 2 White played Nf3 and Black Nc6; and so on. The number belongs to the pair, not to each move.\n\nLet\'s play that game together. I will tell you each move; you play it.',
            B(S),
          ),
        ),
        ...ph(
          'guided',
          cmd(S, 'e4', '1. e4 — White takes the centre.', { prompt: '1. e4' }),
          cmd(pos('e4'), 'e5', '1... e5 — Black answers in kind. The three dots mean it is Black\'s move.', { prompt: '1... e5 (you are Black now)' }),
          cmd(pos('e4 e5'), 'Nf3', '2. Nf3 — the knight comes out and attacks the pawn on e5.', { prompt: '2. Nf3' }),
          cmd(pos('e4 e5 Nf3'), 'Nc6', '2... Nc6 — Black defends the pawn with a developing move.', { prompt: '2... Nc6' }),
          cmd(pos('e4 e5 Nf3 Nc6'), 'Bb5', '3. Bb5 — this is the Ruy Lopez, one of the oldest openings still played at the top level.', { prompt: '3. Bb5' }),
        ),
        ...ph(
          'practice',
          cmd(pos('e4 e5 Nf3 Nc6 Bb5'), 'a6', '3... a6 — Black asks the bishop what it wants to do.', { prompt: '3... a6' }),
          choice('In "5. O-O Be7", whose move is O-O?', [o('White\'s', true, 'In a pair the first move is White\'s, the second is Black\'s.'), o('Black\'s', 'Black\'s move comes second in the pair: Be7.')], 'First move in the pair = White.'),
          cmd(pos('e4 e5 Nf3 Nc6 Bb5 a6'), 'Ba4', '4. Ba4 — the bishop retreats but keeps the pin on the knight alive.', { prompt: '4. Ba4' }),
          cmd(pos('e4 e5 Nf3 Nc6 Bb5 a6 Ba4'), 'Nf6', '4... Nf6 — Black develops and attacks the pawn on e4.', { prompt: '4... Nf6' }),
          choice('How would you write "the pawn on e5 captures the pawn on d6"?', [o('exd6', true, 'File it leaves, x, square it lands on.'), o('e5d6', 'Short and clear, but not standard notation.'), o('pxd6', 'Pawn moves do not use a P; they use the file.')], 'Pawn captures name the file they leave.'),
        ),
      ],
    }),

    lesson({
      id: 'mg-sprint',
      mini: 'sprint',
      title: 'Square Sprint',
      blurb: 'Thirty seconds, one square name at a time. Beat your best.',
      mins: 3,
      intro: 'Time to make the coordinates automatic. A square name appears; tap it as fast as you can. Thirty seconds a round.',
      rule: 'Fast square-finding is built from short, repeated rounds.',
      habit: 'One round a day, before your first game, is plenty.',
      recap: 'Speed on the board comes from knowing coordinates without counting. | Try both White and Black views; Black\'s view is the harder one. | Score 25 or more for the Notation Ninja badge.',
      steps: [],
    }),
    lesson({
      id: 'mg-name',
      mini: 'name',
      title: 'Name that move',
      blurb: 'Watch a move, pick its notation.',
      mins: 4,
      intro: 'A move is played with an arrow. You pick the right way to write it.',
      rule: 'Piece, takes, square, check: read the move from the board.',
      habit: 'When you review games, say the move in notation before you look at the score.',
      recap: 'Look for the piece that moved and whether it captured. | Check for the check sign. | If two pieces could move there, expect a file or rank letter.',
      steps: [],
    }),
    lesson({
      id: 'mg-notation',
      mini: 'notation',
      title: 'Play the notation',
      blurb: 'A move is written; make it on the board.',
      mins: 4,
      intro: 'The reverse game: I show you a move in notation and you play it on the board.',
      rule: 'Translate the notation into a piece and a square before you touch the board.',
      habit: 'Follow a game score on a real board once a week.',
      recap: 'Find the piece, then the square. | Captures and checks confirm you have read it right. | The more you do it, the less you translate.',
      steps: [],
    }),
  ],
};
