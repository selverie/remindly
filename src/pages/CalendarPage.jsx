import { useState, useEffect } from 'react'
import MiniCalendar from '../components/MiniCalendar'
import TaskCard from '../components/TaskCard'
import EmptyState from '../components/EmptyState'
import { getTasksByDate, getUpcomingTasks } from '../lib/db'
import { todayStr, formatDate } from '../lib/dateUtils'
import { useLang } from '../lib/LangContext'

export default function CalendarPage() {
  const { lang } = useLang()
  const [selectedDate, setSelectedDate] = useState(todayStr())
  const [tasks, setTasks] = useState([])
  const [upcomingTasks, setUpcomingTasks] = useState([])
  const [tab, setTab] = useState('date') // 'date' | 'upcoming'
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (selectedDate) {
      getTasksByDate(selectedDate).then(t =>
        setTasks(t.sort((a, b) => (a.due_time || '').localeCompare(b.due_time || '')))
      )
    } else {
      setTasks([])
    }
  }, [selectedDate, refreshKey])

  useEffect(() => {
    if (tab === 'upcoming') {
      getUpcomingTasks().then(t => setUpcomingTasks(t.filter(t => !t.completed)))
    }
  }, [tab, refreshKey])

  function handleUpdate() {
    setRefreshKey(k => k + 1)
  }

  const tabLabel = {
    date: lang === 'en' ? 'Selected Date' : 'Tanggal Dipilih',
    upcoming: lang === 'en' ? 'Upcoming' : 'Mendatang',
  }

  const groupedUpcoming = upcomingTasks.reduce((acc, task) => {
    const key = task.due_date || 'nodate'
    if (!acc[key]) acc[key] = []
    acc[key].push(task)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-[#161616] pb-24 px-4 pt-14">
      <h1 className="text-lg font-bold text-ink tracking-tight mb-5">
        {lang === 'en' ? 'Calendar' : 'Kalender'}
      </h1>

      <div className="border border-border rounded-2xl p-4 mb-5 bg-surface">
        <MiniCalendar
          selectedDate={selectedDate}
          onSelectDate={d => {
            setSelectedDate(d || todayStr())
            setTab('date')
          }}
        />
      </div>

      {(() => {
        const tabs = ['date', 'upcoming']
        const activeIdx = tabs.indexOf(tab)
        return (
          <div className="relative flex bg-[#1e1e1e] rounded-xl p-1 shadow-sm mb-4">
            <span style={{
              position: 'absolute', top: 4, bottom: 4,
              left: `calc(4px + ${activeIdx} * (100% - 8px) / 2)`,
              width: 'calc((100% - 8px) / 2)',
              background: '#e3e2dc', borderRadius: 8,
              transition: 'left 0.28s cubic-bezier(0.34, 1.4, 0.64, 1)',
              pointerEvents: 'none', zIndex: 0,
            }} />
            {tabs.map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ position: 'relative', zIndex: 1 }}
                className={`flex-1 text-[13px] py-1.5 rounded-lg font-medium transition-colors duration-150 ${tab === t ? 'text-[#161616]' : 'text-[#777] hover:text-[#e3e2dc]'}`}>
                {tabLabel[t]}
              </button>
            ))}
          </div>
        )
      })()}

      {tab === 'date' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-ink">{formatDate(selectedDate)}</h2>
            <span className="text-2xs text-ink-muted">
              {tasks.filter(t => !t.completed).length} {lang === 'en' ? 'active' : 'aktif'}
            </span>
          </div>
          {tasks.length === 0 ? (
            <EmptyState label={lang === 'en' ? 'No tasks on this date' : 'Tidak ada tugas di tanggal ini'} />
          ) : (
            <div className="space-y-2">
              {tasks.map(task => (
                <TaskCard key={task.id} task={task} onUpdate={handleUpdate} />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'upcoming' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-ink">
              {lang === 'en' ? 'Upcoming Tasks' : 'Tugas Mendatang'}
            </h2>
            <span className="text-2xs text-ink-muted">
              {upcomingTasks.length} {lang === 'en' ? 'tasks' : 'tugas'}
            </span>
          </div>
          {upcomingTasks.length === 0 ? (
            <EmptyState label={lang === 'en' ? 'No upcoming tasks' : 'Tidak ada tugas mendatang'} />
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedUpcoming).sort(([a], [b]) => a.localeCompare(b)).map(([date, dateTasks]) => (
                <div key={date}>
                  <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-widest mb-2 px-1">
                    {formatDate(date)}
                  </p>
                  <div className="space-y-2">
                    {dateTasks.map(task => (
                      <TaskCard key={task.id} task={task} onUpdate={handleUpdate} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}