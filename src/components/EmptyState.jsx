export default function EmptyState({ label }) {
  return (
    <div className="py-10 flex flex-col items-center text-center">
      <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center mb-3">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink-muted" strokeLinecap="round">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
      </div>
      <p className="text-sm text-ink-muted font-medium">{label}</p>
    </div>
  )
}
