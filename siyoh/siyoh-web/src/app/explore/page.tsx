import { AppShell } from '@/components/AppShell';
import { ExploreView } from './ExploreView';
import { getWriters } from '@/lib/queries';

export default async function ExplorePage() {
  const writers = await getWriters();
  return <AppShell><ExploreView writers={writers} /></AppShell>;
}
