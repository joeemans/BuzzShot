'use client';

import type { MediaSummary } from '@buzzshot/shared';
import { MediaCard } from './media-card';
import { ScrollableRail } from './scrollable-rail';
import { EmptyState } from './states';

export function MediaRail({
  title,
  items,
  emptyTitle = 'No titles found',
  emptyDescription = 'Try a different search or browse trending picks.',
}: {
  title: string;
  items: MediaSummary[];
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (items.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionHref="/search"
        actionLabel="Search"
      />
    );
  }

  return (
    <ScrollableRail title={title} itemCount={items.length}>
      {items.map((media, index) => (
        <div
          key={`${media.mediaType}-${media.tmdbId}`}
          className="w-40 shrink-0 snap-start sm:w-44 md:w-48"
        >
          <MediaCard media={media} priority={index < 4} className="h-full" />
        </div>
      ))}
    </ScrollableRail>
  );
}
