# Rook Lift — build plan

Goal: take chessDh19 from 647 → 1800 rapid. Personal, mobile-first PWA that learns from
your own Chess.com games. No LLM. Engine runs on-device.

## Architecture
- Next.js 15 (App Router) + TypeScript + Tailwind, `output: 'export'` (fully static) on Vercel.
- Static = trivially cacheable by a service worker → whole app works offline after first load.
- Chess.com public API fetched straight from the browser (CORS `*`).
- Stockfish 17 lite single-threaded WASM (`stockfish` npm pkg) in a Web Worker. No COOP/COEP needed.
- chess.js for rules/PGN, react-chessboard for the board, Dexie (IndexedDB) for local data.
- Supabase: Google login + `chess_kv` sync table (user_id, key, value jsonb, updated_at), RLS = own rows.
  Reuse the existing `do-my-chores` Supabase project: Google provider already configured there, so no
  new OAuth client/secret handling; we just add the new domain to the redirect allow-list.
  Publishable key + URL are public by design → committed in `lib/config.ts`.
- Sync: local-first; push dirty keys, pull newer by updated_at, last-write-wins per key.

## Analysis (deterministic)
- Per game, every ply evaluated (movetime ~120ms desktop/phone OK; background queue, newest first).
- Win% = lichess formula 50 + 50*(2/(1+e^(-0.00368208*cp)) - 1). Drop ≥20 blunder, ≥10 mistake, ≥5 inaccuracy.
- Tags on each of my mistakes:
  - `hung_piece`  — engine's best reply captures the piece I just moved / left undefended (net material loss).
  - `missed_win`  — best move wins material (capture/check) and I played something else.
  - `missed_mate` / `allowed_mate`.
  - `fork`        — best reply (theirs) or best move (mine) attacks ≥2 pieces worth more than the attacker / king+piece.
  - `time_trouble`— my clock < 15% of base time when it happened (from %clk).
  - phase: opening (≤ ply 20) / middlegame / endgame (non-pawn material ≤ 13 per side).
  - `conversion`  — game where I had ≥ +3 (win% ≥ 85) and didn't win.
- Every blunder/mistake position → a puzzle ("Blunder Bank") with the engine best move + 1-2 move line.

## Training (daily)
- Today screen: day type alternates (Match day / Training day), ring for Dedicated (25 min) + Sprinkle (15 min).
- Training day session: review latest game (≈10m) → Blunder Bank SRS puzzles (≈15m) → Endgame drill (≈5m).
- Match day: pre-game checklist (10+5, "checks-captures-threats" before every move), "Play on Chess.com"
  link, then post-game sync → analyze → 2-tap "why?" for each blunder (rushed / didn't see threat /
  didn't see tactic / misjudged / time).
- Quick Bites: 5 due SRS puzzles, any time (sprinkle).
- Guard Duty: tap every one of your pieces that's hanging, positions drawn from your own games.
- Endgames: curated FENs (KQ v K, KR v K, K+P opposition, Lucena, Philidor), play vs Stockfish to target.
- SRS: Leitner boxes 0–5, intervals 0,1,3,7,14,30 days; wrong → box 0.

## Gamification (minimal, not noisy)
- XP per action; ranks by piece: Pawn → Knight → Bishop → Rook → Queen → King (King = 1800).
- Rating ladder card: real Chess.com rapid vs milestones 650/900/1200/1500/1800.
- Streak (days with ≥ one completed session), weekly heat strip.
- Weakness "bosses": each tag has an HP bar = its recent frequency vs baseline; drops as recent games improve.
- Badges for milestones (first 7-day streak, 100 puzzles, first game with 0 blunders, etc.).

## UI
- Minimal, neutral palette + single accent, 1px borders, bottom tab bar (Today / Train / Insights / Profile),
  safe-area insets, big tap targets, dark mode, installable PWA.

## Verification before handoff
- `next build` clean, lint/typecheck clean.
- Local run in browser pane: import real games, analyze, puzzles solve/fail, SRS, drills, offline reload.
- Deployed: Google login in Chrome, sync row written in Supabase, mobile viewport check.
