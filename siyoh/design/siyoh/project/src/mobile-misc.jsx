// Profile, settings, onboarding

function MobileProfile({ dark, onOpenStory, onOpenSettings }) {
  const t = SIYOH_TOKENS;
  const ink = dark ? t.darkInk : t.ink;
  const mute = dark ? t.darkMute : t.mute;
  const [tab, setTab] = React.useState('published');

  return (
    <div style={{ minHeight: '100%', position: 'relative' }}>
      <BgBlobs dark={dark} />

      {/* Header */}
      <div style={{ padding: '54px 20px 0', display: 'flex', justifyContent: 'space-between' }}>
        <SiyohLogo size={24} dark={dark} withMark={false} />
        <div style={{ display: 'flex', gap: 8 }}>
          <GlassIconBtn dark={dark}>{Icon.share(18, ink)}</GlassIconBtn>
          <GlassIconBtn dark={dark} onClick={onOpenSettings}>{Icon.settings(18, ink)}</GlassIconBtn>
        </div>
      </div>

      <div style={{ padding: '22px 22px 12px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: 96, height: 96, borderRadius: '50%',
              background: 'linear-gradient(135deg,#FF6A3D,#FF8A4C)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: t.serif, fontSize: 40, color: '#fff', fontWeight: 500,
              boxShadow: '0 10px 30px rgba(255,87,34,0.35)',
            }}>E</div>
            <div style={{
              position: 'absolute', bottom: -2, right: -2,
              width: 28, height: 28, borderRadius: '50%', background: dark ? t.darkBg : t.paper,
              padding: 3, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: t.orange,
                           display: 'flex', alignItems: 'center', justifyContent: 'center',
                           color: '#fff', fontSize: 12 }}>{Icon.create(14, '#fff')}</div>
            </div>
          </div>
        </div>
        <div style={{ fontFamily: t.serif, fontSize: 26, color: ink, fontWeight: 500, letterSpacing: -0.5 }}>Elena Marquez</div>
        <div style={{ fontFamily: t.sans, fontSize: 13, color: mute, marginTop: 2 }}>@elena.writes</div>
        <div style={{ fontFamily: t.serif, fontSize: 15, color: ink, marginTop: 14, lineHeight: 1.45,
                     maxWidth: 280, margin: '14px auto 0', textWrap: 'pretty', fontStyle: 'italic' }}>
          Essays on quiet rooms, long walks, and the slow pleasure of craft.
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex', justifyContent: 'space-around', marginTop: 22,
          padding: '16px 0', borderRadius: 22,
          ...liquidSurface({ dark, intensity: 'med' }),
        }}>
          {[['24', 'Stories'], ['1.8k', 'Readers'], ['342', 'Listeners'], ['89', 'Saved']].map(([n, l]) => (
            <div key={l}>
              <div style={{ fontFamily: t.serif, fontSize: 20, color: ink, fontWeight: 500 }}>{n}</div>
              <div style={{ fontFamily: t.sans, fontSize: 11, color: mute, marginTop: 2,
                           textTransform: 'uppercase', letterSpacing: 0.6 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Action row */}
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button style={{
            flex: 1, height: 44, borderRadius: 14, border: 'none', cursor: 'pointer',
            background: dark ? t.darkInk : t.ink, color: dark ? t.darkBg : t.paper,
            fontFamily: t.sans, fontSize: 13.5, fontWeight: 500,
          }}>Edit profile</button>
          <button style={{
            flex: 1, height: 44, borderRadius: 14, border: 'none', cursor: 'pointer',
            background: t.orangeGrad, color: '#fff',
            fontFamily: t.sans, fontSize: 13.5, fontWeight: 500,
            boxShadow: '0 6px 16px rgba(255,87,34,0.35)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>{Icon.create(16, '#fff')} New story</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: '24px 22px 0', display: 'flex', gap: 18, borderBottom: `0.5px solid ${dark ? t.darkLine : t.line}`,
                   position: 'sticky', top: 0, background: dark ? t.darkBg : t.paper, zIndex: 2 }}>
        {['published', 'drafts', 'saved', 'listened'].map(tb => (
          <button key={tb} onClick={() => setTab(tb)} style={{
            border: 'none', background: 'transparent', cursor: 'pointer', padding: '12px 0',
            fontFamily: t.sans, fontSize: 13, fontWeight: 500,
            color: tab === tb ? ink : mute, textTransform: 'capitalize',
            borderBottom: tab === tb ? `2px solid ${t.orange}` : '2px solid transparent',
          }}>{tb}</button>
        ))}
      </div>

      {/* List */}
      <div style={{ padding: '0 22px 140px' }}>
        {SIYOH_DATA.stories.slice(0, 4).map((s, i) => (
          <StoryFeedRow key={s.id} story={s} dark={dark} onClick={() => onOpenStory(s)}
                        seed={i} showDivider={i < 3} />
        ))}
      </div>
    </div>
  );
}

// Settings
function MobileSettings({ dark, onBack, onToggleDark }) {
  const t = SIYOH_TOKENS;
  const ink = dark ? t.darkInk : t.ink;
  const mute = dark ? t.darkMute : t.mute;

  const section = (title, items) => (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontFamily: t.sans, fontSize: 11, color: mute, letterSpacing: 0.6,
                   textTransform: 'uppercase', fontWeight: 600, marginBottom: 8, padding: '0 6px' }}>{title}</div>
      <div style={{ borderRadius: 18, overflow: 'hidden',
                   ...liquidSurface({ dark, intensity: 'med' }) }}>
        {items.map((it, i) => (
          <div key={it.title} style={{
            padding: '14px 16px',
            borderBottom: i < items.length - 1 ? `0.5px solid ${dark ? t.darkLine : t.line}` : 'none',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9, flexShrink: 0,
              background: it.color || 'rgba(255,87,34,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{it.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: t.sans, fontSize: 14.5, color: ink, fontWeight: 500 }}>{it.title}</div>
              {it.sub && <div style={{ fontFamily: t.sans, fontSize: 12, color: mute, marginTop: 1 }}>{it.sub}</div>}
            </div>
            {it.right || Icon.chev(14, mute)}
          </div>
        ))}
      </div>
    </div>
  );

  const toggle = (on) => (
    <div style={{
      width: 42, height: 26, borderRadius: 13, padding: 3,
      background: on ? t.orange : (dark ? 'rgba(255,237,213,0.15)' : 'rgba(26,22,19,0.15)'),
      display: 'flex', alignItems: 'center',
      justifyContent: on ? 'flex-end' : 'flex-start', transition: 'all 0.2s',
    }}>
      <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff',
                   boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
    </div>
  );

  return (
    <div style={{ minHeight: '100%', background: dark ? t.darkBg : t.paperTint, paddingBottom: 140 }}>
      <div style={{ padding: '54px 20px 14px', display: 'flex', alignItems: 'center', gap: 12,
                   background: dark ? t.darkBg : t.paperTint, position: 'sticky', top: 0, zIndex: 2 }}>
        <GlassIconBtn dark={dark} onClick={onBack}>{Icon.back(20, ink)}</GlassIconBtn>
        <div style={{ fontFamily: t.serif, fontSize: 26, color: ink, fontWeight: 500, letterSpacing: -0.5 }}>Settings</div>
      </div>

      <div style={{ padding: '8px 18px 0' }}>
        {/* Profile card */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14, padding: 16, borderRadius: 20,
          ...liquidSurface({ dark, intensity: 'med' }), marginBottom: 24,
        }}>
          <Avatar name="E" size={50} seed={0} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: t.serif, fontSize: 17, color: ink, fontWeight: 500 }}>Elena Marquez</div>
            <div style={{ fontFamily: t.sans, fontSize: 12, color: mute }}>elena@siyoh.app</div>
          </div>
          {Icon.chev(14, mute)}
        </div>

        {section('Appearance', [
          { title: 'Dark mode', sub: dark ? 'On' : 'Off', icon: dark ? Icon.moon(16, t.orange) : Icon.sun(16, t.orange),
            right: <div onClick={onToggleDark}>{toggle(dark)}</div> },
          { title: 'Typography', sub: 'Newsreader · 17pt', icon: Icon.text(16, t.orange) },
          { title: 'Accent color', sub: 'Siyoh Orange', icon: <div style={{ width: 14, height: 14, borderRadius: '50%', background: t.orange }} /> },
        ])}

        {section('Audio', [
          { title: 'Default voice', sub: 'Author\'s voice', icon: Icon.mic(16, t.orange) },
          { title: 'Playback speed', sub: '1.0×', icon: Icon.play(14, t.orange) },
          { title: 'Auto-download', sub: 'On Wi-Fi only', icon: Icon.headphones(16, t.orange) },
        ])}

        {section('Reading', [
          { title: 'Sleep timer', icon: Icon.bell(16, t.orange), right: toggle(false) },
          { title: 'Show translations', icon: Icon.text(16, t.orange), right: toggle(true) },
          { title: 'Reading reminders', sub: '8:00 PM daily', icon: Icon.bell(16, t.orange) },
        ])}

        {section('Account', [
          { title: 'Subscription', sub: 'Siyoh Premium · renews May 12',
            icon: <div style={{ fontSize: 14 }}>✦</div>, color: 'rgba(255,87,34,0.18)' },
          { title: 'Privacy', icon: Icon.profile(16, t.orange) },
          { title: 'Notifications', icon: Icon.bell(16, t.orange) },
          { title: 'Help & support', icon: Icon.comment(16, t.orange) },
        ])}
      </div>
    </div>
  );
}

