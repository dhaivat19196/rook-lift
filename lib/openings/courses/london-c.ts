// London System, chapters 5-8 (vs ...Bg4, King's Indian setups, Grunfeld-style ...d5 with ...g6, the Dutch).
import { chapter, opt, plan } from '../course.ts';
import { OPEN } from './london-a.ts';

export const ch5 = chapter({
  id: 'bg4',
  title: 'Against ...Bg4: ask the bishop a question',
  blurb: 'Black pins or hits your knight early. Make luft with h3 and trade on your terms.',
  coach: `A bishop on g4 wants to take your knight on f3 and wreck your structure. You have a lovely answer: h3. The bishop has to decide right now, and whichever way it goes you keep a comfortable position. The ideas are the same all game: h3 early, Ne5 when the bishop leaves, and recapture with the queen if it takes on f3.`,
  tip: 'Ask the bishop a question with h3, and do not fear ...Bxf3: the queen takes back and the bishop pair is yours.',
  src: `${OPEN}
 Bg4 {Black develops the bishop outside the pawn chain at once.}
 3.h3 {Ask the bishop a question. It has to decide now, and every answer helps you. @a g:h2h3 g:h3g4}
 Bf5 {The bishop retreats and mirrors your London.}
 (Bh5 {The bishop keeps the pin idea.}
  4.c4 {Strike at d5 while the bishop is offside. The pawn on d5 is attacked twice. @a g:c4d5 @x g4: g4 chases the bishop but it is a move too slow: after Bg6 you have given Black time to hit the centre.}
  e6 {Black supports d5.}
  5.cxd5 {Take. Black has to recapture and loses time.}
  Qxd5 {Black recaptures with the queen.}
  6.Nc3 {Develop with tempo. The queen must move again.}
  Bb4 {Black pins the knight and offers to trade.})
 (Bxh3? {Black grabs a pawn, but it costs him a whole bishop.}
  4.Nxh3 {Take back with the knight. The bishop is gone for a pawn and your knight is fine on h3.}
  Nf6 {Black develops.}
  5.e3 {Solid and safe.})
 4.e3 {Solid. The London structure is back and the h3 pawn gave you a free move.}
 e6 {Black solidifies.}
 5.Nf3 {Develop and guard d4.}
 Nf6 {Black develops.}
 6.Bd3 {Challenge his bishop.}
 Bxd3 {Black takes.}
 7.Qxd3 {Recapture with the queen, as in the mirror London.}
 Bd6 {Black offers the dark bishops.}
 8.Bxd6 {Take. With the light bishops gone this is safe.}
 cxd6 {Black recaptures.}
 9.O-O {Castle and complete the set-up. @d You are in the same structure as against ...Bf5. Develop, castle, and use the fact that you moved first.}`,
  plans: [
    plan('p1', 'd4 d5 Bf4 Bg4', 'Black’s bishop jumped out to g4. Which move asks it a question?', [
      opt('h3. The bishop must decide at once', true, 'Yes. After h3 the bishop must retreat or take on f3 later, and you have gained a tempo.', 'h3', 'g:h2h3'),
      opt('f3. Push the pawn to hit it', false, 'It does hit the bishop, but it weakens your king and takes the best square from your knight. h3 is cleaner.'),
      opt('Nbd2, ignoring it', false, 'Then the bishop keeps its options and you have not asked it anything. Ask the question first.'),
    ], 'When a bishop jumps out early, ask it a question with a pawn.'),
    plan('p2', 'd4 d5 Bf4 Nf6 e3 Bg4 Nf3 e6', 'Black pins your knight. How do you keep a comfortable game?', [
      opt('Nbd2. Support the knight and be ready to meet ...Bxf3 with Nxf3', true, 'Yes. If ...Bxf3 you recapture with the knight and keep the pawn structure. Nothing is weak.', 'Nbd2'),
      opt('Bg5, pinning back', false, 'You are giving up the London bishop to chase pins. Keep to the plan: Nbd2 and h3.'),
      opt('Ignore it and play c4 at once', false, 'You can, but it loosens d4 and Black’s bishop captures with tempo. A calm developing move is better.'),
    ], 'Support your knight and be ready to recapture.'),
    plan('p3', 'd4 d5 Bf4 Bg4 h3 Bh5', 'The bishop retreats to h5. What is the most accurate way to use the moment?', [
      opt('c4. Hit d5 while the bishop is offside', true, 'Yes. The bishop is far from the centre, so d5 is under real pressure. Take advantage of the loose bishop at once.', 'c4', 'g:c4d5'),
      opt('g4. Chase the bishop again', false, 'It looks natural, but g4 weakens your own king, and after ...Bg6 Black has time to strike at the centre. The pressure on d5 is stronger.', 'g4'),
      opt('Nf3, allowing the pin', false, 'Then ...Bxf3 wrecks your structure and the bishop pair is gone. Take space instead of walking into the pin.'),
    ], 'Use the moment when his bishop is offside: hit the centre.'),
    plan('p4', 'd4 d5 Bf4 Nf6 e3 Bg4 Nf3 e6 Nbd2 Bd6', 'Black offers a trade of dark bishops. What is the best reply?', [
      opt('Bg3. Keep the bishop. If ...Bxg3 then hxg3', true, 'Right. Your bishop is a good piece, and Black has to spend a move to take it. The h-file would be yours.', 'Bg3', 'g:f4g3'),
      opt('Bxd6. Trade now', false, 'It simplifies, but you have given up your good bishop for his, and Black keeps his light bishop, which is stronger here.'),
      opt('Bg5. Pin the knight in return', false, 'Black simply plays ...Bxf3 and the pin does nothing.'),
    ], 'When Black offers a trade of your London bishop, step back and keep it.'),
  ],
  traps: [],
});

