import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppShell } from '@/components/app-shell';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'BuzzShot',
    template: '%s | BuzzShot',
  },
  description: 'A social movie and series discovery platform for ratings, reviews, lists, and recommendations.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://image.tmdb.org" />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
