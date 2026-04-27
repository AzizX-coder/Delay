// Books screen with filters

function MobileBooks({ dark, onOpenStory }) {
  const t = SIYOH_TOKENS;
  const ink = dark ? t.darkInk : t.ink;
  const mute = dark ? t.darkMute : t.mute;
  const [genre, setGenre] = React.useState('All');
  const [format, setFormat] = React.useState('All');
  const [sort, setSort] = React.useState('Newest');
  const [showFilter, setShowFilter] = React.useState(false);

  const filtered = SIYOH_DATA.stories.filter(s => {
    if (format === 'Text' && s.type !== 'text') return false;
    if (format === 'Audio' && s.type !== 'audio') return false;
    if (genre !== 'All' && !s.tags.includes(genre)) return false;
    return true;
  });

  return (
    <div style={{ minHeight: '100%', position: 'relative' }}>
      <BgBlobs dark={dark} />
      <MobileTopBar dark={dark} title="Books" subtitle="Library"
                    right={
                      <GlassIconBtn dark={dark} onClick={() => setShowFilter(!showFilter)}>
                        {Icon.filter(18, dark ? t.darkInk : t.ink)}
                      </GlassIconBtn>
                    } />

      {/* Format segmented control */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{
          display: 'flex', padding: 4, borderRadius: 14,
          ...liquidSurface({ dark, intensity: 'med' }),
        }}>
          {['All', 'Text', 'Audio'].map(f => (
            <button key={f} onClick={() => setFormat(f)} style={{
              flex: 1, height: 34, borderRadius: 11, border: 'none', cursor: 'pointer',
              background: format === f ? (dark ? t.darkInk : t.ink) : 'transparent',
              color: format === f ? (dark ? t.darkBg : t.paper) : (dark ? t.darkInk : t.ink),
              fontFamily: t.sans, fontSize: 13, fontWeight: 500,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'all 0.18s',
            }}>
              {f === 'Text' && Icon.text(14, format === f ? (dark ? t.darkBg : t.paper) : (dark ? t.darkInk : t.ink))}
              {f === 'Audio' && Icon.headphones(14, format === f ? (dark ? t.darkBg : t.paper) : (dark ? t.darkInk : t.ink))}
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Genre chips */}
      <div style={{ padding: '14px 20px 0', display: 'flex', gap: 8,
                   overflowX: 'auto', scrollbarWidth: 'none' }}>
        {SIYOH_DATA.genres.map(g => (
          <Chip key={g} active={genre === g} dark={dark} onClick={() => setGenre(g)}>{g}</Chip>
        ))}
      </div>

      {/* Sort & count */}
      <div style={{
        padding: '14px 20px 4px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ fontFamily: t.sans, fontSize: 12.5, color: mute }}>
          {filtered.length} books
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['Newest', 'Popular', 'Theme'].map(s => (
            <button key={s} onClick={() => setSort(s)} style={{
              height: 28, padding: '0 10px', borderRadius: 999, border: 'none', cursor: 'pointer',
              background: sort === s ? 'rgba(255,87,34,0.12)' : 'transparent',
              color: sort === s ? t.orange : mute,
              fontFamily: t.sans, fontSize: 12, fontWeight: 500,
            }}>{s}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{
        padding: '8px 20px 140px',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, rowGap: 22,
      }}>
        {filtered.map((s, i) => (
          <div key={s.id} onClick={() => onOpenStory(s)} style={{ cursor: 'pointer' }}>
            <div style={{ position: 'relative' }}>
              <CoverPlaceholder w="100%" h={230} seed={s.cover} label={s.title.split(' ').slice(0,3).join(' ')} dark={dark} />
              {s.type === 'audio' && (
                <div style={{
                  position: 'absolute', top: 10, right: 10,
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{Icon.headphones(14, t.orangeDeep)}</div>
              )}
            </div>
            <div style={{
              fontFamily: t.serif, fontSize: 14.5, color: ink,
              fontWeight: 500, letterSpacing: -0.2, lineHeight: 1.2,
              marginTop: 10, textWrap: 'pretty',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>{s.title}</div>
            <div style={{
              fontFamily: t.sans, fontSize: 11.5, color: mute, marginTop: 3,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{s.author}</div>
            <div style={{
              fontFamily: t.sans, fontSize: 10.5, color: mute, marginTop: 2, letterSpacing: 0.2,
            }}>{s.mins} min · {s.tags[0]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { MobileBooks });
