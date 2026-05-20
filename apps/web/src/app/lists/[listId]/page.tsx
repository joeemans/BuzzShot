import { ListPage } from '@/features/pages';

export default function Page({ params }: { params: Promise<{ listId: string }> }) {
  return params.then((value) => <ListPage listId={value.listId} />);
}
