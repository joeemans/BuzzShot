import { PersonPage } from '@/features/pages';

export default function Page({ params }: { params: Promise<{ personId: string }> }) {
  return params.then((value) => <PersonPage personId={Number(value.personId)} />);
}
