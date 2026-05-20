import Link from 'next/link';
import { Lock, MessageCircle, ThumbsUp } from 'lucide-react';
import type { CustomList } from '@buzzshot/shared';

export function ListCard({ list }: { list: CustomList }) {
  return (
    <article className="rounded-md border border-border bg-white/6 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href={`/lists/${list.id}`}>
            <h3 className="text-xl font-semibold hover:text-primary">{list.title}</h3>
          </Link>
          <p className="mt-2 text-sm leading-6 text-muted">{list.description}</p>
        </div>
        {list.isPrivate ? <Lock aria-label="Private list" className="h-5 w-5 text-muted" /> : null}
      </div>
      <div className="mt-5 grid grid-cols-4 gap-2">
        {list.items.slice(0, 4).map((item) => (
          <img
            key={`${item.mediaType}-${item.tmdbId}`}
            src={item.posterUrl ?? ''}
            alt=""
            width={120}
            height={180}
            loading="lazy"
            className="aspect-[2/3] rounded object-cover"
          />
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between text-xs font-semibold text-muted">
        <Link href={`/profile/${list.owner.username}`} className="hover:text-primary">
          by {list.owner.displayName}
        </Link>
        <span className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <ThumbsUp aria-hidden="true" className="h-4 w-4" />
            {list.likesCount}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageCircle aria-hidden="true" className="h-4 w-4" />
            {list.commentsCount}
          </span>
        </span>
      </div>
    </article>
  );
}
