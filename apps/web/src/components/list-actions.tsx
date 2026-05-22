'use client';

import Link from 'next/link';
import { Bell, Check, Heart, MessageCircle, Minus, Plus, Search, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useTransition, type FormEvent } from 'react';
import type {
  CustomList,
  CustomListComment,
  GroupedSearchResults,
  MediaListMembership,
  MediaSummary,
  MediaType,
} from '@buzzshot/shared';
import { apiJson } from '@/lib/auth-client';
import { formatDate } from '@/lib/utils';
import { Button } from './button';

export function ListEngagement({
  list,
  comments,
}: {
  list: CustomList;
  comments: CustomListComment[];
}) {
  return (
    <aside className="space-y-4">
      <div className="rounded-md border border-border bg-white/6 p-5">
        <div className="flex flex-wrap gap-3">
          <ListLikeButton listId={list.id} initialLiked={list.likedByViewer ?? false} />
          {!list.viewerCanEdit ? (
            <ListFollowButton listId={list.id} initialFollowing={list.followedByViewer ?? false} />
          ) : null}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-muted">
          <Metric label="Likes" value={list.likesCount} />
          <Metric label="Comments" value={list.commentsCount} />
          <Metric label="Followers" value={list.followersCount ?? 0} />
        </div>
      </div>
      <ListComments listId={list.id} initialComments={comments} />
    </aside>
  );
}

