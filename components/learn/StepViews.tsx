'use client';
import { Chess, type Square } from 'chess.js';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getUiEngine } from '@/lib/engine';
import { describeReply, nudge, praise } from '@/lib/learn/coach';
import { kpkBestMoves, kpkDrawingReply, kpkResult } from '@/lib/learn/kpk';
import type { AC, ChoiceStep, LArrow, MoveStep, SquaresStep, TextStep, TrueFalseStep } from '@/lib/learn/types';
import { cn } from '@/lib/util';
import Board from '../Board';
import { Button, Spinner } from '../ui';
import { boardProps, CoachNote, PhaseLabel, Prose, toArrows, toMarks } from './bits';

export interface ViewProps<T> {
  step: T;
  rule: string;
  seed: string;
  /** called exactly once when the student has finished the item; firstTry says whether it was clean */
  onResolved: (firstTry: boolean) => void;
  onNext: () => void;
  isLast: boolean;
}

const strip = (s: string) => s.replace(/[+#!?]/g, '');
const nextLabel = (last: boolean) => (last ? 'Finish' : 'Continue');

function Footer({ onNext, last, label }: { onNext: () => void; last: boolean; label?: string }) {
  return (
    <Button className="mt-5" onClick={onNext}>
      {label ?? nextLabel(last)}
    </Button>
  );
}

// ---------------------------------------------------------------------------------------------------------

export function TextView({ step, onNext, isLast }: ViewProps<TextStep>) {
  return (
    <div>
      <PhaseLabel phase={step.phase} />
      {step.title ? <h2 className="mt-1 text-[22px] font-semibold leading-snug tracking-tight">{step.title}</h2> : null}
      {step.board ? (
        <div className="mt-4">
          <Board {...boardProps(step.board)} />
        </div>
      ) : null}
      <Prose text={step.body} className="mt-4" />
      <Footer onNext={onNext} last={isLast} label={isLast ? 'Finish' : 'Got it'} />
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------

interface Played {
  san: string;
  from: string;
  to: string;
  by: 'you' | 'reply';
}

/** The scripted line as SAN/from/to, for drawing numbered arrows. */
function scriptedLine(step: MoveStep): Played[] {
  const out: Played[] = [];
  try {
    const c = new Chess(step.fen);
    const first = c.move(step.ans[0]);
    out.push({ san: first.san, from: first.from, to: first.to, by: 'you' });
    for (const k of step.cont ?? []) {
      const r = c.move(k.reply);
      out.push({ san: r.san, from: r.from, to: r.to, by: 'reply' });
      const m = c.move(k.ans[0]);
      out.push({ san: m.san, from: m.from, to: m.to, by: 'you' });
    }
  } catch {
    /* content is validated; ignore */
  }
  return out;
}

const DEFAULT_HINT = (s: MoveStep) =>
  s.kind === 'cmd' ? 'Read the notation again: the first letter is the piece, the last two characters are the square.' : s.tactic ? 'Run the scan: what are your checks, your captures and your threats? Is anything of theirs loose?' : 'What is your opponent threatening, and which piece of yours is doing the least?';

export function MoveView({ step, rule, seed, onResolved, onNext, isLast }: ViewProps<MoveStep>) {
  const nodes = useMemo(() => [{ ans: step.ans, reply: undefined as string | undefined }, ...(step.cont ?? []).map((c) => ({ ans: c.ans, reply: c.reply as string | undefined }))], [step]);
  const turn = useMemo(() => new Chess(step.fen).turn(), [step.fen]);
  const side = step.side ?? turn;
  const [n, setN] = useState(0);
  const [fen, setFen] = useState(step.fen);
  const [status, setStatus] = useState<'think' | 'play' | 'busy' | 'wrong' | 'done' | 'shown'>(step.think ? 'think' : 'play');
  const [msg, setMsg] = useState<{ tone: 'good' | 'bad' | 'plain'; lead?: string; body?: string } | null>(null);
  const [hint, setHint] = useState(0);
  const [wrongs, setWrongs] = useState(0);
  const [last, setLast] = useState<{ from: string; to: string } | null>(null);
  const [extraArrows, setExtraArrows] = useState<LArrow[]>([]);
  const [thinkPick, setThinkPick] = useState<number | null>(null);
  const [shake, setShake] = useState(false);
  const alive = useRef(true);
  const resolved = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    alive.current = true;
    const t = timers.current;
    return () => {
      alive.current = false;
      t.forEach(clearTimeout);
      getUiEngine().cancel();
    };
  }, []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(() => alive.current && fn(), ms));
  };

  const resolve = (ok: boolean) => {
    if (resolved.current) return;
    resolved.current = true;
    onResolved(ok);
  };

  const node = nodes[n];
  const firstUci = (() => {
    try {
      const c = new Chess(fen);
      const m = c.move(node.ans[0]);
      return { from: m.from, to: m.to };
    } catch {
      return null;
    }
  })();

  const finishGood = (viaAlt?: string) => {
    const clean = wrongs === 0 && hint === 0;
    setStatus('done');
    const line = scriptedLine(step);
    setExtraArrows(line.map((p, i) => ({ from: p.from, to: p.to, c: (p.by === 'you' ? 'g' : 'r') as AC, n: line.length > 1 ? i + 1 : undefined })));
    setMsg({
      tone: 'good',
      lead: viaAlt ? `That works too. I had ${step.ans[0]} in mind, but yours holds up.` : praise(seed, { hinted: hint > 0, retried: wrongs > 0 }),
      body: step.why,
    });
    resolve(clean);
  };

  const revert = (before: string, text: { lead: string; body?: string }, arrows: LArrow[] = []) => {
    setWrongs((w) => w + 1);
    setStatus('wrong');
    setShake(true);
    setMsg({ tone: 'bad', ...text });
    setExtraArrows(arrows);
    later(() => {
      setShake(false);
      setFen(before);
      setLast(null);
      setStatus('play');
    }, step.kind === 'cmd' ? 1100 : 2600);
  };

  const onMove = (from: string, to: string, promo?: string): boolean => {
    if (status !== 'play') return false;
    const before = fen;
    const c = new Chess(before);
    let m;
    try {
      m = c.move({ from: from as Square, to: to as Square, promotion: promo });
    } catch {
      return false;
    }
    const after = c.fen();
    setFen(after);
    setLast({ from, to });
    setExtraArrows([]);
    setMsg(null);
    const san = strip(m.san);
    if (node.ans.some((a) => strip(a) === san)) {
      if (n + 1 < nodes.length) {
        setStatus('busy');
        const reply = nodes[n + 1].reply as string;
        later(() => {
          const cc = new Chess(after);
          const r = cc.move(reply);
          setFen(cc.fen());
          setLast({ from: r.from, to: r.to });
          setN(n + 1);
          setStatus('play');
          setMsg({ tone: 'plain', body: `${r.san} was their best reply. Now find the follow-up.` });
        }, 600);
      } else finishGood();
      return true;
    }
    if (step.kind === 'cmd') {
      revert(before, { lead: nudge(seed, wrongs), body: `The notation says ${node.ans[0]}. First the piece letter, then the square it lands on. Try again.` });
      return true;
    }
    const authored = Object.entries(step.wrong ?? {}).find(([k]) => strip(k) === san);
    if (step.kind === 'kpk') {
      // exact endgame knowledge: show the reply that proves the move wrong
      const k0 = kpkResult(before);
      const arrows: LArrow[] = [];
      let text = 'It lets the result slip.';
      try {
        const cc = new Chess(after);
        if (k0 && k0.pawn === turn) {
          const r = kpkDrawingReply(after);
          if (r) {
            const rm = cc.move({ from: r.slice(0, 2) as Square, to: r.slice(2, 4) as Square, promotion: 'q' });
            arrows.push({ from: rm.from, to: rm.to, c: 'r' });
            text = `${rm.color === 'w' ? 'White' : 'Black'} answers ${rm.san} and holds the draw.`;
          }
        } else {
          const best = kpkBestMoves(after)?.[0];
          if (best) {
            const rm = cc.move(best);
            arrows.push({ from: rm.from, to: rm.to, c: 'r' });
            text = `${rm.color === 'w' ? 'White' : 'Black'} answers ${rm.san} and the pawn gets through.`;
          }
        }
      } catch {
        /* keep the generic text */
      }
      revert(before, { lead: nudge(seed, wrongs), body: `${m.san}? ${authored ? authored[1] : text} Let's try again.` }, arrows);
      return true;
    }
    setStatus('busy');
    void (async () => {
      try {
        const eng = getUiEngine();
        const [b, a] = [await eng.analyse(before, { movetime: 280 }), await eng.analyse(after, { movetime: 280 })];
        if (!alive.current) return;
        const sign = turn === 'w' ? 1 : -1;
        const ok = b.ev * sign >= 9000 ? a.ev * sign >= 9000 : a.ev * sign >= b.ev * sign - 30;
        if (ok && !authored && n === 0) {
          finishGood(m.san);
          return;
        }
        if (ok && !authored) {
          finishGood(m.san);
          return;
        }
        const reply = a.bestmove;
        const arrows: LArrow[] = reply ? [{ from: reply.slice(0, 2), to: reply.slice(2, 4), c: 'r' }] : [];
        const why = authored ? authored[1] : describeReply(after, reply) || 'It does not hold up against their best reply.';
        revert(before, { lead: nudge(seed, wrongs), body: `${m.san}? ${why} Let's try again.` }, arrows);
      } catch {
        if (alive.current) revert(before, { lead: nudge(seed, wrongs), body: `${m.san} is not the move I'm looking for. Try again.` });
      }
    })();
    return true;
  };

  const showAnswer = () => {
    if (status === 'done' || status === 'shown') return;
    timers.current.forEach(clearTimeout);
    const line = scriptedLine(step);
    setFen(step.fen);
    setN(0);
    setLast(null);
    setStatus('shown');
    setExtraArrows(line.map((p, i) => ({ from: p.from, to: p.to, c: (p.by === 'you' ? 'g' : 'r') as AC, n: line.length > 1 ? i + 1 : undefined })));
    setMsg({ tone: 'plain', lead: `The move was ${step.ans[0]}.`, body: step.why });
    resolve(false);
  };

  // arrows and highlights for hints
  const hintMarks: Record<string, string> = {};
  const hintArrows: LArrow[] = [];
  if (status === 'play' && firstUci) {
    if (hint >= 2) hintMarks[firstUci.from] = 'y';
    if (hint >= 3) hintArrows.push({ from: firstUci.from, to: firstUci.to, c: 'g' });
  }
  const arrows = [...toArrows(extraArrows), ...toArrows(hintArrows)];
  const canHint = status === 'play' && hint < 3;
  const hintText = hint >= 1 ? (step.hint ?? DEFAULT_HINT(step)) : null;
  const sideName = turn === 'w' ? 'White' : 'Black';

  return (
    <div>
      <PhaseLabel phase={step.phase} extra={nodes.length > 1 ? `Move ${n + 1} of ${nodes.length}` : undefined} />
      <h2 className="mt-1 text-[20px] font-semibold leading-snug tracking-tight">{step.prompt ?? `${sideName} to move. Find the best move.`}</h2>

      {status === 'think' && step.think ? (
        <div className="mt-4 rounded-2xl border border-border p-4">
          <div className="text-[15px] font-medium">{step.think.q}</div>
          <div className="mt-3 space-y-2">
            {step.think.opts.map((o, i) => {
              const picked = thinkPick === i;
              const right = thinkPick !== null && i === step.think!.ans;
              return (
                <button
                  key={i}
                  disabled={thinkPick !== null}
                  onClick={() => setThinkPick(i)}
                  className={cn('min-h-[48px] w-full rounded-xl border px-4 text-left text-[15px]', right ? 'border-accent bg-accent/10' : picked ? 'border-danger/50' : 'border-border')}
                >
                  {o}
                </button>
              );
            })}
          </div>
          {thinkPick !== null ? (
            <div className="mt-3">
              <CoachNote tone={thinkPick === step.think.ans ? 'good' : 'bad'} lead={thinkPick === step.think.ans ? 'Yes.' : 'Not quite.'} body={step.think.why} />
              <Button className="mt-4" onClick={() => setStatus('play')}>
                Now find the move
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className={cn('mt-4', shake && 'anim-shake')}>
        <Board
          fen={fen}
          orientation={side}
          movable={turn === 'w' ? 'w' : 'b'}
          onMove={status === 'play' ? onMove : undefined}
          lastMove={last}
          arrows={arrows}
          highlights={hintMarks}
        />
      </div>

      <div className="mt-4 min-h-[72px]">
        {status === 'busy' ? (
          <div className="flex items-center gap-2 text-[15px] text-muted">
            <Spinner /> Checking that one...
          </div>
        ) : null}
        {hintText && status === 'play' ? <p className="mb-3 text-[15px] leading-relaxed text-muted">{hintText}</p> : null}
        {msg ? <CoachNote tone={msg.tone} lead={msg.lead} body={msg.body} rule={status === 'done' || status === 'shown' ? (step.rule ?? rule) : undefined} /> : null}
        {status === 'play' ? (
          <div className="mt-3 flex gap-2">
            <button disabled={!canHint} onClick={() => setHint((h) => h + 1)} className="min-h-[44px] flex-1 rounded-xl border border-border px-4 text-[14px] disabled:opacity-40">
              {hint === 0 ? 'Give me a hint' : hint === 1 ? 'Which piece?' : hint === 2 ? 'Show the move' : 'Hint used'}
            </button>
            <button onClick={showAnswer} className="min-h-[44px] rounded-xl border border-border px-4 text-[14px] text-muted">
              Show me
            </button>
          </div>
        ) : null}
        {status === 'wrong' ? null : null}
        {status === 'done' || status === 'shown' ? <Footer onNext={onNext} last={isLast} /> : null}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------

export function ChoiceView({ step, rule, seed, onResolved, onNext, isLast }: ViewProps<ChoiceStep>) {
  const [tried, setTried] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const [shownAns, setShownAns] = useState(false);
  const [cur, setCur] = useState<number | null>(null);
  const resolved = useRef(false);
  const correct = step.opts.findIndex((o) => o.ok);

  const resolve = (ok: boolean) => {
    if (resolved.current) return;
    resolved.current = true;
    onResolved(ok);
  };

  const pick = (i: number) => {
    if (solved || tried.includes(i)) return;
    setCur(i);
    if (step.opts[i].ok) {
      setSolved(true);
      resolve(tried.length === 0);
    } else {
      const t = [...tried, i];
      setTried(t);
      if (t.length >= 2 || t.length >= step.opts.length - 1) {
        setSolved(true);
        setShownAns(true);
        setCur(correct);
        resolve(false);
      }
    }
  };

  const o = cur !== null ? step.opts[cur] : null;
  const wrongShown = o && !o.ok && !solved;
  const reveal = solved ? step.reveal : undefined;
  const previewArrows = o && !solved ? o.arrows : undefined;
  const board = step.board;

  return (
    <div>
      <PhaseLabel phase={step.phase} extra={step.reasoning ? 'Why does it work?' : undefined} />
      <h2 className="mt-1 text-[20px] font-semibold leading-snug tracking-tight">{step.q}</h2>
      {board ? (
        <div className="mt-4">
          <Board
            {...boardProps(board)}
            arrows={toArrows([...(board.arrows ?? []), ...(previewArrows ?? []), ...(reveal?.arrows ?? [])])}
            highlights={toMarks({ ...(board.marks ?? {}), ...(reveal?.marks ?? {}) })}
          />
        </div>
      ) : null}
      <div className="mt-4 space-y-2">
        {step.opts.map((opt, i) => {
          const isTried = tried.includes(i);
          const isRight = solved && opt.ok;
          return (
            <button
              key={i}
              onClick={() => pick(i)}
              disabled={solved || isTried}
              className={cn(
                'min-h-[52px] w-full rounded-2xl border px-4 py-2.5 text-left text-[16px] leading-snug transition',
                isRight ? 'border-accent bg-accent/10' : isTried ? 'border-danger/40 text-muted line-through decoration-danger/40' : 'border-border active:bg-subtle',
              )}
            >
              {opt.text}
            </button>
          );
        })}
      </div>
      <div className="mt-4">
        {wrongShown ? <CoachNote tone="bad" lead={nudge(seed, tried.length - 1)} body={(o?.why ?? 'That is not it.') + ' Have another look.'} /> : null}
        {solved ? (
          <CoachNote
            tone="good"
            lead={shownAns ? 'Here is the answer.' : praise(seed, { hinted: false, retried: tried.length > 0 })}
            body={[step.opts[correct].why, step.why].filter(Boolean).join(' ')}
            rule={step.rule ?? rule}
          />
        ) : null}
        {solved ? <Footer onNext={onNext} last={isLast} /> : null}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------

export function SquaresView({ step, rule, seed, onResolved, onNext, isLast }: ViewProps<SquaresStep>) {
  const [sel, setSel] = useState<string[]>([]);
  const [tries, setTries] = useState(0);
  const [hint, setHint] = useState(0);
  const [done, setDone] = useState(false);
  const [msg, setMsg] = useState<{ lead: string; body: string } | null>(null);
  const resolved = useRef(false);
  const want = useMemo(() => [...step.answer].sort().join(' '), [step.answer]);

  const resolve = (ok: boolean) => {
    if (resolved.current) return;
    resolved.current = true;
    onResolved(ok);
  };

  const toggle = (sq: string) => {
    if (done) return;
    setSel((s) => (s.includes(sq) ? s.filter((x) => x !== sq) : [...s, sq]));
    setMsg(null);
  };

  const check = () => {
    if (!sel.length) return;
    if ([...sel].sort().join(' ') === want) {
      setDone(true);
      setMsg({ lead: praise(seed, { hinted: hint > 0, retried: tries > 0 }), body: step.why });
      resolve(tries === 0 && hint === 0);
      return;
    }
    const t = tries + 1;
    setTries(t);
    const missing = step.answer.filter((a) => !sel.includes(a)).length;
    const extra = sel.filter((s) => !step.answer.includes(s)).length;
    if (t >= 3) {
      setDone(true);
      setSel(step.answer);
      setMsg({ lead: 'Here is the answer.', body: step.why });
      resolve(false);
      return;
    }
    const parts: string[] = [];
    if (extra) parts.push(extra === 1 ? 'One of those squares is not right.' : `${extra} of those are not right.`);
    if (missing) parts.push(missing === 1 ? 'You are missing one.' : `You are missing ${missing}.`);
    setMsg({ lead: nudge(seed, t - 1), body: parts.join(' ') + (step.hint ? ' ' + step.hint : '') });
  };

  const marks: Record<string, string> = {};
  for (const s of sel) marks[s] = done && step.answer.includes(s) ? 'g' : done ? 'r' : 'y';
  if (hint >= 2 && !done) {
    const missing = step.answer.find((a) => !sel.includes(a));
    if (missing) marks[missing] = 'b';
  }
  const reveal = done ? step.reveal : undefined;
  const b = step.board;
  return (
    <div>
      <PhaseLabel phase={step.phase} />
      <h2 className="mt-1 text-[20px] font-semibold leading-snug tracking-tight">{step.q}</h2>
      <div className="mt-4">
        <Board fen={b.fen} orientation={b.side} arrows={toArrows([...(b.arrows ?? []), ...(reveal?.arrows ?? [])])} highlights={{ ...toMarks(b.marks), ...marks }} onSquareTap={toggle} />
      </div>
      <div className="mt-4">
        {hint >= 1 && !done ? <p className="mb-3 text-[15px] leading-relaxed text-muted">{step.hint ?? 'Take the pieces one at a time. Is each one attacked? Is it protected enough?'}</p> : null}
        {msg ? <CoachNote tone={done ? 'good' : 'bad'} lead={msg.lead} body={msg.body} rule={done ? (step.rule ?? rule) : undefined} /> : null}
        {!done ? (
          <div className="mt-3 flex gap-2">
            <Button className="flex-1" disabled={!sel.length} onClick={check}>
              Check
            </Button>
            <button onClick={() => setHint((h) => Math.min(2, h + 1))} className="min-h-[52px] rounded-2xl border border-border px-4 text-[14px]">
              Hint
            </button>
          </div>
        ) : (
          <Footer onNext={onNext} last={isLast} />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------

export function TrueFalseView({ step, rule, seed, onResolved, onNext, isLast }: ViewProps<TrueFalseStep>) {
  const [picked, setPicked] = useState<boolean | null>(null);
  const resolved = useRef(false);
  const choose = (v: boolean) => {
    if (picked !== null) return;
    setPicked(v);
    if (!resolved.current) {
      resolved.current = true;
      onResolved(v === step.ans);
    }
  };
  const right = picked === step.ans;
  const b = step.board;
  return (
    <div>
      <PhaseLabel phase={step.phase} />
      <h2 className="mt-1 text-[20px] font-semibold leading-snug tracking-tight">{step.q}</h2>
      {b ? (
        <div className="mt-4">
          <Board {...boardProps(b)} arrows={toArrows([...(b.arrows ?? []), ...(picked !== null ? (step.reveal?.arrows ?? []) : [])])} />
        </div>
      ) : null}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {[true, false].map((v) => (
          <button
            key={String(v)}
            disabled={picked !== null}
            onClick={() => choose(v)}
            className={cn('min-h-[56px] rounded-2xl border text-[17px] font-medium', picked === null ? 'border-border active:bg-subtle' : v === step.ans ? 'border-accent bg-accent/10' : picked === v ? 'border-danger/40 text-muted' : 'border-border text-muted')}
          >
            {v ? 'True' : 'False'}
          </button>
        ))}
      </div>
      {picked !== null ? (
        <div className="mt-4">
          <CoachNote tone={right ? 'good' : 'bad'} lead={right ? praise(seed, { hinted: false, retried: false }) : 'Not quite.'} body={step.why} rule={step.rule ?? rule} />
          <Footer onNext={onNext} last={isLast} />
        </div>
      ) : null}
    </div>
  );
}
