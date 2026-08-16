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

async function checkReminders() {
  const now = Date.now()
  const reminders = await getAllReminders()

  for (const reminder of reminders) {
    if (reminder.fireAt <= now) {
      await self.registration.showNotification('⏰ Remindly', {
        body: `${reminder.title} • ${reminder.due_time}`,
        icon: '/logo.png',
        badge: '/logo.png',
        tag: `task-${reminder.taskId}`,
        requireInteraction: true,
        data: { taskId: reminder.taskId }
      })
      await deleteReminder(reminder.taskId)
    }
  }
}

self.addEventListener('message', async event => {
  const { type, payload } = event.data || {}

  if (type === 'SCHEDULE_REMINDER') {
    const { taskId, title, due_date, due_time, reminder_before_minutes } = payload
    if (!due_date || !due_time || !reminder_before_minutes) return

    const dueDateTime = new Date(`${due_date}T${due_time}:00`).getTime()
    const fireAt = dueDateTime - reminder_before_minutes * 60 * 1000

    if (fireAt <= Date.now()) return

    await saveReminder({ taskId, title, due_date, due_time, fireAt })
  }

  if (type === 'CANCEL_REMINDER') {
    await deleteReminder(payload.taskId)
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

self.addEventListener('activate', event => {
  event.waitUntil(checkReminders())
})

self.addEventListener('fetch', () => {
})
