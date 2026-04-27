// Web (desktop) version — single-file layout with sidebar + main + right rail

function WebApp({ dark, onToggleDark }) {
  const t = SIYOH_TOKENS;
  const ink = dark ? t.darkInk : t.ink;
  const mute = dark ? t.darkMute : t.mute;
  const bg = dark ? t.darkBg : t.paper;
  const [section, setSection] = React.useState('home');
  const [story, setStory] = React.useState(null);

  return (
    <div style={{
      minHeight: '100vh', background: bg, position: 'relative', overflow: 'hidden',
      fontFamily: t.sans,
    }}>
      {/* Ambient blobs */}
      <div style={{ position: 'absolute', top: -200, right: -100, width: 500, height: 500,
                   borderRadius: '50%', background: dark ? 'rgba(255,87,34,0.15)' : 'rgba(255,138,76,0.18)',
                   filter: 'blur(100px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -200, left: 200, width: 400, height: 400,
                   borderRadius: '50%', background: dark ? 'rgba(255,200,150,0.06)' : 'rgba(255,200,150,0.2)',
                   filter: 'blur(90px)', pointerEvents: 'none' }} />

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 340px', minHeight: '100vh',
                   maxWidth: 1440, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Sidebar */}
        <WebSidebar dark={dark} section={section} onChange={(s) => { setSection(s); setStory(null); }} onToggleDark={onToggleDark} />

        {/* Main column */}
        <div style={{ borderLeft: `0.5px solid ${dark ? t.darkLine : t.line}`,
                     borderRight: `0.5px solid ${dark ? t.darkLine : t.line}`, minHeight: '100vh' }}>
          {story ? (
            <WebStoryDetail dark={dark} story={story} onBack={() => setStory(null)} />
          ) : section === 'home' ? (
            <WebHome dark={dark} onOpenStory={setStory} />
          ) : section === 'explore' ? (
            <WebExplore dark={dark} onOpenStory={setStory} />
          ) : section === 'books' ? (
            <WebBooks dark={dark} onOpenStory={setStory} />
          ) : section === 'create' ? (
            <WebCreate dark={dark} />
          ) : section === 'profile' ? (
            <WebProfile dark={dark} onOpenStory={setStory} />
          ) : <WebHome dark={dark} onOpenStory={setStory} />}
        </div>

        {/* Right rail */}
        <WebRightRail dark={dark} onOpenStory={setStory} />
      </div>

      {/* Floating persistent audio player */}
      <WebMiniPlayer dark={dark} />
    </div>
  );
}

