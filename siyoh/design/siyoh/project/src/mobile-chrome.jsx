// Shared mobile chrome: top bar + floating tab bar

function MobileTopBar({ dark, title, subtitle, logoOnly, right, onSearch }) {
  const t = SIYOH_TOKENS;
  const ink = dark ? t.darkInk : t.ink;
  const mute = dark ? t.darkMute : t.mute;
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 20,
      padding: '54px 20px 12px',
      ...liquidSurface({ dark, intensity: 'heavy',
        tint: dark ? 'rgba(20,17,16,0.7)' : 'rgba(253,251,247,0.75)' }),
      borderBottom: dark ? '0.5px solid rgba(255,237,213,0.06)' : '0.5px solid rgba(26,22,19,0.05)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    }}>
      {logoOnly ? (
        <SiyohLogo size={26} dark={dark} />
      ) : (
        <div>
          {subtitle && <div style={{
            fontFamily: t.sans, fontSize: 12, color: mute, letterSpacing: 0.4,
            textTransform: 'uppercase', fontWeight: 500, marginBottom: 2,
          }}>{subtitle}</div>}
          <div style={{
            fontFamily: t.serif, fontSize: 26, color: ink,
            fontWeight: 500, letterSpacing: -0.6, lineHeight: 1.1,
          }}>{title}</div>
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {right || (
          <>
            <GlassIconBtn dark={dark} onClick={onSearch}>{Icon.search(20, ink)}</GlassIconBtn>
            <GlassIconBtn dark={dark}>{Icon.bell(20, ink)}</GlassIconBtn>
          </>
        )}
      </div>
    </div>
  );
}

function GlassIconBtn({ children, dark, onClick, size = 40 }) {
  return (
    <button onClick={onClick} style={{
      width: size, height: size, borderRadius: '50%',
      border: 'none', cursor: 'pointer', padding: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
      ...liquidSurface({ dark, intensity: 'med' }),
    }}>
      {children}
    </button>
  );
}

// Floating liquid glass tab bar
function MobileTabBar({ dark, active, onChange }) {
  const t = SIYOH_TOKENS;
  const tabs = [
    { key: 'home', label: 'Home', icon: Icon.home },
    { key: 'explore', label: 'Explore', icon: Icon.explore },
    { key: 'create', label: 'Create', icon: Icon.create, special: true },
    { key: 'books', label: 'Books', icon: Icon.books },
    { key: 'profile', label: 'You', icon: Icon.profile },
  ];
  const ink = dark ? t.darkInk : t.ink;
  const mute = dark ? t.darkMute : t.mute;
  return (
    <div style={{
      position: 'absolute', left: 12, right: 12, bottom: 18, zIndex: 40,
      borderRadius: 28,
      padding: 6,
      ...liquidSurface({ dark, intensity: 'heavy',
        tint: dark ? 'rgba(30,26,23,0.72)' : 'rgba(255,255,255,0.7)' }),
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
    }}>
      {tabs.map(tab => {
        const isActive = active === tab.key;
        if (tab.special) {
          return (
            <button key={tab.key} onClick={() => onChange(tab.key)} style={{
              width: 52, height: 52, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: t.orangeGrad, padding: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 6px 18px rgba(255,87,34,0.45), inset 0 1px 0 rgba(255,255,255,0.3)',
            }}>
              {Icon.create(24, '#fff')}
            </button>
          );
        }
        return (
          <button key={tab.key} onClick={() => onChange(tab.key)} style={{
            flex: 1, height: 52, borderRadius: 22, border: 'none', cursor: 'pointer',
            background: isActive ? (dark ? 'rgba(255,237,213,0.08)' : 'rgba(26,22,19,0.05)') : 'transparent',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 2, padding: 0,
          }}>
            {tab.icon(22, isActive ? (dark ? t.darkInk : t.ink) : mute)}
            <span style={{
              fontFamily: t.sans, fontSize: 10, fontWeight: 500,
              color: isActive ? ink : mute, letterSpacing: 0.2,
            }}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

Object.assign(window, { MobileTopBar, GlassIconBtn, MobileTabBar });
