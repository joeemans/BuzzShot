'use client';

import { useState } from 'react';
import { Button } from './button';
import { RatingControl } from './action-buttons';

export function ReviewForm() {
  const [spoilers, setSpoilers] = useState(false);
  return (
    <form className="rounded-md border border-border bg-white/6 p-5">
      <h2 className="text-xl font-semibold">Write a review</h2>
      <div className="mt-4">
        <RatingControl />
      </div>
      <label className="mt-4 block text-sm font-semibold">
        Title
        <input
          name="reviewTitle"
          autoComplete="off"
          className="mt-2 w-full rounded-md border border-border bg-black/30 px-3 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
          placeholder="What stayed with you…"
        />
      </label>
      <label className="mt-4 block text-sm font-semibold">
        Review
        <textarea
          name="reviewBody"
          autoComplete="off"
          className="mt-2 min-h-32 w-full rounded-md border border-border bg-black/30 px-3 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
          placeholder="Share your read on the film or series…"
        />
      </label>
      <label className="mt-4 flex items-center gap-2 text-sm text-muted">
        <input type="checkbox" checked={spoilers} onChange={(event) => setSpoilers(event.target.checked)} />
        Contains spoilers
      </label>
      <Button type="button" className="mt-5">
        Publish review
      </Button>
    </form>
  );
}
