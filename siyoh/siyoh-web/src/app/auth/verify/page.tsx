'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { tokens, liquidSurface } from '@/lib/tokens';
import { useTheme } from '@/components/ThemeProvider';
import { createClient, supabaseEnabled } from '@/lib/supabase/client';
import { Icon } from '@/components/Icon';

export default function VerifyPage() {
  const { dark } = useTheme();
  const params = useSearchParams();
  const email = params.get('email') || 'your inbox';
  const ink = dark ? tokens.darkInk : tokens.ink;
  const mute = dark ? tokens.darkMute : tokens.mute;
  const [resent, setResent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function resend() {
    if (!supabaseEnabled || !params.get('email')) { setResent(true); return; }
    setLoading(true);
    const sb = createClient()!;
    await sb.auth.resend({ type: 'signup', email: params.get('email')! });
    setLoading(false);
    setResent(true);
  }

  return (
    <div style={{ ...liquidSurface({ dark, intensity: 'med' }), borderRadius: 22, padding: 32, textAlign: 'center' }}>
      <div className="anim-scale-in" style={{
        width: 72, height: 72, borderRadius: 22, margin: '0 auto 18px',
        background: tokens.orangeGrad, display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 14px 30px rgba(255,87,34,0.32)',
      }}>
        <Icon.bell s={28} c="#fff" />
      </div>
      <h1 style={{ fontFamily: 'var(--font-newsreader)', fontSize: 28, fontWeight: 500, color: ink,
        letterSpacing: -0.5, margin: '0 0 8px' }}>Check your inbox.</h1>
      <p style={{ fontFamily: 'var(--font-newsreader)', fontSize: 15, color: mute,
        lineHeight: 1.6, margin: '0 0 22px' }}>
        We sent a confirmation link to <strong style={{ color: ink }}>{email}</strong>.
        Click it to finish setting up your account.
      </p>
      <button onClick={resend} disabled={loading || resent} className="press" style={{
        height: 44, padding: '0 22px', borderRadius: 12,
        border: `0.5px solid ${dark ? tokens.darkLine : tokens.line}`,
        background: 'transparent', color: ink,
        cursor: resent || loading ? 'default' : 'pointer',
        fontFamily: 'var(--font-geist)', fontSize: 13.5, fontWeight: 500,
        opacity: resent || loading ? 0.6 : 1,
      }}>{resent ? 'Sent again' : loading ? 'Resending…' : 'Resend email'}</button>
      <div style={{ marginTop: 22, fontFamily: 'var(--font-geist)', fontSize: 13, color: mute }}>
        Wrong address? <Link href="/auth/signup" style={{ color: tokens.orange, fontWeight: 500, textDecoration: 'none' }}>Start over</Link>
      </div>
    </div>
  );
}