export const ch6 = chapter({
  id: 'kid',
  title: 'Against the King’s Indian set-up',
  blurb: '...g6, ...Bg7 and ...d6: the London stays the same, with h3 and an e4 plan.',
  coach: `Against ...g6 and ...Bg7 your London does not change much. Your bishop stays on f4 with h3 as a retreat, your pawns stay on e3 and c3 or c4, and you aim for e4. Black's bishop on g7 looks at your queenside, so keep an eye on b2 and d4 as you go.`,
  tip: 'Play h3 so the bishop has a retreat, develop with e3, Nf3, Be2 and castle, then look for c4, Nc3 and e4.',
  src: `1.d4 {The London starts with the centre pawn.}
 Nf6 {Black develops the knight first.}
 2.Bf4 {The London bishop comes out before e3.}
 g6 {Black prepares a fianchetto.}
 3.e3 {Solid. The bishop on f4 now has pawn support behind it.}
 Bg7 {The bishop eyes the long diagonal.}
 4.Nf3 {Develop and guard d4.}
 O-O {Black castles.}
 (d6 {Black plays the King's Indian set-up.}
  5.Be2 {Develop the bishop and prepare to castle.}
  Nh5 {Black attacks your bishop.}
  6.Bg5 {Step out of the way and make a small threat. The h5 knight is awkward.})
 (c5 {Black hits d4 at once.}
  5.Be2 {Develop and keep it simple.}
  cxd4 {Black takes.}
  6.exd4 {Recapture with the pawn. Now you have a healthy centre and an open e-file.}
  d6 {Black prepares his own set-up.}
  7.O-O {Castle: your king is safe.})
 5.Be2 {Develop the bishop and prepare to castle.}
 d6 {Black prepares ...c5 and ...Nc6.}
 6.h3 {Give the bishop the h2 retreat square, and stop any ...Ng4 idea.}
 Nbd7 {Black develops the knight.}
 (c5 {Black hits d4.}
  7.c3 {Support d4 and give the queen a diagonal.}
  Qb6 {Black hits b2.}
  8.Qb3 {Offer the exchange of queens and defend b2.})
 7.O-O {Castle. Your king is safe.}
 b6 {Black prepares ...Bb7.}
 (e5 {Black strikes in the centre a move too soon.}
  8.dxe5 {Take. Black has no easy way to recover the pawn.}
  Ne4 {Black takes the square.}
  9.exd6 {Take the second pawn. @d If Black plays ...e5 when you are ready for it, take on e5.})
 8.c4 {Claim the centre with the c-pawn too, and prepare Nc3 and a later e4.}
 Bb7 {Black develops.}
 9.Nc3 {Develop and increase the pressure on d5 and e4.}
 c5 {Black hits d4.}
 10.d5 {Take space and shut the long diagonal's friend on b7. The pawn on d5 cramps Black's pieces.}
 Nh5 {Black attacks your bishop.}
 (e6? {Black tries to break the bind at once and loses a pawn.}
  11.dxe6 {Take. After ...fxe6 the d6 pawn is weak.}
  fxe6 {Black recaptures.}
  12.Bxd6 {The bishop takes the weak pawn and Black is in trouble.})
 11.Bh2 {The retreat square from h3. The bishop keeps its place on the diagonal. @d Against the King's Indian set-up: h3, e3, Be2, castle, then c4, Nc3, d5 and e4.}`,
  plans: [
    plan('p1', 'd4 Nf6 Bf4 g6 e3 Bg7 Nf3 O-O Be2 d6', 'Why is h3 such a useful move for you here?', [
      opt('It gives the bishop a retreat on h2 and stops ...Ng4', true, 'Yes. After h3 the bishop on f4 can go to h2 if Black plays ...e5 or ...Nh5, and the knight cannot jump to g4.', 'h3'),
      opt('It prepares h4-h5 at once', false, 'That is a possible later plan, but the first job of h3 is practical: a retreat square and no ...Ng4.'),
      opt('It wins a tempo on the bishop', false, 'No piece is attacked by h3 here. It is a quiet, useful move.'),
    ], 'A small useful move: h3 gives the bishop room.'),
    plan('p2', 'd4 Nf6 Bf4 g6 e3 Bg7 Nf3 O-O Be2 d6 h3 Nbd7 O-O b6', 'Which plan fits this position best?', [
      opt('c4, Nc3 and later e4, taking space in the centre', true, 'Yes. Your pieces are all on good squares. Space in the centre makes Black’s fianchetto less effective.'),
      opt('h4-h5, attacking the king at once', false, 'The pawn attack can work, but here your kingside pieces are not ready, and Black can strike in the centre first. Develop, then decide.'),
      opt('Swap the bishops with Bxd6', false, 'Bxd6 only wins a pawn if d6 is undefended. It is defended, and you would give up your good bishop for nothing.'),
    ], 'Take space in the centre: c4, Nc3, e4.'),
    plan('p3', 'd4 Nf6 Bf4 g6 e3 Bg7 Nf3 O-O Be2 d6 h3 c5', 'Black hits d4. Which pawn move supports it?', [
      opt('c3. It supports d4 and gives the queen a diagonal', true, 'Yes. c3 holds the centre. If Black plays ...Qb6, answer with Qb3.', 'c3', 'g:c3d4'),
      opt('dxc5. Take the pawn', false, 'It opens the long diagonal for Black’s bishop and your pawn chain is broken. Hold the centre.'),
      opt('Nc3. Develop and support d5 later', false, 'The pawn on d4 is attacked twice. Nc3 does not protect it, so it hangs. Count attackers first.'),
    ], 'Support the centre pawn with c3 before you develop the knight.'),
    plan('p4', 'd4 Nf6 Bf4 g6 e3 Bg7 Nf3 O-O Be2 d6 h3 Nbd7 O-O e5', 'Black plays ...e5 at last. What do you do?', [
      opt('dxe5. Black has no good way to get the pawn back', true, 'Right. After dxe5 dxe5? Bxe5 wins a pawn, and ...Ne4 can be met by exd6. The e5 push does not work yet.', 'dxe5'),
      opt('Bxe5. Take with the bishop', false, 'dxe5 comes first: take with the pawn so that Black’s recapture can be met by the bishop on f4.'),
      opt('Ignore it and play c4', false, 'Black plays ...exf4 and wins your bishop. Always answer a pawn that attacks a piece.'),
    ], 'When a pawn attacks your bishop, look at capturing it.'),
  ],
  traps: [],
});

