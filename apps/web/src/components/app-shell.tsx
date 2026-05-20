import Link from 'next/link';
import { Film, Home, List, Menu, UserRound } from 'lucide-react';
import type { ReactNode } from 'react';
import { ButtonLink } from './button';
import { SearchBar } from './search-bar';

const nav = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/movies', label: 'Movies', icon: Film },
  { href: '/series', label: 'Series', icon: Film },
  { href: '/feed', label: 'Feed', icon: List },
  { href: '/for-you', label: 'For You', icon: UserRound },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/88 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-black">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-primary text-black">B</span>
          BuzzShot
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-muted transition hover:bg-white/8 hover:text-foreground"
            >
              <item.icon aria-hidden="true" className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto hidden w-full max-w-md lg:block">
          <SearchBar compact />
        </div>
        <div className="ml-auto hidden items-center gap-2 md:flex lg:ml-0">
          <ButtonLink href="/login" variant="ghost">
            Log in
          </ButtonLink>
          <ButtonLink href="/register">Join</ButtonLink>
        </div>
        <button
          type="button"
          aria-label="Open navigation"
          className="ml-auto inline-flex rounded-md border border-border p-2 md:hidden"
        >
          <Menu aria-hidden="true" className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/92 px-2 py-2 backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-5 gap-1">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 rounded-md px-1 py-2 text-xs font-semibold text-muted"
          >
            <item.icon aria-hidden="true" className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export function UserMenu() {
  return (
    <div className="rounded-md border border-border bg-white/6 p-2 text-sm">
      <Link href="/settings/profile" className="block rounded px-3 py-2 hover:bg-white/8">
        Profile settings
      </Link>
      <Link href="/settings/account" className="block rounded px-3 py-2 hover:bg-white/8">
        Account
      </Link>
      <Link href="/settings/security" className="block rounded px-3 py-2 hover:bg-white/8">
        Security
      </Link>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to Content
      </a>
      <Navbar />
      <main id="main-content" className="min-h-screen pb-24 md:pb-0">
        {children}
      </main>
      <MobileNav />
    </>
  );
}
