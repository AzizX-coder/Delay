'use client';
type P = { s?: number; c?: string };
type Pf = P & { filled?: boolean };
type Pd = P & { dir?: 'right' | 'left' | 'up' | 'down' };

export const Icon = {
  home: ({ s = 22, c = 'currentColor' }: P) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1v-9.5z"/></svg>,
  explore: ({ s = 22, c = 'currentColor' }: P) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5L13.5 13.5 8.5 15.5 10.5 10.5 15.5 8.5z"/></svg>,
  books: ({ s = 22, c = 'currentColor' }: P) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4.5A1.5 1.5 0 015.5 3H10v18H5.5A1.5 1.5 0 014 19.5v-15z"/><path d="M10 3h4.5A1.5 1.5 0 0116 4.5v15a1.5 1.5 0 01-1.5 1.5H10V3z"/><path d="M17 6l3.5-1 1.5 14-3.5 1L17 6z"/></svg>,
  create: ({ s = 22, c = 'currentColor' }: P) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>,
  profile: ({ s = 22, c = 'currentColor' }: P) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6"/></svg>,
  search: ({ s = 22, c = 'currentColor' }: P) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>,
  bell: ({ s = 22, c = 'currentColor' }: P) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9a6 6 0 0112 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M10 21a2 2 0 004 0"/></svg>,
  heart: ({ s = 22, c = 'currentColor', filled = false }: Pf) => <svg width={s} height={s} viewBox="0 0 24 24" fill={filled ? c : 'none'} stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20s-7-4.5-9-9a4.5 4.5 0 018-3 4.5 4.5 0 018 3c-1.5 4.5-7 9-7 9z"/></svg>,
  comment: ({ s = 22, c = 'currentColor' }: P) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a8 8 0 01-8 8H5l-2 2V10a8 8 0 018-8h2a8 8 0 018 8v2z"/></svg>,
  bookmark: ({ s = 22, c = 'currentColor', filled = false }: Pf) => <svg width={s} height={s} viewBox="0 0 24 24" fill={filled ? c : 'none'} stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h12v18l-6-4-6 4V4z"/></svg>,
  more: ({ s = 22, c = 'currentColor' }: P) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><circle cx="6" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="18" cy="12" r="1.6"/></svg>,
  play: ({ s = 22, c = 'currentColor', filled = true }: Pf) => <svg width={s} height={s} viewBox="0 0 24 24" fill={filled ? c : 'none'} stroke={c} strokeWidth="1.6" strokeLinejoin="round"><path d="M7 4l13 8-13 8V4z"/></svg>,
  pause: ({ s = 22, c = 'currentColor' }: P) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>,
  mic: ({ s = 22, c = 'currentColor' }: P) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0014 0"/><path d="M12 18v3"/></svg>,
  headphones: ({ s = 22, c = 'currentColor' }: P) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14v-2a8 8 0 0116 0v2"/><rect x="3" y="14" width="5" height="7" rx="1.5"/><rect x="16" y="14" width="5" height="7" rx="1.5"/></svg>,
  text: ({ s = 22, c = 'currentColor' }: P) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 5h14M5 12h14M5 19h8"/></svg>,
  chev: ({ s = 22, c = 'currentColor', dir = 'right' }: Pd) => {
    const r = ({ right: 0, left: 180, up: 270, down: 90 } as const)[dir];
    return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ transform: `rotate(${r}deg)` }}><path d="M9 6l6 6-6 6"/></svg>;
  },
  close: ({ s = 22, c = 'currentColor' }: P) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><path d="M6 6l12 12M18 6l-12 12"/></svg>,
  filter: ({ s = 22, c = 'currentColor' }: P) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round"><path d="M4 6h16M7 12h10M10 18h4"/></svg>,
  check: ({ s = 22, c = 'currentColor' }: P) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>,
  sun: ({ s = 22, c = 'currentColor' }: P) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.5 4.5l1.5 1.5M18 18l1.5 1.5M4.5 19.5L6 18M18 6l1.5-1.5"/></svg>,
  moon: ({ s = 22, c = 'currentColor' }: P) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 13A9 9 0 1111 3a7 7 0 0010 10z"/></svg>,
  settings: ({ s = 22, c = 'currentColor' }: P) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></svg>,
  back: ({ s = 22, c = 'currentColor' }: P) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6"/></svg>,
  share: ({ s = 22, c = 'currentColor' }: P) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v13M8 7l4-4 4 4M5 14v5a2 2 0 002 2h10a2 2 0 002-2v-5"/></svg>,
  skip: ({ s = 22, c = 'currentColor', dir = 'right' }: Pd) => {
    const f = dir === 'right';
    return <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d={f ? 'M4 5l9 7-9 7V5z M15 5h3v14h-3V5z' : 'M20 5l-9 7 9 7V5z M6 5h3v14H6V5z'}/></svg>;
  },
  trash: ({ s = 22, c = 'currentColor' }: P) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>,
  shield: ({ s = 22, c = 'currentColor' }: P) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z"/></svg>,
  trophy: ({ s = 22, c = 'currentColor' }: P) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M8 4h8v6a4 4 0 01-8 0V4z"/><path d="M8 4H5v3a3 3 0 003 3M16 4h3v3a3 3 0 01-3 3M9 20h6M12 14v6"/></svg>,
};
