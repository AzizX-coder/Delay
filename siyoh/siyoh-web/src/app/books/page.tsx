import { AppShell } from '@/components/AppShell';
import { BooksView } from './BooksView';
import { getStories } from '@/lib/queries';

export default async function BooksPage() {
  const stories = await getStories({});
  return <AppShell><BooksView stories={stories} /></AppShell>;
}
