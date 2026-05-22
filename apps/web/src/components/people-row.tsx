'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import { Button } from './button';

type PersonRowItem = {
  id: number;
  name: string;
  avatarUrl: string | null;
  character?: string;
  job?: string;
};

export function PeopleRow({ title, people }: { title: string; people: PersonRowItem[] }) {
  const scroller = useRef<HTMLDivElement>(null);

  function scroll(direction: -1 | 1) {
    scroller.current?.scrollBy({ left: direction * 520, behavior: 'smooth' });
  }

  if (people.length === 0) return null;

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            className="h-9 w-9 px-0"
            onClick={() => scroll(-1)}
            aria-label={`Scroll ${title} left`}
          >
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="h-9 w-9 px-0"
            onClick={() => scroll(1)}
            aria-label={`Scroll ${title} right`}
          >
            <ChevronRight aria-hidden="true" className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div
        ref={scroller}
        className="flex snap-x gap-3 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {people.map((person) => (
          <Link
            key={`${title}-${person.id}-${person.name}`}
            href={`/person/${person.id}`}
            className="group w-36 shrink-0 snap-start overflow-hidden rounded-md border border-border bg-white/6 transition hover:-translate-y-1 hover:border-primary/50 hover:bg-white/10"
          >
            <div className="aspect-[3/4] bg-white/8">
              {person.avatarUrl ? (
                <img
                  src={person.avatarUrl}
                  alt=""
                  width={185}
                  height={278}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-black/35 text-3xl font-black text-muted">
                  {person.name.slice(0, 1)}
                </div>
              )}
            </div>
            <div className="min-h-24 p-3">
              <p className="line-clamp-2 text-sm font-semibold leading-5">{person.name}</p>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">
                {person.character || person.job || 'Credits'}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
