'use client';
import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { RightRail } from './RightRail';
import { MiniPlayer } from './MiniPlayer';
import { BgBlobs } from './BgBlobs';
import { useTheme } from './ThemeProvider';
import { tokens } from '@/lib/tokens';
import type { Profile } from '@/lib/types';

export function ShellChrome({
  children, hideRail = false, user,
}: { children: ReactNode; hideRail?: boolean; user: Profile | null }) {
  const { dark } = useTheme();
  const line = dark ? tokens.darkLine : tokens.line;
  return (
    <div className="app-bg">
      <BgBlobs dark={dark} />
      <div style={{
        display: 'grid',
        gridTemplateColumns: hideRail ? '240px 1fr' : '240px 1fr 340px',
        minHeight: '100vh', maxWidth: 1440, margin: '0 auto',
        position: 'relative', zIndex: 1,
      }}>
        <Sidebar user={user} />
        <main style={{
          borderLeft: `0.5px solid ${line}`,
          borderRight: hideRail ? 'none' : `0.5px solid ${line}`,
          minHeight: '100vh',
        }}>
          {children}
        </main>
        {!hideRail && <RightRail />}
      </div>
      <MiniPlayer />
    </div>
  );
}
