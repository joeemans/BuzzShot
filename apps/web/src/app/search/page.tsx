import { SearchPage } from '@/features/pages';

export const metadata = {
  title: 'Search',
};

export default function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  return searchParams.then((params) => <SearchPage query={params.q ?? ''} />);
}
