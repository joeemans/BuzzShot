import { CollectionPage } from '@/features/pages';

export const metadata = {
  title: 'Watched',
};

export default function Page() {
  return <CollectionPage kind="watched" icon="check" />;
}
