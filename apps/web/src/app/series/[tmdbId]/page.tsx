import { DetailPage } from '@/features/pages';

export default function Page({ params }: { params: Promise<{ tmdbId: string }> }) {
  return params.then((value) => <DetailPage mediaType="series" tmdbId={Number(value.tmdbId)} />);
}
