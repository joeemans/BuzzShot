import { ProfilePage } from '@/features/pages';

export default function Page({ params }: { params: Promise<{ username: string }> }) {
  return params.then((value) => <ProfilePage username={value.username} />);
}
