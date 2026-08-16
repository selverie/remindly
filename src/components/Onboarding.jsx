import { useState, useRef } from 'react'
import { translations } from '../lib/i18n'
import { requestNotificationPermission } from '../lib/notifications'

const LANGS = [
  { code: 'id', label: 'ID' },
  { code: 'en', label: 'EN' },
]

const IconPencil = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

const IconBell = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)

const IconBox = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="21 8 21 21 3 21 3 8"/>
    <rect x="1" y="3" width="22" height="5"/>
    <line x1="10" y1="12" x2="14" y2="12"/>
  </svg>
)

function SliderButton({ label, onConfirm }) {
  const trackRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [x, setX] = useState(0)
  const startXRef = useRef(0)
  const KNOB = 48
  const PAD = 4

  function getTrackWidth() {
    return (trackRef.current?.offsetWidth || 300) - KNOB - PAD * 2
  }

  function onPointerDown(e) {
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
    startXRef.current = e.clientX - x
  }

  function onPointerMove(e) {
    if (!dragging) return
    const max = getTrackWidth()
    const next = Math.max(0, Math.min(e.clientX - startXRef.current, max))
    setX(next)
  }

  function onPointerUp() {
    setDragging(false)
    const max = getTrackWidth()
    if (x >= max * 0.85) {
      setX(max)
      setTimeout(onConfirm, 200)
    } else {
      setX(0)
    }
  }

  const max = 260 - KNOB - PAD * 2
  const progress = Math.min(x / max, 1)

  return (
    <div ref={trackRef} style={{
      position: 'relative', width: '100%',
      height: KNOB + PAD * 2, borderRadius: 99,
      background: '#1e1e1e', border: '1px solid #2a2a2a',
      overflow: 'hidden', userSelect: 'none', touchAction: 'none',
    }}>
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: x + KNOB + PAD * 2,
        background: `rgba(227,226,220,${0.06 + progress * 0.08})`,
        borderRadius: 99,
        transition: dragging ? 'none' : 'width 0.3s ease',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: `rgba(100,100,100,${1 - progress * 1.5})`,
        fontSize: 13, fontWeight: 600, pointerEvents: 'none',
        letterSpacing: '-0.2px', transition: 'color 0.2s',
      }}>
        {label}
      </div>
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          position: 'absolute', left: PAD + x, top: PAD,
          width: KNOB, height: KNOB, borderRadius: 99,
          background: '#e3e2dc',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'grab',
          transition: dragging ? 'none' : 'left 0.3s cubic-bezier(.22,1,.36,1)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)', zIndex: 2,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#161616" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"/>
          <polyline points="12 5 19 12 12 19"/>
        </svg>
      </div>
    </div>
  )
}

export default function Onboarding({ onDone }) {
  const [lang, setLang] = useState('id')
  const [notifStatus, setNotifStatus] = useState(null)
  const [exiting, setExiting] = useState(false)

  const t = translations[lang]

  const handleLangSelect = (code) => {
    setLang(code)
    localStorage.setItem('remindly_lang', code)
  }

  const handleAllowNotif = async () => {
    setNotifStatus('requesting')
    const result = await requestNotificationPermission()
    setNotifStatus(result === 'granted' ? 'granted' : 'denied')
  }

  const handleFinish = () => {
    setExiting(true)
    localStorage.setItem('remindly_onboarded', '1')
    setTimeout(onDone, 400)
  }

  const granted = notifStatus === 'granted'
  const denied = notifStatus === 'denied'
  const requesting = notifStatus === 'requesting'

  const features = [
    { Icon: IconPencil, title: t.obFeature1Title },
    { Icon: IconBell,   title: t.obFeature2Title },
    { Icon: IconBox,    title: t.obFeature3Title },
  ]

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#111111', zIndex: 9998,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      opacity: exiting ? 0 : 1,
      transition: 'opacity 0.4s ease',
      padding: '24px 24px 20px',
    }}>
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', width: '100%', maxWidth: 360,
        gap: 0,
      }}>
        <img src="/logo.png" alt="logo" style={{ width: 44, height: 44, objectFit: 'contain', marginBottom: 14 }} />
        <p style={{ color: '#e3e2dc', fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px', margin: 0, textAlign: 'center', lineHeight: 1.2 }}>
          {t.obWelcomeTitle}
        </p>
        <p style={{ color: '#555', fontSize: 12, marginTop: 8, marginBottom: 20, textAlign: 'center', maxWidth: 240 }}>
          {t.obWelcomeDesc}
        </p>
        <div style={{ width: '100%', display: 'flex', gap: 10, marginBottom: 12 }}>
          <div style={{
            flex: 1, background: '#1a1a1a', border: '1px solid #222',
            borderRadius: 12, padding: '10px 12px',
          }}>
            <p style={{ color: '#444', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 8px' }}>
              {t.obChooseLang}
            </p>
            <div style={{ display: 'flex', gap: 6 }}>
              {LANGS.map(({ code, label }) => (
                <button key={code} onClick={() => handleLangSelect(code)} style={{
                  padding: '5px 14px', borderRadius: 8,
                  border: lang === code ? '1.5px solid #e3e2dc' : '1.5px solid #2a2a2a',
                  background: lang === code ? 'rgba(227,226,220,0.08)' : 'transparent',
                  color: lang === code ? '#e3e2dc' : '#555',
                  fontSize: 12, fontWeight: lang === code ? 700 : 400,
                  cursor: 'pointer', fontFamily: 'inherit',
                  letterSpacing: '0.05em', transition: 'all 0.2s',
                }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div style={{
            flex: 1, background: '#1a1a1a', border: '1px solid #222',
            borderRadius: 12, padding: '10px 12px',
            display: 'flex', flexDirection: 'column',
          }}>
            <p style={{ color: '#444', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 8px' }}>
              {t.obNotifTitle}
            </p>
            {granted ? (
              <p style={{ color: '#4ade80', fontSize: 11, fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                {t.obNotifGranted}
              </p>
            ) : denied ? (
              <p style={{ color: '#f87171', fontSize: 11, margin: 0 }}>{t.obNotifDenied}</p>
            ) : (
              <button onClick={handleAllowNotif} disabled={requesting} style={{
                padding: '5px 10px', borderRadius: 8,
                background: 'transparent', border: '1.5px solid #2a2a2a',
                color: '#666', fontSize: 11, fontWeight: 600,
                cursor: requesting ? 'default' : 'pointer',
                fontFamily: 'inherit', opacity: requesting ? 0.6 : 1,
                display: 'flex', alignItems: 'center', gap: 5,
                alignSelf: 'flex-start',
              }}>
                <IconBell />
                {requesting ? '...' : t.obNotifAllow}
              </button>
            )}
          </div>
        </div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
          {features.map(({ Icon, title }, i) => (
            <div key={i} style={{
              background: '#1a1a1a', border: '1px solid #222',
              borderRadius: 10, padding: '9px 12px',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: '#222', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#666',
              }}>
                <Icon />
              </div>
              <p style={{ color: '#a8a79f', fontSize: 12, fontWeight: 500, margin: 0 }}>{title}</p>
            </div>
          ))}
        </div>

        <SliderButton label={t.obGetStarted} onConfirm={handleFinish} />

        {!granted && !denied && (
          <button onClick={handleFinish} style={{
            background: 'transparent', border: 'none',
            color: '#383838', fontSize: 12, cursor: 'pointer',
            fontFamily: 'inherit', marginTop: 10, padding: '4px 0',
          }}>
            {t.obNotifSkip}
          </button>
        )}
      </div>
    </div>
  )
}
