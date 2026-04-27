import { AppShell } from '@/components/AppShell';
import { NotificationsView } from './NotificationsView';
import { getNotifications } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  const items = await getNotifications();
  return <AppShell hideRail><NotificationsView items={items} /></AppShell>;
}
