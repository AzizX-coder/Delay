'use client';
import { useState, useTransition } from 'react';
import { Icon } from '@/components/Icon';
import { tokens } from '@/lib/tokens';
import { useTheme } from '@/components/ThemeProvider';
import { useToast } from '@/components/Toast';
import { toggleLike } from '@/lib/actions';

export function LikeButton({
  storyId, initialLiked = false, initialCount = 0, size = 18,
}: { storyId: string; initialLiked?: boolean; initialCount?: number; size?: number }) {
  const { dark } = useTheme();
  const { push } = useToast();
  const mute = dark ? tokens.darkMute : tokens.mute;
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, start] = useTransition();

  function onClick() {
    const next = !liked;
    setLiked(next);
    setCount(c => c + (next ? 1 : -1));
    start(async () => {
      const res = await toggleLike(storyId, liked);
      if (!res.ok) {
        setLiked(liked);
        setCount(initialCount);
        push({ kind: 'error', title: 'Yoqtirib bo\'lmadi', body: res.error });
      }
    });
  }

  return (
    <button onClick={onClick} disabled={pending} className="press" style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      border: 'none', background: 'transparent', cursor: 'pointer', padding: 0,
      color: liked ? tokens.orange : mute,
      fontFamily: 'var(--font-geist)', fontSize: 13, fontWeight: 500,
      transition: 'color 0.18s, transform 0.18s',
    }}>
      <Icon.heart s={size} c={liked ? tokens.orange : mute} filled={liked} />
      {count.toLocaleString()}
    </button>
  );
}
