import { useState, useEffect, useCallback, useRef } from 'react'
import InputBar from '../components/InputBar'
import TaskCard from '../components/TaskCard'
import EmptyState from '../components/EmptyState'
import { getTodayTasks, getUpcomingTasks, getInboxTasks } from '../lib/db'
import { formatDate } from '../lib/dateUtils'
import { useLang } from '../lib/LangContext'

function getGreeting(t) {
  const h = new Date().getHours()
  if (h < 11) return t.greetMorning
  if (h < 15) return t.greetDay
  if (h < 18) return t.greetAfternoon
  return t.greetEvening
}

function getTodayLabel() {
  return new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

const VIEW_ORDER = { home: 0, add: 1, search: 1, today: 1, upcoming: 1 }

function spawnRipple(e, el) {
  if (!el) return
  const rect = el.getBoundingClientRect()
  const x = (e.clientX ?? rect.left + rect.width / 2) - rect.left
  const y = (e.clientY ?? rect.top + rect.height / 2) - rect.top
  const r = document.createElement('span')
  r.className = 'ripple-splash'
  r.style.cssText = `left:${x}px;top:${y}px;`
  el.appendChild(r)
  r.addEventListener('animationend', () => r.remove())
}

function StatSkeleton() {
  return (
    <div className="flex-1 bg-[#1e1e1e] rounded-xl px-3 py-2.5 shadow-sm text-center animate-pulse">
      <div className="h-5 w-6 bg-[#2e2e2e] rounded mx-auto mb-1" />
      <div className="h-2.5 w-10 bg-[#2e2e2e] rounded mx-auto" />
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="bg-[#1e1e1e] rounded-2xl p-4 animate-pulse">
      <div className="w-5 h-5 bg-[#2e2e2e] rounded-full mb-3" />
      <div className="h-3.5 w-20 bg-[#2e2e2e] rounded mb-1.5" />
      <div className="h-2.5 w-16 bg-[#2e2e2e] rounded" />
    </div>
  )
}

export default function Home({ onRefresh, onOpenNotifications, onOpenHelp }) {
  const { t } = useLang()
  const [todayTasks, setTodayTasks] = useState([])
  const [upcoming, setUpcoming] = useState([])
  const [inbox, setInbox] = useState([])
  const [view, setView] = useState('home')
  const [prevView, setPrevView] = useState('home')
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const QUICK_ACTIONS = [
    {
      id: 'today',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <path d="M9 16l2 2 4-4" />
        </svg>
      ),
      label: t.today,
      desc: t.todayDesc,
    },
    {
      id: 'upcoming',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      label: t.upcoming,
      desc: t.upcomingDesc,
    },
    {
      id: 'add',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      ),
      label: t.addTask,
      desc: t.addTaskDesc,
    },
    {
      id: 'done',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
      label: t.done,
      desc: t.doneDesc,
    },
  ]

  const loadData = useCallback(async () => {
    setLoading(true)
    const [td, up, ib] = await Promise.all([getTodayTasks(), getUpcomingTasks(), getInboxTasks()])
    setTodayTasks(td)
    setUpcoming(up)
    setInbox(ib)
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleUpdate = () => { loadData(); onRefresh?.() }

  const navigateTo = (nextView, e) => {
    if (e?.currentTarget) spawnRipple(e, e.currentTarget)
    setPrevView(view)
    setView(nextView)
  }

  const goBack = (e) => {
    if (e?.currentTarget) spawnRipple(e, e.currentTarget)
    setPrevView(view)
    setView('home')
  }

  function applyFilter(tasks) {
    let list = tasks
    if (search) list = list.filter(t => t.title?.toLowerCase().includes(search.toLowerCase()))
    if (filter === 'active') list = list.filter(t => !t.completed)
    if (filter === 'done') list = list.filter(t => t.completed)
    return list
  }

  const upcomingByDate = upcoming.reduce((acc, task) => {
    const key = task.due_date
    if (!acc[key]) acc[key] = []
    acc[key].push(task)
    return acc
  }, {})

  const todayCount = todayTasks.filter(t => !t.completed).length
  const totalUpcoming = upcoming.filter(t => !t.completed).length
  const doneCount = [...todayTasks, ...upcoming, ...inbox].filter(t => t.completed).length

  const slideDir = (VIEW_ORDER[view] ?? 0) > (VIEW_ORDER[prevView] ?? 0)
    ? 'page-slide-right' : VIEW_ORDER[view] < VIEW_ORDER[prevView]
    ? 'page-slide-left' : 'page-fade-up'

  const pageClass = `min-h-screen bg-[#161616] ${slideDir}`

  const STATS = [
    { label: t.activeToday, val: todayCount, color: '#e3e2dc', target: 'today', filterVal: 'active' },
    { label: t.upcomingStat, val: totalUpcoming, color: '#888', target: 'upcoming', filterVal: 'active' },
    { label: t.doneStat, val: doneCount, color: '#666', target: 'today', filterVal: 'done' },
  ]

  if (view === 'home') {
    return (
      <div className={pageClass}>
        <div className="flex items-center justify-between px-5 pt-10 pb-6">
          <button
            onClick={onOpenHelp}
            className="btn-ripple w-9 h-9 rounded-full bg-[#1e1e1e] flex items-center justify-center shadow-sm active:scale-95 transition-transform"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </button>

          <div className="relative">
            <button
              onClick={onOpenNotifications}
              className="btn-ripple w-9 h-9 rounded-full bg-[#1e1e1e] flex items-center justify-center shadow-sm active:scale-95 transition-transform"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5" strokeLinecap="round">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
            </button>
            {(todayCount + totalUpcoming) > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#4f8ef7] rounded-full text-white text-[9px] flex items-center justify-center font-semibold">
                {Math.min(todayCount + totalUpcoming, 9)}
              </span>
            )}
          </div>
        </div>

        <div className="px-5 mb-9 mt-4">
          <p className="text-[13px] text-[#555] font-normal leading-none mb-1">{getTodayLabel()}</p>
          <p className="text-[17px] text-[#777] font-normal leading-snug mb-2">{getGreeting(t)}</p>
          <h1 className="text-[32px] font-bold text-[#e3e2dc] leading-[1.15] tracking-tight">
            {t.heroTitle.split('\n').map((line, i) => (
              <span key={i}>{line}{i === 0 && <br />}</span>
            ))}
          </h1>
        </div>

        <div className="px-5 grid grid-cols-2 gap-3 mb-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
            : QUICK_ACTIONS.map((action, i) => (
              <button
                key={action.id}
                onClick={(e) => {
                  if (action.id === 'add') navigateTo('add', e)
                  else if (action.id === 'today') navigateTo('today', e)
                  else if (action.id === 'upcoming') navigateTo('upcoming', e)
                  else if (action.id === 'done') { setFilter('done'); navigateTo('today', e) }
                }}
                style={{ animationDelay: `${i * 0.04}s` }}
                className="btn-ripple action-card card-in bg-[#1e1e1e] rounded-2xl p-4 text-left shadow-sm"
              >
                <div className="text-[#666] mb-2.5">{action.icon}</div>
                <p className="text-[15px] font-semibold text-[#e3e2dc]">{action.label}</p>
                <p className="text-[12px] text-[#777] font-normal mt-0.5 truncate">{action.desc}</p>
              </button>
            ))
          }
        </div>

        <div className="px-5">
          <div className="bg-[#1e1e1e] rounded-2xl flex items-center px-4 py-3 shadow-sm gap-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); if (e.target.value) navigateTo('search') }}
              placeholder={t.searchPlaceholder}
              className="flex-1 text-[14px] text-[#e3e2dc] bg-transparent outline-none placeholder:text-[#666] font-light"
            />
          </div>
        </div>

        <div className="px-5 mt-4 flex gap-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <StatSkeleton key={i} />)
            : STATS.map(s => (
              <button
                key={s.label}
                onClick={(e) => {
                  setFilter(s.filterVal)
                  navigateTo(s.target, e)
                }}
                className="btn-ripple flex-1 bg-[#1e1e1e] rounded-xl px-3 py-2.5 shadow-sm text-center active:scale-95 transition-transform"
              >
                <p className="text-[18px] font-bold" style={{ color: s.color }}>{s.val}</p>
                <p className="text-[10px] text-[#777] font-normal mt-0.5 leading-tight">{s.label}</p>
              </button>
            ))
          }
        </div>

        <div className="h-24" />
      </div>
    )
  }

  if (view === 'add') {
    return (
      <div className={pageClass}>
        <div className="px-5 pt-12 pb-4 flex items-center gap-3">
          <button onClick={goBack} className="btn-ripple w-9 h-9 rounded-full bg-[#1e1e1e] flex items-center justify-center shadow-sm active:scale-95 transition-transform">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          </button>
          <h2 className="text-[18px] font-bold text-[#e3e2dc]">{t.addTask}</h2>
        </div>
        <div className="bg-[#1e1e1e] mx-4 rounded-2xl shadow-sm overflow-hidden">
          <InputBar onTaskAdded={() => { handleUpdate(); navigateTo('today') }} />
        </div>
        <div className="h-24" />
      </div>
    )
  }

  if (view === 'search') {
    const allTasks = [...inbox, ...todayTasks, ...upcoming]
    const results = applyFilter(allTasks)
    return (
      <div className={pageClass}>
        <div className="px-5 pt-12 pb-4 flex items-center gap-3">
          <button onClick={(e) => { goBack(e); setSearch('') }} className="btn-ripple w-9 h-9 rounded-full bg-[#1e1e1e] flex items-center justify-center shadow-sm active:scale-95 transition-transform">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          </button>
          <div className="flex-1 bg-[#1e1e1e] rounded-xl flex items-center px-3 py-2 shadow-sm gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input autoFocus type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t.searchPlaceholder} className="flex-1 text-[14px] text-[#e3e2dc] bg-transparent outline-none placeholder:text-[#666] font-light" />
          </div>
        </div>
        <div className="px-4">
          {results.length === 0
            ? <EmptyState label={t.noTaskFound} />
            : <div className="space-y-2">{results.map(task => <TaskCard key={task.id} task={task} onUpdate={handleUpdate} />)}</div>
          }
        </div>
        <div className="h-24" />
      </div>
    )
  }

  const isUpcomingView = view === 'upcoming'
  const title = isUpcomingView ? t.upcomingSection : t.todaySection
  const todayFiltered = applyFilter(todayTasks)
  const inboxFiltered = applyFilter(inbox)

  return (
    <div className={pageClass}>
      <div className="px-5 pt-12 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="btn-ripple w-9 h-9 rounded-full bg-[#1e1e1e] flex items-center justify-center shadow-sm active:scale-95 transition-transform">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          </button>
          <div>
            <h2 className="text-[20px] font-bold text-[#e3e2dc] leading-tight">{title}</h2>
            <p className="text-[12px] text-[#777] font-normal">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>
        <button onClick={(e) => navigateTo('add', e)} className="btn-ripple w-9 h-9 rounded-full bg-[#e3e2dc] flex items-center justify-center active:scale-95 transition-transform">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#161616" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>

      <div className="px-5 mb-4">
        {(() => {
          const tabs = [['all', t.all], ['active', t.active], ['done', t.doneStat]]
          const activeIdx = tabs.findIndex(([id]) => id === filter)
          return (
            <div className="relative flex bg-[#1e1e1e] rounded-xl p-1 shadow-sm">
              <span style={{
                position: 'absolute', top: 4, bottom: 4,
                left: `calc(4px + ${activeIdx} * (100% - 8px) / 3)`,
                width: 'calc((100% - 8px) / 3)',
                background: '#e3e2dc', borderRadius: 8,
                transition: 'left 0.28s cubic-bezier(0.34, 1.4, 0.64, 1)',
                pointerEvents: 'none', zIndex: 0,
              }} />
              {tabs.map(([id, label]) => (
                <button key={id} onClick={() => setFilter(id)}
                  style={{ position: 'relative', zIndex: 1 }}
                  className={`flex-1 text-[13px] py-1.5 rounded-lg font-medium transition-colors duration-150 ${filter === id ? 'text-[#161616]' : 'text-[#777] hover:text-[#e3e2dc]'}`}>
                  {label}
                </button>
              ))}
            </div>
          )
        })()}
      </div>

      <div className="px-4 space-y-5">
        {!isUpcomingView && (
          <>
            {inboxFiltered.length > 0 && (
              <section>
                <p className="text-[11px] font-semibold text-[#666] uppercase tracking-widest mb-2 px-1">{t.noDate}</p>
                <div className="space-y-2">{inboxFiltered.map(task => <TaskCard key={task.id} task={task} onUpdate={handleUpdate} />)}</div>
              </section>
            )}
            <section>
              <p className="text-[11px] font-semibold text-[#666] uppercase tracking-widest mb-2 px-1">{t.todaySection}</p>
              {todayFiltered.length === 0
                ? <EmptyState label={filter === 'done' ? t.emptyDoneToday : t.emptyToday} />
                : <div className="space-y-2">{todayFiltered.map(task => <TaskCard key={task.id} task={task} onUpdate={handleUpdate} />)}</div>
              }
            </section>
          </>
        )}

        {(isUpcomingView || view === 'today') && Object.keys(upcomingByDate).length > 0 && (
          <section>
            {!isUpcomingView && <p className="text-[11px] font-semibold text-[#666] uppercase tracking-widest mb-2 px-1">{t.upcomingSection}</p>}
            <div className="space-y-5">
              {Object.entries(upcomingByDate).map(([date, tasks]) => {
                const filtered = applyFilter(tasks)
                if (filtered.length === 0) return null
                return (
                  <div key={date}>
                    <p className="text-[12px] text-[#777] font-medium mb-2 px-1">{formatDate(date)}</p>
                    <div className="space-y-2">{filtered.map(task => <TaskCard key={task.id} task={task} onUpdate={handleUpdate} />)}</div>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </div>

      <div className="h-24" />
    </div>
  )
}
