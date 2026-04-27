'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Avatar } from '@/components/Avatar';
import { Chip } from '@/components/Chip';
import { CoverPlaceholder } from '@/components/CoverPlaceholder';
import { StoryRow } from '@/components/StoryRow';
import { Icon } from '@/components/Icon';
import { tokens, liquidSurface } from '@/lib/tokens';
import { useTheme } from '@/components/ThemeProvider';
import type { Story } from '@/lib/types';

export function FeedView({ stories }: { stories: Story[] }) {
  const { dark } = useTheme();
  const ink = dark ? tokens.darkInk : tokens.ink;
  const mute = dark ? tokens.darkMute : tokens.mute;
  const line = dark ? tokens.darkLine : tokens.line;
  const [filter, setFilter] = useState('Siz uchun');

  const featured = stories[0];
  const rest = stories.slice(1);

  return (
    <div>
      <div style={{
        position: 'sticky', top: 0, zIndex: 10, padding: '18px 36px 14px',
        ...liquidSurface({ dark, intensity: 'heavy',
          tint: dark ? 'rgba(20,17,16,0.7)' : 'rgba(253,251,247,0.75)' }),
        borderBottom: `0.5px solid ${line}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <h1 style={{ fontFamily: 'var(--font-newsreader)', fontSize: 26, fontWeight: 400, color: ink, letterSpacing: -0.4, margin: 0 }}>Bosh sahifa</h1>
        <div style={{ display: 'flex', gap: 6 }}>
          {['Siz uchun', 'Kuzatilayotgan', 'Audio'].map(f => (
            <Chip key={f} active={filter === f} dark={dark} onClick={() => setFilter(f)}>{f}</Chip>
          ))}
        </div>
      </div>

      {!featured ? (
        <div className="anim-fade-up" style={{ padding: '64px 36px' }}>
          <div style={{
            ...liquidSurface({ dark, intensity: 'med' }),
            borderRadius: 28, padding: '60px 40px', textAlign: 'center', maxWidth: 640, margin: '0 auto',
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: 22, margin: '0 auto 22px',
              background: tokens.orangeGrad,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 14px 30px rgba(255,87,34,0.32)',
            }}><Icon.create s={28} c="#fff" /></div>
            <h2 style={{ fontFamily: 'var(--font-newsreader)', fontSize: 36, fontWeight: 400,
              color: ink, letterSpacing: -0.7, margin: '0 0 12px' }}>
              Lenta hozircha <span style={{ fontStyle: 'italic' }}>tinch.</span>
            </h2>
            <p style={{ fontFamily: 'var(--font-newsreader)', fontSize: 17, color: mute,
              lineHeight: 1.55, margin: '0 0 28px', maxWidth: 460, marginInline: 'auto' }}>
              Hech kim hali hech narsa nashr qilmagan. Birinchi hikoyani siz yozsangiz,
              bu yerda paydo bo&apos;lib, kashf etiladi.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <Link href="/create" className="press" style={{
                height: 46, padding: '0 24px', borderRadius: 12,
                background: tokens.orangeGrad, color: '#fff',
                fontFamily: 'var(--font-geist)', fontSize: 14, fontWeight: 600,
                textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
                boxShadow: '0 8px 20px rgba(255,87,34,0.3)',
              }}><Icon.create s={16} c="#fff" /> Birinchi hikoyani yozish</Link>
              <Link href="/explore" className="press" style={{
                height: 46, padding: '0 22px', borderRadius: 12,
                background: 'transparent', color: ink,
                border: `0.5px solid ${line}`,
                fontFamily: 'var(--font-geist)', fontSize: 14, fontWeight: 500,
                textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
              }}>Kashf etish</Link>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div style={{ padding: '28px 36px 0' }}>
            <Link href={`/story/${featured.slug}`} style={{ textDecoration: 'none' }}>
              <div className="anim-fade-up" style={{
                borderRadius: 26, padding: 38, minHeight: 340,
                background: tokens.orangeGrad, color: '#fff', position: 'relative', overflow: 'hidden',
                boxShadow: '0 30px 60px rgba(255,87,34,0.25)',
                display: 'grid', gridTemplateColumns: '1fr 200px', gap: 28, alignItems: 'center',
              }}>
                <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300,
                  borderRadius: '50%', background: 'rgba(255,255,255,0.18)', filter: 'blur(30px)' }} />
                <div style={{ position: 'relative' }}>
                  <div style={{ padding: '6px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.22)',
                    backdropFilter: 'blur(10px)', color: '#fff',
                    fontFamily: 'var(--font-geist)', fontSize: 11, fontWeight: 600, letterSpacing: 0.6,
                    textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} /> Kunning hikoyasi
                  </div>
                  <h2 style={{
                    fontFamily: 'var(--font-newsreader)', fontSize: 48, fontWeight: 400,
                    letterSpacing: -1, lineHeight: 1.05, margin: '18px 0 14px', maxWidth: 520,
                  }}>{featured.title}</h2>
                  <p style={{ fontFamily: 'var(--font-newsreader)', fontSize: 17, opacity: 0.92, lineHeight: 1.5,
                    maxWidth: 520, marginBottom: 22 }}>{featured.excerpt.slice(0, 160)}&hellip;</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar name={featured.author?.display_name?.[0] || 'A'} size={30} seed={featured.cover_seed} />
                    <div style={{ fontFamily: 'var(--font-geist)', fontSize: 13 }}>
                      <div style={{ fontWeight: 500 }}>{featured.author?.display_name}</div>
                      <div style={{ opacity: 0.8 }}>{featured.mins} daqiqa &middot; {featured.published_at?.slice(5)}</div>
                    </div>
                    <span style={{
                      marginLeft: 20, height: 40, padding: '0 18px', borderRadius: 999,
                      background: '#fff', color: tokens.orangeDeep,
                      fontFamily: 'var(--font-geist)', fontSize: 13, fontWeight: 600,
                      display: 'inline-flex', alignItems: 'center',
                    }}>O&apos;qish &rarr;</span>
                  </div>
                </div>
                <div style={{ position: 'relative', zIndex: 1, transform: 'rotate(3deg)' }}>
                  <CoverPlaceholder w={200} h={270} seed={featured.cover_seed}
                    label={featured.title.split(' ').slice(0, 3).join(' ')} />
                </div>
              </div>
            </Link>
          </div>

          <div style={{ padding: '32px 36px 160px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
              <h3 style={{ fontFamily: 'var(--font-newsreader)', fontSize: 26, fontWeight: 400, color: ink,
                letterSpacing: -0.4, margin: 0 }}>Siyohdan so&apos;nggilari</h3>
              <Link href="/books" style={{ fontFamily: 'var(--font-geist)', fontSize: 13, color: tokens.orange, fontWeight: 500, textDecoration: 'none' }}>Hammasi &rarr;</Link>
            </div>
            {rest.map((s, i) => <StoryRow key={s.id} story={s} seed={i + 1} />)}
          </div>
        </>
      )}
    </div>
  );
}
