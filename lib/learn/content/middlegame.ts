// Middlegame ideas. Where a move is asked for, Stockfish checks it. The "which plan?" and "good or bad?" quizzes
// without a move are the coach's own judgement about standard ideas (the validator checks only that they are well-formed).
import { B, choice, lesson, mv, o, ph, pos, tf, txt } from '../build.ts';
import type { Unit } from '../types.ts';
import { gameFen } from './games.ts';

const OUT = '6k1/pp4pp/2p5/8/3P4/5N2/PP3PPP/6K1 w - - 0 1'; // Ne5
const SEV = 'r5k1/pp3ppp/8/8/8/8/PP3PPP/3RR1K1 w - - 0 1'; // Rd7
const OPEN = '5rk1/pp3ppp/8/8/8/8/PP3PPP/3RR1K1 w - - 0 1'; // Re7 / Rd7
const ISO = '3r2k1/pp3ppp/8/3p4/8/8/PP3PPP/3RR1K1 w - - 0 1'; // Rxd5
const BAD_B = '6k1/pp3ppp/4p3/3pP3/3P4/8/PP3PPP/2B3K1 w - - 0 1';
const TRADE = '3r2k1/pp3ppp/2pq4/8/3Q4/4N3/PP3PPP/3R2K1 w - - 0 1'; // Qxd6
const PROP = pos('e4 e5 Nf3 d6 Bc4 Bg4');
const CARLS = pos('d4 d5 c4 e6 Nc3 Nf6 cxd5 exd5 Bg5 Be7 e3 O-O Bd3 Nbd7 Nge2 Re8 O-O Nf8');

const mk = (id: string, title: string, blurb: string, intro: string, rule: string, habit: string, recap: string, tags: string[], steps: Parameters<typeof lesson>[0]['steps']) =>
  lesson({ id, title, blurb, mins: 10, intro, rule, habit, recap, tags, steps });

