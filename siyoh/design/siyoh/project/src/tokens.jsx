// Siyoh design tokens — premium, warm, liquid

const SIYOH_TOKENS = {
  // Core palette
  paper: '#FDFBF7',       // milky white
  paperTint: '#F7F1E8',
  paperDeep: '#EFE6D6',
  ink: '#1A1613',         // warm near-black
  inkSoft: '#3A332C',
  mute: '#6B6158',
  muteSoft: '#A89C8E',
  line: 'rgba(26,22,19,0.08)',
  lineSoft: 'rgba(26,22,19,0.05)',

  // Signature orange
  orange: '#FF6A3D',
  orangeDeep: '#F04A1E',
  orangeSoft: '#FF9A5B',
  orangeTint: '#FFE8DB',
  orangeGrad: 'linear-gradient(135deg, #FF5722 0%, #FF8A4C 100%)',
  orangeGradSoft: 'linear-gradient(135deg, #FFE1D0 0%, #FFD0B0 100%)',

  // Dark mode
  darkBg: '#141110',
  darkCard: '#1E1A17',
  darkElev: '#272220',
  darkInk: '#F5EDE0',
  darkMute: '#A89C8E',
  darkLine: 'rgba(255,237,213,0.08)',

  // Typography
  serif: '"Newsreader", "Charter", "Iowan Old Style", Georgia, serif',
  sans: '"Geist", "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
  mono: '"Geist Mono", "JetBrains Mono", ui-monospace, monospace',

  // Radii
  r: { xs: 8, sm: 12, md: 16, lg: 22, xl: 28, pill: 9999 },
};

// Liquid glass surface — reusable recipe
function liquidSurface({ dark = false, intensity = 'med', tint = null } = {}) {
  const blur = intensity === 'heavy' ? 28 : intensity === 'light' ? 10 : 18;
  const baseBg = dark
    ? tint || 'rgba(40,36,32,0.55)'
    : tint || 'rgba(255,255,255,0.55)';
  return {
    backdropFilter: `blur(${blur}px) saturate(180%)`,
    WebkitBackdropFilter: `blur(${blur}px) saturate(180%)`,
    background: baseBg,
    boxShadow: dark
      ? 'inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 30px rgba(0,0,0,0.3)'
      : 'inset 0 1px 0 rgba(255,255,255,0.9), 0 4px 18px rgba(26,22,19,0.06), 0 10px 40px rgba(26,22,19,0.04)',
    border: dark ? '0.5px solid rgba(255,255,255,0.08)' : '0.5px solid rgba(26,22,19,0.05)',
  };
}

// Siyoh logo — quill in orange circle + wordmark right of it
function SiyohLogo({ size = 28, color, dark = false, withMark = true }) {
  const ink = color || (dark ? '#F5EDE0' : '#1A1613');
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: 'linear-gradient(135deg, #FF5722 0%, #FF8A4C 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 10px rgba(255,87,34,0.35)',
        flexShrink: 0,
      }}>
        <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none">
          {/* Quill */}
          <path d="M18 3c-6 1-10 5-12 10l-2 6c3-1 9-3 12-7 2-3 3-6 2-9z"
                fill="#fff" stroke="#fff" strokeWidth="0.5" strokeLinejoin="round"/>
          <path d="M4 21c3-4 8-7 12-8" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
        </svg>
      </div>
      {withMark && (
        <span style={{
          fontFamily: SIYOH_TOKENS.serif,
          fontSize: size * 0.72,
          fontWeight: 500,
          letterSpacing: -0.5,
          color: ink,
          lineHeight: 1,
        }}>Siyoh</span>
      )}
    </div>
  );
}

Object.assign(window, { SIYOH_TOKENS, liquidSurface, SiyohLogo });
