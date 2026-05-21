'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn, UserPlus } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/button';
import { googleAuthUrl, login, register } from '@/lib/auth-client';

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const isLogin = mode === 'login';
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'google') {
      setError('Google sign-in did not complete. Try again or use email and password.');
    }
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    setIsSubmitting(true);
    try {
      if (isLogin) {
        const input = {
          identifier: String(formData.get('identifier') ?? ''),
          password: String(formData.get('password') ?? ''),
        };
        const validationError = validateLogin(input);
        if (validationError) {
          setError(validationError);
          return;
        }
        await login(input);
      } else {
        const input = {
          displayName: String(formData.get('displayName') ?? ''),
          email: String(formData.get('email') ?? ''),
          username: String(formData.get('username') ?? ''),
          password: String(formData.get('password') ?? ''),
        };
        const validationError = validateRegister(input);
        if (validationError) {
          setError(validationError);
          return;
        }
        await register(input);
      }
      router.push(returnTo());
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function continueWithGoogle() {
    window.location.href = googleAuthUrl(returnTo());
  }

  return (
    <form onSubmit={onSubmit} className="rounded-md border border-border bg-white/6 p-6">
      {!isLogin ? (
        <label className="block text-sm font-semibold">
          Display name
          <input
            name="displayName"
            autoComplete="name"
            required
            minLength={2}
            maxLength={80}
            className="mt-2 w-full rounded-md border border-border bg-black/30 px-3 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
          />
        </label>
      ) : null}
      <label className="mt-4 block text-sm font-semibold">
        {isLogin ? 'Email or username' : 'Email'}
        <input
          name={isLogin ? 'identifier' : 'email'}
          type={isLogin ? 'text' : 'email'}
          autoComplete={isLogin ? 'username' : 'email'}
          spellCheck={false}
          required
          className="mt-2 w-full rounded-md border border-border bg-black/30 px-3 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
        />
      </label>
      {!isLogin ? (
        <label className="mt-4 block text-sm font-semibold">
          Username
          <input
            name="username"
            autoComplete="username"
            spellCheck={false}
            required
            minLength={3}
            maxLength={24}
            pattern="[A-Za-z0-9_]+"
            className="mt-2 w-full rounded-md border border-border bg-black/30 px-3 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
          />
        </label>
      ) : null}
      <label className="mt-4 block text-sm font-semibold">
        Password
        <input
          name="password"
          type="password"
          autoComplete={isLogin ? 'current-password' : 'new-password'}
          required
          minLength={isLogin ? 1 : 10}
          className="mt-2 w-full rounded-md border border-border bg-black/30 px-3 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
        />
      </label>
      {error ? (
        <p role="alert" className="mt-4 rounded-md border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">
          {error}
        </p>
      ) : null}
      <Button type="submit" className="mt-6 w-full" disabled={isSubmitting}>
        {isLogin ? <LogIn aria-hidden="true" className="h-4 w-4" /> : <UserPlus aria-hidden="true" className="h-4 w-4" />}
        {isSubmitting ? 'Please wait' : isLogin ? 'Log in' : 'Create account'}
      </Button>
      <Button type="button" variant="secondary" className="mt-3 w-full" onClick={continueWithGoogle}>
        Continue with Google
      </Button>
      <p className="mt-5 text-center text-sm text-muted">
        {isLogin ? (
          <>
            New here?{' '}
            <Link href="/register" className="font-semibold text-primary">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already joined?{' '}
            <Link href="/login" className="font-semibold text-primary">
              Log in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}

function returnTo() {
  const params = new URLSearchParams(window.location.search);
  const next = params.get('next');
  if (next?.startsWith('/') && !next.startsWith('//')) return next;
  return '/feed';
}

function validateLogin(input: { identifier: string; password: string }) {
  if (input.identifier.trim().length < 3) return 'Enter your email or username.';
  if (!input.password) return 'Enter your password.';
  return null;
}

function validateRegister(input: { displayName: string; email: string; username: string; password: string }) {
  if (input.displayName.trim().length < 2) return 'Display name needs at least 2 characters.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) return 'Enter a valid email address.';
  if (!/^[A-Za-z0-9_]{3,24}$/.test(input.username)) {
    return 'Username must be 3-24 characters using letters, numbers, and underscores.';
  }
  if (input.password.length < 10) return 'Password needs at least 10 characters.';
  if (!/[a-z]/.test(input.password)) return 'Password needs a lowercase letter.';
  if (!/[A-Z]/.test(input.password)) return 'Password needs an uppercase letter.';
  if (!/[0-9]/.test(input.password)) return 'Password needs a number.';
  return null;
}
