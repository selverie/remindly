const CATEGORY_RULES = [
  { keywords: ['meeting', 'rapat', 'diskusi', 'presentasi', 'zoom', 'call', 'interview', 'wawancara'], category: 'meeting' },
  { keywords: ['beli', 'belanja', 'pasar', 'supermarket', 'toko', 'order', 'pesan', 'buy', 'shop', 'grocery'], category: 'belanja' },
  { keywords: ['dokter', 'rumah sakit', 'rs', 'puskesmas', 'obat', 'minum obat', 'olahraga', 'gym', 'lari', 'jogging', 'medical', 'periksa', 'doctor', 'hospital', 'medicine', 'exercise', 'workout', 'run'], category: 'kesehatan' },
  { keywords: ['bayar', 'transfer', 'tagihan', 'listrik', 'air', 'pajak', 'kredit', 'cicilan', 'bank', 'atm', 'uang', 'pay', 'payment', 'bill', 'invoice', 'tax'], category: 'keuangan' },
  { keywords: ['tugas', 'pr', 'laporan', 'kerjakan', 'selesaikan', 'submit', 'deadline', 'ujian', 'kuliah', 'sekolah', 'belajar', 'baca', 'report', 'assignment', 'study', 'exam', 'read', 'review'], category: 'tugas' },
]

function detectCategory(text) {
  const lower = text.toLowerCase()
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some(kw => lower.includes(kw))) return rule.category
  }
  return 'lainnya'
}

function detectPriority(text) {
  const lower = text.toLowerCase()
  if (/penting|urgent|segera|deadline|mendesak|important|asap|critical/.test(lower)) return 'high'
  if (/santai|kalau sempat|tidak buru.buru|ga buru.buru|low priority|whenever|no rush/.test(lower)) return 'low'
  return 'medium'
}

function detectTime(text) {
  const lower = text.toLowerCase()
  const norm = lower.replace(/p\s*\.\s*m\s*\.?/g, 'pm').replace(/a\s*\.\s*m\s*\.?/g, 'am')
  const jamMatch = norm.match(/jam\s*(\d{1,2})(?:[.:h](\d{2}))?\s*(sore|malem|malam|pagi|siang)?/)
  if (jamMatch) {
    let hour = parseInt(jamMatch[1])
    const minute = parseInt(jamMatch[2] || '0')
    const period = jamMatch[3]
    if (period === 'sore' && hour < 12) hour += 12
    else if ((period === 'malam' || period === 'malem') && hour < 12) hour += 12
    else if (period === 'pagi' && hour === 12) hour = 0
    else if (!period && hour < 7) hour += 12
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
  }

  const ampmMatch = norm.match(/(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)/)
  if (ampmMatch) {
    let hour = parseInt(ampmMatch[1])
    const minute = parseInt(ampmMatch[2] || '0')
    const period = ampmMatch[3]
    if (period === 'pm' && hour !== 12) hour += 12
    else if (period === 'am' && hour === 12) hour = 0
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
  }

  const at24Match = norm.match(/(?:at|pukul)\s*(\d{1,2})[.:h](\d{2})/)
  if (at24Match) {
    const hour = parseInt(at24Match[1])
    const minute = parseInt(at24Match[2])
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
  }

  if (/nanti sore|sore ini/.test(norm)) return '17:00'
  if (/nanti malam|malam ini|nanti malem|malem ini/.test(norm)) return '20:00'
  if (/\bpagi\b/.test(norm)) return '08:00'
  if (/\bsiang\b/.test(norm)) return '12:00'
  if (/\bsore\b/.test(norm)) return '17:00'
  if (/\bmalam\b|\bmalem\b/.test(norm)) return '20:00'

  if (/\bmorning\b/.test(norm)) return '08:00'
  if (/\bnoon\b|\blunch\b/.test(norm)) return '12:00'
  if (/\bafternoon\b/.test(norm)) return '15:00'
  if (/\bevening\b/.test(norm)) return '18:00'
  if (/\bnight\b|\bmidnight\b/.test(norm)) return '20:00'

  return null
}

