import Link from 'next/link';
import { Clapperboard, Home, ListVideo, Menu, Sparkles, Tv, UserRound } from 'lucide-react';
import type { ReactNode } from 'react';
import { ButtonLink } from './button';
import { SearchBar } from './search-bar';

const nav = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/movies', label: 'Movies', icon: Clapperboard },
  { href: '/series', label: 'Series', icon: Tv },
  { href: '/feed', label: 'Feed', icon: ListVideo },
  { href: '/for-you', label: 'For You', icon: UserRound },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-background/[0.76] backdrop-blur-2xl">
      <div className="mx-auto flex h-[4.75rem] max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-3 text-lg font-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
        >
          <span className="grid h-10 w-10 place-items-center rounded-lg border border-primary/[0.35] bg-primary/[0.12] text-primary shadow-[0_0_32px_rgba(246,192,47,0.16)] transition group-hover:border-primary/70 group-hover:bg-primary/[0.18]">
            <Clapperboard aria-hidden="true" className="h-5 w-5" />
          </span>
          <span className="text-xl leading-none">BuzzShot</span>
        </Link>
        <nav className="hidden items-center rounded-full border border-white/[0.08] bg-white/[0.045] p-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold text-muted transition hover:bg-white/[0.08] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
            >
              <item.icon aria-hidden="true" className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto hidden min-w-[18rem] max-w-xl flex-1 lg:block">
          <SearchBar compact />
        </div>
        <div className="ml-auto hidden items-center gap-2 md:flex lg:ml-0">
          <ButtonLink href="/login" variant="ghost" className="rounded-full px-4">
            Log in
          </ButtonLink>
          <ButtonLink href="/register" className="rounded-full px-5 shadow-[0_0_24px_rgba(246,192,47,0.18)]">
            <Sparkles aria-hidden="true" className="h-4 w-4" />
            Join
          </ButtonLink>
        </div>
        <button
          type="button"
          aria-label="Open navigation"
          className="ml-auto inline-flex rounded-full border border-white/[0.12] bg-white/[0.05] p-2 md:hidden"
        >
          <Menu aria-hidden="true" className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.08] bg-background/[0.92] px-2 py-2 backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-5 gap-1">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-xs font-semibold text-muted transition hover:bg-white/[0.08] hover:text-foreground"
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
