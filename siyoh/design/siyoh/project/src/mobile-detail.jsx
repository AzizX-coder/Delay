// Book / story detail + audio player + create flow

function MobileStoryDetail({ dark, story, onBack, onOpenPlayer }) {
  const t = SIYOH_TOKENS;
  const ink = dark ? t.darkInk : t.ink;
  const mute = dark ? t.darkMute : t.mute;
  const s = story || SIYOH_DATA.stories[0];

  return (
    <div style={{ minHeight: '100%', position: 'relative', background: dark ? t.darkBg : t.paper }}>
      {/* Floating back */}
      <div style={{ position: 'absolute', top: 54, left: 16, right: 16, zIndex: 30,
                   display: 'flex', justifyContent: 'space-between' }}>
        <GlassIconBtn dark={dark} onClick={onBack}>{Icon.back(20, dark ? t.darkInk : t.ink)}</GlassIconBtn>
        <div style={{ display: 'flex', gap: 8 }}>
          <GlassIconBtn dark={dark}>{Icon.bookmark(18, dark ? t.darkInk : t.ink)}</GlassIconBtn>
          <GlassIconBtn dark={dark}>{Icon.share(18, dark ? t.darkInk : t.ink)}</GlassIconBtn>
        </div>
      </div>

      {/* Hero cover */}
      <div style={{
        height: 380, background: t.orangeGrad, position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 20% 40%, rgba(255,255,255,0.3), transparent 50%)',
        }}/>
        <div style={{ marginTop: 40,
                     boxShadow: '0 30px 60px rgba(26,22,19,0.4), 0 10px 20px rgba(26,22,19,0.2)',
                     borderRadius: 8, transform: 'rotate(-2deg)' }}>
          <CoverPlaceholder w={170} h={230} seed={s.cover} label={s.title.split(' ').slice(0,3).join(' ')} />
        </div>
      </div>

      {/* Content card (glass) */}
      <div style={{
        marginTop: -30, borderRadius: '28px 28px 0 0',
        background: dark ? t.darkBg : t.paper, position: 'relative', zIndex: 2,
        padding: '28px 22px 120px',
      }}>
        {/* Tags */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {s.tags.map(tag => (
            <span key={tag} style={{
              padding: '4px 10px', borderRadius: 999,
              background: dark ? 'rgba(255,237,213,0.06)' : 'rgba(26,22,19,0.05)',
              color: mute, fontFamily: t.sans, fontSize: 10.5, fontWeight: 500,
              letterSpacing: 0.4, textTransform: 'uppercase',
            }}>{tag}</span>
          ))}
        </div>

        <h1 style={{
          fontFamily: t.serif, fontSize: 30, color: ink, fontWeight: 500,
          letterSpacing: -0.7, lineHeight: 1.1, marginBottom: 16, textWrap: 'balance',
        }}>{s.title}</h1>

        {/* Author */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
          <Avatar name={s.author[0]} size={44} seed={s.cover} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: t.sans, fontSize: 14, color: ink, fontWeight: 500 }}>{s.author}</div>
            <div style={{ fontFamily: t.sans, fontSize: 12, color: mute }}>
              {s.handle} · {s.date} · {s.mins} min
            </div>
          </div>
          <button style={{
            height: 32, padding: '0 14px', borderRadius: 999, border: 'none', cursor: 'pointer',
            background: dark ? t.darkInk : t.ink, color: dark ? t.darkBg : t.paper,
            fontFamily: t.sans, fontSize: 12.5, fontWeight: 500,
          }}>Follow</button>
        </div>

        {/* Audio player preview (if audio) OR read button */}
        {s.type === 'audio' ? (
          <div onClick={() => onOpenPlayer(s)} style={{
            borderRadius: 20, padding: 16, marginBottom: 24, cursor: 'pointer',
            background: t.orangeGrad, color: '#fff',
            boxShadow: '0 12px 28px rgba(255,87,34,0.3)',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{Icon.play(20, '#fff')}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: t.sans, fontSize: 13, opacity: 0.85,
                           textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600 }}>Listen now</div>
              <div style={{ fontFamily: t.serif, fontSize: 17, fontWeight: 500 }}>{s.mins} minutes · Narrated by the author</div>
            </div>
          </div>
        ) : (
          <button style={{
            width: '100%', height: 52, borderRadius: 16, border: 'none', cursor: 'pointer',
            background: t.orangeGrad, color: '#fff', marginBottom: 24,
            fontFamily: t.sans, fontSize: 15, fontWeight: 600, letterSpacing: 0.2,
            boxShadow: '0 10px 24px rgba(255,87,34,0.3)',
          }}>Start reading · {s.mins} min</button>
        )}

        {/* Body excerpt */}
        <div>
          {SIYOH_STORY_BODY.map((p, i) => (
            <p key={i} style={{
              fontFamily: t.serif, fontSize: 17.5, lineHeight: 1.65,
              color: ink, marginBottom: 18, textWrap: 'pretty',
              letterSpacing: -0.1,
              textIndent: i === 0 ? 0 : 0,
            }}>{i === 0 && <span style={{
              fontSize: 58, float: 'left', lineHeight: 0.85,
              fontWeight: 500, color: t.orange, marginRight: 8, marginTop: 6,
            }}>{p[0]}</span>}{i === 0 ? p.slice(1) : p}</p>
          ))}
        </div>

        {/* Engagement bar */}
        <div style={{
          marginTop: 24, padding: '18px 0', display: 'flex', gap: 20,
          borderTop: `0.5px solid ${dark ? t.darkLine : t.line}`,
          borderBottom: `0.5px solid ${dark ? t.darkLine : t.line}`,
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: ink,
                         fontFamily: t.sans, fontSize: 13 }}>{Icon.heart(18, ink)} {s.likes}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: ink,
                         fontFamily: t.sans, fontSize: 13 }}>{Icon.comment(18, ink)} 47</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: ink,
                         fontFamily: t.sans, fontSize: 13, marginLeft: 'auto' }}>{Icon.bookmark(18, ink)} Save</span>
        </div>
      </div>
    </div>
  );
}

