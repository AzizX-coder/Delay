'use client';
import { Avatar } from '@/components/Avatar';
import { Icon } from '@/components/Icon';
import { tokens, liquidSurface } from '@/lib/tokens';
import { useTheme } from '@/components/ThemeProvider';
import type { Profile } from '@/lib/types';

export function AdminUsersView({ writers }: { writers: (Profile & { readers?: string })[] }) {
  const { dark } = useTheme();
  const ink = dark ? tokens.darkInk : tokens.ink;
  const mute = dark ? tokens.darkMute : tokens.mute;
  const line = dark ? tokens.darkLine : tokens.line;

  return (
    <div style={{ padding: '32px 40px 80px' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--font-geist)', fontSize: 11, color: mute, letterSpacing: 0.6,
          textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>People</div>
        <h1 style={{ fontFamily: 'var(--font-newsreader)', fontSize: 32, fontWeight: 500, color: ink,
          letterSpacing: -0.6, margin: 0 }}>Users</h1>
      </div>

      <div style={{ ...liquidSurface({ dark, intensity: 'med' }), borderRadius: 18, padding: 22 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-geist)' }}>
          <thead>
            <tr style={{ textAlign: 'left', fontSize: 11, color: mute, textTransform: 'uppercase', letterSpacing: 0.6 }}>
              <th style={{ padding: '8px 10px', fontWeight: 600 }}>Name</th>
              <th style={{ padding: '8px 10px', fontWeight: 600 }}>Username</th>
              <th style={{ padding: '8px 10px', fontWeight: 600 }}>Role</th>
              <th style={{ padding: '8px 10px', fontWeight: 600 }}>Readers</th>
              <th style={{ padding: '8px 10px', fontWeight: 600 }}>Joined</th>
              <th style={{ padding: '8px 10px', fontWeight: 600 }}></th>
            </tr>
          </thead>
          <tbody>
            {writers.map(w => (
              <tr key={w.id} style={{ borderTop: `0.5px solid ${line}`, fontSize: 13, color: ink }}>
                <td style={{ padding: '12px 10px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                    <Avatar name={w.display_name[0]} size={28} seed={w.avatar_seed} />
                    <span style={{ fontFamily: 'var(--font-newsreader)', fontWeight: 500 }}>{w.display_name}</span>
                  </span>
                </td>
                <td style={{ padding: '12px 10px', color: mute }}>@{w.username}</td>
                <td style={{ padding: '12px 10px', color: mute, textTransform: 'capitalize' }}>{w.role}</td>
                <td style={{ padding: '12px 10px', color: mute }}>{w.readers || '—'}</td>
                <td style={{ padding: '12px 10px', color: mute }}>{w.created_at?.slice(0, 10)}</td>
                <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                  <button aria-label="More" style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                    <Icon.more s={16} c={mute} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
