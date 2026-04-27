'use client';
import Link from 'next/link';
import { Avatar } from '@/components/Avatar';
import { Icon } from '@/components/Icon';
import { tokens, liquidSurface } from '@/lib/tokens';
import { useTheme } from '@/components/ThemeProvider';
import type { Profile } from '@/lib/types';

const moods = [
  { t: 'Sokin\nertalablar', c: 'linear-gradient(135deg,#FF6A3D,#FF8A4C)', ic: '☀' },
  { t: 'Uzun\nesse', c: 'linear-gradient(135deg,#2A241F,#4A3C30)', ic: '✎' },
  { t: 'Kulgili\nbir narsa', c: 'linear-gradient(135deg,#FFC08A,#FFA560)', ic: '◡' },
  { t: 'Uxlash\nuchun', c: 'linear-gradient(135deg,#1A1613,#3A2820)', ic: '☾' },
  { t: 'His\nqilish', c: 'linear-gradient(135deg,#FF5722,#D73900)', ic: '♡' },
];

export function ExploreView({ writers }: { writers: Profile[] }) {
  const { dark } = useTheme();
  const ink = dark ? tokens.darkInk : tokens.ink;
  const mute = dark ? tokens.darkMute : tokens.mute;
  const line = dark ? tokens.darkLine : tokens.line;

  return (
    <div>
      <div style={{ padding: '28px 36px 20px', borderBottom: `0.5px solid ${line}` }}>
        <h1 style={{ fontFamily: 'var(--font-newsreader)', fontSize: 44, fontWeight: 400, color: ink,
          letterSpacing: -0.9, margin: '0 0 8px' }}><span style={{ fontStyle: 'italic' }}>Kirib</span> ko&apos;ring.</h1>
        <p style={{ fontFamily: 'var(--font-newsreader)', fontSize: 17, color: mute, margin: 0 }}>
          Yangi yozuvchilar, kayfiyatlar va uzun o&apos;qishlar &mdash; har ertalab tanlangan.
        </p>
      </div>

      <div style={{ padding: '28px 36px 0' }}>
        <h3 style={{ fontFamily: 'var(--font-newsreader)', fontSize: 22, fontWeight: 400, color: ink,
          letterSpacing: -0.3, marginBottom: 14 }}>Bugun nimani <span style={{ fontStyle: 'italic' }}>xohlaysiz?</span></h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {moods.map((m, i) => (
            <Link key={i} href="/books" className="hover-lift" style={{
              aspectRatio: '1 / 1.2', borderRadius: 20, padding: 16,
              background: m.c, color: i === 2 ? '#F5EDE0' : '#fff',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              cursor: 'pointer', textDecoration: 'none',
              boxShadow: '0 10px 24px rgba(26,22,19,0.15)',
            }}>
              <div style={{ fontSize: 26, opacity: 0.9 }}>{m.ic}</div>
              <div style={{ fontFamily: 'var(--font-newsreader)', fontSize: 20, fontWeight: 400,
                whiteSpace: 'pre-line', letterSpacing: -0.3, lineHeight: 1.05 }}>{m.t}</div>
            </Link>
          ))}
        </div>
      </div>

      <div style={{ padding: '40px 36px 0' }}>
        <h3 style={{ fontFamily: 'var(--font-newsreader)', fontSize: 22, fontWeight: 400, color: ink,
          letterSpacing: -0.3, marginBottom: 14 }}>Kuzatib boriladigan <span style={{ fontStyle: 'italic' }}>yozuvchilar</span></h3>
        {writers.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {writers.slice(0, 4).map(w => (
              <Link key={w.username} href={`/profile/${w.username}`} className="hover-lift" style={{
                borderRadius: 18, padding: 16,
                ...liquidSurface({ dark, intensity: 'med' }),
                textAlign: 'center', textDecoration: 'none',
              }}>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <Avatar name={w.display_name[0]} size={56} seed={w.avatar_seed} />
                </div>
                <div style={{ fontFamily: 'var(--font-newsreader)', fontSize: 17, color: ink, fontWeight: 400, marginTop: 10 }}>{w.display_name}</div>
                <div style={{ fontFamily: 'var(--font-geist)', fontSize: 11.5, color: mute, marginTop: 2 }}>@{w.username}</div>
                <div style={{ fontFamily: 'var(--font-newsreader)', fontSize: 13, color: mute, marginTop: 8,
                  fontStyle: 'italic', lineHeight: 1.35, minHeight: 34 }}>{w.bio}</div>
                <button style={{
                  marginTop: 10, width: '100%', height: 32, borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: dark ? tokens.darkInk : tokens.ink,
                  color: dark ? tokens.darkBg : tokens.paper,
                  fontFamily: 'var(--font-geist)', fontSize: 12, fontWeight: 500,
                }}>Kuzatish</button>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{
            ...liquidSurface({ dark, intensity: 'med' }),
            borderRadius: 22, padding: '40px 28px', textAlign: 'center',
          }}>
            <div style={{ fontFamily: 'var(--font-newsreader)', fontSize: 22, color: ink,
              fontStyle: 'italic', marginBottom: 8 }}>Hali yozuvchilar yo&apos;q.</div>
            <p style={{ fontFamily: 'var(--font-newsreader)', fontSize: 15, color: mute,
              margin: '0 0 20px', maxWidth: 420, marginInline: 'auto', lineHeight: 1.5 }}>
              Hisob yarating va birinchi yozuvchi bo&apos;ling. Boshqalar sizdan boshlaydi.
            </p>
            <Link href="/auth/signup" className="press" style={{
              height: 40, padding: '0 18px', borderRadius: 10,
              background: tokens.orangeGrad, color: '#fff',
              fontFamily: 'var(--font-geist)', fontSize: 13.5, fontWeight: 600,
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6,
              boxShadow: '0 8px 18px rgba(255,87,34,0.3)',
            }}><Icon.create s={14} c="#fff" /> Hisob yarating</Link>
          </div>
        )}
      </div>

      <div style={{ padding: '40px 36px 160px' }}>
        <h3 style={{ fontFamily: 'var(--font-newsreader)', fontSize: 22, fontWeight: 400, color: ink,
          letterSpacing: -0.3, marginBottom: 14 }}>Tanlangan <span style={{ fontStyle: 'italic' }}>to&apos;plamlar</span></h3>
        <div style={{
          ...liquidSurface({ dark, intensity: 'med' }),
          borderRadius: 22, padding: '40px 28px', textAlign: 'center',
        }}>
          <div style={{ fontFamily: 'var(--font-newsreader)', fontSize: 18, color: mute, fontStyle: 'italic' }}>
            To&apos;plamlar &mdash; tez orada.
          </div>
        </div>
      </div>
    </div>
  );
}
