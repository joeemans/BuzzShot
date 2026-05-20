'use client';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';

export function SearchBar({ defaultValue = '', compact = false }: { defaultValue?: string; compact?: boolean }) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuery = query.trim();
    router.push(nextQuery ? `/search?q=${encodeURIComponent(nextQuery)}` : '/search');
  }

  return (
    <form
      onSubmit={onSubmit}
      role="search"
      className={cn(
        'flex w-full items-center gap-2 border bg-black/35 p-1 shadow-2xl shadow-black/20 transition focus-within:ring-2 focus-within:ring-primary/70',
        compact
          ? 'rounded-full border-white/[0.12] bg-white/[0.045] shadow-none'
          : 'rounded-md border-border',
      )}
    >
      <Search aria-hidden="true" className={cn('ml-3 h-5 w-5 text-muted', compact && 'h-4 w-4')} />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search movies, series, people, lists…"
        className={cn(
          'min-w-0 flex-1 bg-transparent px-1 text-sm text-foreground placeholder:text-muted focus-visible:outline-none',
          compact ? 'py-2.5' : 'py-3',
        )}
      />
      <Button
        type="submit"
        variant={compact ? 'secondary' : 'primary'}
        className={compact ? 'min-h-9 rounded-full border-white/[0.12] px-4' : undefined}
      >
        Search
      </Button>
    </form>
  );
}
