import { CollectionPage } from '@/features/pages';

export const metadata = {
  title: 'Watchlist',
};

export default function Page() {
  return <CollectionPage kind="watchlist" icon="bookmark" />;
}
