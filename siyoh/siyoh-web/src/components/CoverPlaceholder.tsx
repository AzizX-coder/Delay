'use client';
const tints = [
  'linear-gradient(135deg, #FF6A3D 0%, #FF8A4C 100%)',
  'linear-gradient(160deg, #2A241F 0%, #4A3C30 100%)',
  'linear-gradient(140deg, #EFE6D6 0%, #D4C5A8 100%)',
  'linear-gradient(150deg, #3A332C 0%, #6B5A47 100%)',
  'linear-gradient(135deg, #FFC08A 0%, #FFA560 100%)',
  'linear-gradient(145deg, #1A1613 0%, #3A2820 100%)',
  'linear-gradient(135deg, #F7F1E8 0%, #E8D5B9 100%)',
  'linear-gradient(160deg, #FF5722 0%, #D73900 100%)',
  'linear-gradient(150deg, #5A4A3A 0%, #8B6F4E 100%)',
];
const fg = ['#fff', '#F5EDE0', '#3A332C', '#F5EDE0', '#3A332C', '#F5EDE0', '#3A332C', '#fff', '#F5EDE0'];

export function CoverPlaceholder({
  w = 120, h = 160, seed = 0, label = 'Cover',
}: { w?: number | string; h?: number | string; seed?: number; label?: string }) {
  const t = tints[seed % tints.length];
  const fgc = fg[seed % fg.length];
  const numW = typeof w === 'number' ? w : 200;
  return (
    <div style={{
      width: w, height: h, borderRadius: 10,
      background: t, position: 'relative', overflow: 'hidden',
      boxShadow: '0 6px 20px rgba(26,22,19,0.18), inset 0 0 0 0.5px rgba(0,0,0,0.08)',
      flexShrink: 0,
    }}>
      <div style={{ position: 'absolute', inset: 0,
        background: 'linear-gradient(105deg, rgba(255,255,255,0.12) 0%, transparent 40%)' }} />
      <div style={{
        position: 'absolute', left: '8%', top: '8%',
        fontFamily: 'var(--font-newsreader)', fontSize: Math.max(11, numW * 0.11),
        fontWeight: 500, color: fgc, lineHeight: 1.1, letterSpacing: -0.3, maxWidth: '75%',
      }}>{label}</div>
      <div style={{
        position: 'absolute', left: '8%', bottom: '8%',
        fontFamily: 'var(--font-geist)', fontSize: Math.max(8, numW * 0.065),
        color: fgc, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 1,
      }}>Siyoh</div>
      <div style={{ position: 'absolute', left: 4, top: 0, bottom: 0, width: 1, background: 'rgba(0,0,0,0.1)' }} />
    </div>
  );
}
