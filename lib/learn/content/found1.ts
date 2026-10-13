import { B, choice, gen, lesson, mv, o, ph, pos, shot, squares, think, tf, txt } from '../build.ts';
import type { Unit } from '../types.ts';

const LOOSE_N = 'r1bqkb1r/pppp1ppp/5n2/4n3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1';
const LOOSE_B = 'rnbqkbnr/ppp2ppp/8/3pp3/3P1B2/8/PPP1PPPP/RN1QKBNR w KQkq - 0 3';
const SCHOLAR = pos('e4 e5 Qh5 Nc6 Bc4 Nf6');

// =====================================================================================================
// What the pieces are worth
// =====================================================================================================
export const values: Unit = {
  id: 'f-values',
  title: 'What pieces are worth',
  blurb: 'Points, fair trades and counting before you capture.',
  track: 'foundations',
  cat: 'safety',
  stage: 0,
  lessons: [
    lesson({
      id: 'fnd-values',
      title: 'Points and trades',
      blurb: 'Pawn 1, knight 3, bishop 3, rook 5, queen 9.',
      mins: 7,
      skill: 'value',
      tags: ['hung_piece', 'conversion'],
      intro: "Before we do anything clever, let's agree on a currency. Every piece has a point value, and almost every decision in chess starts with adding them up.",
      rule: 'Add up what you give and what you get.',
      habit: 'Before any trade in your next game, say the numbers out loud in your head: "I give 3, I get 5."',
      recap: 'Pawn 1, knight 3, bishop 3, rook 5, queen 9. | Trading up (giving less, getting more) wins material. | Always add up both sides of a trade before you take.',
      steps: [
        ...ph(
          'example',
          txt(
            'The point values',
            'A pawn is worth **1**. A knight and a bishop are worth **3** each. A rook is worth **5** and the queen **9**. The king cannot be traded, so it has no price.\n\nThese are not rules from the book of the universe, just a very good rule of thumb. A rook is worth more than a bishop, so giving a bishop to win a rook is a gain.',
            B('4k3/8/8/3r4/8/2N5/8/4K3 w - - 0 1', 'g:c3d5', 'r:d5'),
          ),
          txt(
            'Trading up and trading down',
            'The white knight (3) can take the black rook (5) here, and nothing protects the rook. That is **trading up**: you give less and get more. Giving a rook for a knight is **trading down**, and you want to avoid it.\n\nThe habit is simple: add up what you give, add up what you get, and compare.',
            B('4k3/8/8/3r4/8/2N5/8/4K3 w - - 0 1', 'g:c3d5'),
          ),
        ),
        ...ph(
          'guided',
          choice('The knight takes the rook, and nothing can take back. How many points did White win?', [o('3', 'The knight is what White already had. It is the black rook that came off the board.'), o('5', true, 'The rook is worth 5 and nothing was lost in return, so White is 5 points up.'), o('8', 'The knight did not leave the board, so only the rook counts.')], 'Count what leaves the board on each side.', B('4k3/8/8/3r4/8/2N5/8/4K3 w - - 0 1', 'g:c3d5')),
        ),
        ...ph(
          'practice',
          tf('You give up a rook (5) and win a bishop and a pawn (4). Is that a good trade?', false, 'You gave 5 and got 4. That is trading down, so no.'),
          tf('A knight and a bishop are worth the same.', true, 'Both are worth 3. Which is better depends on the position, not on the points.'),
          gen('value', 10),
        ),
      ],
    }),

    lesson({
      id: 'fnd-active',
      title: 'Pieces that work hard',
      blurb: 'Why a knight in the centre beats a knight in the corner.',
      mins: 7,
      skill: 'mobility',
      intro: 'Two pieces can be worth the same and do very different amounts of work. Let me show you how to tell which one is doing the job.',
      rule: 'Pieces in the centre do more work.',
      habit: 'When you have a free move, look for your worst-placed piece and ask where it would reach more squares.',
      recap: 'A piece in the centre reaches more squares than one on the edge. | Develop knights and bishops before you move the queen. | Count how many squares a piece reaches: more is better.',
      steps: [
        ...ph(
          'example',
          txt(
            'Count the squares',
            'A knight on e4 reaches **8** squares. A knight on a1 reaches **2**. Same piece, same points, four times the work. That is why you will hear "a knight on the rim is dim".\n\nBishops want open diagonals, rooks want open files, and the queen wants to wait until the others are out.',
            B('7k/8/8/8/4N3/8/8/K7 w - - 0 1', 'g:e4c3 g:e4c5 g:e4d6 g:e4f6 g:e4g5 g:e4g3 g:e4d2 g:e4f2'),
          ),
        ),
        ...ph(
          'guided',
          choice('Which knight is doing more work, one on e4 or one on a1?', [o('e4', true, 'From e4 it reaches 8 squares. From a1 only 2. Same price, but far more work.'), o('a1', 'From the corner a knight reaches only 2 squares. The centre is where it earns its keep.')], 'Count how many squares each one reaches.'),
        ),
        ...ph(
          'practice',
          tf('After 1.e4 e5, putting the knight on the edge with 2.Na3 is a good idea.', false, 'On a3 the knight reaches only 4 squares and points away from the centre. Nf3 develops it with a threat on e5.', B(pos('e4 e5'), 'r:b1a3 g:g1f3'), { claim: { fen: pos('e4 e5'), san: 'Na3', ok: false } }),
          gen('mobility', 10),
        ),
      ],
    }),

    lesson({
      id: 'fnd-count',
      title: 'Count before you capture',
      blurb: 'A capture is not free until you have counted the recapture.',
      mins: 8,
      skill: 'capture',
      tags: ['hung_piece', 'missed_win'],
      intro: 'Some captures win a piece, some lose one, and some are an even swap. The difference is a ten-second count. Let me show you the count.',
      rule: 'Count attackers and defenders before you capture.',
      habit: 'Before you take anything, ask "what takes back?" and add up the points.',
      recap: 'Ask what can take back before every capture. | A capture wins if you take more than the opponent takes back. | If both sides have the same pieces, the cheaper piece should go first.',
      steps: [
        ...ph(
          'example',
          txt(
            'Win, lose or even?',
            'Say your knight can take a pawn. If the pawn has a friend behind it, the friend takes your knight back: you gained 1 and lost 3. That is a **bad capture**, even though it looked free.\n\nIf you take a protected knight with your knight and they take back, it is an **even trade**. If you take an unprotected piece, it is a **free gain**.',
            B('r1bqkb1r/pppp1ppp/5n2/4n3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1', 'g:f3e5', 'r:e5'),
          ),
        ),
        ...ph(
          'guided',
          shot(LOOSE_N, 'Nxe5', 'The black knight on e5 has nothing protecting it, so there is no recapture. You win 3 points for free.', { prompt: 'White to move. Count first: is there a capture here that wins something?', hint: 'Which black piece is attacked and has no protector?', rule: 'Count attackers and defenders before you capture.' }),
        ),
        ...ph('practice', gen('capture', 10)),
      ],
    }),
  ],
};

