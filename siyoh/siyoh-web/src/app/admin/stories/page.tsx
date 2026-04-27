import { getStories } from '@/lib/queries';
import { AdminStoriesView } from './AdminStoriesView';

export default async function AdminStoriesPage() {
  const stories = await getStories({});
  return <AdminStoriesView stories={stories} />;
}
