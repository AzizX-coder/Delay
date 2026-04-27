// Home feed

function MobileHome({ dark, onOpenStory, onOpenPlayer }) {
  const t = SIYOH_TOKENS;
  const ink = dark ? t.darkInk : t.ink;
  const mute = dark ? t.darkMute : t.mute;
  const line = dark ? t.darkLine : t.line;
  const [filter, setFilter] = React.useState('For you');

  const featured = SIYOH_DATA.stories[0];
  const rest = SIYOH_DATA.stories.slice(1);

  return (
    <div style={{ minHeight: '100%', position: 'relative' }}>
      <BgBlobs dark={dark} />
      <MobileTopBar dark={dark} logoOnly />

      {/* Filter pills */}
      <div style={{
        display: 'flex', gap: 8, padding: '16px 20px 4px',
        overflowX: 'auto', scrollbarWidth: 'none',
      }}>
        {['For you', 'Following', 'Audio', 'Text', 'Essay', 'Fiction', 'Memoir'].map(f => (
          <Chip key={f} active={filter === f} dark={dark} onClick={() => setFilter(f)}>{f}</Chip>
        ))}
      </div>

      {/* Featured hero */}
      <div style={{ padding: '16px 20px 8px', position: 'relative', zIndex: 1 }}
           onClick={() => onOpenStory(featured)}>
        <div style={{
          borderRadius: 24, overflow: 'hidden', position: 'relative',
          background: t.orangeGrad, height: 340,
          boxShadow: '0 20px 50px rgba(255,87,34,0.3)',
          cursor: 'pointer',
        }}>
          {/* decorative waveform for audio hero feel */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 80% 30%, rgba(255,255,255,0.2), transparent 50%)',
          }}/>
          <div style={{
            position: 'absolute', top: 20, left: 20, right: 20,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div style={{
              padding: '6px 12px', borderRadius: 999,
              background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(10px)',
              color: '#fff', fontFamily: t.sans, fontSize: 11, fontWeight: 600,
              letterSpacing: 0.6, textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />
              Story of the day
            </div>
            <button style={{
              width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{Icon.bookmark(18, '#fff')}</button>
          </div>
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, padding: 22,
            background: 'linear-gradient(transparent, rgba(26,22,19,0.5))',
            color: '#fff',
          }}>
            <div style={{
              fontFamily: t.serif, fontSize: 32, fontWeight: 500,
              letterSpacing: -0.8, lineHeight: 1.1, marginBottom: 10,
              textWrap: 'pretty',
            }}>{featured.title}</div>
            <div style={{
              fontFamily: t.sans, fontSize: 13, opacity: 0.9,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Avatar name={featured.author[0]} size={22} seed={0} />
              {featured.author} · {featured.mins} min read
            </div>
          </div>
        </div>
      </div>

      {/* Continue listening / reading */}
      <div style={{ padding: '14px 20px 8px' }}>
        <div style={{
          fontFamily: t.serif, fontSize: 18, color: ink,
          fontWeight: 500, letterSpacing: -0.3, marginBottom: 10,
        }}>Continue listening</div>
        <div onClick={() => onOpenPlayer(SIYOH_DATA.stories[1])} style={{
          borderRadius: 20, padding: 14, cursor: 'pointer',
          ...liquidSurface({ dark, intensity: 'med',
            tint: dark ? 'rgba(40,36,32,0.5)' : 'rgba(255,255,255,0.6)' }),
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <CoverPlaceholder w={56} h={56} seed={1} label="L" dark={dark} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: t.serif, fontSize: 15, color: ink, fontWeight: 500,
              marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{SIYOH_DATA.stories[1].title}</div>
            <div style={{ fontFamily: t.sans, fontSize: 12, color: mute }}>
              {SIYOH_DATA.stories[1].author} · 4:12 left
            </div>
            {/* progress */}
            <div style={{ marginTop: 8, height: 3, borderRadius: 3,
              background: dark ? 'rgba(255,237,213,0.1)' : 'rgba(26,22,19,0.08)' }}>
              <div style={{ width: '60%', height: '100%', borderRadius: 3, background: t.orange }} />
            </div>
          </div>
          <button style={{
            width: 44, height: 44, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: t.orangeGrad, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(255,87,34,0.4)',
          }}>{Icon.play(16, '#fff')}</button>
        </div>
      </div>

      {/* Feed */}
      <div style={{ padding: '14px 20px 120px' }}>
        <div style={{
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          marginBottom: 10,
        }}>
          <div style={{
            fontFamily: t.serif, fontSize: 18, color: ink,
            fontWeight: 500, letterSpacing: -0.3,
          }}>Latest from Siyoh</div>
          <div style={{ fontFamily: t.sans, fontSize: 12, color: t.orange, fontWeight: 500 }}>See all</div>
        </div>
        {rest.map((s, i) => (
          <StoryFeedRow key={s.id} story={s} dark={dark} onClick={() => onOpenStory(s)}
                        seed={i+1} showDivider={i < rest.length - 1} />
        ))}
      </div>
    </div>
  );
}

function StoryFeedRow({ story, dark, onClick, seed, showDivider }) {
  const t = SIYOH_TOKENS;
  const ink = dark ? t.darkInk : t.ink;
  const mute = dark ? t.darkMute : t.mute;
  const line = dark ? t.darkLine : t.line;
  return (
    <div onClick={onClick} style={{
      padding: '18px 0', cursor: 'pointer',
      borderBottom: showDivider ? `0.5px solid ${line}` : 'none',
      display: 'flex', gap: 14, alignItems: 'flex-start',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Avatar name={story.author[0]} size={22} seed={seed} />
          <span style={{ fontFamily: t.sans, fontSize: 12.5, color: ink, fontWeight: 500 }}>{story.author}</span>
          <span style={{ fontFamily: t.sans, fontSize: 12.5, color: mute }}>· {story.date}</span>
          {story.type === 'audio' && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '2px 8px', borderRadius: 999,
              background: 'rgba(255,87,34,0.12)', color: t.orange,
              fontFamily: t.sans, fontSize: 10.5, fontWeight: 600, letterSpacing: 0.3,
              textTransform: 'uppercase',
            }}>{Icon.headphones(10, t.orange)} Audio</span>
          )}
        </div>
        <div style={{
          fontFamily: t.serif, fontSize: 19, color: ink, fontWeight: 500,
          letterSpacing: -0.4, lineHeight: 1.2, marginBottom: 6, textWrap: 'pretty',
        }}>{story.title}</div>
        <div style={{
          fontFamily: t.serif, fontSize: 14, color: mute, lineHeight: 1.45,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          marginBottom: 10, textWrap: 'pretty',
        }}>{story.excerpt}</div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          fontFamily: t.sans, fontSize: 11.5, color: mute,
        }}>
          <span>{story.mins} min {story.type === 'audio' ? 'listen' : 'read'}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            {Icon.heart(13, mute)} {story.likes}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            {Icon.play(11, mute)} {story.plays}
          </span>
        </div>
      </div>
      <CoverPlaceholder w={86} h={114} seed={story.cover} label={story.title.split(' ')[0]} dark={dark} />
    </div>
  );
}

Object.assign(window, { MobileHome, StoryFeedRow });
