'use client';
import { Icon } from '@/components/Icon';
import { Avatar } from '@/components/Avatar';
import { tokens, liquidSurface } from '@/lib/tokens';
import { useTheme } from '@/components/ThemeProvider';

const reports = [
  { id: 'r1', target: 'How to Disappear Politely', reason: 'Off-topic comments', reporter: 'Theo Mwangi', date: '2026-04-22', count: 3 },
  { id: 'r2', target: 'The Blue Hour', reason: 'Spam in comments', reporter: 'Lina Vestergaard', date: '2026-04-21', count: 1 },
  { id: 'r3', target: '@spam_writer_42', reason: 'Repeated low-quality posts', reporter: 'system', date: '2026-04-20', count: 7 },
];

export default function ModerationPage() {
  const { dark } = useTheme();
  const ink = dark ? tokens.darkInk : tokens.ink;
  const mute = dark ? tokens.darkMute : tokens.mute;
  const line = dark ? tokens.darkLine : tokens.line;

  return (
    <div style={{ padding: '32px 40px 80px' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--font-geist)', fontSize: 11, color: mute, letterSpacing: 0.6,
          textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Trust & safety</div>
        <h1 style={{ fontFamily: 'var(--font-newsreader)', fontSize: 32, fontWeight: 500, color: ink,
          letterSpacing: -0.6, margin: 0 }}>Moderation queue</h1>
      </div>

      <div style={{ ...liquidSurface({ dark, intensity: 'med' }), borderRadius: 18, padding: 22 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-geist)' }}>
          <thead>
            <tr style={{ textAlign: 'left', fontSize: 11, color: mute, textTransform: 'uppercase', letterSpacing: 0.6 }}>
              <th style={{ padding: '8px 10px', fontWeight: 600 }}>Target</th>
              <th style={{ padding: '8px 10px', fontWeight: 600 }}>Reason</th>
              <th style={{ padding: '8px 10px', fontWeight: 600 }}>Reporter</th>
              <th style={{ padding: '8px 10px', fontWeight: 600 }}>Reports</th>
              <th style={{ padding: '8px 10px', fontWeight: 600 }}>Date</th>
              <th style={{ padding: '8px 10px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(r => (
              <tr key={r.id} style={{ borderTop: `0.5px solid ${line}`, fontSize: 13, color: ink }}>
                <td style={{ padding: '12px 10px', fontFamily: 'var(--font-newsreader)', fontWeight: 500 }}>{r.target}</td>
                <td style={{ padding: '12px 10px', color: mute }}>{r.reason}</td>
                <td style={{ padding: '12px 10px', color: mute }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <Avatar name={r.reporter[0]} size={22} seed={r.id.length} />
                    {r.reporter}
                  </span>
                </td>
                <td style={{ padding: '12px 10px', color: mute }}>{r.count}</td>
                <td style={{ padding: '12px 10px', color: mute }}>{r.date}</td>
                <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                  <button style={{
                    height: 30, padding: '0 12px', borderRadius: 9, border: `0.5px solid ${line}`,
                    background: 'transparent', color: ink, cursor: 'pointer',
                    fontFamily: 'var(--font-geist)', fontSize: 12, fontWeight: 500, marginRight: 6,
                  }}>Dismiss</button>
                  <button style={{
                    height: 30, padding: '0 12px', borderRadius: 9, border: 'none',
                    background: tokens.orange, color: '#fff', cursor: 'pointer',
                    fontFamily: 'var(--font-geist)', fontSize: 12, fontWeight: 600,
                  }}>Take action</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
