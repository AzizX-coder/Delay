'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { tokens, liquidSurface } from '@/lib/tokens';
import { useTheme } from '@/components/ThemeProvider';
import { createClient, supabaseEnabled } from '@/lib/supabase/client';
import { Icon } from '@/components/Icon';

export default function LoginPage() {
  const { dark } = useTheme();
  const router = useRouter();
  const ink = dark ? tokens.darkInk : tokens.ink;
  const mute = dark ? tokens.darkMute : tokens.mute;
  const line = dark ? tokens.darkLine : tokens.line;
  const [mode, setMode] = useState<'password' | 'magic'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!supabaseEnabled) { router.push('/feed'); return; }
    setLoading(true);
    const sb = createClient()!;
    if (mode === 'password') {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) setErr(error.message); else router.push('/feed');
    } else {
      const { error } = await sb.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      setLoading(false);
      if (error) setErr(error.message); else router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
    }
  }

  async function oauth(provider: 'google' | 'github') {
    if (!supabaseEnabled) { router.push('/feed'); return; }
    const sb = createClient()!;
    await sb.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', height: 46, padding: '0 14px', borderRadius: 12,
    border: `0.5px solid ${line}`, background: dark ? 'rgba(255,237,213,0.04)' : 'rgba(255,255,255,0.6)',
    fontFamily: 'var(--font-geist)', fontSize: 14, color: ink, outline: 'none',
    transition: 'border-color 0.18s, box-shadow 0.18s',
  };

  return (
    <div style={{ ...liquidSurface({ dark, intensity: 'med' }), borderRadius: 22, padding: 28 }}>
      <h1 style={{ fontFamily: 'var(--font-newsreader)', fontSize: 30, fontWeight: 500, color: ink,
        letterSpacing: -0.6, margin: '0 0 6px' }}>Welcome back.</h1>
      <p style={{ fontFamily: 'var(--font-newsreader)', fontSize: 15, color: mute, margin: '0 0 22px' }}>
        Sign in to continue your reading.
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
        <button onClick={() => oauth('google')} className="press" style={{
          flex: 1, height: 44, borderRadius: 12, border: `0.5px solid ${line}`,
          background: dark ? 'rgba(255,237,213,0.04)' : '#fff', color: ink,
          cursor: 'pointer', fontFamily: 'var(--font-geist)', fontSize: 13.5, fontWeight: 500,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <svg width={16} height={16} viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8a12 12 0 1112-12c0 .8-.1 1.6-.3 2.4l8 6.1c1.5-3.1 2.3-6.7 2.3-10.5 0-1-.1-1.7-.4-1.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c2.7 0 5.2 1 7.1 2.6l5.7-5.7C33.7 6.5 29.1 5 24 5 16.3 5 9.7 9.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 43c5 0 9.7-1.9 13.2-5l-6.1-5c-2 1.5-4.5 2.4-7.1 2.4-5.2 0-9.7-3.3-11.3-8l-6.6 5.1C9.6 38.6 16.2 43 24 43z"/><path fill="#1976D2" d="M43.6 20.5H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.1 5c4.3-3.9 6.7-9.7 6.7-16.6 0-1-.1-1.4-.4-2z"/></svg>
          Google
        </button>
        <button onClick={() => oauth('github')} className="press" style={{
          flex: 1, height: 44, borderRadius: 12, border: `0.5px solid ${line}`,
          background: dark ? 'rgba(255,237,213,0.04)' : '#fff', color: ink,
          cursor: 'pointer', fontFamily: 'var(--font-geist)', fontSize: 13.5, fontWeight: 500,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill={ink}><path d="M12 .5C5.6.5.5 5.6.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.4-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.4-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2.9-.3 1.9-.4 2.9-.4s2 .1 2.9.4c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.7.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.6 18.4.5 12 .5z"/></svg>
          GitHub
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0 14px',
        fontFamily: 'var(--font-geist)', fontSize: 11, color: mute, letterSpacing: 0.6,
        textTransform: 'uppercase', fontWeight: 600 }}>
        <div style={{ flex: 1, height: 0.5, background: line }} />
        or with email
        <div style={{ flex: 1, height: 0.5, background: line }} />
      </div>

      <div style={{ display: 'flex', padding: 4, borderRadius: 12,
        background: dark ? 'rgba(255,237,213,0.04)' : 'rgba(26,22,19,0.04)', marginBottom: 14 }}>
        {(['password', 'magic'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            flex: 1, height: 32, borderRadius: 9, border: 'none', cursor: 'pointer',
            background: mode === m ? (dark ? tokens.darkInk : tokens.ink) : 'transparent',
            color: mode === m ? (dark ? tokens.darkBg : tokens.paper) : ink,
            fontFamily: 'var(--font-geist)', fontSize: 12.5, fontWeight: 500,
          }}>{m === 'password' ? 'Password' : 'Magic link'}</button>
        ))}
      </div>

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input type="email" required placeholder="you@siyoh.app" value={email}
          onChange={e => setEmail(e.target.value)} style={inputStyle} />
        {mode === 'password' && (
          <input type="password" required placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)} style={inputStyle} />
        )}
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
          {loading ? 'Working…' : mode === 'password' ? 'Sign in' : 'Send magic link'}
          {!loading && <Icon.chev s={16} c="#fff" />}
        </button>
        {mode === 'password' && (
          <Link href="/auth/forgot" style={{
            textAlign: 'center', marginTop: 4,
            fontFamily: 'var(--font-geist)', fontSize: 13, color: mute, textDecoration: 'none',
          }}>Forgot password?</Link>
        )}
      </form>
      {!supabaseEnabled && (
        <div style={{ marginTop: 14, fontFamily: 'var(--font-geist)', fontSize: 12, color: mute, textAlign: 'center' }}>
          Demo mode — Supabase not configured. Submit lands on the feed.
        </div>
      )}
      <div style={{ marginTop: 22, textAlign: 'center', fontFamily: 'var(--font-geist)', fontSize: 13, color: mute }}>
        New here? <Link href="/auth/signup" style={{ color: tokens.orange, fontWeight: 500, textDecoration: 'none' }}>Create an account</Link>
      </div>
    </div>
  );
}
