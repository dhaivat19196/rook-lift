import { B, choice, gen, kpkTf, lesson, mv, o, ph, playout, pos, tf, txt } from '../build.ts';
import type { Unit } from '../types.ts';

const KEY1 = '8/8/8/8/k7/2K5/1P6/8 w - - 0 1';
const SQ1 = '8/8/5k2/P7/8/8/8/6K1 w - - 0 1';
const SQ2 = '8/8/2k5/P7/8/8/8/6K1 w - - 0 1';
const E6 = '4k3/8/4K3/4P3/8/8/8/8 w - - 0 1';
const OP10 = '3k4/8/3K4/3P4/8/8/8/8 w - - 0 1';
const OP8 = '8/8/8/4k3/8/4K3/4P3/8 w - - 0 1';
const OP9 = '8/8/8/4k3/8/4K3/4P3/8 b - - 0 1';

// =====================================================================================================
// Simple endgame basics
// =====================================================================================================
export const endBasics: Unit = {
  id: 'f-endgame',
  title: 'Endgame basics',
  blurb: 'The king becomes a fighter, pawns run for the finish line, and the opposition decides close races.',
  track: 'foundations',
  cat: 'endgame',
  stage: 0,
  lessons: [
    lesson({
      id: 'fnd-end-king',
      title: 'The king is a fighter',
      blurb: 'When the queens are gone, march your king to the action.',
      mins: 9,
      skill: 'kpk',
      tags: ['conversion'],
      intro: 'In the opening you hide your king. In an endgame there is nothing left to mate it, so it becomes one of your strongest pieces. Learning to use it is worth a lot of half-points.',
      rule: 'The king leads the pawn.',
      habit: 'The moment the queens come off in your next game, move your king toward the centre before you push anything.',
      recap: 'With few pieces left, the king is safe and strong. | Walk it toward the centre and toward the pawns, in front of your own pawn if you can. | A pawn without its king usually gets blocked by the enemy king.',
      steps: [
        ...ph(
          'example',
          txt(
            'Lead with the king',
            'Look at this ending. White has a pawn and the black king is blocking its path. If White just pushes the pawn, the black king simply steps in front of it.\n\nInstead White brings the **king** forward first: Kc4. The king helps the pawn through, because a king beside or ahead of its pawn cannot be stopped.',
            B(KEY1, 'g:c3c4', 'y:b2'),
          ),
        ),
        ...ph(
          'guided',
          mv(KEY1, 'Kc4', 'The king heads for the squares in front of the pawn, and once it gets there the pawn queens by force. Pushing the pawn first lets Black blockade.', {
            kind: 'kpk',
            prompt: 'White to move. Pawn push or king move?',
            hint: 'Where will the black king go if you push the pawn?',
            wrong: { b4: 'Black answers Kb5 (or Kxb4 later) and stays in front of the pawn.', 'b3+': 'Check, but after the king goes to a3 or b5 the pawn is stuck and the king is out of play.' },
            rule: 'The king leads the pawn.',
          }),
        ),
        ...ph(
          'practice',
          mv(E6, ['Kd6', 'Kf6'], 'A king on the sixth rank in front of its pawn wins. Take a step sideways so you keep the king ahead of the pawn.', { kind: 'kpk', prompt: 'White to move. How do you make progress?', hint: 'Do not push the pawn yet. What does the king want to reach?' }),
          mv(OP10, ['Ke6', 'Kc6'], 'Step beside the enemy king and in front of the pawn. Pushing the pawn first would let Black take the opposition.', { kind: 'kpk', prompt: 'White to move. Your pawn is on d5.', hint: 'You want your king on the sixth rank, on a different file from theirs.' }),
          choice('In an endgame with only pawns and a few pieces, where should your king go?', [o('Toward the centre and the pawns', true, 'There is little left to attack it, so it helps most near the action.'), o('Stay on the back rank, tucked away', 'That was right in the opening. In the endgame it just leaves your king doing nothing.'), o('Away from every pawn', 'The pawns are where the game is decided.')], 'What is the king safe from now?', undefined, { reasoning: true }),
          tf('In an endgame, pushing a passed pawn is always better than moving the king.', false, 'A pawn that runs alone gets blockaded. Bring the king along first, then push.'),
          gen('kpk', 6),
        ),
      ],
    }),

    lesson({
      id: 'fnd-passed',
      title: 'Push the passed pawn',
      blurb: 'A pawn nobody can stop is worth more than a piece.',
      mins: 9,
      skill: 'kpk',
      tags: ['conversion', 'missed_win'],
      intro: 'A passed pawn has no enemy pawns in front of it or on the neighbouring files. If nothing can catch it, it simply walks to the end and becomes a queen. The only question is whether the enemy king can reach it in time.',
      rule: 'If their king cannot reach the pawn\'s square in time, push.',
      habit: 'When you have a passed pawn, imagine a square from the pawn to the promotion square. Is the enemy king inside it?',
      recap: 'A passed pawn has no enemy pawn in front or beside it. | Rule of the square: draw a square from the pawn to its queening rank. If the king is outside it, the pawn queens. | If their king is inside the square, bring your king instead.',
      steps: [
        ...ph(
          'example',
          txt(
            'The rule of the square',
            'The pawn on a5 needs three moves to promote (a6, a7, a8). Draw a square with sides of three: from a5 to d5 and from a8 to d8. If the black king stands **outside** that square, it cannot catch the pawn.\n\nBlack\'s king on f6 is outside. White just pushes.',
            B(SQ1, 'g:a5a8', 'y:a5 y:d5 y:d8 y:a8'),
          ),
          txt(
            'Inside the square',
            'Now put the black king on c6. It is **inside** the square, so it catches the pawn. White cannot just run; it needs its own king to help. Here the pawn alone only draws.',
            B(SQ2, undefined, 'y:a5 y:d5 y:d8 y:a8 r:c6'),
          ),
        ),
        ...ph(
          'guided',
          kpkTf('The black king is on f6, outside the square. White to move wins by pushing the pawn.', SQ1, true, 'Yes. The king needs four moves to reach the corner area and the pawn only three. The pawn queens.', 'g:a5a8', 'y:a5 y:d5 y:d8 y:a8'),
        ),
        ...ph(
          'practice',
          kpkTf('This time the black king is on c6, inside the square. Does White win?', SQ2, false, 'No. The king steps into the pawn\'s path in time and the pawn is lost or blocked. White would need its own king nearby.', undefined, 'y:a5 y:d5 y:d8 y:a8 r:c6'),
          mv(SQ1, ['a6', 'Kf2', 'Kg2', 'Kh2', 'Kh1', 'Kf1'], 'Black is outside the square, so every sensible move wins. Pushing with a6 is the cleanest.', { kind: 'kpk', prompt: 'White to move. Is the pawn unstoppable?', hint: 'Count the pawn\'s moves to promote and the king\'s moves to catch it.' }),
          choice('You have a passed pawn on the 5th rank and their king is far away. What now?', [o('Push it', true, 'Their king is outside the square: nothing can stop it.'), o('Wait and improve your king first', 'That is fine if their king is close. Here it is far, so waiting only gives them time.'), o('Trade it off', 'Never trade away the pawn that wins the game.')], 'Is their king inside the square?', undefined, { reasoning: true }),
          gen('kpk', 6),
        ),
      ],
    }),

    lesson({
      id: 'fnd-opposition',
      title: 'The opposition: first steps',
      blurb: 'Why the same position can be a win or a draw depending on whose move it is.',
      mins: 10,
      skill: 'kpk',
      tags: ['conversion'],
      intro: 'This is one of the first big ideas in endgames, and it surprises almost everybody the first time. Two kings facing each other is not a standoff: the side that does NOT have to move holds the advantage.',
      rule: 'Take the opposition: leave your opponent to move when the kings face each other.',
      habit: 'In king-and-pawn endings, count whether the kings face each other and who is to move before you push the pawn.',
      recap: 'The opposition: kings face each other with one square between. | The side NOT to move has it, and the other king has to give way. | A move earlier or later can change a win into a draw, so count before you move.',
      steps: [
        ...ph(
          'example',
          txt(
            'Same position, different result',
            'Here White\'s king is on e3, the pawn on e2 and Black\'s king on e5, one square apart with a gap between them. If **White** is to move, he has to step aside and the black king slips past: a draw.\n\nBut if **Black** is to move, it is Black who has to give way. White gets in front and the pawn queens. The same pieces, but whoever has to move loses ground.',
            B(OP9, 'r:e5d5 g:e3e4', 'y:e4'),
          ),
        ),
        ...ph(
          'guided',
          kpkTf('Black to move. White wins (Black has to give way).', OP9, true, 'Yes. Whichever way Black steps, White takes the key squares and the pawn queens. Black is the one in zugzwang.', undefined, 'y:e3 y:e5'),
        ),
        ...ph(
          'practice',
          kpkTf('The same position but now White is to move. White wins.', OP8, false, 'No. It is a draw: White has to step aside, and the black king stays in front of the pawn. Having to move is the problem.', undefined, 'y:e3 y:e5'),
          mv(OP10, ['Ke6', 'Kc6'], 'Get beside their king, on the sixth rank, so the pawn can follow. You take the key squares and Black cannot stop the pawn.', { kind: 'kpk', prompt: 'White to move. Where does the king go?', hint: 'Which square on the sixth rank is next to the enemy king and in front of the pawn?' }),
          mv('8/8/8/8/3k4/8/3P4/3K4 b - - 0 1', ['Kc5', 'Kd5', 'Ke5', 'Ke4', 'Kd3', 'Kc4'], 'Black is defending a lone pawn that is far from queening. Almost any king move that stays near the pawn keeps the draw. The point is not to run away.', { kind: 'kpk', prompt: 'Black to move. You have to hold the draw against the pawn. Stay close.', hint: 'Keep your king in front of the pawn or beside it.' }),
          kpkTf('White to move. The pawn is on d5, the kings are on d4 and d6. White wins.', '8/8/3k4/3P4/3K4/8/8/8 w - - 0 1', false, 'It is a draw. The black king is in front of the pawn and White has to move, so he cannot make progress.', undefined, 'y:d4 y:d6'),
          gen('kpk', 5),
          playout({ id: 'kp-opp', title: 'King + Pawn: the opposition', blurb: 'Promote the pawn. Keep your king in front of it.', fen: '8/8/8/3k4/8/3K4/3P4/8 b - - 0 1', user: 'w', goal: 'win', success: 'promote', maxMoves: 40, tip: 'Your king leads, the pawn follows. Win the opposition (kings facing with one square between) when the enemy king is in front.' }, 'Now play it out. Black has to move first, so you have the opposition.'),
        ),
      ],
    }),
  ],
};

