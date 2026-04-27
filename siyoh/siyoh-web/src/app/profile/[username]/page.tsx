import { notFound } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { ProfileView } from './ProfileView';
import { getProfileByUsername, getStories, isFollowing } from '@/lib/queries';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const profile = await getProfileByUsername(params.username);
  if (!profile) notFound();
  const [stories, following, { profile: me }] = await Promise.all([
    getStories({ authorId: profile.id }),
    isFollowing(profile.id),
    getCurrentUser(),
  ]);
  const isMe = me?.id === profile.id;
  return (
    <AppShell>
      <ProfileView profile={profile} stories={stories.slice(0, 8)} following={following} isMe={isMe} />
    </AppShell>
  );
}
