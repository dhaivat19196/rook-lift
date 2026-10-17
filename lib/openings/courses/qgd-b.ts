// Queen's Gambit Declined + anti-London, chapters 3-4: the London and other quiet systems, then Colle/Torre/Jobava and flank openings. Black.
import { chapter, opt, plan } from '../course.ts';

export const ch3 = chapter({
  id: 'antilondon',
  title: 'Against the London: ...c5, ...Nc6, ...Bf5',
  blurb: 'Meet 2.Bf4 with ...c5, ...Nc6 and ...Qb6, and develop the c8-bishop outside the pawn chain.',
  coach: `White’s London bishop on f4 leaves the b2 pawn only lightly defended. That is your target. Play ...c5 at once, develop the knight to c6, and use ...Qb6 to pressure b2 so White has to spend time. Get your light-squared bishop out to f5 before you play ...e6, and you will find the London is not nearly as comfortable for White as it looks.`,
  tip: 'Against the London: ...c5, ...Nc6, ...Nf6, ...Bf5 (before ...e6) and ...Qb6 hitting b2.',
  src: `1.d4 {White takes the centre.}
 d5 {You take the centre too.}
 2.Bf4 {The London bishop comes out before ...e6 can block it.}
 c5 {Strike at d4 at once. White’s bishop on f4 leaves b2 loose, so the queen on b6 will become annoying.}
 3.e3 {White supports d4 and opens the f1 bishop.}
 Nc6 {Develop and add pressure on d4.}
 4.c3 {Support d4.}
 Qb6 {Pressure b2 at once. White has to defend the pawn.}
 5.Qb3 {White offers a queen trade.}
 c4 {Gain space and drive the queen back.}
 6.Qc2 {The queen retreats.}
 e5 {The tactical point. If White takes, the bishop on c8 comes out with tempo.}
 7.dxe5 {White takes.}
 Bf5 {Develop with a double attack on the queen and the e5 pawn.}
 8.Qc1 {The queen steps aside.}
 f6 {Hold the extra pawn and keep the centre open.}
 9.Nf3 {White develops.}
 g5 {Win the bishop's tempo.}
 10.Bg3 {The bishop retreats.}
 h5 {The attack begins. @d In the anti-London, push ...c4 to clamp down on b3, and strike with ...e5 when the bishop on c8 can come out with tempo.}`,
  plans: [
    plan('p1', 'd4 d5 Bf4', 'White plays the London bishop. What is the most direct reply?', [
      opt('c5. Strike at d4 while b2 is loose', true, 'Yes. The London bishop leaves b2 less well defended, so the early ...c5 and ...Qb6 are the best plan.', 'c5', 'g:c7c5'),
      opt('e6, the QGD set-up', false, 'It blocks your own bishop on c8, which is the piece you want to develop outside the chain.'),
      opt('Bf5, copying White', false, 'It is fine, but ...c5 puts more pressure on the centre.'),
    ], 'Strike at the centre before White finishes his set-up.'),
    plan('p2', 'd4 d5 Bf4 c5 e3 Nc6 c3', 'White has defended d4 solidly. Which move creates a concrete target?', [
      opt('Qb6. Hit b2 and make White spend a tempo', true, 'Yes. The queen attacks b2 and the bishop on f4 cannot defend it, so White has to play Qb3 or Qc2.', 'Qb6', 'g:d8b6'),
      opt('Bf5, developing', false, 'It is playable, but ...Qb6 comes first and forces White to react.'),
      opt('e5, attacking the bishop', false, 'It loses a pawn after dxe5.'),
    ], 'Use the loose pawn on b2.'),
    plan('p3', 'd4 d5 Bf4 c5 e3 Nc6 c3 Qb6 Qb3', 'White offers the queen trade with Qb3. What should you do?', [
      opt('c4. Push the pawn and win space', true, 'Yes. The pawn on c4 hits the queen and clamps b3. It also keeps your queen on the board.', 'c4', 'g:c5c4'),
      opt('Qxb3, trading queens', false, 'It is playable, but it relieves White’s problem. ...c4 is stronger.'),
      opt('e6, defending', false, 'It is too slow. ...c4 does everything.'),
    ], 'When the queen asks a question, answer with a pawn push.'),
    plan('p4', 'd4 d5 Bf4 c5 e3 Nc6 c3 Nf6 Nd2', 'Your bishop on c8 is the problem piece in most d-pawn openings. Where does it belong here?', [
      opt('f5. Develop it before you play ...e6', true, 'Yes. The bishop on f5 is outside the pawn chain, and it fights White’s London bishop for the diagonal.', 'Bf5', 'g:c8f5'),
      opt('g4, pinning the knight', false, 'It can be hit by h3 and Ne5 ideas, so Bf5 first.'),
      opt('d7 after ...e6', false, 'It is passive. The bishop is best on f5 before the pawn is on e6.'),
    ], 'Develop the problem bishop before you close the diagonal.', { kind: 'square' }),
    plan('p5', 'd4 d5 Bf4 c5 e3 Nc6 c3 Nf6 Nd2 Bf5 Ngf3 e6 Bb5', 'White threatens to take on c6 and damage your pawns. How do you keep the queenside healthy?', [
      opt('Qb6, hitting b2 again', true, 'Yes. The queen hits b2 and White has to answer with Qa4 or a4. Your structure is fine.', 'Qb6', 'g:d8b6'),
      opt('a6, asking the bishop', false, 'It lets White take on c6 and damage the structure.'),
      opt('Ne4, trading pieces', false, 'It misses that White can take on c6 first.'),
    ], 'Hit b2 with the queen whenever the bishop is not defending it.'),
  ],
  traps: [],
});

