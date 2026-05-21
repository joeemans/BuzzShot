'use client';

import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { apiJson } from '@/lib/auth-client';
import { Button } from './button';

export function ReviewLikeButton({ reviewId, initialLiked = false }: { reviewId: string; initialLiked?: boolean }) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = !liked;
    setLiked(next);
    startTransition(async () => {
      try {
        await apiJson(`/reviews/${reviewId}/likes`, { method: next ? 'POST' : 'DELETE' });
        router.refresh();
      } catch {
        setLiked(!next);
        router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      }
    });
  }

  return (
    <Button type="button" onClick={toggle} disabled={isPending} variant={liked ? 'primary' : 'secondary'}>
      <Heart aria-hidden="true" className={liked ? 'h-4 w-4 fill-current' : 'h-4 w-4'} />
      {liked ? 'Liked' : 'Like review'}
    </Button>
  );
}
