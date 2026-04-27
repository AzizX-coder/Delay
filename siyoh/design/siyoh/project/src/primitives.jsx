// Reusable UI primitives for Siyoh

// Soft colored blobs for the background
function BgBlobs({ dark = false, variant = 'default' }) {
  const blobs = variant === 'warm' ? [
    { top: '-10%', left: '-10%', size: 380, c: 'rgba(255,138,76,0.35)' },
    { top: '30%', right: '-15%', size: 340, c: 'rgba(255,87,34,0.22)' },
    { bottom: '-10%', left: '20%', size: 300, c: 'rgba(255,200,150,0.3)' },
  ] : [
    { top: '-15%', right: '-10%', size: 320, c: dark ? 'rgba(255,87,34,0.18)' : 'rgba(255,138,76,0.2)' },
    { top: '40%', left: '-20%', size: 380, c: dark ? 'rgba(255,138,76,0.1)' : 'rgba(255,200,150,0.25)' },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {blobs.map((b, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: b.top, left: b.left, right: b.right, bottom: b.bottom,
          width: b.size, height: b.size, borderRadius: '50%',
          background: b.c, filter: 'blur(70px)',
        }} />
      ))}
    </div>
  );
}

// Placeholder cover — tinted striped, for book covers
function CoverPlaceholder({ w = 120, h = 160, seed = 0, label = 'Cover', dark = false }) {
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
  const fg = [
    '#fff', '#F5EDE0', '#3A332C', '#F5EDE0', '#3A332C',
    '#F5EDE0', '#3A332C', '#fff', '#F5EDE0',
  ];
  const t = tints[seed % tints.length];
  const fgc = fg[seed % fg.length];
  return (
    <div style={{
      width: w, height: h, borderRadius: 10,
      background: t, position: 'relative', overflow: 'hidden',
      boxShadow: '0 6px 20px rgba(26,22,19,0.18), inset 0 0 0 0.5px rgba(0,0,0,0.08)',
      flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(105deg, rgba(255,255,255,0.12) 0%, transparent 40%)',
      }} />
      <div style={{
        position: 'absolute', left: w * 0.08, top: h * 0.08,
        fontFamily: SIYOH_TOKENS.serif, fontSize: Math.max(11, w * 0.11),
        fontWeight: 500, color: fgc, lineHeight: 1.1,
        letterSpacing: -0.3, maxWidth: w * 0.75,
      }}>{label}</div>
      <div style={{
        position: 'absolute', left: w * 0.08, bottom: h * 0.08,
        fontFamily: SIYOH_TOKENS.sans, fontSize: Math.max(8, w * 0.065),
        color: fgc, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 1,
      }}>Siyoh</div>
      {/* spine line */}
      <div style={{
        position: 'absolute', left: 4, top: 0, bottom: 0, width: 1,
        background: 'rgba(0,0,0,0.1)',
      }} />
    </div>
  );
}

// Avatar — letter in circle
function Avatar({ name = 'A', size = 36, seed = 0 }) {
  const palette = [
    'linear-gradient(135deg,#FF6A3D,#FF8A4C)',
    'linear-gradient(135deg,#3A2820,#6B5A47)',
    'linear-gradient(135deg,#EFE6D6,#D4C5A8)',
    'linear-gradient(135deg,#FFC08A,#FF8A4C)',
    'linear-gradient(135deg,#1A1613,#4A3C30)',
  ];
  const fg = ['#fff', '#F5EDE0', '#3A332C', '#3A332C', '#F5EDE0'];
  const idx = (typeof seed === 'number' ? seed : name.charCodeAt(0)) % palette.length;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: palette[idx],
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: SIYOH_TOKENS.serif, fontWeight: 500,
      fontSize: size * 0.42, color: fg[idx], flexShrink: 0,
      boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.08)',
    }}>{name[0]?.toUpperCase()}</div>
  );
}

// Pill chip for filters / categories
function Chip({ children, active = false, dark = false, onClick, icon }) {
  const t = SIYOH_TOKENS;
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      height: 34, padding: '0 14px', borderRadius: 9999,
      border: 'none', cursor: 'pointer',
      fontFamily: t.sans, fontSize: 13.5, fontWeight: 500,
      background: active
        ? (dark ? '#F5EDE0' : '#1A1613')
        : (dark ? 'rgba(255,237,213,0.06)' : 'rgba(26,22,19,0.04)'),
      color: active
        ? (dark ? '#1A1613' : '#F5EDE0')
        : (dark ? '#F5EDE0' : '#1A1613'),
      letterSpacing: -0.1,
      flexShrink: 0,
      transition: 'all 0.18s',
    }}>
      {icon}
      {children}
    </button>
  );
}

