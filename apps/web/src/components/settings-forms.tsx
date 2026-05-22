'use client';

import { useRouter } from 'next/navigation';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import type { AuthUser, Profile } from '@buzzshot/shared';
import { apiJson } from '@/lib/auth-client';
import { Button } from './button';

export function ProfileSettingsForm({ profile }: { profile: Profile | null }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl ?? '');
  const [avatarError, setAvatarError] = useState<string | null>(null);

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
        avatarUrl: nullableString(avatarUrl),
        favoriteGenres,
      }),
    });
    setMessage('Profile saved.');
    router.refresh();
  }

  async function onAvatarFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    setAvatarError(null);

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setAvatarError('Use a JPEG, PNG, or WebP image.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError('Avatar images must be under 2 MB.');
      return;
    }

    const objectUrl = window.URL.createObjectURL(file);
    try {
      setAvatarUrl(await resizeAvatar(objectUrl));
    } catch (error) {
      setAvatarError(error instanceof Error ? error.message : 'Could not prepare avatar.');
    } finally {
      window.URL.revokeObjectURL(objectUrl);
      event.currentTarget.value = '';
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-md border border-border bg-white/6 p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
        <div className="shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              width={96}
              height={96}
              className="h-24 w-24 rounded-md border border-border object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-md border border-border bg-black/30 text-3xl font-black text-muted">
              {profile?.displayName.slice(0, 1) ?? 'B'}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <label className="block text-sm font-semibold">
            Avatar URL
            <input
              value={avatarUrl}
              onChange={(event) => setAvatarUrl(event.target.value)}
              autoComplete="photo"
              placeholder="https://example.com/avatar.jpg"
              className="mt-2 w-full rounded-md border border-border bg-black/30 px-3 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
            />
          </label>
          <label className="mt-3 inline-flex cursor-pointer rounded-md border border-border bg-white/8 px-4 py-2 text-sm font-semibold hover:bg-white/12">
            Upload image
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={onAvatarFile}
              className="sr-only"
            />
          </label>
          {avatarError ? <p className="mt-2 text-sm text-red-200">{avatarError}</p> : null}
        </div>
      </div>

      <Field
        name="displayName"
        label="Display name"
        autoComplete="name"
        defaultValue={profile?.displayName ?? ''}
      />
      <Field
        name="location"
        label="Location"
        autoComplete="address-level2"
        defaultValue={profile?.location ?? ''}
      />
      <label className="mt-4 block text-sm font-semibold">
        Bio
        <textarea
          name="bio"
          autoComplete="off"
          defaultValue={profile?.bio ?? ''}
          className="mt-2 min-h-28 w-full rounded-md border border-border bg-black/30 px-3 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
        />
      </label>
      <Field
        name="favoriteGenres"
        label="Favorite genres"
        autoComplete="off"
        placeholder="Drama, Thriller"
        defaultValue={profile?.favoriteGenres.join(', ') ?? ''}
      />
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
      setError(
        submissionError instanceof Error ? submissionError.message : 'Could not change password.',
      );
    }
  }

  async function logoutAll() {
    await apiJson('/auth/logout-all', { method: 'POST' });
    setMessage('All sessions were revoked.');
  }

  return (
    <form onSubmit={onSubmit} className="rounded-md border border-border bg-white/6 p-6">
      <Field
        name="currentPassword"
        label="Current password"
        type="password"
        autoComplete="current-password"
      />
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
  defaultValue,
}: {
  name: string;
  label: string;
  type?: string;
  autoComplete: string;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <label className="mt-4 block text-sm font-semibold first:mt-0">
      {label}
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="mt-2 w-full rounded-md border border-border bg-black/30 px-3 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
      />
    </label>
  );
}

function nullableString(value: FormDataEntryValue | null) {
  const text = String(value ?? '').trim();
  return text ? text : null;
}

function resizeAvatar(src: string) {
  return new Promise<string>((resolve, reject) => {
    const image = document.createElement('img');
    image.onload = () => {
      const size = 192;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext('2d');
      if (!context) {
        reject(new Error('Could not prepare avatar.'));
        return;
      }
      const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
      const sourceX = Math.max(0, (image.naturalWidth - sourceSize) / 2);
      const sourceY = Math.max(0, (image.naturalHeight - sourceSize) / 2);
      context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, size, size);
      const dataUrl = canvas.toDataURL('image/webp', 0.82);
      if (dataUrl.length > 90000) {
        reject(new Error('Choose a smaller avatar image.'));
        return;
      }
      resolve(dataUrl);
    };
    image.onerror = () => reject(new Error('Could not read avatar image.'));
    image.src = src;
  });
}
