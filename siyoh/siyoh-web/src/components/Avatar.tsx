'use client';
const palette = [
  'linear-gradient(135deg,#FF6A3D,#FF8A4C)',
  'linear-gradient(135deg,#3A2820,#6B5A47)',
  'linear-gradient(135deg,#EFE6D6,#D4C5A8)',
  'linear-gradient(135deg,#FFC08A,#FF8A4C)',
  'linear-gradient(135deg,#1A1613,#4A3C30)',
];
const fg = ['#fff', '#F5EDE0', '#3A332C', '#3A332C', '#F5EDE0'];

export function Avatar({ name = 'A', size = 36, seed = 0 }: { name?: string; size?: number; seed?: number }) {
  const idx = (typeof seed === 'number' ? seed : name.charCodeAt(0)) % palette.length;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: palette[idx],
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-newsreader)', fontWeight: 500,
      fontSize: size * 0.42, color: fg[idx], flexShrink: 0,
      boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.08)',
    }}>{name[0]?.toUpperCase()}</div>
  );
}
