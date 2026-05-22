'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { KeyboardEvent, ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from './button';

export function ScrollableRail({
  title,
  children,
  itemCount,
}: {
  title: string;
  children: ReactNode;
  itemCount: number;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const element = scroller.current;
    if (!element) return;
    setCanScrollLeft(element.scrollLeft > 4);
    setCanScrollRight(element.scrollLeft + element.clientWidth < element.scrollWidth - 4);
  }, []);

  const scroll = useCallback(
    (direction: -1 | 1) => {
      const element = scroller.current;
      if (!element) return;
      element.scrollBy({
        left: direction * Math.max(240, element.clientWidth - 96),
        behavior: 'smooth',
      });
      window.setTimeout(updateScrollState, 240);
    },
    [updateScrollState],
  );

  useEffect(() => {
    const element = scroller.current;
    if (!element) return undefined;

    updateScrollState();
    const onScroll = () => updateScrollState();
    const observer =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updateScrollState);

    element.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    observer?.observe(element);
    window.setTimeout(updateScrollState, 0);

    return () => {
      element.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      observer?.disconnect();
    };
  }, [itemCount, updateScrollState]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      scroll(-1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      scroll(1);
    }
  }

  return (
    <section className="min-w-0 overflow-hidden">
      <div className="mb-4 flex min-w-0 items-center justify-between gap-3">
        <h2 className="min-w-0 text-2xl font-semibold">{title}</h2>
        <div className="flex shrink-0 gap-2">
          <Button
            type="button"
            variant="secondary"
            className="h-9 w-9 px-0"
            onClick={() => scroll(-1)}
            aria-label={`Scroll ${title} left`}
            disabled={!canScrollLeft}
          >
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="h-9 w-9 px-0"
            onClick={() => scroll(1)}
            aria-label={`Scroll ${title} right`}
            disabled={!canScrollRight}
          >
            <ChevronRight aria-hidden="true" className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div
        ref={scroller}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="flex max-w-full snap-x gap-3 overflow-x-auto scroll-smooth pb-2 outline-none [scrollbar-width:none] focus-visible:ring-2 focus-visible:ring-primary/70 [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
    </section>
  );
}
