'use client';
import { Icon } from '@/components/Icon';
import { tokens } from '@/lib/tokens';
import { useTheme } from '@/components/ThemeProvider';
import { useToast } from '@/components/Toast';

export function ShareButton({ title, url, size = 18 }: { title: string; url: string; size?: number }) {
  const { dark } = useTheme();
  const { push } = useToast();
  const ink = dark ? tokens.darkInk : tokens.ink;

  async function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      try {
        await (navigator as any).share({ title, url: fullUrl });
        return;
      } catch { /* user cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(fullUrl);
      push({ kind: 'success', title: 'Havola nusxalandi' });
    } catch {
      push({ kind: 'error', title: 'Nusxalab bo\'lmadi' });
    }
  }

  return (
    <button onClick={onClick} aria-label="Share" className="press" style={{
      border: 'none', background: 'transparent', cursor: 'pointer', padding: 0,
      display: 'inline-flex', alignItems: 'center',
    }}><Icon.share s={size} c={ink} /></button>
  );
}
