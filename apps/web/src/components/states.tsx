import { AlertCircle, Film, Loader2 } from 'lucide-react';
import { ButtonLink } from './button';

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-md border border-dashed border-border bg-white/5 p-8 text-center">
      <Film aria-hidden="true" className="mx-auto h-9 w-9 text-primary" />
      <h2 className="mt-4 text-xl font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted">{description}</p>
      {actionHref && actionLabel ? (
        <ButtonLink href={actionHref} className="mt-5">
          {actionLabel}
        </ButtonLink>
      ) : null}
    </div>
  );
}

export function ErrorState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-md border border-red-400/30 bg-red-500/10 p-6">
      <AlertCircle aria-hidden="true" className="h-6 w-6 text-red-200" />
      <h2 className="mt-3 text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-red-100/80">{description}</p>
    </div>
  );
}

export function LoadingSkeleton({ label = 'Loading BuzzShot' }: { label?: string }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label={label}>
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-md border border-border bg-white/5">
          <div className="aspect-[2/3] animate-pulse bg-white/10" />
          <div className="space-y-3 p-4">
            <div className="h-4 animate-pulse rounded bg-white/10" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function InlineLoader() {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-muted">
      <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
      Loading
    </span>
  );
}
