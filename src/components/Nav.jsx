import { ClipboardCheck, CalendarDays, Settings2 } from 'lucide-react'
import { useState, useEffect } from 'react'

const leftItems = [
  { id: 'home',     Icon: ClipboardCheck },
  { id: 'calendar', Icon: CalendarDays },
]

export default function Nav({ current, onChange }) {
  const settingsActive = current === 'settings'
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const onFocusIn = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        setHidden(true)
      }
    }
    const onFocusOut = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        setTimeout(() => setHidden(false), 100)
      }
    }

    document.addEventListener('focusin', onFocusIn)
    document.addEventListener('focusout', onFocusOut)
    return () => {
      document.removeEventListener('focusin', onFocusIn)
      document.removeEventListener('focusout', onFocusOut)
    }
  }, [])

  if (hidden) return null

  const leftActiveIdx = leftItems.findIndex(i => i.id === current)
  const indicatorX = leftActiveIdx >= 0 ? leftActiveIdx * 48 : null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-app mx-auto px-4 pb-6 pt-2 flex items-center justify-between">
        <div className="relative flex items-center bg-[#1a1a1a] rounded-full p-[5px] shadow-xl gap-1">
          {indicatorX !== null && (
            <span
              style={{
                position: 'absolute',
                top: 5,
                left: 5 + indicatorX,
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: '#e3e2dc',
                transition: 'left 0.32s cubic-bezier(0.34, 1.4, 0.64, 1)',
                pointerEvents: 'none',
                zIndex: 0,
              }}
            />
          )}

          {leftItems.map(({ id, Icon }) => {
            const active = current === id
            return (
              <button
                key={id}
                onClick={() => onChange(id)}
                style={{ position: 'relative', zIndex: 1 }}
                className={`flex items-center justify-center rounded-full w-11 h-11 transition-colors duration-150 ${
                  active ? 'text-[#1a1a1a]' : 'text-[#555] hover:text-[#999]'
                }`}
              >
                <Icon size={18} strokeWidth={2} />
              </button>
            )
          })}
        </div>

        <div className="relative flex items-center bg-[#1a1a1a] rounded-full p-[5px] shadow-xl">
          {settingsActive && (
            <span
              style={{
                position: 'absolute',
                inset: 5,
                borderRadius: '50%',
                background: '#e3e2dc',
                pointerEvents: 'none',
                zIndex: 0,
                animation: 'nav-pop 0.32s cubic-bezier(0.34,1.56,0.64,1) both',
              }}
            />
          )}
          <button
            onClick={() => onChange('settings')}
            style={{ position: 'relative', zIndex: 1 }}
            className={`flex items-center justify-center rounded-full w-11 h-11 transition-colors duration-150 ${
              settingsActive ? 'text-[#1a1a1a]' : 'text-[#555] hover:text-[#999]'
            }`}
          >
            <Settings2 size={18} strokeWidth={2} />
          </button>
        </div>

      </div>
    </nav>
  )
}
