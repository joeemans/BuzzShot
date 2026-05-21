'use client';

import { ListPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import type { CustomList } from '@buzzshot/shared';
import { apiJson } from '@/lib/auth-client';
import { Button } from './button';

export function NewListForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);

    try {
      const list = await apiJson<CustomList>('/lists', {
        method: 'POST',
        body: JSON.stringify({
          title: String(formData.get('title') ?? ''),
          description: String(formData.get('description') ?? ''),
          isPrivate: formData.get('isPrivate') === 'on',
        }),
      });
      router.push(`/lists/${list.id}`);
      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Could not create list.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl rounded-md border border-border bg-white/6 p-6">
      <label className="block text-sm font-semibold">
        Title
        <input
          name="title"
          autoComplete="off"
          className="mt-2 w-full rounded-md border border-border bg-black/30 px-3 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
        />
      </label>
      <label className="mt-4 block text-sm font-semibold">
        Description
        <textarea
          name="description"
          autoComplete="off"
          className="mt-2 min-h-32 w-full rounded-md border border-border bg-black/30 px-3 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
        />
      </label>
      <label className="mt-4 flex items-center gap-2 text-sm text-muted">
        <input name="isPrivate" type="checkbox" />
        Private list
      </label>
      {error ? <p className="mt-3 text-sm text-red-200">{error}</p> : null}
      <Button type="submit" className="mt-6" disabled={isSubmitting}>
        <ListPlus aria-hidden="true" className="h-4 w-4" />
        {isSubmitting ? 'Creating…' : 'Create list'}
      </Button>
    </form>
  );
}
