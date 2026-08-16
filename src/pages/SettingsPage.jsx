import { useState, useEffect } from 'react'
import { requestNotificationPermission } from '../lib/notifications'
import { db } from '../lib/db'
import { useLang } from '../lib/LangContext'

export default function SettingsPage({ installPrompt, onInstall }) {
  const { t, lang, setLang } = useLang()
  const [notifPermission, setNotifPermission] = useState('default')
  const [taskCount, setTaskCount] = useState(0)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const isInstalled = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true

  useEffect(() => {
    setNotifPermission(Notification?.permission || 'unsupported')
    db.tasks.count().then(setTaskCount)
  }, [])

  async function handleRequestNotif() {
    const result = await requestNotificationPermission()
    setNotifPermission(result)
  }

  async function handleClearData() {
    await db.tasks.clear()
    setTaskCount(0)
    setShowClearConfirm(false)
  }

  const notifLabel = {
    granted: t.allowed,
    denied: t.denied,
    default: t.notSet,
    unsupported: t.unsupported,
  }

  return (
    <div className="min-h-screen bg-[#161616] pb-24 px-4 pt-14">
      <h1 className="text-lg font-bold text-ink tracking-tight mb-6">{t.settings}</h1>

      <section className="mb-7">
        <h2 className="text-2xs font-bold text-ink-muted uppercase tracking-wider mb-3">{t.language}</h2>
        {(() => {
          const langs = [{ code: 'id', label: 'Indonesia' }, { code: 'en', label: 'English' }]
          const activeIdx = langs.findIndex(l => l.code === lang)
          return (
            <div className="relative flex bg-[#1e1e1e] rounded-xl p-1 shadow-sm">
              <span style={{
                position: 'absolute', top: 4, bottom: 4,
                left: `calc(4px + ${activeIdx} * (100% - 8px) / 2)`,
                width: 'calc((100% - 8px) / 2)',
                background: '#e3e2dc', borderRadius: 8,
                transition: 'left 0.28s cubic-bezier(0.34, 1.4, 0.64, 1)',
                pointerEvents: 'none', zIndex: 0,
              }} />
              {langs.map(({ code, label }) => (
                <button key={code} onClick={() => setLang(code)}
                  style={{ position: 'relative', zIndex: 1 }}
                  className={`flex-1 text-[13px] py-2.5 rounded-lg font-semibold transition-colors duration-150 ${lang === code ? 'text-[#161616]' : 'text-[#777] hover:text-[#e3e2dc]'}`}>
                  {label}
                </button>
              ))}
            </div>
          )
        })()}
      </section>

      <section className="mb-7">
        <h2 className="text-2xs font-bold text-ink-muted uppercase tracking-wider mb-3">{t.notifications}</h2>
        <div className="border border-border rounded-2xl p-4 bg-surface">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-ink">{t.pushNotification}</p>
              <p className="text-xs text-ink-muted mt-0.5">
                {t.notifStatus}: {notifLabel[notifPermission] || notifPermission}
              </p>
            </div>
            {notifPermission !== 'granted' && notifPermission !== 'denied' && notifPermission !== 'unsupported' && (
              <button
                onClick={handleRequestNotif}
                className="text-xs text-ink border border-border rounded-lg px-3 py-2 hover:border-ink-muted transition-colors font-semibold"
              >
                {t.allow}
              </button>
            )}
            {notifPermission === 'granted' && (
              <span className="text-xs text-emerald-400 font-semibold">✓ {t.active}</span>
            )}
            {notifPermission === 'denied' && (
              <span className="text-xs text-red-400 font-semibold">{t.blockedByBrowser}</span>
            )}
          </div>
        </div>
      </section>

      <section className="mb-7">
        <h2 className="text-2xs font-bold text-ink-muted uppercase tracking-wider mb-3">{t.data}</h2>
        <div className="border border-border rounded-2xl overflow-hidden bg-surface">
          <div className="px-4 py-3.5 flex items-center justify-between border-b border-border">
            <span className="text-sm font-semibold text-ink">{t.totalSavedTasks}</span>
            <span className="text-sm font-semibold text-ink-soft">{taskCount}</span>
          </div>
          <div className="px-4 py-3.5">
            {!showClearConfirm ? (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="text-sm font-semibold text-red-400 hover:text-red-300 transition-colors"
              >
                {t.clearAllData}
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-xs text-ink-soft flex-1">{t.confirmClear}</span>
                <button onClick={handleClearData} className="text-xs text-red-400 font-bold">{t.delete}</button>
                <button onClick={() => setShowClearConfirm(false)} className="text-xs text-ink-muted font-medium">{t.cancel}</button>
              </div>
            )}
          </div>
        </div>
      </section>

      {!isInstalled && (
        <section className="mb-7">
          <h2 className="text-2xs font-bold text-ink-muted uppercase tracking-wider mb-3">
            {lang === 'id' ? 'INSTALL APLIKASI' : 'INSTALL APP'}
          </h2>
          <div className="border border-border rounded-2xl p-4 bg-surface">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink">
                  {lang === 'id' ? 'Pasang di Homescreen' : 'Add to Home Screen'}
                </p>
                <p className="text-xs text-ink-muted mt-0.5">
                  {installPrompt
                    ? (lang === 'id' ? 'Siap diinstall ke perangkat' : 'Ready to install on device')
                    : (lang === 'id' ? 'Sudah diinstall atau buka lewat Chrome' : 'Already installed or open via Chrome')}
                </p>
              </div>
              {installPrompt ? (
                <button
                  onClick={onInstall}
                  className="flex-shrink-0 text-sm font-bold text-[#161616] bg-[#e3e2dc] rounded-xl px-4 py-2 active:scale-95 transition-transform"
                >
                  Install
                </button>
              ) : (
                <span className="text-xs text-emerald-400 font-semibold">✓</span>
              )}
            </div>
          </div>
        </section>
      )}

      <section>
        <h2 className="text-2xs font-bold text-ink-muted uppercase tracking-wider mb-3">{t.about}</h2>
        <div className="border border-border rounded-2xl px-4 py-4 bg-surface">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0">
              <img src="/logo.png" alt="Remindly" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-bold text-ink">Remindly</p>
              <p className="text-xs text-ink-muted">v1.0.0 · PWA</p>
            </div>
          </div>
          <p className="text-xs text-ink-muted leading-relaxed">{t.appDesc}</p>
        </div>
      </section>
    </div>
  )
}
