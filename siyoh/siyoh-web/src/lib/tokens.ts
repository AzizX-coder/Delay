export const tokens = {
  paper: '#FDFBF7',
  paperTint: '#F7F1E8',
  paperDeep: '#EFE6D6',
  ink: '#1A1613',
  inkSoft: '#3A332C',
  mute: '#6B6158',
  muteSoft: '#A89C8E',
  line: 'rgba(26,22,19,0.08)',
  lineSoft: 'rgba(26,22,19,0.05)',
  orange: '#FF6A3D',
  orangeDeep: '#F04A1E',
  orangeSoft: '#FF9A5B',
  orangeTint: '#FFE8DB',
  orangeGrad: 'linear-gradient(135deg, #FF5722 0%, #FF8A4C 100%)',
  orangeGradSoft: 'linear-gradient(135deg, #FFE1D0 0%, #FFD0B0 100%)',
  darkBg: '#141110',
  darkCard: '#1E1A17',
  darkElev: '#272220',
  darkInk: '#F5EDE0',
  darkMute: '#A89C8E',
  darkLine: 'rgba(255,237,213,0.08)',
} as const;

export function liquidSurface(opts: { dark?: boolean; intensity?: 'light' | 'med' | 'heavy'; tint?: string } = {}) {
  const { dark = false, intensity = 'med', tint = null } = opts;
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
  } as React.CSSProperties;
}
