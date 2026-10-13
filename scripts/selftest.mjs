// Engine-free sanity checks for lib/core.ts. Run: npm run selftest  (Node >= 22.7 strips TS types natively)
import assert from 'node:assert/strict';
import * as core from '../lib/core.ts';

const near = (a, b, e = 0.01) => Math.abs(a - b) < e;
// win%
assert.ok(near(core.winPct(0), 50));
assert.ok(core.winPct(300) > 70 && core.winPct(300) < 80, 'cp300 ~ 75%');
assert.ok(near(core.winPct(100) + core.winPct(-100), 100));
assert.equal(core.evWin(core.encodeScore(undefined, 3)), 100);
assert.equal(core.evWin(core.encodeScore(undefined, -2)), 0);
assert.equal(core.classify(25), 'b');
assert.equal(core.classify(12), 'm');
assert.equal(core.classify(6), 'i');
assert.equal(core.classify(2), null);

// hanging pieces: black knight on e5 attacked by white pawn d4 and undefended -> hanging
const fenHang = 'rnbqkb1r/pppp1ppp/8/4n3/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 3';
assert.deepEqual(core.hangingPieces(fenHang, 'b'), ['e5']);
// defended knight attacked by a bishop: not hanging
const fenSafe = 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3';
assert.deepEqual(core.hangingPieces(fenSafe, 'w'), []);
// start position: nothing hanging
assert.deepEqual(core.hangingPieces(new (await import('chess.js')).Chess().fen(), 'w'), []);

// fork: knight on c7 forking king e8 and rook a8 (black to move... after Nc7+)
const fenFork = 'r3k3/2N5/8/8/8/8/8/4K3 b - - 0 1';
const { Chess } = await import('chess.js');
assert.ok(core.isForkAfter(new Chess(fenFork), 'w', 'c7'));
assert.ok(core.moveForks('r3k3/8/4N3/8/8/8/8/4K3 w - - 0 1', 'e6c7') === true);

// capture gain: Qxd5 winning an undefended pawn gains 1; Bxe5 into a pawn recapture is a loss for the capturer
assert.equal(core.captureGain('4k3/8/8/3p4/8/8/8/3QK3 w - - 0 1', 'd1d5'), 1);
assert.equal(core.captureGain('4k3/8/5p2/3p4/8/8/8/3QK3 w - - 0 1', 'd1d5'), 1);

// phases
assert.equal(core.phaseAt(5, new Chess().fen()), 'opening');
assert.equal(core.phaseAt(40, new Chess().fen()), 'middlegame');
assert.equal(core.phaseAt(60, '8/5k2/8/8/8/8/4R1PP/4K3 w - - 0 1'), 'endgame');

// opening helpers
assert.equal(core.openingFromUrl('https://www.chess.com/openings/Sicilian-Defense-Bowdler-Attack-3...Nc6'), 'Sicilian Defense Bowdler Attack');
assert.equal(core.openingFamily('Sicilian Defense Bowdler Attack'), 'Sicilian Defense');

// full pipeline with fake evals: 1.f3 e5 2.g4?? Qh4#  (fool's mate)
const pgn = '[Event "x"]\n[TimeControl "600"]\n\n1. f3 {[%clk 0:09:58.0]} e5 {[%clk 0:09:58.0]} 2. g4 {[%clk 0:00:50.0]} Qh4# {[%clk 0:09:50.0]} 0-1';
const parsed = core.parseGame(pgn);
assert.ok(parsed && parsed.ucis.length === 4);
const E = (ev, best, pv = []) => ({ ev, best, pv });
const evals = [E(20, 'e2e4'), E(10, 'e7e5'), E(30, 'e2e4'), E(-20, 'd8h4', ['d8h4']), E(-core.MATE_BASE, null)];
// make white's g4 the blunder: eval before 30 -> after mate
evals[3] = E(core.encodeScore(undefined, -1), 'd8h4', ['d8h4']);
evals[4] = E(-core.MATE_BASE, null);
const res = core.classifyGame({ gameId: 't', parsed, evals, myColor: 'w', base: 600, result: 'loss', ms: 0 });
assert.equal(res.nb, 1);
assert.equal(res.mistakes[0].ply, 2);
assert.ok(res.mistakes[0].tags.includes('allowed_mate'), 'tags: ' + res.mistakes[0].tags);
assert.ok(res.mistakes[0].tags.includes('time_trouble'));
console.log('selftest OK', res.mistakes[0].tags.join(','), 'acc', res.acc);
