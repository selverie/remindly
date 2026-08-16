import { useState, useEffect } from 'react'
import Home from './pages/Home'
import CalendarPage from './pages/CalendarPage'
import SettingsPage from './pages/SettingsPage'
import NotificationPage from './pages/NotificationPage'
import HelpPage from './pages/HelpPage'
import Nav from './components/Nav'
import SplashScreen from './components/SplashScreen'
import Onboarding from './components/Onboarding'
import { db } from './lib/db'
import { scheduleAllReminders, requestNotificationPermission } from './lib/notifications'
import { LangProvider } from './lib/LangContext'

function AppInner() {
  const [page, setPage] = useState('home')
  const [overlay, setOverlay] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [ready, setReady] = useState(false)
  const [onboarded, setOnboarded] = useState(() => !!localStorage.getItem('remindly_onboarded'))
  const [installPrompt, setInstallPrompt] = useState(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
      setShowInstallBanner(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setInstallPrompt(null)
      setShowInstallBanner(false)
    }
  }

  useEffect(() => {
    async function init() {
      if (onboarded) await requestNotificationPermission()
      const tasks = await db.tasks.filter(t => !t.completed).toArray()
      scheduleAllReminders(tasks)
    }
    init()
  }, [onboarded])

  if (!ready) {
    return <SplashScreen onDone={() => setReady(true)} />
  }

  if (!onboarded) {
    return <Onboarding onDone={() => setOnboarded(true)} />
  }

  if (overlay === 'notifications') {
    return (
      <div className="min-h-screen bg-[#161616]">
        <div className="max-w-app mx-auto min-h-screen bg-[#161616] font-sans text-ink antialiased">
          <NotificationPage onClose={() => setOverlay(null)} />
        </div>
      </div>
    )
  }
  if (overlay === 'help') {
    return (
      <div className="min-h-screen bg-[#161616]">
        <div className="max-w-app mx-auto min-h-screen bg-[#161616] font-sans text-ink antialiased">
          <HelpPage onClose={() => setOverlay(null)} />
        </div>
      </div>
    )
  }

  const refresh = () => setRefreshKey(k => k + 1)

  return (
    <div className="min-h-screen bg-[#161616]">
      <div className="max-w-app mx-auto min-h-screen bg-[#161616] font-sans text-ink antialiased relative">
        {showInstallBanner && (
          <div style={{
            position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
            width: 'calc(100% - 32px)', maxWidth: 420,
            background: '#1e1e1e', borderRadius: 16, padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
            boxShadow: '0 4px 24px rgba(0,0,0,0.5)', zIndex: 9999,
            border: '1px solid #2a2a2a'
          }}>
            <img src="/logo.png" alt="Remindly" style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p style={{ color: '#e3e2dc', fontSize: 14, fontWeight: 600, margin: 0 }}>Pasang Remindly</p>
              <p style={{ color: '#777', fontSize: 12, margin: '2px 0 0' }}>Install ke layar utama</p>
            </div>
            <button onClick={handleInstall} style={{
              background: '#e3e2dc', color: '#161616', border: 'none',
              borderRadius: 10, padding: '7px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer'
            }}>Install</button>
            <button onClick={() => setShowInstallBanner(false)} style={{
              background: 'none', border: 'none', color: '#555', cursor: 'pointer',
              padding: '4px', fontSize: 18, lineHeight: 1
            }}>×</button>
          </div>
        )}
        {page === 'home' && (
          <Home
            key={refreshKey}
            onRefresh={refresh}
            onOpenNotifications={() => setOverlay('notifications')}
            onOpenHelp={() => setOverlay('help')}
          />
        )}
        {page === 'calendar' && <CalendarPage key={refreshKey} />}
        {page === 'settings' && <SettingsPage />}
        <Nav current={page} onChange={setPage} />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <LangProvider>
      <AppInner />
    </LangProvider>
  )
}
