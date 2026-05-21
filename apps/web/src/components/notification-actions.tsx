'use client';

import { CheckCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { apiJson } from '@/lib/auth-client';
import { Button } from './button';

export function MarkNotificationsReadButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function markRead() {
    startTransition(async () => {
      await apiJson('/notifications/read', {
        method: 'PATCH',
        body: JSON.stringify({}),
      });
      router.refresh();
    });
  }

  return (
    <Button type="button" variant="secondary" onClick={markRead} disabled={isPending}>
      <CheckCheck aria-hidden="true" className="h-4 w-4" />
      Mark read
    </Button>
  );
}
