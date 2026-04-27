import { getWriters } from '@/lib/queries';
import { AdminUsersView } from './AdminUsersView';

export default async function AdminUsersPage() {
  const writers = await getWriters();
  return <AdminUsersView writers={writers} />;
}