function toYMD(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function detectDate(text) {
  const lower = text.toLowerCase()
  const now = new Date()

  if (/\blusa\b/.test(lower)) { const d = new Date(now); d.setDate(d.getDate() + 2); return toYMD(d) }
  if (/\bbesok\b/.test(lower)) { const d = new Date(now); d.setDate(d.getDate() + 1); return toYMD(d) }
  if (/\bhari ini\b/.test(lower)) return toYMD(now)
  if (/minggu depan/.test(lower)) {
    const d = new Date(now)
    d.setDate(d.getDate() + (8 - d.getDay()) % 7 || 7)
    return toYMD(d)
  }
  if (/akhir bulan/.test(lower)) return toYMD(new Date(now.getFullYear(), now.getMonth() + 1, 0))

  if (/\btoday\b/.test(lower)) return toYMD(now)
  if (/\btomorrow\b/.test(lower)) { const d = new Date(now); d.setDate(d.getDate() + 1); return toYMD(d) }
  if (/\bday after tomorrow\b/.test(lower)) { const d = new Date(now); d.setDate(d.getDate() + 2); return toYMD(d) }
  if (/next week/.test(lower)) {
    const d = new Date(now)
    d.setDate(d.getDate() + (8 - d.getDay()) % 7 || 7)
    return toYMD(d)
  }
  if (/end of (the )?month/.test(lower)) return toYMD(new Date(now.getFullYear(), now.getMonth() + 1, 0))

  const DAYS_EN = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']
  const DAYS_ID = ['minggu','senin','selasa','rabu','kamis','jumat','sabtu']
  for (let i = 0; i < 7; i++) {
    const pat = new RegExp(`\\b(next\\s+)?(${DAYS_EN[i]}|${DAYS_ID[i]})\\b`)
    if (pat.test(lower)) {
      const d = new Date(now)
      let diff = i - d.getDay()
      if (diff <= 0) diff += 7
      d.setDate(d.getDate() + diff)
      return toYMD(d)
    }
  }

  const MONTHS = {
    januari:0,februari:1,maret:2,april:3,mei:4,juni:5,
    juli:6,agustus:7,september:8,oktober:9,november:10,desember:11,
    january:0,february:1,march:2,may:4,june:5,
    july:6,august:7,october:9,december:11
  }
  const monthNames = Object.keys(MONTHS).join('|')
  const explicitMatch = lower.match(new RegExp(`(?:tanggal|tgl|the)?\\s*(\\d{1,2})(?:st|nd|rd|th)?\\s*(${monthNames})?`))
  if (explicitMatch && parseInt(explicitMatch[1]) >= 1 && parseInt(explicitMatch[1]) <= 31) {
    const day = parseInt(explicitMatch[1])
    const monthName = explicitMatch[2]
    const month = monthName ? MONTHS[monthName] : now.getMonth()
    let year = now.getFullYear()
    const d = new Date(year, month, day)
    if (d < now && !monthName) d.setMonth(d.getMonth() + 1)
    return toYMD(d)
  }

  return toYMD(now)
}

function extractTitle(text) {
  let title = text
  title = title.replace(/jam\s*\d{1,2}(?:[.:h]\d{2})?\s*(?:sore|malam|pagi|siang)?/gi, '')
  title = title.replace(/\bat\s+\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?)/gi, '')
  title = title.replace(/\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?)/gi, '')
  title = title.replace(/\b(?:at|pukul)\s*\d{1,2}[.:]\d{2}\b/gi, '')

  const STRIP_WORDS = [
    'nanti','sore','malam','pagi','siang','besok','lusa','hari ini',
    'minggu depan','akhir bulan','jam','penting','urgent','segera',
    'mendesak','santai','kalau sempat','tanggal','tgl',
    'januari','februari','maret','april','mei','juni',
    'juli','agustus','september','oktober','november','desember',
    'senin','selasa','rabu','kamis','jumat','sabtu','minggu',

    'today','tomorrow','tonight','morning','afternoon','evening','night','noon','lunch',
    'next week','end of the month','end of month','day after tomorrow',
    'monday','tuesday','wednesday','thursday','friday','saturday','sunday',
    'january','february','march','may','june','july','august',
    'october','december','important','urgent','asap','at',
  ]

  for (const word of STRIP_WORDS) {
    title = title.replace(new RegExp(`\\b${word}\\b`, 'gi'), '')
  }

  title = title.replace(/\b\d{1,2}(?:st|nd|rd|th)?\b/g, '')

  title = title.replace(/\s+/g, ' ').trim()
  if (title) title = title.charAt(0).toUpperCase() + title.slice(1)
  return title || text.trim()
}

export async function parseTaskInput(text) {
  const due_time = detectTime(text)
  const due_date = detectDate(text)
  const priority = detectPriority(text)
  const category = detectCategory(text)
  const title = extractTitle(text)

  return {
    title,
    due_date,
    due_time,
    priority,
    reminder_before_minutes: due_time ? 10 : null,
    category,
  }
}
