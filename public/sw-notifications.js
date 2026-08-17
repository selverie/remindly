const DB_NAME = 'remindly-sw'
const STORE = 'reminders'
const DB_VERSION = 1

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = e => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'taskId' })
      }
    }
    req.onsuccess = e => resolve(e.target.result)
    req.onerror = () => reject(req.error)
  })
}

async function getAllReminders() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).getAll()
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function saveReminder(reminder) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(reminder)
    tx.oncomplete = resolve
    tx.onerror = () => reject(tx.error)
  })
}

async function deleteReminder(taskId) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(taskId)
    tx.oncomplete = resolve
    tx.onerror = () => reject(tx.error)
  })
}

function broadcastLog(msg) {
  self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(clients => {
    clients.forEach(c => c.postMessage({ type: 'SW_LOG', msg }))
  })
}

async function showRemindlyNotification(taskId, title, due_time) {
  broadcastLog(`[SW] showNotification → "${title}" • ${due_time}`)
  try {
    await self.registration.showNotification('Remindly', {
      body: `${title} • ${due_time}`,
      icon: '/logo.png',
      badge: '/icons/icon-192.png',
      tag: `task-${taskId}`,
      requireInteraction: true,
      data: { taskId }
    })
    broadcastLog(`[SW] ✅ showNotification berhasil`)
  } catch (err) {
    broadcastLog(`[SW] ❌ showNotification gagal: ${err.message}`)
  }
}

async function checkReminders() {
  const now = Date.now()
  const reminders = await getAllReminders()
  broadcastLog(`[SW] checkReminders → ${reminders.length} reminder(s), now=${new Date(now).toLocaleTimeString('id-ID')}`)

  for (const reminder of reminders) {
    const dueAt = new Date(`${reminder.due_date}T${reminder.due_time}:00`).getTime()
    broadcastLog(`[SW] cek "${reminder.title}": fireAt=${new Date(reminder.fireAt).toLocaleTimeString('id-ID')}, dueAt=${new Date(dueAt).toLocaleTimeString('id-ID')}`)

    if (reminder.fireAt <= now && now < dueAt) {
      await showRemindlyNotification(reminder.taskId, reminder.title, reminder.due_time)
      await deleteReminder(reminder.taskId)
    } else if (now >= dueAt) {
      broadcastLog(`[SW] buang "${reminder.title}": due time sudah lewat`)
      await deleteReminder(reminder.taskId)
    } else {
      broadcastLog(`[SW] pending "${reminder.title}": belum waktunya (${Math.round((reminder.fireAt - now) / 1000)}s lagi)`)
    }
  }
}

self.addEventListener('message', async event => {
  const { type, payload } = event.data || {}
  broadcastLog(`[SW] message: ${type}`)

  if (type === 'SCHEDULE_REMINDER') {
    const { taskId, title, due_date, due_time, reminder_before_minutes } = payload
    if (!due_date || !due_time || !reminder_before_minutes) return

    const dueDateTime = new Date(`${due_date}T${due_time}:00`).getTime()
    const fireAt = dueDateTime - reminder_before_minutes * 60 * 1000
    const now = Date.now()

    broadcastLog(`[SW] SCHEDULE "${title}": fireAt=${new Date(fireAt).toLocaleTimeString('id-ID')}, delay=${Math.round((fireAt - now) / 1000)}s`)

    if (fireAt <= now && now < dueDateTime) {
      broadcastLog(`[SW] reminder sudah lewat tapi due belum → tampilkan sekarang`)
      await showRemindlyNotification(taskId, title, due_time)
      return
    }

    if (fireAt <= now) {
      broadcastLog(`[SW] skip: due time sudah lewat`)
      return
    }

    try {
      await saveReminder({ taskId, title, due_date, due_time, fireAt })
      broadcastLog(`[SW] ✅ reminder tersimpan`)
    } catch (err) {
      broadcastLog(`[SW] ❌ error: ${err.message}`)
    }
  }

  if (type === 'CANCEL_REMINDER') {
    await deleteReminder(payload.taskId)
  }

  if (type === 'CHECK_NOW') {
    await checkReminders()
  }

  if (type === 'CANCEL_ALL') {
    const db = await openDB()
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).clear()
  }
})

self.addEventListener('periodicsync', event => {
  if (event.tag === 'check-reminders') {
    event.waitUntil(checkReminders())
  }
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      if (list.length > 0) return list[0].focus()
      return clients.openWindow('/')
    })
  )
})

self.addEventListener('install', event => {
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(
    self.clients.claim().then(() => checkReminders())
  )
})

self.addEventListener('fetch', () => {})
