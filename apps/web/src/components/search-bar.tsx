'use client';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import { Button } from './button';

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
      className="flex w-full items-center gap-2 rounded-md border border-border bg-black/35 p-1 shadow-2xl shadow-black/20 focus-within:ring-2 focus-within:ring-primary/70"
    >
      <Search aria-hidden="true" className="ml-3 h-5 w-5 text-muted" />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search movies, series, people, lists…"
        className="min-w-0 flex-1 bg-transparent px-1 py-3 text-sm text-foreground focus-visible:outline-none placeholder:text-muted"
      />
      <Button type="submit" className={compact ? 'px-3' : undefined}>
        Search
      </Button>
    </form>
  );
}
