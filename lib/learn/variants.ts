// "Practice more" for lessons without a generator: the lesson's own verified positions, mirrored and/or colour-swapped.
// Chess is symmetric under both transformations (when there are no castling rights), so a verified answer stays
// verified. The text is replaced with a neutral explanation because squares named in the original no longer apply.
import { Chess } from 'chess.js';
import type { Square } from 'chess.js';
import { transformFen } from './gen.ts';
import type { MoveStep } from './types.ts';

const mapSq = (sq: string, mirror: boolean, swap: boolean): string => {
  let f = sq.charCodeAt(0) - 97;
  let r = Number(sq[1]);
  if (mirror) f = 7 - f;
  if (swap) r = 9 - r;
  return String.fromCharCode(97 + f) + r;
};

export function variantEligible(s: MoveStep): boolean {
  if (s.kind === 'cmd' || s.kind === 'kpk' || s.loose) return false;
  const castling = s.fen.split(' ')[2] ?? '-';
  if (castling !== '-') return false;
  return true;
}

export function variantOf(s: MoveStep, mirror: boolean, swap: boolean, rule: string): MoveStep | null {
  if (!variantEligible(s)) return null;
  try {
    const nodes = [{ ans: s.ans, reply: undefined as string | undefined }, ...(s.cont ?? []).map((c) => ({ ans: c.ans, reply: c.reply as string | undefined }))];
    let from = new Chess(s.fen);
    let to = new Chess(transformFen(s.fen, mirror, swap));
    const conv = (c1: Chess, c2: Chess, san: string): { san: string; uci: { from: string; to: string; promotion?: string } } => {
      const m = c1.moves({ verbose: true }).find((x) => x.san.replace(/[+#]/g, '') === san.replace(/[+#]/g, ''));
      if (!m) throw new Error('move not found');
      const f = mapSq(m.from, mirror, swap);
      const t = mapSq(m.to, mirror, swap);
      const m2 = c2.moves({ verbose: true }).find((x) => x.from === f && x.to === t && (x.promotion ?? '') === (m.promotion ?? ''));
      if (!m2) throw new Error('mapped move illegal');
      return { san: m2.san, uci: { from: f, to: t, promotion: m2.promotion } };
    };
    const out: { ans: string[]; reply?: string }[] = [];
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      let reply: string | undefined;
      if (n.reply) {
        const r = conv(from, to, n.reply);
        from.move(n.reply);
        to.move({ from: r.uci.from as Square, to: r.uci.to as Square, promotion: r.uci.promotion });
        reply = r.san;
      }
      const sans = n.ans.map((a) => conv(from, to, a).san);
      out.push({ ans: sans, reply });
      const first = conv(from, to, n.ans[0]);
      from.move(n.ans[0]);
      to.move({ from: first.uci.from as Square, to: first.uci.to as Square, promotion: first.uci.promotion });
    }
    from = null as never;
    to = null as never;
    const fen = transformFen(s.fen, mirror, swap);
    const turn = new Chess(fen).turn();
    return {
      id: s.id + (mirror ? 'm' : '') + (swap ? 's' : ''),
      t: 'move',
      phase: 'practice',
      fen,
      ans: out[0].ans,
      cont: out.slice(1).map((o) => ({ reply: o.reply as string, ans: o.ans })),
      tactic: s.tactic,
      prompt: `${turn === 'w' ? 'White' : 'Black'} to move. The same pattern you studied, from a different angle.`,
      hint: s.hint ? 'Look for the same idea as in the lesson: which move does the pattern call for?' : undefined,
      why: `${out[0].ans[0]} is the same pattern as the one in the lesson, flipped. ${rule}`,
      side: turn,
      d: s.d,
    };
  } catch {
    return null;
  }
}