export const midBishop: Unit = {
  id: 'b-middlegame',
  title: 'Middlegame basics',
  blurb: 'Piece activity, open files and weak pawns: how to improve your position when there is no tactic.',
  track: 'middlegame',
  cat: 'plan',
  stage: 2,
  lessons: [
    mk(
      'mid-pieces',
      'Good pieces, bad pieces and outposts',
      'Improve your worst piece, and find squares nobody can chase you from.',
      'When there is no tactic, a simple question gives you a move: which of my pieces is doing the least? Make it better. Often the answer is a bad bishop or a knight that has no good square.',
      'Improve your worst-placed piece.',
      'Before each quiet move, rank your pieces from most to least active and move the worst one.',
      'A bishop blocked by its own pawns on the same colour is a bad bishop. | An outpost is a square deep in the enemy half that no enemy pawn can attack: a knight there is a monster. | Ask which piece is worst and where it would be best.',
      ['missed_win'],
      [
        ...ph(
          'example',
          txt('The outpost', 'The knight on f3 can go to **e5**. No black pawn can ever attack that square (there are no black pawns on the d- or f-files), and the white pawn on d4 supports it. A knight on an outpost like this cannot be chased away.', B(OUT, 'g:f3e5', 'y:e5')),
          txt('The bad bishop', 'White\'s pawns on d4 and e5 stand on dark squares, and the bishop on c1 also moves on dark squares. It is hemmed in by its own pawns: a **bad bishop**. The black bishop would be a **good** one, because its pawns are on the other colour.', B(BAD_B, 'r:c1d2', 'y:d4 y:e5')),
        ),
        ...ph('guided', mv(OUT, 'Ne5', 'The knight reaches a square that no pawn can attack, supported by the d4 pawn. It controls the centre and eyes the weak c6 and f7 squares.', { prompt: 'White to move. Where does the knight belong?', hint: 'Look for a central square no black pawn can attack.' })),
        ...ph(
          'practice',
          choice('Which of White\'s pieces is the "bad" one?', [o('The bishop on c1', true, 'It is hemmed in by pawns on dark squares: its own colour.'), o('The king on g1', 'The king is fine at home in this kind of position.'), o('The pawn on e5', 'The pawn is not a piece, and it is well placed.')], 'Which piece is blocked by its own pawns?', B(BAD_B, undefined, 'y:c1')),
          choice('What makes e5 an outpost for the knight?', [o('No enemy pawn can attack it and one of our pawns supports it', true, 'Without pawn attackers, only pieces can challenge the knight.'), o('It is in the centre', 'Being central helps, but the key is that pawns cannot chase the knight.'), o('It is next to the king', 'The king is irrelevant.')], 'Who could chase the knight away?', B(OUT, undefined, 'y:e5')),
          tf('A bishop is bad if its own pawns stand on the same colour of square.', true, 'Yes. The pawns block it, and the bishop has little to attack.', B(BAD_B)),
          tf('You should only move a piece when you have found a tactic.', false, 'Most of the game is quiet moves that improve the worst piece. Look for improvement, not just tactics.'),
          choice('You have no tactic. What is a good way to choose a move?', [o('Find your worst-placed piece and improve it', true, 'It is a reliable rule that works in nearly every middlegame.'), o('Push a pawn', 'Pawn moves cannot be taken back. Improve pieces first.'), o('Trade queens', 'Not without a reason.')], 'What does your position need?'),
          choice('A knight on the rim (a-file or h-file) usually...', [o('has few squares and does little', true, 'On the rim it reaches fewer squares, which is why it is "dim".'), o('is strongest there', 'It is the opposite.'), o('wins a pawn', 'No, it just wastes a tempo.')], 'Count its squares.'),
        ),
      ],
    ),
    mk(
      'mid-files',
      'Open files and the seventh rank',
      'Rooks belong on open lines, and the seventh rank is the dream square.',
      'Rooks are blind in a crowded position and deadly on an open line. Put them where the pawns are gone, and a rook on the seventh rank can win the game on its own.',
      'Put your rooks on open files, and look for the seventh rank.',
      'Each time a file opens, ask whether one of your rooks can use it first.',
      'An open file has no pawns of either colour: a rook there controls it. | A rook on the seventh rank attacks pawns from behind and traps the king on the back rank. | Double your rooks on the open file to make the pressure count.',
      ['missed_win'],
      [
        ...ph(
          'example',
          txt('The seventh rank', 'A rook that reaches the opponent\'s second rank (your seventh) attacks the pawns on b7 and f7 and shuts the king in. With a second rook behind it, the pressure is usually decisive.', B(SEV, 'g:d1d7', 'y:b7 y:f7')),
        ),
        ...ph('guided', mv(SEV, 'Rd7', 'The rook lands on the seventh rank, attacking the pawns on b7 and f7. The second rook on e1 supports the invasion.', { prompt: 'White to move. The d-file is open.', hint: 'Which square on the seventh rank can your rook reach?' })),
        ...ph(
          'practice',
          mv(OPEN, ['Re7', 'Rd7'], 'Either rook can step to the seventh rank. A rook there attacks the pawns and ties Black\'s pieces down.', { prompt: 'White to move. Find the invasion.', hint: 'The seventh rank is the target.' }),
          choice('Why is a rook on the seventh rank so strong?', [o('It attacks the pawns from behind and cuts off the king', true, 'The pawns there are hard to defend and the king is shut in.'), o('It is closer to the king', 'Distance is not the point: it is the targets.'), o('It cannot be captured', 'It can be. It is strong because of what it attacks.')], 'What stands on the second rank in the enemy camp?', B(SEV, undefined, 'y:b7 y:f7'), { reasoning: true }),
          tf('Rooks are best on files that are full of pawns.', false, 'They are best on open files, with no pawns to block them.'),
          tf('Two rooks on the same open file support each other and are hard to dislodge.', true, 'Doubling rooks is the standard way to make an open file count.', B(SEV, 'g:e1e7')),
          choice('A file opens. What do you do first?', [o('Place a rook on it before your opponent does', true, 'The first rook on the file controls it.'), o('Move your king there', 'The king should stay safe.'), o('Ignore it', 'You would let the opponent take it.')], 'Who gets the file?'),
          choice('What does "doubling rooks" mean?', [o('Putting both rooks on the same file', true, 'One supports the other, so the file is yours.'), o('Winning two rooks', 'That is a different matter.'), o('Trading rooks', 'Trading is the opposite.')], 'Think of two rooks side by side.'),
        ),
      ],
    ),
    mk(
      'mid-weak',
      'Weak squares and pawn weaknesses',
      'Isolated, doubled and backward pawns, and how to attack them.',
      'Pawns cannot move backward, so every pawn move leaves something behind. The weaknesses it leaves are your targets, and learning to spot them tells you where to attack.',
      'Attack what cannot be defended by a pawn.',
      'Look at their pawns: is any isolated, doubled or backward? Aim your pieces at it.',
      'An isolated pawn has no friendly pawn on either neighbouring file and must be guarded by pieces. | Doubled pawns are weak because they cannot guard each other. | A backward pawn is stuck behind its neighbours; the square in front of it is a hole for your pieces.',
      ['missed_win'],
      [
        ...ph(
          'example',
          txt('The isolated pawn', 'Black\'s pawn on d5 has no pawn on the c- or e-files: it is **isolated**. No pawn can ever defend it, so pieces have to. Attack it and Black\'s pieces are tied to its defence.', B(ISO, 'g:d1d5', 'y:d5')),
        ),
        ...ph('guided', mv(ISO, 'Rxd5', 'The isolated pawn has no pawn to protect it and here nothing else protects it either. Rxd5 wins it for free.', { prompt: 'White to move. Black\'s d-pawn is on its own.', hint: 'Which black pawn is unprotected?' })),
        ...ph(
          'practice',
          choice('What is an isolated pawn?', [o('A pawn with no friendly pawns on the neighbouring files', true, 'It cannot be defended by pawns, so it is a standing target.'), o('A pawn on the edge', 'Edge pawns are not necessarily isolated.'), o('A pawn that cannot move', 'That is a blocked pawn.')], 'Which pawns could defend it?', B(ISO, undefined, 'y:d5')),
          tf('Doubled pawns (two pawns on one file) are usually a weakness.', true, 'They cannot guard each other and control fewer squares.'),
          choice('A pawn is "backward" when...', [o('Its neighbours have advanced past it and it cannot safely move', true, 'The square in front of it is a hole the opponent can use.'), o('It stands on the first rank', 'Pawns cannot stand on the first rank.'), o('It is on the edge', 'That is a rook pawn.')], 'Think about the pawns beside it.'),
          choice('How do you attack a weak pawn?', [o('Aim pieces at it, especially rooks on the file', true, 'The weakness is that only pieces can defend it, so make them work.'), o('Push your own pawns past it', 'That does not attack it.'), o('Ignore it', 'Then you never use the weakness.')], 'What can defend it?'),
          tf('An isolated pawn is always weak and should always be won.', false, 'It is a weakness, but the owner gets active pieces in return. Win it only if the cost is low.'),
          choice('What is a "hole"?', [o('A square no pawn can ever guard, in front of a backward pawn', true, 'Your piece on a hole cannot be chased by pawns.'), o('A missing pawn', 'A hole is a square, not a pawn.'), o('An escape square for the king', 'That is "luft".')], 'Which squares can still be covered by a pawn?'),
        ),
      ],
    ),
    mk(
      'mid-trade',
      'Is this trade good?',
      'Decide which pieces to swap and which to keep.',
      'Every capture asks: should I trade? The answer depends on what the trade leaves behind. Here are some rules of thumb.',
      'Trade your bad pieces and their good ones, and trade when you are ahead.',
      'Before agreeing to a swap, ask what each side is left with.',
      'When ahead in material, trade pieces. When behind, avoid trades. | Trade your bad bishop for their good one. | Keep pieces if you are attacking: you need attackers.',
      ['conversion'],
      [
        ...ph('example', txt('A good trade', 'White is a piece up. Trading queens with Qxd6 removes Black\'s counterplay and leaves White a clear extra piece in a simple position. That is exactly the right moment to trade.', B(TRADE, 'g:d4d6'))),
        ...ph('guided', tf('White is a piece up here. Trading queens with Qxd6 is a good plan.', true, 'Yes. With less material on the board, the extra piece matters more.', B(TRADE, 'g:d4d6'), { claim: { fen: TRADE, san: 'Qxd6', ok: true } })),
        ...ph(
          'practice',
          choice('You are a piece up. What should you do with the queens?', [o('Trade them if you can', true, 'Simple positions favour the side ahead.'), o('Keep them on to attack', 'It is riskier than necessary.'), o('Sacrifice yours', 'Never without a clear reason.')], 'What helps the side that is ahead?'),
          choice('Which trade is usually good?', [o('Your bad bishop for their good bishop', true, 'It improves your position and weakens theirs.'), o('Your good bishop for their bad one', 'That does the opposite.'), o('Your rook for a pawn', 'That costs material.')], 'Which piece is worth keeping?'),
          tf('When you are behind in material, you should look to trade pieces.', false, 'Trades help the side ahead. When behind, keep the pieces on and look for complications.'),
          tf('If you are attacking their king, keeping your attacking pieces on is usually wise.', true, 'An attack needs pieces. Do not trade them without a reason.'),
          choice('Trading pawns (not pieces) when you are ahead is...', [o('usually a mistake, because pawns win endgames', true, 'Keep your pawns, trade the pieces.'), o('always good', 'Your extra pawns are what win the game.'), o('forced', 'It is not forced.')], 'What decides endgames?'),
          choice('Your opponent offers a trade of knights. What do you ask?', [o('What does each side keep, and does it help me?', true, 'The answer decides the trade.'), o('Is the knight valuable?', 'Value is the same: it is the position that matters.'), o('Can I take it?', 'You can, but should you?')], 'Look beyond the points.'),
        ),
      ],
    ),
  ],
};

