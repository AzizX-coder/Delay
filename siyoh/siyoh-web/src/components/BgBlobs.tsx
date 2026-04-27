'use client';
export function BgBlobs({ dark = false }: { dark?: boolean }) {
  return (
    <>
      <div style={{
        position: 'absolute', top: -200, right: -100, width: 500, height: 500,
        borderRadius: '50%',
        background: dark ? 'rgba(255,87,34,0.15)' : 'rgba(255,138,76,0.18)',
        filter: 'blur(100px)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -200, left: 200, width: 400, height: 400,
        borderRadius: '50%',
        background: dark ? 'rgba(255,200,150,0.06)' : 'rgba(255,200,150,0.2)',
        filter: 'blur(90px)', pointerEvents: 'none',
      }} />
    </>
  );
}
