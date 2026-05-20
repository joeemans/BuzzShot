'use client';

import { Bookmark, CheckCircle2, Heart, Plus, Star } from 'lucide-react';
import { useState } from 'react';
import { Button } from './button';

function ToggleAction({
  label,
  activeLabel,
  icon,
}: {
  label: string;
  activeLabel: string;
  icon: 'watchlist' | 'watched' | 'favorite';
}) {
  const [active, setActive] = useState(false);
  const Icon = icon === 'watchlist' ? Bookmark : icon === 'watched' ? CheckCircle2 : Heart;
  return (
    <Button
      type="button"
      variant={active ? 'primary' : 'secondary'}
      onClick={() => setActive((value) => !value)}
      aria-pressed={active}
    >
      <Icon aria-hidden="true" className="h-4 w-4" />
      {active ? activeLabel : label}
    </Button>
  );
}

export function WatchlistButton() {
  return <ToggleAction label="Watchlist" activeLabel="Saved" icon="watchlist" />;
}

export function WatchedButton() {
  return <ToggleAction label="Watched" activeLabel="Watched" icon="watched" />;
}

export function FavoriteButton() {
  return <ToggleAction label="Favorite" activeLabel="Favorite" icon="favorite" />;
}

export function FollowButton() {
  const [following, setFollowing] = useState(false);
  return (
    <Button
      type="button"
      variant={following ? 'secondary' : 'primary'}
      onClick={() => setFollowing((value) => !value)}
      aria-pressed={following}
    >
      <Plus aria-hidden="true" className="h-4 w-4" />
      {following ? 'Following' : 'Follow'}
    </Button>
  );
}

export function RatingControl() {
  const [rating, setRating] = useState(0);
  return (
    <div className="flex items-center gap-1" aria-label="Your rating">
      {Array.from({ length: 5 }, (_, index) => {
        const value = index + 1;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
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