// =====================================================================================================
// Converting a winning position
// =====================================================================================================
export const convert: Unit = {
  id: 'f-convert',
  title: 'Converting a win',
  blurb: 'You get winning positions. Here is how to finish them without handing the point back.',
  track: 'foundations',
  cat: 'plan',
  stage: 0,
  lessons: [
    lesson({
      id: 'fnd-trade-ahead',
      title: 'When you are ahead, trade',
      blurb: 'Fewer pieces means fewer ways for them to hurt you.',
      mins: 8,
      tags: ['conversion', 'missed_win'],
      intro: 'You have won material. Now the job is simple but not easy: do not give it back. The cleanest way is to trade pieces.',
      rule: 'When you are ahead, trade pieces, not pawns.',
      habit: 'The next time you win a piece, look for a safe trade on the very next move.',
      recap: 'Ahead in material: trade pieces. Every swap makes your lead count for more. | Trade pieces, not pawns: pawns are your winning chances. | Avoid complicated attacks; there is no need.',
      steps: [
        ...ph(
          'example',
          txt(
            'Why trades help the side ahead',
            'Imagine you are a rook up. With lots of pieces on the board, the other side has chances to make threats and win something back. With fewer pieces, there is nowhere for them to hide and your extra rook just wins.\n\nHere White is a rook up and offers the queen trade. It is not exciting, and it is exactly right.',
            B('3r2k1/pp3ppp/2pq4/8/3Q4/4N3/PP3PPP/3R2K1 w - - 0 1', 'g:d3d6'),
          ),
        ),
        ...ph(
          'practice',
          tf('White is a knight up here. Trading queens with Qxd6 is a good plan.', true, 'Yes. After cxd6 White has an extra knight in a simple position and nothing to fear.', B('3r2k1/pp3ppp/2pq4/8/3Q4/4N3/PP3PPP/3R2K1 w - - 0 1', 'g:d3d6'), { claim: { fen: '3r2k1/pp3ppp/2pq4/8/3Q4/4N3/PP3PPP/3R2K1 w - - 0 1', san: 'Qxd6', ok: true } }),
          choice('You are a piece ahead. Which trade helps you most?', [o('Trade pieces, keep your pawns', true, 'Your extra piece is worth more with fewer enemy pieces left to fight it.'), o('Trade your pawns, keep the pieces', 'Pawns are what win endgames. Do not trade them off.'), o('No trades, attack instead', 'Attacking is riskier than it needs to be. Trade first.')], 'What makes the extra piece count for more?', undefined, { reasoning: true }),
          tf('When you are ahead, it is a good idea to launch a big attack to finish quickly.', false, 'A calm trade is usually the safest way to win. Big attacks give back chances.'),
          choice('You win a knight on move 20. What is your plan?', [o('Make safe moves, trade pieces, avoid risks', true, 'You do not have to win quickly. Win safely.'), o('Sacrifice the knight to attack', 'You just won the material; giving it back is the opposite of the plan.'), o('Rush to resign it', 'Obviously not.')], 'What is the lowest-risk way to win?'),
          gen('free', 4),
          gen('safe', 4),
        ),
      ],
    }),

    lesson({
      id: 'fnd-no-hang-win',
      title: 'Do not hang things when you are winning',
      blurb: 'The most common way to throw away a won game.',
      mins: 8,
      skill: 'safe',
      tags: ['conversion', 'hung_piece'],
      intro: 'Here is something I see in a lot of lost positions that were won a few moves earlier: someone relaxed. A winning position is the moment to be most careful, not least.',
      rule: 'Winning positions need the blunder check too.',
      habit: 'The move you feel most sure about is the one to double-check. Run the blunder check on every move while ahead.',
      recap: 'Relaxing is how won games get lost. | Keep the blunder check on every move, especially when ahead. | When winning, play the safe move you understand, not the flashy one.',
      steps: [
        ...ph(
          'example',
          txt(
            'The danger of feeling safe',
            'When you are winning, your brain wants to hurry. Everything looks easy and you play fast. That is exactly when a piece gets left loose.\n\nThe cure is not to play slower in general. It is to **keep the same ten-second check** you use when it is close.',
            B(pos('e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5 Nxd5'), 'r:g5f7'),
          ),
        ),
        ...ph(
          'practice',
          tf('You are winning, so you can play fast and skip the blunder check.', false, 'Skip it and you give them the one chance they need. Keep the habit on every move.'),
          gen('safe', 6),
          gen('free', 4),
          gen('loose', 2),
        ),
      ],
    }),

    lesson({
      id: 'fnd-extra-mate',
      title: 'Use your extra material to mate',
      blurb: 'Rook up or queen up: how to turn it into a win.',
      mins: 10,
      skill: 'mate1',
      tags: ['conversion', 'missed_mate'],
      intro: 'Extra material is only worth something if you cash it in. Mostly that means pushing a pawn or delivering mate. Let me show you how to make the plan simple.',
      rule: 'Extra material: trade, then push a pawn or deliver mate.',
      habit: 'When you are a rook or queen up, decide on one plan: mate, or a pawn to the end. Stick with it.',
      recap: 'With extra material, keep it simple: trade pieces, make a passed pawn, queen it. | Look for mates once the enemy king runs short of squares. | Always check for stalemate before the last move.',
      steps: [
        ...ph(
          'example',
          txt(
            'One plan at a time',
            'With a rook or a queen extra, you do not need a clever plan. Bring the king closer, trade pieces, create a passed pawn and push it. If the enemy king is exposed, look for a mate instead.',
            B('6k1/5pp1/7p/8/8/5P2/5KPP/3R4 w - - 0 1', 'g:d1d8'),
          ),
        ),
        ...ph(
          'practice',
          gen('mate1', 8),
          playout({ id: 'rook-up', title: 'Rook up: convert', blurb: 'Basic rook endgame. Push a pawn to promotion safely.', fen: '6k1/5pp1/7p/8/8/5P2/5KPP/3R4 w - - 0 1', user: 'w', goal: 'win', success: 'promote', maxMoves: 50, tip: 'Activate the king, cut off the enemy king with the rook, then create a passed pawn. Trade pawns, not rooks, if you can avoid it.' }, 'Play it out: you are a rook up. Your goal is to promote a pawn.'),
          playout({ id: 'queen-up', title: 'Queen up: finish it', blurb: 'A queen ahead: trade, then mate or promote.', fen: '6k1/5ppp/8/8/8/8/5PPP/3QK3 w - - 0 1', user: 'w', goal: 'win', success: 'mate', maxMoves: 40, tip: 'Use the queen to check the king along the back rank, bring your own king up, and look for the mate. Never stalemate.' }, 'And one with a queen. Look for the mate.'),
        ),
      ],
    }),
  ],
};

