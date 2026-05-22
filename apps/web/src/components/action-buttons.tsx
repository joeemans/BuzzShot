'use client';

import { Bookmark, CheckCircle2, Heart, Plus, Star, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import type { MediaType } from '@buzzshot/shared';
import { apiJson } from '@/lib/auth-client';
import { Button } from './button';

function ToggleAction({
  label,
  activeLabel,
  icon,
  endpoint,
  mediaType,
  tmdbId,
  initialActive = false,
}: {
  label: string;
  activeLabel: string;
  icon: 'watchlist' | 'watched' | 'favorite';
  endpoint: 'watchlist' | 'watched' | 'favorites';
  mediaType?: MediaType;
  tmdbId?: number;
  initialActive?: boolean;
}) {
  const router = useRouter();
  const [active, setActive] = useState(initialActive);
  const [isSaving, setIsSaving] = useState(false);
  const itemKey = mediaType && tmdbId ? `${mediaType}:${tmdbId}` : 'demo';
  const itemKeyRef = useRef(itemKey);
  const savingRef = useRef(false);
  const Icon = icon === 'watchlist' ? Bookmark : icon === 'watched' ? CheckCircle2 : Heart;

  useEffect(() => {
    if (itemKeyRef.current !== itemKey) {
      itemKeyRef.current = itemKey;
      setActive(initialActive);
    }
  }, [initialActive, itemKey]);

  async function toggle() {
    if (savingRef.current) return;
    if (!mediaType || !tmdbId) {
      setActive((value) => !value);
      return;
    }
    const previous = active;
    const next = !active;
    setActive(next);
    savingRef.current = true;
    setIsSaving(true);
    try {
      if (next) {
        await apiJson(`/${endpoint}`, {
          method: 'POST',
          body: JSON.stringify({ mediaType, tmdbId }),
        });
      } else {
        const params = new URLSearchParams({ mediaType, tmdbId: String(tmdbId) });
        await apiJson(`/${endpoint}?${params.toString()}`, { method: 'DELETE' });
      }
      router.refresh();
    } catch {
      setActive(previous);
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  }

  return (
    <Button
      type="button"
      variant={active ? 'primary' : 'secondary'}
      onClick={toggle}
      aria-pressed={active}
      disabled={isSaving}
    >
      <Icon aria-hidden="true" className="h-4 w-4" />
      {active ? activeLabel : label}
    </Button>
  );
}

export function WatchlistButton(props: {
  mediaType?: MediaType;
  tmdbId?: number;
  initialActive?: boolean;
}) {
  return (
    <ToggleAction
      label="Watchlist"
      activeLabel="In watchlist"
      icon="watchlist"
      endpoint="watchlist"
      {...props}
    />
  );
}

export function WatchedButton(props: {
  mediaType?: MediaType;
  tmdbId?: number;
  initialActive?: boolean;
}) {
  return (
    <ToggleAction
      label="Watched"
      activeLabel="Watched"
      icon="watched"
      endpoint="watched"
      {...props}
    />
  );
}

export function FavoriteButton(props: {
  mediaType?: MediaType;
  tmdbId?: number;
  initialActive?: boolean;
}) {
  return (
    <ToggleAction
      label="Favorite"
      activeLabel="Favorited"
      icon="favorite"
      endpoint="favorites"
      {...props}
    />
  );
}

export function FollowButton({
  userId,
  username,
  initialFollowing = false,
}: {
  userId?: string;
  username?: string;
  initialFollowing?: boolean;
}) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    if (!userId && !username) {
      setFollowing((value) => !value);
      return;
    }
    const next = !following;
    setFollowing(next);
    startTransition(async () => {
      try {
        if (next) {
          await apiJson('/follows', { method: 'POST', body: JSON.stringify({ userId, username }) });
        } else {
          const params = userId ? `userId=${userId}` : `username=${username}`;
          await apiJson(`/follows?${params}`, { method: 'DELETE' });
        }
        router.refresh();
      } catch {
        setFollowing(!next);
        router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      }
    });
  }

  return (
    <Button
      type="button"
      variant={following ? 'secondary' : 'primary'}
      onClick={toggle}
      aria-pressed={following}
      disabled={isPending}
    >
      <Plus aria-hidden="true" className="h-4 w-4" />
      {following ? 'Following' : 'Follow'}
    </Button>
  );
}

export function RatingControl({
  mediaType,
  tmdbId,
  initialRating = 0,
  onChange,
  label = 'Your rating',
}: {
  mediaType?: MediaType;
  tmdbId?: number;
  initialRating?: number;
  onChange?: (value: number) => void;
  label?: string;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(initialRating);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setRating(initialRating);
  }, [initialRating]);

  function rate(value: number) {
    setRating(value);
    onChange?.(value);
    if (!mediaType || !tmdbId) return;
    startTransition(async () => {
      try {
        await apiJson('/ratings', {
          method: 'POST',
          body: JSON.stringify({ mediaType, tmdbId, value }),
        });
        router.refresh();
      } catch {
        router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      }
    });
  }

  function clearRating() {
    setRating(0);
    onChange?.(0);
    if (!mediaType || !tmdbId) return;
    startTransition(async () => {
      try {
        const params = new URLSearchParams({ mediaType, tmdbId: String(tmdbId) });
        await apiJson(`/ratings?${params.toString()}`, { method: 'DELETE' });
        router.refresh();
      } catch {
        router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label={label}>
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, index) => {
          const value = index + 1;
          return (
            <button
              key={value}
              type="button"
              onClick={() => rate(value)}
              disabled={isPending}
              className="rounded p-1 text-primary transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
              aria-label={`Rate ${value} stars`}
            >
              <Star
                aria-hidden="true"
                className={rating >= value ? 'h-6 w-6 fill-primary' : 'h-6 w-6 text-white/30'}
              />
            </button>
          );
        })}
      </div>
      {rating > 0 ? (
        <Button
          type="button"
          variant="ghost"
          className="min-h-8 px-2 py-1 text-xs"
          onClick={clearRating}
          disabled={isPending}
        >
          <X aria-hidden="true" className="h-3.5 w-3.5" />
          Clear
        </Button>
      ) : null}
    </div>
  );
}
