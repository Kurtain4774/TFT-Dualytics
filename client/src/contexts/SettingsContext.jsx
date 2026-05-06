import { useEffect, useState } from 'react'
import i18n from '../i18n/index.js'
import { SettingsContext } from './settingsContext.js'

export function SettingsProvider({ children }) {
  const [theme, setThemeState] = useState(
    () => localStorage.getItem('theme') || 'dark'
  )
  const [language, setLanguageState] = useState(
    () => localStorage.getItem('language') || 'en'
  )

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    i18n.changeLanguage(language)
    localStorage.setItem('language', language)
  }, [language])

  // Apply theme immediately on mount (before first paint)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SettingsContext.Provider value={{ theme, setTheme: setThemeState, language, setLanguage: setLanguageState }}>
      {children}
    </SettingsContext.Provider>
  )
}
