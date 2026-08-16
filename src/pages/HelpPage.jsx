import { useLang } from '../lib/LangContext'

const IconEdit = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)

const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const IconGrid = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
  </svg>
)

const IconMic = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
    <path d="M19 10v2a7 7 0 01-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
  </svg>
)

const IconCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const IconClock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
)

const IconTag = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
)

const IconMicSmall = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
    <path d="M19 10v2a7 7 0 01-14 0v-2" />
  </svg>
)

const IconWifi = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M16.72 11.06A10.94 10.94 0 0119 12.55" /><path d="M5 12.55a10.94 10.94 0 015.17-2.39" />
    <path d="M10.71 5.05A16 16 0 0122.56 9" /><path d="M1.42 9a15.91 15.91 0 014.7-2.88" />
    <path d="M8.53 16.11a6 6 0 016.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" />
  </svg>
)

export default function HelpPage({ onClose }) {
  const { t, lang } = useLang()

  const steps = [
    {
      title: t.helpStep1Title,
      desc: t.helpStep1Desc,
      Icon: IconEdit,
      num: '01',
    },
    {
      title: t.helpStep2Title,
      desc: t.helpStep2Desc,
      Icon: IconCheck,
      num: '02',
    },
    {
      title: lang === 'en' ? 'Use voice input' : 'Gunakan input suara',
      desc: lang === 'en'
        ? 'Tap the 🎙 mic icon and speak naturally. The app listens and converts speech to text automatically.'
        : 'Ketuk ikon 🎙 mikrofon lalu bicara. Aplikasi mendengarkan dan mengubah suara ke teks secara otomatis.',
      Icon: IconMic,
      num: '03',
    },
    {
      title: t.helpStep3Title,
      desc: t.helpStep3Desc,
      Icon: IconGrid,
      num: '04',
    },
  ]

  const tips = [
    {
      label: lang === 'en' ? 'Date' : 'Tanggal',
      desc: lang === 'en'
        ? 'Use natural words for dates, no need to type the full date.'
        : 'Tulis tanggal dengan kata sehari-hari, tidak perlu format tanggal lengkap.',
      keywords: lang === 'en'
        ? ['tomorrow', 'day after tomorrow', 'next week', 'next Monday', 'Aug 23']
        : ['besok', 'lusa', 'minggu depan', 'Senin depan', '23 Agustus'],
      example: lang === 'en'
        ? '"Buy groceries next Monday"'
        : '"Beli sembako Senin depan"',
      Icon: IconCalendar,
    },
    {
      label: lang === 'en' ? 'Time' : 'Waktu',
      desc: lang === 'en'
        ? 'Add time after the task, works with am/pm or 24-hour format.'
        : 'Tambahkan waktu setelah tugas, bisa pakai format pagi/siang atau angka.',
      keywords: lang === 'en'
        ? ['at 9am', 'at 2pm', 'at 14.00', '3 in the afternoon']
        : ['jam 9 pagi', 'jam 2 siang', 'pukul 14.00', 'jam 3 sore'],
      example: lang === 'en'
        ? '"Team meeting tomorrow at 9am"'
        : '"Meeting tim besok jam 9 pagi"',
      Icon: IconClock,
    },
    {
      label: lang === 'en' ? 'Priority' : 'Prioritas',
      desc: lang === 'en'
        ? 'There are 3 levels: high, medium, and low. Default is medium if no urgency word is added.'
        : 'Ada 3 level: high, medium, dan low. Default medium jika tidak ada kata urgensi.',
      keywords: lang === 'en'
        ? ['high: important / urgent / asap', 'low: no rush / whenever', 'medium: (default)']
        : ['high: penting / urgent / segera', 'low: santai / kalau sempat', 'medium: (default)'],
      example: lang === 'en'
        ? '"Send report to client, urgent"'
        : '"Kirim laporan ke klien, urgent"',
      Icon: IconTag,
    },
  ]

  return (
    <div className="min-h-screen bg-[#161616]">
      <div className="flex items-center gap-3 px-5 pt-12 pb-5">
        <button
          onClick={onClose}
          className="btn-ripple w-9 h-9 rounded-full bg-[#1e1e1e] flex items-center justify-center shadow-sm active:scale-95 transition-transform"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <h2 className="text-[18px] font-bold text-ink">{t.helpPageTitle}</h2>
      </div>

      <div className="px-4 space-y-3 pb-24">
        <div className="bg-surface rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 pt-4 pb-3">
            <p className="text-[10px] font-semibold text-[#555] uppercase tracking-[0.12em]">{t.helpHowToUse}</p>
          </div>
          <div className="px-4 pb-4 space-y-4">
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-[#2a2a2a] flex items-center justify-center text-[#888]">
                  <step.Icon />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[13px] font-semibold text-[#e3e2dc]">{step.title}</p>
                    <span className="text-[10px] text-[#444] font-light">{step.num}</span>
                  </div>
                  <p className="text-[12px] text-[#666] leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 pt-4 pb-3">
            <p className="text-[10px] font-semibold text-[#555] uppercase tracking-[0.12em]">{t.helpTips}</p>
          </div>
          <div className="px-4 pb-4 space-y-4">
            {tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#2a2a2a] flex items-center justify-center text-[#666] flex-shrink-0 mt-0.5">
                  <tip.Icon />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-[#555] uppercase tracking-wider mb-1">{tip.label}</p>
                  <p className="text-[11px] text-[#666] leading-relaxed mb-2">{tip.desc}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {tip.keywords.map((kw, j) => (
                      <span key={j} className="text-[10px] text-[#888] bg-[#222] px-2 py-0.5 rounded-md font-mono">{kw}</span>
                    ))}
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-[9px] font-semibold text-[#444] uppercase tracking-wider mt-0.5 flex-shrink-0">{lang === 'en' ? 'example' : 'contoh'}</span>
                    <p className="text-[11px] text-[#6a9fd8] leading-relaxed italic">{tip.example}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 pt-4 pb-3">
            <p className="text-[10px] font-semibold text-[#555] uppercase tracking-[0.12em]">{t.helpVersion}</p>
          </div>
          <div className="px-4 pb-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#2a2a2a] rounded-xl flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />
                </svg>
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[#e3e2dc]">Remindly</p>
                <p className="text-[11px] text-[#555]">v1.0.0 · PWA</p>
              </div>
              <div className="ml-auto">
                <span className="text-[10px] font-medium text-[#555] bg-[#252525] px-2 py-1 rounded-md">Stable</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#2a2a2a] rounded-xl flex items-center justify-center text-[#666] flex-shrink-0">
                <IconWifi />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[#e3e2dc]">{t.helpOffline}</p>
                <p className="text-[11px] text-[#555]">{t.helpOfflineDesc}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
