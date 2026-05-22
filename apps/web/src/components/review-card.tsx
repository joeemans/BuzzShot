import Link from 'next/link';
import { MessageCircle, ThumbsUp } from 'lucide-react';
import type { Review } from '@buzzshot/shared';
import { formatDate } from '@/lib/utils';
import { RatingStars } from './rating-stars';

export function ReviewCard({ review }: { review: Review }) {
  const writtenBody = review.body.trim();
  return (
    <article className="rounded-md border border-border bg-white/6 p-5">
      <div className="flex gap-4">
        <img
          src={review.media.posterUrl ?? ''}
          alt=""
          width={160}
          height={240}
          className="hidden aspect-[2/3] w-20 rounded object-cover sm:block"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
            <Link
              href={`/profile/${review.user.username}`}
              className="font-semibold text-foreground hover:text-primary"
            >
              {review.user.displayName}
            </Link>
            <span>reviewed</span>
            <Link
              href={`/${review.media.mediaType === 'movie' ? 'movie' : 'series'}/${review.media.tmdbId}`}
              className="font-semibold text-foreground hover:text-primary"
            >
              {review.media.title}
            </Link>
            <span>{formatDate(review.createdAt)}</span>
          </div>
          <Link href={`/reviews/${review.id}`}>
            <h3 className="mt-3 text-xl font-semibold hover:text-primary">{review.title}</h3>
          </Link>
          <div className="mt-2">
            <RatingStars value={review.rating} />
          </div>
          {writtenBody ? (
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">{writtenBody}</p>
          ) : (
            <p className="mt-3 text-sm font-semibold text-muted">Rating only</p>
          )}
          <div className="mt-4 flex items-center gap-4 text-xs font-semibold text-muted">
            <span className="inline-flex items-center gap-1">
              <ThumbsUp aria-hidden="true" className="h-4 w-4" />
              {review.likesCount}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle aria-hidden="true" className="h-4 w-4" />
              {review.commentsCount}
            </span>
            {review.hasSpoilers ? <span className="text-primary">Spoilers hidden</span> : null}
          </div>
        </div>
      </div>
    </article>
  );
}
