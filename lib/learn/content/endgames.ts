import { B, choice, gen, kpkTf, lesson, mv, o, ph, playout, tf, txt } from '../build.ts';
import type { Unit } from '../types.ts';

// King and pawn endings are checked exactly against the built-in tablebase; rook endings against Stockfish.
const KS_WIN = '8/8/4K3/4P3/8/8/8/4k3 w - - 0 1';
const KS_BESIDE_W = '4k3/8/8/3KP3/8/8/8/8 w - - 0 1';
const KS_BESIDE_B = '4k3/8/8/3KP3/8/8/8/8 b - - 0 1';
const KS_DEF = '8/4k3/8/4PK2/8/8/8/8 b - - 0 1';
const RP_B = 'k7/8/PK6/8/8/8/8/8 b - - 0 1';
const RP_W = 'k7/8/PK6/8/8/8/8/8 w - - 0 1';
const RP_H = '7k/8/5K2/7P/8/8/8/8 w - - 0 1';
const RP_DEF = '8/8/8/8/8/k7/P7/K7 b - - 0 1';
const DEF_D = '8/8/3k4/8/3PK3/8/8/8 b - - 0 1';
const LUCENA = '1K1k4/1P6/8/8/8/8/r7/2R5 w - - 0 1';
const PHIL = '4k3/8/r7/3PK3/8/8/8/7R b - - 0 1';

