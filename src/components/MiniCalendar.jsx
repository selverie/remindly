import { useState, useEffect } from 'react'
import { getDaysInMonth, getFirstDayOfMonth, formatMonthYear, todayStr } from '../lib/dateUtils'
import { db } from '../lib/db'

const DAYS = ['M', 'S', 'S', 'R', 'K', 'J', 'S']

export default function MiniCalendar({ selectedDate, onSelectDate }) {
  const today = todayStr()
  const [year, setYear] = useState(() => new Date().getFullYear())
  const [month, setMonth] = useState(() => new Date().getMonth())
  const [taskDates, setTaskDates] = useState(new Set())

  useEffect(() => {
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`
    db.tasks
      .filter(t => t.due_date && t.due_date.startsWith(monthStr))
      .toArray()
      .then(tasks => setTaskDates(new Set(tasks.map(t => t.due_date))))
  }, [year, month])

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const daysInMonth = getDaysInMonth(year, month)
  const rawFirst = getFirstDayOfMonth(year, month)
  const firstDay = rawFirst === 0 ? 6 : rawFirst - 1

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="text-ink-muted hover:text-ink p-1 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <span className="text-xs font-bold text-ink">{formatMonthYear(year, month)}</span>
        <button onClick={nextMonth} className="text-ink-muted hover:text-ink p-1 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d, i) => (
          <div key={i} className="text-center text-2xs text-ink-muted py-1 font-semibold">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isToday = dateStr === today
          const isSelected = dateStr === selectedDate
          const hasTask = taskDates.has(dateStr)

          return (
            <button
              key={i}
              onClick={() => onSelectDate(dateStr === selectedDate ? null : dateStr)}
              className={`relative flex flex-col items-center justify-center h-8 rounded-lg text-xs transition-all font-semibold ${
                isSelected
                  ? 'bg-[#e3e2dc] text-[#161616]'
                  : isToday
                  ? 'border border-[#e3e2dc] text-ink'
                  : 'text-ink-soft hover:bg-surface'
              }`}
            >
              {day}
              {hasTask && !isSelected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-ink-muted" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
