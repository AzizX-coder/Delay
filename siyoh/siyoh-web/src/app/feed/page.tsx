import { AppShell } from '@/components/AppShell';
import { FeedView } from './FeedView';
import { getStories } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function FeedPage() {
  const stories = await getStories({ limit: 8 });
  return (
    <AppShell>
      <FeedView stories={stories} />
    </AppShell>
  );
}
