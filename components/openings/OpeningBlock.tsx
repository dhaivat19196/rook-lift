'use client';
import { useState } from 'react';
import { useDueCount } from '@/lib/openings/progress';
import { Button, Card, Label } from '../ui';
import DueReview from './DueReview';

/** "Opening review" block for Quick bites: due positions from your opening courses, about five minutes. */
export default function OpeningBlock() {
  const due = useDueCount();
  const [open, setOpen] = useState(false);
  if (!due) return null;
  if (open) {
    return (
      <div className="-mx-5 mt-6 border-t border-border pt-4 text-left">
        <DueReview limit={10} doneLabel="Close" onDone={() => setOpen(false)} emptyAction={() => setOpen(false)} />
      </div>
    );
  }
  return (
    <Card className="mt-6 text-left">
      <Label>Opening review</Label>
      <p className="mt-1 text-[15px] leading-snug">
        {due} {due === 1 ? 'position is' : 'positions are'} due in your opening courses. About five minutes.
      </p>
      <Button className="mt-3" variant="secondary" onClick={() => setOpen(true)}>
        Start opening review
      </Button>
    </Card>
  );
}
