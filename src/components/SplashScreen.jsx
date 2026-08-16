import { useEffect, useState } from 'react'
import { translations } from '../lib/i18n'

export default function SplashScreen({ onDone }) {
  const [visible, setVisible] = useState(false)
  const [fading, setFading] = useState(false)

  const lang = localStorage.getItem('remindly_lang') || 'id'
  const tagline = translations[lang]?.splashTagline ?? translations.id.splashTagline

  useEffect(() => {
    const show = requestAnimationFrame(() => setVisible(true))
    const fadeTimer = setTimeout(() => setFading(true), 1500)
    const doneTimer = setTimeout(onDone, 2000)

    return () => {
      cancelAnimationFrame(show)
      clearTimeout(fadeTimer)
      clearTimeout(doneTimer)
    }
  }, [onDone])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#111111',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        opacity: fading ? 0 : 1,
        transition: fading ? 'opacity 0.5s ease' : 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 22,
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.88) translateY(10px)',
          transition: 'opacity 0.6s cubic-bezier(.22,1,.36,1), transform 0.6s cubic-bezier(.22,1,.36,1)',
        }}
      >
        <img
          src="/logo.png"
          alt="Remindly"
          style={{
            width: 80,
            height: 80,
            objectFit: 'contain',
          }}
        />

        <div style={{ textAlign: 'center' }}>
          <p style={{
            color: '#e3e2dc',
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: '-0.6px',
            lineHeight: 1,
            margin: 0,
            fontFamily: 'inherit',
          }}>
            Remindly
          </p>
          <p style={{
            color: '#666666',
            fontSize: 13,
            fontWeight: 400,
            marginTop: 7,
            letterSpacing: '0.05em',
            fontFamily: 'inherit',
          }}>
            {tagline}
          </p>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 64,
          display: 'flex',
          gap: 7,
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.4s 0.4s',
        }}
      >
        {[0, 1, 2].map(i => (
          <span
            key={i}
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: '#444',
              display: 'inline-block',
              animation: `rdot 1.3s ${i * 0.2}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes rdot {
          0%, 80%, 100% { background: #3a3a3a; transform: scale(1); }
          40% { background: #777; transform: scale(1.5); }
        }
      `}</style>
    </div>
  )
}
