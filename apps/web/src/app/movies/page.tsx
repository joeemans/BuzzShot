import { CatalogPage } from '@/features/pages';

export const metadata = {
  title: 'Movies',
};

export default function Page() {
  return <CatalogPage mediaType="movie" />;
}
