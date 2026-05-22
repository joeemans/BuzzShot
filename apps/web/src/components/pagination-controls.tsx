import Link from 'next/link';
import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

function pageHref(basePath: string, page: number) {
  return page <= 1 ? basePath : `${basePath}?page=${page}`;
}

function PaginationButton({
  href,
  disabled,
  children,
  label,
}: {
  href: string;
  disabled: boolean;
  children: ReactNode;
  label: string;
}) {
  const className = cn(
    'inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-border bg-white/8 px-4 py-2 text-sm font-semibold text-foreground transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70',
    disabled ? 'pointer-events-none opacity-50' : 'hover:bg-white/12',
  );

  if (disabled) {
    return (
      <span className={className} aria-disabled="true">
        {children}
      </span>
    );
  }

  return (
    <Link href={href} className={className} aria-label={label}>
      {children}
    </Link>
  );
}

export function PaginationControls({
  basePath,
  page,
  totalPages,
}: {
  basePath: string;
  page: number;
  totalPages: number;
}) {
  const currentPage = Math.max(1, page);
  const pageCount = Math.max(1, totalPages);
  const previousPage = currentPage - 1;
  const nextPage = currentPage + 1;

  return (
    <nav
      className="mt-8 flex flex-wrap items-center justify-center gap-3"
      aria-label="Catalog pages"
    >
      <PaginationButton
        href={pageHref(basePath, previousPage)}
        disabled={currentPage <= 1}
        label={`Go to page ${previousPage}`}
      >
        <ChevronLeft aria-hidden="true" className="h-4 w-4" />
        Previous
      </PaginationButton>
      <span className="min-h-10 rounded-md border border-border bg-black/20 px-4 py-2 text-sm font-semibold text-muted">
        Page <span className="text-foreground">{currentPage}</span> of{' '}
        <span className="text-foreground">{pageCount}</span>
      </span>
      <PaginationButton
        href={pageHref(basePath, nextPage)}
        disabled={currentPage >= pageCount}
        label={`Go to page ${nextPage}`}
      >
        Next
        <ChevronRight aria-hidden="true" className="h-4 w-4" />
      </PaginationButton>
    </nav>
  );
}