export const midRook: Unit = {
  id: 'r-middlegame',
  title: 'Plans and attacks',
  blurb: 'Attacking the castled king, using space, making a plan from the imbalances, and prophylaxis.',
  track: 'middlegame',
  cat: 'plan',
  stage: 3,
  lessons: [
    mk(
      'mid-king',
      'Attacking the castled king',
      'Count attackers against defenders, and know the h7 sacrifice.',
      'Attacks on the king are the most exciting part of chess and also the most reliable way to win, as long as you count first. Bring more attackers than there are defenders, and open lines.',
      'Count attackers and defenders near the king before you sacrifice.',
      'Before launching an attack, count how many of your pieces can reach the king and how many defenders it has.',
      'You need more attackers near the king than it has defenders. | Open lines toward the king with pawn moves or sacrifices. | The classic h7 sacrifice works when the bishop and queen aim at h7 and the knight has no defenders.',
      ['allowed_mate', 'missed_mate'],
      [
        ...ph('example', txt('The h7 sacrifice', 'In Lasker\'s famous game the bishop on d3 and queen on h5 both aim at h7, and Black\'s knight on f6 is the only defender. Lasker played **Qxh7+!**: the king has to take, and the knights come in with check after check.', B(gameFen('lasker', 21), 'g:h5h7 g:d3h7', 'y:h7'))),
        ...ph('guided', mv(gameFen('lasker', 21), 'Qxh7+', 'The queen sacrifice drags the king out. The knights on e4 and e5 then deliver check after check. The key was counting: attackers beat defenders.', { prompt: 'White to move. Bishop and queen both aim at h7. Is the sacrifice sound?', hint: 'Count the attackers of h7 and its defenders.' })),
        ...ph(
          'practice',
          choice('What do you do before you start a king attack?', [o('Count your attackers against their defenders', true, 'An attack without enough pieces fails.'), o('Trade queens', 'The queen is usually the best attacker.'), o('Move your king up the board', 'It would be a risk.')], 'How do you know it will work?'),
          tf('A pawn storm against a castled king works best when your own king is still in the centre.', false, 'Do not storm if your king is exposed. Make your own king safe first.'),
          choice('Bishop and queen aim at h7 and the king is castled. What is the idea?', [o('A sacrifice on h7 to open the king', true, 'If there are enough attackers, the sacrifice leads to a mating attack.'), o('Trade queens', 'It removes the attacker.'), o('Castle long', 'Not relevant.')], 'What can the defenders do about it?', B(gameFen('lasker', 21), undefined, 'y:h7')),
          tf('You should always sacrifice on h7 when you see a bishop and queen aimed there.', false, 'Only if the numbers work: enough attackers, and no defender (like a knight on f6) that can take the piece.'),
          choice('Why do you want to open lines near the king?', [o('Open lines let your rooks and queen reach it', true, 'A closed position protects the king.'), o('To trade pawns', 'Pawn trades are not the aim.'), o('To save time', 'Time is not the issue.')], 'What do your pieces need?'),
          choice('How many pieces should you aim to bring to the attack?', [o('More than the number of defenders', true, 'It is a simple count that decides most attacks.'), o('As few as possible', 'You need force.'), o('Only the queen', 'The queen alone rarely mates.')], 'What does the count mean?'),
        ),
      ],
    ),
    mk(
      'mid-space',
      'Space and when to expand',
      'More room means more freedom, but only if you can use it.',
      'Space is an advantage in the middlegame: your pieces have more squares and your opponent\'s are cramped. But grabbing space is a means, not a goal.',
      'Take space when it makes your pieces better and theirs worse.',
      'Before pushing a pawn, ask which of your pieces gets better and which of theirs gets worse.',
      'Space gives your pieces more squares and cramps the opponent. | When cramped, trade pieces to relieve the pressure. | Do not push pawns just to gain space: every pawn move leaves a weakness.',
      ['conversion'],
      [
        ...ph('example', txt('Space and its price', 'A pawn on e5 cramps Black: his pieces cannot use the d6 and f6 squares. But a pawn that advances cannot go back. White has to make sure the pawn is protected, otherwise it becomes a target.', B('6k1/pp3p1p/2p3p1/3pP3/3P4/2P5/PP3PPP/6K1 w - - 0 1', 'g:e5e6', 'y:d6 y:f6'))),
        ...ph(
          'practice',
          choice('What is the main benefit of having more space?', [o('Your pieces have more squares to go to', true, 'More mobility for you, less for them.'), o('You win a pawn', 'Space does not win material directly.'), o('You can castle earlier', 'It has nothing to do with castling.')], 'What does a cramped piece lack?'),
          choice('You are cramped. What is a good idea?', [o('Trade pieces to free your position', true, 'Fewer pieces mean fewer collisions, so the cramped side breathes.'), o('Move more pawns forward', 'That makes the cramp worse.'), o('Keep all the pieces on', 'That keeps you cramped.')], 'How do you get some air?'),
          tf('Pushing a pawn always gains space and is always good.', false, 'A pawn cannot go back, so each push leaves weaknesses behind it. Push only with a purpose.'),
          tf('A pawn chain is easiest to attack at its base.', true, 'Attack the pawn at the bottom of the chain: when it falls, the rest collapses.'),
          choice('Which squares does a pawn on e5 take from the opponent?', [o('d6 and f6', true, 'A pawn attacks the two squares diagonally in front of it.'), o('e6 only', 'That is the square in front, not attacked by the pawn.'), o('d5 and f5', 'Those are beside it.')], 'Think of how a pawn captures.'),
          choice('Why should a space advantage be used actively?', [o('Otherwise the opponent can undermine your pawns', true, 'A big centre is a target. Use the space to attack.'), o('Space wins by itself', 'It does not.'), o('The pawns will disappear', 'They will not, but they may be attacked.')], 'What happens to unused space?'),
        ),
      ],
    ),
    mk(
      'mid-plan',
      'Making a plan: look at the imbalances',
      'A simple list that tells you where to play.',
      'Players at every level say "I did not know what to do". The fix is a short list called the imbalances: the ways your position differs from your opponent\'s. A good plan builds on the ones you have.',
      'Find what is different, then play where it favours you.',
      'In a quiet position, write down three imbalances and pick a plan that uses the best of yours.',
      'Imbalances: bishop pair, pawn structure, space, king safety, open files and who has the more active pieces. | Ask which imbalance is in your favour and push that. | A plan has a target: a weak pawn, an open file or the king.',
      ['conversion', 'time_trouble'],
      [
        ...ph('example', txt('The imbalance list', 'Look at the position and ask: **Who has the bishop pair? Whose pawn structure is healthier? Who has more space? Whose king is safer? Which files are open? Whose pieces are more active?** Pick the answer that favours you, and make that your plan.', B(CARLS, undefined, undefined, 'w'))),
        ...ph(
          'practice',
          choice('White has the bishop pair and an open centre. What is a good plan?', [o('Open the position further so the bishops are strong', true, 'Bishops love open lines, so use the pair.'), o('Close the centre with pawns', 'That blunts the bishops.'), o('Trade both bishops', 'That throws the advantage away.')], 'What do bishops need?'),
          choice('Black has an isolated pawn on d5. What is a good plan for White?', [o('Trade pieces and blockade d4, then attack the pawn', true, 'Without the pieces, the isolated pawn is just weak.'), o('Avoid all trades', 'The isolated pawn gets its activity from pieces on the board.'), o('Push the h-pawn', 'It does not address the target.')], 'Where are the weaknesses?', B(ISO, undefined, 'y:d5')),
          tf('A plan must be a deep calculation to be any good.', false, 'A plan is a direction: improve a piece, attack a weakness. It needs little calculation.'),
          choice('Your king is safer and you are slightly better. What is the best attitude?', [o('Use that safety to play actively on the other side', true, 'A safe king lets you take risks elsewhere.'), o('Play only safe moves forever', 'It wastes the advantage.'), o('Offer a draw', 'Not yet!')], 'What does a safe king give you?'),
          choice('Which of these is an imbalance?', [o('One side has the bishop pair', true, 'It is a lasting difference that can guide your plan.'), o('It is White\'s move', 'That is a tempo, not an imbalance.'), o('Both sides have castled', 'It is similar on both sides.')], 'Think of lasting differences.'),
          tf('Making a plan is more important than finding every tactic.', false, 'Tactics decide games too. The plan guides your quiet moves, and the tactic check keeps you safe.'),
        ),
      ],
    ),
  ],
};

