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
  const [swLogs, setSwLogs] = useState([])
  const [showSwLogs, setShowSwLogs] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
  const [ready, setReady] = useState(isStandalone)
  const [onboarded, setOnboarded] = useState(() => !!localStorage.getItem('remindly_onboarded'))
  const [installPrompt, setInstallPrompt] = useState(null)
  // Banner hanya muncul sekali - jika sudah pernah di-dismiss, tidak muncul lagi
  const [showInstallBanner, setShowInstallBanner] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem('remindly_install_dismissed')
    const handler = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
      // Hanya tampilkan banner jika belum pernah di-dismiss
      if (!dismissed) setShowInstallBanner(true)
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

  const dismissBanner = () => {
    setShowInstallBanner(false)
    localStorage.setItem('remindly_install_dismissed', '1')
  }

  useEffect(() => {
    async function init() {
      if (onboarded) await requestNotificationPermission()
      const tasks = await db.tasks.filter(t => !t.completed).toArray()
      scheduleAllReminders(tasks)
    }
    init()
  }, [onboarded])

  // Debug: tangkap log dari Service Worker
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    const handler = (event) => {
      if (event.data?.type === 'SW_LOG') {
        setSwLogs(prev => [...prev.slice(-49), `${new Date().toLocaleTimeString('id-ID')} ${event.data.msg}`])
      }
    }
    navigator.serviceWorker.addEventListener('message', handler)
    return () => navigator.serviceWorker.removeEventListener('message', handler)
  }, [])

  // Tangkap log dari main thread (notifications.js dll)
  useEffect(() => {
    const handler = (e) => {
      setSwLogs(prev => [...prev.slice(-49), `${new Date().toLocaleTimeString('id-ID')} ${e.detail}`])
    }
    window.addEventListener('app_log', handler)
    return () => window.removeEventListener('app_log', handler)
  }, [])

  if (!ready) return <SplashScreen onDone={() => setReady(true)} />
  if (!onboarded) return <Onboarding onDone={() => setOnboarded(true)} />

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
            <button onClick={dismissBanner} style={{
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
        {page === 'settings' && (
          <SettingsPage installPrompt={installPrompt} onInstall={handleInstall} />
        )}
        <Nav current={page} onChange={setPage} />

        {/* Debug Panel SW - ketuk 5x pojok kiri bawah untuk buka */}
        <div
          onDoubleClick={() => setShowSwLogs(v => !v)}
          style={{ position: 'fixed', bottom: 0, left: 0, width: 40, height: 40, zIndex: 99999, opacity: 0 }}
        />
        {showSwLogs && (
          <div style={{
            position: 'fixed', inset: 0, background: '#0d0d0d', zIndex: 99998,
            display: 'flex', flexDirection: 'column', fontFamily: 'monospace'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #222' }}>
              <span style={{ color: '#e3e2dc', fontWeight: 700, fontSize: 14 }}>SW Debug Log</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setSwLogs([])} style={{ background: '#333', color: '#aaa', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>Clear</button>
                <button onClick={() => setShowSwLogs(false)} style={{ background: '#333', color: '#aaa', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>Tutup</button>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
              {swLogs.length === 0
                ? <p style={{ color: '#555', fontSize: 12 }}>Belum ada log. Buka app, tambah task, atau tunggu reminder.</p>
                : swLogs.map((log, i) => (
                  <p key={i} style={{
                    color: log.includes('❌') ? '#f87171' : log.includes('✅') ? '#4ade80' : '#aaa',
                    fontSize: 11, margin: '2px 0', lineHeight: 1.5, wordBreak: 'break-all'
                  }}>{log}</p>
                ))
              }
            </div>
          </div>
        )}
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
