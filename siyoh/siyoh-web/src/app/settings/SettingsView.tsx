'use client';
import { Icon } from '@/components/Icon';
import { tokens, liquidSurface } from '@/lib/tokens';
import { useTheme } from '@/components/ThemeProvider';

const sections = [
  { title: 'Account', items: [
    { label: 'Email', value: 'elena@siyoh.app' },
    { label: 'Username', value: '@elena.writes' },
    { label: 'Password', value: 'Change' },
  ]},
  { title: 'Reading', items: [
    { label: 'Default font size', value: 'Medium' },
    { label: 'Justify text', value: 'Off' },
    { label: 'Auto-play next audio', value: 'On' },
  ]},
  { title: 'Notifications', items: [
    { label: 'New followers', value: 'On' },
    { label: 'Comments on your stories', value: 'On' },
    { label: 'Weekly digest', value: 'Sundays' },
  ]},
];

export function SettingsView() {
  const { dark, theme, toggle } = useTheme();
  const ink = dark ? tokens.darkInk : tokens.ink;
  const mute = dark ? tokens.darkMute : tokens.mute;
  const line = dark ? tokens.darkLine : tokens.line;

  return (
    <div style={{ padding: '32px 60px 160px', maxWidth: 760, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-newsreader)', fontSize: 38, fontWeight: 500, color: ink,
        letterSpacing: -0.9, margin: '0 0 28px' }}>Settings</h1>

      <div style={{
        ...liquidSurface({ dark, intensity: 'med' }),
        borderRadius: 18, padding: '18px 22px', marginBottom: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {theme === 'dark' ? <Icon.moon s={20} c={ink} /> : <Icon.sun s={20} c={ink} />}
          <div>
            <div style={{ fontFamily: 'var(--font-newsreader)', fontSize: 16, color: ink, fontWeight: 500 }}>Appearance</div>
            <div style={{ fontFamily: 'var(--font-geist)', fontSize: 12, color: mute }}>Currently {theme}</div>
          </div>
        </div>
        <button onClick={toggle} style={{
          width: 48, height: 28, borderRadius: 14, padding: 2, cursor: 'pointer', border: 'none',
          background: dark ? tokens.orange : 'rgba(26,22,19,0.15)',
          display: 'flex', justifyContent: dark ? 'flex-end' : 'flex-start',
          transition: 'all 0.2s',
        }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#fff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
        </button>
      </div>

      {sections.map(sec => (
        <div key={sec.title} style={{ marginBottom: 28 }}>
          <h3 style={{ fontFamily: 'var(--font-geist)', fontSize: 11, color: mute, letterSpacing: 0.6,
            textTransform: 'uppercase', fontWeight: 600, marginBottom: 10, padding: '0 4px' }}>{sec.title}</h3>
          <div style={{ ...liquidSurface({ dark, intensity: 'med' }), borderRadius: 18, overflow: 'hidden' }}>
            {sec.items.map((it, i) => (
              <div key={it.label} style={{
                padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderTop: i === 0 ? 'none' : `0.5px solid ${line}`,
              }}>
                <span style={{ fontFamily: 'var(--font-geist)', fontSize: 14, color: ink }}>{it.label}</span>
                <span style={{ fontFamily: 'var(--font-geist)', fontSize: 13, color: mute,
                  display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {it.value} <Icon.chev s={14} c={mute} />
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <form action="/auth/signout" method="POST">
        <button type="submit" className="press" style={{
          width: '100%', height: 46, borderRadius: 14, border: `0.5px solid ${line}`,
          background: 'transparent', color: tokens.orangeDeep, cursor: 'pointer',
          fontFamily: 'var(--font-geist)', fontSize: 14, fontWeight: 600, marginTop: 12,
        }}>Sign out</button>
      </form>
    </div>
  );
}