export const ch4 = chapter({
  id: 'others',
  title: 'Colle, Torre, Jobava and flank openings',
  blurb: 'Meet 2.Nf3, 2.Bg5, 2.Nc3 and 1.c4 / 1.Nf3 with the same solid set-up.',
  coach: `Not everyone plays the Queen’s Gambit. The Colle (e3, Bd3, c3), the Torre (Nf3, Bg5), the Jobava (Nc3 and Bf4) and flank openings with c4 and Nf3 all give Black a comfortable game if you keep your structure simple. Play ...d5, ...Nf6, ...e6 and ...c5, develop the knight to c6, and be ready for a central break with ...e5 or ...c5 when the time is right.`,
  tip: 'Against quiet systems, play ...d5, ...Nf6, ...e6, ...c5 and ...Nc6, and break in the centre with ...c5 or ...e5.',
  src: `1.d4 {White takes the centre.}
 d5 {You take the centre too.}
 2.Nf3 {A flexible move: White keeps the c-pawn at home.}
 Nf6 {Develop.}
 3.e3 {The Colle: White prepares Bd3 and c3.}
 e6 {Solid and sensible, it supports d4.}
 4.Bd3 {The bishop aims at h7.}
 c5 {Strike at d4 while White’s pieces are not coordinated.}
 5.b3 {The Zukertort set-up: bishop to b2.}
 (c3 {The Colle.}
  Nc6 {Develop and pressure d4.}
  6.Nbd2 {White develops.}
  Bd6 {Develop and prepare to castle.}
  7.O-O {White castles.}
  O-O {Castle: your king is safe.}
  8.e4 {White strikes in the centre.}
  dxe4 {Take the pawn, the e4 centre has to go.}
  9.Nxe4 {Recapture.}
  Nxe4 {Trade a pair of pieces, you are fine.}
  10.Bxe4 {Recapture.})
 Nc6 {Develop and pressure d4.}
 6.O-O {White castles.}
 Bd6 {Develop and prepare to castle.}
 7.Bb2 {White develops.}
 O-O {Castle: your king is safe.}
 8.Nbd2 {White develops.}
 Qe7 {Prepare ...e5 and connect the rooks.}
 9.Ne5 {The knight takes the centre.}
 cxd4 {Open the position before the knight on e5 can be a nuisance.}
 10.exd4 {White recaptures.}
 Qc7 {Hit the knight and the pawn.}
 11.Nxc6 {White trades.}
 bxc6 {Recapture; your structure is fine and the bishops are active.}
 12.Nf3 {The knight retreats. @d Against the Colle, strike with ...c5 and trade the knight on e5 before White’s attack builds.}`,
  plans: [
    plan('p1', 'd4 d5 Nf3 Nf6 e3 e6 Bd3', 'White has set up the Colle. What is the standard reaction?', [
      opt('c5. Strike at d4 before White can play c3', true, 'Yes. The pawn on c5 attacks d4, and White’s central plan is slowed down.', 'c5', 'g:c7c5'),
      opt('Be7 and a slow set-up', false, 'It is fine, but ...c5 is more active.'),
      opt('h6, preparing ...g5', false, 'It weakens your king for no reason.'),
    ], 'Hit the centre early against the Colle.'),
    plan('p2', 'd4 d5 Nf3 Nf6 e3 e6 Bd3 c5 b3 Nc6 O-O', 'White castles. Which bishop move prepares to castle and eyes the kingside?', [
      opt('Bd6. Develop and aim at the kingside', true, 'Yes. The bishop on d6 is active and supports ...e5 later.', 'Bd6', 'g:f8d6'),
      opt('Be7, passively', false, 'It is playable, but the bishop on d6 is more active.'),
      opt('Bb4, hitting the king', false, 'There is nothing to hit. White’s king is not on e1 any more.'),
    ], 'Put the bishop on its most active square.', { kind: 'square' }),
    plan('p3', 'd4 d5 Nf3 Nf6 Bg5', 'White plays the Torre Attack. How do you handle the bishop on g5?', [
      opt('e6, then ...Be7 and ...O-O', true, 'Yes. The QGD-style set-up is solid, and ...h6 or ...c5 come later.', 'e6', 'g:e7e6'),
      opt('Ne4, trading the bishop', false, 'It is a good move too, but it can lose a tempo. ...e6 is easy and safe.'),
      opt('h6, asking the bishop', false, 'It is fine, but ...e6 first.'),
    ], 'Get your pieces out in a solid way against the Torre.'),
    plan('p4', 'c4 e6 Nf3 d5 g3 Nf6 Bg2 Be7 O-O O-O d4', 'White has transposed into a Catalan. What is the thematic reply?', [
      opt('dxc4. Take the pawn and give it back later', true, 'Yes. The Catalan pawn on c4 is not really protected, and you can hold the extra pawn with ...a6 and ...b5.', 'dxc4', 'g:d5c4'),
      opt('c6, a Slav-style set-up', false, 'It is playable, but ...dxc4 is the main line.'),
      opt('Nbd7, a passive set-up', false, 'It is playable but ...dxc4 is the thematic idea.'),
    ], 'Take the pawn in the Catalan, then give it back for freedom.', { kind: 'break' }),
    plan('p5', 'd4 d5 Nc3 Nf6 Bf4', 'White plays the Jobava London. What is a sensible idea for Black?', [
      opt('c5. Strike at d4 at once', true, 'Yes. The pawn on c5 hits d4 and White’s Nb5 does not work.', 'c5', 'g:c7c5'),
      opt('e5, blocking', false, 'It loses a pawn after dxe5.'),
      opt('Nc6, blocking', false, 'It blocks the pawn and allows Nb5 ideas.'),
    ], 'Strike at the centre against the Jobava.'),
  ],
  traps: [],
});
