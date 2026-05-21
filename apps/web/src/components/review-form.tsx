'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { MediaType } from '@buzzshot/shared';
import { apiJson } from '@/lib/auth-client';
import { Button } from './button';
import { RatingControl } from './action-buttons';

export function ReviewForm({ mediaType, tmdbId }: { mediaType: MediaType; tmdbId: number }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [spoilers, setSpoilers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);

    try {
      await apiJson('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          mediaType,
          tmdbId,
          rating: rating || 0.5,
          title: String(formData.get('reviewTitle') ?? ''),
          body: String(formData.get('reviewBody') ?? ''),
          hasSpoilers: spoilers,
        }),
      });
      event.currentTarget.reset();
      setRating(0);
      setSpoilers(false);
      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Could not publish review.');
      if (String(submissionError).includes('Authentication')) {
        router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-md border border-border bg-white/6 p-5">
      <h2 className="text-xl font-semibold">Write a review</h2>
      <div className="mt-4">
        <RatingControl initialRating={rating} onChange={setRating} />
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
      {error ? <p className="mt-3 text-sm text-red-200">{error}</p> : null}
      <Button type="submit" className="mt-5" disabled={isSubmitting}>
        {isSubmitting ? 'Publishing…' : 'Publish review'}
      </Button>
    </form>
  );
}