function WebSidebar({ dark, section, onChange, onToggleDark }) {
  const t = SIYOH_TOKENS;
  const ink = dark ? t.darkInk : t.ink;
  const mute = dark ? t.darkMute : t.mute;
  const nav = [
    { k: 'home', label: 'Home', icon: Icon.home },
    { k: 'explore', label: 'Explore', icon: Icon.explore },
    { k: 'books', label: 'Books', icon: Icon.books },
    { k: 'profile', label: 'Your pages', icon: Icon.profile },
  ];
  return (
    <div style={{ padding: '28px 18px', position: 'sticky', top: 0, height: '100vh',
                 display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '0 8px 28px' }}>
        <SiyohLogo size={28} dark={dark} />
      </div>

      <button onClick={() => onChange('create')} style={{
        margin: '0 0 24px', height: 46, borderRadius: 14, border: 'none', cursor: 'pointer',
        background: t.orangeGrad, color: '#fff',
        fontFamily: t.sans, fontSize: 14, fontWeight: 600, letterSpacing: 0.1,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        boxShadow: '0 8px 20px rgba(255,87,34,0.3)',
      }}>{Icon.create(18, '#fff')} Create</button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {nav.map(n => (
          <button key={n.k} onClick={() => onChange(n.k)} style={{
            height: 42, padding: '0 12px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: section === n.k ? (dark ? 'rgba(255,237,213,0.06)' : 'rgba(26,22,19,0.04)') : 'transparent',
            color: section === n.k ? ink : mute,
            fontFamily: t.sans, fontSize: 14, fontWeight: section === n.k ? 600 : 500,
            display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
            letterSpacing: -0.1,
          }}>
            {n.icon(18, section === n.k ? ink : mute)} {n.label}
          </button>
        ))}
      </div>

      {/* Following section */}
      <div style={{ marginTop: 26 }}>
        <div style={{ fontFamily: t.sans, fontSize: 11, color: mute, letterSpacing: 0.6,
                     textTransform: 'uppercase', fontWeight: 600, padding: '6px 12px 10px' }}>Following</div>
        {SIYOH_DATA.writers.slice(0, 4).map((w, i) => (
          <button key={w.handle} style={{
            width: '100%', height: 40, padding: '0 10px', borderRadius: 12, border: 'none',
            background: 'transparent', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <Avatar name={w.name[0]} size={26} seed={w.seed} />
            <span style={{ fontFamily: t.sans, fontSize: 13, color: ink, fontWeight: 500, letterSpacing: -0.1 }}>{w.name}</span>
            {i === 1 && <div style={{ width: 6, height: 6, borderRadius: '50%', background: t.orange, marginLeft: 'auto' }} />}
          </button>
        ))}
      </div>

      {/* Bottom chrome */}
      <div style={{ marginTop: 'auto', padding: '14px 10px 0',
                   borderTop: `0.5px solid ${dark ? t.darkLine : t.line}`,
                   display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar name="E" size={34} seed={0} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: t.sans, fontSize: 13, color: ink, fontWeight: 500 }}>Elena</div>
          <div style={{ fontFamily: t.sans, fontSize: 11, color: mute }}>@elena.writes</div>
        </div>
        <button onClick={onToggleDark} style={{
          width: 32, height: 32, borderRadius: 10, border: 'none', cursor: 'pointer',
          background: dark ? 'rgba(255,237,213,0.06)' : 'rgba(26,22,19,0.04)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{dark ? Icon.sun(16, ink) : Icon.moon(16, ink)}</button>
      </div>
    </div>
  );
}

function WebHome({ dark, onOpenStory }) {
  const t = SIYOH_TOKENS;
  const ink = dark ? t.darkInk : t.ink;
  const mute = dark ? t.darkMute : t.mute;
  const [filter, setFilter] = React.useState('For you');
  const featured = SIYOH_DATA.stories[0];
  const rest = SIYOH_DATA.stories.slice(1);
  return (
    <div>
      {/* Sticky header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, padding: '18px 36px 14px',
                   ...liquidSurface({ dark, intensity: 'heavy',
                     tint: dark ? 'rgba(20,17,16,0.7)' : 'rgba(253,251,247,0.75)' }),
                   borderBottom: `0.5px solid ${dark ? t.darkLine : t.line}`,
                   display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontFamily: t.serif, fontSize: 22, fontWeight: 500, color: ink, letterSpacing: -0.4, margin: 0 }}>Home</h1>
        <div style={{ display: 'flex', gap: 6 }}>
          {['For you', 'Following', 'Audio'].map(f => (
            <Chip key={f} active={filter === f} dark={dark} onClick={() => setFilter(f)}>{f}</Chip>
          ))}
        </div>
      </div>

      {/* Featured hero */}
      <div style={{ padding: '28px 36px 0' }} onClick={() => onOpenStory(featured)}>
        <div style={{
          borderRadius: 26, padding: 38, minHeight: 340, cursor: 'pointer',
          background: t.orangeGrad, color: '#fff', position: 'relative', overflow: 'hidden',
          boxShadow: '0 30px 60px rgba(255,87,34,0.25)',
          display: 'grid', gridTemplateColumns: '1fr 200px', gap: 28, alignItems: 'center',
        }}>
          <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300,
                       borderRadius: '50%', background: 'rgba(255,255,255,0.18)', filter: 'blur(30px)' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ padding: '6px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.22)',
                         backdropFilter: 'blur(10px)', color: '#fff',
                         fontFamily: t.sans, fontSize: 11, fontWeight: 600, letterSpacing: 0.6,
                         textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} /> Story of the day
            </div>
            <h2 style={{
              fontFamily: t.serif, fontSize: 44, fontWeight: 500,
              letterSpacing: -1, lineHeight: 1.05, margin: '18px 0 14px', textWrap: 'balance', maxWidth: 520,
            }}>{featured.title}</h2>
            <p style={{ fontFamily: t.serif, fontSize: 16, opacity: 0.9, lineHeight: 1.5,
                       maxWidth: 520, marginBottom: 22, textWrap: 'pretty' }}>
              {featured.excerpt.slice(0, 160)}…
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar name={featured.author[0]} size={30} seed={0} />
              <div style={{ fontFamily: t.sans, fontSize: 13 }}>
                <div style={{ fontWeight: 500 }}>{featured.author}</div>
                <div style={{ opacity: 0.8 }}>{featured.mins} min read · {featured.date}</div>
              </div>
              <button style={{
                marginLeft: 20, height: 40, padding: '0 18px', borderRadius: 999, border: 'none', cursor: 'pointer',
                background: '#fff', color: t.orangeDeep,
                fontFamily: t.sans, fontSize: 13, fontWeight: 600,
              }}>Read story →</button>
            </div>
          </div>
          <div style={{ position: 'relative', zIndex: 1, transform: 'rotate(3deg)' }}>
            <CoverPlaceholder w={200} h={270} seed={featured.cover} label="Quiet Mornings" />
          </div>
        </div>
      </div>

      {/* Two col: feed + nothing else */}
      <div style={{ padding: '32px 36px 120px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
          <h3 style={{ fontFamily: t.serif, fontSize: 22, fontWeight: 500, color: ink,
                      letterSpacing: -0.4, margin: 0 }}>Latest from Siyoh</h3>
          <span style={{ fontFamily: t.sans, fontSize: 13, color: t.orange, fontWeight: 500 }}>See all →</span>
        </div>
        {rest.map((s, i) => (
          <WebStoryRow key={s.id} story={s} dark={dark} onClick={() => onOpenStory(s)} seed={i+1} />
        ))}
      </div>
    </div>
  );
}

function WebStoryRow({ story, dark, onClick, seed }) {
  const t = SIYOH_TOKENS;
  const ink = dark ? t.darkInk : t.ink;
  const mute = dark ? t.darkMute : t.mute;
  const line = dark ? t.darkLine : t.line;
  return (
    <div onClick={onClick} style={{
      padding: '22px 0', cursor: 'pointer',
      borderBottom: `0.5px solid ${line}`,
      display: 'grid', gridTemplateColumns: '1fr 180px', gap: 28, alignItems: 'start',
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Avatar name={story.author[0]} size={22} seed={seed} />
          <span style={{ fontFamily: t.sans, fontSize: 13, color: ink, fontWeight: 500 }}>{story.author}</span>
          <span style={{ fontFamily: t.sans, fontSize: 13, color: mute }}>· {story.date}</span>
          {story.type === 'audio' && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '2px 8px', borderRadius: 999,
              background: 'rgba(255,87,34,0.12)', color: t.orange,
              fontFamily: t.sans, fontSize: 10.5, fontWeight: 600, letterSpacing: 0.3,
              textTransform: 'uppercase',
            }}>{Icon.headphones(10, t.orange)} Audio · {story.mins}m</span>
          )}
        </div>
        <h3 style={{
          fontFamily: t.serif, fontSize: 24, color: ink, fontWeight: 500,
          letterSpacing: -0.4, lineHeight: 1.15, margin: '0 0 8px', textWrap: 'balance',
        }}>{story.title}</h3>
        <p style={{
          fontFamily: t.serif, fontSize: 15.5, color: mute, lineHeight: 1.5,
          margin: '0 0 14px',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          textWrap: 'pretty',
        }}>{story.excerpt}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontFamily: t.sans, fontSize: 12, color: mute }}>
          <span>{story.mins} min {story.type === 'audio' ? 'listen' : 'read'}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>{Icon.heart(14, mute)} {story.likes}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>{Icon.comment(14, mute)} 47</span>
          <span style={{ marginLeft: 'auto', display: 'inline-flex', gap: 6 }}>
            {story.tags.map(tg => <span key={tg} style={{ padding: '3px 9px', borderRadius: 999,
                                                          background: dark ? 'rgba(255,237,213,0.06)' : 'rgba(26,22,19,0.04)' }}>{tg}</span>)}
          </span>
          {Icon.bookmark(14, mute)}
        </div>
      </div>
      <CoverPlaceholder w={180} h={200} seed={story.cover} label={story.title.split(' ').slice(0,3).join(' ')} dark={dark} />
    </div>
  );
}

function WebRightRail({ dark, onOpenStory }) {
  const t = SIYOH_TOKENS;
  const ink = dark ? t.darkInk : t.ink;
  const mute = dark ? t.darkMute : t.mute;
  return (
    <div style={{ padding: '22px 26px', position: 'sticky', top: 0, height: '100vh', overflow: 'auto' }}>
      {/* Search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        height: 42, borderRadius: 14, padding: '0 14px', marginBottom: 22,
        ...liquidSurface({ dark, intensity: 'med' }),
      }}>
        {Icon.search(16, mute)}
        <span style={{ fontFamily: t.sans, fontSize: 13, color: mute, flex: 1 }}>Search Siyoh</span>
        <kbd style={{ fontFamily: t.mono, fontSize: 11, color: mute,
                     padding: '2px 6px', borderRadius: 4,
                     background: dark ? 'rgba(255,237,213,0.06)' : 'rgba(26,22,19,0.04)' }}>⌘K</kbd>
      </div>

      {/* Audio of the hour */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: t.sans, fontSize: 11, color: mute, letterSpacing: 0.6,
                     textTransform: 'uppercase', fontWeight: 600, marginBottom: 10 }}>Audio of the hour</div>
        <div style={{ borderRadius: 20, padding: 18, background: 'linear-gradient(135deg,#2A241F,#4A3C30)', color: '#F5EDE0',
                     boxShadow: '0 14px 30px rgba(26,22,19,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: t.orangeGrad,
                         display: 'flex', alignItems: 'center', justifyContent: 'center',
                         boxShadow: '0 6px 14px rgba(255,87,34,0.4)' }}>{Icon.play(18, '#fff')}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: t.serif, fontSize: 15, fontWeight: 500, letterSpacing: -0.2,
                           whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Letters I Never Sent</div>
              <div style={{ fontFamily: t.sans, fontSize: 11.5, opacity: 0.7 }}>Ravi Shankar · 14 min</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 1.5, height: 18, alignItems: 'center' }}>
            {Array.from({ length: 34 }).map((_, i) => {
              const h = 2 + Math.sin(i * 0.5) * 5 + Math.random() * 8;
              return <div key={i} style={{ flex: 1, height: h, borderRadius: 1.5,
                                           background: i < 12 ? t.orange : 'rgba(245,237,224,0.25)' }} />;
            })}
          </div>
        </div>
      </div>

      {/* Writers to follow */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: t.sans, fontSize: 11, color: mute, letterSpacing: 0.6,
                     textTransform: 'uppercase', fontWeight: 600, marginBottom: 10 }}>Writers to follow</div>
        {SIYOH_DATA.writers.slice(0, 3).map((w, i) => (
          <div key={w.handle} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
          }}>
            <Avatar name={w.name[0]} size={38} seed={w.seed} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: t.sans, fontSize: 13, color: ink, fontWeight: 500 }}>{w.name}</div>
              <div style={{ fontFamily: t.sans, fontSize: 11, color: mute, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.bio}</div>
            </div>
            <button style={{
              height: 28, padding: '0 12px', borderRadius: 999, border: `1px solid ${dark ? 'rgba(255,237,213,0.2)' : 'rgba(26,22,19,0.15)'}`,
              background: 'transparent', color: ink, cursor: 'pointer',
              fontFamily: t.sans, fontSize: 11.5, fontWeight: 500,
            }}>Follow</button>
          </div>
        ))}
      </div>

      {/* Topics */}
      <div>
        <div style={{ fontFamily: t.sans, fontSize: 11, color: mute, letterSpacing: 0.6,
                     textTransform: 'uppercase', fontWeight: 600, marginBottom: 10 }}>Wander by theme</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {SIYOH_DATA.themes.slice(0, 6).map(th => <Chip key={th} dark={dark}>{th}</Chip>)}
        </div>
      </div>
    </div>
  );
}

