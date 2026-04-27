// Remaining web screens: explore, books, detail, create, profile

function WebExplore({ dark, onOpenStory }) {
  const t = SIYOH_TOKENS;
  const ink = dark ? t.darkInk : t.ink;
  const mute = dark ? t.darkMute : t.mute;
  return (
    <div>
      <div style={{ padding: '28px 36px 20px', borderBottom: `0.5px solid ${dark ? t.darkLine : t.line}` }}>
        <h1 style={{ fontFamily: t.serif, fontSize: 38, fontWeight: 500, color: ink,
                    letterSpacing: -0.9, margin: '0 0 8px', textWrap: 'balance' }}>Wander in.</h1>
        <p style={{ fontFamily: t.serif, fontSize: 16, color: mute, margin: 0, textWrap: 'pretty' }}>
          New writers, moods, and long reads curated each morning.
        </p>
      </div>

      {/* Mood tiles */}
      <div style={{ padding: '28px 36px 0' }}>
        <h3 style={{ fontFamily: t.serif, fontSize: 18, fontWeight: 500, color: ink, letterSpacing: -0.3, marginBottom: 14 }}>What do you feel like?</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {[
            { t: 'Slow\nmornings', c: 'linear-gradient(135deg,#FF6A3D,#FF8A4C)', ic: '☀' },
            { t: 'A long\nessay', c: 'linear-gradient(135deg,#2A241F,#4A3C30)', ic: '✎' },
            { t: 'Something\nfunny', c: 'linear-gradient(135deg,#FFC08A,#FFA560)', ic: '◡' },
            { t: 'Fall\nasleep', c: 'linear-gradient(135deg,#1A1613,#3A2820)', ic: '☾' },
            { t: 'Feel\nsomething', c: 'linear-gradient(135deg,#FF5722,#D73900)', ic: '♡' },
          ].map((m, i) => (
            <div key={i} style={{
              aspectRatio: '1 / 1.2', borderRadius: 20, padding: 16,
              background: m.c, color: i === 2 ? '#F5EDE0' : '#fff',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              cursor: 'pointer', boxShadow: '0 10px 24px rgba(26,22,19,0.15)',
            }}>
              <div style={{ fontSize: 26, opacity: 0.9 }}>{m.ic}</div>
              <div style={{ fontFamily: t.serif, fontSize: 18, fontWeight: 500,
                           whiteSpace: 'pre-line', letterSpacing: -0.3, lineHeight: 1.1 }}>{m.t}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Curated collections */}
      <div style={{ padding: '32px 36px 0' }}>
        <h3 style={{ fontFamily: t.serif, fontSize: 18, fontWeight: 500, color: ink, letterSpacing: -0.3, marginBottom: 14 }}>Curated collections</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {SIYOH_DATA.collections.map((c, i) => (
            <div key={c.name} style={{
              borderRadius: 20, padding: 18, cursor: 'pointer',
              ...liquidSurface({ dark, intensity: 'med' }),
              display: 'flex', gap: 14, alignItems: 'center',
            }}>
              <div style={{ display: 'flex' }}>
                {[c.seed, c.seed + 1, c.seed + 2].map((cov, j) => (
                  <div key={j} style={{ marginLeft: j > 0 ? -18 : 0, zIndex: 3 - j,
                                        transform: `rotate(${(j-1)*4}deg)` }}>
                    <CoverPlaceholder w={54} h={72} seed={cov} label="•" dark={dark} />
                  </div>
                ))}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: t.serif, fontSize: 17, color: ink, fontWeight: 500, letterSpacing: -0.3 }}>{c.name}</div>
                <div style={{ fontFamily: t.sans, fontSize: 12, color: mute, marginTop: 2 }}>{c.count} stories · updated weekly</div>
              </div>
              {Icon.chev(18, mute)}
            </div>
          ))}
        </div>
      </div>

      {/* Writers */}
      <div style={{ padding: '32px 36px 120px' }}>
        <h3 style={{ fontFamily: t.serif, fontSize: 18, fontWeight: 500, color: ink, letterSpacing: -0.3, marginBottom: 14 }}>Writers to follow</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {SIYOH_DATA.writers.map(w => (
            <div key={w.handle} style={{
              borderRadius: 18, padding: 16,
              ...liquidSurface({ dark, intensity: 'med' }),
              textAlign: 'center',
            }}>
              <Avatar name={w.name[0]} size={56} seed={w.seed} />
              <div style={{ fontFamily: t.serif, fontSize: 15, color: ink, fontWeight: 500, marginTop: 10 }}>{w.name}</div>
              <div style={{ fontFamily: t.sans, fontSize: 11.5, color: mute, marginTop: 2 }}>{w.readers} readers</div>
              <div style={{ fontFamily: t.serif, fontSize: 12.5, color: mute, marginTop: 8,
                           fontStyle: 'italic', lineHeight: 1.35, minHeight: 34 }}>{w.bio}</div>
              <button style={{
                marginTop: 10, width: '100%', height: 32, borderRadius: 10, border: 'none', cursor: 'pointer',
                background: dark ? t.darkInk : t.ink, color: dark ? t.darkBg : t.paper,
                fontFamily: t.sans, fontSize: 12, fontWeight: 500,
              }}>Follow</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WebBooks({ dark, onOpenStory }) {
  const t = SIYOH_TOKENS;
  const ink = dark ? t.darkInk : t.ink;
  const mute = dark ? t.darkMute : t.mute;
  const [genre, setGenre] = React.useState('All');
  const [format, setFormat] = React.useState('All');
  const [sort, setSort] = React.useState('Newest');
  const filtered = SIYOH_DATA.stories.filter(s => {
    if (format === 'Text' && s.type !== 'text') return false;
    if (format === 'Audio' && s.type !== 'audio') return false;
    if (genre !== 'All' && !s.tags.includes(genre)) return false;
    return true;
  });

  return (
    <div>
      <div style={{ padding: '28px 36px 0' }}>
        <h1 style={{ fontFamily: t.serif, fontSize: 38, fontWeight: 500, color: ink,
                    letterSpacing: -0.9, margin: '0 0 6px' }}>Books</h1>
        <p style={{ fontFamily: t.serif, fontSize: 15, color: mute, margin: 0 }}>{filtered.length} stories · filter by format, genre, theme</p>
      </div>

      {/* Filter bar */}
      <div style={{ padding: '22px 36px 18px', display: 'flex', alignItems: 'center',
                   gap: 14, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', padding: 4, borderRadius: 12,
                     ...liquidSurface({ dark, intensity: 'med' }) }}>
          {['All', 'Text', 'Audio'].map(f => (
            <button key={f} onClick={() => setFormat(f)} style={{
              height: 30, padding: '0 14px', borderRadius: 9, border: 'none', cursor: 'pointer',
              background: format === f ? (dark ? t.darkInk : t.ink) : 'transparent',
              color: format === f ? (dark ? t.darkBg : t.paper) : (dark ? t.darkInk : t.ink),
              fontFamily: t.sans, fontSize: 12.5, fontWeight: 500,
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              {f === 'Text' && Icon.text(13, format === f ? (dark ? t.darkBg : t.paper) : ink)}
              {f === 'Audio' && Icon.headphones(13, format === f ? (dark ? t.darkBg : t.paper) : ink)}
              {f}
            </button>
          ))}
        </div>

        <div style={{ width: 1, height: 20, background: dark ? t.darkLine : t.line }} />

        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', flex: 1, scrollbarWidth: 'none' }}>
          {SIYOH_DATA.genres.map(g => (
            <Chip key={g} active={genre === g} dark={dark} onClick={() => setGenre(g)}>{g}</Chip>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
          <span style={{ fontFamily: t.sans, fontSize: 12, color: mute }}>Sort:</span>
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
        padding: '0 36px 140px',
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, rowGap: 28,
      }}>
        {filtered.map((s, i) => (
          <div key={s.id} onClick={() => onOpenStory(s)} style={{ cursor: 'pointer' }}>
            <div style={{ position: 'relative' }}>
              <CoverPlaceholder w="100%" h={280} seed={s.cover} label={s.title.split(' ').slice(0,3).join(' ')} dark={dark} />
              {s.type === 'audio' && (
                <div style={{
                  position: 'absolute', top: 10, right: 10,
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{Icon.headphones(15, t.orangeDeep)}</div>
              )}
            </div>
            <div style={{
              fontFamily: t.serif, fontSize: 15, color: ink, fontWeight: 500,
              letterSpacing: -0.2, lineHeight: 1.2, marginTop: 12, textWrap: 'pretty',
            }}>{s.title}</div>
            <div style={{ fontFamily: t.sans, fontSize: 12, color: mute, marginTop: 4 }}>{s.author}</div>
            <div style={{ fontFamily: t.sans, fontSize: 11, color: mute, marginTop: 2, letterSpacing: 0.2 }}>
              {s.mins} min · {s.tags[0]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WebStoryDetail({ dark, story, onBack }) {
  const t = SIYOH_TOKENS;
  const ink = dark ? t.darkInk : t.ink;
  const mute = dark ? t.darkMute : t.mute;
  const s = story;
  return (
    <div>
      {/* Hero cover strip */}
      <div style={{
        height: 280, background: t.orangeGrad, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0,
                     background: 'radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.3), transparent 60%)' }} />
        <button onClick={onBack} style={{
          position: 'absolute', top: 20, left: 20, zIndex: 3,
          height: 36, padding: '0 14px', borderRadius: 999, border: 'none', cursor: 'pointer',
          background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(10px)', color: '#fff',
          fontFamily: t.sans, fontSize: 13, fontWeight: 500,
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>{Icon.back(14, '#fff')} Back</button>
      </div>

      <div style={{ padding: '0 60px 120px', marginTop: -100, position: 'relative', maxWidth: 740, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 28, alignItems: 'flex-end', marginBottom: 28 }}>
          <div style={{ transform: 'rotate(-2deg)', boxShadow: '0 24px 50px rgba(0,0,0,0.3)', borderRadius: 8 }}>
            <CoverPlaceholder w={180} h={240} seed={s.cover} label={s.title.split(' ').slice(0,3).join(' ')} />
          </div>
          <div style={{ paddingBottom: 20, flex: 1, marginTop: 30 }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              {s.tags.map(tg => (
                <span key={tg} style={{
                  padding: '4px 10px', borderRadius: 999,
                  background: 'rgba(255,255,255,0.3)', backdropFilter: 'blur(8px)', color: '#fff',
                  fontFamily: t.sans, fontSize: 10.5, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase',
                }}>{tg}</span>
              ))}
            </div>
            <h1 style={{
              fontFamily: t.serif, fontSize: 44, color: '#fff', fontWeight: 500,
              letterSpacing: -1, lineHeight: 1.05, margin: '0 0 14px', textWrap: 'balance',
            }}>{s.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#fff' }}>
              <Avatar name={s.author[0]} size={30} seed={s.cover} />
              <div style={{ fontFamily: t.sans, fontSize: 13 }}>
                <div style={{ fontWeight: 500 }}>{s.author}</div>
                <div style={{ opacity: 0.85 }}>{s.handle} · {s.date} · {s.mins} min</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action row */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 32 }}>
          {s.type === 'audio' ? (
            <button style={{
              height: 50, padding: '0 22px', borderRadius: 14, border: 'none', cursor: 'pointer',
              background: t.orangeGrad, color: '#fff',
              fontFamily: t.sans, fontSize: 14.5, fontWeight: 600,
              boxShadow: '0 10px 24px rgba(255,87,34,0.35)',
              display: 'inline-flex', alignItems: 'center', gap: 10,
            }}>{Icon.play(16, '#fff')} Listen · {s.mins} min</button>
          ) : (
            <button style={{
              height: 50, padding: '0 22px', borderRadius: 14, border: 'none', cursor: 'pointer',
              background: t.orangeGrad, color: '#fff',
              fontFamily: t.sans, fontSize: 14.5, fontWeight: 600,
              boxShadow: '0 10px 24px rgba(255,87,34,0.35)',
            }}>Start reading · {s.mins} min</button>
          )}
          <button style={{
            height: 50, width: 50, borderRadius: 14, border: `0.5px solid ${dark ? t.darkLine : t.line}`,
            background: dark ? 'rgba(255,237,213,0.03)' : 'rgba(26,22,19,0.02)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{Icon.bookmark(20, ink)}</button>
          <button style={{
            height: 50, width: 50, borderRadius: 14, border: `0.5px solid ${dark ? t.darkLine : t.line}`,
            background: dark ? 'rgba(255,237,213,0.03)' : 'rgba(26,22,19,0.02)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{Icon.share(20, ink)}</button>
          <button style={{
            marginLeft: 'auto',
            height: 50, padding: '0 20px', borderRadius: 14, border: `0.5px solid ${dark ? t.darkLine : t.line}`,
            background: dark ? 'rgba(255,237,213,0.03)' : 'rgba(26,22,19,0.02)', cursor: 'pointer',
            color: ink, fontFamily: t.sans, fontSize: 13.5, fontWeight: 500,
          }}>Follow {s.author.split(' ')[0]}</button>
        </div>

        {/* Body */}
        {SIYOH_STORY_BODY.map((p, i) => (
          <p key={i} style={{
            fontFamily: t.serif, fontSize: 19, lineHeight: 1.7, color: ink,
            marginBottom: 22, textWrap: 'pretty', letterSpacing: -0.1,
          }}>{i === 0 && <span style={{
            fontSize: 72, float: 'left', lineHeight: 0.8, fontWeight: 500,
            color: t.orange, marginRight: 10, marginTop: 10,
          }}>{p[0]}</span>}{i === 0 ? p.slice(1) : p}</p>
        ))}
      </div>
    </div>
  );
}

function WebCreate({ dark }) {
  const t = SIYOH_TOKENS;
  const ink = dark ? t.darkInk : t.ink;
  const mute = dark ? t.darkMute : t.mute;
  const [type, setType] = React.useState('text');
  return (
    <div style={{ padding: '32px 60px 160px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ fontFamily: t.sans, fontSize: 11, color: mute, letterSpacing: 0.6,
                       textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>New story</div>
          <div style={{ fontFamily: t.serif, fontSize: 22, color: ink, fontWeight: 500, letterSpacing: -0.3 }}>Draft · saved 2 min ago</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{
            height: 40, padding: '0 16px', borderRadius: 12, border: `0.5px solid ${dark ? t.darkLine : t.line}`,
            background: 'transparent', color: ink, cursor: 'pointer',
            fontFamily: t.sans, fontSize: 13, fontWeight: 500,
          }}>Preview</button>
          <button style={{
            height: 40, padding: '0 18px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: t.orangeGrad, color: '#fff',
            fontFamily: t.sans, fontSize: 13.5, fontWeight: 600,
            boxShadow: '0 8px 18px rgba(255,87,34,0.35)',
          }}>Publish</button>
        </div>
      </div>

      {/* Type toggle */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
        {[
          { k: 'text', label: 'Write', icon: Icon.text },
          { k: 'audio', label: 'Record', icon: Icon.mic },
          { k: 'both', label: 'Write + Record', icon: Icon.headphones },
        ].map(o => (
          <button key={o.k} onClick={() => setType(o.k)} style={{
            height: 42, padding: '0 18px', borderRadius: 12, cursor: 'pointer',
            border: type === o.k ? `1.5px solid ${t.orange}` : `0.5px solid ${dark ? t.darkLine : t.line}`,
            background: type === o.k ? 'rgba(255,87,34,0.08)' : 'transparent',
            color: type === o.k ? t.orange : ink,
            fontFamily: t.sans, fontSize: 13.5, fontWeight: 500,
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>{o.icon(16, type === o.k ? t.orange : ink)} {o.label}</button>
        ))}
      </div>

      <input defaultValue="The Weight of Quiet Mornings" style={{
        width: '100%', border: 'none', background: 'transparent', outline: 'none',
        fontFamily: t.serif, fontSize: 48, color: ink, fontWeight: 500,
        letterSpacing: -1, marginBottom: 10, padding: 0, lineHeight: 1.05,
      }} />
      <input defaultValue="A subtitle to set the mood" style={{
        width: '100%', border: 'none', background: 'transparent', outline: 'none',
        fontFamily: t.serif, fontSize: 20, color: mute, fontStyle: 'italic',
        marginBottom: 32, padding: 0,
      }} />

      {(type === 'audio' || type === 'both') && (
        <div style={{
          borderRadius: 22, padding: 24, marginBottom: 28,
          background: t.orangeGrad, color: '#fff',
          boxShadow: '0 18px 40px rgba(255,87,34,0.25)',
          display: 'flex', alignItems: 'center', gap: 20,
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.4)',
            cursor: 'pointer',
          }}>
            <div style={{ width: 24, height: 24, borderRadius: 4, background: '#fff' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: t.sans, fontSize: 11, opacity: 0.85, letterSpacing: 0.8,
                         textTransform: 'uppercase', fontWeight: 600 }}>Recording</div>
            <div style={{ fontFamily: t.mono, fontSize: 32, fontWeight: 500, marginTop: 2, marginBottom: 8 }}>02:14</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 32 }}>
              {Array.from({ length: 80 }).map((_, i) => {
                const h = 3 + Math.sin(i * 0.5) * 8 + (i < 45 ? Math.random() * 16 : Math.random() * 3);
                return <div key={i} style={{ flex: 1, height: h, borderRadius: 1.5,
                                             background: i < 45 ? '#fff' : 'rgba(255,255,255,0.3)' }} />;
              })}
            </div>
          </div>
        </div>
      )}

      {(type === 'text' || type === 'both') && (
        <div style={{
          fontFamily: t.serif, fontSize: 19, color: ink, lineHeight: 1.7,
          minHeight: 400, textWrap: 'pretty', letterSpacing: -0.1,
        }}>
          <span style={{ fontSize: 72, float: 'left', lineHeight: 0.8, fontWeight: 500,
                       color: t.orange, marginRight: 10, marginTop: 8 }}>T</span>
          here is a particular shade of light that only exists at 5:47 AM — when the city hasn't yet decided what kind of day it wants to be. I have been collecting these mornings for three years now, keeping them like pressed flowers between the pages of notebooks I never finish.
          <br/><br/>
          My grandmother used to say that the world is gentlest before it remembers itself. She would rise while the kettle was still cold and sit at the kitchen window with a cup of nothing in particular, waiting for the sparrows.
          <br/><br/>
          <span style={{ color: mute, fontStyle: 'italic' }}>Continue writing…</span>
        </div>
      )}

      {/* Floating format toolbar */}
      <div style={{
        position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)', zIndex: 30,
        display: 'flex', gap: 4, padding: 6, borderRadius: 18,
        ...liquidSurface({ dark, intensity: 'heavy' }),
      }}>
        {[
          { g: 'B', w: 700 }, { g: 'I', style: 'italic' }, { g: 'U', deco: 'underline' },
          { g: '“”' }, { g: 'H₁' }, { g: 'H₂' }, { g: '•' }, { g: '”' }, { g: '🔗', noSerif: true },
        ].map((b, i) => (
          <button key={i} style={{
            width: 40, height: 40, borderRadius: 12, border: 'none', cursor: 'pointer',
            background: 'transparent', fontFamily: b.noSerif ? t.sans : t.serif,
            fontSize: 15, color: ink, fontWeight: b.w || 500,
            fontStyle: b.style || 'normal', textDecoration: b.deco || 'none',
          }}>{b.g}</button>
        ))}
      </div>
    </div>
  );
}

function WebProfile({ dark, onOpenStory }) {
  const t = SIYOH_TOKENS;
  const ink = dark ? t.darkInk : t.ink;
  const mute = dark ? t.darkMute : t.mute;
  const [tab, setTab] = React.useState('published');
  return (
    <div>
      {/* Cover band */}
      <div style={{ height: 180, background: t.orangeGradSoft, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0,
                     background: 'radial-gradient(ellipse at 70% 50%, rgba(255,138,76,0.4), transparent 60%)' }} />
      </div>

      <div style={{ padding: '0 36px', marginTop: -52, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, marginBottom: 24 }}>
          <div style={{
            width: 120, height: 120, borderRadius: '50%',
            background: t.orangeGrad,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: t.serif, fontSize: 52, color: '#fff', fontWeight: 500,
            border: `4px solid ${dark ? t.darkBg : t.paper}`,
            boxShadow: '0 14px 30px rgba(255,87,34,0.3)',
          }}>E</div>
          <div style={{ paddingBottom: 8, flex: 1 }}>
            <h1 style={{ fontFamily: t.serif, fontSize: 32, color: ink, fontWeight: 500,
                        letterSpacing: -0.6, margin: '0 0 4px' }}>Elena Marquez</h1>
            <div style={{ fontFamily: t.sans, fontSize: 14, color: mute }}>@elena.writes · joined Apr 2024</div>
          </div>
          <div style={{ display: 'flex', gap: 8, paddingBottom: 8 }}>
            <button style={{
              height: 40, padding: '0 16px', borderRadius: 12, border: `0.5px solid ${dark ? t.darkLine : t.line}`,
              background: 'transparent', color: ink, cursor: 'pointer',
              fontFamily: t.sans, fontSize: 13, fontWeight: 500,
            }}>Share</button>
            <button style={{
              height: 40, padding: '0 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: dark ? t.darkInk : t.ink, color: dark ? t.darkBg : t.paper,
              fontFamily: t.sans, fontSize: 13, fontWeight: 500,
            }}>Edit profile</button>
          </div>
        </div>

        <p style={{ fontFamily: t.serif, fontSize: 17, color: ink, fontStyle: 'italic',
                   lineHeight: 1.5, maxWidth: 540, margin: '0 0 20px', textWrap: 'pretty' }}>
          Essays on quiet rooms, long walks, and the slow pleasure of craft.
        </p>

        <div style={{ display: 'flex', gap: 28, padding: '18px 22px', borderRadius: 18,
                     ...liquidSurface({ dark, intensity: 'med' }), marginBottom: 28 }}>
          {[['24', 'Stories'], ['1,812', 'Readers'], ['342', 'Listeners'], ['89', 'Saved'], ['12.3k', 'Plays']].map(([n, l]) => (
            <div key={l}>
              <div style={{ fontFamily: t.serif, fontSize: 22, color: ink, fontWeight: 500 }}>{n}</div>
              <div style={{ fontFamily: t.sans, fontSize: 11, color: mute, marginTop: 2,
                           textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 600 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 24, borderBottom: `0.5px solid ${dark ? t.darkLine : t.line}`, marginBottom: 8 }}>
          {['published', 'drafts', 'saved', 'listened'].map(tb => (
            <button key={tb} onClick={() => setTab(tb)} style={{
              border: 'none', background: 'transparent', cursor: 'pointer', padding: '12px 0',
              fontFamily: t.sans, fontSize: 13.5, fontWeight: 500,
              color: tab === tb ? ink : mute, textTransform: 'capitalize',
              borderBottom: tab === tb ? `2px solid ${t.orange}` : '2px solid transparent',
            }}>{tb}</button>
          ))}
        </div>

        {/* List */}
        <div style={{ paddingBottom: 140 }}>
          {SIYOH_DATA.stories.slice(0, 5).map((s, i) => (
            <WebStoryRow key={s.id} story={s} dark={dark} onClick={() => onOpenStory(s)} seed={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { WebExplore, WebBooks, WebStoryDetail, WebCreate, WebProfile });