export const endKnight: Unit = {
  id: 'k-endgames',
  title: 'King and pawn endings',
  blurb: 'Key squares, the rook-pawn exception and how to hold the draw.',
  track: 'endgames',
  cat: 'endgame',
  stage: 1,
  lessons: [
    lesson({
      id: 'end-keysq',
      title: 'Key squares',
      blurb: 'Where your king needs to stand for the pawn to queen.',
      mins: 9,
      skill: 'kpk',
      tags: ['conversion'],
      intro: 'There is a short list of squares that decides every pawn ending: if your king reaches one, the pawn queens by force. If it does not, the defender can often hold. Learning them takes about five minutes.',
      rule: 'Get your king to a key square.',
      habit: 'In a pawn ending, find the key squares for your pawn and count the moves your king needs to get there.',
      recap: 'The key squares for a pawn on its 4th rank or lower are the three squares two ranks in front of it. | For a pawn on the 5th rank they are the three squares on the 6th rank and three on the 7th. | A king on a key square wins whoever is to move (except with a rook pawn).',
      steps: [
        ...ph(
          'example',
          txt(
            'The squares that win',
            'For a pawn on e5, the key squares are **d6, e6 and f6** (and the three squares behind them). If the white king gets to e6 the pawn queens, whoever is to move.\n\nHere White has a king on e6. The pawn is going to queen.',
            B(KS_WIN, 'g:e6e7', 'y:d6 y:e6 y:f6'),
          ),
        ),
        ...ph(
          'guided',
          kpkTf('White to move with the king on the key square e6: White wins.', KS_WIN, true, 'Yes. A king on a key square wins, even with the opponent to move. The black king cannot get in front of the pawn.', undefined, 'y:d6 y:e6 y:f6'),
        ),
        ...ph(
          'practice',
          mv(KS_BESIDE_W, ['Kd6', 'Ke6'], 'Step onto a key square (d6 or e6). From there the pawn runs home.', { kind: 'kpk', prompt: 'White to move. The king is beside the pawn. Which step wins?', hint: 'The key squares are d6, e6 and f6. Which of them can you reach?' }),
          kpkTf('The same position but Black is to move. Does White still win?', KS_BESIDE_B, false, 'No. Black takes the opposition with ...Ke7 or ...Kd7, and the white king cannot enter a key square. A draw.', undefined, 'y:d5 y:e8'),
          mv(KS_DEF, 'Kf7', 'Black\'s only drawing move: take the opposition on the 7th rank. Every other move lets the white king reach a key square.', { kind: 'kpk', prompt: 'Black to move. Hold the draw. There is only one move.', hint: 'You want to stay in front of the pawn and take the opposition.' }),
          choice('The pawn is on e5. Which of these is a key square?', [o('e6', true, 'The squares d6, e6 and f6 are key squares for the pawn on e5.'), o('a1', 'Far away from the pawn.'), o('e4', 'That is behind the pawn.')], 'Key squares are in front of the pawn.'),
          gen('kpk', 6),
        ),
      ],
    }),

    lesson({
      id: 'end-rookpawn',
      title: 'The rook pawn exception',
      blurb: 'The a- and h-pawns are special: they usually draw.',
      mins: 8,
      skill: 'kpk',
      tags: ['conversion'],
      intro: 'You just learned that a king on a key square wins. There is one exception, and it is worth knowing because it can save half a point: a pawn on the edge file (a or h) is usually a draw if the defender\'s king gets to the corner.',
      rule: 'A rook pawn draws if the defending king reaches the corner.',
      habit: 'When you are the defender in a pawn ending with an edge pawn, run to the corner. When you attack with one, check whether the defender can reach it.',
      recap: 'A rook pawn (a- or h-pawn) usually draws if the defending king gets to the corner. | The edge limits the attacker: there is only one side to squeeze the king. | Do not trade into a pawn ending with only a rook pawn unless the defender\'s king is far away.',
      steps: [
        ...ph(
          'example',
          txt(
            'The corner saves the game',
            'Black\'s king sits in the corner a8, White has king b6 and a pawn on a6. White cannot make progress without stalemating Black: if the king takes b7 the black king has no move.\n\nThat is why rook pawns are so hard to win with.',
            B(RP_B, 'r:a8b8', 'y:a8 y:b6'),
          ),
        ),
        ...ph(
          'guided',
          kpkTf('Black is in the corner a8 and White has king b6, pawn a6. Black to move: White wins.', RP_B, false, 'It is a draw. Black plays ...Kb8 and White cannot make progress without stalemating him.', undefined, 'y:a8 y:b6'),
        ),
        ...ph(
          'practice',
          kpkTf('Same position, White to move. White wins.', RP_W, false, 'Still a draw. Any move either stalemates Black or lets the king stay in the corner.', undefined, 'y:a8 y:b6'),
          kpkTf('White has a king on f6 and a pawn on h5. The black king is on h8 and White is to move. White wins.', RP_H, false, 'A draw: the black king sits in the corner and cannot be dislodged.', undefined, 'y:h8 y:f6'),
          mv(RP_DEF, ['Ka4', 'Kb4'], 'Stay close to the pawn and the corner. Either square keeps the draw.', { kind: 'kpk', prompt: 'Black to move. Hold the draw against the a-pawn.', hint: 'Do not run far away. You must keep the corner in reach.' }),
          choice('Why does the corner save the defender?', [o('The attacker cannot dislodge the king without stalemating it', true, 'The king in the corner has no squares to be driven from, and stalemate tricks save the draw.'), o('Rook pawns are worth more', 'They are worth the same as other pawns.'), o('The pawn cannot move', 'The pawn can move, but it cannot queen if the corner is guarded.')], 'What happens if the attacker tries to squeeze the king?', undefined, { reasoning: true }),
          tf('A rook pawn is just as easy to win with as a central pawn.', false, 'Edge pawns are the hardest to win with because the defender hides in the corner.'),
          gen('kpk', 4),
        ),
      ],
    }),

    lesson({
      id: 'end-defend',
      title: 'Holding the draw',
      blurb: 'Defending a pawn ending: find the only move.',
      mins: 9,
      tags: ['conversion'],
      intro: 'Defending is a skill of its own, and in king-and-pawn endings it is surprisingly easy once you know the rule: stay in front of the pawn and take the opposition. Often there is only one move, and you will find it.',
      rule: 'Stay in front of the pawn and keep the opposition.',
      habit: 'When defending, first ask where the pawn wants to go. Then put your king on the squares in front of it.',
      recap: 'Defend by keeping your king in front of the pawn. | When the kings face each other, make sure the other side has to move (the opposition). | Often only one move holds: count carefully.',
      steps: [
        ...ph(
          'example',
          txt(
            'The only move',
            'Here the black king has just one move that holds the draw: Ke6, keeping the opposition. Any other move lets the white king step onto a key square, and the pawn queens.\n\nWhen you defend, you are not looking for the best move, but for the only move.',
            B(DEF_D, 'g:d6e6', 'y:d4 y:e4'),
          ),
        ),
        ...ph(
          'guided',
          mv(DEF_D, 'Ke6', 'Keep the king in front of the pawn and take the opposition. Everything else loses.', { kind: 'kpk', prompt: 'Black to move. Find the only move.', hint: 'Which square keeps your king facing the white king with White to move?' }),
        ),
        ...ph(
          'practice',
          mv(KS_BESIDE_B, ['Ke7', 'Kd7'], 'Take the opposition or stay in front of the pawn. The white king cannot reach a key square.', { kind: 'kpk', prompt: 'Black to move. Hold the draw.', hint: 'The pawn is on e5, so stay in front of it.' }),
          mv(KS_DEF, 'Kf7', 'The only move: take the opposition on the 7th rank.', { kind: 'kpk', prompt: 'Black to move. One move holds.' }),
          mv('8/8/8/8/3k4/8/3P4/3K4 b - - 0 1', ['Kc5', 'Kd5', 'Ke5', 'Ke4', 'Kd3', 'Kc4'], 'A pawn on d2 far from the 4th rank is easy to hold: stay close and in front.', { kind: 'kpk', prompt: 'Black to move. White\'s pawn is still on d2.', hint: 'Stay near the pawn.' }),
          tf('When defending a pawn ending, your king should run to the other side of the board.', false, 'It must stay in front of the pawn and near it. Running away lets the attacker walk the pawn through.'),
          choice('Black must make a move. Which idea holds the draw most often?', [o('Keep the king in front of the pawn and take the opposition', true, 'It is the one rule that defends nearly every position.'), o('Attack the pawn from behind', 'A king behind the pawn cannot stop it.'), o('Push your own pawn', 'There are no other pawns.')], 'Where should the defending king be?'),
          playout({ id: 'kp-def', title: 'Hold the draw: K+P vs K', blurb: 'You defend. Take the opposition, reach a draw.', fen: '8/8/8/8/3k4/8/3P4/3K4 b - - 0 1', user: 'b', goal: 'draw', success: 'survive', maxMoves: 30, tip: 'Stay in front of the pawn and keep the opposition. If their king steps aside, step opposite.' }, 'Play the defence out against Stockfish.'),
        ),
      ],
    }),
  ],
};