export const midQueen: Unit = {
  id: 'q-middlegame',
  title: 'Prophylaxis',
  blurb: 'Ask what your opponent wants, and stop it before it happens.',
  track: 'middlegame',
  cat: 'plan',
  stage: 4,
  lessons: [
    mk(
      'mid-proph',
      'Prophylaxis: what does my opponent want?',
      'Stopping a threat before it exists.',
      'The best players spend half of their thinking time on their opponent\'s plan. Prophylaxis means a quiet move that takes away what the opponent wants. It is the habit that turns a good player into a hard one to beat.',
      'Ask what your opponent wants, and take it away.',
      'Before every quiet move, ask "if I pass, what does my opponent do?" Then stop it.',
      'Prophylaxis: a move that prevents the opponent\'s idea before it starts. | Ask what their last move threatens and what their next move would be. | A prophylactic move often also improves your position.',
      ['allowed_mate', 'hung_piece'],
      [
        ...ph('example', txt('If I pass, what happens?', 'Black has just pinned the knight on f3 with ...Bg4. If White does nothing, Black will take on f3 and damage the structure, or add pressure with ...Nd7 and ...Nf6. **h3** asks the bishop a question at once and takes the g4 square away.', B(PROP, 'g:h2h3 r:g4f3', 'y:g4'))),
        ...ph('guided', mv(PROP, ['d4', 'h3'], 'White deals with the pin and takes space. h3 asks the bishop what it wants, and d4 hits the centre. Both stop Black from getting a comfortable position.', { prompt: 'White to move. Black has pinned your knight. What does Black want?', hint: 'If you pass, what will the bishop do?' })),
        ...ph(
          'practice',
          choice('What does "prophylaxis" mean?', [o('A move that prevents the opponent\'s plan', true, 'You stop the idea before it begins.'), o('A sacrifice', 'That is something else.'), o('A mating attack', 'That is attack, not prevention.')], 'Think of "prevention".'),
          choice('What question does prophylactic thinking start with?', [o('"If I pass, what does my opponent do?"', true, 'The answer tells you what to prevent.'), o('"What is the biggest piece I can take?"', 'That is greed, not prophylaxis.'), o('"How do I trade?"', 'That is another question.')], 'What does their next move threaten?'),
          tf('A prophylactic move can also improve your own position.', true, 'The best ones do both: stop their plan and help yours.'),
          tf('You should only think about your opponent\'s plan when you are losing.', false, 'It is a habit for every move, especially when you are better.'),
          choice('Black pins your knight on f3 with ...Bg4. Which is a prophylactic reply?', [{ text: 'h3', san: 'h3', ok: true, why: 'It asks the bishop a question and takes away g4.' }, { text: 'a3', san: 'a3', why: 'It does nothing about the pin or the bishop.' }], 'What does the pin allow?'),
          choice('Why is prophylaxis useful when you feel you are better?', [o('It stops the opponent from getting counterplay', true, 'A calm advantage can be thrown away by ignoring their ideas.'), o('It loses time', 'It costs a move but saves many more.'), o('It forces a draw', 'It does not.')], 'What helps the better side?'),
        ),
      ],
    ),
  ],
};