// Icon set — hairline, ~22px
const Icon = {
  home: (s=22, c='currentColor') => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1v-9.5z"/></svg>,
  explore: (s=22, c='currentColor') => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5L13.5 13.5 8.5 15.5 10.5 10.5 15.5 8.5z"/></svg>,
  books: (s=22, c='currentColor') => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4.5A1.5 1.5 0 015.5 3H10v18H5.5A1.5 1.5 0 014 19.5v-15z"/><path d="M10 3h4.5A1.5 1.5 0 0116 4.5v15a1.5 1.5 0 01-1.5 1.5H10V3z"/><path d="M17 6l3.5-1 1.5 14-3.5 1L17 6z"/></svg>,
  create: (s=22, c='currentColor') => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>,
  profile: (s=22, c='currentColor') => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6"/></svg>,
  search: (s=22, c='currentColor') => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>,
  bell: (s=22, c='currentColor') => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9a6 6 0 0112 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M10 21a2 2 0 004 0"/></svg>,
  heart: (s=22, c='currentColor', filled=false) => <svg width={s} height={s} viewBox="0 0 24 24" fill={filled?c:'none'} stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20s-7-4.5-9-9a4.5 4.5 0 018-3 4.5 4.5 0 018 3c-1.5 4.5-7 9-7 9z"/></svg>,
  comment: (s=22, c='currentColor') => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a8 8 0 01-8 8H5l-2 2V10a8 8 0 018-8h2a8 8 0 018 8v2z"/></svg>,
  bookmark: (s=22, c='currentColor', filled=false) => <svg width={s} height={s} viewBox="0 0 24 24" fill={filled?c:'none'} stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h12v18l-6-4-6 4V4z"/></svg>,
  more: (s=22, c='currentColor') => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><circle cx="6" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="18" cy="12" r="1.6"/></svg>,
  play: (s=22, c='currentColor', filled=true) => <svg width={s} height={s} viewBox="0 0 24 24" fill={filled?c:'none'} stroke={c} strokeWidth="1.6" strokeLinejoin="round"><path d="M7 4l13 8-13 8V4z"/></svg>,
  pause: (s=22, c='currentColor') => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>,
  mic: (s=22, c='currentColor') => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0014 0"/><path d="M12 18v3"/></svg>,
  headphones: (s=22, c='currentColor') => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14v-2a8 8 0 0116 0v2"/><rect x="3" y="14" width="5" height="7" rx="1.5"/><rect x="16" y="14" width="5" height="7" rx="1.5"/></svg>,
  text: (s=22, c='currentColor') => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 5h14M5 12h14M5 19h8"/></svg>,
  chev: (s=22, c='currentColor', dir='right') => {
    const r = { right: 0, left: 180, up: 270, down: 90 }[dir];
    return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ transform: `rotate(${r}deg)` }}><path d="M9 6l6 6-6 6"/></svg>;
  },
  close: (s=22, c='currentColor') => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><path d="M6 6l12 12M18 6l-12 12"/></svg>,
  filter: (s=22, c='currentColor') => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round"><path d="M4 6h16M7 12h10M10 18h4"/></svg>,
  check: (s=22, c='currentColor') => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>,
  sun: (s=22, c='currentColor') => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.5 4.5l1.5 1.5M18 18l1.5 1.5M4.5 19.5L6 18M18 6l1.5-1.5"/></svg>,
  moon: (s=22, c='currentColor') => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 13A9 9 0 1111 3a7 7 0 0010 10z"/></svg>,
  settings: (s=22, c='currentColor') => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></svg>,
  back: (s=22, c='currentColor') => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6"/></svg>,
  share: (s=22, c='currentColor') => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v13M8 7l4-4 4 4M5 14v5a2 2 0 002 2h10a2 2 0 002-2v-5"/></svg>,
  skip: (s=22, c='currentColor', dir='fwd') => {
    const f = dir === 'fwd';
    return <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d={f ? 'M4 5l9 7-9 7V5z M15 5h3v14h-3V5z' : 'M20 5l-9 7 9 7V5z M6 5h3v14H6V5z'}/></svg>;
  },
};

Object.assign(window, { BgBlobs, CoverPlaceholder, Avatar, Chip, Icon });