export function ListItemManager({ list }: { list: CustomList }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MediaSummary[]>([]);
  const [items, setItems] = useState(list.listItems ?? []);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isPending, startTransition] = useTransition();

  const itemByMedia = useMemo(() => {
    return new Map(items.map((item) => [mediaKey(item.media), item]));
  }, [items]);

  useEffect(() => {
    const normalized = query.trim();
    if (normalized.length < 2) {
      setResults([]);
      return;
    }

    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await apiJson<GroupedSearchResults>(
          `/search?q=${encodeURIComponent(normalized)}`,
        );
        setResults(data.media.slice(0, 8));
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 220);

    return () => window.clearTimeout(timer);
  }, [query]);

  function add(media: MediaSummary) {
    setError(null);
    startTransition(async () => {
      try {
        const updated = await apiJson<CustomList>(`/lists/${list.id}/items`, {
          method: 'POST',
          body: JSON.stringify({ mediaType: media.mediaType, tmdbId: media.tmdbId }),
        });
        setItems(updated.listItems ?? []);
        router.refresh();
      } catch (mutationError) {
        setError(mutationError instanceof Error ? mutationError.message : 'Could not add title.');
      }
    });
  }

  function remove(media: MediaSummary) {
    setError(null);
    startTransition(async () => {
      try {
        await apiJson(
          `/lists/${list.id}/items?mediaType=${media.mediaType}&tmdbId=${media.tmdbId}`,
          { method: 'DELETE' },
        );
        setItems((current) => current.filter((item) => mediaKey(item.media) !== mediaKey(media)));
        router.refresh();
      } catch (mutationError) {
        setError(
          mutationError instanceof Error ? mutationError.message : 'Could not remove title.',
        );
      }
    });
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold">Titles</h2>
          <span className="text-sm text-muted">{items.length} saved</span>
        </div>
        {items.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {items.map((item) => (
              <article
                key={item.id}
                className="grid grid-cols-[72px_1fr] gap-3 rounded-md border border-border bg-white/6 p-3"
              >
                <img
                  src={item.media.posterUrl ?? ''}
                  alt=""
                  width={72}
                  height={108}
                  className="aspect-[2/3] rounded object-cover"
                />
                <div className="min-w-0">
                  <Link
                    href={`/${item.media.mediaType === 'movie' ? 'movie' : 'series'}/${item.media.tmdbId}`}
                    className="font-semibold hover:text-primary"
                  >
                    {item.media.title}
                  </Link>
                  <p className="mt-1 text-xs text-muted">{item.media.mediaType}</p>
                  <Button
                    type="button"
                    variant="secondary"
                    className="mt-4"
                    onClick={() => remove(item.media)}
                    disabled={isPending}
                  >
                    <Minus aria-hidden="true" className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-border bg-white/6 p-8 text-sm text-muted">
            Search for a title to start this list.
          </div>
        )}
      </div>

      <div className="rounded-md border border-border bg-white/6 p-5">
        <label className="block text-sm font-semibold">
          Find titles
          <span className="mt-2 flex items-center gap-2 rounded-md border border-border bg-black/30 px-3 py-2">
            <Search aria-hidden="true" className="h-4 w-4 text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search movies or series"
              className="min-w-0 flex-1 bg-transparent text-sm focus-visible:outline-none"
            />
          </span>
        </label>
        {error ? <p className="mt-3 text-sm text-red-200">{error}</p> : null}
        <div className="mt-4 space-y-3">
          {isSearching ? <p className="text-sm text-muted">Searching…</p> : null}
          {results.map((media) => {
            const existing = itemByMedia.get(mediaKey(media));
            return (
              <div
                key={mediaKey(media)}
                className="flex items-center gap-3 rounded border border-border bg-black/25 p-2"
              >
                <img
                  src={media.posterUrl ?? ''}
                  alt=""
                  width={44}
                  height={66}
                  className="aspect-[2/3] rounded object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{media.title}</p>
                  <p className="text-xs text-muted">{media.mediaType}</p>
                </div>
                <Button
                  type="button"
                  variant={existing ? 'secondary' : 'primary'}
                  onClick={() => (existing ? remove(media) : add(media))}
                  disabled={isPending}
                  className="shrink-0 px-3"
                >
                  {existing ? (
                    <X aria-hidden="true" className="h-4 w-4" />
                  ) : (
                    <Plus aria-hidden="true" className="h-4 w-4" />
                  )}
                  {existing ? 'Remove' : 'Add'}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function MediaListControls({
  mediaType,
  tmdbId,
  lists,
}: {
  mediaType: MediaType;
  tmdbId: number;
  lists: MediaListMembership[];
}) {
  const router = useRouter();
  const [memberships, setMemberships] = useState(lists);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setMemberships(lists);
  }, [lists]);

  function toggle(list: MediaListMembership) {
    setError(null);
    const next = !list.containsMedia;
    setMemberships((current) =>
      current.map((item) =>
        item.id === list.id
          ? { ...item, containsMedia: next, itemId: next ? item.itemId : null }
          : item,
      ),
    );
    startTransition(async () => {
      try {
        if (next) {
          const updated = await apiJson<{ listItems?: Array<{ media: MediaSummary; id: string }> }>(
            `/lists/${list.id}/items`,
            {
              method: 'POST',
              body: JSON.stringify({ mediaType, tmdbId }),
            },
          );
          const itemId =
            updated.listItems?.find(
              (item) => item.media.tmdbId === tmdbId && item.media.mediaType === mediaType,
            )?.id ?? null;
          setMemberships((current) =>
            current.map((item) => (item.id === list.id ? { ...item, itemId } : item)),
          );
        } else {
          await apiJson(`/lists/${list.id}/items?mediaType=${mediaType}&tmdbId=${tmdbId}`, {
            method: 'DELETE',
          });
        }
        router.refresh();
      } catch (mutationError) {
        setMemberships(lists);
        setError(mutationError instanceof Error ? mutationError.message : 'Could not update list.');
      }
    });
  }

  return (
    <div className="rounded-md border border-border bg-white/6 p-5">
      <h2 className="text-xl font-semibold">Lists</h2>
      {memberships.length === 0 ? (
        <div className="mt-3 text-sm text-muted">
          <p>Create a list first, then add this title.</p>
          <Link href="/lists/new" className="mt-3 inline-flex text-primary hover:underline">
            New list
          </Link>
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {memberships.map((list) => (
            <button
              key={list.id}
              type="button"
              onClick={() => toggle(list)}
              disabled={isPending}
              className="flex w-full items-center justify-between gap-3 rounded border border-border bg-black/25 px-3 py-2 text-left text-sm hover:border-primary/50 disabled:opacity-60"
            >
              <span className="min-w-0">
                <span className="block truncate font-semibold">{list.title}</span>
                <span className="text-xs text-muted">{list.isPrivate ? 'Private' : 'Public'}</span>
              </span>
              <span className={list.containsMedia ? 'text-primary' : 'text-muted'}>
                {list.containsMedia ? (
                  <Check aria-hidden="true" className="h-4 w-4" />
                ) : (
                  <Plus aria-hidden="true" className="h-4 w-4" />
                )}
              </span>
            </button>
          ))}
        </div>
      )}
      {error ? <p className="mt-3 text-sm text-red-200">{error}</p> : null}
    </div>
  );
}

export function DeleteListButton({
  listId,
  ownerUsername,
}: {
  listId: string;
  ownerUsername: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function remove() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await apiJson(`/lists/${listId}`, { method: 'DELETE' });
        router.push(`/profile/${ownerUsername}`);
        router.refresh();
      } catch (mutationError) {
        setConfirming(false);
        setError(mutationError instanceof Error ? mutationError.message : 'Could not delete list.');
      }
    });
  }

  return (
    <div>
      <Button type="button" variant="danger" onClick={remove} disabled={isPending}>
        <Trash2 aria-hidden="true" className="h-4 w-4" />
        {confirming ? 'Confirm delete' : 'Delete list'}
      </Button>
      {error ? <p className="mt-2 text-sm text-red-200">{error}</p> : null}
    </div>
  );
}

function ListLikeButton({ listId, initialLiked }: { listId: string; initialLiked: boolean }) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = !liked;
    setLiked(next);
    startTransition(async () => {
      try {
        await apiJson(`/lists/${listId}/likes`, { method: next ? 'POST' : 'DELETE' });
        router.refresh();
      } catch {
        setLiked(!next);
      }
    });
  }

  return (
    <Button
      type="button"
      variant={liked ? 'primary' : 'secondary'}
      onClick={toggle}
      disabled={isPending}
    >
      <Heart aria-hidden="true" className={liked ? 'h-4 w-4 fill-current' : 'h-4 w-4'} />
      {liked ? 'Liked' : 'Like'}
    </Button>
  );
}

