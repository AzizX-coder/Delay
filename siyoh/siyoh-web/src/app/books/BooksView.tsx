'use client';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { Chip } from '@/components/Chip';
import { CoverPlaceholder } from '@/components/CoverPlaceholder';
import { Icon } from '@/components/Icon';
import { tokens, liquidSurface } from '@/lib/tokens';
import { useTheme } from '@/components/ThemeProvider';
import { genres } from '@/lib/mock-data';
import type { Story } from '@/lib/types';

export function BooksView({ stories }: { stories: Story[] }) {
  const { dark } = useTheme();
  const ink = dark ? tokens.darkInk : tokens.ink;
  const mute = dark ? tokens.darkMute : tokens.mute;
  const line = dark ? tokens.darkLine : tokens.line;
  const [genre, setGenre] = useState('Hammasi');
  const [format, setFormat] = useState<'Hammasi' | 'Matn' | 'Audio'>('Hammasi');
  const [sort, setSort] = useState<'Yangi' | 'Mashhur' | 'Mavzu'>('Yangi');

  const filtered = useMemo(() => {
    let s = stories.filter(x => {
      if (format === 'Matn' && x.type !== 'text') return false;
      if (format === 'Audio' && x.type !== 'audio') return false;
      if (genre !== 'Hammasi' && !x.tags.includes(genre)) return false;
      return true;
    });
    if (sort === 'Mashhur') s = [...s].sort((a, b) => b.plays - a.plays);
    return s;
  }, [stories, genre, format, sort]);

  return (
    <div>
      <div style={{ padding: '28px 36px 0' }}>
        <h1 style={{ fontFamily: 'var(--font-newsreader)', fontSize: 44, fontWeight: 400, color: ink,
          letterSpacing: -0.9, margin: '0 0 6px' }}>Kitoblar</h1>
        <p style={{ fontFamily: 'var(--font-newsreader)', fontSize: 16, color: mute, margin: 0 }}>
          {filtered.length} hikoya &middot; format, janr va mavzu bo&apos;yicha filtr
        </p>
      </div>

      <div style={{ padding: '22px 36px 18px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', padding: 4, borderRadius: 12, ...liquidSurface({ dark, intensity: 'med' }) }}>
          {(['Hammasi', 'Matn', 'Audio'] as const).map(f => (
            <button key={f} onClick={() => setFormat(f)} style={{
              height: 30, padding: '0 14px', borderRadius: 9, border: 'none', cursor: 'pointer',
              background: format === f ? (dark ? tokens.darkInk : tokens.ink) : 'transparent',
              color: format === f ? (dark ? tokens.darkBg : tokens.paper) : (dark ? tokens.darkInk : tokens.ink),
              fontFamily: 'var(--font-geist)', fontSize: 12.5, fontWeight: 500,
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              {f === 'Matn' && <Icon.text s={13} c={format === f ? (dark ? tokens.darkBg : tokens.paper) : ink} />}
              {f === 'Audio' && <Icon.headphones s={13} c={format === f ? (dark ? tokens.darkBg : tokens.paper) : ink} />}
              {f}
            </button>
          ))}
        </div>

        <div style={{ width: 1, height: 20, background: line }} />

        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', flex: 1, scrollbarWidth: 'none' }} className="no-scrollbar">
          {genres.map(g => (
            <Chip key={g} active={genre === g} dark={dark} onClick={() => setGenre(g)}>{g}</Chip>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontFamily: 'var(--font-geist)', fontSize: 12, color: mute }}>Saralash:</span>
          {(['Yangi', 'Mashhur', 'Mavzu'] as const).map(s => (
            <button key={s} onClick={() => setSort(s)} style={{
              height: 28, padding: '0 10px', borderRadius: 999, border: 'none', cursor: 'pointer',
              background: sort === s ? 'rgba(255,87,34,0.12)' : 'transparent',
              color: sort === s ? tokens.orange : mute,
              fontFamily: 'var(--font-geist)', fontSize: 12, fontWeight: 500,
            }}>{s}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="anim-fade-up" style={{ padding: '24px 36px 160px' }}>
          <div style={{
            ...liquidSurface({ dark, intensity: 'med' }),
            borderRadius: 28, padding: '60px 40px', textAlign: 'center', maxWidth: 600, margin: '0 auto',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 18, margin: '0 auto 18px',
              background: tokens.orangeGrad,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 14px 30px rgba(255,87,34,0.32)',
            }}><Icon.books s={26} c="#fff" /></div>
            <h2 style={{ fontFamily: 'var(--font-newsreader)', fontSize: 30, fontWeight: 400,
              color: ink, letterSpacing: -0.6, margin: '0 0 10px' }}>
              Tokchada hali <span style={{ fontStyle: 'italic' }}>kitob yo&apos;q.</span>
            </h2>
            <p style={{ fontFamily: 'var(--font-newsreader)', fontSize: 15.5, color: mute,
              lineHeight: 1.55, margin: '0 0 24px', maxWidth: 420, marginInline: 'auto' }}>
              Hech kim hali nashr qilmagan. Birinchi muqovani siz qo&apos;ying.
            </p>
            <Link href="/create" className="press" style={{
              height: 44, padding: '0 22px', borderRadius: 12,
              background: tokens.orangeGrad, color: '#fff',
              fontFamily: 'var(--font-geist)', fontSize: 14, fontWeight: 600,
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
              boxShadow: '0 8px 20px rgba(255,87,34,0.3)',
            }}><Icon.create s={16} c="#fff" /> Hikoya yozish</Link>
          </div>
        </div>
      ) : (
        <div style={{
          padding: '0 36px 160px',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, rowGap: 28,
        }}>
          {filtered.map((s) => (
            <Link key={s.id} href={`/story/${s.slug}`} className="hover-lift" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ position: 'relative' }}>
                <CoverPlaceholder w="100%" h={280} seed={s.cover_seed} label={s.title.split(' ').slice(0, 3).join(' ')} />
                {s.type === 'audio' && (
                  <div style={{
                    position: 'absolute', top: 10, right: 10,
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}><Icon.headphones s={15} c={tokens.orangeDeep} /></div>
                )}
              </div>
              <div style={{
                fontFamily: 'var(--font-newsreader)', fontSize: 17, color: ink, fontWeight: 400,
                letterSpacing: -0.2, lineHeight: 1.2, marginTop: 12,
              }}>{s.title}</div>
              <div style={{ fontFamily: 'var(--font-geist)', fontSize: 12, color: mute, marginTop: 4 }}>{s.author?.display_name}</div>
              <div style={{ fontFamily: 'var(--font-geist)', fontSize: 11, color: mute, marginTop: 2, letterSpacing: 0.2 }}>
                {s.mins} daqiqa &middot; {s.tags[0]}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
