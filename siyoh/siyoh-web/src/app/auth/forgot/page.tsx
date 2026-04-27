'use client';
import Link from 'next/link';
import { useState } from 'react';
import { tokens, liquidSurface } from '@/lib/tokens';
import { useTheme } from '@/components/ThemeProvider';
import { createClient, supabaseEnabled } from '@/lib/supabase/client';
import { Icon } from '@/components/Icon';

export default function ForgotPage() {
  const { dark } = useTheme();
  const ink = dark ? tokens.darkInk : tokens.ink;
  const mute = dark ? tokens.darkMute : tokens.mute;
  const line = dark ? tokens.darkLine : tokens.line;
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!supabaseEnabled) { setSent(true); return; }
    setLoading(true);
    const sb = createClient()!;
    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    });
    setLoading(false);
    if (error) setErr(error.message); else setSent(true);
  }

  if (sent) {
    return (
      <div style={{ ...liquidSurface({ dark, intensity: 'med' }), borderRadius: 22, padding: 32, textAlign: 'center' }}>
        <div className="anim-scale-in" style={{
          width: 64, height: 64, borderRadius: 18, margin: '0 auto 18px',
          background: tokens.orangeGrad,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><Icon.bell s={26} c="#fff" /></div>
        <h1 style={{ fontFamily: 'var(--font-newsreader)', fontSize: 26, fontWeight: 500, color: ink,
          letterSpacing: -0.5, margin: '0 0 8px' }}>Reset link sent.</h1>
        <p style={{ fontFamily: 'var(--font-newsreader)', fontSize: 15, color: mute,
          lineHeight: 1.55, margin: '0 0 22px' }}>
          If <strong style={{ color: ink }}>{email}</strong> matches an account, a reset link is on its way.
        </p>
        <Link href="/auth/login" style={{ color: tokens.orange, fontFamily: 'var(--font-geist)',
          fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>← Back to sign in</Link>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', height: 46, padding: '0 14px', borderRadius: 12,
    border: `0.5px solid ${line}`, background: dark ? 'rgba(255,237,213,0.04)' : 'rgba(255,255,255,0.6)',
    fontFamily: 'var(--font-geist)', fontSize: 14, color: ink, outline: 'none',
  };

  return (
    <div style={{ ...liquidSurface({ dark, intensity: 'med' }), borderRadius: 22, padding: 28 }}>
      <h1 style={{ fontFamily: 'var(--font-newsreader)', fontSize: 28, fontWeight: 500, color: ink,
        letterSpacing: -0.5, margin: '0 0 6px' }}>Forgot your password?</h1>
      <p style={{ fontFamily: 'var(--font-newsreader)', fontSize: 15, color: mute, margin: '0 0 22px' }}>
        Enter your email — we'll send a reset link.
      </p>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input type="email" required placeholder="you@siyoh.app" value={email}
          onChange={e => setEmail(e.target.value)} style={inputStyle} />
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
        }}>{loading ? 'Sending…' : 'Send reset link'}</button>
      </form>
      <div style={{ marginTop: 22, textAlign: 'center', fontFamily: 'var(--font-geist)', fontSize: 13, color: mute }}>
        Remember it? <Link href="/auth/login" style={{ color: tokens.orange, fontWeight: 500, textDecoration: 'none' }}>Sign in</Link>
      </div>
    </div>
  );
}
