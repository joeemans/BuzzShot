'use client';

import { Bookmark, CheckCircle2, Heart, Plus, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
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
  const [isPending, startTransition] = useTransition();
  const Icon = icon === 'watchlist' ? Bookmark : icon === 'watched' ? CheckCircle2 : Heart;

  function toggle() {
    if (!mediaType || !tmdbId) {
      setActive((value) => !value);
      return;
    }
    const next = !active;
    setActive(next);
    startTransition(async () => {
      try {
        if (next) {
          await apiJson(`/${endpoint}`, {
            method: 'POST',
            body: JSON.stringify({ mediaType, tmdbId }),
          });
        } else {
          await apiJson(`/${endpoint}?mediaType=${mediaType}&tmdbId=${tmdbId}`, { method: 'DELETE' });
        }
        router.refresh();
      } catch {
        setActive(!next);
        router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      }
    });
  }

  return (
    <Button
      type="button"
      variant={active ? 'primary' : 'secondary'}
      onClick={toggle}
      aria-pressed={active}
      disabled={isPending}
    >
      <Icon aria-hidden="true" className="h-4 w-4" />
      {active ? activeLabel : label}
    </Button>
  );
}

export function WatchlistButton(props: { mediaType?: MediaType; tmdbId?: number; initialActive?: boolean }) {
  return <ToggleAction label="Watchlist" activeLabel="Saved" icon="watchlist" endpoint="watchlist" {...props} />;
}

export function WatchedButton(props: { mediaType?: MediaType; tmdbId?: number; initialActive?: boolean }) {
  return <ToggleAction label="Watched" activeLabel="Watched" icon="watched" endpoint="watched" {...props} />;
}

export function FavoriteButton(props: { mediaType?: MediaType; tmdbId?: number; initialActive?: boolean }) {
  return <ToggleAction label="Favorite" activeLabel="Favorite" icon="favorite" endpoint="favorites" {...props} />;
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
}: {
  mediaType?: MediaType;
  tmdbId?: number;
  initialRating?: number;
  onChange?: (value: number) => void;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(initialRating);
  const [isPending, startTransition] = useTransition();

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

  return (
    <div className="flex items-center gap-1" aria-label="Your rating">
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
  );
}
