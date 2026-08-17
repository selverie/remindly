export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  const result = await Notification.requestPermission()
  return result
}

async function getSWNotif() {
  if (!('serviceWorker' in navigator)) return null
  try {
    const reg = await navigator.serviceWorker.getRegistration('/sw-notifications.js')
    return reg?.active || null
  } catch {
    return null
  }
}

async function registerSWNotif() {
  if (!('serviceWorker' in navigator)) return null
  try {
    const reg = await navigator.serviceWorker.register('/sw-notifications.js', { scope: '/' })
    if ('periodicSync' in reg) {
      try {
        await reg.periodicSync.register('check-reminders', { minInterval: 60 * 1000 })
      } catch (_) {}
    }
    return reg.active || reg.installing || reg.waiting
  } catch {
    return null
  }
}

function fireNotification(task) {
  try {
    const n = new Notification('Remindly', {
      body: `${task.title} • ${task.due_time}`,
      icon: '/logo.png',
      badge: '/icons/icon-192.png',
      tag: `task-${task.id}`,
      requireInteraction: true,
    })
    n.onclick = () => { window.focus(); n.close() }
  } catch (_) {}
}

const scheduledTimers = new Map()

function broadcastLog(msg) {
  navigator.serviceWorker?.controller?.postMessage({ type: 'SW_LOG', msg })
  // fallback: kirim langsung ke semua client via custom event
  window.dispatchEvent(new CustomEvent('app_log', { detail: msg }))
}

export async function scheduleTaskReminder(task) {
  broadcastLog(`[Notif] scheduleTaskReminder: id=${task.id}, due_time=${task.due_time}, reminder_before_minutes=${task.reminder_before_minutes}, permission=${Notification.permission}`)
  if (!task.due_date || !task.due_time || !task.reminder_before_minutes) {
    broadcastLog(`[Notif] return early: missing due_date/due_time/reminder_before_minutes`)
    return
  }
  if (Notification.permission !== 'granted') {
    broadcastLog(`[Notif] return early: permission=${Notification.permission}`)
    return
  }

  const dueDateTime = new Date(`${task.due_date}T${task.due_time}:00`)
  const reminderTime = new Date(dueDateTime.getTime() - task.reminder_before_minutes * 60 * 1000)
  const now = new Date()
  const delay = reminderTime.getTime() - now.getTime()

  // Reminder sudah lewat tapi due time belum lewat → tampilkan sekarang
  if (delay <= 0 && now < dueDateTime) {
    fireNotification(task)
    return
  }

  if (delay <= 0) return

  let sw = await getSWNotif()
  if (!sw) sw = await registerSWNotif()
  if (sw) {
    sw.postMessage({
      type: 'SCHEDULE_REMINDER',
      payload: {
        taskId: task.id,
        title: task.title,
        due_date: task.due_date,
        due_time: task.due_time,
        reminder_before_minutes: task.reminder_before_minutes,
      }
    })
  }

  if (scheduledTimers.has(task.id)) clearTimeout(scheduledTimers.get(task.id))
  const timer = setTimeout(() => {
    if (Notification.permission === 'granted') fireNotification(task)
    scheduledTimers.delete(task.id)
  }, delay)
  scheduledTimers.set(task.id, timer)
}

export async function cancelTaskReminder(taskId) {
  const sw = await getSWNotif()
  if (sw) sw.postMessage({ type: 'CANCEL_REMINDER', payload: { taskId } })
  if (scheduledTimers.has(taskId)) {
    clearTimeout(scheduledTimers.get(taskId))
    scheduledTimers.delete(taskId)
  }
}

export async function scheduleAllReminders(tasks) {
  const sw = await registerSWNotif()
  // Cek reminder yang mungkin terlewat saat app ditutup
  if (sw) sw.postMessage({ type: 'CHECK_NOW' })
  tasks.forEach(task => {
    if (!task.completed) scheduleTaskReminder(task)
  })
}
