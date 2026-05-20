import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ButtonProps = ComponentPropsWithoutRef<'button'> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
};

const variants = {
  primary: 'bg-primary text-black hover:bg-primary/90',
  secondary: 'border border-border bg-white/8 text-foreground hover:bg-white/12',
  ghost: 'text-muted hover:bg-white/8 hover:text-foreground',
  danger: 'border border-red-400/40 bg-red-500/10 text-red-100 hover:bg-red-500/20',
};

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export function ButtonLink({
  href,
  children,
  className,
  variant = 'primary',
}: {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: ButtonProps['variant'];
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70',
        variants[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}
