'use client';
import { useState, useTransition } from 'react';
import { Icon } from '@/components/Icon';
import { tokens } from '@/lib/tokens';
import { useTheme } from '@/components/ThemeProvider';
import { useToast } from '@/components/Toast';
import { toggleBookmark } from '@/lib/actions';

export function BookmarkButton({
  storyId, initialSaved = false, size = 18, label = false,
}: { storyId: string; initialSaved?: boolean; size?: number; label?: boolean }) {
  const { dark } = useTheme();
  const { push } = useToast();
  const ink = dark ? tokens.darkInk : tokens.ink;
  const mute = dark ? tokens.darkMute : tokens.mute;
  const [saved, setSaved] = useState(initialSaved);
  const [pending, start] = useTransition();

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = !saved;
    setSaved(next);
    push({ kind: 'success', title: next ? 'Saqlandi' : 'O\'chirildi' });
    start(async () => {
      const res = await toggleBookmark(storyId, saved);
      if (!res.ok) {
        setSaved(saved);
        push({ kind: 'error', title: 'Saqlab bo\'lmadi', body: res.error });
      }
    });
  }

  return (
    <button onClick={onClick} disabled={pending} aria-label="Bookmark" className="press" style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      border: 'none', background: 'transparent', cursor: 'pointer', padding: 0,
      color: saved ? tokens.orange : mute,
      fontFamily: 'var(--font-geist)', fontSize: 13, fontWeight: 500,
    }}>
      <Icon.bookmark s={size} c={saved ? tokens.orange : (label ? ink : mute)} filled={saved} />
      {label && (saved ? 'Saqlangan' : 'Saqlash')}
    </button>
  );
}
