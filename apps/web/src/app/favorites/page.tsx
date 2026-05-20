import { CollectionPage } from '@/features/pages';

export const metadata = {
  title: 'Favorites',
};

export default function Page() {
  return <CollectionPage kind="favorites" icon="heart" />;
}
