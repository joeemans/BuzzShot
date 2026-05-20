import type { MediaSummary } from '@buzzshot/shared';
import { EmptyState } from './states';
import { MediaCard } from './media-card';

export function MediaGrid({
  items,
  emptyTitle = 'No titles found',
  emptyDescription = 'Try a different search or browse trending picks.',
}: {
  items: MediaSummary[];
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (items.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} actionHref="/search" actionLabel="Search" />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
      {items.map((media, index) => (
        <MediaCard key={`${media.mediaType}-${media.tmdbId}`} media={media} priority={index < 5} />
      ))}
    </div>
  );
}