// =====================================================================================================
// The clock
// =====================================================================================================
export const clock: Unit = {
  id: 'f-clock',
  title: 'Using the clock',
  blurb: 'In 10-minute games the clock is a piece. A plan for each phase and a calm blunder check.',
  track: 'foundations',
  cat: 'clock',
  stage: 0,
  lessons: [
    lesson({
      id: 'fnd-clock-budget',
      title: 'A time budget for 10 minutes',
      blurb: 'Where your minutes should go.',
      mins: 7,
      tags: ['time_trouble'],
      intro: 'Several of your games ended on the clock, not on the board. A little planning fixes most of that. Here is a simple budget for a 10-minute game.',
      rule: 'Spend your time where the position is hard, and play the easy moves fast.',
      habit: 'Glance at your clock after move 10 and again at move 25. If you are behind schedule, play the next few moves faster.',
      recap: 'Rough budget for 10 minutes: about 2 for the opening, 5 for the middlegame, 3 for the endgame. | Play moves you know in seconds and save time for the hard ones. | Check the clock at move 10 and move 25.',
      steps: [
        ...ph(
          'example',
          txt(
            'A rough budget',
            'Think of your 10 minutes as three buckets: about **2 minutes** for the first 10 moves, about **5 minutes** for the middlegame, and about **3 minutes** for the endgame.\n\nThat works out to roughly 15 to 20 seconds a move on average. Some moves take five seconds and a few take two minutes. The skill is knowing which is which.',
          ),
        ),
        ...ph(
          'practice',
          choice('How much of your 10 minutes should the first 10 moves take?', [o('About 2 minutes', true, 'Most of those moves are standard. Spend your time later, when the position is hard.'), o('About 5 minutes', 'That leaves less than half the game for the middlegame and endgame, where the decisions are.'), o('About 30 seconds', 'Too fast. You need a few seconds for each move to avoid hanging something.')], 'Where are the hard decisions made?'),
          choice('It is move 5, you know the move from your repertoire. How long?', [o('A few seconds', true, 'Play what you know. Save the thinking for later.'), o('A minute, to be careful', 'It is a known move. Spending a minute on it is a minute you will miss later.'), o('Three minutes, to find something better', 'You are not looking for something better in a position you know.')], 'Is this a hard position or an easy one?'),
          choice('After 10 moves you have 6:30 left and the position is tense. What now?', [o('Slow down a little for the hard moves and speed up for the easy ones', true, 'You are a bit behind the 8:00 target, so budget carefully.'), o('Play everything instantly', 'That is how you hang things.'), o('Spend two minutes on every move', 'You would run out of time in about three more moves.')], 'What will happen if you keep spending at this rate?'),
          tf('Losing on time is just as bad as being checkmated.', true, 'The result is the same: a loss. Time is a resource you manage like material.'),
          tf('A single move can be worth thinking for a couple of minutes if the game depends on it.', true, 'Yes. Saving time on easy moves is what lets you afford this on the critical one.'),
          choice('You have 45 seconds left and your position is fine. What is the best approach?', [o('Play safe moves quickly, keep a simple blunder check', true, 'Do not take big risks. The clock decides the game now.'), o('Look for a deep combination', 'There is no time. Keep it safe.'), o('Offer a draw every move', 'It is better to play safe moves; the opponent may be short of time too.')], 'What is the least risky way to use 45 seconds?'),
        ),
      ],
    }),

    lesson({
      id: 'fnd-clock-obvious',
      title: 'Obvious moves: play them fast',
      blurb: 'Recaptures and known moves should cost seconds, not minutes.',
      mins: 7,
      tags: ['time_trouble'],
      intro: 'A lot of time is lost thinking hard about moves that are not hard. Let me show you a few types that should be quick.',
      rule: 'If a move is obvious and the blunder check is clean, play it.',
      habit: 'Before you spend more than 30 seconds, ask: "Is this actually a hard move, or am I second-guessing?"',
      recap: 'Recaptures and moves from your repertoire are usually quick. | Do the blunder check for ten seconds, then play. | Save the minutes for positions where you cannot find a good plan.',
      steps: [
        ...ph(
          'example',
          txt(
            'Which moves are quick?',
            'A **recapture** is usually obvious: they took your piece, you take back. A move from your **repertoire** you already know. A move with only **one sensible answer**. Do your blunder check and play them.\n\nSlow down only when you really do not know what to do.',
            B(pos('e4 e5 Nf3 Nc6 d4 exd4'), 'g:f3d4'),
          ),
        ),
        ...ph(
          'practice',
          mv(pos('e4 e5 Nf3 Nc6 d4 exd4'), 'Nxd4', 'An obvious recapture: take back the pawn with the knight. A few seconds is plenty.', { prompt: 'White to move. This is an obvious recapture. Play it in a few seconds.', hint: 'They took your pawn. What takes it back?' }),
          mv(pos('e4 c5 Nf3 d6 d4 cxd4'), 'Nxd4', 'Same idea: the pawn was taken, so the knight takes back. No need for a long think.', { prompt: 'White to move. Another quick one.' }),
          mv(pos('d4 Nf6 c4 e6 Nc3 Bb4 e3 O-O Bd3 d5 Nf3 c5 O-O dxc4'), 'Bxc4', 'They took on c4, you take back with the bishop. Obvious and fast.', { prompt: 'White to move. How long does this one take?' }),
          mv(pos('e4 e5 Nf3 Nc6 Bb5 Nf6 O-O Nxe4 d4 Nd6 Bxc6 dxc6 dxe5 Nf5'), 'Qxd8+', 'A queen trade with check, and the only sensible move. Fast.', { prompt: 'White to move. One move stands out.' }),
          choice('A recapture is available and nothing else is going on. How long should you spend?', [o('A few seconds', true, 'Do the blunder check and play it.'), o('A minute, to be sure', 'There is nothing to be sure about. You are burning time.'), o('Two minutes', 'Save it for a position that needs it.')], 'Is the position complicated?'),
          tf('If a move is obvious, it is wise to spend five minutes making sure.', false, 'Spend that time on the hard decision later, not the obvious move now.'),
        ),
      ],
    }),

    lesson({
      id: 'fnd-clock-check',
      title: 'A fast blunder check',
      blurb: 'Ten seconds, three questions, no over-thinking.',
      mins: 8,
      skill: 'safe',
      tags: ['time_trouble', 'hung_piece'],
      intro: 'When the clock gets low, people either skip the blunder check or freeze for a minute doing it. There is a faster way that works.',
      rule: 'Ten seconds, three questions: what do I leave loose, what can they check, what do they capture.',
      habit: 'Practise saying the three questions out loud (quietly) on every move this week until it takes ten seconds.',
      recap: 'The fast check has three questions: what does my move leave loose, what checks do they have, what captures do they have. | Ten seconds is plenty. Longer is over-thinking. | In time trouble, prefer the safe move that you can see through.',
      steps: [
        ...ph(
          'example',
          txt(
            'Ten seconds, three questions',
            '**1.** After my move, is any of my pieces loose?\n**2.** Do they have a check I have not seen?\n**3.** Do they have a capture that wins something?\n\nThat is all. If all three answers are no, play the move. If you cannot answer in ten seconds, pick a safer move.',
          ),
        ),
        ...ph(
          'practice',
          gen('safe', 5),
          gen('free', 4),
          gen('checks', 3),
          choice('Your clock shows 1:00 and you have a decent move. What do you do?', [o('Run the three-question check for about ten seconds, then play', true, 'The check costs ten seconds and is cheaper than losing a piece.'), o('Skip the check, you are short of time', 'Skipping it is how most time-trouble blunders happen.'), o('Spend 40 seconds on the check', 'That leaves you nothing. Ten seconds is enough.')], 'How long does the check really need?'),
        ),
      ],
    }),
  ],
};
