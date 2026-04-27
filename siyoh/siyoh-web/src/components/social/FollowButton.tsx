'use client';
import { useState, useTransition } from 'react';
import { tokens } from '@/lib/tokens';
import { useTheme } from '@/components/ThemeProvider';
import { useToast } from '@/components/Toast';
import { toggleFollow } from '@/lib/actions';

export function FollowButton({
  targetId, initialFollowing = false, displayName = '',
  size = 'md',
}: { targetId: string; initialFollowing?: boolean; displayName?: string; size?: 'sm' | 'md' }) {
  const { dark } = useTheme();
  const { push } = useToast();
  const ink = dark ? tokens.darkInk : tokens.ink;
  const line = dark ? tokens.darkLine : tokens.line;
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, start] = useTransition();

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = !following;
    setFollowing(next);
    start(async () => {
      const res = await toggleFollow(targetId, following);
      if (!res.ok) {
        setFollowing(following);
        push({ kind: 'error', title: 'Yangilab bo\'lmadi', body: res.error });
      } else if (next) {
        push({ kind: 'success', title: `${displayName || 'Yozuvchi'} kuzatilmoqda` });
      }
    });
  }

  const small = size === 'sm';
  return (
    <button onClick={onClick} disabled={pending} className="press" style={{
      height: small ? 28 : 38, padding: small ? '0 12px' : '0 18px',
      borderRadius: small ? 999 : 12,
      border: following ? `0.5px solid ${line}` : 'none',
      background: following ? 'transparent' : (dark ? tokens.darkInk : tokens.ink),
      color: following ? ink : (dark ? tokens.darkBg : tokens.paper),
      cursor: pending ? 'wait' : 'pointer',
      fontFamily: 'var(--font-geist)', fontSize: small ? 11.5 : 13.5, fontWeight: 600,
    }}>{following ? 'Kuzatilmoqda' : 'Kuzatish'}</button>
  );
}
