import { useState, useRef, useEffect, useCallback } from 'react'
import { parseTaskInput } from '../lib/parser'
import { addTask } from '../lib/db'
import { scheduleTaskReminder } from '../lib/notifications'
import { useLang } from '../lib/LangContext'

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
const hasSpeech = !!SpeechRecognition
const SILENCE_MS = 10000

function VoiceWave({ transcript }) {
  const hasText = transcript.length > 0
  return (
    <div className="flex items-center justify-center gap-[3px] h-10">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="voice-bar rounded-full"
          style={{
            width: '3px',
            height: '32px',
            background: hasText
              ? `rgba(248,113,113,${0.5 + (i % 3) * 0.2})`
              : `rgba(248,113,113,${0.25 + (i % 3) * 0.15})`,
            animationDuration: hasText ? `${0.4 + (i % 4) * 0.1}s` : '0.9s',
          }}
        />
      ))}
    </div>
  )
}

export default function InputBar({ onTaskAdded }) {
  const { t, lang } = useLang()
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [preview, setPreview] = useState(null)
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [silenceLeft, setSilenceLeft] = useState(SILENCE_MS / 1000)

  const inputRef = useRef(null)
  const recognitionRef = useRef(null)
  const silenceTimerRef = useRef(null)
  const silenceCountRef = useRef(null)
  const isListeningRef = useRef(false)

  useEffect(() => { isListeningRef.current = listening }, [listening])

  const stopAll = useCallback((fromRecognition = false) => {
    clearTimeout(silenceTimerRef.current)
    clearInterval(silenceCountRef.current)
    isListeningRef.current = false
    if (!fromRecognition) recognitionRef.current?.stop()
    setListening(false)
    setTranscript('')
    setSilenceLeft(SILENCE_MS / 1000)
  }, [])

  const resetSilenceTimer = useCallback(() => {
    clearTimeout(silenceTimerRef.current)
    clearInterval(silenceCountRef.current)

    let remaining = SILENCE_MS / 1000
    setSilenceLeft(remaining)

    silenceCountRef.current = setInterval(() => {
      remaining -= 1
      setSilenceLeft(remaining)
    }, 1000)

    silenceTimerRef.current = setTimeout(() => {
      clearInterval(silenceCountRef.current)
      stopAll(false)
    }, SILENCE_MS)
  }, [stopAll])

  useEffect(() => {
    if (!hasSpeech) return

    const recognition = new SpeechRecognition()
    recognition.lang = lang === 'en' ? 'en-US' : 'id-ID'
    recognition.interimResults = true
    recognition.continuous = true
    recognition.maxAlternatives = 1

    recognition.onresult = (e) => {
      resetSilenceTimer()
      let interim = ''
      let final = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const txt = e.results[i][0].transcript
        if (e.results[i].isFinal) final += txt
        else interim += txt
      }
      setTranscript(interim)
      if (final) {
        setText(prev => (prev ? prev + ' ' + final : final).trim())
        setTranscript('')
      }
    }

    recognition.onend = () => {
      if (isListeningRef.current) stopAll(true)
    }

    recognition.onerror = (e) => {
      if (e.error === 'no-speech') return
      if (e.error !== 'aborted') {
        setError((lang === 'en' ? 'Microphone error: ' : 'Mikrofon error: ') + e.error)
      }
      stopAll(true)
    }

    recognitionRef.current = recognition
    return () => {
      recognition.abort()
      clearTimeout(silenceTimerRef.current)
      clearInterval(silenceCountRef.current)
    }
  }, [lang, resetSilenceTimer, stopAll])

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return
    if (isListeningRef.current) {
      stopAll(false)
    } else {
      setError(null)
      setPreview(null)
      setListening(true)
      isListeningRef.current = true
      recognitionRef.current.start()
      resetSilenceTimer()
    }
  }, [stopAll, resetSilenceTimer])

  async function handleSubmit() {
    if (!text.trim()) return
    stopAll(false)
    setError(null)
    setLoading(true)
    setPreview(null)
    try {
      const parsed = await parseTaskInput(text.trim())
      setPreview(parsed)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirm() {
    if (!preview) return
    const id = await addTask(preview)
    scheduleTaskReminder({ ...preview, id })
    setPreview(null)
    setText('')
    onTaskAdded()
    inputRef.current?.focus()
  }

  async function handleQuickAdd() {
    if (!text.trim()) return
    const parsed = await parseTaskInput(text.trim())
    await addTask(parsed)
    scheduleTaskReminder({ ...parsed })
    setText('')
    onTaskAdded()
    inputRef.current?.focus()
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (preview) handleConfirm()
      else handleSubmit()
    }
    if (e.key === 'Escape') {
      setPreview(null)
      setError(null)
      stopAll(false)
    }
  }

  return (
    <>
      {listening && (
        <div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{ background: '#161616' }}
        >
          <div className="relative flex items-center justify-center mb-8" style={{ width: 112, height: 112 }}>
            <div className="absolute inset-0 rounded-full border border-red-400/20 ripple-ring pointer-events-none" />
            <div className="absolute inset-0 rounded-full border border-red-400/15 ripple-ring-2 pointer-events-none" />
            <div className="absolute inset-0 rounded-full border border-red-400/10 ripple-ring-3 pointer-events-none" />

            <button
              onClick={() => stopAll(false)}
              className="relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-transform active:scale-95"
              style={{ background: 'rgba(239,68,68,0.12)', border: '1.5px solid rgba(239,68,68,0.4)' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="rgba(239,68,68,0.9)">
                <rect x="5" y="5" width="14" height="14" rx="3" />
              </svg>
            </button>
          </div>

          <VoiceWave transcript={transcript} />

          <div className="mt-5 px-8 text-center min-h-[48px]">
            {transcript ? (
              <p className="text-base text-red-300/80 font-light leading-relaxed">{transcript}</p>
            ) : text ? (
              <p className="text-base text-white/60 font-light leading-relaxed">{text}</p>
            ) : (
              <p className="text-sm text-white/30 font-light">
                {lang === 'en' ? 'Listening…' : 'Mendengarkan…'}
              </p>
            )}
          </div>

          <p className="mt-6 text-xs text-white/20 tracking-wide">
            {lang === 'en'
              ? `auto-close in ${silenceLeft}s · tap ■ to stop`
              : `tutup otomatis ${silenceLeft}d · ketuk ■ untuk berhenti`}
          </p>
        </div>
      )}

      <div className="sticky top-0 z-40 bg-surface border-b border-border">
        <div className="px-4 pt-4 pb-3">
          <div className={`flex items-center gap-2 border rounded-xl px-3 py-2.5 transition-all ${
            loading ? 'border-ink-muted' : 'border-border hover:border-ink-muted focus-within:border-ink'
          }`}>

            <span className="text-ink-muted flex-shrink-0">
              {loading ? (
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />
                </svg>
              )}
            </span>

            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={text}
                onChange={e => { setText(e.target.value); setPreview(null); setError(null) }}
                onKeyDown={handleKeyDown}
                placeholder={t.inputPlaceholder}
                className="w-full text-sm font-light bg-transparent outline-none text-ink placeholder:text-ink-muted"
                disabled={loading}
              />
            </div>

            {text && !loading && (
              <button
                onClick={() => { setText(''); setPreview(null); setError(null); inputRef.current?.focus() }}
                className="flex-shrink-0 text-ink-muted hover:text-red-400 rounded-lg p-1 transition-colors"
                title="Clear"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M15 9l-6 6M9 9l6 6" />
                </svg>
              </button>
            )}

            {hasSpeech && !loading && (
              <button
                onClick={toggleListening}
                className="flex-shrink-0 text-ink-muted hover:text-ink rounded-lg p-1 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <line x1="2"  y1="12" x2="2"  y2="12" strokeWidth="2" />
                  <line x1="6"  y1="9"  x2="6"  y2="15" />
                  <line x1="10" y1="6"  x2="10" y2="18" />
                  <line x1="14" y1="4"  x2="14" y2="20" />
                  <line x1="18" y1="7"  x2="18" y2="17" />
                  <line x1="22" y1="10" x2="22" y2="14" />
                </svg>
              </button>
            )}

            {text.trim() && !loading && (
              <button
                onClick={handleSubmit}
                className="flex-shrink-0 text-xs text-ink-soft hover:text-ink transition-colors font-light px-1"
              >
                Parse
              </button>
            )}
          </div>

          {!text && !preview && (
            <p className="text-2xs text-ink-muted mt-2 px-1">
              {hasSpeech ? t.inputHintWithSpeech : t.inputHintNoSpeech}
            </p>
          )}

          {error && (
            <div className="mt-2 px-1 flex items-start gap-2">
              <span className="text-2xs text-red-500 flex-1">{error}</span>
              <button onClick={handleQuickAdd} className="text-2xs text-ink-soft underline whitespace-nowrap">
                {t.inputQuickAdd}
              </button>
            </div>
          )}

          {preview && (
            <div className="mt-3 border border-border rounded-lg p-3 bg-surface-soft">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm font-light text-ink leading-snug">{preview.title}</p>
                <button onClick={() => setPreview(null)} className="text-ink-muted hover:text-ink flex-shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {preview.due_date && (
                  <span className="flex items-center gap-1 text-2xs border border-border rounded px-2 py-0.5 text-ink-soft">
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" className="opacity-60">
                      <path d="M3.5 0a.5.5 0 01.5.5V1h8V.5a.5.5 0 011 0V1h.5A1.5 1.5 0 0115 2.5v11A1.5 1.5 0 0113.5 15h-11A1.5 1.5 0 011 13.5v-11A1.5 1.5 0 012.5 1H3V.5a.5.5 0 01.5-.5zM2 4v9.5a.5.5 0 00.5.5h11a.5.5 0 00.5-.5V4H2zm2 2h1v1H4V6zm3 0h1v1H7V6zm3 0h1v1h-1V6zM4 9h1v1H4V9zm3 0h1v1H7V9zm3 0h1v1h-1V9z"/>
                    </svg>
                    {preview.due_date}{preview.due_time ? ` · ${preview.due_time}` : ''}
                  </span>
                )}
                <span className="flex items-center gap-1 text-2xs border border-border rounded px-2 py-0.5 text-ink-soft">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    preview.priority === 'high' ? 'bg-red-400' : preview.priority === 'low' ? 'bg-emerald-400' : 'bg-amber-400'
                  }`} />
                  {preview.priority}
                </span>
                <span className="flex items-center gap-1 text-2xs border border-border rounded px-2 py-0.5 text-ink-soft">
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" className="opacity-60">
                    <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 3.5a.75.75 0 011.5 0v.57c.86.18 1.5.92 1.5 1.93 0 1.22-.9 1.87-1.75 2.13l-.25.08c-.7.22-1 .47-1 .79 0 .28.24.5.5.5h1a.5.5 0 010 1h-.5v.05a.5.5 0 01-1 0v-.05A2 2 0 016 9c0-1.2.88-1.84 1.73-2.1l.25-.08C8.7 6.6 9 6.34 9 6c0-.28-.45-.5-1-.5a1 1 0 00-1 1 .5.5 0 01-1 0A2 2 0 017.25 4.5zm.75 7a.75.75 0 110 1.5.75.75 0 010-1.5z"/>
                  </svg>
                  {preview.category}
                </span>
              </div>
              <button
                onClick={handleConfirm}
                className="w-full text-xs bg-ink text-surface rounded-lg py-2 hover:opacity-80 transition-opacity font-light"
              >
                {t.inputSaveTask}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