// Audio player (full screen)
function MobileAudioPlayer({ dark, story, onBack }) {
  const t = SIYOH_TOKENS;
  const s = story || SIYOH_DATA.stories[1];
  const [playing, setPlaying] = React.useState(true);
  const [progress, setProgress] = React.useState(0.42);

  return (
    <div style={{ height: '100%', position: 'relative', background: t.orangeGrad, overflow: 'hidden' }}>
      {/* Decorative glow */}
      <div style={{ position: 'absolute', top: '-20%', left: '-20%', width: 400, height: 400,
                   borderRadius: '50%', background: 'rgba(255,255,255,0.3)', filter: 'blur(80px)' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-20%', width: 360, height: 360,
                   borderRadius: '50%', background: 'rgba(255,87,34,0.5)', filter: 'blur(80px)' }} />

      {/* Top */}
      <div style={{ position: 'absolute', top: 54, left: 16, right: 16, zIndex: 10,
                   display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={onBack} style={{
          width: 40, height: 40, borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{Icon.chev(20, '#fff', 'down')}</button>
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <div style={{ fontFamily: t.sans, fontSize: 11, opacity: 0.8, letterSpacing: 0.6,
                       textTransform: 'uppercase', fontWeight: 600 }}>Now playing</div>
          <div style={{ fontFamily: t.sans, fontSize: 13, fontWeight: 500 }}>from Siyoh</div>
        </div>
        <button style={{
          width: 40, height: 40, borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{Icon.more(20, '#fff')}</button>
      </div>

      {/* Cover */}
      <div style={{ position: 'absolute', top: 130, left: 0, right: 0,
                   display: 'flex', justifyContent: 'center' }}>
        <div style={{
          width: 260, height: 260, borderRadius: 28, overflow: 'hidden',
          boxShadow: '0 30px 80px rgba(0,0,0,0.3), inset 0 0 0 0.5px rgba(255,255,255,0.3)',
          background: 'linear-gradient(135deg,#2A241F,#4A3C30)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          <div style={{ fontFamily: t.serif, fontSize: 36, color: '#F5EDE0', fontWeight: 500,
                       textAlign: 'center', padding: 28, letterSpacing: -0.6, lineHeight: 1.05,
                       textWrap: 'balance' }}>
            {s.title}
          </div>
          <div style={{ position: 'absolute', inset: 0,
                       background: 'linear-gradient(160deg, rgba(255,255,255,0.08) 0%, transparent 50%)' }} />
        </div>
      </div>

      {/* Liquid glass info/player card */}
      <div style={{
        position: 'absolute', bottom: 32, left: 14, right: 14, zIndex: 5,
        borderRadius: 28, padding: '22px 20px',
        ...liquidSurface({ dark: false, intensity: 'heavy', tint: 'rgba(255,255,255,0.2)' }),
        color: '#fff',
      }}>
        <div style={{ fontFamily: t.serif, fontSize: 22, fontWeight: 500,
                     letterSpacing: -0.4, lineHeight: 1.15, marginBottom: 4,
                     textWrap: 'balance' }}>{s.title}</div>
        <div style={{ fontFamily: t.sans, fontSize: 13, opacity: 0.85, marginBottom: 18 }}>
          {s.author} · narrated by the author
        </div>

        {/* Waveform */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 1.5, height: 36, marginBottom: 10 }}>
          {Array.from({ length: 60 }).map((_, i) => {
            const h = 6 + Math.sin(i * 0.7) * 8 + Math.random() * 16;
            const passed = i / 60 < progress;
            return <div key={i} style={{
              flex: 1, height: h, borderRadius: 2,
              background: passed ? '#fff' : 'rgba(255,255,255,0.35)',
            }} />;
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between',
                     fontFamily: t.mono, fontSize: 11, opacity: 0.85, marginBottom: 18 }}>
          <span>{Math.round(s.mins * progress)}:12</span>
          <span>-{s.mins - Math.round(s.mins * progress)}:48</span>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button style={btnGhost}>{Icon.heart(22, '#fff')}</button>
          <button style={btnGhost}>{Icon.skip(24, '#fff', 'back')}</button>
          <button onClick={() => setPlaying(!playing)} style={{
            width: 68, height: 68, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: '#fff', color: t.orangeDeep,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          }}>{playing ? Icon.pause(26, t.orangeDeep) : Icon.play(26, t.orangeDeep)}</button>
          <button style={btnGhost}>{Icon.skip(24, '#fff', 'fwd')}</button>
          <button style={btnGhost}>{Icon.text(22, '#fff')}</button>
        </div>
      </div>
    </div>
  );
}

const btnGhost = {
  width: 44, height: 44, borderRadius: '50%', border: 'none', cursor: 'pointer',
  background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
};

Object.assign(window, { MobileStoryDetail, MobileAudioPlayer });
