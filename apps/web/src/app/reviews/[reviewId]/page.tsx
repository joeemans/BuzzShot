import { ReviewPage } from '@/features/pages';

export default function Page({ params }: { params: Promise<{ reviewId: string }> }) {
  return params.then((value) => <ReviewPage reviewId={value.reviewId} />);
}
