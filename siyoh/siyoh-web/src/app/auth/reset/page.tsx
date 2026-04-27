'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { tokens, liquidSurface } from '@/lib/tokens';
import { useTheme } from '@/components/ThemeProvider';
import { createClient, supabaseEnabled } from '@/lib/supabase/client';
import { Icon } from '@/components/Icon';

export default function ResetPage() {
  const { dark } = useTheme();
  const router = useRouter();
  const ink = dark ? tokens.darkInk : tokens.ink;
  const mute = dark ? tokens.darkMute : tokens.mute;
  const line = dark ? tokens.darkLine : tokens.line;
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (password !== confirm) { setErr('Passwords do not match.'); return; }
    if (password.length < 6) { setErr('Use at least 6 characters.'); return; }
    if (!supabaseEnabled) { router.push('/feed'); return; }
    setLoading(true);
    const sb = createClient()!;
    const { error } = await sb.auth.updateUser({ password });
    setLoading(false);
    if (error) setErr(error.message); else router.push('/auth/confirmed');
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', height: 46, padding: '0 14px', borderRadius: 12,
    border: `0.5px solid ${line}`, background: dark ? 'rgba(255,237,213,0.04)' : 'rgba(255,255,255,0.6)',
    fontFamily: 'var(--font-geist)', fontSize: 14, color: ink, outline: 'none',
  };

  return (
    <div style={{ ...liquidSurface({ dark, intensity: 'med' }), borderRadius: 22, padding: 28 }}>
      <h1 style={{ fontFamily: 'var(--font-newsreader)', fontSize: 28, fontWeight: 500, color: ink,
        letterSpacing: -0.5, margin: '0 0 6px' }}>Set a new password.</h1>
      <p style={{ fontFamily: 'var(--font-newsreader)', fontSize: 15, color: mute, margin: '0 0 22px' }}>
        Choose something memorable. You'll only need it again if you forget it.
      </p>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input type="password" required minLength={6} placeholder="New password" value={password}
          onChange={e => setPassword(e.target.value)} style={inputStyle} />
        <input type="password" required minLength={6} placeholder="Confirm password" value={confirm}
          onChange={e => setConfirm(e.target.value)} style={inputStyle} />
        {err && (
          <div className="anim-fade-in" style={{
            fontFamily: 'var(--font-geist)', fontSize: 13, color: tokens.orangeDeep,
            background: 'rgba(255,87,34,0.08)', padding: '10px 12px', borderRadius: 8,
          }}>{err}</div>
        )}
        <button type="submit" disabled={loading} className="press" style={{
          height: 46, borderRadius: 12, border: 'none', cursor: loading ? 'wait' : 'pointer',
          background: tokens.orangeGrad, color: '#fff', opacity: loading ? 0.7 : 1,
          fontFamily: 'var(--font-geist)', fontSize: 14, fontWeight: 600,
          boxShadow: '0 8px 20px rgba(255,87,34,0.3)', marginTop: 4,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          {loading ? 'Saving…' : 'Save and continue'} {!loading && <Icon.chev s={16} c="#fff" />}
        </button>
      </form>
      <div style={{ marginTop: 22, textAlign: 'center', fontFamily: 'var(--font-geist)', fontSize: 13, color: mute }}>
        <Link href="/auth/login" style={{ color: tokens.orange, fontWeight: 500, textDecoration: 'none' }}>← Back to sign in</Link>
      </div>
    </div>
  );
}
