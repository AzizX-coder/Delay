'use client';
import Link from 'next/link';
import { SiyohLogo } from '@/components/Logo';
import { Avatar } from '@/components/Avatar';
import { CoverPlaceholder } from '@/components/CoverPlaceholder';
import { Icon } from '@/components/Icon';
import { Reveal } from '@/components/Reveal';
import { tokens, liquidSurface } from '@/lib/tokens';
import { useTheme } from '@/components/ThemeProvider';
import type { Story, Profile } from '@/lib/types';

export function LandingPage({ stories, writers }: { stories: Story[]; writers: Profile[] }) {
  const { dark, toggle } = useTheme();
  const ink = dark ? tokens.darkInk : tokens.ink;
  const mute = dark ? tokens.darkMute : tokens.mute;
  const line = dark ? tokens.darkLine : tokens.line;

  const features = [
    { title: 'O‘qish', body: 'Uzun esselar, hikoyalar va sekin jurnalistika. Diqqat uchun yaratilgan.', icon: <Icon.text s={22} c="#fff" /> },
    { title: 'Tinglash', body: 'Audio birinchi o‘rinda. Maydon yozuvlari, ovozli esselar, badiiy o‘qish.', icon: <Icon.headphones s={22} c="#fff" /> },
    { title: 'Yozish', body: 'Sodda kompozitor. Qoralamalarni saqlang, bir bosish bilan nashr eting.', icon: <Icon.create s={22} c="#fff" /> },
  ];

  const steps = [
    { n: '01', title: 'Bepul ro‘yxatdan o‘ting', body: 'Hammasini o‘qing. Pulli devor yo‘q, reklama yo‘q.' },
    { n: '02', title: 'Sevgan ovozlaringizni kuzating', body: 'O‘zingiz tanlagan yozuvchilardan tinch lenta yarating.' },
    { n: '03', title: 'O‘zingiznikini chop eting', body: 'Yozing yoki yozib oling. Qolganini biz qilamiz.' },
  ];

  return (
    <div className="app-bg" style={{ position: 'relative' }}>
      <div className="anim-float-slow" style={{
        position: 'fixed', top: -240, right: -160, width: 560, height: 560,
        borderRadius: '50%', background: dark ? 'rgba(255,87,34,0.18)' : 'rgba(255,138,76,0.22)',
        filter: 'blur(110px)', pointerEvents: 'none', zIndex: 0,
      }} />
      <div className="anim-float-slower" style={{
        position: 'fixed', top: '40%', left: -200, width: 500, height: 500,
        borderRadius: '50%', background: dark ? 'rgba(255,200,150,0.08)' : 'rgba(255,200,150,0.22)',
        filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        ...liquidSurface({ dark, intensity: 'heavy',
          tint: dark ? 'rgba(20,17,16,0.7)' : 'rgba(253,251,247,0.75)' }),
        borderBottom: `0.5px solid ${line}`,
      }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto', padding: '14px 36px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Link href="/" style={{ textDecoration: 'none' }}><SiyohLogo size={28} dark={dark} /></Link>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {[
              { label: 'Imkoniyatlar', href: '#features' },
              { label: 'Yozuvchilar', href: '#writers' },
              { label: 'Qanday ishlaydi', href: '#how' },
              { label: 'Hikoyalar', href: '/feed' },
            ].map(l => (
              <a key={l.label} href={l.href} style={{
                padding: '8px 14px', borderRadius: 999, color: ink,
                fontFamily: 'var(--font-geist)', fontSize: 13.5, fontWeight: 500,
                textDecoration: 'none',
              }}>{l.label}</a>
            ))}
            <button onClick={toggle} aria-label="Mavzuni almashtirish" className="press" style={{
              width: 36, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer',
              background: dark ? 'rgba(255,237,213,0.06)' : 'rgba(26,22,19,0.04)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 4,
            }}>{dark ? <Icon.sun s={16} c={ink} /> : <Icon.moon s={16} c={ink} />}</button>
            <Link href="/auth/login" className="press" style={{
              marginLeft: 6, padding: '10px 16px', borderRadius: 12,
              background: 'transparent', color: ink,
              fontFamily: 'var(--font-geist)', fontSize: 13.5, fontWeight: 500,
              textDecoration: 'none', border: `0.5px solid ${line}`,
            }}>Kirish</Link>
            <Link href="/auth/signup" className="press" style={{
              marginLeft: 4, padding: '10px 18px', borderRadius: 12,
              background: tokens.orangeGrad, color: '#fff',
              fontFamily: 'var(--font-geist)', fontSize: 13.5, fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 8px 20px rgba(255,87,34,0.32)',
            }}>Boshlash</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 1280, margin: '0 auto', padding: '80px 36px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 60, alignItems: 'center' }}>
          <div>
            <div className="anim-fade-up" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 14px', borderRadius: 999,
              background: dark ? 'rgba(255,87,34,0.12)' : 'rgba(255,87,34,0.10)',
              color: tokens.orangeDeep,
              fontFamily: 'var(--font-geist)', fontSize: 12, fontWeight: 600,
              letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 22,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: tokens.orange }} className="anim-pulse-ring" />
              Beta &mdash; taklifsiz kirish
            </div>
            <h1 className="anim-fade-up delay-100" style={{
              fontFamily: 'var(--font-newsreader)', fontSize: 84, fontWeight: 400,
              letterSpacing: -2, lineHeight: 1, margin: '0 0 22px',
            }}>
              Sekinlashishga<br />
              <span className="grad-text" style={{ fontStyle: 'italic' }}>arziydigan</span> hikoyalar.
            </h1>
            <p className="anim-fade-up delay-200" style={{
              fontFamily: 'var(--font-newsreader)', fontSize: 21, color: mute,
              lineHeight: 1.5, maxWidth: 520, margin: '0 0 32px',
            }}>
              Siyoh &mdash; diqqat uchun qurilgan ijodiy maydon. Uzun esselar. Ovozli esselar.
              Birinchi marta yozayotganlar va tajribali ustozlar. Cheksiz lenta yo&apos;q.
              G&apos;azab yo&apos;q. Shunchaki o&apos;qib tugatishni istayotgan hikoyalar.
            </p>
            <div className="anim-fade-up delay-300" style={{ display: 'flex', gap: 12, marginBottom: 36 }}>
              <Link href="/auth/signup" className="press" style={{
                height: 56, padding: '0 28px', borderRadius: 16,
                background: tokens.orangeGrad, color: '#fff',
                fontFamily: 'var(--font-geist)', fontSize: 15.5, fontWeight: 600,
                textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10,
                boxShadow: '0 14px 30px rgba(255,87,34,0.38)',
              }}>
                O&apos;qishni boshlash &mdash; bepul <Icon.chev s={18} c="#fff" />
              </Link>
              <Link href="/feed" className="press" style={{
                height: 56, padding: '0 22px', borderRadius: 16,
                background: dark ? 'rgba(255,237,213,0.04)' : 'rgba(26,22,19,0.03)',
                border: `0.5px solid ${line}`, color: ink,
                fontFamily: 'var(--font-geist)', fontSize: 15, fontWeight: 500,
                textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
              }}>
                Hikoyalarni ko&apos;rish
              </Link>
            </div>
            <div className="anim-fade-up delay-400" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: tokens.orangeGrad,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 18px rgba(255,87,34,0.32)',
              }}><Icon.create s={18} c="#fff" /></div>
              <div style={{ fontFamily: 'var(--font-geist)', fontSize: 13, color: mute }}>
                <span style={{ color: ink, fontWeight: 600 }}>Birinchi yozuvchi siz bo&apos;ling.</span> Hamjamiyatni siz boshlaysiz.
              </div>
            </div>
          </div>

          {/* Hero glass mockup */}
          <div className="anim-scale-in delay-200" style={{ position: 'relative' }}>
            <div className="anim-drift" style={{
              borderRadius: 28, padding: 24, position: 'relative',
              background: tokens.orangeGrad, color: '#fff',
              boxShadow: '0 50px 100px rgba(255,87,34,0.32)',
              transform: 'rotate(-2deg)',
            }}>
              <div style={{ position: 'absolute', top: -60, right: -40, width: 200, height: 200,
                borderRadius: '50%', background: 'rgba(255,255,255,0.18)', filter: 'blur(28px)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ padding: '4px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.22)',
                  backdropFilter: 'blur(10px)', fontFamily: 'var(--font-geist)', fontSize: 10.5,
                  fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  Yangi loyiha
                </div>
              </div>
              <div style={{ display: 'flex', gap: 18, alignItems: 'center', position: 'relative' }}>
                <CoverPlaceholder w={120} h={160} seed={0} label="Siyoh" />
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontFamily: 'var(--font-newsreader)', fontSize: 26, fontWeight: 400,
                    letterSpacing: -0.4, lineHeight: 1.05, margin: '0 0 8px' }}>
                    Hikoyangiz shu yerda paydo bo&apos;ladi.
                  </h3>
                  <div style={{ fontFamily: 'var(--font-geist)', fontSize: 12, opacity: 0.85, marginBottom: 12 }}>
                    Birinchi muqovani siz tanlaysiz
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Link href="/create" style={{
                      height: 36, padding: '0 14px', borderRadius: 10,
                      background: '#fff', color: tokens.orangeDeep,
                      fontFamily: 'var(--font-geist)', fontSize: 12.5, fontWeight: 600,
                      textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6,
                    }}>Yozishni boshlash <Icon.chev s={12} c={tokens.orangeDeep} /></Link>
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              position: 'absolute', bottom: -40, left: -30, width: 260,
              ...liquidSurface({ dark, intensity: 'heavy' }),
              borderRadius: 18, padding: 14, transform: 'rotate(4deg)',
            }} className="anim-drift">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar name="Siz" size={36} seed={0} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-newsreader)', fontSize: 15,
                    color: ink, fontStyle: 'italic' }}>Bo&apos;sh sahifa.</div>
                  <div style={{ fontFamily: 'var(--font-geist)', fontSize: 11, color: mute }}>O&apos;z so&apos;zlaringizni kuting</div>
                </div>
                <Icon.create s={16} c={tokens.orange} />
              </div>
            </div>

            <div style={{
              position: 'absolute', top: -28, right: -18, padding: '10px 14px',
              ...liquidSurface({ dark, intensity: 'heavy' }),
              borderRadius: 14, transform: 'rotate(3deg)',
              fontFamily: 'var(--font-geist)', fontSize: 12, fontWeight: 500, color: ink,
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }} className="anim-drift">
              <Icon.bookmark s={14} c={tokens.orange} filled /> Birinchi sahifa
            </div>
          </div>
        </div>
      </section>

      {/* Marquee — only when there are stories */}
      {stories.length > 0 && (
        <Reveal as="section" className="marquee" style={{
          position: 'relative', zIndex: 1, padding: '24px 0 40px', overflow: 'hidden',
          borderTop: `0.5px solid ${line}`, borderBottom: `0.5px solid ${line}`,
        }}>
          <div className="marquee-track" style={{
            fontFamily: 'var(--font-newsreader)', fontSize: 28, color: mute,
            fontStyle: 'italic', whiteSpace: 'nowrap', alignItems: 'center',
          }}>
            {[...stories, ...stories].map((s, i) => (
              <span key={`${s.id}-${i}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 24 }}>
                <span style={{ color: ink, fontStyle: 'normal' }}>{s.title}</span>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: tokens.orange }} />
                <span>{s.author?.display_name}</span>
                <span style={{ marginRight: 24 }}>&middot;</span>
              </span>
            ))}
          </div>
        </Reveal>
      )}

      {/* Features */}
      <section id="features" style={{ position: 'relative', zIndex: 1, maxWidth: 1280, margin: '0 auto', padding: '100px 36px' }}>
        <Reveal>
          <div style={{
            fontFamily: 'var(--font-geist)', fontSize: 11, color: mute, letterSpacing: 0.8,
            textTransform: 'uppercase', fontWeight: 700, marginBottom: 12,
          }}>Bir platforma &middot; uchta marosim</div>
          <h2 style={{
            fontFamily: 'var(--font-newsreader)', fontSize: 60, fontWeight: 400, color: ink,
            letterSpacing: -1.4, margin: '0 0 18px', maxWidth: 780, lineHeight: 1.02,
          }}>
            <span style={{ fontStyle: 'italic' }}>Chuqur</span> o&apos;qing.
            Diqqat bilan tinglang. Halol yozing.
          </h2>
          <p style={{
            fontFamily: 'var(--font-newsreader)', fontSize: 18, color: mute,
            maxWidth: 560, margin: '0 0 56px', lineHeight: 1.55,
          }}>Uchta birinchi darajali tajriba bitta sokin uyda. Birortasi yashirilmagan, birortasi reklama emas.</p>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 120}>
              <div className="hover-lift" style={{
                ...liquidSurface({ dark, intensity: 'med' }),
                borderRadius: 24, padding: 28, height: '100%', cursor: 'default',
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 16,
                  background: tokens.orangeGrad,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 10px 24px rgba(255,87,34,0.32)',
                  marginBottom: 22,
                }}>{f.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-newsreader)', fontSize: 32, fontWeight: 400,
                  color: ink, letterSpacing: -0.6, margin: '0 0 10px' }}>{f.title}</h3>
                <p style={{ fontFamily: 'var(--font-newsreader)', fontSize: 16, color: mute,
                  lineHeight: 1.55, margin: 0 }}>{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Writers */}
      <section id="writers" style={{ position: 'relative', zIndex: 1, maxWidth: 1280, margin: '0 auto', padding: '40px 36px 100px' }}>
        <Reveal>
          <div style={{
            fontFamily: 'var(--font-geist)', fontSize: 11, color: mute, letterSpacing: 0.8,
            textTransform: 'uppercase', fontWeight: 700, marginBottom: 12,
          }}>Siyohdagi yozuvchilar</div>
          <h2 style={{
            fontFamily: 'var(--font-newsreader)', fontSize: 52, fontWeight: 400, color: ink,
            letterSpacing: -1.2, margin: '0 0 40px', maxWidth: 700, lineHeight: 1.02,
          }}><span style={{ fontStyle: 'italic' }}>Kuzatishni</span> istaysiz ovozlar.</h2>
        </Reveal>

        {writers.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {writers.slice(0, 4).map((w, i) => (
              <Reveal key={w.username} delay={i * 100}>
                <Link href={`/profile/${w.username}`} className="hover-lift" style={{
                  ...liquidSurface({ dark, intensity: 'med' }),
                  borderRadius: 20, padding: 22, textAlign: 'center',
                  textDecoration: 'none', display: 'block', cursor: 'pointer',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Avatar name={w.display_name[0]} size={64} seed={w.avatar_seed} />
                  </div>
                  <div style={{ fontFamily: 'var(--font-newsreader)', fontSize: 19, color: ink,
                    fontWeight: 400, marginTop: 12 }}>{w.display_name}</div>
                  <div style={{ fontFamily: 'var(--font-geist)', fontSize: 11.5, color: mute, marginTop: 2 }}>
                    @{w.username}
                  </div>
                  <div style={{ fontFamily: 'var(--font-newsreader)', fontSize: 14, color: mute, marginTop: 12,
                    fontStyle: 'italic', lineHeight: 1.4, minHeight: 40 }}>{w.bio}</div>
                </Link>
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal>
            <div style={{
              ...liquidSurface({ dark, intensity: 'med' }),
              borderRadius: 24, padding: '52px 36px', textAlign: 'center',
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: 18, margin: '0 auto 18px',
                background: tokens.orangeGrad,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 14px 30px rgba(255,87,34,0.32)',
              }}><Icon.create s={28} c="#fff" /></div>
              <h3 style={{ fontFamily: 'var(--font-newsreader)', fontSize: 28, fontWeight: 400,
                color: ink, letterSpacing: -0.5, margin: '0 0 10px' }}>
                <span style={{ fontStyle: 'italic' }}>Birinchi yozuvchi</span> siz bo&apos;ling.
              </h3>
              <p style={{ fontFamily: 'var(--font-newsreader)', fontSize: 16, color: mute,
                lineHeight: 1.55, maxWidth: 460, margin: '0 auto 22px' }}>
                Hamjamiyat hozirgina shakllanmoqda. Sizning hikoyangiz hammasini boshlasin.
              </p>
              <Link href="/auth/signup" className="press" style={{
                height: 44, padding: '0 22px', borderRadius: 12,
                background: tokens.orangeGrad, color: '#fff',
                fontFamily: 'var(--font-geist)', fontSize: 13.5, fontWeight: 600,
                textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
                boxShadow: '0 8px 20px rgba(255,87,34,0.3)',
              }}>Hisob yarating <Icon.chev s={14} c="#fff" /></Link>
            </div>
          </Reveal>
        )}
      </section>

      {/* How it works */}
      <section id="how" style={{ position: 'relative', zIndex: 1, padding: '100px 36px',
        background: dark ? 'rgba(255,237,213,0.02)' : 'rgba(26,22,19,0.02)',
        borderTop: `0.5px solid ${line}`, borderBottom: `0.5px solid ${line}` }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <Reveal>
            <div style={{
              fontFamily: 'var(--font-geist)', fontSize: 11, color: mute, letterSpacing: 0.8,
              textTransform: 'uppercase', fontWeight: 700, marginBottom: 12,
            }}>Siyoh qanday ishlaydi</div>
            <h2 style={{
              fontFamily: 'var(--font-newsreader)', fontSize: 52, fontWeight: 400, color: ink,
              letterSpacing: -1.2, margin: '0 0 56px', maxWidth: 600, lineHeight: 1.02,
            }}>Uch qadam. <span style={{ fontStyle: 'italic' }}>Ko&apos;rsatma kerak emas.</span></h2>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 140}>
                <div style={{ padding: '0 4px' }}>
                  <div className="grad-text" style={{
                    fontFamily: 'var(--font-newsreader)', fontSize: 76, fontWeight: 400,
                    letterSpacing: -2, lineHeight: 1, marginBottom: 14, fontStyle: 'italic',
                  }}>{s.n}</div>
                  <h3 style={{ fontFamily: 'var(--font-newsreader)', fontSize: 26, fontWeight: 400,
                    color: ink, letterSpacing: -0.5, margin: '0 0 10px' }}>{s.title}</h3>
                  <p style={{ fontFamily: 'var(--font-newsreader)', fontSize: 16, color: mute,
                    lineHeight: 1.55, margin: 0 }}>{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Story preview only when stories exist */}
      {stories.length > 0 && (
        <section style={{ position: 'relative', zIndex: 1, maxWidth: 1280, margin: '0 auto', padding: '100px 36px' }}>
          <Reveal style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 32 }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-geist)', fontSize: 11, color: mute, letterSpacing: 0.8,
                textTransform: 'uppercase', fontWeight: 700, marginBottom: 12,
              }}>Bu hafta Siyohda</div>
              <h2 style={{
                fontFamily: 'var(--font-newsreader)', fontSize: 48, fontWeight: 400, color: ink,
                letterSpacing: -1.1, margin: 0, lineHeight: 1.02,
              }}>Nashr etilganlardan <span style={{ fontStyle: 'italic' }}>tatib ko&apos;ring.</span></h2>
            </div>
            <Link href="/feed" style={{ color: tokens.orange, fontFamily: 'var(--font-geist)',
              fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>To&apos;liq lentaga &rarr;</Link>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {stories.slice(0, 6).map((s, i) => (
              <Reveal key={s.id} delay={(i % 3) * 100}>
                <Link href={`/story/${s.slug}`} className="hover-lift" style={{
                  textDecoration: 'none', color: 'inherit', display: 'block',
                  ...liquidSurface({ dark, intensity: 'med' }),
                  borderRadius: 22, padding: 18,
                }}>
                  <div style={{ position: 'relative' }}>
                    <CoverPlaceholder w="100%" h={220} seed={s.cover_seed}
                      label={s.title.split(' ').slice(0, 3).join(' ')} />
                    {s.type === 'audio' && (
                      <div style={{
                        position: 'absolute', top: 10, right: 10, width: 32, height: 32,
                        borderRadius: '50%', background: 'rgba(255,255,255,0.92)',
                        backdropFilter: 'blur(8px)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                      }}><Icon.headphones s={14} c={tokens.orangeDeep} /></div>
                    )}
                  </div>
                  <div style={{ fontFamily: 'var(--font-newsreader)', fontSize: 20,
                    fontWeight: 400, color: ink, marginTop: 14, letterSpacing: -0.3,
                    lineHeight: 1.2 }}>{s.title}</div>
                  <div style={{ fontFamily: 'var(--font-geist)', fontSize: 12.5,
                    color: mute, marginTop: 6 }}>{s.author?.display_name} &middot; {s.mins} daqiqa</div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 1280, margin: '0 auto', padding: '40px 36px 100px' }}>
        <Reveal>
          <div style={{
            borderRadius: 32, padding: '56px 48px', textAlign: 'center',
            background: tokens.orangeGrad, color: '#fff', position: 'relative', overflow: 'hidden',
            boxShadow: '0 40px 80px rgba(255,87,34,0.32)',
          }}>
            <div className="anim-spin-slow" style={{
              position: 'absolute', top: -200, right: -200, width: 600, height: 600,
              borderRadius: '50%',
              background: 'conic-gradient(from 0deg, rgba(255,255,255,0.18), transparent 50%, rgba(255,255,255,0.12))',
              filter: 'blur(40px)',
            }} />
            <div style={{ position: 'relative' }}>
              <h2 style={{
                fontFamily: 'var(--font-newsreader)', fontSize: 56, fontWeight: 400,
                letterSpacing: -1.3, lineHeight: 1.02, margin: '0 0 14px',
              }}>Sekinroq o&apos;qishni <span style={{ fontStyle: 'italic' }}>boshlang.</span></h2>
              <p style={{
                fontFamily: 'var(--font-newsreader)', fontSize: 19, opacity: 0.92,
                maxWidth: 580, margin: '0 auto 28px',
              }}>Bepul, abadiy. O&apos;qing yoki yozing &mdash; o&apos;zingiz qaror qiling. Bildirishnomalarni o&apos;chiring, dunyoni jimlating.</p>
              <Link href="/auth/signup" className="press" style={{
                height: 56, padding: '0 28px', borderRadius: 16,
                background: '#fff', color: tokens.orangeDeep,
                fontFamily: 'var(--font-geist)', fontSize: 15.5, fontWeight: 700,
                textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10,
                boxShadow: '0 14px 30px rgba(0,0,0,0.18)',
              }}>Hisob yarating <Icon.chev s={18} c={tokens.orangeDeep} /></Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer style={{ position: 'relative', zIndex: 1, borderTop: `0.5px solid ${line}`,
        padding: '40px 36px 60px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid',
          gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 40 }}>
          <div>
            <SiyohLogo size={26} dark={dark} />
            <p style={{ fontFamily: 'var(--font-newsreader)', fontSize: 15, color: mute,
              lineHeight: 1.5, marginTop: 14, maxWidth: 320, fontStyle: 'italic' }}>
              Diqqat uchun qurilgan ijodiy maydon. Mehr bilan, ko&apos;p joyda yaratildi.
            </p>
          </div>
          {[
            { h: 'O‘qish', items: [['Lenta', '/feed'], ['Kashf etish', '/explore'], ['Kitoblar', '/books']] as const },
            { h: 'Yozish', items: [['Kompozitor', '/create']] as const },
            { h: 'Hisob', items: [['Kirish', '/auth/login'], ['Ro‘yxatdan o‘tish', '/auth/signup'], ['Sozlamalar', '/settings']] as const },
          ].map(c => (
            <div key={c.h}>
              <div style={{ fontFamily: 'var(--font-geist)', fontSize: 11, color: mute,
                letterSpacing: 0.6, textTransform: 'uppercase', fontWeight: 700,
                marginBottom: 12 }}>{c.h}</div>
              {c.items.map(([label, href]) => (
                <Link key={label} href={href} style={{
                  display: 'block', padding: '6px 0',
                  fontFamily: 'var(--font-geist)', fontSize: 14, color: ink,
                  textDecoration: 'none',
                }}>{label}</Link>
              ))}
            </div>
          ))}
        </div>
        <div style={{ maxWidth: 1280, margin: '40px auto 0', paddingTop: 24,
          borderTop: `0.5px solid ${line}`,
          display: 'flex', justifyContent: 'space-between',
          fontFamily: 'var(--font-geist)', fontSize: 12, color: mute }}>
          <span>&copy; {new Date().getFullYear()} Siyoh. Barcha huquqlar himoyalangan.</span>
          <span style={{ fontStyle: 'italic', fontFamily: 'var(--font-newsreader)', fontSize: 14 }}>
            Sekinlashishga arziydigan hikoyalar.
          </span>
        </div>
      </footer>
    </div>
  );
}
