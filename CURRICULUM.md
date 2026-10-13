# Rook Lift — Learn: curriculum spec

Goal: a structured, gamified path from 650 → 1800 that teaches (not just drills): notation, tactics,
openings, middlegame plans, endgames, and full master games. Deterministic content; no LLM.
Every position/solution is verified by Stockfish via a script before shipping.

## Placement & structure
Path is split into 5 **Stages**, matching the rating ladder in the app:
| Stage | Rating band | Theme |
|---|---|---|
| Knight | 650 → 900 | Board fluency, piece safety, basic tactics, opening principles, basic mates |
| Bishop | 900 → 1200 | Tactical motifs in depth, simple repertoire, basic endgames, converting won games |
| Rook | 1200 → 1500 | Calculation, middlegame plans and pawn structure, rook endgames, deeper repertoire |
| Queen | 1500 → 1800 | Positional play, prophylaxis, complex endgames, full-game study |
| King | 1800 | Maintenance and review |

Each stage contains **Units** across the 6 tracks below; each unit has 3–6 **Lessons** (5–10 min each).
The user starts at Knight with Notation unit 1 pre-recommended. All units are open (no hard locks), but the path
highlights a "Next up" lesson chosen by the recommender. Stage complete = all its lessons ≥ 1 star.

## Tracks and content (minimum for this build)
1. **Notation** (Knight stage): coordinates, piece letters, captures/checks/mate symbols, castling, promotion,
   disambiguation (Nbd2), reading a PGN line. Mini-games:
   - *Square Sprint*: a square name is shown → tap it; 30-second rounds, white and black orientation, high score.
   - *Name that move*: a move is played with an arrow → choose its SAN from 4 options.
   - *Play the notation*: a SAN is shown → make the move on the board.
2. **Tactics**: hanging pieces and CCT (checks, captures, threats) routine, fork (knight/queen/pawn), pin
   (absolute/relative), skewer, discovered attack/check, double attack, removing the defender, deflection,
   overloading, back-rank weakness, mating patterns (back rank, smothered, Anastasia, Arabian, ladder/lawnmower,
   Boden, queen+king). Each lesson: concept slides with arrows → 4–8 practice positions → quiz.
