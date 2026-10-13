import { B, choice, lesson, mv, o, ph, pos, shot, think, tf, txt } from '../build.ts';
import type { Unit } from '../types.ts';
import { gameFen } from './games.ts';

const PAWN_FORK = 'rnbqk2r/ppp2ppp/3bpn2/3p4/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 0 1'; // e5
const Q_FORK = '3rk3/p4ppp/8/8/1b6/3Q4/P4PPK/8 w - - 0 1'; // Qb5+
const DISC_N = '4k3/ppp2ppp/3q4/8/8/4N3/PPP2PPP/4R1K1 w - - 0 1'; // Nf5+ (or Nc4+)
const DISC_B = '3q2k1/5ppp/8/3B4/8/8/PPP2PPP/3R2K1 w - - 0 1'; // Bxf7+
const BR_DEFLECT = '2r3k1/5ppp/8/3Q4/8/8/5PPP/3R2K1 w - - 0 1'; // Qd8+
const BR_TRADE = '3r1rk1/5ppp/8/8/8/8/3Q1PPP/3R2K1 w - - 0 1'; // Qxd8
const PETROV = pos('e4 e5 Nf3 Nf6 Nxe5 Nxe4 Qe2 Nf6');
const FRIED = pos('e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5 Nxd5');

export const tacticsBishop: Unit = {
  id: 'b-tactics',
  title: 'Tactical motifs in depth',
  blurb: 'Pawn and queen forks, discovered attacks, double attacks, removing defenders, deflection and overloading.',
  track: 'tactics',
  cat: 'tactics',
  stage: 2,
  lessons: [
    lesson({
      id: 'tac-fork-q',
      title: 'Pawn forks and queen forks',
      blurb: 'The cheapest piece and the strongest piece can both fork.',
      mins: 9,
      tags: ['fork', 'missed_win'],
      intro: 'A pawn that forks two pieces is a joy, because pawns are cheap and everything it attacks is worth more. The queen forks too, and a queen check with a second target is a classic way to win a piece.',
      rule: 'A forking piece must be safe: check what can take it.',
      habit: 'Before you fork, ask whether the forking piece can be captured. A fork that loses the forker is just a trade.',
      recap: 'A pawn fork attacks two pieces with one pawn, and it wins a piece unless one of them can capture the pawn. | A queen fork usually comes with check, so the king cannot save the other piece. | Always check the forking piece is protected or cannot be taken.',
      steps: [
        ...ph(
          'example',
          txt(
            'The pawn fork',
            'On e5 the white pawn attacks both the bishop on d6 and the knight on f6. Black cannot save both, and the pawn is protected by the knight on f3, so if the bishop takes it White recaptures and is a piece up.\n\nA pawn is worth 1 and attacks pieces worth 3, so even a pawn that gets captured often pays for itself.',
            B(PAWN_FORK, 'g:e4e5 r:e5d6 r:e5f6', 'y:e5'),
          ),
          txt(
            'The queen fork with check',
            'Qb5+ gives check and attacks the bishop on b4 at the same time. Black has to answer the check, so the bishop falls. Queen forks usually combine a check with a second target.',
            B(Q_FORK, 'g:d3b5 r:b5e8 r:b5b4', 'y:b5'),
          ),
        ),
        ...ph(
          'guided',
          mv(PAWN_FORK, 'e5', 'The pawn attacks the bishop and the knight and is protected by the knight on f3. If Black takes it, White recaptures and has won a bishop for a pawn.', {
            prompt: 'White to move. A cheap piece can win an expensive one.',
            hint: 'Which pawn move attacks two pieces at the same time?',
            tactic: true,
            rule: 'A forking piece must be safe: check what can take it.',
          }),
        ),
        ...ph(
          'practice',
          shot(Q_FORK, 'Qb5+', 'Check and an attack on the bishop on b4. Black blocks with the rook, and White takes the bishop with the queen.', { prompt: 'White to move. Look for a check that also attacks something.', hint: 'Your queen can reach b5. What would it attack from there?' }),
          tf('Queen forks are strongest when one of the targets is the king.', true, 'Yes. A check forces the king to move, so nothing can save the other target.', B(Q_FORK, 'g:d3b5 r:b5e8')),
          tf('A forking piece does not need to be protected.', false, 'If it can be captured safely, the fork collapses. Make sure the forking piece is protected or cannot be taken.'),
          choice('Why is a pawn fork so strong?', [o('Every piece it attacks is worth more than a pawn', true, 'Even if the pawn is captured, you usually come out ahead.'), o('Pawns move two squares', 'That is not the reason. It is the value of the targets.'), o('Pawns cannot be captured', 'They can be, but you usually win more than you lose.')], 'Think about what the pawn is worth compared with what it attacks.', undefined, { reasoning: true }),
        ),
      ],
    }),

    lesson({
      id: 'tac-disc',
      title: 'Discovered attacks and checks',
      blurb: 'Move one piece and let another one do the attacking.',
      mins: 9,
      tags: ['missed_win', 'fork'],
      intro: 'A discovered attack is two threats for the price of one: one piece moves away, and the piece behind it attacks something. When the uncovered piece gives check, the piece that moved can do almost anything.',
      rule: 'Move the piece in front with a threat, and the piece behind does the rest.',
      habit: 'Look at your pieces that are lined up behind another of your own pieces. Can the front one move with tempo?',
      recap: 'A discovered attack: moving a piece uncovers an attack by another piece. | A discovered check lets the moving piece capture or attack freely because the opponent must answer the check. | A double check cannot be blocked or captured: the king must move.',
      steps: [
        ...ph(
          'example',
          txt(
            'Open the line',
            'The rook on e1 looks at the king on e8, with only the knight on e3 in between. If the knight moves, the king is in check, and the knight can land on a square that attacks another piece.\n\nHere Nf5+ gives a discovered check **and** attacks the queen on d6. Black must deal with the check, and the queen is lost.',
            B(DISC_N, 'g:e3f5 r:e1e8 r:f5d6', 'y:e3'),
          ),
        ),
        ...ph(
          'guided',
          mv(DISC_N, 'Nf5+', 'The knight moves with a discovered check from the rook, and lands on a square that attacks the queen. Black has to answer the check, so White wins the queen.', {
            prompt: 'White to move. The rook on e1 is hiding behind a knight.',
            hint: 'If the knight moves, what does the rook attack? And where could the knight go to attack the queen?',
            tactic: true,
            rule: 'Move the piece in front with a threat, and the piece behind does the rest.',
          }),
        ),
        ...ph(
          'practice',
          shot(DISC_B, 'Bxf7+', 'The bishop on d5 stands between the rook on d1 and the queen on d8. Bxf7+ is a capture with check, so Black cannot save the queen: Kxf7 Rxd8 wins her.', { prompt: 'White to move. The queen on d8 is lined up behind the bishop.', hint: 'Which bishop move gives check and uncovers an attack?' }),
          shot(gameFen('reti', 19), 'Bg5+', 'A double check from the bishop and the rook at once: the king can only move, and Bd8 is mate next. Réti against Tartakower.', { prompt: 'White to move. The d-file is open. Which bishop move gives a double check?', hint: 'The bishop gives check, and so does the rook once the king sits on d8.' }),
          tf('A double check can be answered by capturing the checking piece.', false, 'In a double check there are two checking pieces, so you cannot capture or block both. The king must move.'),
          choice('Why is a discovered check so powerful?', [o('The opponent must answer the check, so the moving piece can do whatever it likes', true, 'It gets a free move, to capture or attack something.'), o('It always wins the queen', 'Not always, but it often wins something big.'), o('It cannot be blocked', 'It can sometimes be blocked. The power is the free move.')], 'What does the opponent have to do after a check?', undefined, { reasoning: true }),
        ),
      ],
    }),

    lesson({
      id: 'tac-double',
      title: 'Double attacks',
      blurb: 'Two threats at once: the opponent can only meet one.',
      mins: 9,
      tags: ['fork', 'missed_win'],
      intro: 'A double attack is any move that creates two threats at once. A fork is the most common kind, but the idea is wider: attack a piece and threaten mate, or check and attack. You only need your opponent to be unable to answer both.',
      rule: 'Look for a move that makes two threats the opponent cannot both meet.',
      habit: 'After each candidate move, ask "what does this attack, and what does it threaten?" If the answer is two things, look closer.',
      recap: 'A double attack makes two threats at once. | Forks, discovered attacks and check-plus-capture are all double attacks. | A threat of mate counts as one of the two threats.',
      steps: [
        ...ph(
          'example',
          txt(
            'Two threats, one move',
            'After Qb3 White attacks the pawn on b7 **and** keeps an eye on f7, where the queen and bishop together threaten Qxf7#. Black has to answer both, and only one answer is likely to work.\n\nThat is a double attack with a mate threat: very hard to defend.',
            B(gameFen('opera', 13), 'g:d1b3 g:b3b7 r:c4f7', 'y:b7 y:f7'),
          ),
        ),
        ...ph(
          'guided',
          shot(PETROV, 'Nc6+', 'A discovered check from the queen, and the knight also attacks the queen on d8. That is a double attack: check plus an attack on the queen.', { prompt: 'White to move. One move, two targets.', hint: 'The queen on e2 and the king share the e-file. What if the knight moves with a threat?' }),
        ),
        ...ph(
          'practice',
          shot(Q_FORK, 'Qb5+', 'A check and an attack on the bishop at once. The king must answer the check, so the bishop falls.', { prompt: 'White to move. Check and attack.', hint: 'Find the queen move that gives check and attacks something else.' }),
          mv(gameFen('opera', 13), 'Qb3', 'The queen attacks b7 and combines with the bishop against f7. Black cannot easily meet both threats, and Morphy keeps the initiative.', { prompt: 'White to move. Morphy, Opera Game. Attack b7 and f7.', hint: 'Which square lets the queen attack the b7 pawn and still eye f7?' }),
          mv(FRIED, 'Nxf7', 'The knight takes f7 and attacks the queen on d8 and the rook on h8: a double attack. Black takes the knight with the king, but White gets a strong attack for the piece.', { prompt: 'White to move. A famous trap: the Fried Liver Attack.', hint: 'The knight on g5 can capture on f7. What would it attack from there?' }),
          choice('Which of these is a double attack?', [o('A check that also attacks an undefended piece', true, 'The opponent must answer the check, so the other piece is lost.'), o('A quiet pawn move on the edge', 'It makes no threats at all.'), o('Moving a piece to an undefended square', 'Without a threat it is not an attack.')], 'How many things does the move threaten?', undefined, { reasoning: true }),
        ),
      ],
    }),

    lesson({
      id: 'tac-remove',
      title: 'Removing the defender',
      blurb: 'Take the piece that protects the target, then take the target.',
      mins: 9,
      tags: ['missed_win'],
      intro: 'Sometimes a piece looks safe because something guards it. But the guard can be captured. Remove the defender, and the thing it was protecting falls. Often the capture comes with a threat so the opponent has no time to recapture.',
      rule: 'If something is protected, capture the protector.',
      habit: 'When a target looks defended, count the defenders and ask: can I take one of them with check or a bigger threat?',
      recap: 'To win a protected piece, capture or drive away its defender. | The best removal comes with a check or a bigger threat, so the opponent cannot recapture. | Count the defenders before you decide which one to take.',
      steps: [
        ...ph(
          'example',
          txt(
            'The defender that was pinned',
            'In the Opera Game Black\'s knight on d7 was pinned and defended by the rook on d8. Morphy took it with his rook: **Rxd7**. After the rook recaptures, the d-file is White\'s and another rook arrives with a pin. The defender was removed, and the pressure stayed on.',
            B(gameFen('opera', 25), 'g:d1d7 r:d8d7', 'y:d7'),
          ),
        ),
        ...ph(
          'guided',
          shot(gameFen('opera', 25), 'Rxd7', 'The rook takes the pinned knight. If Black recaptures with the rook, White plays Rd1 and keeps all the pressure. White gives a rook for a knight on purpose, because the pins are worth more.', { prompt: 'White to move. The knight on d7 is pinned. How do you keep up the attack?', hint: 'What is the pinned knight protected by, and what happens if you take it?' }),
        ),
        ...ph(
          'practice',
          shot(gameFen('lasker', 23), 'Nxf6+', 'The knight takes the bishop with check and forks the king and ... the point is the discovered threat: Black\'s king is dragged out and White mates. The bishop on f6 was a key defender.', { prompt: 'White to move. Lasker against Thomas: Black\'s king has just taken the queen.', hint: 'Which black piece defends the king and can be captured with check?' }),
          shot(gameFen('immortal', 41), 'Nxg7+', 'The knight takes the pawn on g7 with check, removing the defender of the king side. The king has to move and a mate follows.', { prompt: 'White to move. The Immortal Game: Black has just taken the second rook.', hint: 'Which pawn protects the king, and can be taken with check?' }),
          tf('To win a protected piece you should attack it with something cheaper than the defender.', false, 'That is a different idea. Removing the defender means capturing the piece that protects it, so the target is left undefended.'),
          choice('A target is protected once. What is one way to win it?', [o('Capture the protecting piece first', true, 'Then the target has no defender.'), o('Attack it with a pawn', 'That is also possible, but it is a different idea.'), o('Ignore it', 'You would win nothing.')], 'How does removing the defender help?'),
        ),
      ],
    }),

    lesson({
      id: 'tac-deflect',
      title: 'Deflection and decoys',
      blurb: 'Drag a defender away from its post, or lure the king onto a bad square.',
      mins: 10,
      tags: ['missed_win', 'missed_mate'],
      intro: 'A deflection pulls a defender away from the square it guards. A decoy lures a piece (often the king) to a square where it can be attacked. Both usually need a sacrifice, and both are some of the most beautiful ideas in chess.',
      rule: 'Offer something the defender cannot refuse, and the square it guarded is empty.',
      habit: 'When a defender is guarding something important, look at what would happen if it were forced to capture something else.',
      recap: 'A deflection forces a defender away from the square or piece it guards. | A decoy lures a piece onto a square where it can be attacked. | The sacrifice is only worth it if the follow-up wins more than it costs.',
      steps: [
        ...ph(
          'example',
          txt(
            'The only guard',
            'Black\'s rook on c8 is the only guard of the back rank. **Qd8+!** forces it to capture the queen (the king cannot, it would walk into the rook), and then **Rxd8#** is checkmate. The queen deflected the rook from guarding the back rank.',
            B(BR_DEFLECT, 'g:d5d8 r:c8d8 g:d1d8', 'r:g8'),
          ),
          txt(
            'Lure the king',
            'In the Réti game White played **Qd8+!!** and Black\'s king had to capture. That dragged the king onto the d-file, where a double check from the bishop and the rook finished the game. The queen was a decoy: it lured the king to the square where it could be checked twice.',
            B(gameFen('reti', 17), 'g:d3d8', 'r:e8'),
          ),
        ),
        ...ph(
          'guided',
          shot(BR_DEFLECT, 'Qd8+', 'The rook has to capture, and then Rxd8 is mate. The queen only needed to pull the guard away.', { prompt: 'White to move. One piece guards the back rank.', hint: 'What if you offered that piece a queen on the back rank, with check?' }),
        ),
        ...ph(
          'practice',
          shot(BR_TRADE, 'Qxd8', 'Take the queen. Black must recapture with the rook, and then Rxd8 is mate. The rook that recaptured was deflected from the f8 square.', { prompt: 'White to move. The black queen is guarded by a rook.', hint: 'What happens to the back rank if the rook recaptures on d8?' }),
          shot(gameFen('opera', 31), 'Qb8+', 'The queen sacrifice forces the knight to take, and it is dragged off the d7 square. Then Rd8 is checkmate. Morphy\'s finish.', { prompt: 'White to move. The Opera Game: mate in two.', hint: 'Which black piece stops the rook from reaching d8? Can you drag it away?' }),
          shot(gameFen('reti', 17), 'Qd8+', 'The king must capture and ends on d8, where a double check from the bishop and rook follows. Réti\'s famous queen sacrifice.', { prompt: 'White to move. Réti against Tartakower: mate in three.', hint: 'Which square would you like the king to stand on?' }),
          tf('A deflection always needs to win material immediately.', false, 'Often it wins the game instead (by mate), and the sacrifice is bigger than what it wins on the spot.'),
        ),
      ],
    }),

    lesson({
      id: 'tac-overload',
      title: 'Overloaded pieces',
      blurb: 'One piece with two jobs can only do one of them.',
      mins: 10,
      tags: ['missed_win'],
      intro: 'A piece that has to guard two things at once is overloaded. Attack one of them, and the other falls. It is the same idea as removing the defender, but you look for the defender that is already busy.',
      rule: 'Find the piece with two jobs and make it choose.',
      habit: 'List what each of their defenders is guarding. If one piece appears twice, attack one of its jobs.',
      recap: 'An overloaded piece guards two things at once and cannot keep both. | Capture or attack one of its targets with a threat, and the other falls. | Your own pieces can be overloaded too: check before you rely on one defender.',
      steps: [
        ...ph(
          'example',
          txt(
            'One knight, two jobs',
            'Black\'s knight on c6 does two jobs: it blocks the queen\'s diagonal toward d7, and it has to recapture on e7. Evergreen Game: White plays **Rxe7+**. The knight must take, and in doing so it leaves c6, so the queen can capture on d7 with check.',
            B(gameFen('evergreen', 39), 'g:e1e7 r:c6e7 y:a4d7', 'y:c6'),
          ),
        ),
        ...ph(
          'guided',
          mv(gameFen('evergreen', 39), 'Rxe7+', 'The knight on c6 must recapture on e7, and that unblocks the diagonal for the queen on a4. It cannot do both jobs.', { prompt: 'White to move. Anderssen, the Evergreen Game. Which black piece is overloaded?', hint: 'The knight on c6 is blocking something and also guarding something. What if it is forced to capture?' }),
        ),
        ...ph(
          'practice',
          mv(gameFen('evergreen', 41), 'Qxd7+', 'With the knight gone from c6, the queen can take on d7 with check. The king has to take and walks into Bf5+ and a mating net. A queen sacrifice that wins the game.', { prompt: 'White to move. The knight is gone from c6, so a new line is open.', hint: 'Which piece can you take with check on d7?' }),
          shot(gameFen('immortal', 43), 'Qf6+', 'The knight on g8 is the only guard of e7, and it also has to take the queen. Black\'s knight cannot do both: Nxf6 allows Be7 mate. The Immortal Game.', { prompt: 'White to move. The Immortal Game: mate in two.', hint: 'Which black piece guards the e7 square?' }),
          tf('If a defender guards two squares, you win by attacking both at once.', false, 'It is enough to attack one of them with a threat: the defender can only protect one, so the other falls.'),
          choice('How do you spot an overloaded defender?', [o('List what each defender guards and look for a piece that appears twice', true, 'One piece with two jobs can only do one.'), o('Look for the biggest piece', 'The biggest piece is not always the overloaded one.'), o('Count the pawns', 'Pawns do not tell you this.')], 'What does overloaded mean?', undefined, { reasoning: true }),
        ),
      ],
    }),
  ],
};
