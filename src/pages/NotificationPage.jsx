import { useState, useEffect } from 'react'
import { getTodayTasks, getUpcomingTasks } from '../lib/db'
import { requestNotificationPermission } from '../lib/notifications'
import { useLang } from '../lib/LangContext'

function TagBadge({ label, color }) {
  const colors = {
    overdue: 'bg-red-900/40 text-red-400',
    today: 'bg-orange-900/40 text-orange-400',
    upcoming: 'bg-blue-900/40 text-blue-400',
  }
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colors[color]}`}>
      {label}
    </span>
  )
}

export default function NotificationPage({ onClose }) {
  const { t } = useLang()
  const [todayTasks, setTodayTasks] = useState([])
  const [upcomingTasks, setUpcomingTasks] = useState([])
  const [permission, setPermission] = useState(Notification?.permission || 'default')

  useEffect(() => {
    getTodayTasks().then(setTodayTasks)
    getUpcomingTasks().then(setUpcomingTasks)
  }, [])

  async function handleEnable() {
    const result = await requestNotificationPermission()
    setPermission(result)
  }

  const overdue = todayTasks.filter(t => {
    if (t.completed) return false
    if (!t.due_time) return false
    const [h, m] = t.due_time.split(':').map(Number)
    const taskDate = new Date()
    taskDate.setHours(h, m, 0, 0)
    return taskDate < new Date()
  })

  const dueToday = todayTasks.filter(t => !t.completed && !overdue.includes(t))
  const upcoming3 = upcomingTasks.filter(t => !t.completed).slice(0, 5)
  const hasAny = overdue.length > 0 || dueToday.length > 0 || upcoming3.length > 0

  function TaskRow({ task, type }) {
    return (
      <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
          type === 'overdue' ? 'bg-red-400' :
          type === 'today' ? 'bg-orange-400' : 'bg-blue-400'
        }`} />
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-ink truncate">{task.title}</p>
          {task.due_time && <p className="text-[11px] text-ink-muted mt-0.5">{task.due_time}</p>}
          {task.due_date && !task.due_time && <p className="text-[11px] text-ink-muted mt-0.5">{task.due_date}</p>}
        </div>
        <TagBadge
          label={type === 'overdue' ? t.notifOverdue : type === 'today' ? t.notifTodayDue : t.notifUpcoming}
          color={type}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#161616]">
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <button
          onClick={onClose}
          className="btn-ripple w-9 h-9 rounded-full bg-[#1e1e1e] flex items-center justify-center shadow-sm active:scale-95 transition-transform"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <h2 className="text-[18px] font-bold text-ink">{t.notifPageTitle}</h2>
      </div>

      <div className="px-4 space-y-4">
        {permission !== 'granted' && (
          <div className="bg-orange-900/20 border border-orange-800/40 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 bg-orange-900/40 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fb923c" strokeWidth="2" strokeLinecap="round">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-bold text-orange-400">{t.notifEnable}</p>
              <p className="text-[11px] text-orange-500/80 mt-0.5 leading-relaxed">{t.notifDisabledHint}</p>
              {permission !== 'denied' && (
                <button
                  onClick={handleEnable}
                  className="mt-2 text-[12px] font-bold text-[#161616] bg-orange-400 px-3 py-1.5 rounded-lg"
                >
                  {t.allow}
                </button>
              )}
            </div>
          </div>
        )}

        {hasAny ? (
          <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            {overdue.length > 0 && (
              <div className="px-4">{overdue.map(task => <TaskRow key={task.id} task={task} type="overdue" />)}</div>
            )}
            {dueToday.length > 0 && (
              <div className="px-4">{dueToday.map(task => <TaskRow key={task.id} task={task} type="today" />)}</div>
            )}
            {upcoming3.length > 0 && (
              <div className="px-4">{upcoming3.map(task => <TaskRow key={task.id} task={task} type="upcoming" />)}</div>
            )}
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-2xl p-8 flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 bg-surface-soft rounded-full flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.5" strokeLinecap="round">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
            </div>
            <div>
              <p className="text-[15px] font-bold text-ink">{t.notifEmpty}</p>
              <p className="text-[12px] text-ink-muted mt-1 leading-relaxed">{t.notifEmptyDesc}</p>
            </div>
          </div>
        )}
      </div>

      <div className="h-24" />
    </div>
  )
}
