import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { EditProfileView } from './EditProfileView';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function EditProfilePage() {
  const { profile } = await getCurrentUser();
  if (!profile) redirect('/auth/login?next=/profile/edit');
  return <AppShell hideRail><EditProfileView profile={profile} /></AppShell>;
}
