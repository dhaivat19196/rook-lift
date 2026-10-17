# Rook Lift — Opening Courses spec

Goal: full opening courses the student can learn variation by variation and actually win with at 650 → 1800.
Taught the way a coach would (see the coaching principles in CURRICULUM.md): ideas and plans first, then the moves,
then drilling until they're automatic, then real games. All moves are Stockfish-validated.

## Repertoire
| Course | Side | Scope |
|---|---|---|
| **London System** | White | 1.d4 + 2.Bf4 (Jobava-free, classical London). All Black setups, see below |
| **Sicilian Dragon** | Black vs 1.e4 | Open Sicilian main lines into the Dragon (…d6, …g6), plus every common anti-Sicilian |
| **Caro-Kann** | Black vs 1.e4 | Solid second weapon: Advance, Classical (4…Bf5), Exchange/Panov, Two Knights, Fantasy |
| **Queen's Gambit Declined + anti-London** | Black vs 1.d4 / others | QGD main ideas, Exchange QGD, vs the London (…c5/…Qb6 plan), vs Catalan-ish/Colle setups, vs 1.c4 / 1.Nf3 / 1.b3 (simple …d5 setup) |
| (existing) **1…e5** | Black vs 1.e4 | Keep the existing lines; migrate them into a small course |

### London System chapters (minimum)
1. Setup and plans (d4, Bf4, e3, Nf3, c3, Bd3, Nbd2, O-O; Ne5, h4 ideas, kingside attack, e4 break)
2. vs …d5 …Nf6 …e6 …Bd6 (the Bd6 trade offer: Bg3 / Bxd6 / Ne5 lines)
3. vs …c5 and the early …Qb6 hit on b2 (Qb3, Qc1, Nc3 gambit choice; never drop b2 for free)
4. vs …Bf5 (mirror London: Qb3, c4 ideas)
5. vs …Bg4 (h3/Qb3 ideas, Ne5)
6. vs King's Indian setups …g6 …Bg7 …d6 (h3, e3, Be2/Bd3, c3; e4 plan; h4-h5 attack option)
7. vs Grünfeld-style …g6 …d5
8. vs Dutch …f5
9. vs early …c5 Benoni-ish (d5 or c3) and …e5 gambits (Englund already in traps; add Budapest-style)
10. vs …Nc6 setups and …b6 Queen's Indian setups
11. Typical middlegames: Ne5 + f4 Stonewall-style attack, e3-e4 break, the c3-d4-e3 structure, what to do when Black plays …c5xd4
12. Traps and tricks (for and against White), e.g. the …Qb6 b2 trap, Bxh7+ ideas, Ne5 tactics

### Sicilian Dragon chapters (minimum)
1. Ideas: why the Sicilian, the g7 bishop, the c-file, …d5 break, exchange sac on c3, typical piece placement
2. Open Sicilian: 1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 g6
3. Yugoslav Attack 6.Be3 Bg7 7.f3 O-O 8.Qd2 Nc6 9.Bc4 (main line, simplified: …Bd7, …Rc8, …Ne5, …Nc4)
4. Yugoslav 9.O-O-O (…d5! equalizing line)
5. Classical 6.Be2 and 6.Be3 without f3
6. 6.f4 Levenfish, 6.Bc4 / Fischer–Sozin style, 6.g3
7. Anti-Sicilians: Alapin 2.c3 (…Nf6 or …d5), Smith–Morra Gambit 2.d4 cxd4 3.c3 (accept and develop safely or decline with …Nf6/…d3), Grand Prix 2.Nc3 + f4, Closed Sicilian 2.Nc3 + g3, Moscow 3.Bb5+, Rossolimo-style lines, Wing Gambit 2.b4, Bowdler 2.Bc4
8. Traps and tricks: the …Nxe4/…Qa5 tactics, the h-file danger, the Morra traps (…Qc7 Nb5 etc.)

