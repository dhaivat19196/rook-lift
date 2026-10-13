import { B, choice, lesson, mv, o, ph, pos, shot, tf, txt } from '../build.ts';
import type { Unit } from '../types.ts';

const LEGAL0 = pos('e4 e5 Nf3 d6 Bc4 Bg4 Nc3');
const LEGAL1 = pos('e4 e5 Nf3 d6 Bc4 Bg4 Nc3 g6');
const LEGAL2 = pos('e4 e5 Nf3 d6 Bc4 Bg4 Nc3 g6 Nxe5');
const LEGAL3 = pos('e4 e5 Nf3 d6 Bc4 Bg4 Nc3 g6 Nxe5 Bxd1');
const BS0 = pos('e4 e5 Nf3 Nc6 Bc4 Nd4');
const BS1 = pos('e4 e5 Nf3 Nc6 Bc4 Nd4 Nxe5');
const EN1 = pos('d4 e5 dxe5 Nc6 Nf3 Qe7 Bf4 Qb4+');
const EN2 = pos('d4 e5 dxe5 Nc6 Nf3 Qe7 Bf4 Qb4+ Bd2 Qxb2');
const EN3 = pos('d4 e5 dxe5 Nc6 Nf3 Qe7 Bf4 Qb4+ Bd2 Qxb2 Bc3');
const FP1 = pos('e4 e5 Nf3 Nc6 Bb5 Nf6 O-O Ng4');
const FP2 = pos('e4 e5 Nf3 Nc6 Bb5 Nf6 O-O Ng4 h3 h5');
const FP3 = pos('e4 e5 Nf3 Nc6 Bb5 Nf6 O-O Ng4 h3 h5 hxg4 hxg4 Ne1');
const EL1 = pos('d4 d5 c4 e6 Nc3 Nf6 Bg5 Nbd7 cxd5 exd5');
const EL2 = pos('d4 d5 c4 e6 Nc3 Nf6 Bg5 Nbd7 cxd5 exd5 Nxd5');

