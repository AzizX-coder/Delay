// Create flow, profile, settings, onboarding

function MobileCreate({ dark, onBack }) {
  const t = SIYOH_TOKENS;
  const ink = dark ? t.darkInk : t.ink;
  const mute = dark ? t.darkMute : t.mute;
  const [step, setStep] = React.useState(0); // 0: choose, 1: compose, 2: cover, 3: publish
  const [type, setType] = React.useState('text');

  return (
    <div style={{ minHeight: '100%', position: 'relative', background: dark ? t.darkBg : t.paper }}>
      <BgBlobs dark={dark} variant="warm" />

      {/* Top */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, padding: '54px 20px 16px',
                   display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                   ...liquidSurface({ dark, intensity: 'heavy',
                     tint: dark ? 'rgba(20,17,16,0.6)' : 'rgba(253,251,247,0.6)' }) }}>
        <button onClick={step === 0 ? onBack : () => setStep(step - 1)} style={{
          border: 'none', background: 'transparent', cursor: 'pointer', padding: 0,
          fontFamily: t.sans, fontSize: 14, color: mute,
          display: 'inline-flex', alignItems: 'center', gap: 4,
        }}>{Icon.back(16, mute)} {step === 0 ? 'Close' : 'Back'}</button>
        <div style={{ display: 'flex', gap: 4 }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              width: i === step ? 20 : 6, height: 6, borderRadius: 3,
              background: i <= step ? t.orange : (dark ? 'rgba(255,237,213,0.15)' : 'rgba(26,22,19,0.1)'),
              transition: 'all 0.25s',
            }} />
          ))}
        </div>
        <button onClick={() => setStep(Math.min(step + 1, 3))} style={{
          height: 32, padding: '0 14px', borderRadius: 999, border: 'none', cursor: 'pointer',
          background: step === 3 ? t.orangeGrad : (dark ? t.darkInk : t.ink),
          color: step === 3 ? '#fff' : (dark ? t.darkBg : t.paper),
          fontFamily: t.sans, fontSize: 12.5, fontWeight: 500,
          boxShadow: step === 3 ? '0 6px 16px rgba(255,87,34,0.35)' : 'none',
        }}>{step === 3 ? 'Publish' : 'Next'}</button>
      </div>

      <div style={{ padding: '24px 22px 140px', position: 'relative' }}>
        {step === 0 && <CreateStepChoose dark={dark} type={type} setType={setType} />}
        {step === 1 && <CreateStepCompose dark={dark} type={type} />}
        {step === 2 && <CreateStepCover dark={dark} />}
        {step === 3 && <CreateStepPublish dark={dark} type={type} />}
      </div>
    </div>
  );
}

function CreateStepChoose({ dark, type, setType }) {
  const t = SIYOH_TOKENS;
  const ink = dark ? t.darkInk : t.ink;
  const mute = dark ? t.darkMute : t.mute;
  return (
    <div>
      <div style={{ fontFamily: t.sans, fontSize: 12, color: mute, letterSpacing: 0.6,
                   textTransform: 'uppercase', fontWeight: 500, marginBottom: 6 }}>Step 1 of 4</div>
      <h1 style={{ fontFamily: t.serif, fontSize: 32, color: ink, fontWeight: 500,
                  letterSpacing: -0.7, lineHeight: 1.1, marginBottom: 10, textWrap: 'balance' }}>
        How do you want<br/>to tell it?
      </h1>
      <p style={{ fontFamily: t.serif, fontSize: 15, color: mute, lineHeight: 1.5,
                 marginBottom: 28, textWrap: 'pretty' }}>
        Siyoh lets you share your story as writing, as audio, or both. You can always add the other later.
      </p>

      {[
        { k: 'text', title: 'Write', desc: 'A clean, distraction-free editor.', icon: Icon.text, grad: 'linear-gradient(135deg,#2A241F,#4A3C30)' },
        { k: 'audio', title: 'Record', desc: 'Narrate your story. We’ll handle audio.', icon: Icon.mic, grad: t.orangeGrad },
        { k: 'both', title: 'Both', desc: 'Publish written + narrated together.', icon: Icon.headphones, grad: 'linear-gradient(135deg,#FFC08A,#FF8A4C)' },
      ].map(opt => (
        <div key={opt.k} onClick={() => setType(opt.k)} style={{
          borderRadius: 22, padding: 18, marginBottom: 12, cursor: 'pointer',
          ...liquidSurface({ dark, intensity: 'med' }),
          border: type === opt.k ? `1.5px solid ${t.orange}` : (dark ? '0.5px solid rgba(255,237,213,0.08)' : '0.5px solid rgba(26,22,19,0.05)'),
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: opt.grad,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 14px rgba(26,22,19,0.15)',
          }}>{opt.icon(24, '#fff')}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: t.serif, fontSize: 18, color: ink, fontWeight: 500,
                         letterSpacing: -0.3, marginBottom: 2 }}>{opt.title}</div>
            <div style={{ fontFamily: t.sans, fontSize: 13, color: mute }}>{opt.desc}</div>
          </div>
          <div style={{
            width: 22, height: 22, borderRadius: '50%',
            border: type === opt.k ? 'none' : `1.5px solid ${mute}`,
            background: type === opt.k ? t.orange : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{type === opt.k && Icon.check(14, '#fff')}</div>
        </div>
      ))}
    </div>
  );
}

