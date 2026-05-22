'use client';

import Link from 'next/link';
import { ScrollableRail } from './scrollable-rail';

type PersonRowItem = {
  id: number;
  name: string;
  avatarUrl: string | null;
  character?: string;
  job?: string;
};

export function PeopleRow({ title, people }: { title: string; people: PersonRowItem[] }) {
  if (people.length === 0) return null;

  return (
    <ScrollableRail title={title} itemCount={people.length}>
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
    </ScrollableRail>
  );
}