export const traps: Unit = {
  id: 'k-traps',
  title: 'Opening traps',
  blurb: 'Five famous traps: how to spot them, how to avoid them, and how to set them.',
  track: 'openings',
  cat: 'opening',
  stage: 1,
  lessons: [
    lesson({
      id: 'trap-legal',
      title: 'Légal\'s trap',
      blurb: 'The queen that is not really free.',
      mins: 9,
      tags: ['hung_piece', 'allowed_mate'],
      intro: 'Légal\'s trap is over 250 years old and still catches players. Black pins a knight to the queen and sees a free queen. It is not free.',
      rule: 'Before you capture a free queen, check what the capture opens up.',
      habit: 'When a piece is offered for free, spend ten seconds on their checks and captures before you take.',
      recap: 'After Nxe5, taking the queen with Bxd1 loses to Bxf7+ and Nd5 mate. | Decline with ...dxe5, then White wins the pawn back with Qxg4 and the game is balanced. | Do not play ...g6 here: ...Nc6 or ...Nf6 develops with no trap.',
      steps: [
        ...ph(
          'example',
          txt(
            'The set-up',
            'White plays e4, Nf3, Bc4 and Nc3 and Black answers with ...d6, ...Bg4 and ...g6. The bishop pins the knight on f3 to the queen on d1. White now plays **Nxe5!**, and the bishop can take the queen: but that is the trap.',
            B(LEGAL2, 'r:g4d1 g:c4f7 g:c3d5', 'y:e5'),
          ),
        ),
        ...ph(
          'guided',
          mv(LEGAL0, ['Nc6', 'Nf6'], 'A developing move that does not walk into the trap. After 4...g6? White plays Nxe5! and Black is in trouble.', { prompt: 'Black to move. White has developed the bishop and the knight. How do you avoid the trap?', hint: 'Develop a piece that does not weaken anything.', wrong: { g6: 'It allows Nxe5!, and taking the queen loses by force.' } }),
        ),
        ...ph(
          'practice',
          mv(LEGAL1, 'Nxe5', 'White gives up the queen on purpose. If Black takes it with the bishop, a mate follows.', { prompt: 'White to move. Black has played ...g6. Spring the trap.', hint: 'The pinned knight can still move if it captures something. Which pawn is loose?' }),
          mv(LEGAL2, 'dxe5', 'Black takes the knight and accepts losing a pawn after Qxg4. It is the safe reply: taking the queen would lose.', { prompt: 'Black to move. White has just played Nxe5. What now?', hint: 'The queen is offered. What would White do if you took it?', wrong: { Bxd1: 'Bxf7+ Ke7 and Nd5 is checkmate. A queen is not worth that.' } }),
          shot(LEGAL3, 'Bxf7+', 'The check forces the king to e7. After Ke7 the knight lands on d5 with checkmate.', { prompt: 'White to move. Black took the queen. Finish it.', hint: 'Which pawn is defended only by the king?' }),
          choice('Black to move after 4.Nc3. Which move avoids the trap?', [{ text: 'Nc6', san: 'Nc6', ok: true, why: 'This is the move that keeps everything under control.' }, { text: 'g6', san: 'g6', why: 'It allows Nxe5! and the queen sacrifice wins for White.' }], 'Look at what the other moves allow.', undefined, { engineFen: LEGAL0 }),
          tf('After Nxe5, Black should always take the queen when it is offered.', false, 'It loses by force. The queen is poisoned: Black must play ...dxe5.', B(LEGAL2, 'r:g4d1'), { claim: { fen: LEGAL2, san: 'Bxd1', ok: false } }),
          choice('Why does taking the queen lose?', [o('White gets three pieces to attack the king and mates quickly', true, 'The bishop and two knights are enough because Black\'s king is stuck in the middle.'), o('The bishop is pinned', 'It is not the pin. The danger is the king in the middle.'), o('It loses a pawn', 'It loses much more than a pawn.')], 'Where is Black\'s king?', undefined, { reasoning: true }),
        ),
      ],
    }),

    lesson({
      id: 'trap-bs',
      title: 'The Blackburne-Shilling trap',
      blurb: 'A greedy knight and a queen that goes hunting.',
      mins: 9,
      tags: ['hung_piece', 'allowed_mate'],
      intro: 'Here Black plays a strange-looking knight move and hopes White grabs the pawn. If White does, Black wins by force in six moves.',
      rule: 'Before you take a pawn, look at what the opponent just offered.',
      habit: 'When your opponent plays a strange move on move 3, assume it has a point and ask what it threatens.',
      recap: 'After ...Nd4?! take it: Nxd4 is simply better for White. | Nxe5? Qg5! attacks g2 and e5 and wins by force. | Greed on move 4 can lose the game: always ask what is offered.',
      steps: [
        ...ph(
          'example',
          txt(
            'The offer',
            'Black\'s knight jumps to d4 and leaves the e5 pawn apparently undefended. If White takes it with **Nxe5??**, Black plays **Qg5!** attacking the knight and the g2 pawn at once. The move after, White cannot defend everything.',
            B(BS1, 'g:d8g5 r:g5g2 r:g5e5', 'y:e5'),
          ),
        ),
        ...ph(
          'guided',
          mv(BS0, 'Nxd4', 'Take the knight. White is simply better and avoids the trap entirely.', { prompt: 'White to move. Black has played a strange knight move.', hint: 'The knight on d4 is attacked by the knight on f3. Can it be captured safely?', wrong: { Nxe5: 'Qg5! attacks g2 and e5 and Black wins by force.' } }),
        ),
        ...ph(
          'practice',
          mv(BS1, 'Qg5', 'Now the queen attacks the knight on e5 and the pawn on g2. White cannot meet both threats.', {
            loose: true,
            prompt: 'Black to move. White has taken the pawn on e5. Spring the trap.',
            cont: [
              { reply: 'Nxf7', ans: ['Qxg2'] },
              { reply: 'Rf1', ans: ['Qxe4+'] },
              { reply: 'Be2', ans: ['Nf3#'] },
            ],
            hint: 'Where can the queen attack two things at once?',
          }),
          mv(pos('e4 e5 Nf3 Nc6 Bc4 Nd4 Nxe5 Qg5 Nxf7'), 'Qxg2', 'The queen takes g2 and attacks the rook on h1 and the pawn on e4. White has no good defence.', { prompt: 'Black to move. White took f7. Keep attacking.' }),
          choice('White to move after 3...Nd4. What is best?', [{ text: 'Nxd4', san: 'Nxd4', ok: true, why: 'This is the move that keeps everything under control.' }, { text: 'Nxe5', san: 'Nxe5', why: 'It falls into ...Qg5! and Black wins by force.' }, { text: 'c3', san: 'c3', why: 'It chases the knight but allows Black to take on f3 and get counterplay, and it is clearly weaker than simply taking.' }], 'Look at what the other moves allow.', undefined, { engineFen: BS0 }),
          tf('After 3...Nd4, White should take the pawn on e5.', false, 'It loses to Qg5. Take the knight on d4 instead.', B(BS0, 'g:f3d4', 'r:e5'), { claim: { fen: BS0, san: 'Nxe5', ok: false } }),
          tf('The best answer to 3...Nd4 is 4.Nxd4.', true, 'Yes. White takes the knight, wins the bishop pair is not yet in play but he is simply a clear pawn better after exd4 and the structure.', B(BS0, 'g:f3d4'), { claim: { fen: BS0, san: 'Nxd4', ok: true } }),
          choice('What did Black\'s queen move 4...Qg5 do?', [o('It attacked two things at once and set up a mating attack', true, 'The knight on e5 and the pawn on g2 were both attacked, and the king was exposed.'), o('It protected the king', 'Not at all, it went on the attack.'), o('It traded queens', 'No trade happened.')], 'What squares did the queen hit?', undefined, { reasoning: true }),
        ),
      ],
    }),

    lesson({
      id: 'trap-englund',
      title: 'The Englund gambit trap',
      blurb: 'Do not be greedy with Bc3 when Black grabs your b2 pawn.',
      mins: 9,
      tags: ['hung_piece', 'allowed_mate'],
      intro: 'If you play 1.d4 as White (and you do) you will meet 1...e5 sooner or later. It is a sneaky gambit that tries to trick you. Let me show you the one move that avoids the trap.',
      rule: 'When the opponent takes a pawn that leaves your king short of defenders, look for tricks first.',
      habit: 'After 1.d4 e5, take the pawn (2.dxe5) and be happy: you are a pawn up and the trap has one specific moment.',
      recap: 'After ...Qxb2, play 6.Nc3: it develops and keeps everything covered. | 6.Bc3? Bb4! and Black wins by force. | You are a pawn up in this opening: stay calm and develop.',
      steps: [
        ...ph(
          'example',
          txt(
            'The trap',
            'After 1.d4 e5 2.dxe5 Nc6 3.Nf3 Qe7 4.Bf4 Qb4+ 5.Bd2 Qxb2 Black has won a pawn and is threatening a rook. If White plays **6.Bc3?** the bishop is attacked and pinned by ...Bb4. A few moves later the white king is mated. The cure is to play **6.Nc3** instead.',
            B(EN3, 'r:f8b4 r:b2a1', 'y:c3'),
          ),
        ),
        ...ph(
          'guided',
          mv(EN2, 'Nc3', 'The knight develops and defends, and White is a pawn up with nothing to worry about. After 6.Bc3? Bb4! wins.', { prompt: 'White to move. Black has taken on b2. Do not fall for the trap.', hint: 'A developing move, not a bishop move.', wrong: { Bc3: 'It runs into Bb4! and Black wins by force.' } }),
        ),
        ...ph(
          'practice',
          mv(EN1, 'Bd2', 'Block the check. This is the calm move and White is better.', { prompt: 'White to move. Black has checked on b4.', hint: 'Which piece blocks the check without losing anything?', wrong: { Nbd2: 'It loses a piece to the pin and the capture on d4.', c3: 'It loses the queen on b4 line of attack.' } }),
          mv(EN3, 'Bb4', 'The trap springs: the bishop attacks the queen and pins everything. White cannot defend.', { loose: true, prompt: 'Black to move. White has fallen for it with Bc3. Punish it.', cont: [{ reply: 'Qd2', ans: ['Bxc3'] }, { reply: 'Qxc3', ans: ['Qc1#'] }], hint: 'The bishop on c3 is attacked by your bishop. What does a check do on b4?' }),
          choice('White to move after ...Qxb2. What is best?', [{ text: 'Nc3', san: 'Nc3', ok: true, why: 'This is the move that keeps everything under control.' }, { text: 'Bc3', san: 'Bc3', why: 'It runs into ...Bb4! and Black wins by force.' }, { text: 'Qc1', san: 'Qc1', why: 'It loses the bishop and does nothing about the attack.' }], 'Look at what the other moves allow.', undefined, { engineFen: EN2 }),
          tf('After 5...Qxb2 the move 6.Bc3 is natural and safe.', false, 'It loses by force after ...Bb4. The safe move is 6.Nc3.', B(EN2, 'r:d2c3'), { claim: { fen: EN2, san: 'Bc3', ok: false } }),
          tf('After 5...Qxb2, White is simply a pawn up with a safe position if he plays 6.Nc3.', true, 'Yes. White has the extra pawn and Black has only a small initiative.', B(EN2, 'g:b1c3'), { claim: { fen: EN2, san: 'Nc3', ok: true } }),
          choice('Why is 6.Bc3? a mistake?', [o('Black pins the bishop and wins by force with ...Bb4', true, 'The bishop on c3 is attacked, and it cannot move without allowing mate.'), o('It loses a pawn', 'It loses far more than a pawn.'), o('It blocks the queen', 'The problem is the pin, not blocked pieces.')], 'What does ...Bb4 do?', undefined, { reasoning: true }),
        ),
      ],
    }),

    lesson({
      id: 'trap-fishing',
      title: 'The Fishing Pole trap',
      blurb: 'A knight sticks out, a pawn is offered, and the h-file opens.',
      mins: 9,
      tags: ['hung_piece', 'allowed_mate'],
      intro: 'In the Ruy Lopez, Black sometimes puts a knight on g4 and pushes the h-pawn. The knight is bait: if White takes it, Black attacks down the open h-file. You will not fall for it.',
      rule: 'When a piece is offered, count what the capture opens for the other side.',
      habit: 'If a capture opens a file toward your castled king, take your time and look for the opponent\'s rook or queen.',
      recap: 'After ...Ng4 and ...h5, do not take the knight: 6.hxg4? hxg4 and Black wins by force. | Play 6.Ba4 (or 6.d3) and White is better. | A capture that opens the file in front of your king is dangerous.',
      steps: [
        ...ph(
          'example',
          txt(
            'The bait',
            'After 4.O-O Ng4 5.h3 h5! the knight on g4 is attacked by the h3 pawn, but if White takes (**6.hxg4?**), Black replies ...hxg4, opening the h-file for the rook and the queen. If White then plays 7.Ne1?? the answer is ...Qh4 with mate in two. The correct reply to 5...h5 is 6.Ba4 or 6.d3.',
            B(FP2, 'g:h3g4 r:h8h1', 'y:g4'),
          ),
        ),
        ...ph(
          'guided',
          mv(FP1, 'h3', 'White asks the knight a question and gets the better game. White has other good moves, but this one is simple and strong.', { prompt: 'White to move. Black put a knight on g4. What do you do?', hint: 'The knight on g4 is far from the other pieces. Can a pawn push it away?' }),
        ),
        ...ph(
          'practice',
          mv(FP2, 'Ba4', 'White declines the offer. The bishop retreats and White is simply better, with an extra pawn tension to keep.', { prompt: 'White to move. Black played ...h5. Do not take the knight.', hint: 'The knight is bait. Which retreat keeps everything safe?', wrong: { hxg4: 'hxg4 and the h-file is open for Black\'s queen and rook. White is in big trouble.' } }),
          choice('White to move after 5...h5. What is best?', [{ text: 'Ba4', san: 'Ba4', ok: true, why: 'This is the move that keeps everything under control.' }, { text: 'hxg4', san: 'hxg4', why: 'It opens the h-file for Black and White gets mated or loses material.' }], 'Look at what the other moves allow.', undefined, { engineFen: FP2 }),
          tf('After 5...h5, taking the knight with 6.hxg4 is the best move.', false, 'It opens the h-file for Black and White gets mated or loses material. Decline with Ba4.', B(FP2, 'r:h3g4'), { claim: { fen: FP2, san: 'hxg4', ok: false } }),
          mv(FP3, 'Qh4', 'The queen attacks h2 and threatens Qh2 mate. White has no defence. This is where the greedy capture leads.', { prompt: 'Black to move. White took the knight and then retreated with Ne1. Finish it.', hint: 'The h-file is open and White\'s king is on g1. Which piece reaches h4?' }),
          choice('Why is the knight on g4 a bait?', [o('Capturing it opens the h-file toward White\'s king', true, 'After hxg4 hxg4 the black rook and queen aim at h1/h2.'), o('It is protected by a bishop', 'It is not protected by a bishop.'), o('It cannot be captured', 'It can, which is exactly the problem.')], 'What opens when the h-pawn takes?', undefined, { reasoning: true }),
          tf('Retreating with Ba4 keeps White\'s advantage.', true, 'Yes. White keeps a small but lasting edge and avoids the trap.', B(FP2, 'g:b5a4'), { claim: { fen: FP2, san: 'Ba4', ok: true } }),
        ),
      ],
    }),

    lesson({
      id: 'trap-elephant',
      title: 'The Elephant trap',
      blurb: 'A pawn on d5 that is poisoned in the Queen\'s Gambit Declined.',
      mins: 9,
      tags: ['hung_piece'],
      intro: 'In the Queen\'s Gambit Declined (which is part of your repertoire) there is a famous trap against White. It also shows you why a pin matters. As Black you can win a piece with it, and as White you will never fall for it.',
      rule: 'A pawn that looks free can be poisoned by a pin.',
      habit: 'Before you take a pawn that is next to a pinned piece, ask whether the pin breaks.',
      recap: 'After 5.cxd5 exd5, do not take on d5 with the knight: 6.Nxd5?? Nxd5! wins a piece. | The bishop on g5 gets trapped on d8 and the queen has to take. | Instead 6.e3 is simple and solid.',
      steps: [
        ...ph(
          'example',
          txt(
            'The trap',
            'After 1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5 Nbd7 5.cxd5 exd5, White plays **6.Nxd5??**. Black replies **...Nxd5!** and if White takes the queen with 7.Bxd8, then **...Bb4+** and the white queen must take the bishop, and the white king loses material. Black ends a piece up.',
            B(EL2, 'g:f6d5 r:g5d8', 'y:d5'),
          ),
        ),
        ...ph(
          'guided',
          mv(EL1, 'e3', 'A simple developing move that avoids the trap entirely and keeps the position healthy.', { prompt: 'White to move. Black has just recaptured on d5.', hint: 'Which pawn move opens the bishop and prepares to castle?', wrong: { Nxd5: 'It runs into ...Nxd5! and Black wins a piece.' } }),
        ),
        ...ph(
          'practice',
          mv(EL2, 'Nxd5', 'The knight on f6 takes, and White cannot take the queen without losing material.', {
            loose: true,
            prompt: 'Black to move. White took the pawn on d5. Punish it.',
            cont: [
              { reply: 'Bxd8', ans: ['Bb4+'] },
              { reply: 'Qd2', ans: ['Bxd2+'] },
              { reply: 'Kxd2', ans: ['Kxd8'] },
            ],
            hint: 'The white bishop on g5 is attacking the queen on d8. Is it safe to let it?',
          }),
          choice('White to move after ...exd5. What is best?', [{ text: 'e3', san: 'e3', ok: true, why: 'This is the move that keeps everything under control.' }, { text: 'Nxd5', san: 'Nxd5', why: 'It falls into the Elephant trap and loses a piece.' }], 'Look at what the other moves allow.', undefined, { engineFen: EL1 }),
          tf('After 5...exd5, White should take the pawn on d5 with the knight.', false, 'It loses a piece to the Elephant trap. 6.e3 is the safe move.', B(EL1, 'r:c3d5'), { claim: { fen: EL1, san: 'Nxd5', ok: false } }),
          tf('6.e3 is a good, safe move for White here.', true, 'It keeps everything protected and gets on with development.', B(EL1, 'g:e2e3'), { claim: { fen: EL1, san: 'e3', ok: true } }),
          choice('Why does 6.Nxd5 lose a piece?', [o('The knight on f6 recaptures and the bishop on g5 is stuck', true, 'The d8 square is where the bishop ends up, and Bb4+ forces the queen to take.'), o('The pawn on d5 is protected by two pieces', 'It is not the number of protectors.'), o('White runs out of moves', 'The point is the pin and the trapped bishop.')], 'What happens to the bishop on g5?', undefined, { reasoning: true }),
          choice('You are Black and White offers you the d5 pawn with the knight. What do you do?', [o('Take with the knight, then answer Bxd8 with ...Bb4+', true, 'You win a piece after Qd2 Bxd2+ Kxd2 Kxd8.'), o('Decline and move your king', 'You would miss the win.'), o('Take with the pawn', 'The knight is the right capture.')], 'Which of Black\'s pieces recaptures?'),
        ),
      ],
    }),
  ],
};