export const ch7 = chapter({
  id: 'grunfeld',
  title: 'Against ...g6 with ...d5 (Grünfeld style)',
  blurb: 'Black fianchettoes and still plays ...d5. Your solid set-up works; meet ...c5 with c3.',
  coach: `When Black combines ...g6 with ...d5, the centre is closed enough that your London structure is safe. Develop with e3, Nf3, Be2 and h3, and answer ...c5 with c3. Black's bishop on g7 bites at d4, so make sure the pawn is always protected.`,
  tip: 'Keep d4 protected (e3, c3, Nf3), play h3 and Be2, and meet ...c5 with c3.',
  src: `1.d4 {The London starts with the centre pawn.}
 Nf6 {Black develops the knight first.}
 2.Bf4 {The London bishop comes out before e3.}
 g6 {Black prepares a fianchetto.}
 3.e3 {Solid and sensible.}
 Bg7 {The bishop eyes d4.}
 4.Nf3 {Develop and guard d4.}
 d5 {Black takes the centre: a Grünfeld-style set-up.}
 5.Be2 {Develop and prepare to castle.}
 O-O {Black castles.}
 (c5 {Black hits d4 at once.}
  6.c3 {Support d4.}
  O-O {Black castles.}
  7.h3 {Make luft for the bishop.})
 (Ne4 {Black jumps in with the knight.}
  6.Nbd2 {Challenge the knight. It cannot stay on e4.}
  c5 {Black hits d4.}
  7.c3 {Support d4.})
 6.h3 {Give the bishop a retreat and stop ...Ng4.}
 c5 {Black hits d4.}
 7.c3 {Support d4 and keep the structure solid.}
 Nc6 {One more attacker on d4.}
 (b6 {Black prepares ...Bb7.}
  8.Nbd2 {Develop the knight.}
  Bb7 {Black develops.}
  9.O-O {Castle: your king is safe.})
 (Qb6 {Black hits b2.}
  8.Qb3 {Offer a queen trade and defend b2.}
  Nc6 {Black develops.}
  9.Nbd2 {Develop.})
 8.Nbd2 {Develop with a plan: Ne5, Qb3 or e4 are coming.}
 Nd7 {Black prepares ...e5.}
 (Re8 {Black prepares ...e5.}
  9.O-O {Castle: your king is safe.}
  Nd7 {Black prepares ...e5.}
  10.Bh2 {Keep the bishop out of trouble.})
 9.O-O {Castle. Now you are ready for any central pawn break by Black.}
 e5 {Black strikes in the centre.}
 10.dxe5 {Take. Black has to recapture with the knight, and your bishop is safe on h2. @d Against a Grünfeld-style set-up, d4 must always be protected and the bishop needs its retreat on h2.}`,
  plans: [
    plan('p1', 'd4 Nf6 Bf4 g6 e3 Bg7 Nf3 d5 Be2 O-O h3 c5', 'Black hits d4 with ...c5. What is the right way to hold it?', [
      opt('c3. Support the pawn', true, 'Yes. d4 is attacked by the c5 pawn and the bishop on g7, and defended by e3, Nf3 and now c3. Count and be safe.', 'c3', 'g:c3d4'),
      opt('Nbd2, developing', false, 'Nbd2 does not add a defender to d4. Count: attacked by c5, Bg7 behind it, and Nc6 soon. You need the pawn.'),
      opt('dxc5', false, 'Taking opens the g7-bishop’s diagonal to your queenside and gives away the centre. Support, do not capture.'),
    ], 'Count the attackers on d4 and add a defender with c3.'),
    plan('p2', 'd4 Nf6 Bf4 g6 e3 Bg7 Nf3 d5 Be2 O-O h3 c5 c3 Qb6', 'Black’s queen hits b2. How do you answer?', [
      opt('Qb3. Defend b2 and offer a queen trade', true, 'Yes. Qb3 defends b2 and keeps the pawn chain intact. If Black trades queens, axb3 opens the a-file for your rook.', 'Qb3'),
      opt('Nbd2', false, 'Nbd2 does not guard b2: Black takes it. Always check what the queen is attacking.'),
      opt('Qc2', false, 'Qc2 defends b2 as well, but it blocks the c-pawn’s support and can be harassed by ...Bf5. Qb3 is cleaner.'),
    ], 'When the queen attacks b2, answer with Qb3 (or Qc1) before developing.'),
    plan('p3', 'd4 Nf6 Bf4 g6 e3 Bg7 Nf3 d5 Be2 O-O h3 c5 c3 Nc6 Nbd2 Nd7 O-O', 'Black has prepared ...e5. How do you prepare for it?', [
      opt('Keep the bishop safe with Bh2 or be ready to take on e5 with the pawn', true, 'Right. After ...e5 dxe5 the bishop on f4 may be attacked, so think about the retreat on h2 before Black pushes.'),
      opt('Play e4 first', false, 'e4 is not possible while the e3 pawn blocks it; it also hangs d4 to the bishop. Stay with development.'),
      opt('Capture on c5', false, 'The d4 pawn captures on c5 only if it wins something; here it just opens the long diagonal for Black.'),
    ], 'Before Black can push ...e5, make sure your bishop has a square to go to.'),
    plan('p4', 'd4 Nf6 Bf4 g6 e3 Bg7 Nf3 d5 Be2 O-O h3', 'Why do we play h3 before castling here?', [
      opt('It gives the bishop h2 and stops ...Ng4', true, 'Yes. Both ideas matter: the retreat square keeps the bishop alive after ...Nh5 or ...e5, and the knight cannot jump to g4.'),
      opt('To prepare g4 next', false, 'g4 is a different plan (a pawn storm). Here we keep to a quiet, safe set-up.'),
      opt('To save the pawn on h2', false, 'The pawn on h2 is not attacked in this position. The point is the bishop’s retreat.'),
    ], 'Small moves have a point. h3 is about the bishop’s retreat.'),
  ],
  traps: [],
});