function CreateStepCompose({ dark, type }) {
  const t = SIYOH_TOKENS;
  const ink = dark ? t.darkInk : t.ink;
  const mute = dark ? t.darkMute : t.mute;
  return (
    <div>
      <div style={{ fontFamily: t.sans, fontSize: 12, color: mute, letterSpacing: 0.6,
                   textTransform: 'uppercase', fontWeight: 500, marginBottom: 6 }}>Step 2 of 4</div>
      <input defaultValue="Untitled" style={{
        width: '100%', border: 'none', background: 'transparent', outline: 'none',
        fontFamily: t.serif, fontSize: 30, color: ink, fontWeight: 500,
        letterSpacing: -0.6, marginBottom: 14, padding: 0,
      }} />
      <input defaultValue="A subtitle to set the mood" style={{
        width: '100%', border: 'none', background: 'transparent', outline: 'none',
        fontFamily: t.serif, fontSize: 16, color: mute, fontStyle: 'italic',
        marginBottom: 24, padding: 0,
      }} />

      {(type === 'audio' || type === 'both') && (
        <div style={{
          borderRadius: 22, padding: 20, marginBottom: 24,
          background: t.orangeGrad, color: '#fff',
          boxShadow: '0 14px 30px rgba(255,87,34,0.3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: t.sans, fontSize: 11, opacity: 0.85, letterSpacing: 0.6,
                           textTransform: 'uppercase', fontWeight: 600 }}>Recording</div>
              <div style={{ fontFamily: t.mono, fontSize: 28, fontWeight: 500, marginTop: 2 }}>02:14</div>
            </div>
            <div style={{
              width: 68, height: 68, borderRadius: '50%',
              background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.4)',
            }}>
              <div style={{ width: 22, height: 22, borderRadius: 4, background: '#fff' }} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 40 }}>
            {Array.from({ length: 50 }).map((_, i) => {
              const h = 4 + Math.sin(i * 0.6) * 10 + (i < 30 ? Math.random() * 18 : Math.random() * 4);
              return <div key={i} style={{
                flex: 1, height: h, borderRadius: 2,
                background: i < 30 ? '#fff' : 'rgba(255,255,255,0.3)',
              }} />;
            })}
          </div>
        </div>
      )}

      {(type === 'text' || type === 'both') && (
        <div>
          <div style={{
            fontFamily: t.serif, fontSize: 18, color: ink, lineHeight: 1.65,
            minHeight: 200, textWrap: 'pretty', letterSpacing: -0.1,
          }}>
            <span style={{ fontSize: 54, float: 'left', lineHeight: 0.85, fontWeight: 500,
                         color: t.orange, marginRight: 8, marginTop: 4 }}>T</span>
            here is a particular shade of light that only exists at 5:47 AM — when the city hasn't yet decided what kind of day it wants to be.<br/><br/>
            <span style={{ color: mute, fontStyle: 'italic' }}>Continue writing…</span>
          </div>
          {/* Format toolbar */}
          <div style={{
            position: 'sticky', bottom: 100, marginTop: 30,
            display: 'flex', gap: 4, padding: 6, borderRadius: 18,
            ...liquidSurface({ dark, intensity: 'heavy' }),
          }}>
            {['B', 'I', 'U', '“”', 'H', '•', '⎘'].map((s, i) => (
              <button key={i} style={{
                width: 40, height: 40, borderRadius: 12, border: 'none', cursor: 'pointer',
                background: 'transparent', fontFamily: i === 3 ? t.serif : t.sans,
                fontSize: 15, color: ink, fontWeight: i === 0 ? 700 : 500,
                fontStyle: i === 1 ? 'italic' : 'normal',
                textDecoration: i === 2 ? 'underline' : 'none',
              }}>{s}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CreateStepCover({ dark }) {
  const t = SIYOH_TOKENS;
  const ink = dark ? t.darkInk : t.ink;
  const mute = dark ? t.darkMute : t.mute;
  const [selected, setSelected] = React.useState(0);
  return (
    <div>
      <div style={{ fontFamily: t.sans, fontSize: 12, color: mute, letterSpacing: 0.6,
                   textTransform: 'uppercase', fontWeight: 500, marginBottom: 6 }}>Step 3 of 4</div>
      <h2 style={{ fontFamily: t.serif, fontSize: 28, color: ink, fontWeight: 500,
                  letterSpacing: -0.6, lineHeight: 1.1, marginBottom: 18 }}>Choose a cover</h2>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <CoverPlaceholder w={180} h={240} seed={selected} label="Quiet Mornings" dark={dark} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
        {[0,1,2,3,4,5,6,7].map(i => (
          <div key={i} onClick={() => setSelected(i)} style={{
            borderRadius: 10, padding: 3,
            border: selected === i ? `2px solid ${t.orange}` : '2px solid transparent',
          }}>
            <CoverPlaceholder w="100%" h={90} seed={i} label="" dark={dark} />
          </div>
        ))}
      </div>
      <button style={{
        width: '100%', height: 48, borderRadius: 14, border: `1px dashed ${mute}`,
        background: 'transparent', color: ink, cursor: 'pointer',
        fontFamily: t.sans, fontSize: 13, fontWeight: 500,
      }}>Upload your own image</button>
    </div>
  );
}

function CreateStepPublish({ dark, type }) {
  const t = SIYOH_TOKENS;
  const ink = dark ? t.darkInk : t.ink;
  const mute = dark ? t.darkMute : t.mute;
  const [vis, setVis] = React.useState('public');
  const [genre, setGenre] = React.useState('Essay');
  return (
    <div>
      <div style={{ fontFamily: t.sans, fontSize: 12, color: mute, letterSpacing: 0.6,
                   textTransform: 'uppercase', fontWeight: 500, marginBottom: 6 }}>Step 4 of 4</div>
      <h2 style={{ fontFamily: t.serif, fontSize: 28, color: ink, fontWeight: 500,
                  letterSpacing: -0.6, lineHeight: 1.1, marginBottom: 20 }}>Final touches</h2>

      {/* Genre */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: t.sans, fontSize: 13, color: mute, marginBottom: 8, fontWeight: 500 }}>Genre</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {['Essay', 'Fiction', 'Memoir', 'Poetry', 'Travel', 'Humor'].map(g => (
            <Chip key={g} active={genre === g} dark={dark} onClick={() => setGenre(g)}>{g}</Chip>
          ))}
        </div>
      </div>

      {/* Themes */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontFamily: t.sans, fontSize: 13, color: mute, marginBottom: 8, fontWeight: 500 }}>Themes · up to 3</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {SIYOH_DATA.themes.slice(0, 6).map(th => (
            <Chip key={th} dark={dark}>{th}</Chip>
          ))}
        </div>
      </div>

      {/* Visibility */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontFamily: t.sans, fontSize: 13, color: mute, marginBottom: 8, fontWeight: 500 }}>Visibility</div>
        <div style={{ borderRadius: 16, overflow: 'hidden',
                     ...liquidSurface({ dark, intensity: 'light' }) }}>
          {[
            { k: 'public', t: 'Public', d: 'Anyone on Siyoh can read.' },
            { k: 'followers', t: 'Followers only', d: 'Only those who follow you.' },
            { k: 'private', t: 'Private draft', d: 'Save without publishing.' },
          ].map((v, i, arr) => (
            <div key={v.k} onClick={() => setVis(v.k)} style={{
              padding: '14px 16px', cursor: 'pointer',
              borderBottom: i < arr.length - 1 ? `0.5px solid ${dark ? t.darkLine : t.line}` : 'none',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: t.sans, fontSize: 14.5, color: ink, fontWeight: 500 }}>{v.t}</div>
                <div style={{ fontFamily: t.sans, fontSize: 12, color: mute, marginTop: 2 }}>{v.d}</div>
              </div>
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                border: vis === v.k ? 'none' : `1.5px solid ${mute}`,
                background: vis === v.k ? t.orange : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{vis === v.k && Icon.check(12, '#fff')}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { MobileCreate });
