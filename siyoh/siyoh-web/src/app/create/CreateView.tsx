'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { tokens, liquidSurface } from '@/lib/tokens';
import { useTheme } from '@/components/ThemeProvider';
import { useToast } from '@/components/Toast';
import { publishStory } from '@/lib/actions';

const TAG_OPTIONS = ['Esse', 'Roman', 'Hikoya', 'She\'r', 'Sayohat', 'Oziq-ovqat', 'Hazil', 'Maktub', 'Audio'];

export function CreateView() {
  const { dark } = useTheme();
  const { push } = useToast();
  const router = useRouter();
  const ink = dark ? tokens.darkInk : tokens.ink;
  const mute = dark ? tokens.darkMute : tokens.mute;
  const line = dark ? tokens.darkLine : tokens.line;

  const [type, setType] = useState<'text' | 'audio' | 'both'>('text');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [pending, start] = useTransition();

  function toggleTag(t: string) {
    setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : prev.length < 4 ? [...prev, t] : prev);
  }

  function publish() {
    start(async () => {
      const res = await publishStory({ title, subtitle, body, type, tags });
      if (res.ok && res.slug) {
        push({ kind: 'success', title: 'Nashr qilindi', body: 'Hikoyangiz endi onlayn.' });
        router.push(`/story/${res.slug}`);
      } else {
        push({ kind: 'error', title: 'Nashr qilib bo\'lmadi', body: res.error });
      }
    });
  }

  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;
  const readMin = Math.max(1, Math.round(wordCount / 220));

  return (
    <div style={{ padding: '32px 60px 200px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-geist)', fontSize: 11, color: mute, letterSpacing: 0.6,
            textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Yangi hikoya</div>
          <div style={{ fontFamily: 'var(--font-newsreader)', fontSize: 24, color: ink, fontWeight: 400, letterSpacing: -0.3 }}>
            {wordCount > 0 ? `${wordCount} so'z · ${readMin} daqiqa o'qish` : 'Yozishni boshlang…'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={publish} disabled={pending || !title.trim() || !body.trim()} className="press" style={{
            height: 40, padding: '0 18px', borderRadius: 12, border: 'none',
            cursor: pending ? 'wait' : !title.trim() || !body.trim() ? 'default' : 'pointer',
            background: tokens.orangeGrad, color: '#fff',
            fontFamily: 'var(--font-geist)', fontSize: 13.5, fontWeight: 600,
            boxShadow: '0 8px 18px rgba(255,87,34,0.35)',
            opacity: pending || !title.trim() || !body.trim() ? 0.5 : 1,
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>{pending ? 'Nashr qilinmoqda…' : 'Nashr qilish'} {!pending && <Icon.chev s={14} c="#fff" />}</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
        {([
          { k: 'text', label: 'Yozish', icon: Icon.text },
          { k: 'audio', label: 'Yozib olish', icon: Icon.mic },
          { k: 'both', label: 'Yozish + Audio', icon: Icon.headphones },
        ] as const).map(o => (
          <button key={o.k} onClick={() => setType(o.k)} className="press" style={{
            height: 42, padding: '0 18px', borderRadius: 12, cursor: 'pointer',
            border: type === o.k ? `1.5px solid ${tokens.orange}` : `0.5px solid ${line}`,
            background: type === o.k ? 'rgba(255,87,34,0.08)' : 'transparent',
            color: type === o.k ? tokens.orange : ink,
            fontFamily: 'var(--font-geist)', fontSize: 13.5, fontWeight: 500,
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>
            <o.icon s={16} c={type === o.k ? tokens.orange : ink} /> {o.label}
          </button>
        ))}
      </div>

      <input value={title} onChange={e => setTitle(e.target.value)}
        placeholder="Sarlavha"
        style={{
          width: '100%', border: 'none', background: 'transparent', outline: 'none',
          fontFamily: 'var(--font-newsreader)', fontSize: 56, color: ink, fontWeight: 400,
          letterSpacing: -1, marginBottom: 10, padding: 0, lineHeight: 1.05,
        }} />
      <input value={subtitle} onChange={e => setSubtitle(e.target.value)}
        placeholder="Kayfiyatni belgilovchi izoh (ixtiyoriy)"
        style={{
          width: '100%', border: 'none', background: 'transparent', outline: 'none',
          fontFamily: 'var(--font-newsreader)', fontSize: 22, color: mute, fontStyle: 'italic',
          marginBottom: 24, padding: 0,
        }} />

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 28 }}>
        {TAG_OPTIONS.map(t => {
          const on = tags.includes(t);
          return (
            <button key={t} type="button" onClick={() => toggleTag(t)} className="press" style={{
              height: 30, padding: '0 12px', borderRadius: 999, border: 'none', cursor: 'pointer',
              background: on ? tokens.orange : (dark ? 'rgba(255,237,213,0.06)' : 'rgba(26,22,19,0.04)'),
              color: on ? '#fff' : ink,
              fontFamily: 'var(--font-geist)', fontSize: 12.5, fontWeight: 500,
            }}>{on ? '✓ ' : '+ '}{t}</button>
          );
        })}
      </div>

      {(type === 'audio' || type === 'both') && (
        <div style={{
          borderRadius: 22, padding: 24, marginBottom: 28,
          background: tokens.orangeGrad, color: '#fff',
          boxShadow: '0 18px 40px rgba(255,87,34,0.25)',
          display: 'flex', alignItems: 'center', gap: 20,
        }}>
          <button aria-label="Yozish" className="anim-pulse-ring press" style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.4)',
            cursor: 'pointer', border: 'none',
          }}>
            <Icon.mic s={28} c="#fff" />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-geist)', fontSize: 11, opacity: 0.85, letterSpacing: 0.8,
              textTransform: 'uppercase', fontWeight: 600 }}>Yozib olish uchun bosing</div>
            <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 32, fontWeight: 500, marginTop: 2, marginBottom: 8 }}>00:00</div>
            <div style={{ fontFamily: 'var(--font-geist)', fontSize: 12, opacity: 0.85 }}>
              Audio yozuv nashr qilinganda Supabase Storage&apos;ga yuklanadi.
            </div>
          </div>
        </div>
      )}

      {(type === 'text' || type === 'both') && (
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Davom eting…"
          style={{
            width: '100%', border: 'none', background: 'transparent', outline: 'none', resize: 'vertical',
            fontFamily: 'var(--font-newsreader)', fontSize: 21, color: ink, lineHeight: 1.7,
            minHeight: 400, letterSpacing: -0.1, padding: 0,
          }}
        />
      )}

      <div style={{
        position: 'fixed', bottom: 30, left: '50%', transform: 'translateX(-50%)', zIndex: 30,
        display: 'flex', gap: 4, padding: 6, borderRadius: 18,
        ...liquidSurface({ dark, intensity: 'heavy' }),
      }}>
        {[
          { g: 'B', w: 700 }, { g: 'I', style: 'italic' as const }, { g: 'U', deco: 'underline' as const },
          { g: '“”' }, { g: 'H₁' }, { g: 'H₂' }, { g: '•' }, { g: '🔗', noSerif: true },
        ].map((b, i) => (
          <button key={i} className="press" style={{
            width: 40, height: 40, borderRadius: 12, border: 'none', cursor: 'pointer',
            background: 'transparent',
            fontFamily: b.noSerif ? 'var(--font-geist)' : 'var(--font-newsreader)',
            fontSize: 16, color: ink, fontWeight: b.w || 500,
            fontStyle: b.style || 'normal', textDecoration: b.deco || 'none',
          }}>{b.g}</button>
        ))}
      </div>
    </div>
  );
}