// =====================================================================================================
// Piece safety  (your biggest leak - most practice here)
// =====================================================================================================
export const safety: Unit = {
  id: 'f-safety',
  title: 'Piece safety',
  blurb: 'Stop leaving pieces where they can be taken. The most valuable skill at your level.',
  track: 'foundations',
  cat: 'safety',
  stage: 0,
  lessons: [
    lesson({
      id: 'fnd-attacked',
      title: 'Attacked or defended?',
      blurb: 'Count who attacks a piece and who protects it.',
      mins: 9,
      skill: 'count',
      tags: ['hung_piece'],
      intro: "Let's build the one skill that stops most blunders: looking at a piece and counting who attacks it and who protects it. Take it slowly, and don't worry about speed yet.",
      rule: 'Count the attackers, then count the defenders.',
      habit: 'When your opponent moves, count what their moved piece attacks before you do anything else.',
      recap: 'A piece is attacked if an enemy piece could capture it next move. | A piece is defended if a friendly piece could recapture on that square. | Count both numbers before you decide anything.',
      steps: [
        ...ph(
          'example',
          txt(
            'Two numbers for every piece',
            'Look at the white knight on f3. Black\'s bishop on g4 **attacks** it. White\'s queen and the pawn on g2 **defend** it, because they could recapture.\n\nThat is one attacker and two defenders. Two numbers, and they tell you most of what you need to know.',
            B(pos('e4 e5 Nf3 Nc6 Bc4 Bc5 O-O d6 d3 Bg4'), 'r:g4f3 g:d1f3 g:g2f3', 'y:f3'),
          ),
        ),
        ...ph(
          'guided',
          choice('How many black pieces attack the white knight on f3?', [o('0'), o('1', true, 'Only the bishop on g4 attacks it. The red arrow shows it.'), o('2'), o('3')], 'Look along the lines: who could capture on f3 right now?', B(pos('e4 e5 Nf3 Nc6 Bc4 Bc5 O-O d6 d3 Bg4'), undefined, 'y:f3')),
        ),
        ...ph('practice', gen('count', 12)),
      ],
    }),

    lesson({
      id: 'fnd-safe',
      title: 'Is it safe?',
      blurb: 'Three questions that tell you if a piece is in danger.',
      mins: 10,
      skill: 'safe',
      tags: ['hung_piece'],
      intro: "Counting is the start. Now we use the numbers to decide: is this piece safe or not? I'll give you three questions, and you'll get lots of practice with them.",
      rule: 'Count attackers and defenders, and check who is cheaper.',
      habit: 'Before you move a piece, look at its destination square and ask the three questions.',
      recap: 'Question 1: is the piece attacked? Question 2: is it defended? Question 3: is the cheapest attacker worth less than the piece? | Not attacked means safe for now. | A pawn attacking a bishop is a threat even if the bishop is defended.',
      steps: [
        ...ph(
          'example',
          txt(
            'The three questions',
            '**1. Is it attacked?** If nothing attacks it, it is safe for now.\n**2. Is it defended?** If it is attacked and nothing protects it, it is loose and will be lost.\n**3. Who attacks it?** If the attacker is worth less than the piece (a pawn attacking a bishop), the piece is in trouble even when defended.',
            B(LOOSE_B, 'r:e5f4', 'y:f4'),
          ),
          txt(
            'The bishop on f4',
            'Here the bishop on f4 is attacked by a pawn. Nothing protects it. Even if something did, a pawn takes bishop is a trade of 1 for 3. Either way White needs to act.',
            B(LOOSE_B, 'r:e5f4', 'y:f4'),
          ),
        ),
        ...ph(
          'guided',
          choice('Black is about to move. Is the white bishop on f4 safe?', [o('Safe'), o('In danger', true, 'A pawn attacks it and nothing protects it. Attacked and unprotected means it will be taken.')], 'Run the three questions: attacked? defended? by whom?', B(LOOSE_B, undefined, 'y:f4', 'w')),
        ),
        ...ph('practice', gen('safe', 14)),
      ],
    }),

    lesson({
      id: 'fnd-loose',
      title: 'Spot the loose pieces',
      blurb: 'Find every piece that can be won, then win one.',
      mins: 10,
      skill: 'loose',
      tags: ['hung_piece', 'missed_win'],
      intro: 'Loose pieces drop off. You have heard it, and now you get to do it: find the pieces that are loose, in your position and in theirs.',
      rule: 'Loose pieces drop off.',
      habit: 'After each opponent move, scan their pieces for anything unprotected. Then scan yours.',
      recap: 'A loose piece is attacked and not protected enough. | Scan their pieces first for a free win, then scan yours for danger. | When you win a loose piece, check what it was protecting before you take.',
      steps: [
        ...ph(
          'example',
          txt(
            'Scan theirs, then yours',
            'After every move, scan **their** pieces for anything attacked and unprotected. If you find one, you may have a free win. Then scan **your** pieces for the same thing, so you do not lose one in return.\n\nBlack has just played ...Ne5 here. Nothing protects that knight, and White can take it.',
            B(LOOSE_N, 'g:f3e5', 'r:e5'),
          ),
        ),
        ...ph(
          'guided',
          squares('Tap the black piece that is loose.', { fen: LOOSE_N }, 'e5', 'The knight on e5 is attacked by your knight and has no protector. It is loose.', { hint: 'Which black piece has no friend defending it?', verifyHanging: 'b' }),
          shot('rnb1kbnr/pppp1ppp/8/4p3/4P2q/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 1', 'Nxh4', 'The queen came out and nothing protects her. A loose queen is the biggest gift in chess.', { prompt: 'White to move. Is anything of theirs loose?', hint: 'Look at the queen. Who protects her?', rule: 'Loose pieces drop off.' }),
        ),
        ...ph(
          'practice',
          squares('White to move was about to lose a piece. Which White piece is loose?', { fen: LOOSE_B }, 'f4', 'The pawn on e5 attacks the bishop and nothing protects it. Move the bishop or capture on e5 first.', { hint: 'Look at the bishop. Who attacks it and who defends it?', verifyHanging: 'w' }),
          gen('loose', 8),
          gen('free', 6),
        ),
      ],
    }),

    lesson({
      id: 'fnd-blunder-check',
      title: 'The blunder check',
      blurb: 'The ten-second routine before you press the move.',
      mins: 10,
      skill: 'free',
      tags: ['hung_piece', 'allowed_mate'],
      intro: "This is the lesson I would most like you to take into every game. It's a short routine, and used consistently it saves more points than any opening you will ever learn.",
      rule: 'Before you move, ask what your move leaves loose.',
      habit: 'Make the blunder check your last step every move: "What does my move leave hanging, and what can they now take?"',
      recap: 'After picking a move, picture the board after it. | Ask: is the piece I moved safe, and did I leave anything else loose? | Then look at their forcing moves: checks, captures and threats.',
      steps: [
        ...ph(
          'example',
          txt(
            'Picture the board after your move',
            'When you have chosen a move, **do not play it yet**. Picture the board after it and ask three things:\n\n**1.** Is the piece I just moved safe?\n**2.** Did I leave something else loose, or stop protecting it?\n**3.** What are their checks, captures and threats now?\n\nIt takes ten seconds. Do it every move, even the obvious ones.',
            B(SCHOLAR, 'g:h5f7', 'r:f7'),
          ),
        ),
        ...ph(
          'guided',
          shot(SCHOLAR, 'Qxf7#', 'Their last move left f7 weak and the check was mate. Notice how the routine works in both directions: you check your safety and you check their weaknesses.', { prompt: 'White to move. Run the scan: any checks?', hint: 'Look for a capture that gives check. What protects the square?' }),
        ),
        ...ph('practice', gen('safe', 6), gen('free', 6), tf('You only need to check whether the piece you just moved is safe.', false, 'Moving a piece can also unprotect something else. The routine is: the piece I moved, what else I left loose, then their forcing moves.')),
      ],
    }),
  ],
};

