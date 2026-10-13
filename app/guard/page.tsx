'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useActiveTimer } from '@/lib/hooks';
import { markActive } from '@/lib/progress';
import GuardDuty, { type GuardSummary } from '@/components/GuardDuty';
import { BackBar, Button, CheckMark } from '@/components/ui';

export default function GuardPage() {
  const router = useRouter();
  const [round, setRound] = useState(0);
  const [sum, setSum] = useState<GuardSummary | null>(null);
  useActiveTimer('spr', !sum);
  return (
    <div>
      <BackBar title="Guard Duty" href="/train/" />
      {sum ? (
        <div className="px-5 pt-10 text-center">
          <div className="flex justify-center">
            <CheckMark size={64} />
          </div>
          <h2 className="mt-5 text-[24px] font-semibold tracking-tight">
            {sum.correct} of {sum.total} correct
          </h2>
          <p className="mt-1 text-[15px] text-muted">Before every move, ask: is anything of mine undefended?</p>
          <div className="mx-auto mt-8 max-w-xs space-y-2">
            <Button
              onClick={() => {
                setSum(null);
                setRound((r) => r + 1);
              }}
            >
              Another round
            </Button>
            <Button variant="secondary" onClick={() => router.push('/train/')}>
              Done
            </Button>
          </div>
        </div>
      ) : (
        <GuardDuty
          key={round}
          onDone={(s) => {
            if (s.total > 0) void markActive();
            setSum(s);
          }}
        />
      )}
    </div>
  );
}