// Onboarding
function MobileOnboarding({ dark, onDone }) {
  const t = SIYOH_TOKENS;
  const ink = dark ? t.darkInk : t.ink;
  const mute = dark ? t.darkMute : t.mute;

  return (
    <div style={{ height: '100%', position: 'relative', overflow: 'hidden',
                 background: dark ? t.darkBg : t.paper }}>
      {/* Warm gradient top */}
      <div style={{
        position: 'absolute', top: -180, left: -60, right: -60, height: 520,
        borderRadius: '50%', background: t.orangeGrad, filter: 'blur(50px)', opacity: 0.9,
      }} />
      <div style={{
        position: 'absolute', top: 40, left: -100, width: 260, height: 260,
        borderRadius: '50%', background: 'rgba(255,200,150,0.8)', filter: 'blur(60px)',
      }} />

      <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column',
                   padding: '80px 28px 40px', zIndex: 2 }}>
        <div style={{ marginBottom: 'auto' }}>
          <SiyohLogo size={38} dark={false} color="#fff" />
        </div>

        {/* Floating card stack */}
        <div style={{ position: 'relative', height: 260, marginBottom: 28 }}>
          {[{ i: 0, x: -30, y: 10, r: -6, c: 2 },
            { i: 1, x: 24, y: -8, r: 5, c: 0 },
            { i: 2, x: -4, y: 30, r: 2, c: 5 }].map((cd) => (
            <div key={cd.i} style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: `translate(calc(-50% + ${cd.x}px), calc(-50% + ${cd.y}px)) rotate(${cd.r}deg)`,
              boxShadow: '0 18px 50px rgba(26,22,19,0.3)',
              borderRadius: 14,
            }}>
              <CoverPlaceholder w={150} h={200} seed={cd.c} label={['Quiet Mornings', 'Blue Hour', 'Letters'][cd.i]} />
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{
            fontFamily: t.serif, fontSize: 36, color: ink, fontWeight: 500,
            letterSpacing: -0.9, lineHeight: 1.05, marginBottom: 12, textWrap: 'balance',
          }}>Stories worth<br/>slowing down for.</h1>
          <p style={{
            fontFamily: t.serif, fontSize: 16, color: mute, lineHeight: 1.5,
            maxWidth: 300, margin: '0 auto', textWrap: 'pretty',
          }}>Read or listen to stories from writers around the world — and share your own, in words or in voice.</p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onDone} style={{
            flex: 1, height: 54, borderRadius: 16, border: 'none', cursor: 'pointer',
            background: t.orangeGrad, color: '#fff',
            fontFamily: t.sans, fontSize: 15, fontWeight: 600,
            boxShadow: '0 12px 28px rgba(255,87,34,0.4)',
          }}>Get started</button>
        </div>
        <button style={{
          marginTop: 14, height: 40, border: 'none', background: 'transparent', cursor: 'pointer',
          fontFamily: t.sans, fontSize: 13.5, color: mute, fontWeight: 500,
        }}>I already have an account</button>
      </div>
    </div>
  );
}

Object.assign(window, { MobileProfile, MobileSettings, MobileOnboarding });
