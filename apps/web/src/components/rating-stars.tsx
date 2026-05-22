import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function RatingStars({
  value,
  label,
  size = 'sm',
}: {
  value: number;
  label?: string;
  size?: 'sm' | 'lg';
}) {
  const iconClassName = size === 'lg' ? 'h-6 w-6' : 'h-4 w-4';

  return (
    <span className="inline-flex items-center gap-1" aria-label={label ?? `${value} out of 5`}>
      {Array.from({ length: 5 }, (_, index) => {
        const active = index + 1 <= Math.round(value);
        return (
          <Star
            key={index}
            aria-hidden="true"
            className={cn(iconClassName, active ? 'fill-primary text-primary' : 'text-white/25')}
          />
        );
      })}
      <span className="ml-1 text-sm font-semibold text-foreground">{value.toFixed(1)}</span>
    </span>
  );
}
