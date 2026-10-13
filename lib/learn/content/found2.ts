import { START_FEN, B, choice, gen, lesson, line, mv, o, ph, playout, pos, shot, tf, txt } from '../build.ts';
import type { Unit } from '../types.ts';

export const mates: Unit = {
  id: 'f-mates',
  title: 'Basic checkmates',
  blurb: 'Finish the game: one-move mates, the back rank, and the two mates every player must know.',
  track: 'foundations',
  cat: 'mates',
  stage: 0,
  lessons: [
    lesson({
      id: 'fnd-mate1',
      title: 'Checkmate in one',
      blurb: 'Find the move that ends the game.',
      mins: 9,
      skill: 'mate1',
      tags: ['missed_mate'],
      intro: "Every game you've lost where you missed a mate is a game you could have won in a single move. Let's make finding one-move mates feel automatic.",
      rule: 'Check every check: one of them may be mate.',
      habit: 'When the enemy king looks short of squares, list every check you have before doing anything else.',
      recap: 'Checkmate is a check the king cannot escape, block or capture. | Count the king\'s escape squares: are they covered or blocked by its own pieces? | List every check, then ask whether the king can answer it.',
      steps: [
        ...ph(
          'example',
          txt(
            'Three ways out of check',
            'A king in check can **move away**, **capture** the checking piece or **block** the line. Checkmate means none of those works.\n\nLook at the black king here. Its own pawns box it in, so a rook check on the back rank leaves it nowhere to go.',
            B('6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1', 'g:e1e8', 'r:g8 y:f7 y:g7 y:h7'),
          ),
        ),
        ...ph(
          'guided',
          shot('6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1', 'Re8#', 'The rook checks along the back rank. The king cannot move to f8 or h8 (the rook covers them), and its own pawns block f7, g7 and h7. Nothing can block or capture.', { prompt: 'White to move. Count the king\'s escape squares first.', hint: 'Which squares can the black king step to? Which of them does your rook cover?', rule: 'Check every check: one of them may be mate.' }),
        ),
        ...ph('practice', gen('mate1', 14)),
      ],
    }),

    lesson({
      id: 'fnd-backrank',
      title: 'The back-rank mate',
      blurb: 'The most common checkmate of all, from both sides.',
      mins: 9,
      skill: 'mate1',
      tags: ['missed_mate', 'allowed_mate'],
      intro: 'If you only learn one mate pattern, learn this one. It ends more games than any other, and it ends them for people who forgot their own king had no room.',
      rule: 'Give your king a little room, and look for theirs not having any.',
      habit: 'Once your pieces are developed, look at your own back rank. If your king has no escape square, make one with h3 or h6.',
      recap: 'The back-rank mate happens when the king is boxed in by its own pawns. | A rook or queen check on the back rank is then mate. | Make a luft (a pawn move that gives the king a square) before it matters.',
      steps: [
        ...ph(
          'example',
          txt(
            'The king boxed in by its own pawns',
            'A king that has castled behind three unmoved pawns has **no escape squares**. One rook or queen check on the back rank is then checkmate.\n\nThat works against you just as well as for you. Check your own back rank every few moves.',
            B('6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1', 'g:d1d8', 'r:g8'),
          ),
          txt(
            'Make some room',
            'The fix is cheap: push a pawn one step (h3 or h6). That square, called **luft** (German for air), lets the king step off the back rank and the mate is gone.',
            B('6k1/5pp1/7p/8/8/8/5PPP/3R2K1 b - - 0 1', 'g:g8h7', 'y:h7'),
          ),
        ),
        ...ph(
          'guided',
          shot('6k1/5ppp/8/8/8/8/5PPP/3Q2K1 w - - 0 1', 'Qd8#', 'The queen checks on the back rank and the pawns on f7, g7 and h7 block every escape. The same pattern works with a queen or a rook.', { prompt: 'White to move. The black king is boxed in.', hint: 'Which square on the back rank can your queen reach with check?' }),
        ),
        ...ph(
          'practice',
          shot('3r2k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1', 'Rxd8#', 'Taking the rook with check is mate: the king is boxed in behind its pawns and nothing can recapture.', { prompt: 'White to move. Look at the back rank.', hint: 'Can you take something with check?' }),
          choice('Your king is castled behind f2, g2 and h2 and your opponent has a rook. Which move makes the back rank safer?', [o('h3', true, 'Now the king can step to h2 if a rook ever checks on the back rank.'), o('Qd2', 'Developing is fine, but it does not give the king a square.'), o('a3', 'A pawn move on the wing does nothing for the king.')], 'Which pawn move gives the king a square?'),
          tf('A king behind three unmoved pawns is always safe from a rook check.', false, 'It is the opposite: with no escape square, a single check on the back rank can be mate.'),
          tf('Making luft is a waste of a move.', false, 'One pawn move can save the game. It costs a tempo, and it is cheap compared with being mated.'),
          gen('mate1', 6),
        ),
      ],
    }),

    lesson({
      id: 'fnd-kq',
      title: 'Queen and king against king',
      blurb: 'The easiest win in chess, and the easiest stalemate to stumble into.',
      mins: 10,
      tags: ['conversion'],
      intro: "If you ever get a queen against a bare king, you must be able to finish it. It's easy, as long as you avoid the one trap: stalemate.",
      rule: 'Before every move, make sure the enemy king still has a legal move or is in check.',
      habit: 'In any won endgame with few pieces, ask "does my last move leave them with a legal move?" before you release it.',
      recap: 'Use the queen to shrink the box a ring at a time, a knight\'s move away from the king. | Bring your king up to help deliver mate. | Never leave the enemy king with no legal move unless it is in check: that is stalemate, a draw.',
      steps: [
        ...ph(
          'example',
          txt(
            'Shrink the box',
            'The queen cuts the king off from half the board. Then you keep a **knight\'s move** away so the queen cannot be taken and the king has fewer squares each turn. When the box is small, bring your king up and finish.',
            B('8/8/8/4k3/8/8/3Q4/4K3 w - - 0 1', 'g:d2d6', 'y:e5'),
          ),
          txt(
            'The one trap',
            'If the king has no legal move and is not in check, it is **stalemate** and the game is a draw. Here Qg6 would do it. Look at the black king on h8: every square is covered, but it is not attacked.',
            B('7k/8/5K2/8/8/8/8/6Q1 w - - 0 1', 'r:g1g6', 'r:g6'),
          ),
        ),
        ...ph(
          'guided',
          shot('7k/5Q2/6K1/8/8/8/8/8 w - - 0 1', 'Qg7#', 'The queen on g7 is protected by the king, so the king cannot take it, and there is nowhere to go. Queen and king together are the classic mating team.', { prompt: 'White to move. Mate in one.', hint: 'Which square is next to the king and protected by your own king?' }),
        ),
        ...ph(
          'practice',
          tf('In the position with White Kf6, Qg1 and Black Kh8, the move Qg6 is a good idea.', false, 'It is stalemate: the king has no legal move and is not in check, so the game is drawn. Qg7 is mate instead.', B('7k/8/5K2/8/8/8/8/6Q1 w - - 0 1', 'r:g1g6'), { claim: { fen: '7k/8/5K2/8/8/8/8/6Q1 w - - 0 1', san: 'Qg6', ok: false } }),
          gen('mate1', 8),
          playout({ id: 'kq', title: 'King + Queen vs King', blurb: 'Mate before move 30. Do not stalemate.', fen: '4k3/8/8/8/8/8/8/3QK3 w - - 0 1', user: 'w', goal: 'win', success: 'mate', maxMoves: 30, tip: 'Take away squares one ring at a time with the queen a knight-move away, then bring the king. Before every move: does it leave the enemy king a legal move?' }, 'Now play it out against Stockfish. You have plenty of moves.'),
        ),
      ],
    }),

    lesson({
      id: 'fnd-kr',
      title: 'Rook and king against king',
      blurb: 'The box method: a bit longer, just as certain.',
      mins: 10,
      tags: ['conversion'],
      intro: "Rook and king against king takes more moves than the queen, but it's just as sure. We'll learn the method, then you'll play it.",
      rule: 'Cut the king off with the rook, march your king up, and give mate on the edge.',
      habit: 'In a rook endgame a rank or file up, use your rook as a fence and bring your king close.',
      recap: 'The rook fences the king onto fewer ranks or files. | Your king walks up beside it to take the opposition. | Mate comes on the edge with a rook check.',
      steps: [
        ...ph(
          'example',
          txt(
            'The rook builds a fence',
            'A rook controls an entire line. Placed on a file next to the enemy king, it cuts the king off from half the board. Then your own king walks over, and the rook delivers checks that push the enemy king back to the edge.',
            B('8/8/8/4k3/8/8/8/R3K3 w - - 0 1', 'g:a1a5', 'y:a5'),
          ),
        ),
        ...ph(
          'guided',
          shot('k7/8/1K6/8/8/8/8/7R w - - 0 1', 'Rh8#', 'The black king is on the edge, your king covers a7 and b7, and the rook checks along the back rank. That is the final picture of every rook mate.', { prompt: 'White to move. Mate in one.', hint: 'Which squares does your king cover? Which line could the rook check along?' }),
        ),
        ...ph(
          'practice',
          gen('mate1', 8),
          tf('A lone rook and king can force checkmate against a lone king.', true, 'Yes, with the rook as a fence and your king helping. It just takes more moves than the queen.'),
          playout({ id: 'kr', title: 'King + Rook vs King', blurb: 'Cut the king off, shrink the box, mate.', fen: '8/8/8/4k3/8/8/8/R3K3 w - - 0 1', user: 'w', goal: 'win', success: 'mate', maxMoves: 45, tip: 'Rook cuts the king along a file or rank. Walk your king up to the opposition, then give a rook check to push it back.' }, 'Play it out. The goal is checkmate within 45 moves.'),
        ),
      ],
    }),
  ],
};

