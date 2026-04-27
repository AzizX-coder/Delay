import { notFound } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { StoryDetailView } from './StoryDetailView';
import { getStoryBySlug, getCommentsForStory, getInteractionState, isFollowing } from '@/lib/queries';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function StoryPage({ params }: { params: { slug: string } }) {
  const story = await getStoryBySlug(params.slug);
  if (!story) notFound();
  const [comments, interaction, following, { profile: me }] = await Promise.all([
    getCommentsForStory(story.id),
    getInteractionState(story.id),
    isFollowing(story.author_id),
    getCurrentUser(),
  ]);
  return (
    <AppShell hideRail>
      <StoryDetailView
        story={story}
        comments={comments}
        liked={interaction.liked}
        saved={interaction.saved}
        following={following}
        me={me}
      />
    </AppShell>
  );
}