3. **Openings**: principles (centre, development, castle, don't move the queen early, don't hunt pawns), traps to
   know and avoid (Scholar's mate defence, Fried Liver, Legal's mate, Blackburne–Shilling, Englund trap, Fishing Pole),
   and a **personal repertoire built from the user's data**:
   - White: **London System** (already played; 59% score as White in Queen's Pawn games). Main setup + plans
     vs …c5, …Bf5, King's Indian setups.
   - Black vs 1.e4: **1…e5** — Italian (Giuoco Piano, Two Knights incl. avoiding the Fried Liver), Scotch,
     Petrov sidelines (75% score with Black).
   - Black vs 1.d4: **Queen's Gambit Declined**-style …d5/…e6/…Nf6 setup with basic plans.
   Opening trainer: move-by-move line drill (user plays their side, app replies; arrows show the idea for each
   move; mistakes → show correct move + reason; SRS on lines).
4. **Middlegame**: piece activity (good/bad bishop, outposts), open files and rooks on the 7th, weak squares and
   pawn weaknesses (isolated, doubled, backward), king safety and attacking the castled king (pawn storms, sacrifices on h7),
   space, trading when ahead, making a plan (imbalances), prophylaxis ("what does my opponent want?").
   Quizzes: "Which plan?" (multiple choice with arrows), "Best square for this piece" (tap square),
   "Is this trade good?" (yes/no + why).
5. **Endgames**: king activity, opposition, key squares, rule of the square, outside passed pawn, K+Q v K,
   K+R v K, two-rook ladder, Lucena, Philidor, rook behind passed pawn, basic queen v pawn. Lessons can end in a
   "play it out vs Stockfish" step (reuse the existing EndgameDrill).
6. **Master games**: 8–12 classic annotated games (move facts are public domain; annotations written by us),
   e.g. Morphy Opera Game (1858), Anderssen Immortal (1851) & Evergreen (1852), Réti–Tartakower (1910),
   Capablanca–Tartakower (1924 rook ending), Fischer "Game of the Century" (1956), Kasparov–Topalov (1999),
   Botvinnik–Capablanca (1938), Petrosian–Spassky prophylaxis game, Carlsen endgame grind.
   Modes: *Watch* (step through with comments + arrows) and *Guess the move* (score points for matching the
   master; engine-OK alternatives get partial credit).

## Lesson step types (engine for all lessons)
- `text`: short explanation, optional board with arrows/highlights (multiple arrow colours: green = good/idea,
  red = threat/bad, blue = alternative).
- `move`: find the move(s) — single or multi-move line with scripted replies; hint highlights the piece then shows an arrow.
- `choice`: multiple choice (2–4 options), optional board + arrows per option preview.
- `squares`: tap one or more squares (e.g. "tap every hanging piece", "where does the knight belong").
- `truefalse`.
- `line`: opening line drill.
- `playout`: play a position vs Stockfish to a goal (win/draw).
- `game`: master-game viewer / guess-the-move.
Scoring per lesson: stars 1–3 by first-try accuracy. Wrong answers always explain why.

## Gamification
- Learn tab with a vertical path (stages → units → lesson nodes), "Next up" card, stage progress, stars.
- XP per lesson (20 + 5/star), stage badges, "Notation Ninja" (Square Sprint highscore ≥ 25), "Repertoire Ready", etc.
- Mistaken quiz items enter SRS review (`learn-review` queue) that is mixed into Quick bites.

## Personalisation
- Recommender ranks lessons by: weakness tags from analysis (fork, hung_piece, missed_mate, conversion,
  time_trouble, opening phase errors) → mapped to lessons; then stage order. E.g. heavy `fork` cost → Fork lessons first.
- Opening repertoire screen shows the user's own score per opening next to the recommended line.
- Daily session (Training day) gains a "Lesson" step (~8 min) before Blunder Bank.

## Arrows everywhere
- Board supports coloured arrows and square highlights.
- Game review: green arrow = engine best, red arrow = the move played, on every mistake.
- Puzzles: hint 2 = arrow; solution shows the full PV as numbered arrows.
- Lessons: arrows in text steps and explanations.

## Correctness (non-negotiable)
`scripts/validate-content.mjs` loads every lesson, checks:
- every FEN is legal and every scripted move is legal (chess.js);
- every `move` step's answer is Stockfish's best (or within 30cp of best at depth ≥ 16 / forced mate) and,
  for tactics, actually wins material or mates;
- every opening line is legal, and master game PGNs parse completely.
The build fails if validation fails.

---

# Addendum: how this is actually built (supersedes the table above where they differ)

## Coaching principles (learning first, gamification second)
1. **Coach voice.** All copy is a warm, direct human coach: second person, short sentences, specific praise ("Yes. The knight checks the king and attacks the rook"), no robotic "Correct/Incorrect", never shaming. Wrong answers are material to learn from. Phrases rotate deterministically (lib/learn/coach.ts).
2. **Think before moving.** Tactics/move steps show a thinking prompt (checks, captures, threats, theirs and yours); harder ones open with a "What is going on here?" question (`think`).
3. **Laddered hints.** Hint 1 = guiding question, hint 2 = highlights the piece, hint 3 = draws the arrow. A wrong move shows its refutation on the board (the engine's best reply as a red arrow plus one sentence), then the student retries. Pure king-and-pawn endings get the exact tablebase refutation.
4. **Explain the why.** Every answer ends with a takeaway rule. Every lesson ends with "What to remember" (2-3 bullets) and "Use it in your next game".
5. **Worked example, guided, independent, mixed.** Lessons run in that order (`phase`: example, guided, practice, mixed). Two older questions are woven in at the end.
6. **Mastery over completion.** A lesson is *mastered* at >= 80% first-try accuracy plus passed spaced reviews at 1 day and 4 days. States: New, Shaky, Learned, Review due, Mastered. Stars (1-3) are secondary; XP is quiet (20 + 5 per star, no toast). The recommender prefers due reviews and shaky lessons before anything new.
7. **From your games.** Lessons carry weakness tags; the finish screen offers 2-3 of the student's own Blunder Bank positions with the same tag, framed by the coach.
8. **Teach-back and reflection.** Some questions ask which *explanation* fits (`reasoning: true`). Each daily session ends with a templated coach note (what went well, what to watch, what is next).
9. **Post-game coaching.** The game review opens with a "Coach's view": the top 1-3 themes of the game, linked to the matching lesson. Arrows are shown on every mistake (green = engine move, red = played, drawn on the position before the move).
10. **Pacing.** One idea per screen, no timers except in the explicit mini-games.

## Foundations first (the student is about 647 rapid)
The path has six stages: **Foundations** (new, up to ~650), Knight, Bishop, Rook, Queen, King. Foundations units, in order: Board and notation; What pieces are worth; Piece safety (the most practice: attacked/defended, is it safe?, loose pieces, the blunder check); Checks, captures, threats; Basic checkmates; Opening basics (principles, Scholar's mate defence, early queen raids, Fried Liver awareness); Simple endgames (king activity, passed pawn and the rule of the square, the opposition); Converting a win; Using the clock in 10-minute games.

- **Practice volume.** Foundations lessons have 10 to 15 scored items. Most are **generated** from real legal positions (the student's own games when available, random opening play otherwise): "count the attackers", "is it safe?", "tap every loose piece", "win the free piece", "what does this capture do?", mate in one, king-and-pawn "find the winning move", and more. Every generated item is re-verified by chess.js logic (an independent exchange search) before it is shown; mate-in-one and free-piece items are also checked by Stockfish in the validator; king-and-pawn items use an exact built-in tablebase.
- **Practice more.** Every lesson has a "Practice more" button: fresh generated items at the student's level, or (for lessons without a generator) the lesson's own verified positions mirrored and colour-swapped.
- **Difficulty.** Every item has a difficulty 1-5. New students start at 1-2. Per skill: 3 first-try correct in a row steps up; 2 misses in a row steps down and inserts a worked example.
- **Gating.** The recommender keeps the student in Foundations, then Knight, until each stage is learned (75% of lessons at Learned or better). Later stages are visible but marked "Later: after you master the basics"; a rising Chess.com rating nudges the allowed stage up. Master games and mini-games are enrichment and are never "next up".
- **Daily mix.** About 60% piece safety and tactics, 20% mates and endgames, 20% opening basics, plus due spaced reviews first. The Training-day session gains a "Lesson" step (about 8 minutes) before the Blunder Bank; the Today screen shows the Next-up card.

## What is verified, and how
`npm run validate` (also the build's `prebuild`) checks, with Stockfish at depth 16 and exact tablebases:
every FEN legal; every scripted move legal; every `move` answer best or within 30 cp (or a forced mate); tactic steps really win material or mate; "wrong" moves really are worse; hanging-piece answers equal the computed set (exchange search); true/false and choice claims backed by the engine or the tablebase; opening lines legal with sound student moves; playouts really won/drawn; master-game PGNs fully parsed; generators sampled at every level; every "Practice more" variant legal and engine-sound.
Judgement-only items (middlegame "which plan?" quizzes, time-management and concept questions) are the coach's own and are only checked for structure.
