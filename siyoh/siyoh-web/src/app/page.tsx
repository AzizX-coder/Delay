import { LandingPage } from './landing/LandingPage';
import { getStories, getWriters } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function RootPage() {
  const [stories, writers] = await Promise.all([getStories({ limit: 6 }), getWriters()]);
  return <LandingPage stories={stories} writers={writers} />;
}