export const endBishop: Unit = {
  id: 'b-endgames',
  title: 'Rook endings: two famous positions',
  blurb: 'Lucena wins and Philidor draws. If you know both you will win and save many rook endings.',
  track: 'endgames',
  cat: 'endgame',
  stage: 2,
  lessons: [
    lesson({
      id: 'end-lucena',
      title: 'The Lucena position',
      blurb: 'Build a bridge, shield your king, and queen the pawn.',
      mins: 10,
      tags: ['conversion'],
      intro: 'You have a rook and a pawn on the seventh rank and your king is trapped in front of the pawn. It looks drawn, but it is a win, and there is a method called "building a bridge". It is the most important rook ending to know.',
      rule: 'Rook to the fourth rank, step out, shield the checks.',
      habit: 'When you have a rook and a pawn on the 7th with the king in front, say "bridge" and go to the fourth rank.',
      recap: 'The Lucena position: rook plus a pawn on the 7th with your king in front of it, and the enemy king cut off by one file. | Play Rd1+ and Rd4 (the bridge) with the rook on the fourth rank. | Walk your king out and use the rook as a shield against checks.',
      steps: [
        ...ph(
          'example',
          txt(
            'Building the bridge',
            'White\'s king is in front of its pawn on b8 and Black\'s rook keeps giving checks from behind. The method: check the king away with **Rd1+**, then play the rook to the fourth rank with **Rd4**. When the king steps out, the rook blocks the checks from the fourth rank.',
            B(LUCENA, 'g:c1d1 g:d1d4', 'y:b8 y:b7'),
          ),
        ),
        ...ph(
          'guided',
          mv(LUCENA, 'Rd1+', 'Cut the king off along the d-file, then play Rd4. The bridge starts with this check.', {
            prompt: 'White to move. Win the position: step one.',
            cont: [{ reply: 'Ke7', ans: ['Rd4'] }],
            hint: 'You need to push the black king away from the d-file with a check first. Then the rook goes to the fourth rank.',
          }),
        ),
        ...ph(
          'practice',
          tf('In the Lucena position the best way to make progress is to push the pawn immediately.', false, 'It cannot move without help: the king is in front of it. You must first build the bridge with the rook.', B(LUCENA, 'r:b7b8')),
          choice('What is the rook doing on the fourth rank?', [o('Shielding the king from the rook checks', true, 'When the king steps out, the black rook\'s checks can be blocked by the rook on the 4th rank.'), o('Attacking the pawn', 'The pawn is on the 7th, not the 4th.'), o('Preparing to give mate', 'The rook is a shield, not an attacker here.')], 'What do the black rook\'s checks threaten?', undefined, { reasoning: true }),
          tf('The Lucena position is a win with the stronger side to move.', true, 'Yes. It is a win if you know the method: the bridge.'),
          choice('Which idea starts the Lucena bridge?', [o('Check the king away from the d-file with the rook', true, 'Cutting the king off is step one, and then the rook goes to the fourth rank.'), o('Push the pawn at once', 'The king is in front of it: it cannot move yet.'), o('Bring the rook back to the first rank and wait', 'Waiting gives Black time to check from behind.')], 'What must happen before the king can step out?'),
          tf('The rook goes to the fourth rank so that the checks can be blocked.', true, 'Yes: the rook on the fourth rank is the bridge that shields the king from checks.'),
          playout({ id: 'lucena', title: 'Lucena position', blurb: 'Rook + pawn: build the bridge and promote.', fen: '3K4/3P1k2/8/8/8/8/r7/4R3 w - - 0 1', user: 'w', goal: 'win', success: 'promote', maxMoves: 40, tip: 'Rook to the 4th rank (Rf1+ then Re4), step your king out, then use the rook as a shield to block checks.' }, 'Now play the Lucena position out against Stockfish.'),
        ),
      ],
    }),

    lesson({
      id: 'end-philidor',
      title: 'The Philidor defence',
      blurb: 'How to draw with a rook against a rook and pawn.',
      mins: 10,
      tags: ['conversion'],
      intro: 'Now the other side of the same coin. When you are the one defending a rook and pawn ending, there is a simple, reliable drawing method: the Philidor position. Learn one rule and you can save many games.',
      rule: 'Keep your rook on the sixth rank until the pawn advances.',
      habit: 'In a rook ending where you defend, put your rook on the third rank (from your side) first. When the pawn moves up, check from behind.',
      recap: 'Keep the rook on the sixth rank (third from your side) to stop the enemy king stepping forward. | When the pawn reaches the sixth rank, switch to checks from behind. | Never let the enemy king reach the sixth rank with the pawn behind it.',
      steps: [
        ...ph(
          'example',
          txt(
            'The third-rank wall',
            'White has king and pawn on e5 and d5, and Black\'s rook is on a6, covering the sixth rank. The white king cannot step to e6 without being checked or losing the pawn. Black waits with the rook and the king.\n\nThat sixth-rank wall is the whole idea.',
            B(PHIL, 'g:a6g6', 'y:e6 y:d6'),
          ),
        ),
        ...ph(
          'guided',
          mv(PHIL, ['Rg6', 'Kd8'], 'Keep the rook on the sixth rank so the white king cannot step forward. Waiting moves like these hold the draw.', { prompt: 'Black to move. The white king wants to step to d6 or e6.', hint: 'Do not go behind the pawn yet. Which rank must you keep covered?', wrong: { Ra1: 'It gives up the sixth rank and White wins by force.', 'Ra5+': 'It chases the king the wrong way and loses control of the sixth rank.' } }),
        ),
        ...ph(
          'practice',
          mv(PHIL, ['Rg6', 'Kd8'], 'Keep covering the sixth rank. Waiting moves hold the draw.', { prompt: 'Black to move again. Stay on the sixth rank.', hint: 'The rank to protect is the one in front of the white king.' }),
          tf('In the Philidor defence you should put your rook behind the pawn on move one.', false, 'First stay on the sixth rank. Go behind the pawn only when it advances to the sixth.', B(PHIL, 'r:a6a1')),
          choice('Why must the black rook stay on the sixth rank?', [o('To stop the white king from stepping onto the sixth rank', true, 'If the king reaches the sixth rank with the pawn behind it, the position is winning.'), o('To attack the pawn', 'The rook on the sixth does not attack d5 here.'), o('To prepare mate', 'It is a defensive idea.')], 'What does the white king want?', undefined, { reasoning: true }),
          tf('Philidor is a drawn position if Black plays correctly.', true, 'Yes, with the rook on the sixth rank and careful waiting moves it is a draw.'),
          choice('Black to move. Which move loses by force?', [{ text: 'Ra1', san: 'Ra1', why: 'It leaves the sixth rank and White wins.' }, { text: 'Rg6', san: 'Rg6', ok: true, why: 'It keeps the sixth rank covered.' }], 'Keep the rank covered.', undefined, { engineFen: PHIL }),
          playout({ id: 'philidor', title: 'Philidor defence', blurb: 'Rook + pawn vs rook: hold the draw.', fen: '4k3/8/r7/3PK3/8/8/8/7R b - - 0 1', user: 'b', goal: 'draw', success: 'survive', maxMoves: 30, tip: 'Keep your rook on the 6th rank until the pawn advances, then go behind and check from the rear.' }, 'Hold the draw against Stockfish.'),
        ),
      ],
    }),
  ],
};
