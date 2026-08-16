import Dexie from 'dexie'

export const db = new Dexie('RemindlyDB')

db.version(1).stores({
  tasks: '++id, due_date, due_time, priority, category, completed, created_at',
})

export async function getTasksByDate(dateStr) {
  return db.tasks.where('due_date').equals(dateStr).toArray()
}

export async function getTodayTasks() {
  const today = new Date().toISOString().split('T')[0]
  return db.tasks.where('due_date').equals(today).sortBy('due_time')
}

export async function getUpcomingTasks() {
  const today = new Date().toISOString().split('T')[0]
  const all = await db.tasks.where('due_date').above(today).sortBy('due_date')
  return all
}

export async function getInboxTasks() {
  return db.tasks.filter(t => !t.due_date).toArray()
}

export async function addTask(task) {
  return db.tasks.add({
    ...task,
    completed: false,
    created_at: new Date().toISOString()
  })
}

export async function updateTask(id, changes) {
  return db.tasks.update(id, changes)
}

export async function deleteTask(id) {
  return db.tasks.delete(id)
}

export async function toggleTask(id, completed) {
  return db.tasks.update(id, { completed })
}
