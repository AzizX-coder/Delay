import { getContests } from '@/lib/queries';
import { AdminContestsView } from './AdminContestsView';

export default async function AdminContestsPage() {
  const contests = await getContests();
  return <AdminContestsView contests={contests} />;
}
