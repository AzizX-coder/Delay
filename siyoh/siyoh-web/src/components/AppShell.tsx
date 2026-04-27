import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { RightRail } from './RightRail';
import { MiniPlayer } from './MiniPlayer';
import { ShellChrome } from './ShellChrome';
import { getCurrentUser } from '@/lib/auth';

export async function AppShell({ children, hideRail = false }: { children: ReactNode; hideRail?: boolean }) {
  const { profile } = await getCurrentUser();
  return (
    <ShellChrome hideRail={hideRail} user={profile}>
      {children}
    </ShellChrome>
  );
}
