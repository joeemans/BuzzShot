import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function RatingStars({ value, label }: { value: number; label?: string }) {
  return (
    <span className="inline-flex items-center gap-1" aria-label={label ?? `${value} out of 5`}>
      {Array.from({ length: 5 }, (_, index) => {
        const active = index + 1 <= Math.round(value);
        return (
          <Star
            key={index}
            aria-hidden="true"
            className={cn('h-4 w-4', active ? 'fill-primary text-primary' : 'text-white/25')}
          />
        );
      })}
      <span className="ml-1 text-sm font-semibold text-foreground">{value.toFixed(1)}</span>
    </span>
  );
}