function ListFollowButton({
  listId,
  initialFollowing,
}: {
  listId: string;
  initialFollowing: boolean;
}) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = !following;
    setFollowing(next);
    startTransition(async () => {
      try {
        await apiJson(`/lists/${listId}/follows`, { method: next ? 'POST' : 'DELETE' });
        router.refresh();
      } catch {
        setFollowing(!next);
      }
    });
  }

  return (
    <Button
      type="button"
      variant={following ? 'primary' : 'secondary'}
      onClick={toggle}
      disabled={isPending}
    >
      <Bell aria-hidden="true" className={following ? 'h-4 w-4 fill-current' : 'h-4 w-4'} />
      {following ? 'Following' : 'Follow list'}
    </Button>
  );
}

function ListComments({
  listId,
  initialComments,
}: {
  listId: string;
  initialComments: CustomListComment[];
}) {
  const router = useRouter();
  const [comments, setComments] = useState(initialComments);
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!body.trim()) return;
    setError(null);
    startTransition(async () => {
      try {
        const comment = await apiJson<CustomListComment>(`/lists/${listId}/comments`, {
          method: 'POST',
          body: JSON.stringify({ body }),
        });
        setComments((current) => [...current, comment]);
        setBody('');
        router.refresh();
      } catch (mutationError) {
        setError(mutationError instanceof Error ? mutationError.message : 'Could not add comment.');
      }
    });
  }

  return (
    <div className="rounded-md border border-border bg-white/6 p-5">
      <div className="flex items-center gap-2">
        <MessageCircle aria-hidden="true" className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Comments</h2>
      </div>
      <div className="mt-4 space-y-3">
        {comments.length === 0 ? <p className="text-sm text-muted">No comments yet.</p> : null}
        {comments.map((comment) => (
          <article key={comment.id} className="rounded border border-border bg-black/25 p-3">
            <p className="text-sm leading-6">{comment.body}</p>
            <p className="mt-2 text-xs text-muted">
              {comment.user.displayName} · {formatDate(comment.createdAt)}
            </p>
          </article>
        ))}
      </div>
      <form onSubmit={submit} className="mt-4">
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Add a comment"
          className="min-h-24 w-full rounded-md border border-border bg-black/30 px-3 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
        />
        {error ? <p className="mt-2 text-sm text-red-200">{error}</p> : null}
        <Button type="submit" className="mt-3" disabled={isPending || !body.trim()}>
          Comment
        </Button>
      </form>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-border bg-black/25 p-2">
      <p className="text-lg font-semibold text-foreground">{value}</p>
      <p>{label}</p>
    </div>
  );
}

function mediaKey(media: Pick<MediaSummary, 'mediaType' | 'tmdbId'>) {
  return `${media.mediaType}:${media.tmdbId}`;
}