// =====================================================================================================
// Opening basics
// =====================================================================================================
const FRIED = ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'Ng5', 'd5', 'exd5', 'Na5', 'Bb5+', 'c6', 'dxc6', 'bxc6'];

export const openBasics: Unit = {
  id: 'f-open',
  title: 'Opening basics',
  blurb: 'A simple plan for the first ten moves, and the traps that catch players at your level.',
  track: 'foundations',
  cat: 'opening',
  stage: 0,
  lessons: [
    lesson({
      id: 'fnd-open',
      title: 'The first ten moves',
      blurb: 'Centre, develop, castle: nothing fancy needed.',
      mins: 9,
      tags: ['hung_piece'],
      intro: "You don't need to memorise anything yet. A handful of simple ideas will give you a healthy position in almost every game. Let me show you five.",
      rule: 'Take the centre, develop your pieces, castle, and keep the queen at home.',
      habit: 'At move 8 in your next game, ask: have I developed my knights and bishops and castled? If not, do that before anything else.',
      recap: 'Take or contest the centre with a pawn (e4 or d4). | Develop knights and bishops quickly, and castle early. | Do not move the same piece twice or bring the queen out early without a reason.',
      steps: [
        ...ph(
          'example',
          txt(
            'Five simple ideas',
            '**1.** Put a pawn in the centre (e4 or d4).\n**2.** Develop your knights, then your bishops.\n**3.** Castle early so your king is safe and your rook joins in.\n**4.** Do not move the same piece twice in the opening without a reason.\n**5.** Keep the queen at home until your other pieces are out.',
            B(pos('e4 e5 Nf3 Nc6 Bc4 Bc5'), 'g:g1f3 g:f1c4'),
          ),
          txt(
            'What it looks like',
            'This is a typical healthy position after five moves each. Both sides have a pawn in the centre, knights and a bishop out, and castling comes next. Nothing is hanging.',
            B(pos('e4 e5 Nf3 Nc6 Bc4 Bc5'), 'g:e1g1'),
          ),
        ),
        ...ph(
          'guided',
          mv(pos('e4 e5'), 'Nf3', 'It develops a knight toward the centre and attacks the pawn on e5, which makes Black respond. Development with a purpose.', { prompt: 'White to move. Develop a piece toward the centre.', hint: 'Which knight move attacks the pawn on e5?' }),
        ),
        ...ph(
          'practice',
          mv(pos('e4 e5 Nf3 Nc6 Bc4 Bc5'), ['O-O', 'c3'], 'Castling gets your king out of the centre and your rook toward the action. Early castling is almost always a good idea.', { prompt: 'White to move. Which idea from the list is next?', hint: 'You have developed two pieces. What does the list say after developing?' }),
          mv(pos('d4 d5'), ['c4', 'Nf3', 'Bf4'], 'All three of these are normal developing or centre moves. The point is to build, not to rush.', { prompt: 'White to move. Any sensible developing move.', hint: 'You want a piece out or a pawn in the centre.' }),
          tf('After 1.e4 e5, playing 2.Na3 is a good development move.', false, 'A knight on the edge reaches only 4 squares and points away from the centre. 2.Nf3 does more.', B(pos('e4 e5'), 'r:b1a3 g:g1f3'), { claim: { fen: pos('e4 e5'), san: 'Na3', ok: false } }),
          tf('After 1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6, pushing a wing pawn with 4.h4 is a good use of time.', false, 'It does nothing for development or the centre, and it weakens your king side. Castle or develop first.', B(pos('e4 e5 Nf3 Nc6 Bc4 Nf6'), 'r:h2h4'), { claim: { fen: pos('e4 e5 Nf3 Nc6 Bc4 Nf6'), san: 'h4', ok: false } }),
          tf('After 1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5, moving the king with 4.Ke2 is a good way to avoid castling.', false, 'Your king stays in the middle, blocking your rook. Castling does the job and is far safer.', B(pos('e4 e5 Nf3 Nc6 Bc4 Bc5'), 'r:e1e2 g:e1g1'), { claim: { fen: pos('e4 e5 Nf3 Nc6 Bc4 Bc5'), san: 'Ke2', ok: false } }),
          tf('Opening with 1.f3 helps you control the centre.', false, 'It takes a square away from your own knight and weakens your king. A pawn on e4 or d4 does the centre job.', B(pos('f3'), 'r:f2f3'), { claim: { fen: START_FEN, san: 'f3', ok: false } }),
          choice('Why do we castle early?', [o('It tucks the king away and brings a rook toward the centre', true, 'Both at once: that is why castling is worth a whole tempo.'), o('It wins material', 'Castling does not win anything, it just makes you safer.'), o('Because the rules say so', 'You are never forced to castle. We do it because it works.')], 'Think about what the king and the rook each gain.', undefined, { reasoning: true }),
          choice('Why develop knights and bishops before moving the queen?', [o('The queen would just be chased by cheaper pieces', true, 'Every move your opponent spends chasing the queen is a move they develop with tempo.'), o('Queens are not allowed to move early', 'She can move, it is just usually not helpful.'), o('Knights are more valuable', 'The queen is worth more. That is exactly why you should not expose her.')], 'What happens to a queen that comes out early?', undefined, { reasoning: true }),
        ),
      ],
    }),

    lesson({
      id: 'fnd-scholar',
      title: 'Scholar\'s mate: defend it',
      blurb: 'The four-move trap, and how to beat it for good.',
      mins: 8,
      tags: ['allowed_mate'],
      intro: 'You will meet this trap many times at your level: queen and bishop gang up on f7. Once you know the defence, it becomes a gift.',
      rule: 'Their threat comes before your plan.',
      habit: 'When your opponent develops the queen and bishop toward f7, count the attackers and defenders on that square right away.',
      recap: 'The trap aims queen and bishop at f7, protected only by the king. | Defend with ...g6 (kicking the queen) or ...Qe7. | Never answer it with ...Nf6 when the queen is on h5: Qxf7 is mate.',
      steps: [
        ...ph(
          'example',
          txt(
            'The idea',
            'White plays e4, brings the bishop to c4 and the queen to h5. Now both aim at **f7**, which only the king defends. If Black does not react, Qxf7 is checkmate on move 4.',
            B(pos('e4 e5 Bc4 Nc6 Qh5'), 'r:h5f7 r:c4f7', 'y:f7'),
          ),
          txt(
            'The defence',
            'You have two good answers: **...g6**, which attacks the queen and forces it away, or **...Qe7**, which adds a defender. After ...g6 the queen has to retreat and Black simply develops with ...Nf6.',
            B(pos('e4 e5 Bc4 Nc6 Qh5'), 'g:g7g6 g:d8e7'),
          ),
        ),
        ...ph(
          'guided',
          mv(pos('e4 e5 Bc4 Nc6 Qh5'), 'g6', 'f7 was attacked twice and defended once. Both moves fix it: g6 kicks the queen away and Qe7 adds a defender.', { prompt: 'Black to move. The queen and bishop are both aiming at f7.', hint: 'You need one more defender on f7, or a way to chase the queen.', wrong: { Nf6: 'After Nf6 the queen takes on f7: Qxf7#. Attacking the queen does not help when the queen can give mate.' } }),
        ),
        ...ph(
          'practice',
          mv(pos('e4 e5 Qh5'), 'Nc6', 'The queen is out early. Develop with a move that also protects e5, and the queen will have to run later.', { prompt: 'Black to move. White\'s queen came out on move 2.', hint: 'Which developing move also protects the pawn on e5?' }),
          mv(pos('e4 e5 Qh5 Nc6 Bc4'), 'g6', 'The same trap in a different order. Kick the queen or defend f7.', { prompt: 'Black to move. Same square again.', hint: 'Count the attackers on f7.', wrong: { Nf6: 'It looks natural, but Qxf7# is mate.' } }),
          mv(pos('e4 e5 Qh5 Nc6 Bc4 g6 Qf3'), 'Nf6', 'The knight blocks the f-file and develops, so the f7 square is no longer a problem. Defend with tempo.', { prompt: 'Black to move. The queen retreated but still eyes f7.', hint: 'Which piece can cover f7 and develop at the same time?' }),
          tf('Attacking the queen with ...Nf6 is always a good answer to Qh5.', false, 'Not when Qxf7# is mate. Always count the attackers on f7 before you chase the queen.', B(pos('e4 e5 Bc4 Nc6 Qh5 Nf6'), 'r:h5f7'), { claim: { fen: pos('e4 e5 Bc4 Nc6 Qh5'), san: 'Nf6', ok: false } }),
          shot(pos('e4 e5 Qh5 Nc6 Bc4 Nf6'), 'Qxf7#', 'And here is the punishment when the defence is missed. If you ever play White and Black answers carelessly, the mate is there.', { prompt: 'White to move. Black did not see the threat.', hint: 'Look at f7.' }),
          choice('You see a queen and a bishop aiming at f7. How many defenders does f7 have at the start of the game?', [o('1 (just the king)', true, 'Only the king defends it. Attackers: 2. That is why the trap works.'), o('2'), o('0')], 'Who protects f7 on move 3?'),
        ),
      ],
    }),

    lesson({
      id: 'fnd-raids',
      title: 'Early queen raids',
      blurb: 'When your opponent brings the queen out too soon.',
      mins: 8,
      tags: ['hung_piece'],
      intro: "Queen raids look scary and are mostly harmless if you stay calm. The trick is to develop with tempo instead of chasing the queen blindly.",
      rule: 'Develop with tempo against an early queen.',
      habit: 'When the opposing queen comes out early, ask which of your developing moves attack it for free.',
      recap: 'An early queen is a target, not a threat, if you stay calm. | Develop pieces that attack her, and she loses time. | Watch for f7 (or f2) all the same: queen plus bishop is the only real danger.',
      steps: [
        ...ph(
          'example',
          txt(
            'Make her run',
            'After 1.e4 e5 2.Nf3 Qf6?! the black queen blocks her own knight and can be hit with tempo. Instead of grabbing a pawn, develop a piece that does something useful: **Nc3** and later **d4**.',
            B(pos('e4 e5 Nf3 Qf6'), 'g:b1c3 g:d2d4'),
          ),
        ),
        ...ph(
          'guided',
          mv(pos('e4 e5 Nf3 Qf6'), 'Nc3', 'A developing move that prepares d4 and takes away squares from the queen. White is already ahead in the fight for the centre (d4 is also fine).', { prompt: 'White to move. Black\'s queen is out on move 2.', hint: 'Which move develops a piece and keeps an eye on the centre?' }),
        ),
        ...ph(
          'practice',
          tf('After 1.e4 e5 2.Nf3 Qf6, White should play 3.Nxe5 to win a pawn.', false, 'The knight can be hit and the queen takes it: Qxe5 wins a piece. Develop instead.', B(pos('e4 e5 Nf3 Qf6'), 'r:f3e5'), { claim: { fen: pos('e4 e5 Nf3 Qf6'), san: 'Nxe5', ok: false } }),
          mv(pos('e4 e5 Qh5'), 'Nc6', 'The queen is out early and Black develops a piece while protecting e5.', { prompt: 'Black to move. White\'s queen came out on move 2.' }),
          mv(pos('e4 e5 Qh5 Nc6 Bc4'), 'g6', 'Remember the answer: kick the queen with g6 (Qe7 also holds).', { prompt: 'Black to move.' }),
          tf('After 1.e4 e5 2.Qh5 Nc6 3.Bc4, playing 3...Nf6 attacks the queen and is the best reply.', false, 'It loses on the spot to Qxf7#. Attacking the queen does not help when she can give mate.', B(pos('e4 e5 Qh5 Nc6 Bc4 Nf6'), 'r:h5f7'), { claim: { fen: pos('e4 e5 Qh5 Nc6 Bc4'), san: 'Nf6', ok: false } }),
          shot(pos('e4 e5 Qh5 Nc6 Bc4 Nf6'), 'Qxf7#', 'And the punishment, if you ever play White and Black misses it.', { prompt: 'White to move. Black did not see the threat.' }),
          choice('Your opponent brings the queen out on move 2. What is the best plan?', [o('Develop pieces that attack her', true, 'Every move you attack her with a developing move, you gain a tempo.'), o('Chase her with pawns only', 'That can create holes. Pieces first.'), o('Ignore her completely', 'Ignoring a queen is how you miss a threat on f7. Count first.')], 'What gains you time without costing you anything?', undefined, { reasoning: true }),
        ),
      ],
    }),

    lesson({
      id: 'fnd-fried',
      title: 'The Fried Liver: know the danger',
      blurb: 'A famous trap against ...Nxd5. Avoid it, and you are fine.',
      mins: 8,
      tags: ['hung_piece', 'allowed_mate'],
      intro: "This one catches people who like to grab pawns. Once you've seen it, you'll never fall for it, and you'll be glad you spent a few minutes on it.",
      rule: 'Before you grab a pawn, ask what the capture opens up for the other side.',
      habit: 'Whenever a pawn offer looks free on move 5, ask "what did they do with their last move?" before taking.',
      recap: 'After 1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.Ng5 d5 5.exd5, do not recapture with the knight. | ...Na5 is the safe, sound reply. | The trap works because the knight takes on f7 and the king is dragged into the open.',
      steps: [
        ...ph(
          'example',
          txt(
            'What is the trap?',
            'After 4.Ng5 d5 5.exd5, Black\'s natural recapture is 5...Nxd5. But then 6.Nxf7! forks the queen and the rook, and after ...Kxf7 White drags the king into the open with 7.Qf3+ and Black is in trouble. White gives a knight and wins an attack.',
            B(pos('e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5 Nxd5'), 'r:g5f7', 'y:f7'),
          ),
          txt(
            'The safe reply',
            'Instead, play **5...Na5**. The knight attacks the bishop on c4, so White has to deal with that, and Black recovers the pawn later. Nothing sharp, nothing risky.',
            B(pos('e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5'), 'g:c6a5 r:c4a5'),
          ),
        ),
        ...ph(
          'guided',
          mv(pos('e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5'), 'Na5', 'The knight hits the bishop and sidesteps the Fried Liver. Black will win back the d5 pawn with ...Qd5 or ...Bd6 later, with a safe position.', { prompt: 'Black to move. White offered a pawn on d5.', hint: 'Which recapture does NOT put a piece on d5 right away?', wrong: { Nxd5: 'After Nxd5, 6.Nxf7! forks queen and rook. The pawn was bait.' } }),
        ),
        ...ph(
          'practice',
          line({
            id: 'fried-safe',
            title: 'Avoiding the Fried Liver',
            side: 'b',
            moves: FRIED,
            ideas: [
              'White takes the centre.',
              'Black does the same.',
              'A knight attacks e5.',
              'Black protects e5 and develops.',
              'The bishop eyes f7.',
              'The Two Knights Defence: counter-attack e4.',
              'White goes after f7 again.',
              'Black hits the bishop and opens the centre.',
              'White takes the offered pawn.',
              'Na5, not Nxd5: the safe reply.',
              'White checks and wins back time.',
              'Block the check with a pawn.',
              'White takes the pawn on c6.',
              'Black recaptures; the position is fine.',
            ],
          }),
          mv(pos('e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5 Na5 Bb5+'), 'c6', 'Block the check with a pawn and the attack on c6 comes with it: you are about to win your pawn back with a healthy position.', { prompt: 'Black to move. White checks with the bishop.', hint: 'You want to block with a pawn that also hits the bishop.' }),
          mv(pos('e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5 Na5 Bb5+ c6 dxc6'), 'bxc6', 'Recapture with the b-pawn: it opens the b-file for the rook and keeps your structure healthy.', { prompt: 'Black to move. White took on c6.', hint: 'Which pawn can recapture, and which pieces does it help?' }),
          tf('After 5...Na5 6.Bb5+, the reply 6...c6 is a good one even though Black is a pawn down.', true, 'Black is down a pawn for now but gets the bishop pair and the centre, and the pawn comes back. The position is balanced, a good result for avoiding the trap.', B(pos('e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5 Na5 Bb5+ c6')), { claim: { fen: pos('e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5 Na5 Bb5+'), san: 'c6', ok: true } }),
          tf('After 5.exd5, recapturing with 5...Nxd5 is the best move.', false, 'It runs into the Fried Liver: 6.Nxf7! and White has a dangerous attack.', B(pos('e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5 Nxd5'), 'r:g5f7'), { claim: { fen: pos('e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5'), san: 'Nxd5', ok: false } }),
          choice('Why is the pawn on d5 a bait?', [o('Taking it with the knight lets Nxf7 work', true, 'The knight on d5 no longer guards the king side, and the bishop on c4 supports the knight\'s fork.'), o('It is poisoned', 'Not literally: the issue is what happens after Nxd5.'), o('It is protected by the queen', 'The queen does not protect it. The danger is the Nxf7 follow-up.')], 'What does the recapture leave unprotected?', undefined, { reasoning: true }),
        ),
      ],
    }),
  ],
};
