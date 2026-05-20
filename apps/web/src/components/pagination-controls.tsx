import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';

export function PaginationControls() {
  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      <Button type="button" variant="secondary" disabled>
        <ChevronLeft aria-hidden="true" className="h-4 w-4" />
        Previous
      </Button>
      <Button type="button" variant="secondary">
        Next
        <ChevronRight aria-hidden="true" className="h-4 w-4" />
      </Button>
    </div>
  );
}
