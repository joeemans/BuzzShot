'use client';

import { ErrorState } from '@/components/states';

export default function Error() {
  return (
    <div className="section py-12">
      <ErrorState title="Something broke" description="BuzzShot could not render this page. Try again shortly." />
    </div>
  );
}