function WebMiniPlayer({ dark }) {
  const t = SIYOH_TOKENS;
  const ink = dark ? t.darkInk : t.ink;
  const mute = dark ? t.darkMute : t.mute;
  return (
    <div style={{
      position: 'fixed', bottom: 22, left: '50%', transform: 'translateX(-50%)', zIndex: 50,
      width: 560, borderRadius: 20, padding: '10px 14px',
      ...liquidSurface({ dark, intensity: 'heavy',
        tint: dark ? 'rgba(30,26,23,0.82)' : 'rgba(255,255,255,0.82)' }),
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <CoverPlaceholder w={42} h={42} seed={1} label="L" dark={dark} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: t.serif, fontSize: 14, color: ink, fontWeight: 500,
                     whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Letters I Never Sent</div>
        <div style={{ height: 3, borderRadius: 3, marginTop: 6,
                     background: dark ? 'rgba(255,237,213,0.12)' : 'rgba(26,22,19,0.08)' }}>
          <div style={{ width: '60%', height: '100%', borderRadius: 3, background: t.orange }} />
        </div>
      </div>
      <button style={{ width: 32, height: 32, border: 'none', background: 'transparent', cursor: 'pointer',
                     display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Icon.skip(18, ink, 'back')}</button>
      <button style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', cursor: 'pointer',
                     background: t.orangeGrad, color: '#fff',
                     display: 'flex', alignItems: 'center', justifyContent: 'center',
                     boxShadow: '0 4px 12px rgba(255,87,34,0.4)' }}>{Icon.pause(16, '#fff')}</button>
      <button style={{ width: 32, height: 32, border: 'none', background: 'transparent', cursor: 'pointer',
                     display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Icon.skip(18, ink, 'fwd')}</button>
      <div style={{ fontFamily: t.mono, fontSize: 11, color: mute, minWidth: 62, textAlign: 'right' }}>8:24 / 14:00</div>
    </div>
  );
}

Object.assign(window, { WebApp, WebSidebar, WebHome, WebStoryRow, WebRightRail, WebMiniPlayer });
