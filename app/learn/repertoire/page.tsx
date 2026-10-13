'use client';
import { useLiveQuery } from 'dexie-react-hooks';
import Link from 'next/link';
import { useMemo } from 'react';
import { Stars } from '@/components/learn/bits';
import { BackBar, Card, Label } from '@/components/ui';
import { openingFamily } from '@/lib/core';
import { db } from '@/lib/db';
import { MASTERY_LABEL, masteryOf, useLearnProgress } from '@/lib/learn/progress';
import { UNITS_SORTED } from '@/lib/learn/registry';
import type { Game } from '@/lib/types';

interface Stat {
  n: number;
  pts: number;
}
const pct = (s: Stat) => (s.n ? Math.round((s.pts / s.n) * 100) : 0);
const pts = (g: Game) => (g.result === 'win' ? 1 : g.result === 'draw' ? 0.5 : 0);

function firstMoves(pgn: string): [string, string] {
  const m = /1\.\s*([^\s{]+)(?:\s*\{[^}]*\})?\s*(?:1\.\.\.\s*([^\s{]+))?/.exec(pgn);
  return [m?.[1] ?? '', m?.[2] ?? ''];
}

function Row({ label, s, note }: { label: string; s: Stat; note?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2 text-[14px]">
      <div className="min-w-0">
        <div>{label}</div>
        {note ? <div className="text-[12px] text-muted">{note}</div> : null}
      </div>
      <div className="shrink-0 text-right tabular">
        {s.n ? (
          <>
            <span className="font-medium">{pct(s)}%</span> <span className="text-muted">· {s.n} {s.n === 1 ? 'game' : 'games'}</span>
          </>
        ) : (
          <span className="text-muted">no games yet</span>
        )}
      </div>
    </div>
  );
}

/** Your own score per opening (from your imported games) next to the lines in the repertoire. */
export default function RepertoirePage() {
  const games = useLiveQuery(() => db.games.toArray(), []);
  const progress = useLearnProgress();

  const st = useMemo(() => {
    const acc = {
      w4: { n: 0, pts: 0 } as Stat,
      wd: { n: 0, pts: 0 } as Stat,
      wo: { n: 0, pts: 0 } as Stat,
      be5: { n: 0, pts: 0 } as Stat,
      be4o: { n: 0, pts: 0 } as Stat,
      bd5: { n: 0, pts: 0 } as Stat,
      bdo: { n: 0, pts: 0 } as Stat,
      bo: { n: 0, pts: 0 } as Stat,
    };
    const fam: Record<'w' | 'b', Record<string, Stat>> = { w: {}, b: {} };
    for (const g of games ?? []) {
      const [a, b] = firstMoves(g.pgn);
      const add = (s: Stat) => {
        s.n += 1;
        s.pts += pts(g);
      };
      if (g.myColor === 'w') add(a === 'e4' ? acc.w4 : a === 'd4' ? acc.wd : acc.wo);
      else if (a === 'e4') add(b === 'e5' ? acc.be5 : acc.be4o);
      else if (a === 'd4') add(b === 'd5' ? acc.bd5 : acc.bdo);
      else add(acc.bo);
      const name = openingFamily(g.opening || g.eco);
      const s = (fam[g.myColor][name] ??= { n: 0, pts: 0 });
      s.n += 1;
      s.pts += pts(g);
    }
    const top = (c: 'w' | 'b') =>
      Object.entries(fam[c])
        .sort((x, y) => y[1].n - x[1].n)
        .slice(0, 5);
    return { acc, topW: top('w'), topB: top('b') };
  }, [games]);

  const units = UNITS_SORTED.filter((u) => u.id.startsWith('rep-'));

  const sections: { unitId: string; title: string; sub: string; rows: React.ReactNode }[] = [
    {
      unitId: 'rep-london',
      title: 'White: London System',
      sub: 'You already play Queen’s Pawn setups. These lines give them a plan.',
      rows: (
        <>
          <Row label="1.d4 (Queen's Pawn, London)" s={st.acc.wd} />
          <Row label="1.e4" s={st.acc.w4} note={st.acc.w4.n >= 4 && pct(st.acc.w4) < pct(st.acc.wd) ? 'Scores lower than 1.d4 in your games' : undefined} />
        </>
      ),
    },
    {
      unitId: 'rep-e5',
      title: 'Black vs 1.e4: 1...e5',
      sub: 'Italian, Two Knights, Scotch and Petrov-style lines.',
      rows: (
        <>
          <Row label="1.e4 e5" s={st.acc.be5} />
          <Row label="1.e4, other replies" s={st.acc.be4o} />
        </>
      ),
    },
    {
      unitId: 'rep-qgd',
      title: 'Black vs 1.d4: Queen’s Gambit Declined',
      sub: 'A solid setup with ...d5, ...e6 and ...Nf6.',
      rows: (
        <>
          <Row label="1.d4 d5" s={st.acc.bd5} />
          <Row label="1.d4, other replies" s={st.acc.bdo} />
        </>
      ),
    },
  ];

  return (
    <div>
      <BackBar title="Repertoire" href="/learn/" />
      <div className="px-5">
        <h1 className="mt-2 text-[28px] font-semibold tracking-tight">Your repertoire</h1>
        <p className="mt-1 text-[15px] text-muted">Built from the openings you actually play. Your own results sit next to each set of lines.</p>

        <div className="mt-6 space-y-5">
          {sections.map((sec) => {
            const u = units.find((x) => x.id === sec.unitId);
            return (
              <Card key={sec.unitId} className="p-0">
                <div className="px-5 pt-4">
                  <div className="text-[18px] font-semibold tracking-tight">{sec.title}</div>
                  <div className="mt-0.5 text-[13px] text-muted">{sec.sub}</div>
                  <div className="mt-3 divide-y divide-border border-t border-border">{sec.rows}</div>
                </div>
                <div className="border-t border-border px-3 py-3">
                  <Label className="px-2">Lines</Label>
                  <ul className="mt-1">
                    {(u?.lessons ?? []).map((l) => {
                      const p = progress?.[l.id];
                      return (
                        <li key={l.id}>
                          <Link href={`/learn/lesson/?id=${l.id}`} className="flex min-h-[52px] items-center justify-between gap-3 rounded-xl px-2 py-2 active:bg-subtle">
                            <div className="min-w-0">
                              <div className="text-[15px] font-medium leading-snug">{l.title}</div>
                              <div className="text-[12px] leading-snug text-muted">{l.blurb}</div>
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-1">
                              <Stars n={p?.stars ?? 0} />
                              <span className="text-[11px] text-muted">{MASTERY_LABEL[masteryOf(p)]}</span>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                    {!u ? <li className="px-2 py-2 text-[13px] text-muted">Lines are on their way.</li> : null}
                  </ul>
                </div>
              </Card>
            );
          })}
        </div>

        {games && games.length ? (
          <Card className="mt-6">
            <Label>What you play most</Label>
            <div className="mt-2 grid grid-cols-2 gap-4">
              {(['w', 'b'] as const).map((c) => (
                <div key={c}>
                  <div className="text-[12px] text-muted">{c === 'w' ? 'As White' : 'As Black'}</div>
                  <ul className="mt-1 space-y-1.5">
                    {(c === 'w' ? st.topW : st.topB).map(([name, s]) => (
                      <li key={name} className="text-[13px] leading-snug">
                        <span>{name}</span>
                        <span className="text-muted tabular"> {pct(s)}% · {s.n}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
