import { createContext, useContext, useState, useEffect } from 'react'
import { translations } from './i18n'

const LangContext = createContext()

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('remindly_lang') || 'id')

  useEffect(() => {
    localStorage.setItem('remindly_lang', lang)
  }, [lang])

  const t = translations[lang]

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
