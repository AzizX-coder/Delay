'use client';
import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { tokens, liquidSurface } from '@/lib/tokens';
import { useTheme } from './ThemeProvider';
import { Icon } from './Icon';

type Toast = { id: string; kind: 'info' | 'success' | 'error'; title: string; body?: string };
const Ctx = createContext<{ push: (t: Omit<Toast, 'id'>) => void }>({ push: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { dark } = useTheme();

  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { ...t, id }]);
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;
    const t = setTimeout(() => setToasts(prev => prev.slice(1)), 3500);
    return () => clearTimeout(t);
  }, [toasts]);

  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div style={{ position: 'fixed', bottom: 110, right: 22, zIndex: 200,
        display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none' }}>
        {toasts.map(t => (
          <div key={t.id} className="anim-toast-in" style={{
            ...liquidSurface({ dark, intensity: 'heavy' }),
            borderRadius: 14, padding: '12px 16px', minWidth: 260, maxWidth: 360,
            display: 'flex', gap: 10, alignItems: 'flex-start', pointerEvents: 'auto',
            borderLeft: `3px solid ${
              t.kind === 'error' ? tokens.orangeDeep
              : t.kind === 'success' ? tokens.orange
              : (dark ? tokens.darkInk : tokens.ink)
            }`,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-newsreader)', fontSize: 14, fontWeight: 500,
                color: dark ? tokens.darkInk : tokens.ink }}>{t.title}</div>
              {t.body && (
                <div style={{ fontFamily: 'var(--font-geist)', fontSize: 12.5,
                  color: dark ? tokens.darkMute : tokens.mute, marginTop: 2 }}>{t.body}</div>
              )}
            </div>
            <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
              aria-label="Dismiss"
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}>
              <Icon.close s={14} c={dark ? tokens.darkMute : tokens.mute} />
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