export const ch8 = chapter({
  id: 'dutch',
  title: 'Against the Dutch',
  blurb: '...f5 weakens Black’s king. Develop calmly and keep e5 under control.',
  coach: `The Dutch looks aggressive, but ...f5 weakens e6 and the king's diagonal. Your London is a good fit: Bf4 controls e5, e3 and Nf3 develop, and you can castle without fuss. Watch for ...Ne4 and the Stonewall pawn structure (...d5 with ...f5).`,
  tip: 'Control e5 with the bishop and the knight, castle, and wait for a weakness on e6 or the long diagonal.',
  src: `1.d4 {The London starts with the centre pawn.}
 f5 {The Dutch Defence.}
 2.Bf4 {The bishop controls e5 and the whole diagonal. @a g:f4e5 g:f4b8}
 Nf6 {Black develops.}
 3.e3 {Solid, and it frees the f1 bishop.}
 e6 {Black prepares ...Be7.}
 (g6 {Black plays the Leningrad set-up.}
  4.Nc3 {Develop and prepare a kingside pawn push.}
  Bg7 {The bishop eyes d4.}
  5.h4 {Start the attack at once. Black's pawn on g6 and the bishop on g7 are targets for h5. @a g:h4h5}
  O-O {Black castles.}
  6.h5 {Open the h-file against the castled king.}
  Nxh5 {Black takes the pawn.}
  7.Rxh5 {The rook sacrifice works because the h-file and the queen join the attack.}
  gxh5 {Black takes the rook.}
  8.Qxh5 {The queen takes the pawn and threatens a lot. Black's king is in danger.})
 (d6 {Black prepares a Leningrad-style set-up.}
  4.Nf3 {Develop and guard e5.}
  g6 {Black fianchettoes.}
  5.Be2 {Develop.}
  Bg7 {Black develops.}
  6.O-O {Castle: your king is safe.})
 4.Nf3 {Develop and guard e5.}
 Be7 {Black develops.}
 (d5 {Black builds the Stonewall.}
  5.Bd3 {Develop. The Stonewall has a weakness on e5, and your bishop aims at f5.}
  Bd6 {Black offers a bishop trade.}
  6.O-O {Castle. Black’s bishop on d6 is strong, but you have a safe position.}
  O-O {Black castles.}
  7.c4 {Challenge the centre.})
 5.Be2 {Develop and prepare to castle.}
 O-O {Black castles.}
 6.h3 {Give the bishop a retreat and stop ...Ne4 tricks.}
 b6 {Black prepares ...Bb7.}
 (d6 {Black prepares ...Qe8.}
  7.O-O {Castle: your king is safe.}
  Qe8 {The queen heads for the kingside.}
  8.Bh2 {The bishop avoids any ...e5 tricks.})
 7.O-O {Castle: your king is safe.}
 Bb7 {Black develops.}
 8.c4 {Take space in the centre.}
 Ne4 {Black jumps in with the knight.}
 9.Nc3 {Challenge the knight. @d Against the Dutch, control e5, castle, and take space with c4 once your pieces are out.}`,
  plans: [
    plan('p1', 'd4 f5 Bf4 Nf6 e3 e6 Nf3 Be7', 'Why is the bishop on f4 so well placed against the Dutch?', [
      opt('It controls e5, the key square of the Dutch', true, 'Yes. In the Dutch, Black’s plan is to control e4 with the pawn on f5. Your bishop and knight control e5, which stops ...Ne4 or ...e5 ideas.'),
      opt('It threatens Bxb8', false, 'Nothing is attacked on b8 in this position, and giving up the bishop would help Black.'),
      opt('It prepares a quick Bg3 and h4', false, 'Those are possible later plans, but the main job of the bishop is to control e5.'),
    ], 'Control e5: it is the key square in the Dutch.'),
    plan('p2', 'd4 f5 Bf4 Nf6 e3 e6 Nf3 d5 Bd3', 'Black has built the Stonewall (pawns on d5 and f5). Which square becomes your target?', [
      opt('e5. A strong knight there cannot be driven away by a pawn', true, 'Yes. Black’s pawns on d5 and f5 stop the pawns controlling e5, and your pieces can use it as a base.'),
      opt('h7, with a direct attack', false, 'There is no bishop route to h7 against the pawn on f5, and the rook is not ready. Aim at e5.'),
      opt('d5, by winning it with c4', false, 'The d5 pawn is protected by the e6 pawn and the knight on f6. A direct pawn grab fails.'),
    ], 'Against the Stonewall, e5 is the outpost.'),
    plan('p3', 'd4 f5 Bf4 Nf6 e3 e6 Nf3 Be7 Be2 O-O h3', 'Why is h3 helpful here?', [
      opt('It gives the bishop a retreat to h2 and stops ...Ne4 hitting the bishop on f4', true, 'Yes. After h3, ...Ne4 can be met by Bh2 or Nbd2 without losing time, and Black loses an attractive jump.'),
      opt('It prepares g4 to take the pawn on f5', false, 'g4 is a risky pawn push that weakens your own king. The aim here is quiet.'),
      opt('It is a waiting move', false, 'It is useful, not just waiting: it fixes the bishop’s retreat.'),
    ], 'A quiet move with a purpose: h3 prevents tricks and gives the bishop room.'),
    plan('p4', 'd4 f5 Bf4 Nf6 e3 e6 Nf3 Be7 Be2 O-O h3 b6 O-O Bb7', 'You are ready to play in the centre. Which move is thematic?', [
      opt('c4, taking space and preparing Nc3 and Qb3 or Ne5', true, 'Yes. All your pieces are ready; c4 claims space, and Nc3 and e5-type moves follow.', 'c4'),
      opt('g4, attacking the pawn on f5', false, 'g4 is a wild pawn push. It weakens your king and Black’s ...fxg4 hxg4 opens the h-file against you.'),
      opt('Bg5, pinning the knight', false, 'You would give up the London bishop for a short pin, and Black would simply play ...Be7 or ...Ne4.'),
    ], 'Develop first, then take space.'),
  ],
  traps: [],
});
