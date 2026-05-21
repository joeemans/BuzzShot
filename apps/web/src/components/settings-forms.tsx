'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import type { AuthUser } from '@buzzshot/shared';
import { apiJson } from '@/lib/auth-client';
import { Button } from './button';

export function ProfileSettingsForm() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const favoriteGenres = String(formData.get('favoriteGenres') ?? '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 8);

    await apiJson('/profiles/me', {
      method: 'PATCH',
      body: JSON.stringify({
        displayName: String(formData.get('displayName') ?? ''),
        bio: nullableString(formData.get('bio')),
        location: nullableString(formData.get('location')),
        favoriteGenres,
      }),
    });
    setMessage('Profile saved.');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="rounded-md border border-border bg-white/6 p-6">
      <Field name="displayName" label="Display name" autoComplete="name" />
      <Field name="location" label="Location" autoComplete="address-level2" />
      <label className="mt-4 block text-sm font-semibold">
        Bio
        <textarea
          name="bio"
          autoComplete="off"
          className="mt-2 min-h-28 w-full rounded-md border border-border bg-black/30 px-3 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
        />
      </label>
      <Field name="favoriteGenres" label="Favorite genres" autoComplete="off" placeholder="Drama, Thriller" />
      {message ? <p className="mt-3 text-sm text-primary">{message}</p> : null}
      <Button type="submit" className="mt-6">
        Save profile
      </Button>
    </form>
  );
}

export function AccountSettingsPanel({ user }: { user: AuthUser | null }) {
  return (
    <div className="rounded-md border border-border bg-white/6 p-6">
      <dl className="grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase text-muted">Email</dt>
          <dd className="mt-1 font-semibold">{user?.email ?? 'Unavailable'}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-muted">Username</dt>
          <dd className="mt-1 font-semibold">@{user?.username ?? 'unknown'}</dd>
        </div>
      </dl>
      <p className="mt-5 text-sm leading-6 text-muted">
        Email and username edits need verification flows; v1 keeps them explicit and read-only here.
      </p>
    </div>
  );
}

export function SecuritySettingsForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    try {
      await apiJson('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: String(formData.get('currentPassword') ?? ''),
          newPassword: String(formData.get('newPassword') ?? ''),
        }),
      });
      setMessage('Password changed. Other sessions were revoked.');
      event.currentTarget.reset();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Could not change password.');
    }
  }

  async function logoutAll() {
    await apiJson('/auth/logout-all', { method: 'POST' });
    setMessage('All sessions were revoked.');
  }

  return (
    <form onSubmit={onSubmit} className="rounded-md border border-border bg-white/6 p-6">
      <Field name="currentPassword" label="Current password" type="password" autoComplete="current-password" />
      <Field name="newPassword" label="New password" type="password" autoComplete="new-password" />
      {message ? <p className="mt-3 text-sm text-primary">{message}</p> : null}
      {error ? <p className="mt-3 text-sm text-red-200">{error}</p> : null}
      <div className="mt-6 flex flex-wrap gap-3">
        <Button type="submit">Change password</Button>
        <Button type="button" variant="secondary" onClick={logoutAll}>
          Log out all devices
        </Button>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  type = 'text',
  autoComplete,
  placeholder,
}: {
  name: string;
  label: string;
  type?: string;
  autoComplete: string;
  placeholder?: string;
}) {
  return (
    <label className="mt-4 block text-sm font-semibold first:mt-0">
      {label}
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="mt-2 w-full rounded-md border border-border bg-black/30 px-3 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
      />
    </label>
  );
}

function nullableString(value: FormDataEntryValue | null) {
  const text = String(value ?? '').trim();
  return text ? text : null;
}
