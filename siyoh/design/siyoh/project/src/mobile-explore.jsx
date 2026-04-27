// Explore screen

function MobileExplore({ dark, onOpenStory }) {
  const t = SIYOH_TOKENS;
  const ink = dark ? t.darkInk : t.ink;
  const mute = dark ? t.darkMute : t.mute;

  return (
    <div style={{ minHeight: '100%', position: 'relative' }}>
      <BgBlobs dark={dark} />
      <MobileTopBar dark={dark} title="Explore" subtitle="Today" />

      {/* Search bar */}
      <div style={{ padding: '14px 20px 4px', position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          height: 48, borderRadius: 16, padding: '0 14px',
          ...liquidSurface({ dark, intensity: 'med' }),
        }}>
          {Icon.search(18, mute)}
          <span style={{ fontFamily: t.sans, fontSize: 14.5, color: mute, flex: 1 }}>
            Search stories, writers, themes…
          </span>
          {Icon.mic(18, t.orange)}
        </div>
      </div>

      {/* Mood rail */}
      <div style={{ padding: '18px 20px 4px' }}>
        <div style={{
          fontFamily: t.serif, fontSize: 18, color: ink,
          fontWeight: 500, letterSpacing: -0.3, marginBottom: 10,
        }}>What do you feel like?</div>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto',
                     scrollbarWidth: 'none', margin: '0 -20px', padding: '0 20px' }}>
          {[
            { t: 'Slow\nmornings', c: 'linear-gradient(135deg,#FF6A3D,#FF8A4C)', ic: '☀' },
            { t: 'A long\nessay', c: 'linear-gradient(135deg,#2A241F,#4A3C30)', ic: '✎' },
            { t: 'Something\nfunny', c: 'linear-gradient(135deg,#FFC08A,#FFA560)', ic: '◡' },
            { t: 'Fall\nasleep', c: 'linear-gradient(135deg,#1A1613,#3A2820)', ic: '☾' },
            { t: 'Feel\nsomething', c: 'linear-gradient(135deg,#FF5722,#D73900)', ic: '♡' },
          ].map((m, i) => (
            <div key={i} style={{
              width: 130, height: 160, borderRadius: 20, flexShrink: 0,
              background: m.c, padding: 14, position: 'relative',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              boxShadow: '0 8px 24px rgba(26,22,19,0.18)', cursor: 'pointer',
            }}>
              <div style={{
                fontFamily: t.serif, fontSize: 28,
                color: i === 2 || i === 3 ? '#F5EDE0' : '#fff',
                opacity: 0.9,
              }}>{m.ic}</div>
              <div style={{
                fontFamily: t.serif, fontSize: 17, fontWeight: 500,
                color: i === 2 || i === 3 ? '#F5EDE0' : '#fff',
                lineHeight: 1.1, whiteSpace: 'pre-line', letterSpacing: -0.3,
              }}>{m.t}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending writers */}
      <div style={{ padding: '22px 20px 4px' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          marginBottom: 10,
        }}>
          <div style={{ fontFamily: t.serif, fontSize: 18, color: ink,
                       fontWeight: 500, letterSpacing: -0.3 }}>Writers to follow</div>
          <span style={{ fontFamily: t.sans, fontSize: 12, color: t.orange, fontWeight: 500 }}>See all</span>
        </div>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto',
                     scrollbarWidth: 'none', margin: '0 -20px', padding: '0 20px' }}>
          {SIYOH_DATA.writers.map((w, i) => (
            <div key={w.handle} style={{
              width: 150, flexShrink: 0, borderRadius: 18, padding: 14,
              ...liquidSurface({ dark, intensity: 'med' }),
            }}>
              <Avatar name={w.name[0]} size={44} seed={w.seed} />
              <div style={{
                fontFamily: t.serif, fontSize: 14, color: ink,
                fontWeight: 500, marginTop: 10, letterSpacing: -0.2,
              }}>{w.name}</div>
              <div style={{ fontFamily: t.sans, fontSize: 11, color: mute, marginTop: 2 }}>
                {w.readers} readers
              </div>
              <button style={{
                marginTop: 10, width: '100%', height: 30, borderRadius: 10, border: 'none', cursor: 'pointer',
                background: dark ? t.darkInk : t.ink, color: dark ? t.darkBg : t.paper,
                fontFamily: t.sans, fontSize: 12, fontWeight: 500, letterSpacing: 0.1,
              }}>Follow</button>
            </div>
          ))}
        </div>
      </div>

      {/* Curated collections */}
      <div style={{ padding: '22px 20px 4px' }}>
        <div style={{
          fontFamily: t.serif, fontSize: 18, color: ink,
          fontWeight: 500, letterSpacing: -0.3, marginBottom: 12,
        }}>Curated for you</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {SIYOH_DATA.collections.map((c, i) => (
            <div key={c.name} style={{
              borderRadius: 18, padding: 14, cursor: 'pointer', position: 'relative',
              ...liquidSurface({ dark, intensity: 'med' }),
              minHeight: 150,
            }}>
              <div style={{ display: 'flex', gap: -6, marginBottom: 14 }}>
                {[c.seed, c.seed + 1, c.seed + 2].map((cov, j) => (
                  <div key={j} style={{ marginLeft: j > 0 ? -18 : 0, zIndex: 3 - j,
                                        transform: `rotate(${(j-1)*4}deg)` }}>
                    <CoverPlaceholder w={48} h={60} seed={cov} label="•" dark={dark} />
                  </div>
                ))}
              </div>
              <div style={{
                fontFamily: t.serif, fontSize: 15, color: ink,
                fontWeight: 500, letterSpacing: -0.2, lineHeight: 1.2,
              }}>{c.name}</div>
              <div style={{ fontFamily: t.sans, fontSize: 11, color: mute, marginTop: 4 }}>
                {c.count} stories
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Topics */}
      <div style={{ padding: '22px 20px 120px' }}>
        <div style={{
          fontFamily: t.serif, fontSize: 18, color: ink,
          fontWeight: 500, letterSpacing: -0.3, marginBottom: 12,
        }}>Wander by theme</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {SIYOH_DATA.themes.map(th => (
            <Chip key={th} dark={dark}>{th}</Chip>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { MobileExplore });
