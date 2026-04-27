'use client';
export function SiyohLogo({ size = 28, dark = false, withMark = true }: { size?: number; dark?: boolean; withMark?: boolean }) {
  const ink = dark ? '#F5EDE0' : '#1A1613';
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: 'linear-gradient(135deg, #FF5722 0%, #FF8A4C 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 10px rgba(255,87,34,0.35)', flexShrink: 0,
      }}>
        <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none">
          <path d="M18 3c-6 1-10 5-12 10l-2 6c3-1 9-3 12-7 2-3 3-6 2-9z"
                fill="#fff" stroke="#fff" strokeWidth="0.5" strokeLinejoin="round"/>
          <path d="M4 21c3-4 8-7 12-8" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
        </svg>
      </div>
      {withMark && (
        <span style={{
          fontFamily: 'var(--font-newsreader)', fontSize: size * 0.72,
          fontWeight: 500, letterSpacing: -0.5, color: ink, lineHeight: 1,
        }}>Siyoh</span>
      )}
    </div>
  );
}
