export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('[Remindly] Notification API tidak didukung browser ini')
    return 'unsupported'
  }
  console.log('[Remindly] Permission saat ini:', Notification.permission)
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') {
    console.warn('[Remindly] Notifikasi diblokir user. Buka Settings browser untuk mengizinkan.')
    return 'denied'
  }
  const result = await Notification.requestPermission()
  console.log('[Remindly] Hasil request permission:', result)
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
  } catch (err) {
    console.error('[Remindly] Gagal register SW:', err)
    return null
  }
}

function fireNotification(task) {
  console.log('[Remindly] 🔔 Menampilkan notifikasi untuk:', task.title)
  try {
    const n = new Notification('⏰ Remindly', {
      body: `${task.title} • ${task.due_time}`,
      icon: '/logo.png',
      tag: `task-${task.id}`,
      requireInteraction: true,
    })
    n.onclick = () => { window.focus(); n.close() }
    console.log('[Remindly] ✅ Notifikasi berhasil ditampilkan')
  } catch (err) {
    console.error('[Remindly] ❌ Gagal tampilkan notifikasi:', err)
  }
}

const scheduledTimers = new Map()

export async function scheduleTaskReminder(task) {
  console.log(`[Remindly] scheduleTaskReminder → "${task.title}"`, {
    due_date: task.due_date,
    due_time: task.due_time,
    reminder_before_minutes: task.reminder_before_minutes,
    permission: Notification.permission,
  })

  if (!task.due_date || !task.due_time) {
    console.log(`[Remindly] Skip "${task.title}": tidak ada due_date/due_time`)
    return
  }
  if (!task.reminder_before_minutes) {
    console.log(`[Remindly] Skip "${task.title}": reminder_before_minutes = 0 / null`)
    return
  }
  if (Notification.permission !== 'granted') {
    console.warn(`[Remindly] Skip "${task.title}": permission = ${Notification.permission}`)
    return
  }

  const dueDateTime = new Date(`${task.due_date}T${task.due_time}:00`)
  const reminderTime = new Date(dueDateTime.getTime() - task.reminder_before_minutes * 60 * 1000)
  const now = new Date()
  const delay = reminderTime.getTime() - now.getTime()

  console.log(`[Remindly] "${task.title}" →`, {
    dueDateTime: dueDateTime.toLocaleString('id-ID'),
    reminderTime: reminderTime.toLocaleString('id-ID'),
    now: now.toLocaleString('id-ID'),
    delayMs: delay,
    delaySec: Math.round(delay / 1000),
  })

  // Jika reminder sudah lewat tapi due time belum lewat → tampilkan sekarang
  if (delay <= 0 && now < dueDateTime) {
    console.log(`[Remindly] Reminder sudah lewat tapi task belum lewat → tampilkan sekarang`)
    fireNotification(task)
    return
  }

  // Jika due time sudah lewat
  if (delay <= 0 && now >= dueDateTime) {
    console.log(`[Remindly] Skip "${task.title}": task sudah terlambat (due time sudah lewat)`)
    return
  }

  // Schedule untuk masa depan
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
    if (Notification.permission === 'granted') {
      fireNotification(task)
    }
    scheduledTimers.delete(task.id)
  }, delay)
  scheduledTimers.set(task.id, timer)
  console.log(`[Remindly] ✅ "${task.title}" dijadwalkan dalam ${Math.round(delay / 1000)}s (${Math.round(delay / 60000)} menit)`)
}

export async function cancelTaskReminder(taskId) {
  const sw = await getSWNotif()
  if (sw) sw.postMessage({ type: 'CANCEL_REMINDER', payload: { taskId } })
  if (scheduledTimers.has(taskId)) {
    clearTimeout(scheduledTimers.get(taskId))
    scheduledTimers.delete(taskId)
    console.log(`[Remindly] Reminder task ${taskId} dibatalkan`)
  }
}

export async function scheduleAllReminders(tasks) {
  console.log(`[Remindly] scheduleAllReminders → ${tasks.length} task(s)`)
  await registerSWNotif()
  for (const task of tasks) {
    if (!task.completed) await scheduleTaskReminder(task)
  }
}
