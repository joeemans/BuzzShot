import { CatalogPage } from '@/features/pages';

export const metadata = {
  title: 'Series',
};

function toPage(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number(raw ?? 1);
  return Number.isFinite(page) ? Math.max(1, Math.trunc(page)) : 1;
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const params = await searchParams;
  return <CatalogPage mediaType="series" page={toPage(params.page)} />;
}