export const kingReview: Unit = {
  id: 'king-review',
  title: 'Maintenance',
  blurb: 'At 1800 the work is keeping the basics sharp and reviewing your own games.',
  track: 'middlegame',
  cat: 'plan',
  stage: 5,
  lessons: [
    lesson({
      id: 'king-sharp',
      title: 'Keep the basics sharp',
      blurb: 'A mixed warm-up of the fundamentals that still win and lose games.',
      mins: 10,
      skill: 'safe',
      tags: ['hung_piece', 'missed_win'],
      intro: 'Strong players do not stop practising the basics, they keep them sharp. Here is a mixed warm-up: piece safety, free pieces, mates in one and a pawn ending.',
      rule: 'Strong players still do the blunder check.',
      habit: 'Do a short mixed warm-up before a long playing session, and review one of your own games each week.',
      recap: 'The basics (safety, checks, captures, threats) never stop mattering. | Review your own games: that is where your specific habits show up. | A little practice often keeps skills automatic.',
      steps: [
        ...ph('example', txt('Warm up', 'This is a mixed set: loose pieces, free captures, mates in one and a pawn ending. Do not hurry; the aim is clean first-try answers.')),
        ...ph('practice', { t: 'gen', skill: 'safe', n: 3 }, { t: 'gen', skill: 'free', n: 3 }, { t: 'gen', skill: 'mate1', n: 3 }, { t: 'gen', skill: 'kpk', n: 2 }),
      ],
    }),
  ],
};
