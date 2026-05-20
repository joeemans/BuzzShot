import Link from 'next/link';
import type { ActivityEvent } from '@buzzshot/shared';
import { formatDate } from '@/lib/utils';

export function ActivityFeedItem({ event }: { event: ActivityEvent }) {
  const target = event.media
    ? `/${event.media.mediaType === 'movie' ? 'movie' : 'series'}/${event.media.tmdbId}`
    : event.list
      ? `/lists/${event.list.id}`
      : event.targetUser
        ? `/profile/${event.targetUser.username}`
        : '/feed';
  const label = event.media?.title ?? event.list?.title ?? event.targetUser?.displayName ?? 'BuzzShot';

  return (
    <article className="rounded-md border border-border bg-white/6 p-5">
      <div className="flex gap-4">
        <img
          src={event.actor.avatarUrl ?? ''}
          alt=""
          width={48}
          height={48}
          className="h-12 w-12 rounded-md border border-border"
        />
        <div>
          <p className="text-sm text-muted">
            <Link href={`/profile/${event.actor.username}`} className="font-semibold text-foreground hover:text-primary">
              {event.actor.displayName}
            </Link>{' '}
            {event.verb}{' '}
            <Link href={target} className="font-semibold text-foreground hover:text-primary">
              {label}
            </Link>
          </p>
          <p className="mt-1 text-xs text-muted">{formatDate(event.createdAt)}</p>
          {event.review ? <p className="mt-3 text-sm leading-6 text-muted">{event.review.title}</p> : null}
        </div>
      </div>
    </article>
  );
}
