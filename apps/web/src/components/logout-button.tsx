'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/button';
import { logout } from '@/lib/auth-client';

export function LogoutButton() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onClick() {
    setIsSubmitting(true);
    await logout();
    router.push('/login');
    router.refresh();
  }

  return (
    <Button type="button" variant="ghost" className="rounded-full px-4" onClick={onClick} disabled={isSubmitting}>
      <LogOut aria-hidden="true" className="h-4 w-4" />
      Log out
    </Button>
  );
}