// =====================================================================================================
// Checks, captures, threats
// =====================================================================================================
export const cct: Unit = {
  id: 'f-cct',
  title: 'Checks, captures, threats',
  blurb: 'The scan for both sides, until it is automatic.',
  track: 'foundations',
  cat: 'safety',
  stage: 0,
  lessons: [
    lesson({
      id: 'fnd-cct',
      title: 'Checks, captures, threats',
      blurb: 'The five-second scan before every move.',
      mins: 9,
      skill: 'checks',
      tags: ['missed_win', 'missed_mate', 'hung_piece'],
      intro: "Most games at our level aren't decided by deep calculation. They're decided by something somebody didn't see. This routine catches most of it.",
      rule: 'Look at checks, captures and threats, yours first and then theirs.',
      habit: 'Before every move in your next game, name one check, one capture and one threat they could play. If there is none, say "none" and move.',
      recap: 'Checks, captures, threats: scan them for you, then for your opponent. | Forcing moves come first because they limit what your opponent can do. | The routine takes five seconds and catches most blunders.',
      steps: [
        ...ph(
          'example',
          txt(
            'Three questions, every move',
            'Before you play anything, ask: what are **my checks**, **my captures**, **my threats**? Then ask the same about your opponent. Forcing moves go first because they leave the other side fewer choices.\n\nHere White has a check, a capture and a threat on the board. The green arrow is a capture that is also check.',
            { fen: SCHOLAR, arrows: [{ from: 'h5', to: 'f7', c: 'g' }, { from: 'h5', to: 'e5', c: 'b' }], marks: { f7: 'r' } },
          ),
        ),
        ...ph(
          'guided',
          shot(pos('e4 e5 Qh5 Nc6 Bc4 Nf6'), 'Qxf7#', 'A capture with check that cannot be answered is mate. When you have a forcing move, look at it first.', { prompt: 'White to move. Checks first.', hint: 'Is there a capture that gives check? Count what protects f7.' }),
        ),
        ...ph(
          'practice',
          shot(pos('f3 e5 g4'), 'Qh4#', 'A check nobody can answer is checkmate. White\'s pawn moves left the diagonal wide open.', { prompt: 'Black to move. Checks first.', hint: 'The white king has no pawn cover on the diagonal h4-e1. What does a queen on h4 reach?' }),
          shot(LOOSE_N, 'Nxe5', 'Captures second: the knight on e5 has no protector, so taking it is free.', { prompt: 'White to move. No mate here, so captures next.', hint: 'Which of their pieces has no friend protecting it?' }),
          tf('When you scan checks, captures and threats, you only need to look at your own.', false, 'Their forcing moves matter just as much. Half of all hung pieces come from missing a reply, not from missing a plan.'),
          gen('checks', 6),
          gen('free', 4),
        ),
      ],
    }),

    lesson({
      id: 'fnd-threats',
      title: 'What does my opponent want?',
      blurb: 'Read their last move before you plan yours.',
      mins: 9,
      tags: ['allowed_mate', 'hung_piece'],
      intro: "Here's a habit that separates players quickly: before you make your move, work out why your opponent made theirs. Very often, their last move comes with a threat.",
      rule: 'Their threat comes before your plan.',
      habit: 'After each opponent move ask "what does that move attack now that it did not before?"',
      recap: 'Ask what their last move attacks. | If there is a threat, your plan waits: stop the threat first. | A good defence often develops a piece or attacks something as well.',
      steps: [
        ...ph(
          'example',
          txt(
            'Why did they play that?',
            'White has just played Qh5. Why? Because the queen and the bishop on c4 both aim at f7, which only the king guards. If you ignore that, the game ends in two moves.\n\nEvery opponent move has a reason. Spend three seconds finding it.',
            B(pos('e4 e5 Bc4 Nc6 Qh5'), 'r:h5f7 r:c4f7', 'y:f7'),
          ),
        ),
        ...ph(
          'guided',
          mv(pos('e4 e5 Bc4 Nc6 Qh5'), 'g6', 'f7 was attacked twice and defended once. Qe7 adds a defender and g6 kicks the queen away; both stop the threat and do something useful.', {
            prompt: 'Black to move. What does White threaten?',
            think: think('What is White threatening?', ['Qxf7, checkmate', 'Qxe5, winning a pawn', 'Nothing yet'], 0, 'Yes. f7 is attacked by the queen and the bishop and defended only by the king. The king cannot take a protected queen.'),
            hint: 'Count the attackers on f7, then the defenders. Which side has more?',
            wrong: { Nf6: 'After Nf6 White plays Qxf7#. The knight attacks the queen, but a checkmate ends the game before anything else matters.' },
            rule: 'Their threat comes before your plan.',
          }),
        ),
        ...ph(
          'practice',
          mv(pos('e4 e5 Qh5'), 'Nc6', 'The queen came out early. Developing a piece that also protects e5 is the easy answer, and the queen will have to keep moving.', { prompt: 'Black to move. White\'s queen is out early. Develop with a purpose.', hint: 'Which developing move also protects the pawn on e5?', rule: 'Their threat comes before your plan.' }),
          mv(pos('e4 e5 Qh5 Nc6 Bc4'), 'g6', 'The same threat as before. Kick the queen with g6 or defend f7 with Qe7.', { prompt: 'Black to move. What is White up to now?', hint: 'f7 again. How many attackers, how many defenders?', wrong: { Nf6: 'It looks like it attacks the queen, but Qxf7# is mate on the spot.' } }),
          mv(pos('e4 e5 Qh5 Nc6 Bc4 g6 Qf3'), 'Nf6', 'Qf3 and Bc4 both point at f7 again. The knight on f6 blocks the queen\'s line and develops a piece. Defend with tempo.', { prompt: 'Black to move. Same square again.', hint: 'Which piece can block the line from the queen to f7 and develop at the same time?' }),
          gen('loose', 6),
          tf('If you cannot see a threat, you can ignore your opponent\'s last move.', false, 'Spend a few seconds working out what changed. A move that looks quiet can open a line or add an attacker.'),
        ),
      ],
    }),
  ],
};
