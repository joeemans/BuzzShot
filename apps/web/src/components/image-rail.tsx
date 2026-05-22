'use client';

import { ScrollableRail } from './scrollable-rail';

export function ImageRail({ title, imageUrls }: { title: string; imageUrls: string[] }) {
  if (imageUrls.length === 0) return null;

  return (
    <ScrollableRail title={title} itemCount={imageUrls.length}>
      {imageUrls.map((url) => (
        <img
          key={url}
          src={url}
          alt=""
          width={420}
          height={236}
          loading="lazy"
          className="aspect-video w-[min(22rem,78vw)] shrink-0 snap-start rounded-md border border-border object-cover"
        />
      ))}
    </ScrollableRail>
  );
}
