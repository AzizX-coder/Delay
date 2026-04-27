import { AppShell } from '@/components/AppShell';
import { SearchView } from './SearchView';
import { getStories } from '@/lib/queries';

export default async function SearchPage() {
  const stories = await getStories({});
  return <AppShell hideRail><SearchView stories={stories} /></AppShell>;
}
