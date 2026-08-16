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
      <div className="max-w-app mx-auto min-h-screen bg-[#161616] font-sans text-ink antialiased">
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