### Caro-Kann chapters (minimum)
1. Ideas: solid structure, light-squared bishop out before …e6, …c5 break, endgames are good for Black
2. Advance 3.e5 Bf5 (Short system 4.Nf3 e6 5.Be2, 4.Nc3, 4.h4 h5)
3. Classical 3.Nc3 dxe4 4.Nxe4 Bf5
4. Exchange 3.exd5 cxd5 and the Panov-Botvinnik 4.c4
5. Two Knights 2.Nc3 d5 3.Nf3 and Fantasy 3.f3
6. Traps (the 4…Nd7 5.Qe2 Ngf6?? 6.Nd6# trick, Advance tricks)

### QGD + anti-London chapters (minimum)
1. QGD ideas and main setup: …d5 …e6 …Nf6 …Be7 …O-O, …c5 or …dxc4 + …c5 freeing
2. Exchange QGD (minority attack awareness, …c6/…Re8/…Nbd7-f8 plan)
3. vs the London: …c5, …Nc6, …Qb6 pressure on b2
4. vs Colle/Torre/Jobava setups and 1.c4 / 1.Nf3 / 1.b3

## Course format
- **Tree, not lines.** Each chapter is a move tree (PGN-like with branches). Every node: the move, a one-line idea
  (coach voice), optional arrows/highlights, optional "why not X?" notes for common alternatives, and a
  popularity weight at amateur level (author estimate) for the opponent's replies.
- **Modes per chapter:**
  1. *Learn*: guided walk through every branch. The coach explains each move with arrows. The student plays their
     side; the app plays the replies.
  2. *Drill*: spaced repetition per node (like a move trainer). The app plays opponent moves weighted by popularity,
     and the student must find the repertoire move. A wrong move gets "Not in your repertoire / here's why" plus the
     refutation if it's a mistake. Each node has its own SRS box (1, 3, 7, 14, 30 days).
  3. *Plans quiz*: 4–8 "what's the plan here?" / "where does this piece go?" / "which pawn break?" questions per
     chapter at typical positions out of the opening.
  4. *Traps*: positions where the opponent commonly errs; punish it. Also traps to avoid.
  5. *Spar*: play on from the end of a line against Stockfish at reduced strength (UCI `Skill Level`, about 1000–1400
     Elo; the user can pick). After the game, a short coach summary.
- **Deviation handling:** when the opponent leaves the tree, the student learns the principle ("they played the
  uncommon 4…a6 — just keep developing, here's the idea").
- **Progress:** each chapter shows learned %, mastered % (nodes in box ≥ 3) and due count. Course rings appear on
  Learn. A daily "Opening review" block (≈ 5 min of due nodes) goes into the daily session and Quick bites.
- **Your games vs your repertoire:** for each imported Chess.com game, find where it left the repertoire tree (who
  deviated and on which move). Show this on the course page ("In 6 of your last 10 London games you played 5.Nbd2
  before c3. The course plays c3 first. Here's why") and on game review ("You left your repertoire on move 6:
  played …, repertoire move …"). Clicking jumps into a drill at that node.
- **Opening stats screen:** for each course, the student's real score from imported games (W/D/L) and
  which chapters come up most often in their games, so they study what they actually face.

## Data and storage
- Content lives in lib/openings/courses/*.ts as typed trees (or PGN strings parsed with chess.js at build time).
- Progress is kept in kv keys `op:<courseId>:<nodeKey>` (SRS box, due, history). These sync through the existing
  Supabase kv. Keep the values compact.
- Migrate the existing repertoire lessons (london-*, two-knights, scotch, petrov, four-knights, qgd-*) so they
  point to the new courses. Keep the old lesson ids working as redirects so existing progress isn't lost.

## Validation (strict, extends scripts/validate-content.mjs)
- Every move in every tree is legal; PGN strings parse.
- Every **repertoire-side** move is within 35cp of Stockfish best at depth ≥ 16. Gambit/sharp choices may be
  flagged `sound:'practical'` with ≥ -60cp, and they must be few and justified in a comment.
- Opponent "mistake" branches must be answered by an engine-best (≤ 30cp) punishing move. Traps must really win
  material or mate.
- Plans quizzes: structural checks plus engine checks where the answer is a move.
- The validator caches engine results, and it runs locally via `npm run validate` (it is skipped on Vercel
  through scripts/validate-gate.mjs).
