import Link from 'next/link';
import type { MediaSummary } from '@buzzshot/shared';
import { cn, formatDate } from '@/lib/utils';
import { RatingStars } from './rating-stars';

export function MediaCard({
  media,
  priority = false,
  className,
}: {
  media: MediaSummary;
  priority?: boolean;
  className?: string;
}) {
  const href = `/${media.mediaType === 'movie' ? 'movie' : 'series'}/${media.tmdbId}`;
  return (
    <article
      className={cn(
        'group overflow-hidden rounded-md border border-border bg-white/6 transition hover:-translate-y-1 hover:border-primary/50 hover:bg-white/10',
        className,
      )}
    >
      <Link href={href} className="block">
        <div className="relative aspect-[2/3] overflow-hidden bg-white/8">
          {media.posterUrl ? (
            <img
              src={media.posterUrl}
              alt=""
              width={500}
              height={750}
              loading={priority ? 'eager' : 'lazy'}
              fetchPriority={priority ? 'high' : 'auto'}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted">
              No poster
            </div>
          )}
          <span className="absolute left-3 top-3 rounded bg-black/75 px-2 py-1 text-xs font-bold uppercase text-primary">
            {media.mediaType}
          </span>
        </div>
        <div className="space-y-3 p-4">
          <div>
            <h3 className="line-clamp-2 text-base font-semibold leading-6">{media.title}</h3>
            <p className="mt-1 text-xs text-muted">{formatDate(media.releaseDate)}</p>
          </div>
          <RatingStars value={media.buzzScore / 2} label={`${media.title} BuzzShot rating`} />
        </div>
      </Link>
    </article>
  );
}
