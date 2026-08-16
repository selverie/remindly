import { useState } from 'react'
import { formatDate, formatTime, isOverdue, CATEGORY_ICON_PATH, PRIORITY_LABEL } from '../lib/dateUtils'
import { toggleTask, deleteTask, updateTask } from '../lib/db'
import { scheduleTaskReminder, cancelTaskReminder } from '../lib/notifications'

const PRIORITY_DOT = {
  high: 'bg-red-400',
  medium: 'bg-amber-400',
  low: 'bg-emerald-400'
}

export default function TaskCard({ task, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [editDate, setEditDate] = useState(task.due_date || '')
  const [editTime, setEditTime] = useState(task.due_time || '')
  const [editPriority, setEditPriority] = useState(task.priority)
  const [editCategory, setEditCategory] = useState(task.category)
  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const overdue = isOverdue(task.due_date, task.due_time) && !task.completed

  async function handleToggle() {
    await toggleTask(task.id, !task.completed)
    if (!task.completed) cancelTaskReminder(task.id)
    onUpdate()
  }

  async function handleDelete() {
    cancelTaskReminder(task.id)
    await deleteTask(task.id)
    onUpdate()
  }

  async function handleSaveEdit() {
    const changes = {
      title: editTitle.trim() || task.title,
      due_date: editDate || null,
      due_time: editTime || null,
      priority: editPriority,
      category: editCategory
    }
    await updateTask(task.id, changes)
    scheduleTaskReminder({ ...task, ...changes })
    setEditing(false)
    onUpdate()
  }

  if (editing) {
    return (
      <div className="border border-border rounded-xl p-4 bg-surface">
        <input
          className="w-full text-sm font-medium text-ink bg-transparent border-b border-border pb-2 mb-3 outline-none focus:border-ink-soft transition-colors placeholder:text-ink-muted"
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          autoFocus
          placeholder="Judul tugas"
        />
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className="text-2xs text-ink-muted block mb-1">Tanggal</label>
            <input type="date" className="w-full text-xs text-ink bg-surface-soft border border-border rounded-lg px-2 py-1.5 outline-none" value={editDate} onChange={e => setEditDate(e.target.value)} />
          </div>
          <div>
            <label className="text-2xs text-ink-muted block mb-1">Waktu</label>
            <input type="time" className="w-full text-xs text-ink bg-surface-soft border border-border rounded-lg px-2 py-1.5 outline-none" value={editTime} onChange={e => setEditTime(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div>
            <label className="text-2xs text-ink-muted block mb-1">Prioritas</label>
            <select className="w-full text-xs border border-border rounded-lg px-2 py-1.5 outline-none" value={editPriority} onChange={e => setEditPriority(e.target.value)}>
              <option value="high">Tinggi</option>
              <option value="medium">Sedang</option>
              <option value="low">Rendah</option>
            </select>
          </div>
          <div>
            <label className="text-2xs text-ink-muted block mb-1">Kategori</label>
            <select className="w-full text-xs border border-border rounded-lg px-2 py-1.5 outline-none" value={editCategory} onChange={e => setEditCategory(e.target.value)}>
              <option value="meeting">Meeting</option>
              <option value="tugas">Tugas</option>
              <option value="belanja">Belanja</option>
              <option value="kesehatan">Kesehatan</option>
              <option value="keuangan">Keuangan</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSaveEdit} className="flex-1 text-xs text-[#161616] bg-[#e3e2dc] rounded-lg px-3 py-2 font-semibold">Simpan</button>
          <button onClick={() => setEditing(false)} className="flex-1 text-xs text-ink-soft border border-border rounded-lg px-3 py-2">Batal</button>
        </div>
      </div>
    )
  }

  return (
    <>
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center pb-28 px-4">
          <div className="fixed inset-0" style={{background:"#161616"}} onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative w-full max-w-sm bg-[#1e1e1e] rounded-2xl overflow-hidden shadow-2xl border border-[#2e2e2e]">
            <div className="px-5 pt-5 pb-4 text-center">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4h6v2" />
                </svg>
              </div>
              <p className="text-[15px] font-semibold text-[#e3e2dc] mb-1">Hapus tugas?</p>
              <p className="text-[13px] text-[#777] leading-snug">
                "<span className="text-[#aaa]">{task.title}</span>" akan dihapus permanen.
              </p>
            </div>
            <div className="flex border-t border-[#2a2a2a]">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3.5 text-[14px] text-[#777] font-medium border-r border-[#2a2a2a] active:bg-[#252525] transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => { setShowDeleteConfirm(false); handleDelete() }}
                className="flex-1 py-3.5 text-[14px] text-red-400 font-semibold active:bg-[#252525] transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`group border rounded-xl px-4 py-3.5 transition-all ${
        task.completed
          ? 'border-border-soft bg-surface-muted opacity-60'
          : 'border-border bg-surface hover:border-[#3a3a3a]'
      }`}>
        <div className="flex items-start gap-3">
          <button
            onClick={handleToggle}
            className={`mt-0.5 w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center transition-all ${
              task.completed
                ? 'bg-[#e3e2dc] border-[#e3e2dc]'
                : 'border-[#3a3a3a] hover:border-ink-soft'
            }`}
          >
            {task.completed && (
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path d="M1 4l2 2 4-4" stroke="#161616" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>

          <div className="flex-1 min-w-0">
            <p className={`text-sm leading-snug font-medium ${task.completed ? 'line-through text-ink-muted' : 'text-ink'}`}>
              {task.title}
            </p>
            <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
              <span className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[task.priority]}`} />
                <span className="text-2xs text-ink-muted">{PRIORITY_LABEL[task.priority]}</span>
              </span>
              <span className="flex items-center gap-1 text-2xs text-ink-muted">
                <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor" className="opacity-60 flex-shrink-0">
                  <path d={CATEGORY_ICON_PATH[task.category] || CATEGORY_ICON_PATH.lainnya} />
                </svg>
                {task.category}
              </span>
              {task.due_date && (
                <span className={`text-2xs ${overdue ? 'text-red-400' : 'text-ink-muted'}`}>
                  {formatDate(task.due_date)}
                  {task.due_time && ` · ${formatTime(task.due_time)}`}
                  {overdue && ' · Terlambat'}
                </span>
              )}
            </div>
          </div>

          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowMenu(v => !v)}
              className="text-ink-muted hover:text-ink p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-6 bg-[#252525] border border-[#333] rounded-xl shadow-xl z-20 min-w-[120px] py-1 overflow-hidden">
                  <button
                    onClick={() => { setShowMenu(false); setEditing(true) }}
                    className="w-full text-left px-4 py-2.5 text-xs text-ink hover:bg-[#2e2e2e] transition-colors font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => { setShowMenu(false); setShowDeleteConfirm(true) }}
                    className="w-full text-left px-4 py-2.5 text-xs text-red-400 hover:bg-[#2e2e2e] transition-colors font-medium"
                  >
                    Hapus
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
