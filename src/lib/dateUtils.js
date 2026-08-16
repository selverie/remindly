export function localDateStr(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayStr() {
  return localDateStr()
}

export function formatDate(dateStr) {
  if (!dateStr) return null
  const today = todayStr()
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = localDateStr(tomorrow)

  if (dateStr === today) return 'Hari ini'
  if (dateStr === tomorrowStr) return 'Besok'

  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function formatTime(timeStr) {
  if (!timeStr) return null
  const [h, m] = timeStr.split(':')
  return `${h}:${m}`
}

export function isOverdue(dateStr, timeStr) {
  if (!dateStr) return false
  const now = new Date()
  if (timeStr) {
    const dt = new Date(`${dateStr}T${timeStr}:00`)
    return dt < now
  }
  return dateStr < todayStr()
}

export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

export function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay()
}

export function formatMonthYear(year, month) {
  return new Date(year, month, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
}

export function isSameDate(a, b) {
  return a === b
}

export const PRIORITY_LABEL = {
  high: 'Tinggi',
  medium: 'Sedang',
  low: 'Rendah'
}

export const CATEGORY_ICON_PATH = {
  meeting: 'M2 3.5A1.5 1.5 0 013.5 2h9A1.5 1.5 0 0114 3.5v2a.5.5 0 01-1 0v-2a.5.5 0 00-.5-.5h-9a.5.5 0 00-.5.5v9a.5.5 0 00.5.5h3a.5.5 0 010 1h-3A1.5 1.5 0 012 12.5v-9zM5 5.5a.5.5 0 01.5-.5h5a.5.5 0 010 1h-5a.5.5 0 01-.5-.5zm0 2.5a.5.5 0 01.5-.5h2a.5.5 0 010 1h-2A.5.5 0 015 8zm6 1a3 3 0 110 6 3 3 0 010-6zm0 1a2 2 0 100 4 2 2 0 000-4zm0 .75a.75.75 0 01.75.75v.69l.47.47a.75.75 0 01-1.06 1.06l-.66-.66A.75.75 0 0110.25 12v-1.5a.75.75 0 01.75-.75z',
  tugas: 'M3.5 2A1.5 1.5 0 002 3.5v9A1.5 1.5 0 003.5 14h9a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0012.5 2h-9zM3 3.5a.5.5 0 01.5-.5h9a.5.5 0 01.5.5v9a.5.5 0 01-.5.5h-9a.5.5 0 01-.5-.5v-9zm2 2a.5.5 0 000 1h6a.5.5 0 000-1H5zm0 2.5a.5.5 0 000 1h6a.5.5 0 000-1H5zM5 11a.5.5 0 000 1h4a.5.5 0 000-1H5z',
  belanja: 'M2.5 2a.5.5 0 000 1h.86l1.67 6.68A1.5 1.5 0 006.5 11h5a1.5 1.5 0 001.45-1.12l.9-3.6A.5.5 0 0013.37 5H4.64l-.36-1.45A.5.5 0 003.8 3H2.5a.5.5 0 00-.5.5V2zM6.5 12a1 1 0 100 2 1 1 0 000-2zm5 0a1 1 0 100 2 1 1 0 000-2z',
  kesehatan: 'M8 2a.75.75 0 01.75.75v3.5h3.5a.75.75 0 010 1.5h-3.5v3.5a.75.75 0 01-1.5 0v-3.5h-3.5a.75.75 0 010-1.5h3.5v-3.5A.75.75 0 018 2z',
  keuangan: 'M8 1a7 7 0 100 14A7 7 0 008 1zM7 4.5a.5.5 0 011 0v.57c.86.18 1.5.92 1.5 1.93 0 1.22-.9 1.87-1.75 2.13l-.25.08c-.7.22-1 .47-1 .79 0 .28.24.5.5.5h1a.5.5 0 01.5.5v.5a.5.5 0 01-1 0v-.05A2 2 0 016 9c0-1.2.88-1.84 1.73-2.1l.25-.08c.72-.22 1.02-.48 1.02-.82C9 5.72 8.55 5.5 8 5.5a1 1 0 00-1 1 .5.5 0 01-1 0A2 2 0 017 5.07V4.5zm1 7a.75.75 0 110 1.5.75.75 0 010-1.5z',
  lainnya: 'M8 2a6 6 0 100 12A6 6 0 008 2zm-.75 3a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0V5zm.75 6a.75.75 0 110 1.5.75.75 0 010-1.5z'
}

export const CATEGORY_ICON = {
  meeting: '📅',
  tugas: '📝',
  belanja: '🛒',
  kesehatan: '💊',
  keuangan: '💰',
  lainnya: '📌'
}

export const CATEGORY_LABEL = {
  meeting: 'Meeting',
  tugas: 'Tugas',
  belanja: 'Belanja',
  kesehatan: 'Kesehatan',
  keuangan: 'Keuangan',
  lainnya: 'Lainnya'
}
